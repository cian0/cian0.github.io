from dataclasses import dataclass
from enum import Enum
from typing import Dict, List, Optional
import numpy as np
from datetime import datetime

class MarketType(Enum):
    TRENDING = "trending"
    RANGING = "ranging"
    VOLATILE = "volatile"
    ACCUMULATION = "accumulation"
    DISTRIBUTION = "distribution"

class TimeFrame(Enum):
    SCALP = "scalp"  # 1m-5m
    INTRADAY = "intraday"  # 15m-1h
    SWING = "swing"  # 4h-1d
    POSITION = "position"  # 1d+

@dataclass
class MarketCondition:
    market_type: MarketType
    volatility: float  # 0-1 scale
    trend_strength: float  # 0-1 scale
    volume_profile: float  # 0-1 scale
    timeframe: TimeFrame
    confidence: float  # 0-1 scale
    timestamp: datetime

class MarketAnalysisSystem:
    def __init__(self):
        self.volatility_threshold = 0.6
        self.trend_threshold = 0.7
        self.volume_threshold = 0.5

    def analyze_market_type(self, 
                          price_data: List[float],
                          volume_data: List[float],
                          holder_metrics: Dict,
                          timeframe: TimeFrame) -> MarketCondition:
        """Analyze market type based on multiple indicators."""
        
        # Calculate volatility
        volatility = self._calculate_volatility(price_data)
        
        # Calculate trend strength
        trend_strength = self._calculate_trend_strength(price_data)
        
        # Analyze volume profile
        volume_profile = self._analyze_volume_profile(volume_data)
        
        # Determine market type
        market_type = self._determine_market_type(
            volatility, 
            trend_strength, 
            volume_profile,
            holder_metrics
        )
        
        # Calculate confidence score
        confidence = self._calculate_confidence(
            volatility,
            trend_strength,
            volume_profile,
            holder_metrics
        )
        
        return MarketCondition(
            market_type=market_type,
            volatility=volatility,
            trend_strength=trend_strength,
            volume_profile=volume_profile,
            timeframe=timeframe,
            confidence=confidence,
            timestamp=datetime.now()
        )

    def _calculate_volatility(self, price_data: List[float]) -> float:
        """Calculate normalized volatility score."""
        if len(price_data) < 2:
            return 0.0
            
        returns = np.diff(price_data) / price_data[:-1]
        volatility = np.std(returns)
        
        # Normalize to 0-1 scale
        normalized_vol = min(1.0, volatility * 100)
        return normalized_vol

    def _calculate_trend_strength(self, price_data: List[float]) -> float:
        """Calculate trend strength using linear regression R² value."""
        if len(price_data) < 2:
            return 0.0
            
        x = np.arange(len(price_data))
        y = np.array(price_data)
        
        # Calculate R² value
        correlation_matrix = np.corrcoef(x, y)
        r_squared = correlation_matrix[0,1]**2
        
        return r_squared

    def _analyze_volume_profile(self, volume_data: List[float]) -> float:
        """Analyze volume profile and return normalized score."""
        if not volume_data:
            return 0.0
            
        # Calculate volume trend
        avg_volume = np.mean(volume_data)
        recent_volume = np.mean(volume_data[-5:])  # Last 5 periods
        
        # Normalize to 0-1 scale
        volume_score = min(1.0, recent_volume / avg_volume)
        return volume_score

    def _determine_market_type(self,
                             volatility: float,
                             trend_strength: float,
                             volume_profile: float,
                             holder_metrics: Dict) -> MarketType:
        """Determine market type based on multiple metrics."""
        
        # Check for high volatility first
        if volatility > self.volatility_threshold:
            return MarketType.VOLATILE
            
        # Check for strong trend
        if trend_strength > self.trend_threshold:
            return MarketType.TRENDING
            
        # Check for accumulation/distribution using holder metrics
        if holder_metrics.get('accumulation_pressure', 0) > 0.7:
            return MarketType.ACCUMULATION
        elif holder_metrics.get('accumulation_pressure', 0) < -0.7:
            return MarketType.DISTRIBUTION
            
        # Default to ranging market
        return MarketType.RANGING

    def _calculate_confidence(self,
                            volatility: float,
                            trend_strength: float,
                            volume_profile: float,
                            holder_metrics: Dict) -> float:
        """Calculate confidence score for the market type determination."""
        
        # Weighted average of multiple factors
        weights = {
            'volatility': 0.25,
            'trend': 0.25,
            'volume': 0.25,
            'holder_consensus': 0.25
        }
        
        holder_consensus = holder_metrics.get('whale_consensus', 0)
        
        # Calculate confidence score
        confidence = (
            weights['volatility'] * (1 - abs(volatility - 0.5)) +
            weights['trend'] * trend_strength +
            weights['volume'] * volume_profile +
            weights['holder_consensus'] * abs(holder_consensus)
        )
        
        return min(1.0, max(0.0, confidence))

    def get_optimal_timeframe(self, market_condition: MarketCondition) -> TimeFrame:
        """Determine optimal timeframe based on market condition."""
        
        if market_condition.volatility > 0.8:
            return TimeFrame.SCALP
            
        if market_condition.market_type == MarketType.TRENDING:
            return TimeFrame.SWING if market_condition.trend_strength > 0.8 else TimeFrame.INTRADAY
            
        if market_condition.market_type in [MarketType.ACCUMULATION, MarketType.DISTRIBUTION]:
            return TimeFrame.POSITION
            
        return TimeFrame.INTRADAY  # Default timeframe
