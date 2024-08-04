import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import portfolioData from '../data/portfolio-items.json';
import { useCarousel } from "@/components/ui/carousel";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";

const CyberpunkSocialMediaLandingPage = () => {
  const [apps, setApps] = useState([]);
  const [featuredApps, setFeaturedApps] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const appsPerPage = 6;

  const wittyMessages = [
    "Initializing the flux capacitor...",
    "Downloading more RAM...",
    "Hacking the mainframe...",
    "Reticulating splines...",
    "Generating witty loading messages...",
    "Warming up the holodeck...",
    "Calculating the meaning of life...",
    "Untangling quantum spaghetti...",
    "Just kidding, there's nothing here yet!",
    "You should probably close this and try the apps instead.",
  ];

  useEffect(() => {
    const allApps = portfolioData.apps;
    setFeaturedApps(allApps.filter(app => app.featured));
    setApps(allApps);
  }, []);

  useEffect(() => {
    if (isModalOpen) {
      let currentIndex = 0;
      const interval = setInterval(() => {
        setLoadingMessage(wittyMessages[currentIndex]);
        currentIndex = (currentIndex + 1) % wittyMessages.length;
        if (currentIndex === wittyMessages.length - 1) {
          clearInterval(interval);
        }
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [isModalOpen]);

  const filteredApps = apps.filter(app => 
    app.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (selectedCategory === '' || app.category === selectedCategory)
  );

  const indexOfLastApp = currentPage * appsPerPage;
  const indexOfFirstApp = indexOfLastApp - appsPerPage;
  const currentApps = filteredApps.slice(indexOfFirstApp, indexOfLastApp);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const categories = [...new Set(apps.map(app => app.category))];

  const FeaturedAppsCarousel = () => {
    const [api, setApi] = React.useState()
    const [current, setCurrent] = React.useState(0)

    React.useEffect(() => {
      if (!api) {
        return
      }
 
      setCurrent(api.selectedScrollSnap())
 
      api.on("select", () => {
        setCurrent(api.selectedScrollSnap())
      })
    }, [api])

    return (
      <>
        <Carousel setApi={setApi} className="w-full max-w-xs mx-auto">
          <CarouselContent>
            {featuredApps.map((app, index) => (
              <CarouselItem key={index}>
                <div className="p-1">
                  <Card className="retro-app-card featured-app">
                    <CardContent className="flex flex-col items-center justify-center p-6 ">
                        <div className="retro-app-image-container" dangerouslySetInnerHTML={{ __html: app.image }}></div>
                        <p className="retro-app-name">{app.name}</p>
                        <span className="retro-app-category">{app.category}</span>
                        <p className="retro-app-description">{app.description}</p>
                        <Link href={app.link} className="retro-button">
                          Launch App
                        </Link>
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
        <div className="retro-carousel-indicators">
          {featuredApps.map((_, index) => (
            <button
              key={index}
              className={`retro-carousel-indicator ${index === current ? 'active' : ''}`}
              onClick={() => api?.scrollTo(index)}
            />
          ))}
        </div>
      </>
    )
  }

  return (
    <div className="retro-container">
      <div className="retro-post">
      <div className="retro-header flex items-center justify-center">
        ⚡ DIGITAL VIBE CHECK 2.0 📡
      </div>

      <div className="retro-section">
        <p className="text-lg font-bold mb-2">🔥 Yeet Your Boring Life into the Cybervoid! 🔥</p>
        <p>👾 Slide into our DMs! Brain go brrr 24/7 👾</p>
        <p>📍 Where we droppin&apos;? The Neon-Drenched TikTok of the Metaverse</p>
      </div>

      <div className="retro-section">
        <p className="font-bold">💼 Hit Up Your Cyber Bestie:</p>
        <p>🤖 MemeWizard-69, Lord of the Digital Glow Up</p>
        <p>📞 1-800-OK-BOOMER</p>
      </div>

      <div className="retro-section">
        <p className="text-lg font-bold" style={{color: 'var(--retro-accent)'}}>
          🌟 BECOME THE MAIN CHARACTER OF THE SIMULATION 🌟
        </p>
        <p>🎉 No Cap: Free Brain Update with Every Sign Up! 🎉</p>
        <p>💡 We Don&apos;t Just Break the Internet, We Are the Internet 💡</p>
      </div>

      <div className="retro-section">
        <p className="text-lg font-bold mb-2" style={{color: 'var(--retro-accent)'}}>
          🚀 What&apos;s the Tea in Our Digital Dimension?
        </p>
        <ul className="list-none pl-0">
          <li className="mb-2">🌐 The Whole Memeiverse: Now in 4K HDR!</li>
          <li className="mb-2">🕶️ Virtual Flex Zones (Drip Required, Pants Optional)</li>
          <li className="mb-2">🔐 Quantum-Encrypted Shower Thoughts (Tin Foil Snapback Included)</li>
          <li className="mb-2">🎮 Digital Playgrounds: Fortnite Meets Minecraft on Steroids</li>
          <li className="mb-2">🤝 69D Social Network: Slide into DMs Across Multiverses</li>
          <li className="mb-2">🧠 AI Squad Goals: They&apos;re Like Alexa, But Actually Understand Your Vibe</li>
          <li className="mb-2">⚒️ Meme Stonks Factory: Build Your Own NFT Empire</li>
          <li className="mb-2">🎨 Holographic TikTok Studios: Make Your Content Break the Space-Time Continuum</li>
        </ul>
      </div>

      <button 
        className="retro-button w-full py-3 text-lg font-bold"
        onClick={() => setIsModalOpen(true)}
      >
        🚀 Vibe Check Initiated: Let&apos;s Yeet into the Metaverse! 🚀
      </button>
    </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="retro-modal">
          <div className="retro-loading-spinner"></div>
          <p className="retro-loading-text">{loadingMessage}</p>
          <DialogClose asChild>
            <button className="retro-button mt-4">Close</button>
          </DialogClose>
        </DialogContent>
      </Dialog>

      {featuredApps.length > 0 && (
        <div className="retro-post">
          <div className="retro-header">
            🌟 Featured Apps 🌟
          </div>
          <FeaturedAppsCarousel />
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