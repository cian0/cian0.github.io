# Exchange Scraper

A Python script to fetch cryptocurrency trading data from Biconomy exchange.

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

Basic usage with default symbol (WADU_USDT):
```bash
python scraper.py
```

Specify a trading pair:
```bash
python scraper.py --symbol BTC_USDT
```

Fetch specific data type:
```bash
python scraper.py --symbol BTC_USDT --type orderbook
python scraper.py --symbol BTC_USDT --type ticker
python scraper.py --symbol BTC_USDT --type trades
python scraper.py --symbol BTC_USDT --type market
```

## Data Types

- `orderbook`: Shows current buy and sell orders
- `ticker`: 24h trading statistics
- `trades`: Recent trading activity
- `market`: Trading pair information and rules
- `all`: Fetch all available data (default)

## Error Handling

The script includes robust error handling for:
- Network connection issues
- Invalid API responses
- Missing or malformed data
- Rate limiting

## Example Output

The script provides formatted output for easy reading of:
- Orderbook depth with top 5 bids and asks
- 24h price statistics
- Recent trades with timestamps
- Market rules and limitations
