import yfinance as yf

def test_roe():
    # Test with a well-known ticker
    ticker = "AAPL"  # Apple Inc.
    stock = yf.Ticker(ticker)

    # Get the data
    financials = stock.financials
    balance_sheet = stock.balance_sheet

    # Print the data to verify structure
    print(f"Financials columns: {financials.columns}")
    print(f"Financials index: {financials.index}")
    print(f"Balance Sheet columns: {balance_sheet.columns}")
    print(f"Balance Sheet index: {balance_sheet.index}")

    # Calculate Return on Equity (ROE)
    try:
        net_income = financials.loc["Net Income"].iloc[0]
        equity = balance_sheet.loc["Stockholders Equity"].iloc[0]

        roe = net_income / equity

        print(f"\nNet Income: {net_income}")
        print(f"Stockholders Equity: {equity}")
        print(f"Return on Equity (ROE): {roe}")

        return True
    except Exception as e:
        print(f"Error calculating ROE: {e}")
        return False

if __name__ == "__main__":
    print("Testing Return on Equity (ROE) calculation...")
    success = test_roe()
    print(f"Test {'succeeded' if success else 'failed'}")
