import React, { useState, useEffect } from 'react';
import { LanguageProvider } from './context/LanguageContext';
import { SiteConfigProvider } from './context/SiteConfigContext';
import Navbar from './components/Navbar.jsx';
import Hero from './components/Hero.jsx';
import SocialHub from './components/SocialHub.jsx';
import About from './components/About.jsx';
import Booking from './components/Booking.jsx';
import Footer from './components/Footer.jsx';
import DjTools from './components/DjTools.jsx';
import StoryCreator from './components/StoryCreator.jsx';
import CardCreator from './components/CardCreator.jsx';
import UpcomingEvents from './components/UpcomingEvents.jsx';
import LiveSets from './components/LiveSets.jsx';
import EventAdminModal from './components/EventAdminModal.jsx';
import { recordSiteVisit, recordWhatsAppClick, recordNexoraClick } from './utils/supabaseClient';

export default function App() {
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [hasEvents, setHasEvents] = useState(false);
  const [view, setView] = useState(() => {
    if (window.location.hash === '#story-creator') return 'story-creator';
    if (window.location.hash === '#card-creator') return 'card-creator';
    return 'home';
  });

  // Track site visit & WhatsApp booking conversions
  useEffect(() => {
    recordSiteVisit();

    const handleGlobalClick = (e) => {
      try {
        const anchor = e.target?.closest?.('a');
        if (anchor && anchor.href) {
          const href = anchor.href.toLowerCase();
          if (href.includes('wa.me') || href.includes('whatsapp.com')) {
            recordWhatsAppClick();
          }
          if (href.includes('itnexora.com') || href.includes('nexora')) {
            recordNexoraClick();
          }
        }
      } catch (err) {
        // silent
      }
    };

    document.addEventListener('click', handleGlobalClick, { capture: true });
    return () => {
      document.removeEventListener('click', handleGlobalClick, { capture: true });
    };
  }, []);

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
      <SiteConfigProvider>
        <div className="app-wrapper">
          {view === 'story-creator' ? (
            <StoryCreator onBack={backToHome} />
          ) : view === 'card-creator' ? (
            <CardCreator onBack={backToHome} />
          ) : (
            <>
              <Navbar hasEvents={hasEvents} />
              <main>
                <Hero />
                <UpcomingEvents
                  onOpenAdmin={() => setAdminModalOpen(true)}
                  onEventsChange={(count) => setHasEvents(count > 0)}
                />
                <SocialHub />
                <LiveSets />
                <About />
                <Booking />
                <DjTools
                  onOpenStoryCreator={openStoryCreator}
                  onOpenCardCreator={openCardCreator}
                />
              </main>
              <Footer onOpenAdmin={() => setAdminModalOpen(true)} />
              <EventAdminModal
                isOpen={adminModalOpen}
                onClose={() => setAdminModalOpen(false)}
              />
            </>
          )}
        </div>
      </SiteConfigProvider>
    </LanguageProvider>
  );
}
