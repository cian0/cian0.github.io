import json
import pandas as pd
from typing import Dict, List, Tuple
from dataclasses import dataclass
from datetime import datetime

@dataclass
class MarketPosition:
    entry: float
    stop_loss: float
    take_profit: float
    position_size: str
    risk_reward: float
    max_drawdown: float

class MarketAnalyzer:
    def __init__(self, analysis_path: str, holder_path: str, market_data_path: str):
        """Initialize the market analyzer with paths to JSON files."""
        with open(analysis_path, 'r') as f:
            self.analysis_data = json.load(f)
        with open(holder_path, 'r') as f:
            self.holder_data = json.load(f)
        with open(market_data_path, 'r') as f:
            self.market_data = json.load(f)
        
        self.current_price = float(self.market_data['ticker']['result']['lastPrice'])
        self.volume_24h = float(self.market_data['ticker']['result']['volume'])

    def calculate_market_metrics(self) -> Dict:
        """Calculate key market metrics."""
        market_status = self.analysis_data['market_status']
        market_structure = self.analysis_data['market_structure']
        
        return {
            'current_price': self.current_price,
            'price_change_24h': market_status['price_change_24h'],
            'buy_sell_ratio': market_status['buy_sell_ratio'],
            'vwap': market_status['vwap'],
            'support_levels': market_structure['support_levels'],
            'resistance_levels': market_structure['resistance_levels']
        }

    def analyze_risk_profile(self) -> Dict:
        """Analyze market risk profile."""
        volatility = self.holder_data['market_signals']['volatility_warning']
        whale_movement = self.holder_data['market_signals']['whale_movement_alert']
        market_strength = self.holder_data['market_signals']['market_strength']
        
        return {
            'risk_level': volatility['risk_category'],
            'volatility_trend': volatility['volatility_trend'],
            'whale_activity': whale_movement['movement_type'],
            'market_strength': market_strength['strength'],
            'market_confidence': market_strength['confidence']
        }

    def generate_positions(self) -> Dict[str, MarketPosition]:
        """Generate position recommendations."""
        immediate = self.analysis_data['strategies']['immediate']
        short_term = self.analysis_data['strategies']['short_term']
        long_term = self.analysis_data['strategies']['long_term']
        
        positions = {
            'conservative': MarketPosition(
                entry=float(immediate['scalp_targets']['entry']),
                stop_loss=float(immediate['scalp_targets']['stop']),
                take_profit=float(immediate['scalp_targets']['take_profit']),
                position_size="2-3%",
                risk_reward=self._calculate_risk_reward(
                    float(immediate['scalp_targets']['entry']),
                    float(immediate['scalp_targets']['stop']),
                    float(immediate['scalp_targets']['take_profit'])
                ),
                max_drawdown=self._calculate_drawdown(
                    float(immediate['scalp_targets']['entry']),
                    float(immediate['scalp_targets']['stop'])
                )
            ),
            'moderate': MarketPosition(
                entry=float(short_term['accumulation_zone']['start']),
                stop_loss=float(short_term['stop_loss']),
                take_profit=float(short_term['targets']),
                position_size="5-7%",
                risk_reward=self._calculate_risk_reward(
                    float(short_term['accumulation_zone']['start']),
                    float(short_term['stop_loss']),
                    float(short_term['targets'])
                ),
                max_drawdown=self._calculate_drawdown(
                    float(short_term['accumulation_zone']['start']),
                    float(short_term['stop_loss'])
                )
            ),
            'aggressive': MarketPosition(
                entry=float(long_term['accumulation_levels'][0]),
                stop_loss=float(short_term['stop_loss']),
                take_profit=float(long_term['ultimate_target']),
                position_size="10-15%",
                risk_reward=self._calculate_risk_reward(
                    float(long_term['accumulation_levels'][0]),
                    float(short_term['stop_loss']),
                    float(long_term['ultimate_target'])
                ),
                max_drawdown=self._calculate_drawdown(
                    float(long_term['accumulation_levels'][0]),
                    float(short_term['stop_loss'])
                )
            )
        }
        
        return positions

    def analyze_holder_behavior(self) -> Dict:
        """Analyze holder behavior and concentration."""
        risk_metrics = self.holder_data['risk_metrics']
        accumulation_signal = self.holder_data['market_signals']['accumulation_signal']
        
        return {
            'holder_concentration': risk_metrics['holder_concentration'],
            'accumulation_pressure': risk_metrics['accumulation_pressure'],
            'whale_consensus': risk_metrics['whale_consensus'],
            'signal': accumulation_signal['signal'],
            'signal_strength': accumulation_signal['strength'],
            'signal_confidence': accumulation_signal['confidence']
        }

    def generate_market_report(self) -> str:
        """Generate a comprehensive market report."""
        metrics = self.calculate_market_metrics()
        risk = self.analyze_risk_profile()
        positions = self.generate_positions()
        holder_analysis = self.analyze_holder_behavior()
        
        report = f"""
Market Analysis Report - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
=================================================================

Current Market Status:
---------------------
Price: ${metrics['current_price']:.8f}
24h Change: {metrics['price_change_24h']}%
Buy/Sell Ratio: {metrics['buy_sell_ratio']:.2f}
VWAP: ${metrics['vwap']:.8f}

Risk Assessment:
--------------
Risk Level: {risk['risk_level'].upper()}
Volatility Trend: {risk['volatility_trend']}
Whale Activity: {risk['whale_activity']}
Market Strength: {risk['market_strength']:.2%}
Market Confidence: {risk['market_confidence']:.2%}

Position Recommendations:
----------------------
1. Conservative Position:
   Entry: ${positions['conservative'].entry:.8f}
   Stop Loss: ${positions['conservative'].stop_loss:.8f}
   Take Profit: ${positions['conservative'].take_profit:.8f}
   Position Size: {positions['conservative'].position_size}
   Risk/Reward: {positions['conservative'].risk_reward:.2f}
   Max Drawdown: {positions['conservative'].max_drawdown:.2%}

2. Moderate Position:
   Entry: ${positions['moderate'].entry:.8f}
   Stop Loss: ${positions['moderate'].stop_loss:.8f}
   Take Profit: ${positions['moderate'].take_profit:.8f}
   Position Size: {positions['moderate'].position_size}
   Risk/Reward: {positions['moderate'].risk_reward:.2f}
   Max Drawdown: {positions['moderate'].max_drawdown:.2%}

3. Aggressive Position:
   Entry: ${positions['aggressive'].entry:.8f}
   Stop Loss: ${positions['aggressive'].stop_loss:.8f}
   Take Profit: ${positions['aggressive'].take_profit:.8f}
   Position Size: {positions['aggressive'].position_size}
   Risk/Reward: {positions['aggressive'].risk_reward:.2f}
   Max Drawdown: {positions['aggressive'].max_drawdown:.2%}

Holder Analysis:
--------------
Holder Concentration: {holder_analysis['holder_concentration']:.2%}
Accumulation Pressure: {holder_analysis['accumulation_pressure']:.2%}
Whale Consensus: {holder_analysis['whale_consensus']:.2f}
Current Signal: {holder_analysis['signal'].upper()}
Signal Strength: {holder_analysis['signal_strength']:.2%}
Signal Confidence: {holder_analysis['signal_confidence']:.2%}

Key Levels:
----------
Support Levels: {', '.join([f'${x:.8f}' for x in metrics['support_levels']])}
Resistance Levels: {', '.join([f'${x:.8f}' for x in metrics['resistance_levels']])}
"""
        return report

    def _calculate_risk_reward(self, entry: float, stop: float, target: float) -> float:
        """Calculate risk/reward ratio."""
        risk = abs(entry - stop)
        reward = abs(target - entry)
        return reward / risk if risk != 0 else 0

    def _calculate_drawdown(self, entry: float, stop: float) -> float:
        """Calculate maximum drawdown percentage."""
        return (stop - entry) / entry if entry != 0 else 0

def main():
    """Main function to run the analysis."""
    # Initialize analyzer with file paths
    analyzer = MarketAnalyzer(
        'exchangescraper/output/wadu_usdt_20241130_221044_analysis.json',
        'exchangescraper/output/wadu_usdt_20241130_221044_holder_analysis.json',
        'exchangescraper/output/wadu_usdt_20241130_221044_market_data.json'
    )
    
    # Generate and print report
    report = analyzer.generate_market_report()
    print(report)
    
    # Optionally save to file
    with open('exchangescraper/output/market_analysis_report.txt', 'w') as f:
        f.write(report)

if __name__ == "__main__":
    main()