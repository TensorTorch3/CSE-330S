import yfinance as yf
import numpy as np

def test_de_ratio():
    # Test with a well-known ticker
    ticker = "AAPL"  # Apple Inc.
    stock = yf.Ticker(ticker)

    # Get the data
    info = stock.info
    balance_sheet = stock.balance_sheet

    # Print the data to verify structure
    print(f"Balance Sheet columns: {balance_sheet.columns}")
    print(f"Balance Sheet index: {balance_sheet.index}")
    print(f"Info keys related to debt: {[k for k in info.keys() if 'debt' in k.lower()]}")

    # Get Debt to Equity ratio from info
    de_ratio_from_info = info.get("debtToEquity", np.nan)
    print(f"\nDebt to Equity Ratio from info: {de_ratio_from_info}")

    # Calculate Debt to Equity ratio manually
    try:
        # Check if the required fields are in the balance sheet
        if "Total Liabilities Net Minority Interest" in balance_sheet.index and "Stockholders Equity" in balance_sheet.index:
            total_liabilities = balance_sheet.loc["Total Liabilities Net Minority Interest"].iloc[0]
            equity = balance_sheet.loc["Stockholders Equity"].iloc[0]

            # Calculate Debt to Equity ratio
            if equity != 0:
                de_ratio = total_liabilities / equity
                print(f"\nTotal Liabilities: {total_liabilities}")
                print(f"Total Stockholder Equity: {equity}")
                print(f"Manually calculated Debt to Equity Ratio: {de_ratio}")

                if not np.isnan(de_ratio_from_info):
                    print(f"Difference between API and manual calculation: {de_ratio_from_info - de_ratio}")
            else:
                print("Equity is zero, cannot calculate Debt to Equity ratio")
        else:
            print("Required balance sheet items not found")
            print(f"Available balance sheet items: {balance_sheet.index.tolist()}")
    except Exception as e:
        print(f"Error calculating Debt to Equity ratio: {e}")

    return True

if __name__ == "__main__":
    print("Testing Debt to Equity Ratio calculation...")
    success = test_de_ratio()
    print(f"Test {'succeeded' if success else 'failed'}")
