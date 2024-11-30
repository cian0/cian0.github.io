import requests
import json
import argparse
from datetime import datetime

def get_ticker(symbol):
    """Fetch 24h ticker data for the trading pair"""
    # Format symbol and build URL
    formatted_symbol = symbol.upper()  # Keep the underscore for now
    url = "https://api.biconomy.com/api/v1/tickers"
    
    headers = {
        'X-SITE-ID': '127',
        'Content-Type': 'application/x-www-form-urlencoded'
    }
    
    print(f"Attempting ticker request with URL: {url}")
    
    params = {
        'symbol': formatted_symbol
    }
    
    try:
        response = requests.get(url, params=params, headers=headers, timeout=10)
        print(f"Response status code: {response.status_code}")
        print(f"Response content: {response.text[:500]}")
        
        response.raise_for_status()
        data = response.json()
        
        # Handle empty response
        if not data:
            print("Empty response received from ticker endpoint")
            return None
            
        # Check for success response and find the ticker for the requested symbol
        if 'ticker' in data:
            # Keep the underscore in the symbol
            print(f"Looking for symbol: {formatted_symbol}")
            print("Available symbols:", [t['symbol'] for t in data['ticker']])
            for tick in data['ticker']:
                if tick['symbol'].upper() == formatted_symbol.upper():  # Case-insensitive comparison with underscore
                    return {
                        'code': 0,
                        'result': {
                            'lastPrice': tick['last'],
                            'highPrice': tick['high'],
                            'lowPrice': tick['low'],
                            'volume': tick['vol'],
                            'buy': tick['buy'],
                            'sell': tick['sell'],
                            'priceChange': tick['change'],
                            'priceChangePercent': tick['change']
                        }
                    }
            print(f"Symbol {formatted_symbol} not found in ticker data")
            return None
        
        print("No ticker data found in response")
        return None
        
    except requests.exceptions.Timeout:
        print(f"Request timed out for URL: {url}")
    except requests.exceptions.RequestException as e:
        print(f"Network error: {e}")
    except json.JSONDecodeError:
        print(f"Invalid JSON response from URL: {url}")
    except Exception as e:
        print(f"Unexpected error: {e}")
    
    return None

