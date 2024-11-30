import unittest
from .scraper import get_ticker, get_recent_trades, get_market_info, get_orderbook_rest

class TestScraper(unittest.TestCase):
    def setUp(self):
        self.test_symbol = "WADU_USDT"
        
    def test_get_ticker(self):
        result = get_ticker(self.test_symbol)
        self.assertIsNotNone(result)
        self.assertEqual(result.get('code'), 0)
        ticker_data = result.get('result')
        self.assertIsNotNone(ticker_data)
        self.assertTrue('lastPrice' in ticker_data)
        self.assertTrue('volume' in ticker_data)

    def test_get_recent_trades(self):
        trades = get_recent_trades(self.test_symbol)
        self.assertIsNotNone(trades)
        if trades and 'result' in trades:
            trades_list = trades['result']
            self.assertTrue(isinstance(trades_list, list))
            if trades_list:
                self.assertTrue('qty' in trades_list[0])
                self.assertTrue('price' in trades_list[0])
            
    def test_get_market_info(self):
        info = get_market_info(self.test_symbol)
        self.assertIsNotNone(info)
        self.assertTrue('symbol' in info)
        self.assertTrue('baseAsset' in info)
        self.assertTrue('quoteAsset' in info)
        self.assertTrue('baseAssetPrecision' in info)
        self.assertTrue('quoteAssetPrecision' in info)
        
    def test_get_orderbook(self):
        orderbook = get_orderbook_rest(self.test_symbol)
        self.assertIsNotNone(orderbook)
        self.assertTrue('bids' in orderbook)
        self.assertTrue('asks' in orderbook)
        self.assertTrue('timestamp' in orderbook)

if __name__ == '__main__':
    unittest.main()
