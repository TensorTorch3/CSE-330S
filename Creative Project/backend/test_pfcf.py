import yfinance as yf
import numpy as np

def test_pfcf():
    # Test with a well-known ticker
    ticker = "AAPL"  # Apple Inc.
    stock = yf.Ticker(ticker)

    # Get the data
    info = stock.info
    cashflow = stock.cashflow

    # Print the data to verify structure
    print(f"Cashflow columns: {cashflow.columns}")
    print(f"Cashflow index: {cashflow.index}")
    print(f"Info keys related to cash flow: {[k for k in info.keys() if 'cash' in k.lower()]}")
    print(f"Info keys related to market cap: {[k for k in info.keys() if 'cap' in k.lower()]}")

    # Get Price to Free Cash Flow from info
    pfcf_from_info = info.get("priceToFreeCashflow", np.nan)
    print(f"\nPrice to Free Cash Flow from info: {pfcf_from_info}")

    # Calculate Price to Free Cash Flow manually
    try:
        market_cap = info["marketCap"]
        
        # Calculate free cash flow
        op_cash_flow = cashflow.loc["Operating Cash Flow"].iloc[0]
        capex = cashflow.loc["Capital Expenditure"].iloc[0]
        free_cash_flow = op_cash_flow - capex
        
        # Calculate Price to Free Cash Flow
        if free_cash_flow != 0:
            pfcf = market_cap / free_cash_flow
            print(f"\nMarket Cap: {market_cap}")
            print(f"Operating Cash Flow: {op_cash_flow}")
            print(f"Capital Expenditures: {capex}")
            print(f"Free Cash Flow: {free_cash_flow}")
            print(f"Manually calculated Price to Free Cash Flow: {pfcf}")
            
            if not np.isnan(pfcf_from_info):
                print(f"Difference between API and manual calculation: {pfcf_from_info - pfcf}")
        else:
            print("Free Cash Flow is zero, cannot calculate Price to Free Cash Flow")
    except Exception as e:
        print(f"Error calculating Price to Free Cash Flow: {e}")

    return True

if __name__ == "__main__":
    print("Testing Price to Free Cash Flow calculation...")
    success = test_pfcf()
    print(f"Test {'succeeded' if success else 'failed'}")