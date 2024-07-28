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
  const containerRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    const logSize = () => {
      if (containerRef.current) {
        const { offsetWidth, offsetHeight, scrollHeight } = containerRef.current;
        const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
        const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
        console.log(`Viewport size: ${viewportWidth}x${viewportHeight}`);
        console.log(`Container size: ${offsetWidth}x${offsetHeight}, Scroll height: ${scrollHeight}`);
        console.log(`Body scroll height: ${document.body.scrollHeight}`);
      }
    };

    logSize();
    window.addEventListener('resize', logSize);
    return () => window.removeEventListener('resize', logSize);
  }, []);

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
    <div ref={containerRef} className="nes-container is-dark full-height-layout" style={{ 
      maxWidth: '800px', 
      width: '100%',
      margin: '0 auto', 
      padding: '10px',
      boxSizing: 'border-box',
      border: 'none',
      borderRadius: '0',
    }}>
      <h2 className="nes-text is-primary" style={{ margin: '0 0 10px 0', fontSize: '1.2em' }}>Retro Chat</h2>
      
      {!isInRoom ? (
        <div className="nes-field" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <input
            type="text"
            className="nes-input"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ marginBottom: '10px', fontSize: '0.9em' }}
          />
          <input
            type="text"
            className="nes-input"
            placeholder="Enter room ID"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            style={{ marginBottom: '10px', fontSize: '0.9em' }}
          />
          <button className="nes-btn is-primary" onClick={joinRoom} style={{ fontSize: '0.9em' }}>Join Room</button>
        </div>
      ) : (
        <>
          <div className="scroll-container" style={{ 
            marginBottom: '10px', 
            border: '4px solid #fff', 
            borderRadius: '4px', 
            padding: '10px' 
          }}>
            {messages.map((msg, index) => (
              <div key={index} style={{
                textAlign: msg.sender === username ? 'right' : 'left',
                marginBottom: '5px'
              }}>
                <span className={`nes-text ${msg.sender === username ? 'is-primary' : 'is-success'}`} style={{ fontSize: '0.8em' }}>
                  {msg.sender !== username && <strong>{msg.sender}: </strong>}
                  {msg.text}
                </span>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          
          <form onSubmit={sendMessage} style={{ display: 'flex', flexDirection: 'column' }}>
            <input
              type="text"
              className="nes-input"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type your message..."
              style={{ marginBottom: '5px', fontSize: '0.8em' }}
            />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '5px' }}>
              {emojis.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  className="nes-btn is-primary"
                  onClick={() => setInputMessage(inputMessage + emoji)}
                  style={{ flex: '1 0 auto', minWidth: '30px', padding: '2px', fontSize: '0.8em' }}
                >
                  {emoji}
                </button>
              ))}
            </div>
            <button type="submit" className="nes-btn is-success" style={{ padding: '5px', fontSize: '0.8em' }}>Send</button>
          </form>
        </>
      )}
    </div>
  );
};

export default RetroChat;