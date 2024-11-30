import requests
import json
import argparse
from datetime import datetime

def get_ticker(symbol):
    """Fetch 24h ticker data for the trading pair"""
    url = f"https://www.biconomy.com/api/v1/ticker/24hr?symbol={symbol}"
    
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        }
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        data = response.json()
        print("Ticker Response:", json.dumps(data, indent=2))
        return data
    except Exception as e:
        print(f"Error fetching ticker: {e}")
        return None

def get_recent_trades(symbol, limit=20):
    """Fetch recent trades for the trading pair"""
    url = f"https://www.biconomy.com/api/v1/trades?symbol={symbol}&limit={limit}"
    
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        }
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        data = response.json()
        print("Trades Response:", json.dumps(data, indent=2))
        return data
    except Exception as e:
        print(f"Error fetching trades: {e}")
        return None

def get_market_info(symbol):
    """Fetch market information for the trading pair"""
    url = f"https://www.biconomy.com/api/v1/exchangeInfo"
    
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        }
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        data = response.json()
        
        # Find the specific symbol info
        symbol_info = next((s for s in data.get('symbols', []) if s.get('symbol') == symbol), None)
        if symbol_info:
            print("Market Info:", json.dumps(symbol_info, indent=2))
            return symbol_info
        return None
    except Exception as e:
        print(f"Error fetching market info: {e}")
        return None

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
    print(f"\nOrderbook at {timestamp}")
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

def format_ticker_data(ticker):
    """Format ticker data for display"""
    if not ticker:
        return
    
    print("\nTicker 24h Statistics:")
    print("-" * 30)
    print(f"Last Price: {ticker.get('lastPrice', 'N/A')}")
    print(f"24h High: {ticker.get('highPrice', 'N/A')}")
    print(f"24h Low: {ticker.get('lowPrice', 'N/A')}")
    print(f"24h Volume: {ticker.get('volume', 'N/A')}")
    print(f"24h Change: {ticker.get('priceChange', 'N/A')}")
    print(f"24h Change %: {ticker.get('priceChangePercent', 'N/A')}%")

def format_trades_data(trades):
    """Format recent trades data for display"""
    if not trades:
        return
    
    print("\nRecent Trades:")
    print("Time\t\t\tPrice\t\tQuantity\tSide")
    print("-" * 60)
    for trade in trades[:5]:  # Show last 5 trades
        timestamp = datetime.fromtimestamp(int(trade.get('time', 0))/1000)
        print(f"{timestamp}\t{trade.get('price', 'N/A')}\t{trade.get('qty', 'N/A')}\t{trade.get('isBuyerMaker', 'N/A')}")

def format_market_info(info):
    """Format market information for display"""
    if not info:
        return
    
    print("\nMarket Information:")
    print("-" * 30)
    print(f"Symbol: {info.get('symbol', 'N/A')}")
    print(f"Status: {info.get('status', 'N/A')}")
    print(f"Base Asset: {info.get('baseAsset', 'N/A')}")
    print(f"Quote Asset: {info.get('quoteAsset', 'N/A')}")
    
    filters = info.get('filters', [])
    for f in filters:
        if f.get('filterType') == 'PRICE_FILTER':
            print(f"Min Price: {f.get('minPrice', 'N/A')}")
            print(f"Max Price: {f.get('maxPrice', 'N/A')}")
        elif f.get('filterType') == 'LOT_SIZE':
            print(f"Min Qty: {f.get('minQty', 'N/A')}")
            print(f"Max Qty: {f.get('maxQty', 'N/A')}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Fetch cryptocurrency trading pair information')
    parser.add_argument('--symbol', type=str, default='WADU_USDT', help='Trading pair symbol (e.g., WADU_USDT)')
    parser.add_argument('--type', type=str, choices=['orderbook', 'ticker', 'trades', 'market', 'all'],
                      default='all', help='Type of information to fetch')
    
    args = parser.parse_args()
    
    if args.type in ['orderbook', 'all']:
        orderbook = get_orderbook_rest(args.symbol)
        format_orderbook_data(orderbook)
    
    if args.type in ['ticker', 'all']:
        ticker = get_ticker(args.symbol)
        format_ticker_data(ticker)
    
    if args.type in ['trades', 'all']:
        trades = get_recent_trades(args.symbol)
        format_trades_data(trades)
    
    if args.type in ['market', 'all']:
        market_info = get_market_info(args.symbol)
        format_market_info(market_info)
