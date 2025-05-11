import requests
import json

def test_investment_grade():
    """Test the investment grading endpoint."""
    ticker = "AAPL"  # Apple Inc.
    url = f"http://localhost:8000/investment/grade/{ticker}"
    
    try:
        response = requests.get(url)
        
        if response.status_code == 200:
            data = response.json()
            
            print(f"\n--- Investment Grade for {ticker} ({data['name']}) ---")
            print(f"Sector: {data['sector']}")
            print(f"Industry: {data['industry']}")
            print(f"\nFinal Grade: {data['final_grade']} ({data['score']} / {data['max_score']} points)")
            
            print("\n--- Metric Grades ---")
            for metric, details in data['metrics'].items():
                print(f"{metric}: {details['grade']} - {details['value']}")
                print(f"  Reason: {details['reason']}")
                print(f"  Explanation: {details['explanation']}")
                print()
                
            return True
        else:
            print(f"Error: {response.status_code}")
            print(response.text)
            return False
    except Exception as e:
        print(f"Exception: {e}")
        return False

if __name__ == "__main__":
    print("Testing Investment Grade endpoint...")
    success = test_investment_grade()
    print(f"Test {'succeeded' if success else 'failed'}")