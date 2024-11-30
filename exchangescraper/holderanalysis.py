import requests
import pandas as pd
from datetime import datetime
import time
import json

class KaspaAnalyzer:
    def __init__(self):
        self.base_url = "https://api.kaspa.org"
        self.session = requests.Session()
        self.KAS_DECIMALS = 100000000  # 10^8 conversion factor
        
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

    def analyze_address_transactions(self, address, days_back=30):
        df = self.get_address_transactions(address)
        
        if df is None or df.empty:
            print(f"No transactions found for {address}")
            return
        
        print(f"\nTransaction Analysis for {address}")
        print("="*50)
        print(f"Total transactions analyzed: {len(df)}")
        print(f"First transaction: {df['block_time'].min()}")
        print(f"Last transaction: {df['block_time'].max()}")
        
        if df['mass'].notna().any():
            print(f"Average transaction mass: {df['mass'].mean():.2f}")
        
        if df['fee'].notna().any():
            print(f"Average fee: {df['fee'].mean():.8f} KAS")
        
        print("\nTransaction Patterns:")
        print("-"*30)
        print(f"Average actual transfer: {df['actual_transfer'].mean():.8f} KAS")
        print(f"Total volume transferred: {df['actual_transfer'].sum():.8f} KAS")
        print(f"Largest transfer: {df['actual_transfer'].max():.8f} KAS")
        print(f"Smallest transfer: {df['actual_transfer'].min():.8f} KAS")
        
        # Print recent transactions
        print("\nRecent Transactions:")
        print("-"*30)
        recent_txs = df.sort_values('block_time', ascending=False).head(5)
        for _, tx in recent_txs.iterrows():
            print(f"ID: {tx['transaction_id']}")
            print(f"Time: {tx['block_time']}")
            print(f"Actual transfer amount: {tx['actual_transfer']:.8f} KAS")
            print("Outputs:")
            for output in tx['outputs_detail']:
                print(f"  {'(CHANGE) ' if output['is_change'] else ''}{output['amount']:.8f} KAS to {output['address']}")
            print("-"*30)

def main():
    analyzer = KaspaAnalyzer()
    address = "kaspa:qz9z99fck3kxx3mpawh30h3x3h5zdmxdjefagyw34uzngzuhfnszvc9w5j0ua"
    
    print("Analyzing transaction history...")
    analyzer.analyze_address_transactions(address)

if __name__ == "__main__":
    main()