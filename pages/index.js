import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import portfolioData from '../data/portfolio-items.json';

const CyberpunkSocialMediaLandingPage = () => {
  const [apps, setApps] = useState([]);
  const [featuredApp, setFeaturedApp] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const appsPerPage = 6;

  useEffect(() => {
    const allApps = portfolioData.apps;
    setFeaturedApp(allApps.find(app => app.featured));
    setApps(allApps.filter(app => !app.featured));
  }, []);

  const filteredApps = apps.filter(app => 
    app.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (selectedCategory === '' || app.category === selectedCategory)
  );

  const indexOfLastApp = currentPage * appsPerPage;
  const indexOfFirstApp = indexOfLastApp - appsPerPage;
  const currentApps = filteredApps.slice(indexOfFirstApp, indexOfLastApp);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const categories = [...new Set(apps.map(app => app.category))];

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

      {featuredApp && (
        <div className="retro-post">
          <div className="retro-header">
            🌟 Featured App 🌟
          </div>
          <div className="retro-app-card featured-app">
            <div dangerouslySetInnerHTML={{ __html: featuredApp.image }}></div>
            <p className="retro-app-name">{featuredApp.name}</p>
            <span className="retro-app-category">{featuredApp.category}</span>
            <p className="retro-app-description">{featuredApp.description}</p>
            <Link href={featuredApp.link} className="retro-button">
              Launch App
            </Link>
          </div>
        </div>
      )}

      <div className="retro-post">
        <div className="retro-header">
          🎮 App Gallery 🕹️
        </div>
        <div className="retro-section">
          <input
            type="text"
            placeholder="Search apps..."
            className="retro-input"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="retro-input"
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
        <div className="retro-app-grid">
          {currentApps.map(app => (
            <Link key={app.id} href={app.link} passHref>
              <div className="retro-app-card">
                <div className="retro-app-image-container" dangerouslySetInnerHTML={{ __html: app.image }}></div>
                <p className="retro-app-name">{app.name}</p>
                <span className="retro-app-category">{app.category}</span>
                <p className="retro-app-description">{app.description}</p>
              </div>
            </Link>
          ))}
        </div>
        <div className="retro-pagination">
          {Array.from({ length: Math.ceil(filteredApps.length / appsPerPage) }, (_, i) => (
            <button
              key={i}
              onClick={() => paginate(i + 1)}
              className={`retro-button ${currentPage === i + 1 ? 'active' : ''}`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CyberpunkSocialMediaLandingPage;