import yfinance as yf

def test_revenue_growth():
    # Test with a well-known ticker
    ticker = "AAPL"  # Apple Inc.
    stock = yf.Ticker(ticker)

    # Get the data
    financials = stock.financials

    # Print the data to verify structure
    print(f"Financials columns: {financials.columns}")
    print(f"Financials index: {financials.index}")

    # Calculate Revenue Growth
    try:
        if len(financials.columns) >= 2:
            rev_this_year = financials.loc["Total Revenue"].iloc[0]
            rev_last_year = financials.loc["Total Revenue"].iloc[1]
            
            rev_growth = (rev_this_year - rev_last_year) / rev_last_year

            print(f"\nRevenue This Year: {rev_this_year}")
            print(f"Revenue Last Year: {rev_last_year}")
            print(f"Revenue Growth: {rev_growth}")

            return True
        else:
            print("Error: Not enough historical data available")
            return False
    except Exception as e:
        print(f"Error calculating Revenue Growth: {e}")
        return False

if __name__ == "__main__":
    print("Testing Revenue Growth calculation...")
    success = test_revenue_growth()
    print(f"Test {'succeeded' if success else 'failed'}")