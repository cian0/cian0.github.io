from dataclasses import dataclass
from typing import Dict, Optional
from enum import Enum
from market_analyzer import MarketCondition, MarketType
from strategy_selector import StrategyType

class RiskLevel(Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"

@dataclass
class PositionSize:
    percentage: float  # Account percentage to risk
    max_leverage: float  # Maximum allowed leverage
    recommended_leverage: float  # Recommended leverage based on risk

@dataclass
class RiskParameters:
    max_position_size: float
    stop_loss_percentage: float
    take_profit_percentage: float
    max_drawdown: float
    risk_reward_ratio: float

class RiskManager:
    def __init__(self):
        self.max_risk_per_trade = 0.02  # 2% max risk per trade
        self.max_account_risk = 0.15    # 15% max total account risk
        self.min_risk_reward = 2.0      # Minimum risk/reward ratio
        
    def calculate_position_size(self,
                              market_condition: MarketCondition,
                              holder_metrics: Dict,
                              strategy_type: StrategyType) -> PositionSize:
        """Calculate safe position size based on market conditions and holder metrics."""
        
        # Base position size on market type and volatility
        base_size = self._get_base_position_size(market_condition.market_type)
        
        # Adjust for volatility
        volatility_factor = 1 - market_condition.volatility
        
        # Adjust for holder concentration
        holder_factor = 1 - holder_metrics.get('holder_concentration', 0)
        
        # Adjust for whale consensus
        whale_factor = abs(holder_metrics.get('whale_consensus', 0))
        
        # Calculate final position size
        adjusted_size = base_size * volatility_factor * holder_factor * (1 + whale_factor)
        
        # Calculate leverage recommendations
        max_leverage = self._calculate_max_leverage(market_condition, holder_metrics)
        recommended_leverage = max_leverage * 0.7  # 70% of max as recommended
        
        return PositionSize(
            percentage=min(adjusted_size, self.max_risk_per_trade),
            max_leverage=max_leverage,
            recommended_leverage=recommended_leverage
        )
        
    def calculate_risk_parameters(self,
                                entry_price: float,
                                market_condition: MarketCondition,
                                holder_metrics: Dict) -> RiskParameters:
        """Calculate risk parameters based on market conditions."""
        
        # Base stop loss on volatility and market type
        base_stop = self._calculate_base_stop_loss(market_condition)
        
        # Adjust stop loss for holder metrics
        volatility_warning = holder_metrics.get('collective_volatility', 0)
        adjusted_stop = base_stop * (1 + volatility_warning)
        
        # Calculate take profit based on risk/reward ratio
        take_profit = adjusted_stop * self.min_risk_reward
        
        # Adjust for market strength
        market_strength = holder_metrics.get('market_strength', {}).get('strength', 0)
        if market_strength > 0.7:
            take_profit *= 1.2  # Increase target in strong markets
        
        return RiskParameters(
            max_position_size=self.max_risk_per_trade,
            stop_loss_percentage=adjusted_stop,
            take_profit_percentage=take_profit,
            max_drawdown=self._calculate_max_drawdown(holder_metrics),
            risk_reward_ratio=take_profit/adjusted_stop if adjusted_stop > 0 else 0
        )
        
    def _get_base_position_size(self, market_type: MarketType) -> float:
        """Get base position size based on market type."""
        position_sizes = {
            MarketType.TRENDING: 0.02,
            MarketType.RANGING: 0.015,
            MarketType.VOLATILE: 0.01,
            MarketType.ACCUMULATION: 0.02,
            MarketType.DISTRIBUTION: 0.01
        }
        return position_sizes.get(market_type, 0.01)
        
    def _calculate_base_stop_loss(self, market_condition: MarketCondition) -> float:
        """Calculate base stop loss percentage."""
        if market_condition.market_type == MarketType.VOLATILE:
            return 0.05  # 5% for volatile markets
        elif market_condition.market_type == MarketType.TRENDING:
            return 0.03  # 3% for trending markets
        return 0.04  # 4% default
        
    def _calculate_max_leverage(self,
                              market_condition: MarketCondition,
                              holder_metrics: Dict) -> float:
        """Calculate maximum safe leverage based on conditions."""
        # Start with base leverage
        base_leverage = 3.0
        
        # Adjust for volatility
        volatility_factor = 1 - market_condition.volatility
        
        # Adjust for holder concentration
        concentration = holder_metrics.get('holder_concentration', 0)
        concentration_factor = 1 - concentration
        
        # Adjust for market type
        market_type_multipliers = {
            MarketType.TRENDING: 1.2,
            MarketType.RANGING: 1.0,
            MarketType.VOLATILE: 0.7,
            MarketType.ACCUMULATION: 1.1,
            MarketType.DISTRIBUTION: 0.8
        }
        
        market_multiplier = market_type_multipliers.get(market_condition.market_type, 1.0)
        
        # Calculate final leverage
        max_leverage = (
            base_leverage *
            volatility_factor *
            concentration_factor *
            market_multiplier
        )
        
        return min(max_leverage, 5.0)  # Cap at 5x leverage
        
    def _calculate_max_drawdown(self, holder_metrics: Dict) -> float:
        """Calculate maximum allowable drawdown."""
        # Base max drawdown
        base_drawdown = 0.15  # 15%
        
        # Adjust for holder metrics
        volatility = holder_metrics.get('collective_volatility', 0)
        concentration = holder_metrics.get('holder_concentration', 0)
        
        # Reduce max drawdown for higher risk metrics
        adjusted_drawdown = base_drawdown * (1 - (volatility + concentration)/4)
        
        return max(0.05, min(base_drawdown, adjusted_drawdown))
