from fastapi import APIRouter, HTTPException, Query, Depends, Header
import yfinance as yf
import numpy as np
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models import UserStock
from backend.auth.auth_handler import get_current_active_user, get_current_user
from backend.models import User
import jwt
from fastapi.security import OAuth2PasswordBearer
from jwt.exceptions import InvalidTokenError

# OAuth2 scheme for token extraction
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/token", auto_error=False)

# Secret key from auth_handler
from backend.auth.auth_handler import SECRET_KEY, ALGORITHM

async def get_optional_current_user(token: Optional[str] = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """
    Similar to get_current_user but doesn't raise an exception if the user is not authenticated.
    Returns None instead.
    """
    if not token:
        return None

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            return None

        user = db.query(User).filter(User.username == username).first()
        return user
    except InvalidTokenError:
        return None

router = APIRouter()

@router.get("/")
def find_stock():
    return {"message": "Use /search endpoint to search for a stock ticker"}

@router.get("/search/{ticker}")
def search_stock(
    ticker: str,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
) -> Dict[str, Any]:
    """
    Search for a stock by ticker symbol and return basic information if it exists.
    Also saves the stock to the user's history.
    """
    try:
        # Get stock info from yfinance
        stock = yf.Ticker(ticker)

        # Check if the stock exists by trying to access its info
        info = stock.info

        if not info or "symbol" not in info:
            raise HTTPException(status_code=404, detail=f"Stock ticker '{ticker}' not found")

        # Initialize financial metrics
        fcf_margin = 0
        roe = 0
        rev_growth = 0
        eps_growth = 0
        pe_ratio = np.nan
        pfcf_ratio = 0
        de_ratio = 0
        interest_coverage = 0
        share_buyback_trend = 0
        gross_margin = 0
        try:
            cashflow = stock.cashflow
            financials = stock.financials
            balance_sheet = stock.balance_sheet
            income_stmt = stock.income_stmt

            if not cashflow.empty and not financials.empty:
                op_cash_flow = cashflow.loc["Operating Cash Flow"].iloc[0]
                capex = cashflow.loc["Capital Expenditure"].iloc[0]
                revenue = financials.loc["Total Revenue"].iloc[0]

                free_cash_flow = op_cash_flow - capex
                fcf_margin = free_cash_flow / revenue

                # Calculate Price to Free Cash Flow
                if "marketCap" in info and free_cash_flow != 0:
                    market_cap = info["marketCap"]
                    pfcf_ratio = market_cap / free_cash_flow

            # Calculate Return on Equity (ROE)
            if not financials.empty and not balance_sheet.empty:
                net_income = financials.loc["Net Income"].iloc[0]
                equity = balance_sheet.loc["Stockholders Equity"].iloc[0]
                roe = net_income / equity

            # Calculate Debt to Equity Ratio
            if not balance_sheet.empty and "Total Liabilities Net Minority Interest" in balance_sheet.index and "Stockholders Equity" in balance_sheet.index:
                total_liabilities = balance_sheet.loc["Total Liabilities Net Minority Interest"].iloc[0]
                equity = balance_sheet.loc["Stockholders Equity"].iloc[0]
                if equity != 0:
                    de_ratio = total_liabilities / equity

            # Calculate Revenue Growth
            if not financials.empty and len(financials.columns) >= 2:
                rev_this_year = financials.loc["Total Revenue"].iloc[0]
                rev_last_year = financials.loc["Total Revenue"].iloc[1]
                rev_growth = (rev_this_year - rev_last_year) / rev_last_year

            # Calculate EPS Growth
            if "trailingEps" in info and not income_stmt.empty and len(income_stmt.columns) >= 2:
                eps_this_year = info["trailingEps"]

                # Try to find EPS in income statement
                if "Basic EPS" in income_stmt.index:
                    eps_last_year = income_stmt.loc["Basic EPS"].iloc[1]  # 2nd most recent year
                elif "Diluted EPS" in income_stmt.index:
                    eps_last_year = income_stmt.loc["Diluted EPS"].iloc[1]  # 2nd most recent year
                elif "Net Income" in income_stmt.index and "weightedAverageShares" in info:
                    # If EPS is not directly available, calculate it
                    net_income_last_year = income_stmt.loc["Net Income"].iloc[1]  # 2nd most recent year
                    shares_outstanding = info["weightedAverageShares"]
                    eps_last_year = net_income_last_year / shares_outstanding

                if eps_last_year != 0:
                    eps_growth = (eps_this_year - eps_last_year) / eps_last_year

            # Calculate P/E Ratio
            if "trailingEps" in info and "currentPrice" in info:
                eps = info["trailingEps"]
                price = info["currentPrice"]

                if eps != 0:
                    pe_ratio = price / eps

            # Calculate Interest Coverage Ratio
            if not financials.empty and "Operating Income" in financials.index:
                operating_income = financials.loc["Operating Income"].iloc[0]

                # Try different fields for interest expense
                interest_expense = None

                # Check for Interest Expense
                if "Interest Expense" in financials.index:
                    interest_expense = financials.loc["Interest Expense"].iloc[0]
                # Check for Interest Expense Non Operating
                elif "Interest Expense Non Operating" in financials.index:
                    interest_expense = financials.loc["Interest Expense Non Operating"].iloc[0]
                # Check for Net Interest Income (negative value would indicate expense)
                elif "Net Interest Income" in financials.index:
                    net_interest = financials.loc["Net Interest Income"].iloc[0]
                    if net_interest < 0:  # If negative, it's an expense
                        interest_expense = -net_interest

                # Calculate Interest Coverage ratio if we have interest expense
                if interest_expense is not None and not np.isnan(interest_expense) and interest_expense != 0:
                    interest_coverage = operating_income / abs(interest_expense)

            # Calculate Share Buyback Trend
            if "sharesOutstanding" in info and "marketCap" in info:
                shares_now = info["sharesOutstanding"]
                market_cap_now = info["marketCap"]

                # Get historical price data
                historical_data = stock.history(period="1y")

                if not historical_data.empty:
                    # Get price from a year ago (first entry)
                    price_year_ago = historical_data["Close"].iloc[0]

                    if price_year_ago > 0:
                        # Estimate shares from a year ago
                        shares_last_year = market_cap_now / price_year_ago

                        if shares_last_year > 0:
                            # Calculate buyback rate
                            share_buyback_trend = (shares_last_year - shares_now) / shares_last_year

            # Calculate Gross Margin
            if not financials.empty and "Gross Profit" in financials.index and "Total Revenue" in financials.index:
                gross_profit = financials.loc["Gross Profit"].iloc[0]
                revenue = financials.loc["Total Revenue"].iloc[0]
                gross_margin = gross_profit / revenue
        except Exception as e:
            # If calculation fails, use default value of 0
            pass

        # Save the stock to the user's history if user is authenticated
        if current_user:
            # Check if the stock already exists for this user
            existing_stock = db.query(UserStock).filter(
                UserStock.user_id == current_user.id,
                UserStock.ticker == ticker
            ).first()

            if not existing_stock:
                # Create a new UserStock
                db_stock = UserStock(
                    user_id=current_user.id,
                    ticker=ticker,
                    name=info.get("shortName", "Unknown")
                )

                # Add it to the database
                db.add(db_stock)
                db.commit()

        # Return basic stock information and financial metrics
        return {
            "exists": True,
            "ticker": ticker,
            "name": info.get("shortName", "Unknown"),
            "price": info.get("currentPrice", 0),
            "currency": info.get("currency", "USD"),
            "marketCap": info.get("marketCap", 0),
            "sector": info.get("sector", "Unknown"),
            "industry": info.get("industry", "Unknown"),
            "website": info.get("website", ""),
            "description": info.get("longBusinessSummary", "No description available"),
            # Financial metrics
            "freeCashFlowMargin": fcf_margin,
            "returnOnEquity": roe,
            "revenueGrowth": rev_growth,
            "epsGrowth": eps_growth,
            "peRatio": pe_ratio,
            "pfcfRatio": pfcf_ratio,
            "debtToEquity": de_ratio,
            "interestCoverage": interest_coverage,
            "shareBuybackTrend": share_buyback_trend,
            "grossMargin": gross_margin
        }
    except Exception as e:
        if "Symbol" in str(e) and "not found" in str(e):
            raise HTTPException(status_code=404, detail=f"Stock ticker '{ticker}' not found")
        # Provide a more user-friendly error message
        if "'NoneType' object has no attribute 'update'" in str(e):
            raise HTTPException(status_code=500, detail=f"Unable to find information for ticker '{ticker}'. Please check the symbol and try again.")
        raise HTTPException(status_code=500, detail=f"Unable to fetch stock data. Please try again later.")
