import yfinance as yf
import numpy as np

def test_interest_coverage():
    # Test with a well-known ticker
    ticker = "AAPL"  # Apple Inc.
    stock = yf.Ticker(ticker)

    # Get the data
    info = stock.info
    financials = stock.financials

    # Print the data to verify structure
    print(f"Financials columns: {financials.columns}")
    print(f"Financials index: {financials.index}")
    print(f"Info keys related to interest: {[k for k in info.keys() if 'interest' in k.lower()]}")

    # Get Interest Coverage ratio from info
    interest_coverage_from_info = info.get("interestCoverage", np.nan)
    print(f"\nInterest Coverage Ratio from info: {interest_coverage_from_info}")

    # Calculate Interest Coverage ratio manually
    try:
        # Check if Operating Income is available
        if "Operating Income" in financials.index:
            operating_income = financials.loc["Operating Income"].iloc[0]
            print(f"\nOperating Income: {operating_income}")

            # Try different fields for interest expense
            interest_expense = None

            # Check for Interest Expense
            if "Interest Expense" in financials.index:
                interest_expense = financials.loc["Interest Expense"].iloc[0]
                print(f"Interest Expense: {interest_expense}")
            # Check for Interest Expense Non Operating
            elif "Interest Expense Non Operating" in financials.index:
                interest_expense = financials.loc["Interest Expense Non Operating"].iloc[0]
                print(f"Interest Expense Non Operating: {interest_expense}")
            # Check for Net Interest Income (negative value would indicate expense)
            elif "Net Interest Income" in financials.index:
                net_interest = financials.loc["Net Interest Income"].iloc[0]
                if net_interest < 0:  # If negative, it's an expense
                    interest_expense = -net_interest
                    print(f"Net Interest Income (negative): {net_interest}")
                    print(f"Using as Interest Expense: {interest_expense}")

            # Calculate Interest Coverage ratio if we have interest expense
            if interest_expense is not None and not np.isnan(interest_expense) and interest_expense != 0:
                interest_coverage = operating_income / abs(interest_expense)
                print(f"Manually calculated Interest Coverage Ratio: {interest_coverage}")

                if not np.isnan(interest_coverage_from_info):
                    print(f"Difference between API and manual calculation: {interest_coverage_from_info - interest_coverage}")
            else:
                print("Interest Expense is zero, NaN, or not found, cannot calculate Interest Coverage ratio")
        else:
            print("Operating Income not found in financials")
            print(f"Available financial items: {financials.index.tolist()}")
    except Exception as e:
        print(f"Error calculating Interest Coverage ratio: {e}")

    return True

if __name__ == "__main__":
    print("Testing Interest Coverage Ratio calculation...")
    success = test_interest_coverage()
    print(f"Test {'succeeded' if success else 'failed'}")
