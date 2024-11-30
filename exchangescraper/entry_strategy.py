from dataclasses import dataclass
from typing import List, Dict, Optional
from strategy_selector import StrategyType
from market_analyzer import MarketCondition, TimeFrame

@dataclass
class EntrySignal:
    strategy_type: StrategyType
    entry_price: float
    stop_loss: float
    take_profit: float
    confidence: float
    timeframe: TimeFrame

class SupportResistanceStrategy:
    def __init__(self):
        self.min_level_strength = 0.7
        self.min_price_distance = 0.02  # 2% minimum distance from level
        
    def generate_signals(self,
                        current_price: float,
                        support_levels: List[float],
                        resistance_levels: List[float],
                        market_condition: MarketCondition) -> List[EntrySignal]:
        """Generate entry signals based on S/R levels."""
        signals = []
        
        # Sort levels by distance from current price
        supports = sorted([(s, abs(current_price - s)/current_price) 
                         for s in support_levels], key=lambda x: x[1])
        resistances = sorted([(r, abs(current_price - r)/current_price) 
                            for r in resistance_levels], key=lambda x: x[1])
        
        # Generate bounce signals
        if supports and supports[0][1] < self.min_price_distance:
            # Price near support - potential long entry
            entry = supports[0][0] * 1.005  # Entry 0.5% above support
            stop = supports[0][0] * 0.99    # Stop 1% below support
            target = self._find_resistance_target(current_price, resistances)
            
            signals.append(EntrySignal(
                strategy_type=StrategyType.SUPPORT_RESISTANCE,
                entry_price=entry,
                stop_loss=stop,
                take_profit=target,
                confidence=self._calculate_confidence(
                    current_price, entry, market_condition),
                timeframe=market_condition.timeframe
            ))
            
        if resistances and resistances[0][1] < self.min_price_distance:
            # Price near resistance - potential short entry
            entry = resistances[0][0] * 0.995  # Entry 0.5% below resistance
            stop = resistances[0][0] * 1.01    # Stop 1% above resistance
            target = self._find_support_target(current_price, supports)
            
            signals.append(EntrySignal(
                strategy_type=StrategyType.SUPPORT_RESISTANCE,
                entry_price=entry,
                stop_loss=stop,
                take_profit=target,
                confidence=self._calculate_confidence(
                    current_price, entry, market_condition),
                timeframe=market_condition.timeframe
            ))
            
        return signals
        
    def _find_resistance_target(self,
                              current_price: float,
                              resistances: List[tuple]) -> float:
        """Find next resistance target above current price."""
        for level, distance in resistances:
            if level > current_price:
                return level
        return current_price * 1.1  # Default 10% target
        
    def _find_support_target(self,
                           current_price: float,
                           supports: List[tuple]) -> float:
        """Find next support target below current price."""
        for level, distance in supports:
            if level < current_price:
                return level
        return current_price * 0.9  # Default 10% target
        
    def _calculate_confidence(self,
                            current_price: float,
                            entry_price: float,
                            market_condition: MarketCondition) -> float:
        """Calculate confidence score for the entry signal."""
        # Base confidence on market condition
        base_confidence = market_condition.confidence
        
        # Adjust based on price distance
        price_distance = abs(current_price - entry_price) / current_price
        distance_factor = max(0, 1 - price_distance/self.min_price_distance)
        
        # Adjust based on volatility
        volatility_factor = 1 - market_condition.volatility
        
        # Calculate final confidence
        confidence = (
            base_confidence * 0.4 +
            distance_factor * 0.4 +
            volatility_factor * 0.2
        )
        
        return min(1.0, max(0.0, confidence))
