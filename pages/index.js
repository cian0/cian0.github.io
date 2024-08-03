import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction } from "@/components/ui/alert-dialog";

const apps = [
  {
    id: 1,
    name: "Rock Paper Scissors",
    category: "Games",
    description: "Play the classic game with a retro twist!",
    image: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <rect width="100" height="100" fill="#f0f0f0"/>
        <text x="50" y="50" fontSize="60" textAnchor="middle" dominantBaseline="central">✊✋✌️</text>
      </svg>
    ),
    link: "/rock-paper-scissors"
  },
  {
    id: 2,
    name: "Emoji Terrain Game",
    category: "Games",
    description: "Navigate through a terrain made of emojis in this simple Phaser game.",
    image: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <rect width="100" height="100" fill="#7CFC00"/>
        <text x="50" y="50" fontSize="60" textAnchor="middle" dominantBaseline="central">🤠</text>
        <text x="20" y="20" fontSize="30">🌳</text>
        <text x="80" y="80" fontSize="30">🌳</text>
      </svg>
    ),
    link: "/emoji-terrain-game"
  },
  {
    id: 3,
    name: "Chess Game",
    category: "Games",
    description: "Play chess with emoji pieces in this simple Phaser game.",
    image: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <rect width="100" height="100" fill="#D18B47"/>
        <text x="50" y="50" fontSize="60" textAnchor="middle" dominantBaseline="central">♔♕♖</text>
        <text x="50" y="80" fontSize="30" textAnchor="middle" dominantBaseline="central">♙♙♙</text>
      </svg>
    ),
    link: "/chess-game"
  },
  {
    id: 4,
    name: "Emoji Snake Game",
    category: "Games",
    description: "Play the classic Snake game with emojis!",
    image: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <rect width="100" height="100" fill="#4CAF50"/>
        <text x="50" y="50" fontSize="60" textAnchor="middle" dominantBaseline="central">🐍</text>
        <text x="20" y="20" fontSize="30">🍎</text>
        <text x="80" y="80" fontSize="30">🍎</text>
      </svg>
    ),
    link: "/snake-game"
  },
  {
    id: 5,
    name: "Emoji Platformer",
    category: "Games",
    description: "Survive in a world of emoji zombies in this fun platformer!",
    image: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <rect width="100" height="100" fill="#87CEEB"/>
        <text x="50" y="50" fontSize="60" textAnchor="middle" dominantBaseline="central">🏃</text>
        <text x="20" y="20" fontSize="30">🧟</text>
        <text x="80" y="80" fontSize="30">🧟</text>
      </svg>
    ),
    link: "/emoji-platformer"
  },
  {
    id: 6,
    name: "Retro Chat Connect",
    category: "Communication",
    description: "Chat with friends using WebRTC in a retro-styled interface!",
    image: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <rect width="100" height="100" fill="#000000"/>
        <text x="50" y="50" fontSize="60" textAnchor="middle" dominantBaseline="central">💬</text>
      </svg>
    ),
    link: "/retro-chat-connect"
  },
  {
    id: 7,
    name: "Auto Speech Recognition",
    category: "AI",
    description: "Convert speech to text using AI magic!",
    image: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <rect width="100" height="100" fill="#E6E6FA"/>
        <text x="50" y="50" fontSize="60" textAnchor="middle" dominantBaseline="central">🎙️</text>
      </svg>
    ),
    link: "/autospeechrecognition"
  },
  {
    id: 8,
    name: "Embedding Generator",
    category: "AI",
    description: "Turn your CSV data into fancy AI embeddings!",
    image: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <rect width="100" height="100" fill="#F0FFF0"/>
        <text x="50" y="50" fontSize="60" textAnchor="middle" dominantBaseline="central">📊</text>
      </svg>
    ),
    link: "/embedding-generation"
  },
  {
    id: 9,
    name: "Code Completer",
    category: "AI",
    description: "Watch AI finish your code like a mind reader!",
    image: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <rect width="100" height="100" fill="#F0F8FF"/>
        <text x="50" y="50" fontSize="60" textAnchor="middle" dominantBaseline="central">💻</text>
      </svg>
    ),
    link: "/codecompletion"
  },
  {
    id: 10,
    name: "Sentiment Checker",
    category: "AI",
    description: "See if your words are happy, sad, or somewhere in between!",
    image: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <rect width="100" height="100" fill="#FFF0F5"/>
        <text x="50" y="50" fontSize="60" textAnchor="middle" dominantBaseline="central">😊😐😠</text>
      </svg>
    ),
    link: "/sentimentcheck"
  }
];


