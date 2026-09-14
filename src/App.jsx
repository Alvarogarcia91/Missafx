import React, { useState, useEffect } from 'react';
import { LanguageProvider } from './context/LanguageContext';
import Navbar from './components/Navbar.jsx';
import Hero from './components/Hero.jsx';
import SocialHub from './components/SocialHub.jsx';
import MediaCarousel from './components/MediaCarousel.jsx';
import About from './components/About.jsx';
import Booking from './components/Booking.jsx';
import Footer from './components/Footer.jsx';
import DjTools from './components/DjTools.jsx';
import StoryCreator from './components/StoryCreator.jsx';
import CardCreator from './components/CardCreator.jsx';

export default function App() {
  const [view, setView] = useState(() => {
    if (window.location.hash === '#story-creator') return 'story-creator';
    if (window.location.hash === '#card-creator') return 'card-creator';
    return 'home';
  });

  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#story-creator') {
        setView('story-creator');
        window.scrollTo({ top: 0, behavior: 'instant' });
      } else if (window.location.hash === '#card-creator') {
        setView('card-creator');
        window.scrollTo({ top: 0, behavior: 'instant' });
      } else {
        setView('home');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const openStoryCreator = () => {
    window.location.hash = '#story-creator';
    setView('story-creator');
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const openCardCreator = () => {
    window.location.hash = '#card-creator';
    setView('card-creator');
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const backToHome = () => {
    window.location.hash = '';
    setView('home');
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  return (
    <LanguageProvider>
      <div className="app-wrapper">
        {view === 'story-creator' ? (
          <StoryCreator onBack={backToHome} />
        ) : view === 'card-creator' ? (
          <CardCreator onBack={backToHome} />
        ) : (
          <>
            <Navbar />
            <main>
              <Hero />
              <SocialHub />
              <MediaCarousel />
              <About />
              <Booking />
              <DjTools
                onOpenStoryCreator={openStoryCreator}
                onOpenCardCreator={openCardCreator}
              />
            </main>
            <Footer />
          </>
        )}
      </div>
    </LanguageProvider>
  );
}
