import requests
import pandas as pd
from datetime import datetime
import time
from typing import Dict, List, Optional

def analyze_holder_transactions(address: str) -> Dict:
    """
    Analyze transaction patterns for a specific holder address
    
    Args:
        address (str): Holder's Kaspa address
    
    Returns:
        Dict containing transaction analysis metrics
    """
    url = f"https://api-v2-do.kas.fyi/addresses/{address}/transactions"
    try:
        response = requests.get(url)
        data = response.json()
        
        if not data.get('transactions'):
            return {
                'total_txns': 0,
                'behavior': 'inactive',
                'avg_amount': 0,
                'last_activity': None
            }
            
        txns = data['transactions']
        
        # Calculate metrics
        total_txns = len(txns)
        latest_time = max(int(tx['blockTime']) for tx in txns)
        latest_date = datetime.fromtimestamp(latest_time/1000)
        
        # Analyze transaction patterns
        inflow = 0
        outflow = 0
        for tx in txns:
            for output in tx['outputs']:
                if output['scriptPublicKeyAddress'] == address:
                    inflow += int(output['amount'])
            for inp in tx['inputs']:
                if inp['previousOutput']['scriptPublicKeyAddress'] == address:
                    outflow += int(inp['previousOutput']['amount'])
        
        # Determine behavior pattern
        if total_txns < 5:
            behavior = 'hodler'
        elif outflow > inflow:
            behavior = 'seller'
        elif inflow > outflow:
            behavior = 'accumulator'
        else:
            behavior = 'trader'
            
        return {
            'total_txns': total_txns,
            'behavior': behavior,
            'net_flow': inflow - outflow,
            'last_activity': latest_date.strftime('%Y-%m-%d'),
            'activity_level': 'high' if total_txns > 20 else 'medium' if total_txns > 10 else 'low'
        }
        
    except Exception as e:
        print(f"Error analyzing transactions for {address}: {e}")
        return None

def get_token_holders(symbol):
    """
    Fetch and analyze top holders for a given KRC20 token
    
    Args:
        symbol (str): Token symbol (e.g., 'WADU')
    """
    # API endpoint
    url = f"https://api-v2-do.kas.fyi/token/krc20/{symbol}/info?includeCharts=false&interval=1d"
    # to get transactions: https://api-v2-do.kas.fyi/addresses/kaspa:qzjeargt4jywj48qsxcdfx99g4m9yfypxvyp3nm76f7qvju0x23e5nsqwyeku/transactions?nonce=1732953590064%3A32d09968b2152310598e03f8c4a6f190bab11e0113478c43eeb45f08f29b09cd&offset=0&limit=20
    try:
        # Fetch data
        response = requests.get(url)
        data = response.json()
        
        # Create DataFrame of holders
        holders_df = pd.DataFrame(data['holders'])
        
        # Convert amounts to actual token values (considering decimals)
        decimal = data['decimal']
        holders_df['amount'] = holders_df['amount'] / (10 ** decimal)
        
        # Calculate percentage of total supply
        total_supply = data['totalMinted'] / (10 ** decimal)
        holders_df['percentage'] = (holders_df['amount'] / total_supply) * 100
        
        # Add rank column
        holders_df['rank'] = range(1, len(holders_df) + 1)
        
        # Reorder columns
        holders_df = holders_df[['rank', 'address', 'amount', 'percentage', 'tags']]
        
        # Print token info
        print(f"\n{symbol} Token Analysis")
        print(f"='='='='='='='='='='='='='='='='='='='='='")
        print(f"Total Supply: {total_supply:,.2f}")
        print(f"Total Holders: {data['holderTotal']:,}")
        print(f"Current Price: ${data['price']['priceInUsd']:,.8f}")
        print(f"Market Cap: ${data['price']['marketCapInUsd']:,.2f}")
        print(f"24h Change: {data['price']['change24h']:,.2f}%")
        
        # Print top holders analysis
        print(f"\nTop Holders Analysis")
        print(f"='='='='='='='='='='='='='='='='='='='='='")
        
        # Calculate concentration metrics
        top10_pct = holders_df.head(10)['percentage'].sum()
        top20_pct = holders_df.head(20)['percentage'].sum()
        top50_pct = holders_df.head(50)['percentage'].sum()
        
        print(f"Top 10 holders control: {top10_pct:.2f}%")
        print(f"Top 20 holders control: {top20_pct:.2f}%")
        print(f"Top 50 holders control: {top50_pct:.2f}%")
        
        # Analyze transaction patterns for top holders
        print("\nAnalyzing holder behaviors...")
        behaviors = []
        for address in holders_df.head(50)['address']:
            analysis = analyze_holder_transactions(address)
            if analysis:
                behaviors.append(analysis)
            time.sleep(0.5)  # Rate limiting
            
        # Add behavior analysis to dataframe
        behavior_df = pd.DataFrame(behaviors)
        holders_df = holders_df.head(50).reset_index(drop=True)
        holders_df = pd.concat([holders_df, behavior_df], axis=1)
        
        # Print behavior summary
        print("\nHolder Behavior Analysis")
        print("='='='='='='='='='='='='='='='='='='='='='")
        behavior_counts = holders_df['behavior'].value_counts()
        for behavior, count in behavior_counts.items():
            print(f"{behavior.title()} addresses: {count}")
            
        active_holders = len(holders_df[holders_df['activity_level'] == 'high'])
        print(f"\nHighly active holders: {active_holders}")
        
        # Return enhanced dataframe
        return holders_df
        
    except Exception as e:
        print(f"Error fetching data: {e}")
        return None

def main():
    # Example usage
    symbol = "WADU"  # Can be changed to any KRC20 token
    holders_df = get_token_holders(symbol)
    
    if holders_df is not None:
        print("\nDetailed Top 50 Holders")
        print("='='='='='='='='='='='='='='='='='='='='='")
        pd.set_option('display.float_format', lambda x: '%.8f' % x)
        print(holders_df.to_string(index=False))

if __name__ == "__main__":
    main()
