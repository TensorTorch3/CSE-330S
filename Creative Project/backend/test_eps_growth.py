import yfinance as yf

def test_eps_growth():
    # Test with a well-known ticker
    ticker = "AAPL"  # Apple Inc.
    stock = yf.Ticker(ticker)

    # Get the data
    info = stock.info
    income_stmt = stock.income_stmt

    # Print the data to verify structure
    print(f"Income Statement columns: {income_stmt.columns}")
    print(f"Income Statement index: {income_stmt.index}")

    # Print trailing EPS from info
    print(f"Trailing EPS from info: {info.get('trailingEps', 'Not available')}")

    # Calculate EPS Growth
    try:
        eps_this_year = info["trailingEps"]

        # Try to find EPS or calculate it from income statement
        if "Basic EPS" in income_stmt.index:
            eps_last_year = income_stmt.loc["Basic EPS"].iloc[1]  # 2nd most recent year
        elif "Diluted EPS" in income_stmt.index:
            eps_last_year = income_stmt.loc["Diluted EPS"].iloc[1]  # 2nd most recent year
        else:
            # If EPS is not directly available, we can calculate it
            # EPS = Net Income / Shares Outstanding
            print("EPS not directly available in income statement, trying to calculate it...")
            if "Net Income" in income_stmt.index and "weightedAverageShares" in info:
                net_income_last_year = income_stmt.loc["Net Income"].iloc[1]  # 2nd most recent year
                shares_outstanding = info["weightedAverageShares"]
                eps_last_year = net_income_last_year / shares_outstanding
                print(f"Calculated EPS Last Year: Net Income ({net_income_last_year}) / Shares Outstanding ({shares_outstanding})")
            else:
                raise ValueError("Cannot find or calculate EPS for last year")

        eps_growth = (eps_this_year - eps_last_year) / eps_last_year

        print(f"\nEPS This Year: {eps_this_year}")
        print(f"EPS Last Year: {eps_last_year}")
        print(f"EPS Growth: {eps_growth}")

        return True
    except Exception as e:
        print(f"Error calculating EPS Growth: {e}")
        return False

if __name__ == "__main__":
    print("Testing EPS Growth calculation...")
    success = test_eps_growth()
    print(f"Test {'succeeded' if success else 'failed'}")
