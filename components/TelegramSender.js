import React, { useState, useRef } from 'react';

const TelegramMessagingApp = () => {
  const [botToken, setBotToken] = useState('');
  const [chatId, setChatId] = useState('');
  const [message, setMessage] = useState('Hello from my retro cyberpunk app!');
  const [interval, setInterval] = useState(60);
  const [isRunning, setIsRunning] = useState(false);
  const [log, setLog] = useState([]);
  const intervalRef = useRef(null);

  const sendMessage = () => {
    fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
      }),
    })
      .then(response => response.json())
      .then(data => {
        setLog(prevLog => [...prevLog, `Message sent: ${new Date().toLocaleTimeString()}`]);
        console.log('Message sent:', data);
      })
      .catch(error => {
        setLog(prevLog => [...prevLog, `Error: ${error.message}`]);
        console.error('Error:', error);
      });
  };

  const startSending = () => {
    setIsRunning(true);
    sendMessage(); // Send first message immediately
    intervalRef.current = setInterval(sendMessage, interval * 1000);
  };

  const stopSending = () => {
    setIsRunning(false);
    clearInterval(intervalRef.current);
  };

  return (
    <div className="retro-container">
      <div className="retro-post">
        <div className="retro-header">
          📡 Cyberpunk Telegram Messenger 🤖
        </div>
        <div className="retro-section">
          <input
            type="text"
            className="retro-input"
            placeholder="Enter Bot Token"
            value={botToken}
            onChange={(e) => setBotToken(e.target.value)}
          />
          <input
            type="text"
            className="retro-input"
            placeholder="Enter Chat ID"
            value={chatId}
            onChange={(e) => setChatId(e.target.value)}
          />
          <input
            type="text"
            className="retro-input"
            placeholder="Enter Message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <input
            type="number"
            className="retro-input"
            placeholder="Interval (seconds)"
            value={interval}
            onChange={(e) => setInterval(parseInt(e.target.value))}
          />
        </div>
        <div className="retro-section">
          <button
            className="retro-button"
            onClick={startSending}
            disabled={isRunning || !botToken || !chatId}
          >
            🚀 Start Transmission
          </button>
          <button
            className="retro-button"
            onClick={stopSending}
            disabled={!isRunning}
          >
            🛑 Cease Transmission
          </button>
        </div>
        <div className="retro-section">
          <div className="retro-terminal">
            <div className="retro-terminal-header">📊 Transmission Log</div>
            <div className="retro-terminal-content">
              {log.map((entry, index) => (
                <div key={index}>{entry}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TelegramMessagingApp;