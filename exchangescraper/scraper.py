import requests
import json
from datetime import datetime

def get_orderbook_rest(symbol):
    """Fetch orderbook data from Biconomy exchange"""
    url = f"https://www.biconomy.com/api/v1/depth?symbol={symbol}"
    
    try:
        response = requests.get(url)
        if response.status_code == 200:
            data = response.json()
            if data['code'] == 200:  # Biconomy specific success code
                return {
                    'bids': data['data']['bids'],
                    'asks': data['data']['asks'],
                    'timestamp': data['data']['timestamp']
                }
            else:
                print(f"API Error: {data['msg']}")
        else:
            print(f"HTTP Error: {response.status_code}")
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
