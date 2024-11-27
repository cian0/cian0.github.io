import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import styles from '../styles/TokenConverter.module.css';

const TokenConverter = () => {
  const [tokenPairs, setTokenPairs] = useState({});
  const [selectedCustomToken, setSelectedCustomToken] = useState(null);
  const [status, setStatus] = useState({ message: '', type: '' });
  const [activeTab, setActiveTab] = useState('crypto');
  const [conversionResult, setConversionResult] = useState('');
  const [allConversions, setAllConversions] = useState([]);
  const [customPairs, setCustomPairs] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('tokenConverter_customPairs');
      return saved ? JSON.parse(saved) : [{ amount1: 1, token1: '', amount2: '', token2: '' }];
    }
    return [{ amount1: 1, token1: '', amount2: '', token2: '' }];
  });
  const [availableTokens, setAvailableTokens] = useState(new Set());
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [tokenSelect, setTokenSelect] = useState('default');
  const [tokenSymbols, setTokenSymbols] = useState({
    'bitcoin': 'BTC',
    'ethereum': 'ETH',
    'ripple': 'XRP',
    'cardano': 'ADA',
    'solana': 'SOL',
    'dogecoin': 'DOGE'
  });
  const [isLoadingTokens, setIsLoadingTokens] = useState(true);

  useEffect(() => {
    const fetchTopTokens = async () => {
      try {
        setIsLoadingTokens(true);
        const response = await fetch(
          'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&sparkline=false'
        );
        const data = await response.json();
        const symbols = {};
        data.forEach(token => {
          symbols[token.id] = token.symbol.toUpperCase();
        });
        setTokenSymbols(symbols);
      } catch (error) {
        console.error('Error fetching top tokens:', error);
        setStatus({ message: 'Error loading tokens. Using default list.', type: 'error' });
        // Fallback to basic tokens if API fails
        setTokenSymbols({
          'bitcoin': 'BTC',
          'ethereum': 'ETH',
          'ripple': 'XRP',
          'cardano': 'ADA',
          'solana': 'SOL',
          'dogecoin': 'DOGE'
        });
      } finally {
        setIsLoadingTokens(false);
      }
    };

    fetchTopTokens();
  }, []);

  const findConversionRate = (fromToken, toToken, visited = new Set()) => {
    if (tokenPairs[fromToken] && tokenPairs[fromToken][toToken]) {
      return tokenPairs[fromToken][toToken];
    }
    
    if (visited.has(fromToken)) {
      return null;
    }
    
    visited.add(fromToken);
    
    if (tokenPairs[fromToken]) {
      for (const intermediateToken in tokenPairs[fromToken]) {
        const rate1 = tokenPairs[fromToken][intermediateToken];
        const rate2 = findConversionRate(intermediateToken, toToken, new Set(visited));
        
        if (rate2 !== null) {
          return rate1 * rate2;
        }
      }
    }
    
    return null;
  };

  const updateTokenLists = () => {
    const tokens = new Set();
    const pairs = {};
    
    customPairs.forEach(pair => {
      const { amount1, token1, amount2, token2 } = pair;
      if (token1 && token2 && !isNaN(amount1) && !isNaN(amount2) && amount1 > 0 && amount2 > 0) {
        tokens.add(token1.toUpperCase());
        tokens.add(token2.toUpperCase());
        
        if (!pairs[token1]) pairs[token1] = {};
        if (!pairs[token2]) pairs[token2] = {};
        
        pairs[token1][token2] = amount2 / amount1;
        pairs[token2][token1] = amount1 / amount2;
      }
    });
    
    setTokenPairs(pairs);
    setAvailableTokens(tokens);
  };

  const addTokenPair = () => {
    setCustomPairs([...customPairs, { amount1: 1, token1: '', amount2: '', token2: '' }]);
  };

  const removeTokenPair = (index) => {
    const newPairs = customPairs.filter((_, i) => i !== index);
    setCustomPairs(newPairs);
  };

  const updateTokenPair = (index, field, value) => {
    const newPairs = [...customPairs];
    newPairs[index] = { ...newPairs[index], [field]: value };
    setCustomPairs(newPairs);
  };

  // Save to localStorage whenever customPairs changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('tokenConverter_customPairs', JSON.stringify(customPairs));
    }
    updateTokenLists();
  }, [customPairs]);

  // Load saved state on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Load conversion history
      const savedHistory = localStorage.getItem('tokenConverter_history');
      if (savedHistory) {
        setAllConversions(JSON.parse(savedHistory));
      }

      // Load active tab
      const savedTab = localStorage.getItem('tokenConverter_activeTab');
      if (savedTab) {
        setActiveTab(savedTab);
      }
    }
  }, []);

  // Save conversion history when it changes
  useEffect(() => {
    if (typeof window !== 'undefined' && allConversions.length > 0) {
      localStorage.setItem('tokenConverter_history', JSON.stringify(allConversions));
    }
  }, [allConversions]);

  // Save active tab when it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('tokenConverter_activeTab', activeTab);
    }
  }, [activeTab]);

  const handleTokenSelect = (value) => {
    console.log('handleTokenSelect called with value:', value);
    setTokenSelect(value);
    if (value === 'other') {
      console.log('Other selected, resetting states');
      setSelectedCustomToken(null);
      setSearchQuery('');
      setSearchResults([]);
    }
  };

  const searchToken = async (query) => {
    console.log('searchToken called with query:', query);
    setSearchQuery(query);
    if (!query || query.length < 2) {
      console.log('Query too short, clearing results');
      setSearchResults([]);
      return;
    }

    try {
      setStatus({ message: 'Searching for token...', type: 'loading' });
      const response = await fetch(`https://api.coingecko.com/api/v3/search?query=${query}`);
      const data = await response.json();

      if (data.coins && data.coins.length > 0) {
        setSearchResults(data.coins.slice(0, 5));
        setStatus({ message: '', type: '' });
      } else {
        setSearchResults([]);
        setStatus({ message: 'No matching tokens found', type: 'error' });
      }
    } catch (error) {
      console.error('Error searching tokens:', error);
      setStatus({ message: 'Error searching for tokens. Please try again.', type: 'error' });
      setSearchResults([]);
    }
  };

  const selectCustomToken = (coin) => {
    setSelectedCustomToken(coin);
    setSearchQuery(`${coin.name} (${coin.symbol.toUpperCase()})`);
    setSearchResults([]);
    setStatus({ message: `Selected: ${coin.name}`, type: 'success' });
  };

  const [amount, setAmount] = useState('');
  const [fromCurrency, setFromCurrency] = useState('');
  const [toCurrency, setToCurrency] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchMarketRate = async () => {
    const statusMessage = { message: '', type: '' };
    const tokenSelect = document.getElementById('quick-add-token');
    const currency = document.getElementById('quick-add-currency').value.toLowerCase();
    
    let tokenId, tokenSymbol;
    
    if (tokenSelect.value === 'other') {
      if (!selectedCustomToken) {
        setStatus({ message: 'Please select a token from the search results', type: 'error' });
        return;
      }
      tokenId = selectedCustomToken.id;
      tokenSymbol = selectedCustomToken.symbol.toUpperCase();
    } else {
      if (!tokenSelect.value || !currency) {
        setStatus({ message: 'Please select both token and currency', type: 'error' });
        return;
      }
      tokenId = tokenSelect.value;
      tokenSymbol = tokenSymbols[tokenId];
    }

    setLoading(true);
    setStatus({ message: 'Fetching current market rate...', type: 'loading' });

    try {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${tokenId}&vs_currencies=${currency}`
      );
      const data = await response.json();
      
      if (data[tokenId] && data[tokenId][currency]) {
        const rate = data[tokenId][currency];
        const currencySymbol = currency.toUpperCase();
        
        addTokenPairWithValues(1, tokenSymbol, rate, currencySymbol);
        
        setStatus({ 
          message: `Successfully added market rate: 1 ${tokenSymbol} = ${rate} ${currencySymbol}`,
          type: 'success'
        });

        // Reset custom token search if it was used
        if (tokenSelect.value === 'other') {
          setSelectedCustomToken(null);
        }
      } else {
        throw new Error('Invalid response from API');
      }
    } catch (error) {
      console.error('Error:', error);
      setStatus({ 
        message: 'Error fetching market rate. Please try again later.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const addTokenPairWithValues = useCallback((amount1, token1, amount2, token2) => {
    setCustomPairs(prev => {
      const newPairs = [...prev, {
        amount1,
        token1,
        amount2,
        token2
      }];
      if (typeof window !== 'undefined') {
        localStorage.setItem('tokenConverter_customPairs', JSON.stringify(newPairs));
      }
      return newPairs;
    });
  }, []);

  const fetchForexRate = async () => {
    const fromCurrency = document.getElementById('forex-from').value;
    const toCurrency = document.getElementById('forex-to').value;

    if (!fromCurrency || !toCurrency) {
      setStatus({ message: 'Please select both currencies', type: 'error' });
      return;
    }

    if (fromCurrency === toCurrency) {
      setStatus({ message: 'Please select different currencies', type: 'error' });
      return;
    }

    setLoading(true);
    setStatus({ message: 'Fetching current forex rate...', type: 'loading' });

    try {
      const response = await fetch(
        `https://api.exchangerate.host/convert?from=${fromCurrency}&to=${toCurrency}`
      );
      const data = await response.json();

      if (data.success && data.result) {
        const rate = data.result;
        
        // Add the forex pair to our conversion system
        addTokenPairWithValues(1, fromCurrency, rate, toCurrency);
        
        setStatus({
          message: `Successfully added forex rate: 1 ${fromCurrency} = ${rate.toFixed(6)} ${toCurrency}`,
          type: 'success'
        });
      } else {
        throw new Error('Invalid response from API');
      }
    } catch (error) {
      console.error('Error:', error);
      setStatus({
        message: 'Error fetching forex rate. Please try again later.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="retro-container">
      <div className="retro-post">
        <div className="retro-header">
          💱 Token Conversion Calculator 💹
        </div>

        <div className={styles.tokenPairsSection}>
          <h3 className="nes-text">Custom Token Pairs</h3>
          {customPairs.map((pair, index) => (
            <div key={index} className={styles.tokenPair}>
              <input
                type="number"
                className="nes-input"
                value={pair.amount1}
                onChange={(e) => updateTokenPair(index, 'amount1', parseFloat(e.target.value))}
                placeholder="Amount"
                step="any"
              />
              <input
                type="text"
                className="nes-input"
                value={pair.token1}
                onChange={(e) => updateTokenPair(index, 'token1', e.target.value.toUpperCase())}
                placeholder="From Token"
              />
              <span>equals</span>
              <input
                type="number"
                className="nes-input"
                value={pair.amount2}
                onChange={(e) => updateTokenPair(index, 'amount2', parseFloat(e.target.value))}
                placeholder="Amount"
                step="any"
              />
              <input
                type="text"
                className="nes-input"
                value={pair.token2}
                onChange={(e) => updateTokenPair(index, 'token2', e.target.value.toUpperCase())}
                placeholder="To Token"
              />
              <button 
                className="nes-btn is-error"
                onClick={() => removeTokenPair(index)}
              >
                Remove
              </button>
            </div>
          ))}
          <button className="nes-btn is-primary" onClick={addTokenPair}>
            Add Token Pair
          </button>
        </div>

        <div className={styles.allConversions}>
          <h3 className="nes-text">All Available Conversions (Base 1)</h3>
          <div className={styles.conversionGrid}>
            {Array.from(availableTokens).sort().map(fromToken => (
              Array.from(availableTokens).sort().map(toToken => {
                if (fromToken !== toToken) {
                  const rate = findConversionRate(fromToken, toToken);
                  if (rate !== null) {
                    return (
                      <div key={`${fromToken}-${toToken}`} className={styles.conversionRow}>
                        1 {fromToken} = {rate.toFixed(8)} {toToken}
                      </div>
                    );
                  }
                }
                return null;
              })
            ))}
          </div>
        </div>
        
        <div className="quick-add retro-section">
          <div className="tab-buttons">
            <button 
              onClick={() => setActiveTab('crypto')} 
              className={`nes-btn ${activeTab === 'crypto' ? 'is-primary' : ''}`}
            >
              Crypto
            </button>
            <button 
              onClick={() => setActiveTab('forex')} 
              className={`nes-btn ${activeTab === 'forex' ? 'is-primary' : ''}`}
            >
              Forex
            </button>
          </div>

          <div className="nes-container with-title is-dark">
            <p className="title">Quick Add Rates</p>
            
            {activeTab === 'crypto' && (
              <div className="crypto-rate-section">
                <h4>Add Cryptocurrency Rate</h4>
                <div className={styles.tokenPair}>
                  <select 
                    id="quick-add-token" 
                    className="nes-select"
                    onChange={(e) => {
                      setTokenSelect(e.target.value);
                      handleTokenSelect(e.target.value);
                    }}
                  >
                    <option value="">Select Token</option>
                    {Object.entries(tokenSymbols).map(([id, symbol]) => (
                      <option key={id} value={id}>
                        {symbol} - {id}
                      </option>
                    ))}
                    <option value="other">Other (Search)</option>
                  </select>
                  
                  <select 
                    id="quick-add-currency"
                    className="nes-select"
                  >
                    <option value="usd">USD</option>
                    <option value="eur">EUR</option>
                    <option value="gbp">GBP</option>
                    <option value="jpy">JPY</option>
                    <option value="php">PHP</option>
                  </select>
                  
                  <button 
                    className="nes-btn is-primary"
                    onClick={fetchMarketRate}
                    disabled={loading}
                  >
                    {loading ? 'Loading...' : 'Add Market Rate'}
                  </button>
                </div>

                {/* Custom token search section */}
                {/* Debug info */}
                <div style={{color: 'yellow', fontSize: '12px'}}>
                  Current tokenSelect value: {tokenSelect}
                </div>
                {tokenSelect === 'other' && (
                  <div className={styles.customTokenInput}>
                    <div className="nes-field">
                      <label htmlFor="tokenSearch">Search for token:</label>
                      <input
                        id="tokenSearch"
                        type="text"
                        className="nes-input is-dark"
                        value={searchQuery}
                        placeholder="Search token (e.g., POL, KAS)"
                        onChange={(e) => searchToken(e.target.value)}
                      />
                    </div>
                    {searchResults.length > 0 && (
                      <div className={styles.tokenSearchResults}>
                        {searchResults.map((coin) => (
                          <div
                            key={coin.id}
                            className={styles.tokenSearchResult}
                            onClick={() => selectCustomToken(coin)}
                          >
                            {coin.name} ({coin.symbol.toUpperCase()})
                            <small>ID: {coin.id}</small>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'forex' && (
              <div className="forex-rate-section">
                <h4>Add Forex Rate</h4>
                <div className={styles.tokenPair}>
                  <select 
                    id="forex-from"
                    className="nes-select"
                    value={fromCurrency}
                    onChange={(e) => setFromCurrency(e.target.value)}
                  >
                    <option value="">Select Currency</option>
                    <option value="USD">US Dollar (USD)</option>
                    <option value="EUR">Euro (EUR)</option>
                    <option value="GBP">British Pound (GBP)</option>
                    <option value="JPY">Japanese Yen (JPY)</option>
                    <option value="AUD">Australian Dollar (AUD)</option>
                  </select>
                  
                  <span>to</span>
                  
                  <select 
                    id="forex-to"
                    className="nes-select"
                    value={toCurrency}
                    onChange={(e) => setToCurrency(e.target.value)}
                  >
                    <option value="">Select Currency</option>
                    <option value="USD">US Dollar (USD)</option>
                    <option value="EUR">Euro (EUR)</option>
                    <option value="GBP">British Pound (GBP)</option>
                    <option value="JPY">Japanese Yen (JPY)</option>
                    <option value="AUD">Australian Dollar (AUD)</option>
                  </select>
                  
                  <button 
                    className="nes-btn is-primary"
                    onClick={fetchForexRate}
                    disabled={loading}
                  >
                    {loading ? 'Loading...' : 'Add Forex Rate'}
                  </button>
                </div>
              </div>
            )}

            {status.message && (
              <div className={`nes-container is-rounded ${
                status.type === 'error' ? 'is-error' : 
                status.type === 'success' ? 'is-success' : 
                'is-dark'
              }`}>
                <p>{status.message}</p>
              </div>
            )}
          </div>

          <div className="converter-form nes-container with-title">
            <p className="title">Convert</p>
            
            <div className="nes-field">
              <label htmlFor="amount">Amount:</label>
              <input
                type="number"
                id="amount"
                className="nes-input"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
              />
            </div>

            {activeTab === 'crypto' ? (
              <>
                <div className="nes-field">
                  <label htmlFor="fromCrypto" className={styles.cryptoLabel}>From Cryptocurrency:</label>
                  <select 
                    id="fromCrypto"
                    className={`nes-select ${styles.cryptoSelect}`}
                    onChange={(e) => setFromCurrency(e.target.value)}
                    value={fromCurrency}
                  >
                    <option value="">Select token</option>
                    {isLoadingTokens ? (
                      <option value="" disabled>Loading tokens...</option>
                    ) : (
                      Object.entries(tokenSymbols).map(([name, symbol]) => (
                        <option key={symbol} value={name}>
                          {symbol} - {name}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div className="nes-field">
                  <label htmlFor="toCrypto" className={styles.cryptoLabel}>To Cryptocurrency:</label>
                  <select 
                    id="toCrypto"
                    className={`nes-select ${styles.cryptoSelect}`}
                    onChange={(e) => setToCurrency(e.target.value)}
                    value={toCurrency}
                  >
                    <option value="">Select token</option>
                    {Object.entries(tokenSymbols).map(([name, symbol]) => (
                      <option key={symbol} value={name}>
                        {symbol} - {name}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            ) : (
              <>
                <div className="nes-field">
                  <label>From Currency:</label>
                  <select 
                    className="nes-select"
                    onChange={(e) => setFromCurrency(e.target.value)}
                    value={fromCurrency}
                  >
                    <option value="">Select currency</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="JPY">JPY</option>
                    <option value="AUD">AUD</option>
                  </select>
                </div>

                <div className="nes-field">
                  <label>To Currency:</label>
                  <select 
                    className="nes-select"
                    onChange={(e) => setToCurrency(e.target.value)}
                    value={toCurrency}
                  >
                    <option value="">Select currency</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="JPY">JPY</option>
                    <option value="AUD">AUD</option>
                  </select>
                </div>
              </>
            )}

            <button
              className="nes-btn is-primary"
              onClick={() => {
                if (activeTab === 'crypto') {
                  fetchMarketRate(fromCurrency, toCurrency, amount);
                } else {
                  fetchForexRate(fromCurrency, toCurrency, amount);
                }
              }}
              disabled={loading}
            >
              {loading ? 'Converting...' : 'Convert'}
            </button>

            {status.message && (
              <div className={`nes-container is-rounded ${
                status.type === 'error' ? 'is-error' : 
                status.type === 'success' ? 'is-success' : 
                'is-dark'
              }`}>
                <p>{status.message}</p>
              </div>
            )}

            {conversionResult && (
              <div className="nes-container is-rounded is-dark">
                <p>Result: {conversionResult}</p>
              </div>
            )}
          </div>

          {allConversions.length > 0 && (
            <div className="conversion-history nes-container with-title">
              <p className="title">Conversion History</p>
              <div className="history-list">
                {allConversions.map((conversion, index) => (
                  <div key={index} className="nes-container is-rounded">
                    <p>
                      {conversion.amount} {conversion.from} = {conversion.result} {conversion.to}
                      <br />
                      <small>{new Date(conversion.timestamp).toLocaleString()}</small>
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="retro-section">
          <Link href="/" className="nes-btn">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TokenConverter;
