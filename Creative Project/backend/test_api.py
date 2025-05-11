import requests
import json

def test_search_stock_api():
    """Test the search_stock API endpoint with a known ticker."""
    try:
        # Use the correct URL with the findstock prefix
        url = "http://localhost:8000/findstock/search/AAPL"

        # Make the request
        response = requests.get(url)

        # Check if request was successful
        if response.status_code == 200:
            data = response.json()
            print("API Response:")
            print(json.dumps(data, indent=2))

            # Check if freeCashFlowMargin, returnOnEquity, revenueGrowth, epsGrowth, peRatio, pfcfRatio, debtToEquity, interestCoverage, shareBuybackTrend, and grossMargin are in the response
            if "freeCashFlowMargin" in data and "returnOnEquity" in data and "revenueGrowth" in data and "epsGrowth" in data and "peRatio" in data and "pfcfRatio" in data and "debtToEquity" in data and "interestCoverage" in data and "shareBuybackTrend" in data and "grossMargin" in data:
                print(f"\nFree Cash Flow Margin: {data['freeCashFlowMargin']}")
                print(f"Return on Equity: {data['returnOnEquity']}")
                print(f"Revenue Growth: {data['revenueGrowth']}")
                print(f"EPS Growth: {data['epsGrowth']}")
                print(f"P/E Ratio: {data['peRatio']}")
                print(f"Price to Free Cash Flow: {data['pfcfRatio']}")
                print(f"Debt to Equity Ratio: {data['debtToEquity']}")
                print(f"Interest Coverage Ratio: {data['interestCoverage']}")
                print(f"Share Buyback Trend: {data['shareBuybackTrend']}")
                print(f"Gross Margin: {data['grossMargin']}")
                return True
            else:
                if "freeCashFlowMargin" not in data:
                    print("Error: freeCashFlowMargin not found in response")
                if "returnOnEquity" not in data:
                    print("Error: returnOnEquity not found in response")
                if "revenueGrowth" not in data:
                    print("Error: revenueGrowth not found in response")
                if "epsGrowth" not in data:
                    print("Error: epsGrowth not found in response")
                if "peRatio" not in data:
                    print("Error: peRatio not found in response")
                if "pfcfRatio" not in data:
                    print("Error: pfcfRatio not found in response")
                if "debtToEquity" not in data:
                    print("Error: debtToEquity not found in response")
                if "interestCoverage" not in data:
                    print("Error: interestCoverage not found in response")
                if "shareBuybackTrend" not in data:
                    print("Error: shareBuybackTrend not found in response")
                if "grossMargin" not in data:
                    print("Error: grossMargin not found in response")
                return False
        else:
            print(f"Error: API request failed with status code {response.status_code}")
            print(response.text)
            return False
    except Exception as e:
        print(f"Error testing API: {e}")
        return False

if __name__ == "__main__":
    print("Testing search_stock API endpoint...")
    success = test_search_stock_api()
    print(f"API Test {'succeeded' if success else 'failed'}")
