import unittest
from .dataanalyzer import MarketAnalyzer

class TestMarketAnalyzer(unittest.TestCase):
    def setUp(self):
        # Sample market data for testing
        self.sample_data = """2024-11-30 11:37:34 - Starting data collection for WADU_USDT
2024-11-30 11:37:34 - 
Orderbook at 2024-11-30 11:37:34.693000

Bids (Buy Orders):
Price\t\tQuantity
------------------------------
0.00058340\t1875915.94000000
0.00058330\t5783.43000000

Asks (Sell Orders):
Price\t\tQuantity
------------------------------
0.00066000\t94969.69000000
0.00070000\t2440069.99000000

2024-11-30 11:37:35 - Ticker data: {
  "code": 0,
  "result": {
    "lastPrice": "0.00063531",
    "highPrice": "0.00077144",
    "lowPrice": "0.00012874",
    "volume": "177442708.17",
    "priceChange": "-14.53",
    "priceChangePercent": "-14.53"
  }
}

Recent Trades:
Amount (WADU)\tPrice (USDT)\tSide\t\tTime
--------------------------------------------------------------------------------
193123.94\t\t0.00063531\t\tsell\t\t2024-11-30 11:36:32
201485.55\t\t0.00063687\t\tsell\t\t2024-11-30 11:35:26

Market info: {
  "symbol": "WADU_USDT",
  "status": "trading",
  "baseAsset": "WADU",
  "quoteAsset": "USDT",
  "baseAssetPrecision": 2,
  "quoteAssetPrecision": 8
}"""
        self.analyzer = MarketAnalyzer(self.sample_data)
        self.analyzer.parse_data()

    def test_parse_orderbook(self):
        """Test orderbook parsing"""
        self.assertEqual(len(self.analyzer.bids), 2)
        self.assertEqual(len(self.analyzer.asks), 2)
        self.assertEqual(self.analyzer.bids[0]['price'], 0.00058340)
        self.assertEqual(self.analyzer.asks[0]['price'], 0.00066000)

    def test_parse_trades(self):
        """Test trades parsing"""
        self.assertEqual(len(self.analyzer.trades), 2)
        self.assertEqual(self.analyzer.trades[0]['amount'], 193123.94)
        self.assertEqual(self.analyzer.trades[0]['side'], 'sell')

    def test_parse_ticker(self):
        """Test ticker data parsing"""
        self.assertEqual(self.analyzer.ticker_data['lastPrice'], '0.00063531')
        self.assertEqual(self.analyzer.ticker_data['priceChangePercent'], '-14.53')

    def test_calculate_metrics(self):
        """Test metrics calculation"""
        metrics = self.analyzer.calculate_metrics()
        
        self.assertIsNotNone(metrics['current_price'])
        self.assertIsNotNone(metrics['buy_sell_ratio'])
        self.assertIsNotNone(metrics['vwap'])
        self.assertTrue(len(metrics['major_supports']) <= 3)
        self.assertTrue(len(metrics['major_resistances']) <= 3)

    def test_generate_scenarios(self):
        """Test scenario generation"""
        metrics = self.analyzer.calculate_metrics()
        scenarios = self.analyzer.generate_scenarios(metrics)
        
        self.assertIn('best_case', scenarios)
        self.assertIn('worst_case', scenarios)
        self.assertIsNotNone(scenarios['best_case']['target'])
        self.assertIsNotNone(scenarios['worst_case']['support'])

    def test_generate_strategies(self):
        """Test strategy generation"""
        metrics = self.analyzer.calculate_metrics()
        strategies = self.analyzer.generate_strategies(metrics)
        
        self.assertIn('immediate', strategies)
        self.assertIn('short_term', strategies)
        self.assertIn('long_term', strategies)
        self.assertIsNotNone(strategies['immediate']['defensive_stop'])
        self.assertIsNotNone(strategies['short_term']['targets'])

    def test_generate_report(self):
        """Test report generation"""
        report = self.analyzer.generate_report()
        
        self.assertIsInstance(report, str)
        self.assertIn('MARKET ANALYSIS REPORT', report)
        self.assertIn('CURRENT MARKET STATUS', report)
        self.assertIn('STRATEGY RECOMMENDATIONS', report)

if __name__ == '__main__':
    unittest.main()