const LandingPage = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [catPosition, setCatPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const moveCat = () => {
      setCatPosition({
        x: Math.random() * (window.innerWidth - 50),
        y: Math.random() * (window.innerHeight - 50)
      });
    };

    const interval = setInterval(moveCat, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="nes-container is-dark with-title" style={{ maxWidth: '900px', margin: '2rem auto', backgroundColor: '#2C2C2C' }}>
      <p className="title">Welcome to My Retro Playground</p>

      <div className="nes-container is-rounded" style={{ backgroundColor: '#4A4A4A', marginBottom: '2rem' }}>
        <p className="nes-text is-primary">Explore my digital creations and let&apos;s have some fun!</p>
      </div>

      <div className="nes-container is-dark with-title" style={{ marginTop: '2rem', backgroundColor: '#3A3A3A' }}>
        <p className="title">App Gallery</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1rem' }}>
          {apps.map(app => (
            <Link key={app.id} href={app.link} passHref>
              <div className="nes-container is-rounded" style={{ 
                width: '200px', 
                cursor: 'pointer', 
                transition: 'transform 0.3s', 
                ':hover': { transform: 'scale(1.05)' },
                backgroundColor: ['#FFB3BA', '#BAFFC9', '#BAE1FF', '#FFFFBA'][Math.floor(Math.random() * 4)]
              }}>
                <div style={{ width: '100%', height: '100px', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f0f0' }}>
                  {app.image}
                </div>
                <p className="nes-text is-primary">{app.name}</p>
                <span className="nes-badge"><span className="is-success">{app.category}</span></span>
                <p>{app.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="nes-container is-rounded" style={{ marginTop: '2rem', backgroundColor: '#4A4A4A' }}>
        <p className="nes-text is-primary">Did you spot the cat?</p>
        <p>A playful kitty is roaming around the page. Can you find it?</p>
        <i className="nes-icon is-large star"></i>
      </div>

      <div className="nes-container is-dark with-title" style={{ marginTop: '2rem', backgroundColor: '#3A3A3A' }}>
        <p className="title">A Word from a Fellow Developer</p>
        <div className="nes-balloon from-left" style={{ backgroundColor: '#4A4A4A' }}>
          <p>&quot;These retro apps are a delightful trip down memory lane. Great job on the pixel-perfect details!&quot; - Jane D.</p>
        </div>
        <i className="nes-bcrikko"></i>
      </div>
      
      <div className="nes-container is-dark with-title" style={{ marginTop: '2rem', backgroundColor: '#3A3A3A' }}>
        <p className="title">Let&apos;s Connect!</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
          <i className="nes-icon twitter is-medium"></i>
          <i className="nes-icon github is-medium"></i>
          <i className="nes-icon linkedin is-medium"></i>
        </div>
      </div>

      <div style={{ 
        position: 'fixed', 
        left: `${catPosition.x}px`, 
        top: `${catPosition.y}px`, 
        transition: 'all 2s ease-in-out',
        zIndex: 1000
      }}>
        <i className="nes-icon is-small github"></i>
      </div>

      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>🎉 You found the cat! 🎉</AlertDialogTitle>
            <AlertDialogDescription>
              Nice job spotting our playful feline friend!
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setIsDialogOpen(false)}>Meow-velous!</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default LandingPage;