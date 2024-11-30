import requests
import json
import argparse
from datetime import datetime
import os
import logging
from dataanalyzer import analyze_market_data
from holderanalysis import EnhancedKaspaAnalyzer, get_token_top_holders

def collect_all_data(symbol):
    """Collect all data types into a single JSON structure"""
    data = {
        'timestamp': datetime.now().isoformat(),
        'symbol': symbol,
        'ticker': get_ticker(symbol),
        'orderbook': get_orderbook_rest(symbol),
        'trades': get_recent_trades(symbol),
        'market_info': get_market_info(symbol)
    }
    return data

def get_ticker(symbol):
    """Fetch 24h ticker data for the trading pair"""
    # Format symbol and build URL
    formatted_symbol = symbol.upper()  # Keep the underscore for now
    url = "https://api.biconomy.com/api/v1/tickers"
    
    headers = {
        'X-SITE-ID': '127',
        'Content-Type': 'application/x-www-form-urlencoded'
    }
    
    params = {
        'symbol': formatted_symbol
    }
    
    try:
        response = requests.get(url, params=params, headers=headers, timeout=10)
        
        response.raise_for_status()
        data = response.json()
        
        # Handle empty response
        if not data:
            print("Empty response received from ticker endpoint")
            return None
            
        # Check for success response and find the ticker for the requested symbol
        if 'ticker' in data:
            # Keep the underscore in the symbol
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

def get_recent_trades(symbol, limit=100):
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
        
        if not data:
            print("Empty response received from market info endpoint")
            return None
            
        if isinstance(data, dict) and 'symbol' in data:
            # The API returns direct symbol info, no need to search
            symbol_info = data
            if symbol_info['symbol'].upper() == formatted_symbol:
                return {
                    'symbol': symbol_info.get('symbol'),
                    'status': symbol_info.get('status', 'TRADING'),
                    'baseAsset': symbol_info.get('baseAsset'),
                    'quoteAsset': symbol_info.get('quoteAsset'),
                    'baseAssetPrecision': symbol_info.get('baseAssetPrecision'),
                    'quoteAssetPrecision': symbol_info.get('quoteAssetPrecision'),
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
        'size': '100'  # Using size parameter for depth
    }
    headers = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept': 'application/json'
    }
    
    try:
        response = requests.get(url, params=params, headers=headers)
        response.raise_for_status()  # Raise an exception for bad status codes
        
        data = response.json()
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

def format_orderbook_data(orderbook, logger=None):
    """Format orderbook data for display"""
    if not orderbook:
        return
    
    timestamp = datetime.fromtimestamp(orderbook['timestamp']/1000)
    output = [f"\nOrderbook at {timestamp}"]
    
    output.append("\nBids (Buy Orders):")
    output.append("Price\t\tQuantity")
    output.append("-" * 30)
    for bid in orderbook['bids'][:20]:  # Increased to 20 entries
        output.append(f"{float(bid[0]):.8f}\t{float(bid[1]):.8f}")
    
    output.append("\nAsks (Sell Orders):")
    output.append("Price\t\tQuantity")
    output.append("-" * 30)
    for ask in orderbook['asks'][:20]:  # Increased to 20 entries
        output.append(f"{float(ask[0]):.8f}\t{float(ask[1]):.8f}")
    
    # Print to console and log if logger provided
    print('\n'.join(output))
    if logger:
        logger.info('\n'.join(output))

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

