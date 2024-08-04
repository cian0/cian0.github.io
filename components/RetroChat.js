import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, push, onChildAdded, set } from 'firebase/database';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC3CrUNAGRVhqeYO5sZho_6ESTwv8VJrTs",
  authDomain: "cian0-4823e.firebaseapp.com",
  projectId: "cian0-4823e",
  storageBucket: "cian0-4823e.appspot.com",
  messagingSenderId: "787470014397",
  databaseURL: "https://cian0-4823e-default-rtdb.firebaseio.com/",
  appId: "1:787470014397:web:3213c3fa4a105d9a4c64d4",
  measurementId: "G-FEWCH0C7LM"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

const RetroChat = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [username, setUsername] = useState('');
  const [roomId, setRoomId] = useState('');
  const [isInRoom, setIsInRoom] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const joinRoom = () => {
    if (username && roomId) {
      const roomRef = ref(database, `rooms/${roomId}`);
      set(roomRef, { active: true });
      setIsInRoom(true);

      onChildAdded(ref(database, `rooms/${roomId}/messages`), (snapshot) => {
        const message = snapshot.val();
        setMessages((prevMessages) => [...prevMessages, message]);
      });
    }
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (inputMessage.trim() && username && roomId) {
      const messagesRef = ref(database, `rooms/${roomId}/messages`);
      push(messagesRef, {
        text: inputMessage,
        sender: username,
        timestamp: Date.now(),
      });
      setInputMessage('');
    }
  };

  const emojis = ['😊', '😂', '❤️', '👍', '🎮', '🕹️', '👾', '🚀'];

  return (
    <div className="retro-container">
      <div className="retro-post">
        <div className="retro-header">
          💬 Retro Chat Connect 📡
        </div>
        
        {!isInRoom ? (
          <div className="retro-section">
            <input
              type="text"
              className="retro-input"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <input
              type="text"
              className="retro-input"
              placeholder="Enter room ID"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
            />
            <button className="retro-button" onClick={joinRoom}>🚀 Join Room</button>
          </div>
        ) : (
          <>
            <div className="retro-section retro-chat-container">
              {messages.map((msg, index) => (
                <div key={index} className={`retro-message ${msg.sender === username ? 'retro-message-self' : ''}`}>
                  <span className="retro-message-sender">{msg.sender !== username && `${msg.sender}: `}</span>
                  <span className="retro-message-text">{msg.text}</span>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            
            <form onSubmit={sendMessage} className="retro-section">
              <input
                type="text"
                className="retro-input"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type your message..."
              />
              <div className="retro-emoji-container">
                {emojis.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    className="retro-emoji-button"
                    onClick={() => setInputMessage(inputMessage + emoji)}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
              <button type="submit" className="retro-button">📤 Send</button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default RetroChat;