from dataclasses import dataclass
from typing import Dict, Optional
import numpy as np
from market_analyzer import MarketCondition

@dataclass
class LiquidityMetrics:
    bid_depth: float
    ask_depth: float
    spread: float
    imbalance: float  # positive means more bids than asks

@dataclass
class PositionMetrics:
    base_size: float
    adjusted_size: float
    max_size: float
    confidence: float
    recommended_leverage: float
    risk_score: float

class PositionCalculator:
    def __init__(self):
        self.max_position_size = 0.15  # 15% max position size
        self.min_position_size = 0.01  # 1% min position size
        self.base_leverage = 3.0
        
    def analyze_liquidity(self, orderbook: Dict) -> LiquidityMetrics:
        """Analyze orderbook liquidity"""
        bids = orderbook.get('bids', [])
        asks = orderbook.get('asks', [])
        
        # Calculate depths
        bid_depth = sum(float(bid[1]) for bid in bids[:10])
        ask_depth = sum(float(ask[1]) for ask in asks[:10])
        
        # Calculate spread
        top_bid = float(bids[0][0]) if bids else 0
        top_ask = float(asks[0][0]) if asks else 0
        spread = (top_ask - top_bid) / top_bid if top_bid > 0 else 0
        
        # Calculate imbalance
        imbalance = (bid_depth - ask_depth) / (bid_depth + ask_depth) if (bid_depth + ask_depth) > 0 else 0
        
        return LiquidityMetrics(
            bid_depth=bid_depth,
            ask_depth=ask_depth,
            spread=spread,
            imbalance=imbalance
        )
    
    def calculate_kelly_fraction(self, win_rate: float, risk_reward: float) -> float:
        """Calculate Kelly Criterion fraction"""
        if win_rate <= 0 or risk_reward <= 0:
            return 0
        
        q = 1 - win_rate
        kelly = (win_rate * risk_reward - q) / risk_reward
        return max(0, min(kelly, 0.5))  # Cap at 50% of Kelly
        
    def calculate_position_metrics(self,
                                 market_condition: MarketCondition,
                                 liquidity: LiquidityMetrics,
                                 risk_metrics: Dict,
                                 risk_reward: float = 2.0) -> PositionMetrics:
        """Calculate comprehensive position metrics"""
        
        # Base size from Kelly Criterion
        win_rate = market_condition.confidence
        kelly_size = self.calculate_kelly_fraction(win_rate, risk_reward)
        base_size = kelly_size * self.max_position_size
        
        # Liquidity adjustment
        liquidity_factor = 1.0
        if liquidity.spread > 0.01:  # More than 1% spread
            liquidity_factor *= 0.8
        if abs(liquidity.imbalance) > 0.3:  # Significant imbalance
            liquidity_factor *= 0.9
            
        # Volatility adjustment
        volatility_factor = 1 - (market_condition.volatility * 0.5)
        
        # Holder risk adjustment
        holder_concentration = risk_metrics.get('holder_concentration', 0)
        holder_factor = 1 - (holder_concentration * 0.5)
        
        # Calculate final adjusted size
        adjusted_size = base_size * liquidity_factor * volatility_factor * holder_factor
        
        # Calculate risk score (0-1, higher means more risky)
        risk_score = (
            market_condition.volatility * 0.3 +
            holder_concentration * 0.3 +
            abs(liquidity.imbalance) * 0.2 +
            (liquidity.spread / 0.01) * 0.2  # Normalize spread impact
        )
        
        # Adjust leverage based on risk score
        leverage = self.base_leverage * (1 - risk_score)
        
        return PositionMetrics(
            base_size=base_size,
            adjusted_size=min(adjusted_size, self.max_position_size),
            max_size=self.max_position_size,
            confidence=market_condition.confidence,
            recommended_leverage=leverage,
            risk_score=risk_score
        )
