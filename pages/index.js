import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import portfolioData from '../data/portfolio-items.json';

const CyberpunkSocialMediaLandingPage = () => {
  const [apps, setApps] = useState([]);

  useEffect(() => {
    setApps(portfolioData.apps);
  }, []);

  return (
    <div className="retro-container">
      <div className="retro-post">
        <div className="retro-header">
          🚀 DIGITAL NEW ERA 🌐
        </div>

        <div className="retro-section">
          <p>🔥 Revolutionizing the digital landscape! 🔥</p>
          <p>👨‍💻 BOOK NOW!! Cyber consultations available 24/7 👩‍💻</p>
          <p>📍 Loc: The Heart of Cyberspace</p>
        </div>

        <div className="retro-section">
          <p>💼 Contact Your AI Guide</p>
          <p>🤖 CyberAssist-9000</p>
          <p>📞 0101-CYBER-HELP</p>
        </div>

        <div className="retro-section">
          <p style={{fontWeight: 'bold', color: 'var(--retro-accent)'}}>🌟 BE OUR NEXT DIGITAL PIONEER 🌟</p>
          <p>🎉 Grand Opening Cyber-Special 🎉</p>
          <p>💡 Unlock limitless potential in the digital realm 💡</p>
        </div>

        <div className="retro-section">
          <p style={{fontWeight: 'bold', color: 'var(--retro-accent)'}}>🚀 What&apos;s in store for you?</p>
          <p>🌐 The ENTIRE cyberspace at your fingertips!</p>
          <p>💻 Virtual Reality Workspaces</p>
          <p>🔒 Quantum-encrypted data streams</p>
          <p>🎮 Access to cutting-edge digital playgrounds</p>
          <p>🤝 Networking in the 4th dimension</p>
          <p>📚 AI-powered knowledge banks</p>
          <p>🔧 Digital asset forge</p>
          <p>🎨 Holographic design studios</p>
        </div>

        <button className="retro-button">🚀 Blast Off Into The Digital Frontier 🚀</button>
      </div>

      <div className="retro-post">
        <div className="retro-header">
          🎮 Game Selection 🕹️
        </div>
        <p>Explore our latest digital creations:</p>
        <div className="retro-app-grid">
          {apps.map(app => (
            <Link key={app.id} href={app.link} passHref>
              <div className="retro-app-card">
                <div className="retro-app-image-container">
                  <div dangerouslySetInnerHTML={{ __html: app.image }} className="retro-app-svg" />
                </div>
                <p className="retro-app-name">{app.name}</p>
                <span className="retro-app-category">
                  {app.category}
                </span>
                <p className="retro-app-description">{app.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CyberpunkSocialMediaLandingPage;