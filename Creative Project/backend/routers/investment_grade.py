from fastapi import APIRouter, HTTPException
import yfinance as yf
import numpy as np
import requests
from typing import Dict, Any, List, Optional

router = APIRouter()

# API configuration
API_KEY = "d027l8hr01qt2u32gnlgd027l8hr01qt2u32gnm0"
BASE_URL = "https://finnhub.io/api/v1"

# Helper functions
def fetch_peers(ticker: str) -> List[str]:
    """Fetch peer companies for a given ticker."""
    url = f"{BASE_URL}/stock/peers?symbol={ticker}&token={API_KEY}"
    response = requests.get(url)
    if response.status_code == 200:
        return response.json()
    else:
        print(f"Failed to fetch peers for {ticker}: {response.status_code}")
        return []

def fetch_metrics(ticker: str) -> Dict[str, Any]:
    """Fetch financial metrics from Finnhub API."""
    url = f"{BASE_URL}/stock/metric?symbol={ticker}&metric=all&token={API_KEY}"
    response = requests.get(url)
    if response.status_code == 200:
        return response.json().get("metric", {})
    else:
        print(f"Failed to fetch data for {ticker}: {response.status_code}")
        return {}

def fetch_industry_metrics(peers: List[str]) -> tuple[Dict[str, Optional[float]], Dict[str, Optional[float]]]:
    """Calculate industry average metrics from peer companies."""
    from time import sleep

    metrics_sample = [
        "Free Cash Flow Margin",
        "Return on Invested Capital (ROI proxy)",
        "Revenue Growth (YoY)",
        "EPS Growth (YoY)",
        "Gross Margin",
        "Operating Margin",
        "P/E Ratio",
        "Price/FCF",
        "Debt/Equity",
        "Interest Coverage"
    ]

    industry_sums = {key: 0 for key in metrics_sample}
    industry_counts = {key: 0 for key in metrics_sample}

    # Initialize sector averages (placeholder for now)
    sector_averages = {key: None for key in metrics_sample}

    for peer in peers[:5]:  # limit for speed
        sleep(1)
        peer_metrics = fetch_metrics(peer)
        peer_yf = yf.Ticker(peer)
        peer_financials = peer_yf.financials
        peer_cashflow = peer_yf.cashflow
        peer_balance = peer_yf.balance_sheet

        # Calculate Free Cash Flow Margin
        peer_ocf = peer_cashflow.loc["Operating Cash Flow"].iloc[0] if "Operating Cash Flow" in peer_cashflow.index else np.nan
        peer_capex = peer_cashflow.loc["Capital Expenditure"].iloc[0] if "Capital Expenditure" in peer_cashflow.index else 0
        peer_revenue = peer_financials.loc["Total Revenue"].iloc[0] if "Total Revenue" in peer_financials.index else np.nan
        peer_fcf_margin = (peer_ocf - peer_capex) / peer_revenue if peer_revenue else None

        # Calculate Debt/Equity
        peer_total_debt = peer_balance.loc["Long Term Debt"].iloc[0] if "Long Term Debt" in peer_balance.index else 0
        peer_equity = peer_balance.loc["Common Stock Equity"].iloc[0] if "Common Stock Equity" in peer_balance.index else np.nan
        peer_debt_equity = peer_total_debt / peer_equity if peer_equity else None

        # Calculate Interest Coverage
        peer_op_income = peer_financials.loc["Operating Income"].iloc[0] if "Operating Income" in peer_financials.index else np.nan
        peer_interest_exp = None
        for label in ["Interest Expense", "Interest Expense Non Operating", "Net Interest Expense"]:
            if label in peer_financials.index:
                peer_interest_exp = peer_financials.loc[label].iloc[0]
                break

        peer_interest_coverage = peer_op_income / abs(peer_interest_exp) if isinstance(peer_op_income, (int, float)) and isinstance(peer_interest_exp, (int, float)) and peer_interest_exp != 0 else None

        # Compile industry data
        industry_data = {
            "Free Cash Flow Margin": peer_fcf_margin,
            "Return on Invested Capital (ROI proxy)": peer_metrics.get("roiTTM"),
            "Revenue Growth (YoY)": peer_metrics.get("revenueGrowthTTMYoy"),
            "EPS Growth (YoY)": peer_metrics.get("epsGrowthTTMYoy") or peer_metrics.get("epsGrowth5Y"),
            "Gross Margin": peer_metrics.get("grossMarginTTM"),
            "Operating Margin": peer_metrics.get("operatingMarginTTM"),
            "P/E Ratio": peer_metrics.get("peInclExtraTTM") or peer_metrics.get("peBasicExclExtraTTM"),
            "Price/FCF": peer_metrics.get("pfcfShareTTM") or peer_metrics.get("currentEv/freeCashFlowTTM"),
            "Debt/Equity": peer_debt_equity,
            "Interest Coverage": peer_interest_coverage
        }

        # Update industry sums and counts
        for key, val in industry_data.items():
            if isinstance(val, (int, float)) and not np.isnan(val):
                industry_sums[key] += val
                industry_counts[key] += 1

    # Calculate industry averages
    industry_averages = {key: industry_sums[key] / industry_counts[key] if industry_counts[key] > 0 else None for key in industry_sums}

    return industry_averages, sector_averages

