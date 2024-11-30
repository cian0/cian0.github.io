import requests
import json
from datetime import datetime

def get_orderbook_rest(symbol):
    """Fetch orderbook data from Biconomy exchange"""
    url = f"https://www.biconomy.com/api/v1/depth?symbol={symbol}"
    
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        response = requests.get(url, headers=headers)
        response.raise_for_status()  # Raise an exception for bad status codes
        
        data = response.json()
        # Print response for debugging
        print("API Response:", json.dumps(data, indent=2))
        
        if 'bids' in data and 'asks' in data:
            return {
                'bids': data['bids'],
                'asks': data['asks'],
                'timestamp': int(datetime.now().timestamp() * 1000)  # Using current timestamp since API doesn't provide one
            }
        else:
            print(f"Missing orderbook data in response: {data}")
    except requests.exceptions.RequestException as e:
        print(f"Request Error: {e}")
    except json.JSONDecodeError as e:
        print(f"JSON Decode Error: {e}")
    except Exception as e:
        print(f"Error fetching orderbook: {e}")
    return None

def format_orderbook_data(orderbook):
    """Format orderbook data for display"""
    if not orderbook:
        return
    
    timestamp = datetime.fromtimestamp(orderbook['timestamp']/1000)
    print(f"\nOrderbook for WADU/USDT at {timestamp}")
    print("\nTop 5 Bids (Buy Orders):")
    print("Price\t\tQuantity")
    print("-" * 30)
    for bid in orderbook['bids'][:5]:
        print(f"{float(bid[0]):.8f}\t{float(bid[1]):.8f}")
    
    print("\nTop 5 Asks (Sell Orders):")
    print("Price\t\tQuantity")
    print("-" * 30)
    for ask in orderbook['asks'][:5]:
        print(f"{float(ask[0]):.8f}\t{float(ask[1]):.8f}")

if __name__ == "__main__":
    symbol = "WADU_USDT"
    orderbook = get_orderbook_rest(symbol)
    format_orderbook_data(orderbook)
