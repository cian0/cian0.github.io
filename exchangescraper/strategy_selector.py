from dataclasses import dataclass
from enum import Enum
from typing import Dict, List, Optional
from market_analyzer import MarketType, TimeFrame, MarketCondition

class StrategyType(Enum):
    SCALPING = "scalping"
    MOMENTUM = "momentum" 
    MEAN_REVERSION = "mean_reversion"
    BREAKOUT = "breakout"
    ACCUMULATION = "accumulation"
    SUPPORT_RESISTANCE = "support_resistance"

@dataclass
class StrategyWeight:
    strategy_type: StrategyType
    weight: float  # 0-1 scale
    confidence: float  # 0-1 scale
    timeframe: TimeFrame

class StrategySelector:
    def __init__(self):
        self.strategy_weights = {
            MarketType.TRENDING: {
                StrategyType.MOMENTUM: 0.6,
                StrategyType.BREAKOUT: 0.3,
                StrategyType.MEAN_REVERSION: 0.1
            },
            MarketType.RANGING: {
                StrategyType.MEAN_REVERSION: 0.5,
                StrategyType.SUPPORT_RESISTANCE: 0.3,
                StrategyType.SCALPING: 0.1,
                StrategyType.MOMENTUM: 0.1
            },
            MarketType.VOLATILE: {
                StrategyType.SCALPING: 0.5,
                StrategyType.BREAKOUT: 0.3,
                StrategyType.MOMENTUM: 0.2
            },
            MarketType.ACCUMULATION: {
                StrategyType.ACCUMULATION: 0.6,
                StrategyType.MEAN_REVERSION: 0.3,
                StrategyType.SCALPING: 0.1
            },
            MarketType.DISTRIBUTION: {
                StrategyType.MEAN_REVERSION: 0.5,
                StrategyType.SCALPING: 0.3,
                StrategyType.BREAKOUT: 0.2
            }
        }

    def select_strategy(self, 
                       market_condition: MarketCondition,
                       risk_metrics: Dict) -> List[StrategyWeight]:
        """Select and weight strategies based on market conditions and risk metrics."""
        
        # Get base weights for market type
        base_weights = self.strategy_weights[market_condition.market_type]
        
        # Adjust weights based on market conditions
        adjusted_weights = self._adjust_weights(
            base_weights,
            market_condition,
            risk_metrics
        )
        
        # Convert to StrategyWeight objects
        strategy_weights = [
            StrategyWeight(
                strategy_type=strategy,
                weight=weight,
                confidence=self._calculate_confidence(
                    strategy,
                    market_condition,
                    risk_metrics
                ),
                timeframe=market_condition.timeframe
            )
            for strategy, weight in adjusted_weights.items()
        ]
        
        # Sort by weight descending
        return sorted(strategy_weights, key=lambda x: x.weight, reverse=True)

    def _adjust_weights(self,
                       base_weights: Dict[StrategyType, float],
                       market_condition: MarketCondition,
                       risk_metrics: Dict) -> Dict[StrategyType, float]:
        """Adjust strategy weights based on market conditions and risk metrics."""
        
        adjusted = base_weights.copy()
        
        # Adjust for volatility
        if market_condition.volatility > 0.7:
            adjusted[StrategyType.SCALPING] = adjusted.get(StrategyType.SCALPING, 0) + 0.2
            adjusted[StrategyType.MOMENTUM] = adjusted.get(StrategyType.MOMENTUM, 0) - 0.1
            
        # Adjust for trend strength
        if market_condition.trend_strength > 0.7:
            adjusted[StrategyType.MOMENTUM] = adjusted.get(StrategyType.MOMENTUM, 0) + 0.2
            adjusted[StrategyType.MEAN_REVERSION] = adjusted.get(StrategyType.MEAN_REVERSION, 0) - 0.1
            
        # Adjust for holder concentration
        holder_concentration = risk_metrics.get('holder_concentration', 0)
        if holder_concentration > 0.7:
            adjusted[StrategyType.ACCUMULATION] = adjusted.get(StrategyType.ACCUMULATION, 0) + 0.2
            
        # Normalize weights to sum to 1
        total = sum(adjusted.values())
        return {k: v/total for k, v in adjusted.items()}

    def _calculate_confidence(self,
                            strategy: StrategyType,
                            market_condition: MarketCondition,
                            risk_metrics: Dict) -> float:
        """Calculate confidence score for a specific strategy."""
        
        base_confidence = market_condition.confidence
        
        # Adjust confidence based on strategy-specific factors
        if strategy == StrategyType.MOMENTUM:
            base_confidence *= market_condition.trend_strength
            
        elif strategy == StrategyType.MEAN_REVERSION:
            base_confidence *= (1 - market_condition.trend_strength)
            
        elif strategy == StrategyType.SCALPING:
            base_confidence *= market_condition.volatility
            
        elif strategy == StrategyType.BREAKOUT:
            base_confidence *= market_condition.volume_profile
            
        elif strategy == StrategyType.ACCUMULATION:
            base_confidence *= risk_metrics.get('accumulation_pressure', 0)
            
        return min(1.0, max(0.0, base_confidence))