@router.get("/grade/{ticker}")
def grade_investment(ticker: str) -> Dict[str, Any]:
    """
    Grade a stock investment based on various financial metrics.
    """
    try:
        # Get stock info from yfinance
        ticker_yf = yf.Ticker(ticker)

        # Check if the stock exists by trying to access its info
        info = ticker_yf.info

        if not info or "symbol" not in info:
            raise HTTPException(status_code=404, detail=f"Stock ticker '{ticker}' not found")

        # Fetch financial data
        financials = ticker_yf.financials
        cashflow = ticker_yf.cashflow
        balance = ticker_yf.balance_sheet

        # Fetch metrics from Finnhub
        metrics = fetch_metrics(ticker)

        # Calculate Free Cash Flow Margin
        ocf = cashflow.loc["Operating Cash Flow"].iloc[0] if "Operating Cash Flow" in cashflow.index else np.nan
        capex = cashflow.loc["Capital Expenditure"].iloc[0] if "Capital Expenditure" in cashflow.index else 0
        revenue = financials.loc["Total Revenue"].iloc[0] if "Total Revenue" in financials.index else np.nan
        free_cash_flow = ocf - capex if not np.isnan(ocf) and not np.isnan(capex) else np.nan
        fcf_margin = free_cash_flow / revenue if revenue else None

        # Calculate Debt/Equity
        total_debt = balance.loc["Long Term Debt"].iloc[0] if "Long Term Debt" in balance.index else 0
        equity = balance.loc["Common Stock Equity"].iloc[0] if "Common Stock Equity" in balance.index else np.nan
        debt_equity = total_debt / equity if equity else None

        # Calculate Interest Coverage
        op_income = financials.loc["Operating Income"].iloc[0] if "Operating Income" in financials.index else np.nan
        interest_exp = None
        for label in ["Interest Expense", "Interest Expense Non Operating", "Net Interest Expense"]:
            if label in financials.index:
                interest_exp = financials.loc[label].iloc[0]
                break

        interest_coverage = op_income / abs(interest_exp) if isinstance(op_income, (int, float)) and isinstance(interest_exp, (int, float)) and interest_exp != 0 and not np.isnan(op_income) and not np.isnan(interest_exp) else None

        # Compile results
        results = {
            "Free Cash Flow Margin": fcf_margin,
            "Return on Invested Capital (ROI proxy)": metrics.get("roiTTM"),
            "Revenue Growth (YoY)": metrics.get("revenueGrowthTTMYoy"),
            "EPS Growth (YoY)": metrics.get("epsGrowthTTMYoy") or metrics.get("epsGrowth5Y"),
            "Gross Margin": metrics.get("grossMarginTTM"),
            "Operating Margin": metrics.get("operatingMarginTTM"),
            "P/E Ratio": metrics.get("peInclExtraTTM") or metrics.get("peBasicExclExtraTTM"),
            "Price/FCF": metrics.get("pfcfShareTTM") or metrics.get("currentEv/freeCashFlowTTM"),
            "Debt/Equity": debt_equity,
            "Interest Coverage": interest_coverage
        }

        # Fetch peer companies and industry averages
        peers = fetch_peers(ticker)
        industry_averages, sector_averages = fetch_industry_metrics(peers)

        # Define category weights
        category_weights = {
            "Profitability": 0.4,
            "Growth": 0.25,
            "Valuation": 0.2,
            "Financial Health": 0.15
        }

        # Define metric categories
        metric_categories = {
            "Free Cash Flow Margin": "Profitability",
            "Return on Invested Capital (ROI proxy)": "Profitability",
            "Gross Margin": "Profitability",
            "Operating Margin": "Profitability",
            "Revenue Growth (YoY)": "Growth",
            "EPS Growth (YoY)": "Growth",
            "P/E Ratio": "Valuation",
            "Price/FCF": "Valuation",
            "Debt/Equity": "Financial Health",
            "Interest Coverage": "Financial Health"
        }

        # Initialize category scores
        category_scores = {cat: [] for cat in category_weights}

        # Define metric explanations
        metric_explanations = {
            "Return on Invested Capital (ROI proxy)": "Approximates how efficiently the company uses capital to generate returns. Derived from roiTTM since ROIC is not available directly.",
            "Operating Margin": "Measures how efficiently a company turns revenue into operating income. High margin = good cost control.",
            "Free Cash Flow Margin": "Measures how efficiently a company converts revenue into free cash flow. Higher is better.",
            "Revenue Growth (YoY)": "Shows if the company's sales are growing year over year. Growth signals demand.",
            "EPS Growth (YoY)": "Measures growth in earnings per share. Indicates profitability trend.",
            "P/E Ratio": "Shows how much investors are willing to pay for $1 of earnings. Lower is better (within reason).",
            "Price/FCF": "Compares price to free cash flow. Lower suggests better valuation.",
            "Debt/Equity": "Shows leverage. Lower values mean lower financial risk.",
            "Interest Coverage": "Indicates how easily a company can pay interest. Higher = more financially stable.",
            "Gross Margin": "Indicates product profitability. Higher means better cost control and pricing power."
        }

        # Define grade weights
        grade_weights = {
            "Free Cash Flow Margin": 1,
            "Return on Invested Capital (ROI proxy)": 1,
            "Revenue Growth (YoY)": 1,
            "EPS Growth (YoY)": 1,
            "P/E Ratio": 1,
            "Price/FCF": 1,
            "Debt/Equity": 1,
            "Interest Coverage": 1,
            "Gross Margin": 1,
            "Operating Margin": 1
        }

        # Initialize scoring
        score = 0
        max_score = 0
        grades = {}

        # Grade each metric
        for metric, value in results.items():
            explanation = metric_explanations.get(metric, "")
            weight = grade_weights.get(metric, 1)
            readable_value = round(value, 4) if isinstance(value, (int, float)) and not np.isnan(value) else 'N/A'
            grade = "N/A"
            reason = "No industry data available; using absolute grading thresholds."
            pts = 0

            if isinstance(value, (int, float)) and not np.isnan(value):
                industry_avg = industry_averages.get(metric)
                if industry_avg and isinstance(industry_avg, (int, float)) and not np.isnan(industry_avg):
                    # Grade based on industry comparison
                    if metric == "EPS Growth (YoY)" and industry_avg < 0 and value > 0:
                        # Special case: If industry average is negative but company's value is positive,
                        # this is very good (company is growing while industry is shrinking)
                        comparison = 2.0  # Set to a high value to ensure an A grade
                    elif metric in ["P/E Ratio", "Price/FCF", "Debt/Equity"]:
                        # For these metrics, lower is better, so invert the comparison
                        comparison = industry_avg / value if value != 0 else float('inf')
                    else:
                        comparison = value / industry_avg

                    if comparison > 1.25:
                        grade, pts = "A", 1
                        reason = f"{metric} = {readable_value}, which is 25%+ better than industry avg ({round(industry_avg, 4)})"
                    elif comparison > 1.10:
                        grade, pts = "B", 0.85
                        reason = f"{metric} = {readable_value}, which is 10–25% better than industry avg ({round(industry_avg, 4)})"
                    elif comparison > 0.90:
                        grade, pts = "C", 0.7
                        reason = f"{metric} = {readable_value}, which is within ±10% of industry avg ({round(industry_avg, 4)})"
                    elif comparison > 0.75:
                        grade, pts = "D", 0.5
                        reason = f"{metric} = {readable_value}, which is 10–25% worse than industry avg ({round(industry_avg, 4)})"
                    else:
                        grade, pts = "F", 0
                        reason = f"{metric} = {readable_value}, which is 25%+ worse than industry avg ({round(industry_avg, 4)})"
                else:
                    # Grade based on absolute thresholds
                    if metric in ["Free Cash Flow Margin", "Revenue Growth (YoY)", "EPS Growth (YoY)", "Gross Margin", "Operating Margin", "Return on Invested Capital (ROI proxy)"]:
                        if value > 0.2:
                            grade, pts = "A", 1
                        elif value > 0.1:
                            grade, pts = "B", 0.85
                        elif value > 0.05:
                            grade, pts = "C", 0.7
                        elif value > 0:
                            grade, pts = "D", 0.5
                        else:
                            grade, pts = "F", 0
                        reason = f"Value = {readable_value}, graded {grade} (>{0.2 if grade == 'A' else 0.1 if grade == 'B' else 0.05 if grade == 'C' else 0 if grade == 'D' else '≤0'})"
                    elif metric == "P/E Ratio":
                        if value < 15:
                            grade, pts = "A", 1
                        elif value < 20:
                            grade, pts = "B", 0.85
                        elif value < 30:
                            grade, pts = "C", 0.7
                        elif value < 40:
                            grade, pts = "D", 0.5
                        else:
                            grade, pts = "F", 0
                        reason = f"P/E = {readable_value}, graded {grade} ({'<15' if grade == 'A' else '<20' if grade == 'B' else '<30' if grade == 'C' else '<40' if grade == 'D' else '≥40'})"
                    elif metric == "Price/FCF":
                        if value < 15:
                            grade, pts = "A", 1
                        elif value < 20:
                            grade, pts = "B", 0.85
                        elif value < 25:
                            grade, pts = "C", 0.7
                        elif value < 35:
                            grade, pts = "D", 0.5
                        else:
                            grade, pts = "F", 0
                        reason = f"Price/FCF = {readable_value}, graded {grade} ({'<15' if grade == 'A' else '<20' if grade == 'B' else '<25' if grade == 'C' else '<35' if grade == 'D' else '≥35'})"
                    elif metric == "Debt/Equity":
                        if value < 0.5:
                            grade, pts = "A", 1
                        elif value < 1:
                            grade, pts = "B", 0.85
                        elif value < 2:
                            grade, pts = "C", 0.7
                        elif value < 3:
                            grade, pts = "D", 0.5
                        else:
                            grade, pts = "F", 0
                        reason = f"Debt/Equity = {readable_value}, graded {grade} ({'<0.5' if grade == 'A' else '<1' if grade == 'B' else '<2' if grade == 'C' else '<3' if grade == 'D' else '≥3'})"
                    elif metric == "Interest Coverage":
                        if value > 20:
                            grade, pts = "A", 1
                        elif value > 10:
                            grade, pts = "B", 0.85
                        elif value > 5:
                            grade, pts = "C", 0.7
                        elif value > 2:
                            grade, pts = "D", 0.5
                        else:
                            grade, pts = "F", 0
                        reason = f"Interest Coverage = {readable_value}, graded {grade} (>{'20' if grade == 'A' else '10' if grade == 'B' else '5' if grade == 'C' else '2' if grade == 'D' else '≤2'})"

                score += weight * pts
                max_score += weight

                # Add score to category
                category = metric_categories.get(metric)
                if category:
                    category_scores[category].append(pts)

            grades[metric] = {
                "value": readable_value,
                "grade": grade,
                "reason": reason,
                "explanation": explanation,
                "weight": weight
            }

        # Calculate subcategory performance
        subcategory_performance = {}
        for cat, scores in category_scores.items():
            if scores:
                avg = sum(scores) / len(scores)
                letter = "A" if avg >= 0.9 else "B" if avg >= 0.75 else "C" if avg >= 0.6 else "D" if avg >= 0.4 else "F"
                subcategory_performance[cat] = {
                    "score": round(avg * 100, 1),
                    "grade": letter
                }
            else:
                subcategory_performance[cat] = {
                    "score": 0,
                    "grade": "N/A"
                }

        # Calculate final grade using category-based approach
        if max_score == 0:
            final_grade = "Insufficient data"
            weighted_score = 0
        else:
            # Calculate weighted score based on category weights
            weighted_score = 0
            total_weight_applied = 0

            for cat, weight in category_weights.items():
                if cat in subcategory_performance and subcategory_performance[cat]["grade"] != "N/A":
                    cat_score = subcategory_performance[cat]["score"] / 100  # Convert percentage to decimal
                    weighted_score += cat_score * weight
                    total_weight_applied += weight

            # Normalize the weighted score if we have valid categories
            if total_weight_applied > 0:
                weighted_score = weighted_score / total_weight_applied
            else:
                # Fallback to old method if no valid categories
                weighted_score = score / max_score if max_score > 0 else 0

            # Determine final grade based on weighted score
            if weighted_score >= 0.9:
                final_grade = "A"
            elif weighted_score >= 0.75:
                final_grade = "B"
            elif weighted_score >= 0.6:
                final_grade = "C"
            elif weighted_score >= 0.4:
                final_grade = "D"
            else:
                final_grade = "F"

        # Define grade meaning legend
        grade_meaning = {
            "A": "Excellent – Strong fundamentals, high profitability, attractive valuation | Recommended: Strong Buy",
            "B": "Good – Above average, likely investable | Recommended: Buy",
            "C": "Average – Neutral, further research needed | Recommended: Hold",
            "D": "Weak – Caution, poor relative metrics | Recommended: Avoid",
            "F": "Poor – Likely overvalued or underperforming | Recommended: Do Not Buy"
        }

        # Print statements for debugging (these will appear in server logs)
        print("--- Industry Averages ---")
        for k, v in industry_averages.items():
            print(f"{k}: {round(v, 2) if v is not None else 'N/A'}")

        print("\n📊 Subcategory Performance:")
        for cat, scores in category_scores.items():
            if scores:
                avg = sum(scores) / len(scores)
                letter = "A" if avg >= 0.9 else "B" if avg >= 0.75 else "C" if avg >= 0.6 else "D" if avg >= 0.4 else "F"
                print(f"{cat}: {letter} ({round(avg * 100, 1)}%)")
            else:
                print(f"{cat}: N/A")

        print("\n📈 Grade Meaning Legend:")
        for grade, meaning in grade_meaning.items():
            print(f"{grade}: {meaning}")

        print("\n📝 Final Investment Grade Explanation:")
        print(f"Weighted Score: {round(weighted_score * 100, 1)}%")
        print(f"Final Grade: {final_grade}")

        # Return the results
        return {
            "ticker": ticker,
            "name": info.get("shortName", "Unknown"),
            "sector": info.get("sector", "Unknown"),
            "industry": info.get("industry", "Unknown"),
            "industry_averages": {k: round(v, 2) if v is not None else None for k, v in industry_averages.items()},
            "metrics": grades,
            "subcategories": subcategory_performance,
            "score": round(score, 2),
            "max_score": max_score,
            "weighted_score": round(weighted_score * 100, 1),  # Convert to percentage for display
            "final_grade": final_grade,
            "grade_meaning": grade_meaning
        }

    except Exception as e:
        if "Symbol" in str(e) and "not found" in str(e):
            raise HTTPException(status_code=404, detail=f"Stock ticker '{ticker}' not found")
        # Provide a more user-friendly error message
        if "'NoneType' object has no attribute 'update'" in str(e):
            raise HTTPException(status_code=500, detail=f"Unable to find information for ticker '{ticker}'. Please check the symbol and try again.")
        raise HTTPException(status_code=500, detail=f"Unable to fetch stock data: {str(e)}")
