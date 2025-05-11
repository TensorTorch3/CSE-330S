import yfinance as yf

def test_gross_margin():
    # Test with a well-known ticker
    ticker = "AAPL"  # Apple Inc.
    stock = yf.Ticker(ticker)

    # Get the data
    financials = stock.financials

    # Print the data to verify structure
    print(f"Financials columns: {financials.columns}")
    print(f"Financials index: {financials.index}")

    # Calculate Gross Margin
    try:
        if "Gross Profit" in financials.index and "Total Revenue" in financials.index:
            gross_profit = financials.loc["Gross Profit"].iloc[0]
            revenue = financials.loc["Total Revenue"].iloc[0]
            
            gross_margin = gross_profit / revenue

            print(f"\nGross Profit: {gross_profit}")
            print(f"Total Revenue: {revenue}")
            print(f"Gross Margin: {gross_margin}")

            return True
        else:
            print("Error: Gross Profit or Total Revenue not found in financials")
            if "Gross Profit" not in financials.index:
                print("Gross Profit not found in financials index")
                print(f"Available indices: {financials.index.tolist()}")
            if "Total Revenue" not in financials.index:
                print("Total Revenue not found in financials index")
                print(f"Available indices: {financials.index.tolist()}")
            return False
    except Exception as e:
        print(f"Error calculating Gross Margin: {e}")
        return False

if __name__ == "__main__":
    print("Testing Gross Margin calculation...")
    success = test_gross_margin()
    print(f"Test {'succeeded' if success else 'failed'}")