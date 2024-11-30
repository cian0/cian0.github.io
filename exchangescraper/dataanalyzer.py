import json
import re
from datetime import datetime
from typing import Dict, List, Tuple, Optional

class MarketAnalyzer:
    def __init__(self, json_data: str):
        """Initialize with JSON data string."""
        data = json.loads(json_data)
        self.timestamp = data['timestamp']
        self.symbol = data['symbol']
        self.ticker_data = data['ticker']['result']
        self.bids = [{'price': float(bid[0]), 'quantity': float(bid[1])} 
                    for bid in data['orderbook']['bids']]
        self.asks = [{'price': float(ask[0]), 'quantity': float(ask[1])} 
                    for ask in data['orderbook']['asks']]
        self.trades = [{'amount': float(trade['amount']),
                       'price': float(trade['price']),
                       'side': trade['side'],
                       'time': trade['timestamp']} 
                      for trade in data['trades']]
        self.market_info = data['market_info']
        
    def parse_data(self) -> None:
        """No parsing needed as JSON is already structured."""
        pass

    def calculate_metrics(self) -> Dict:
        """Calculate key market metrics."""
        current_price = float(self.ticker_data['lastPrice'])
        
        # Volume metrics
        buy_volume = sum(trade['amount'] for trade in self.trades if trade['side'] == 'buy')
        sell_volume = sum(trade['amount'] for trade in self.trades if trade['side'] == 'sell')
        
        # Price metrics
        vwap = sum(trade['price'] * trade['amount'] for trade in self.trades) / \
              sum(trade['amount'] for trade in self.trades)
        
        # Support and resistance levels
        major_supports = sorted([bid['price'] for bid in self.bids 
                               if bid['quantity'] > 500000], reverse=True)[:3]
        major_resistances = sorted([ask['price'] for ask in self.asks 
                                  if ask['quantity'] > 500000])[:3]
        
        return {
            'current_price': current_price,
            'buy_volume': buy_volume,
            'sell_volume': sell_volume,
            'buy_sell_ratio': buy_volume / sell_volume if sell_volume > 0 else 0,
            'vwap': vwap,
            'price_change_percent': float(self.ticker_data['priceChangePercent']),
            'major_supports': major_supports,
            'major_resistances': major_resistances,
            'high_24h': float(self.ticker_data['highPrice']),
            'low_24h': float(self.ticker_data['lowPrice'])
        }

    def generate_scenarios(self, metrics: Dict) -> Dict:
        """Generate best and worst case scenarios."""
        current_price = metrics['current_price']
        
        best_case = {
            'target': min(metrics['major_resistances']),
            'potential_gain': (min(metrics['major_resistances']) / current_price - 1) * 100,
            'max_target': metrics['high_24h'],
            'max_potential': (metrics['high_24h'] / current_price - 1) * 100
        }
        
        worst_case = {
            'support': max(metrics['major_supports']),
            'potential_loss': (max(metrics['major_supports']) / current_price - 1) * 100,
            'max_loss_level': metrics['low_24h'],
            'max_potential_loss': (metrics['low_24h'] / current_price - 1) * 100
        }
        
        return {'best_case': best_case, 'worst_case': worst_case}

    def generate_strategies(self, metrics: Dict) -> Dict:
        """Generate trading strategies for different timeframes."""
        current_price = metrics['current_price']
        
        immediate = {
            'defensive_stop': current_price * 0.913,  # -8.7%
            'scalp_targets': {
                'entry': current_price * 0.98,
                'stop': current_price * 0.968,
                'take_profit': min(metrics['major_resistances'])
            }
        }
        
        short_term = {
            'accumulation_zone': {
                'start': current_price * 0.85,
                'end': current_price * 0.95
            },
            'targets': min(metrics['major_resistances']),
            'stop_loss': max(metrics['major_supports'])
        }
        
        long_term = {
            'accumulation_levels': [
                current_price * 0.75,
                current_price * 0.70,
                current_price * 0.65,
                current_price * 0.60
            ],
            'ultimate_target': metrics['high_24h'] * 1.2
        }
        
        return {
            'immediate': immediate,
            'short_term': short_term,
            'long_term': long_term
        }

    def generate_report(self) -> str:
        """Generate a comprehensive market analysis report."""
        self.parse_data()
        metrics = self.calculate_metrics()
        scenarios = self.generate_scenarios(metrics)
        strategies = self.generate_strategies(metrics)
        
        report = f"""
MARKET ANALYSIS REPORT
Generated at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
Symbol: {self.market_info['symbol']}

CURRENT MARKET STATUS:
Current Price: {metrics['current_price']:.8f}
24h Change: {metrics['price_change_percent']:.2f}%
Buy/Sell Volume Ratio: {metrics['buy_sell_ratio']:.2f}
VWAP: {metrics['vwap']:.8f}

MARKET STRUCTURE:
Major Support Levels: {', '.join(f'{p:.8f}' for p in metrics['major_supports'])}
Major Resistance Levels: {', '.join(f'{p:.8f}' for p in metrics['major_resistances'])}

SCENARIOS:
Best Case:
- Immediate target: {scenarios['best_case']['target']:.8f} ({scenarios['best_case']['potential_gain']:.1f}%)
- Maximum target: {scenarios['best_case']['max_target']:.8f} ({scenarios['best_case']['max_potential']:.1f}%)

Worst Case:
- Key support: {scenarios['worst_case']['support']:.8f} ({scenarios['worst_case']['potential_loss']:.1f}%)
- Maximum downside: {scenarios['worst_case']['max_loss_level']:.8f} ({scenarios['worst_case']['max_potential_loss']:.1f}%)

STRATEGY RECOMMENDATIONS:

Immediate Term (24-48h):
- Defensive stop-loss: {strategies['immediate']['defensive_stop']:.8f}
- Scalp entry: {strategies['immediate']['scalp_targets']['entry']:.8f}
- Scalp stop: {strategies['immediate']['scalp_targets']['stop']:.8f}
- Scalp target: {strategies['immediate']['scalp_targets']['take_profit']:.8f}

Short Term (1-2 weeks):
- Accumulation zone: {strategies['short_term']['accumulation_zone']['start']:.8f} - {strategies['short_term']['accumulation_zone']['end']:.8f}
- Target: {strategies['short_term']['targets']:.8f}
- Stop loss: {strategies['short_term']['stop_loss']:.8f}

Long Term (1-3 months):
Accumulation levels:
{chr(10).join(f'- Level {i+1}: {price:.8f}' for i, price in enumerate(strategies['long_term']['accumulation_levels']))}
Ultimate target: {strategies['long_term']['ultimate_target']:.8f}

RISK MANAGEMENT:
- Immediate term: 2-3% position size, -3% to -5% stop loss
- Short term: 5-7% position size, -10% to -15% stop loss
- Long term: 10-15% position size, -25% to -30% stop loss

Note: This is an automated analysis. Please conduct your own research and risk assessment before making any trading decisions.
"""
        return report

def analyze_market_data(json_file: str) -> str:
    """Main function to analyze market data and generate report."""
    with open(json_file, 'r') as f:
        analyzer = MarketAnalyzer(f.read())
    return analyzer.generate_report()

# Example usage:
if __name__ == "__main__":
    # with open('exchangescraper/output.log.json', 'r') as f:
    #     raw_data = f.read()
    report = analyze_market_data('exchangescraper/output.log.json')
    print(report)
