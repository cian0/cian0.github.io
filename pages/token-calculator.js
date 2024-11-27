import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function TokenCalculator() {
  const [tokenPairs, setTokenPairs] = useState({});
  const [activeTab, setActiveTab] = useState('crypto');
  const [selectedCustomToken, setSelectedCustomToken] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState('');

  const tokenSymbols = {
    'bitcoin': 'BTC',
    'ethereum': 'ETH',
    'ripple': 'XRP',
    'cardano': 'ADA',
    'solana': 'SOL',
    'dogecoin': 'DOGE'
  };

  useEffect(() => {
    // Add initial empty token pair on component mount
    addTokenPair();
  }, []);

  const handleTokenSelect = (value) => {
    const customTokenDiv = document.getElementById('customTokenInput');
    if (value === 'other') {
      customTokenDiv?.classList.add('show');
    } else {
      customTokenDiv?.classList.remove('show');
      setSelectedCustomToken(null);
    }
  };

  const searchToken = async (query) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      setStatusMessage('Searching for token...');
      setStatusType('loading');

      const response = await fetch(`https://api.coingecko.com/api/v3/search?query=${query}`);
      const data = await response.json();

      if (data.coins && data.coins.length > 0) {
        setSearchResults(data.coins.slice(0, 5));
        setStatusMessage('');
      } else {
        setSearchResults([]);
        setStatusMessage('No matching tokens found');
        setStatusType('error');
      }
    } catch (error) {
      console.error('Error searching tokens:', error);
      setStatusMessage('Error searching for tokens. Please try again.');
      setStatusType('error');
    }
  };

  const selectCustomToken = (coin) => {
    setSelectedCustomToken(coin);
    setStatusMessage(`Selected: ${coin.name}`);
    setSearchResults([]);
  };

  const fetchMarketRate = async () => {
    const tokenSelect = document.getElementById('quick-add-token');
    const currency = document.getElementById('quick-add-currency').value.toLowerCase();
    
    let tokenId, tokenSymbol;
    
    if (tokenSelect.value === 'other') {
      if (!selectedCustomToken) {
        setStatusMessage('Please select a token from the search results');
        setStatusType('error');
        return;
      }
      tokenId = selectedCustomToken.id;
      tokenSymbol = selectedCustomToken.symbol.toUpperCase();
    } else {
      if (!tokenSelect.value || !currency) {
        setStatusMessage('Please select both token and currency');
        setStatusType('error');
        return;
      }
      tokenId = tokenSelect.value;
      tokenSymbol = tokenSymbols[tokenId];
    }

    setStatusMessage('Fetching current market rate...');
    setStatusType('loading');

    try {
      const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${tokenId}&vs_currencies=${currency}`);
      const data = await response.json();
      
      if (data[tokenId] && data[tokenId][currency]) {
        const rate = data[tokenId][currency];
        const currencySymbol = currency.toUpperCase();
        
        addTokenPairWithValues(1, tokenSymbol, rate, currencySymbol);
        
        setStatusMessage(`Successfully added market rate: 1 ${tokenSymbol} = ${rate} ${currencySymbol}`);
        setStatusType('success');

        if (tokenSelect.value === 'other') {
          setSelectedCustomToken(null);
        }
      } else {
        throw new Error('Invalid response from API');
      }
    } catch (error) {
      setStatusMessage('Error fetching market rate. Please try again later.');
      setStatusType('error');
      console.error('Error:', error);
    }
  };

  const fetchForexRate = async () => {
    const fromCurrency = document.getElementById('forex-from').value;
    const toCurrency = document.getElementById('forex-to').value;

    if (!fromCurrency || !toCurrency) {
      setStatusMessage('Please select both currencies');
      setStatusType('error');
      return;
    }

    if (fromCurrency === toCurrency) {
      setStatusMessage('Please select different currencies');
      setStatusType('error');
      return;
    }

    setStatusMessage('Fetching current forex rate...');
    setStatusType('loading');

    try {
      const response = await fetch(`https://api.exchangerate.host/convert?from=${fromCurrency}&to=${toCurrency}`);
      const data = await response.json();

      if (data.success && data.result) {
        const rate = data.result;
        addTokenPairWithValues(1, fromCurrency, rate, toCurrency);
        
        setStatusMessage(`Successfully added forex rate: 1 ${fromCurrency} = ${rate.toFixed(6)} ${toCurrency}`);
        setStatusType('success');
      } else {
        throw new Error('Invalid response from API');
      }
    } catch (error) {
      setStatusMessage('Error fetching forex rate. Please try again later.');
      setStatusType('error');
      console.error('Error:', error);
    }
  };

  const addTokenPair = () => {
    // Implementation needed
  };

  const addTokenPairWithValues = (amount1, token1, amount2, token2) => {
    // Implementation needed
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Head>
        <title>Token Conversion Calculator</title>
        <link href="https://unpkg.com/nes.css@latest/css/nes.min.css" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" rel="stylesheet" />
      </Head>

      <h1 className="text-3xl font-bold mb-8">Token Conversion Calculator</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex space-x-4 mb-6">
          <button 
            className={`px-4 py-2 rounded ${activeTab === 'crypto' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setActiveTab('crypto')}
          >
            Crypto
          </button>
          <button 
            className={`px-4 py-2 rounded ${activeTab === 'forex' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setActiveTab('forex')}
          >
            Forex
          </button>
        </div>

        {/* Rest of the UI components will go here */}
      </div>
    </div>
  );
}
