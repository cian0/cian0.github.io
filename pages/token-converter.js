import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import styles from '../styles/TokenConverter.module.css';

const TokenConverter = () => {
  const [tokenPairs, setTokenPairs] = useState({});
  const [selectedCustomToken, setSelectedCustomToken] = useState(null);
  const [status, setStatus] = useState({ message: '', type: '' });
  const [activeTab, setActiveTab] = useState('crypto');
  const [conversionResult, setConversionResult] = useState('');
  const [allConversions, setAllConversions] = useState([]);

  const tokenSymbols = {
    'bitcoin': 'BTC',
    'ethereum': 'ETH',
    'ripple': 'XRP',
    'cardano': 'ADA',
    'solana': 'SOL',
    'dogecoin': 'DOGE'
  };

  const handleTokenSelect = (value) => {
    const customTokenDiv = document.getElementById('customTokenInput');
    if (value === 'other') {
      customTokenDiv.classList.add('show');
    } else {
      customTokenDiv.classList.remove('show');
      setSelectedCustomToken(null);
    }
  };

  const searchToken = async (query) => {
    if (!query || query.length < 2) {
      return;
    }

    try {
      setStatus({ message: 'Searching for token...', type: 'loading' });
      const response = await fetch(`https://api.coingecko.com/api/v3/search?query=${query}`);
      const data = await response.json();

      if (data.coins && data.coins.length > 0) {
        return data.coins.slice(0, 5);
      }
      setStatus({ message: 'No matching tokens found', type: 'error' });
      return [];
    } catch (error) {
      console.error('Error searching tokens:', error);
      setStatus({ message: 'Error searching for tokens. Please try again.', type: 'error' });
      return [];
    }
  };

  const [amount, setAmount] = useState('');
  const [fromCurrency, setFromCurrency] = useState('');
  const [toCurrency, setToCurrency] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchMarketRate = async (from, to, amount) => {
    if (!from || !to || !amount) {
      setStatus({ message: 'Please fill in all fields', type: 'error' });
      return;
    }

    try {
      setLoading(true);
      setStatus({ message: 'Fetching market rate...', type: 'loading' });
      
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${from}&vs_currencies=${to}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch market rate');
      }

      const data = await response.json();
      if (data[from] && data[from][to.toLowerCase()]) {
        const rate = data[from][to.toLowerCase()];
        const result = amount * rate;
        setConversionResult(result.toFixed(8));
        setStatus({ message: 'Conversion successful!', type: 'success' });
        
        // Add to conversion history
        setAllConversions(prev => [...prev, {
          from,
          to,
          amount,
          result: result.toFixed(8),
          timestamp: new Date().toISOString()
        }]);
      }
    } catch (error) {
      console.error('Error fetching market rate:', error);
      setStatus({ message: 'Error fetching market rate. Please try again.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchForexRate = async (from, to, amount) => {
    if (!from || !to || !amount) {
      setStatus({ message: 'Please fill in all fields', type: 'error' });
      return;
    }

    try {
      setLoading(true);
      setStatus({ message: 'Fetching forex rate...', type: 'loading' });
      
      const response = await fetch(
        `https://api.exchangerate-api.com/v4/latest/${from}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch forex rate');
      }

      const data = await response.json();
      if (data.rates && data.rates[to]) {
        const rate = data.rates[to];
        const result = amount * rate;
        setConversionResult(result.toFixed(2));
        setStatus({ message: 'Conversion successful!', type: 'success' });
        
        // Add to conversion history
        setAllConversions(prev => [...prev, {
          from,
          to,
          amount,
          result: result.toFixed(2),
          timestamp: new Date().toISOString()
        }]);
      }
    } catch (error) {
      console.error('Error fetching forex rate:', error);
      setStatus({ message: 'Error fetching forex rate. Please try again.', type: 'error' });
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
                  <label>From Cryptocurrency:</label>
                  <select 
                    className="nes-select"
                    onChange={(e) => setFromCurrency(e.target.value)}
                    value={fromCurrency}
                  >
                    <option value="">Select token</option>
                    {Object.entries(tokenSymbols).map(([name, symbol]) => (
                      <option key={symbol} value={name}>
                        {symbol} - {name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="nes-field">
                  <label>To Cryptocurrency:</label>
                  <select 
                    className="nes-select"
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
