import requests
import json
import websockets  # If websocket connection is needed
import asyncio

# REST API approach
def get_orderbook_rest(symbol):
    # Replace with actual API endpoint
    url = f"https://api.exchange.com/v1/orderbook/{symbol}"
    
    try:
        response = requests.get(url)
        if response.status_code == 200:
            data = response.json()
            return {
                'bids': data['bids'],  # Usually format is [[price, quantity], ...]
                'asks': data['asks']
            }
    except Exception as e:
        print(f"Error fetching orderbook: {e}")
    return None

# Websocket approach (if real-time updates are needed)
async def get_orderbook_ws(symbol):
    # Replace with actual websocket endpoint
    uri = "wss://ws.exchange.com"
    
    async with websockets.connect(uri) as websocket:
        # Subscribe to orderbook
        subscribe_message = {
            "method": "subscribe",
            "params": [f"orderbook.{symbol}"],
            "id": 1
        }
        await websocket.send(json.dumps(subscribe_message))
        
        while True:
            response = await websocket.recv()
            data = json.loads(response)
            # Process the orderbook data
            print(data)

# Usage example
if __name__ == "__main__":
    symbol = "WADU_USDT"
    
    # For REST API
    orderbook = get_orderbook_rest(symbol)
    if orderbook:
        print("Bids:", orderbook['bids'][:5])  # Show top 5 bids
        print("Asks:", orderbook['asks'][:5])  # Show top 5 asks
    
    # For Websocket
    # asyncio.run(get_orderbook_ws(symbol))