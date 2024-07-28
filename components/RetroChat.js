import React, { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, onValue, onChildAdded, push } from 'firebase/database';

// Initialize Firebase (replace with your own config)
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
  const [roomId, setRoomId] = useState('');
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('Disconnected');
  const [isInitiator, setIsInitiator] = useState(false);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const dataChannelRef = useRef(null);

  useEffect(() => {
    return () => {
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [localStream]);

  const createPeerConnection = () => {
    const peerConnection = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        sendMessage({ type: 'candidate', candidate: event.candidate });
      }
    };

    peerConnection.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
    };

    peerConnection.ondatachannel = (event) => {
      setupDataChannel(event.channel);
    };

    peerConnectionRef.current = peerConnection;
    setConnectionStatus('Peer connection created');
  };

  const setupDataChannel = (dataChannel) => {
    dataChannelRef.current = dataChannel;

    dataChannel.onopen = () => {
      console.log('Data channel is open');
      setConnectionStatus('Connected');
    };

    dataChannel.onmessage = (event) => {
      setMessages(prevMessages => [...prevMessages, { text: event.data, sent: false }]);
    };

    dataChannel.onerror = (error) => {
      console.error('Data channel error:', error);
      setConnectionStatus('Error in data channel');
    };

    dataChannel.onclose = () => {
      console.log('Data channel is closed');
      setConnectionStatus('Disconnected');
    };
  };

  const createOrJoinRoom = async () => {
    let roomIdToUse = roomId;
    if (!roomIdToUse) {
      roomIdToUse = uuidv4();
      setRoomId(roomIdToUse);
    }

    const roomRef = ref(database, `rooms/${roomIdToUse}`);

    try {
      const snapshot = await new Promise((resolve) => onValue(roomRef, resolve, { onlyOnce: true }));
      
      if (!snapshot.exists()) {
        setIsInitiator(true);
        await set(roomRef, { created: true });
      }

      onChildAdded(roomRef, async (snapshot) => {
        if (snapshot.key === 'offer' && !isInitiator) {
          const offer = snapshot.val();
          await handleOffer(offer);
        } else if (snapshot.key === 'answer' && isInitiator) {
          const answer = snapshot.val();
          await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer));
        } else if (snapshot.key === 'candidate') {
          const candidate = snapshot.val();
          await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        }
      });

      setConnectionStatus(isInitiator ? 'Waiting for peer...' : 'Joining room...');
      createPeerConnection();
      if (isInitiator) {
        await createOffer(roomIdToUse);
      }
    } catch (error) {
      console.error('Error creating/joining room:', error);
      setConnectionStatus('Error: ' + error.message);
    }
  };

  const sendMessage = (message) => {
    push(ref(database, `rooms/${roomId}`), message);
  };

  const createOffer = async (roomIdToUse) => {
    try {
      const dataChannel = peerConnectionRef.current.createDataChannel('chat');
      setupDataChannel(dataChannel);

      const offer = await peerConnectionRef.current.createOffer();
      await peerConnectionRef.current.setLocalDescription(offer);
      sendMessage({ type: 'offer', offer });
    } catch (error) {
      console.error('Error creating offer:', error);
      setConnectionStatus('Error creating offer: ' + error.message);
    }
  };

  const handleOffer = async (offer) => {
    try {
      await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peerConnectionRef.current.createAnswer();
      await peerConnectionRef.current.setLocalDescription(answer);
      sendMessage({ type: 'answer', answer });
    } catch (error) {
      console.error('Error handling offer:', error);
      setConnectionStatus('Error handling offer: ' + error.message);
    }
  };

  const startLocalStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      if (peerConnectionRef.current) {
        stream.getTracks().forEach(track => peerConnectionRef.current.addTrack(track, stream));
      }
      setConnectionStatus('Local stream started');
    } catch (error) {
      console.error('Error accessing media devices:', error);
      setConnectionStatus('Error: ' + error.message);
    }
  };

  const sendChatMessage = () => {
    if (inputMessage && dataChannelRef.current && dataChannelRef.current.readyState === 'open') {
      dataChannelRef.current.send(inputMessage);
      setMessages(prevMessages => [...prevMessages, { text: inputMessage, sent: true }]);
      setInputMessage('');
    } else {
      console.error('Cannot send message: Data channel is not open');
      setConnectionStatus('Error: Data channel not open. Please ensure connection is established.');
    }
  };

  return (
    <div className="nes-container is-dark with-title">
      <p className="title">Retro Chat Connect</p>
      <div className="nes-container is-rounded">
        <input
          type="text"
          className="nes-input is-dark"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          placeholder="Enter room ID or leave blank to create new"
        />
        <button type="button" className="nes-btn is-primary" onClick={createOrJoinRoom}>Create/Join Room</button>
        <p>Status: {connectionStatus}</p>
        {roomId && <p>Room ID: {roomId}</p>}
      </div>
      <div className="nes-container is-rounded" style={{ marginTop: '1rem' }}>
        <video ref={localVideoRef} autoPlay muted style={{ width: '200px', height: '150px' }}></video>
        <video ref={remoteVideoRef} autoPlay style={{ width: '200px', height: '150px' }}></video>
      </div>
      <button type="button" className="nes-btn is-primary" onClick={startLocalStream}>Start Camera</button>
      <div className="nes-container is-rounded" style={{ marginTop: '1rem', height: '200px', overflowY: 'scroll' }}>
        {messages.map((msg, index) => (
          <div key={index} className={`nes-balloon ${msg.sent ? 'from-right' : 'from-left'}`}>
            <p>{msg.text}</p>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', marginTop: '1rem' }}>
        <input
          type="text"
          className="nes-input is-dark"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Type your message..."
        />
        <button type="button" className="nes-btn is-primary" onClick={sendChatMessage}>Send</button>
      </div>
    </div>
  );
};

export default RetroChat;