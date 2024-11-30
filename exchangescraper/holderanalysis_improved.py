import requests
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Optional
from dataclasses import dataclass
import matplotlib.pyplot as plt
from scipy import stats

@dataclass
class HolderMetrics:
    accumulation_score: float  # -1 to 1, where 1 is heavy accumulation
    volatility_score: float   # 0 to 1, where 1 is highly volatile
    holding_pattern: str      # 'accumulating', 'distributing', 'hodling'
    avg_transaction_size: float
    transaction_frequency: float
    whale_correlation: float  # correlation with other whale movements

class EnhancedKaspaAnalyzer:
    def __init__(self):
        self.base_url = "https://api.kaspa.org"
        self.session = requests.Session()
        self.KAS_DECIMALS = 100000000
        self.market_data = {}

    # def __init__(self):
    #     self.base_url = "https://api.kaspa.org"
    #     self.session = requests.Session()
    #     self.KAS_DECIMALS = 100000000  # 10^8 conversion factor
        
    def get_address_transactions(self, address, limit=50, offset=0):
        try:
            url = f"{self.base_url}/addresses/{address}/full-transactions"
            params = {
                'limit': limit,
                'offset': offset,
                'resolve_previous_outpoints': 'light'
            }
            
            response = self.session.get(url, params=params)
            response.raise_for_status()
            transactions = response.json()
            
            return self.process_transactions(transactions)
            
        except Exception as e:
            print(f"Error fetching transactions for {address}: {e}")
            return None

    def process_transactions(self, transactions):
        if not transactions:
            return pd.DataFrame()
            
        processed_txs = []
        for tx in transactions:
            try:
                total_input = sum(float(inp.get('previous_outpoint_amount', 0)) for inp in tx.get('inputs', []))
                outputs = tx.get('outputs', [])
                
                # Sort outputs by amount to identify the actual transfer vs change
                sorted_outputs = sorted(outputs, key=lambda x: float(x.get('amount', 0)))
                
                # If there's more than one output, typically the smaller one is the actual transfer
                # and the larger one is change back to sender
                actual_transfer = float(sorted_outputs[0]['amount']) if outputs else 0
                
                processed_tx = {
                    'transaction_id': tx['transaction_id'],
                    'block_time': datetime.fromtimestamp(int(tx['block_time'])/1000),
                    'block_blue_score': int(tx['accepting_block_blue_score']),
                    'is_accepted': tx['is_accepted'],
                    'mass': int(tx['mass']) if tx.get('mass') else 0,
                    'inputs_count': len(tx.get('inputs', [])),
                    'outputs_count': len(outputs),
                    'total_input': total_input / self.KAS_DECIMALS,
                    'total_output': sum(float(out.get('amount', 0)) for out in outputs) / self.KAS_DECIMALS,
                    'actual_transfer': actual_transfer / self.KAS_DECIMALS,
                    'fee': (total_input - sum(float(out.get('amount', 0)) for out in outputs)) / self.KAS_DECIMALS
                }
                
                # Process detailed outputs
                outputs_detail = []
                for out in outputs:
                    amount = float(out.get('amount', 0)) / self.KAS_DECIMALS
                    address = out.get('script_public_key_address')
                    outputs_detail.append({
                        'amount': amount,
                        'address': address,
                        'is_change': amount > actual_transfer / self.KAS_DECIMALS  # Identify change output
                    })
                processed_tx['outputs_detail'] = outputs_detail
                
                processed_txs.append(processed_tx)
                
            except (ValueError, TypeError) as e:
                print(f"Error processing transaction {tx.get('transaction_id')}: {e}")
                continue
            
        df = pd.DataFrame(processed_txs)
        
        # Ensure numeric types
        numeric_columns = ['mass', 'total_input', 'total_output', 'actual_transfer', 'fee', 'block_blue_score']
        for col in numeric_columns:
            df[col] = pd.to_numeric(df[col], errors='coerce')
            
        return df
    
    def calculate_holder_behavior(self, df: pd.DataFrame) -> HolderMetrics:
        """Calculate sophisticated holder behavior metrics."""
        if df.empty:
            return None
            
        # Calculate accumulation score
        recent_window = df.sort_values('block_time', ascending=False).head(10)
        net_flow = recent_window['actual_transfer'].sum()
        total_volume = recent_window['total_output'].sum()
        accumulation_score = net_flow / total_volume if total_volume != 0 else 0
        
        # Calculate volatility score
        volatility = df['actual_transfer'].std() / df['actual_transfer'].mean() if len(df) > 1 else 0
        volatility_score = min(1, volatility)
        
        # Determine holding pattern
        recent_pattern = self._analyze_holding_pattern(df)
        
        # Calculate transaction metrics
        avg_tx_size = df['actual_transfer'].mean()
        
        # Calculate transaction frequency with error handling
        time_diff = df['block_time'].max() - df['block_time'].min()
        if time_diff.total_seconds() == 0:
            tx_frequency = 0  # If all transactions happened at the same time
        else:
            tx_frequency = len(df) / (time_diff.days + 1)  # Add 1 to avoid division by zero
        
        # Calculate whale correlation
        whale_corr = self._calculate_whale_correlation(df)
        
        return HolderMetrics(
            accumulation_score=accumulation_score,
            volatility_score=volatility_score,
            holding_pattern=recent_pattern,
            avg_transaction_size=avg_tx_size,
            transaction_frequency=tx_frequency,
            whale_correlation=whale_corr
        )
    
    def _analyze_holding_pattern(self, df: pd.DataFrame) -> str:
        """Analyze the holding pattern based on transaction history."""
        df = df.sort_values('block_time')
        
        # Calculate moving averages
        df['ma_7'] = df['actual_transfer'].rolling(7).mean()
        df['ma_30'] = df['actual_transfer'].rolling(30).mean()
        
        if len(df) < 30:
            return 'insufficient_data'
            
        recent_ma7 = df['ma_7'].iloc[-1]
        recent_ma30 = df['ma_30'].iloc[-1]
        
        if recent_ma7 > recent_ma30 * 1.1:
            return 'accumulating'
        elif recent_ma7 < recent_ma30 * 0.9:
            return 'distributing'
        else:
            return 'hodling'
    
    def _calculate_whale_correlation(self, df: pd.DataFrame) -> float:
        """Calculate correlation with typical whale behavior patterns."""
        # This would normally correlate with other whale addresses
        # For now, using a simplified metric based on transaction sizes
        large_tx_ratio = len(df[df['actual_transfer'] > df['actual_transfer'].mean()]) / len(df)
        return large_tx_ratio

    def analyze_holder_risk(self, holder_metrics: List[HolderMetrics]) -> Dict:
        """Analyze collective holder behavior for risk assessment."""
        accumulation_scores = [h.accumulation_score for h in holder_metrics if h]
        volatility_scores = [h.volatility_score for h in holder_metrics if h]
        
        risk_metrics = {
            'holder_concentration': self._calculate_holder_concentration(holder_metrics),
            'accumulation_pressure': np.mean(accumulation_scores) if accumulation_scores else 0,
            'collective_volatility': np.mean(volatility_scores) if volatility_scores else 0,
            'whale_consensus': self._calculate_whale_consensus(holder_metrics)
        }
        
        return risk_metrics
    
    def _calculate_holder_concentration(self, holder_metrics: List[HolderMetrics]) -> float:
        """Calculate holder concentration (Herfindahl-Hirschman Index adapted)."""
        if not holder_metrics:
            return 0
        
        tx_sizes = [h.avg_transaction_size for h in holder_metrics if h]
        total_size = sum(tx_sizes)
        
        if total_size == 0:
            return 0
            
        market_shares = [size/total_size for size in tx_sizes]
        hhi = sum(share * share for share in market_shares)
        
        return hhi

    def _calculate_whale_consensus(self, holder_metrics: List[HolderMetrics]) -> float:
        """Calculate degree of consensus among whale behavior."""
        if not holder_metrics:
            return 0
            
        patterns = [h.holding_pattern for h in holder_metrics if h]
        if not patterns:
            return 0
            
        accumulating = patterns.count('accumulating') / len(patterns)
        distributing = patterns.count('distributing') / len(patterns)
        
        # Return consensus score (-1 to 1, where 1 is strong accumulation consensus)
        return accumulating - distributing

    def generate_holder_analysis_report(self, addresses: List[str]) -> Dict:
        """Generate comprehensive holder analysis report."""
        holder_metrics = []
        detailed_metrics = {}
        
        for address in addresses:
            df = self.get_address_transactions(address)
            if df is not None and not df.empty:
                metrics = self.calculate_holder_behavior(df)
                holder_metrics.append(metrics)
                detailed_metrics[address] = metrics
        
        risk_metrics = self.analyze_holder_risk(holder_metrics)
        
        report = {
            'risk_metrics': risk_metrics,
            'holder_metrics': detailed_metrics,
            'market_signals': self._generate_market_signals(risk_metrics, holder_metrics)
        }
        
        return report

    def _generate_market_signals(self, risk_metrics: Dict, holder_metrics: List[HolderMetrics]) -> Dict:
        """Generate actionable market signals based on holder analysis."""
        signals = {
            'accumulation_signal': self._calculate_accumulation_signal(risk_metrics, holder_metrics),
            'volatility_warning': self._calculate_volatility_warning(risk_metrics, holder_metrics),
            'whale_movement_alert': self._calculate_whale_alert(holder_metrics),
            'market_strength': self._calculate_market_strength(risk_metrics)
        }
        
        return signals

    def _calculate_accumulation_signal(self, risk_metrics: Dict, holder_metrics: List[HolderMetrics]) -> Dict:
        """Calculate accumulation signal strength."""
        accumulation_pressure = risk_metrics.get('accumulation_pressure', 0)
        whale_consensus = risk_metrics.get('whale_consensus', 0)
        
        signal_strength = (accumulation_pressure + whale_consensus) / 2
        
        return {
            'signal': 'accumulate' if signal_strength > 0.3 else 'hold' if signal_strength > -0.3 else 'distribute',
            'strength': abs(signal_strength),
            'confidence': min(1, abs(whale_consensus) * 2)
        }

    def _calculate_volatility_warning(self, risk_metrics: Dict, holder_metrics: List[HolderMetrics]) -> Dict:
        """Calculate volatility warning level."""
        collective_volatility = risk_metrics.get('collective_volatility', 0)
        concentration = risk_metrics.get('holder_concentration', 0)
        
        warning_level = (collective_volatility + concentration) / 2
        
        return {
            'level': warning_level,
            'risk_category': 'high' if warning_level > 0.7 else 'medium' if warning_level > 0.3 else 'low',
            'volatility_trend': 'increasing' if collective_volatility > 0.5 else 'stable'
        }

    def _calculate_whale_alert(self, holder_metrics: List[HolderMetrics]) -> Dict:
        """Generate whale movement alerts."""
        if not holder_metrics:
            return {'alert_level': 'none', 'movement_type': None}
            
        active_whales = sum(1 for h in holder_metrics if h and h.transaction_frequency > 0.5)
        total_whales = len([h for h in holder_metrics if h])
        
        if total_whales == 0:
            return {'alert_level': 'none', 'movement_type': None}
            
        whale_activity_ratio = active_whales / total_whales
        
        return {
            'alert_level': 'high' if whale_activity_ratio > 0.3 else 'medium' if whale_activity_ratio > 0.1 else 'low',
            'movement_type': 'accumulation' if sum(h.accumulation_score > 0 for h in holder_metrics if h) > total_whales/2 else 'distribution',
            'activity_ratio': whale_activity_ratio
        }

    def _calculate_market_strength(self, risk_metrics: Dict) -> Dict:
        """Calculate overall market strength indicator."""
        if not risk_metrics:
            return {'strength': 0, 'confidence': 0}
            
        accumulation = risk_metrics.get('accumulation_pressure', 0)
        concentration = risk_metrics.get('holder_concentration', 0)
        consensus = risk_metrics.get('whale_consensus', 0)
        
        strength = (accumulation + (1-concentration) + consensus) / 3
        confidence = min(1, abs(consensus) * (1-concentration))
        
        return {
            'strength': strength,
            'confidence': confidence,
            'market_phase': 'accumulation' if strength > 0.3 else 'distribution' if strength < -0.3 else 'consolidation',
            'suggested_position': 'aggressive' if strength > 0.5 else 'conservative' if strength < -0.5 else 'neutral'
        }

