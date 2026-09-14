import React from 'react';
import Navbar from './components/Navbar.jsx';
import Hero from './components/Hero.jsx';
import SocialHub from './components/SocialHub.jsx';
import MusicPlayer from './components/MusicPlayer.jsx';
import About from './components/About.jsx';
import Booking from './components/Booking.jsx';
import Footer from './components/Footer.jsx';

export default function App() {
  return (
    <div className="app-wrapper">
      <Navbar />
      <main>
        <Hero />
        <SocialHub />
        <MusicPlayer />
        <About />
        <Booking />
      </main>
      <Footer />
    </div>
  );
}
