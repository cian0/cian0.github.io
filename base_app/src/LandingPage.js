import React from 'react';
import "nes.css/css/nes.min.css";

const LandingPage = () => {
  return (
    <div className="nes-container with-title is-centered" style={{ maxWidth: '800px', margin: '2rem auto' }}>
      <p className="title">Welcome to Retro World</p>
      <div className="nes-container is-rounded">
        <p>Experience the nostalgia of 8-bit design!</p>
      </div>
      
      <div className="nes-container with-title" style={{ marginTop: '2rem' }}>
        <p className="title">Features</p>
        <ul className="nes-list is-disc">
          <li>Pixelated graphics</li>
          <li>Nostalgic sound effects</li>
          <li>Classic game references</li>
        </ul>
      </div>
      
      <div style={{ marginTop: '2rem' }}>
        <button type="button" className="nes-btn is-primary">Start Adventure</button>
        <button type="button" className="nes-btn is-success" style={{ marginLeft: '1rem' }}>Learn More</button>
      </div>
      
      <progress className="nes-progress is-success" value="90" max="100" style={{ marginTop: '2rem' }}></progress>
      
      <div className="nes-container is-dark with-title" style={{ marginTop: '2rem' }}>
        <p className="title">Join Our Community</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
          <i className="nes-icon twitter is-large"></i>
          <i className="nes-icon facebook is-large"></i>
          <i className="nes-icon github is-large"></i>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;