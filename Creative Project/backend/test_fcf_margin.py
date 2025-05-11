import yfinance as yf

def test_fcf_margin():
    # Test with a well-known ticker
    ticker = "AAPL"  # Apple Inc.
    stock = yf.Ticker(ticker)

    # Get the data
    cashflow = stock.cashflow
    financials = stock.financials

    # Print the data to verify structure
    print(f"Cashflow columns: {cashflow.columns}")
    print(f"Cashflow index: {cashflow.index}")
    print(f"Financials columns: {financials.columns}")
    print(f"Financials index: {financials.index}")

    # Calculate free cash flow margin
    try:
        op_cash_flow = cashflow.loc["Operating Cash Flow"].iloc[0]
        capex = cashflow.loc["Capital Expenditure"].iloc[0]
        revenue = financials.loc["Total Revenue"].iloc[0]

        free_cash_flow = op_cash_flow - capex
        fcf_margin = free_cash_flow / revenue

        print(f"\nOperating Cash Flow: {op_cash_flow}")
        print(f"Capital Expenditures: {capex}")
        print(f"Revenue: {revenue}")
        print(f"Free Cash Flow: {free_cash_flow}")
        print(f"Free Cash Flow Margin: {fcf_margin}")

        return True
    except Exception as e:
        print(f"Error calculating FCF margin: {e}")
        return False

if __name__ == "__main__":
    print("Testing Free Cash Flow Margin calculation...")
    success = test_fcf_margin()
    print(f"Test {'succeeded' if success else 'failed'}")
