import yfinance as yf
import numpy as np

def test_pe_ratio():
    # Test with a well-known ticker
    ticker = "AAPL"  # Apple Inc.
    stock = yf.Ticker(ticker)

    # Get the data
    info = stock.info

    # Print the data to verify structure
    print(f"Info keys related to P/E: {[k for k in info.keys() if 'pe' in k.lower()]}")

    # Get P/E ratio from info
    pe_ratio = info.get("trailingPE", np.nan)
    print(f"\nP/E Ratio from info: {pe_ratio}")

    # Calculate P/E ratio manually
    if "trailingEps" in info and "currentPrice" in info:
        eps = info["trailingEps"]
        price = info["currentPrice"]
        
        if eps != 0:
            manual_pe = price / eps
            print(f"Manually calculated P/E Ratio: {manual_pe}")
            print(f"Difference between API and manual calculation: {pe_ratio - manual_pe}")
        else:
            print("EPS is zero, cannot calculate P/E ratio")
    else:
        print("Missing required data to calculate P/E ratio")

    return True

if __name__ == "__main__":
    print("Testing P/E Ratio calculation...")
    success = test_pe_ratio()
    print(f"Test {'succeeded' if success else 'failed'}")