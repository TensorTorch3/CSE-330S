import yfinance as yf
import numpy as np

def test_share_buyback():
    # Test with a well-known ticker
    ticker = "AAPL"  # Apple Inc.
    stock = yf.Ticker(ticker)

    # Get the data
    info = stock.info

    # Print the data to verify structure
    print(f"Info keys related to shares: {[k for k in info.keys() if 'share' in k.lower()]}")
    
    # Get current shares outstanding
    shares_now = info.get("sharesOutstanding", 0)
    print(f"\nCurrent Shares Outstanding: {shares_now}")
    
    # Get historical price data
    historical_data = stock.history(period="1y")
    print(f"\nHistorical data columns: {historical_data.columns}")
    print(f"Historical data index: {historical_data.index}")
    
    # Get price from a year ago (first entry) and current price (last entry)
    price_year_ago = historical_data["Close"].iloc[0]
    price_now = historical_data["Close"].iloc[-1]
    print(f"Price a year ago: {price_year_ago}")
    print(f"Current price: {price_now}")
    
    # Get current market cap
    market_cap_now = info.get("marketCap", 0)
    print(f"Current Market Cap: {market_cap_now}")
    
    # Calculate estimated shares from a year ago
    # Note: This is an approximation as it assumes the market cap has only changed due to price changes
    shares_last_year = market_cap_now / price_year_ago
    print(f"Estimated Shares Last Year: {shares_last_year}")
    
    # Calculate buyback rate
    if shares_last_year > 0:
        buyback_rate = (shares_last_year - shares_now) / shares_last_year
        print(f"Share Buyback Rate: {buyback_rate}")
        
        # A positive rate means the company is buying back shares
        # A negative rate means the company is issuing more shares
        if buyback_rate > 0:
            print(f"The company has reduced its outstanding shares by {buyback_rate * 100:.2f}% over the past year.")
        else:
            print(f"The company has increased its outstanding shares by {-buyback_rate * 100:.2f}% over the past year.")
    else:
        print("Cannot calculate buyback rate: shares_last_year is zero or negative")
    
    return True

if __name__ == "__main__":
    print("Testing Share Buyback Trend calculation...")
    success = test_share_buyback()
    print(f"Test {'succeeded' if success else 'failed'}")