def format_trades_data(trades_response, logger=None):
    """Format recent trades data for display"""
    if not trades_response:
        msg = "\nNo trades data available"
        print(msg)
        if logger:
            logger.info(msg)
        return
    
    # Handle both list and dictionary response formats
    trades = trades_response if isinstance(trades_response, list) else trades_response.get('result', [])
    if not trades:
        msg = "\nNo recent trades found"
        print(msg)
        if logger:
            logger.info(msg)
        return
        
    # Extract base and quote assets from the command line symbol argument
    base_asset, quote_asset = args.symbol.split('_')
    
    output = ["\nRecent Trades:"]
    output.append(f"Amount ({base_asset})\tPrice ({quote_asset})\tSide\t\tTime")
    output.append("-" * 80)
    
    for trade in trades[:50]:  # Show 50 trades
        amount = trade.get('amount', '0')
        price = trade.get('price', '0')
        side = trade.get('side', 'unknown')
        timestamp = int(trade.get('timestamp', '0'))
        readable_time = datetime.fromtimestamp(timestamp/1000).strftime('%Y-%m-%d %H:%M:%S')
        
        output.append(
            f"{amount}\t\t{price}\t\t{side}\t\t{readable_time}"
        )
    
    # Print to console and log if logger provided
    print('\n'.join(output))
    if logger:
        logger.info('\n'.join(output))

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
    parser.add_argument('--output-dir', type=str, default='exchangescraper/output', 
                      help='Directory to save output files (default: exchangescraper/output)')
    
    args = parser.parse_args()
    
    # Setup logging if path provided
    logger = None
    # Create output directory
    os.makedirs(args.output_dir, exist_ok=True)
    
    # Generate timestamp for consistent file naming
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    base_name = f"{args.symbol.lower()}_{timestamp}"
    
    # Setup logging
    log_path = os.path.join(args.output_dir, f"{base_name}.log")
    logging.basicConfig(
        filename=log_path,
        level=logging.INFO,
        format='%(asctime)s - %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    logger = logging.getLogger()
    logger.info(f"Starting data collection for {args.symbol}")
        
    # Save market data JSON
    json_path = os.path.join(args.output_dir, f"{base_name}_market_data.json")
    all_data = collect_all_data(args.symbol)
    with open(json_path, 'w') as f:
        json.dump(all_data, f, indent=2)
        
    # Generate analysis reports using dataanalyzer
    try:
        text_report, json_report = analyze_market_data(json_path, args.output_dir, base_name)
        print(f"\nAnalysis reports generated:")
        print(f"Text report: {text_report}")
        print(f"JSON report: {json_report}")
        
        # Display the text report content
        with open(text_report, 'r') as f:
            print("\nMarket Analysis Report:")
            print("-" * 80)
            print(f.read())

        # Generate holder analysis
        print("\nGenerating holder analysis...")
        analyzer = EnhancedKaspaAnalyzer()
        top_holders = get_token_top_holders(args.symbol)
        
        if top_holders:
            holder_analysis = analyzer.generate_holder_analysis_report(top_holders)
            
            # Save holder analysis reports
            holder_text_path = os.path.join(args.output_dir, f"{base_name}_holder_analysis.txt")
            holder_json_path = os.path.join(args.output_dir, f"{base_name}_holder_analysis.json")
            
            with open(holder_json_path, 'w') as f:
                json.dump(holder_analysis, f, indent=2)
                
            with open(holder_text_path, 'w') as f:
                f.write("HOLDER ANALYSIS REPORT\n")
                f.write("=" * 50 + "\n\n")
                f.write(f"Generated at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
                f.write("Risk Metrics:\n")
                f.write("-" * 50 + "\n")
                for key, value in holder_analysis['risk_metrics'].items():
                    f.write(f"{key}: {value}\n")
                f.write("\nMarket Signals:\n")
                f.write("-" * 50 + "\n")
                for key, value in holder_analysis['market_signals'].items():
                    f.write(f"{key}: {json.dumps(value, indent=2)}\n")
                    
            print(f"\nHolder analysis reports generated:")
            print(f"Text report: {holder_text_path}")
            print(f"JSON report: {holder_json_path}")
            
            # Log holder analysis if logger is available
            if logger:
                logger.info("Holder analysis completed successfully")
                logger.info(f"Reports saved to: {holder_text_path} and {holder_json_path}")
        else:
            print("No holder data available for analysis")
            if logger:
                logger.warning("No holder data available for analysis")
                
    except Exception as e:
        print(f"\nError generating analysis reports: {e}")
        if logger:
            logger.error(f"Error generating analysis reports: {e}")
    
    if args.type in ['orderbook', 'all']:
        orderbook = get_orderbook_rest(args.symbol)
        format_orderbook_data(orderbook, logger)
    
    if args.type in ['ticker', 'all']:
        ticker = get_ticker(args.symbol)
        format_ticker_data(ticker)
        if logger:
            logger.info(f"Ticker data: {json.dumps(ticker, indent=2)}")
    
    if args.type in ['trades', 'all']:
        trades = get_recent_trades(args.symbol)
        format_trades_data(trades, logger)
    
    if args.type in ['market', 'all']:
        market_info = get_market_info(args.symbol)
        format_market_info(market_info)
        if logger:
            logger.info(f"Market info: {json.dumps(market_info, indent=2)}")
