import json
import pandas as pd
from typing import Dict, List, Tuple
from dataclasses import dataclass
from datetime import datetime
from market_analyzer import MarketAnalysisSystem, MarketType, TimeFrame, MarketCondition
from strategy_selector import StrategySelector, StrategyType, StrategyWeight
from risk_manager import RiskManager, RiskParameters, PositionSize

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
        
        # Initialize analysis systems
        self.market_analysis = MarketAnalysisSystem()
        self.strategy_selector = StrategySelector()
        self.risk_manager = RiskManager()
        
        # Extract price and volume data
        self.price_data = self._extract_price_data()
        self.volume_data = self._extract_volume_data()
        
        # Analyze market conditions
        self.market_condition = self.market_analysis.analyze_market_type(
            self.price_data,
            self.volume_data,
            self.holder_data['risk_metrics'],
            TimeFrame.INTRADAY  # Default timeframe
        )
        
        # Get optimal timeframe
        self.optimal_timeframe = self.market_analysis.get_optimal_timeframe(self.market_condition)
        
    def _extract_price_data(self) -> List[float]:
        """Extract price data from trades."""
        trades = self.market_data.get('trades', [])
        return [float(trade['price']) for trade in trades] if trades else []
        
    def _extract_volume_data(self) -> List[float]:
        """Extract volume data from trades."""
        trades = self.market_data.get('trades', [])
        return [float(trade['amount']) for trade in trades] if trades else []

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
        """Generate position recommendations with risk management."""
        immediate = self.analysis_data['strategies']['immediate']
        short_term = self.analysis_data['strategies']['short_term']
        long_term = self.analysis_data['strategies']['long_term']
        
        # Get risk parameters for each timeframe
        conservative_risk = self.risk_manager.calculate_risk_parameters(
            float(immediate['scalp_targets']['entry']),
            self.market_condition,
            self.holder_data['risk_metrics']
        )
        
        conservative_size = self.risk_manager.calculate_position_size(
            self.market_condition,
            self.holder_data['risk_metrics'],
            StrategyType.SCALPING,
            self.market_data['orderbook']
        )
        
        positions = {
            'conservative': MarketPosition(
                entry=float(immediate['scalp_targets']['entry']),
                stop_loss=float(immediate['scalp_targets']['entry']) * (1 - conservative_risk.stop_loss_percentage),
                take_profit=float(immediate['scalp_targets']['entry']) * (1 + conservative_risk.take_profit_percentage),
                position_size=f"{conservative_size.percentage*100:.1f}% (max leverage: {conservative_size.recommended_leverage:.1f}x)",
                risk_reward=conservative_risk.risk_reward_ratio,
                max_drawdown=conservative_risk.max_drawdown
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
        
        # Add market condition analysis
        market_analysis = f"""
Market Condition Analysis:
------------------------
Market Type: {self.market_condition.market_type.value}
Volatility Score: {self.market_condition.volatility:.2%}
Trend Strength: {self.market_condition.trend_strength:.2%}
Volume Profile: {self.market_condition.volume_profile:.2%}
Optimal Timeframe: {self.optimal_timeframe.value}
Analysis Confidence: {self.market_condition.confidence:.2%}
Timestamp: {self.market_condition.timestamp}
"""
        
        # Get strategy recommendations
        strategies = self.strategy_selector.select_strategy(
            self.market_condition,
            self.holder_data['risk_metrics']
        )
        
        # Format strategy recommendations
        strategy_analysis = "\nStrategy Recommendations:\n"
        strategy_analysis += "-" * 25 + "\n"
        for strat in strategies:
            strategy_analysis += f"""
Strategy: {strat.strategy_type.value}
Weight: {strat.weight:.2%}
Confidence: {strat.confidence:.2%}
Timeframe: {strat.timeframe.value}
"""
        
        report = f"""
Market Analysis Report - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
=================================================================

{market_analysis}

{strategy_analysis}

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