def get_recent_trades(symbol, limit=20):
    """Fetch recent trades for the trading pair"""
    url = f"https://api.biconomy.com/api/v1/trades"
    formatted_symbol = symbol.upper()  # Keep underscore for this endpoint
    params = {
        'symbol': formatted_symbol,
        'size': str(limit)
    }
    headers = {
        'X-SITE-ID': '127',
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
    }
    
    try:
        response = requests.get(url, params=params, headers=headers, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        # Handle empty or error responses
        if not data:
            print("Empty response received from trades endpoint")
            return None
            
        if isinstance(data, dict):
            if data.get('code') not in [0, 200]:
                error_msg = data.get('message', 'Unknown error')
                if 'Illegal parameter' in str(error_msg):
                    print(f"Invalid trading pair symbol: {symbol}")
                else:
                    print(f"API Error: {error_msg}")
                return None
            
        print("Trades Response:", json.dumps(data, indent=2))
        return data
    except requests.exceptions.Timeout:
        print("Request timed out while fetching trades")
        return None
    except requests.exceptions.RequestException as e:
        print(f"Network error fetching trades: {e}")
        return None
    except json.JSONDecodeError:
        print("Invalid JSON response from trades endpoint")
        return None
    except Exception as e:
        print(f"Unexpected error fetching trades: {e}")
        return None

def get_market_info(symbol):
    """Fetch market information for the trading pair"""
    url = "https://api.biconomy.com/api/v1/exchangeInfo"
    formatted_symbol = symbol.upper()  # Keep underscore
    params = {
        'symbol': formatted_symbol
    }
    headers = {
        'X-SITE-ID': '127',
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
    }
    
    try:
        response = requests.get(url, params=params, headers=headers, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        print(f"Market Info Response: {json.dumps(data, indent=2)}")
        
        if not data:
            print("Empty response received from market info endpoint")
            return None
            
        if isinstance(data, dict) and 'symbols' in data:
            # Convert symbol to uppercase for comparison
            formatted_symbol = formatted_symbol.upper()
            # Find the specific symbol info
            symbol_info = next((s for s in data['symbols'] if s.get('symbol', '').upper() == formatted_symbol), None)
            if symbol_info:
                return {
                    'symbol': symbol_info.get('symbol'),
                    'status': symbol_info.get('status', 'TRADING'),
                    'baseAsset': symbol_info.get('base_currency'),
                    'quoteAsset': symbol_info.get('quote_currency'),
                    'filters': [
                        {
                            'filterType': 'PRICE_FILTER',
                            'minPrice': symbol_info.get('min_price', '0'),
                            'maxPrice': symbol_info.get('max_price', '0')
                        },
                        {
                            'filterType': 'LOT_SIZE',
                            'minQty': symbol_info.get('min_amount', '0'),
                            'maxQty': symbol_info.get('max_amount', '0')
                        }
                    ]
                }
            print(f"Trading pair {formatted_symbol} not found in exchange")
            return None
        else:
            print("Invalid market info response format - missing data array")
            return None
    except Exception as e:
        print(f"Error fetching market info: {e}")
        return None

def get_orderbook_rest(symbol):
    """Fetch orderbook data from Biconomy exchange"""
    formatted_symbol = symbol.upper()  # Keep the underscore
    url = "https://api.biconomy.com/api/v1/depth"
    params = {
        'symbol': formatted_symbol,
        'limit': '100'  # Add depth limit parameter
    }
    headers = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept': 'application/json'
    }
    
    try:
        response = requests.get(url, params=params, headers=headers)
        response.raise_for_status()  # Raise an exception for bad status codes
        
        data = response.json()
        # Print response for debugging
        print("API Response:", json.dumps(data, indent=2))
        
        if 'asks' in data and 'bids' in data:  # Direct access to orderbook data
            orderbook_data = data
            return {
                'bids': orderbook_data.get('bids', []),
                'asks': orderbook_data.get('asks', []),
                'timestamp': int(datetime.now().timestamp() * 1000)
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

def format_ticker_data(ticker_response):
    """Format ticker data for display"""
    if not ticker_response or ticker_response.get('code') != 0:
        print("\nNo ticker data available")
        return
        
    ticker = ticker_response.get('result', {})
    if not ticker:
        print("\nNo ticker statistics found")
        return
    
    print("\nTicker 24h Statistics:")
    print("-" * 30)
    print(f"Last Price: {ticker.get('lastPrice', 'N/A')}")
    print(f"24h High: {ticker.get('highPrice', 'N/A')}")
    print(f"24h Low: {ticker.get('lowPrice', 'N/A')}")
    print(f"24h Volume: {ticker.get('volume', 'N/A')}")
    print(f"24h Change: {ticker.get('priceChange', 'N/A')}")
    print(f"24h Change %: {ticker.get('priceChangePercent', 'N/A')}%")

def format_trades_data(trades_response):
    """Format recent trades data for display"""
    if not trades_response or trades_response.get('code') != 0:
        print("\nNo trades data available")
        return
    
    trades = trades_response.get('result', [])
    if not trades:
        print("\nNo recent trades found")
        return
        
    print("\nRecent Trades:")
    print("Time\t\t\tPrice\t\tQuantity\tSide")
    print("-" * 60)
    for trade in trades[:5]:  # Show last 5 trades
        timestamp = datetime.fromtimestamp(int(trade.get('time', 0))/1000)
        print(f"{timestamp}\t{trade.get('price', 'N/A')}\t{trade.get('qty', 'N/A')}\t{'Sell' if trade.get('isBuyerMaker') else 'Buy'}")

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