def get_wadu_top_holders():
    """Fetch top WADU token holders from KAS API"""
    try:
        url = "https://api-v2-do.kas.fyi/token/krc20/WADU/info"
        params = {
            "includeCharts": "false",
            "interval": "1d"
        }
        response = requests.get(url, params=params)
        response.raise_for_status()
        data = response.json()
        
        # Extract holder addresses from the response
        holders = []
        if "holders" in data:
            holders = [holder["address"] for holder in data["holders"]]
            
        return holders[:10]  # Return top 10 holders
    except Exception as e:
        print(f"Error fetching WADU holders: {e}")
        return []

def main():
    analyzer = EnhancedKaspaAnalyzer()
    
    # Fetch top WADU token holders
    top_holders = get_wadu_top_holders()
    if not top_holders:
        print("Failed to fetch top holders, using default addresses")
        top_holders = [
            "kaspa:qr5lj3uyfvduuhy38wwnl8942t4ckznjsma3pgnsc552qmpdga4959pae88u0"
        ]
    
    print("Generating comprehensive holder analysis...")
    analysis = analyzer.generate_holder_analysis_report(top_holders)
    
    print("\nMarket Analysis Report")
    print("=" * 50)
    
    print("\nRisk Metrics:")
    for metric, value in analysis['risk_metrics'].items():
        print(f"{metric}: {value:.4f}")
    
    print("\nMarket Signals:")
    for signal, data in analysis['market_signals'].items():
        print(f"\n{signal}:")
        for key, value in data.items():
            print(f"  {key}: {value}")

if __name__ == "__main__":
    main()
