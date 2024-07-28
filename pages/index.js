import React from 'react';
import Link from 'next/link';

const apps = [
  {
    id: 1,
    name: "Retro RPG Adventure",
    category: "Games",
    description: "Embark on an 8-bit journey through pixelated landscapes.",
    image: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <rect width="100" height="100" fill="#000"/>
        <circle cx="50" cy="50" r="40" fill="#fff"/>
        <rect x="40" y="40" width="20" height="20" fill="#000"/>
      </svg>
    ),
    link: "/retro-rpg" // Dummy link
  },
  {
    id: 2,
    name: "Pixel Art Creator",
    category: "Creative",
    description: "Design your own 8-bit masterpieces with our easy-to-use tool.",
    image: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <rect width="100" height="100" fill="#f0f0f0"/>
        <rect x="10" y="10" width="20" height="20" fill="#ff0000"/>
        <rect x="40" y="10" width="20" height="20" fill="#00ff00"/>
        <rect x="70" y="10" width="20" height="20" fill="#0000ff"/>
        <rect x="10" y="40" width="20" height="20" fill="#ffff00"/>
        <rect x="40" y="40" width="20" height="20" fill="#ff00ff"/>
        <rect x="70" y="40" width="20" height="20" fill="#00ffff"/>
      </svg>
    ),
    link: "/pixel-art-creator" // Dummy link
  },
  {
    id: 3,
    name: "NES-style Task Manager",
    category: "Business",
    description: "Manage your tasks with a nostalgic twist. Be productive in style!",
    image: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <rect width="100" height="100" fill="#fff"/>
        <rect x="10" y="20" width="80" height="10" fill="#000"/>
        <rect x="10" y="40" width="60" height="10" fill="#000"/>
        <rect x="10" y="60" width="70" height="10" fill="#000"/>
      </svg>
    ),
    link: "/task-manager" // Dummy link
  },
  {
    id: 4,
    name: "Chiptune Music Maker",
    category: "Music",
    description: "Compose 8-bit melodies and create your own game soundtracks.",
    image: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <rect width="100" height="100" fill="#000"/>
        <rect x="10" y="20" width="10" height="60" fill="#fff"/>
        <rect x="30" y="40" width="10" height="40" fill="#fff"/>
        <rect x="50" y="30" width="10" height="50" fill="#fff"/>
        <rect x="70" y="50" width="10" height="30" fill="#fff"/>
      </svg>
    ),
    link: "/chiptune-maker" // Dummy link
  },
  {
    id: 5,
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
    id: 6,
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
    id: 7,
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
    id: 8,
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
    id: 9,
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
  }
];

const LandingPage = () => {
  return (
    <div>
    <div className="nes-container with-title is-centered" style={{ maxWidth: '900px', margin: '2rem auto' }}>
      <p className="title">Welcome to My Retro App Portfolio</p>
      
      <div className="nes-container is-rounded">
        <p>Explore a world of 8-bit inspired applications!</p>
      </div>
      
      <div className="nes-container with-title" style={{ marginTop: '2rem' }}>
        <p className="title">App Gallery</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1rem' }}>
          {apps.map(app => (
            <Link key={app.id} href={app.link} passHref>
              <div className="nes-container is-rounded" style={{ width: '200px', cursor: 'pointer' }}>
                <div style={{ width: '100%', height: '100px', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f0f0' }}>
                  {app.image}
                </div>
                <p className="nes-text is-primary">{app.name}</p>
                <span className="nes-text is-success">{app.category}</span>
                <p>{app.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
      
      <div className="nes-container is-dark with-title" style={{ marginTop: '2rem' }}>
        <p className="title">Connect With Us</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
          <i className="nes-icon twitter is-large"></i>
          <i className="nes-icon facebook is-large"></i>
          <i className="nes-icon github is-large"></i>
        </div>
      </div>
    </div>
    </div>
  );
};

export default LandingPage;