import requests
import pandas as pd
from datetime import datetime

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
        
        # Return detailed dataframe of top 50 holders
        return holders_df.head(50)
        
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