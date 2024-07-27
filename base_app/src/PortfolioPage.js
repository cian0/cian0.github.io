import React, { useState } from 'react';
import "nes.css/css/nes.min.css";

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
    )
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
    )
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
    )
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
    )
  }
];

const PortfolioPage = () => {
  const [selectedApp, setSelectedApp] = useState(null);

  return (
    <div className="nes-container with-title is-centered" style={{ maxWidth: '900px', margin: '2rem auto' }}>
      <p className="title">Welcome to My Retro App Portfolio</p>
      
      <div className="nes-container is-rounded">
        <p>Explore a world of 8-bit inspired applications!</p>
      </div>
      
      <div className="nes-container with-title" style={{ marginTop: '2rem' }}>
        <p className="title">App Gallery</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1rem' }}>
          {apps.map(app => (
            <div key={app.id} className="nes-container is-rounded" style={{ width: '200px', cursor: 'pointer' }} onClick={() => setSelectedApp(app)}>
              <div style={{ width: '100%', height: '100px', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f0f0' }}>
                {app.image}
              </div>
              <p className="nes-text is-primary">{app.name}</p>
              <span className="nes-text is-success">{app.category}</span>
            </div>
          ))}
        </div>
      </div>
      
      {selectedApp && (
        <div className="nes-container with-title" style={{ marginTop: '2rem' }}>
          <p className="title">{selectedApp.name}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '100px', height: '100px' }}>
              {selectedApp.image}
            </div>
            <p>{selectedApp.description}</p>
          </div>
          <button type="button" className="nes-btn is-primary" style={{ marginTop: '1rem' }}>Try {selectedApp.name}</button>
        </div>
      )}
      
      <div className="nes-container is-dark with-title" style={{ marginTop: '2rem' }}>
        <p className="title">Connect With Us</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
          <i className="nes-icon twitter is-large"></i>
          <i className="nes-icon facebook is-large"></i>
          <i className="nes-icon github is-large"></i>
        </div>
      </div>
    </div>
  );
};

export default PortfolioPage;