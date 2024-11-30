# Exchange Scraper

A Python script to fetch cryptocurrency trading data from Biconomy exchange.

## to run:

python exchangescraper/scraper.py --symbol WADU_USDT --type all --log-path ./data/market_data.log

## Features

- Fetch orderbook data
- Get 24h ticker statistics
- Retrieve recent trades
- Get market information
- Support for multiple trading pairs

## Requirements

- Python 3.6+
- requests library

## Installation

```bash
pip install requests
```

## Usage

### Running the Script

Basic usage with default symbol (WADU_USDT):
```bash
PYTHONPATH=. python3 scraper.py
```

Specify a trading pair:
```bash
PYTHONPATH=. python3 scraper.py --symbol BTC_USDT
```

Fetch specific data type:
```bash
PYTHONPATH=. python3 scraper.py --symbol BTC_USDT --type orderbook
PYTHONPATH=. python3 scraper.py --symbol BTC_USDT --type ticker
PYTHONPATH=. python3 scraper.py --symbol BTC_USDT --type trades
PYTHONPATH=. python3 scraper.py --symbol BTC_USDT --type market
```

### Running Tests

Run all tests:
```bash
PYTHONPATH=. python3 -m unittest exchangescraper/test_scraper.py -v
```

Run specific test:
```bash
PYTHONPATH=. python3 -m unittest exchangescraper.test_scraper.TestScraper.test_get_ticker -v
PYTHONPATH=. python3 -m unittest exchangescraper.test_scraper.TestScraper.test_get_orderbook -v
PYTHONPATH=. python3 -m unittest exchangescraper.test_scraper.TestScraper.test_get_recent_trades -v
PYTHONPATH=. python3 -m unittest exchangescraper.test_scraper.TestScraper.test_get_market_info -v
```

## Data Types

- `orderbook`: Shows current buy and sell orders
- `ticker`: 24h trading statistics
- `trades`: Recent trading activity
- `market`: Trading pair information and rules
- `all`: Fetch all available data (default)

## Response Format

### Orderbook
```json
{
  "bids": [["price", "quantity"], ...],
  "asks": [["price", "quantity"], ...],
  "timestamp": 1234567890123
}
```

### Ticker
```json
{
  "code": 0,
  "result": {
    "lastPrice": "0.12345",
    "highPrice": "0.12400",
    "lowPrice": "0.12300",
    "volume": "123456.78",
    "priceChange": "-0.12",
    "priceChangePercent": "-0.1"
  }
}
```

### Recent Trades
```json
{
  "result": [
    {
      "price": "0.12345",
      "qty": "100.0",
      "time": "1234567890123",
      "isBuyerMaker": false
    }
  ]
}
```

### Market Info
```json
{
  "symbol": "BTC_USDT",
  "status": "TRADING",
  "baseAsset": "BTC",
  "quoteAsset": "USDT",
  "baseAssetPrecision": 8,
  "quoteAssetPrecision": 2
}
```

## Error Handling

The script includes robust error handling for:
- Network connection issues
- Invalid API responses
- Missing or malformed data
- Rate limiting
- Invalid trading pairs
