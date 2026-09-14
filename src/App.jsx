import React from 'react';
import { LanguageProvider } from './context/LanguageContext';
import Navbar from './components/Navbar.jsx';
import Hero from './components/Hero.jsx';
import SocialHub from './components/SocialHub.jsx';
import About from './components/About.jsx';
import Booking from './components/Booking.jsx';
import Footer from './components/Footer.jsx';
import DjTools from './components/DjTools.jsx';

export default function App() {
  return (
    <LanguageProvider>
      <div className="app-wrapper">
        <Navbar />
        <main>
          <Hero />
          <SocialHub />
          <About />
          <Booking />
          <DjTools />
        </main>
        <Footer />
      </div>
    </LanguageProvider>
  );
}
