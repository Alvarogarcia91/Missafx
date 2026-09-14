import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Disc, ExternalLink, Radio, Flame, Sparkles, Volume2 } from 'lucide-react';

const TRACKS = [
  {
    id: 1,
    title: 'Peak Time Velocity (Original Mix)',
    category: 'Original Mixes',
    duration: '05:42',
    bpm: '128 BPM',
    key: 'F#m',
    tags: ['Tech House', 'Club Mix'],
    url: 'https://soundcloud.com/missael-arath'
  },
  {
    id: 2,
    title: 'Missafx Live Session 2026',
    category: 'Live Sets',
    duration: '52:10',
    bpm: '127 BPM',
    key: 'Am',
    tags: ['Live Set', 'Underground'],
    url: 'https://soundcloud.com/missael-arath'
  },
  {
    id: 3,
    title: 'Dark Horizon (Missa Rework)',
    category: 'Remixes',
    duration: '06:18',
    bpm: '129 BPM',
    key: 'Dm',
    tags: ['Bootleg', 'Bass House'],
    url: 'https://soundcloud.com/missael-arath'
  },
  {
    id: 4,
    title: 'Sunset Pulse Live Stream',
    category: 'Live Sets',
    duration: '44:25',
    bpm: '126 BPM',
    key: 'Gm',
    tags: ['Tech House', 'Kick Stream'],
    url: 'https://kick.com/7missa'
  }
];

export default function MusicPlayer() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [currentTrack, setCurrentTrack] = useState(TRACKS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(25);
  const audioCtxRef = useRef(null);
  const intervalRef = useRef(null);

  const categories = ['All', 'Original Mixes', 'Live Sets', 'Remixes'];

  const filteredTracks = selectedCategory === 'All'
    ? TRACKS
    : TRACKS.filter(t => t.category === selectedCategory);

  const togglePlay = (track) => {
    if (currentTrack.id === track.id && isPlaying) {
      setIsPlaying(false);
    } else {
      setCurrentTrack(track);
      setIsPlaying(true);
      try {
        if (!audioCtxRef.current) {
          audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtxRef.current.state === 'suspended') {
          audioCtxRef.current.resume();
        }
      } catch (e) {
        console.log('AudioContext ready');
      }
    }
  };

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setProgress((prev) => (prev >= 100 ? 0 : prev + 0.6));
      }, 400);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isPlaying]);

  return (
    <section id="music" style={{ padding: '90px 0', position: 'relative' }}>
      <div className="container">
        <div className="section-header">
          <span className="section-tag">CATÁLOGO & SESIONES</span>
          <h2>PRODUCCIÓN & MIXES</h2>
          <p>
            Escucha una muestra de los tracks y sesiones en vivo disponibles en el SoundCloud y canales oficiales de Missafx.
          </p>
        </div>

        {/* Category Filters */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '12px',
            flexWrap: 'wrap',
            marginBottom: '36px'
          }}
        >
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className="btn btn-sm"
              style={{
                background: selectedCategory === cat ? 'var(--gradient-crimson)' : 'rgba(255, 255, 255, 0.05)',
                color: selectedCategory === cat ? '#fff' : 'var(--text-muted)',
                border: '1px solid',
                borderColor: selectedCategory === cat ? 'transparent' : 'var(--border-glass)'
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Active Player Banner */}
        <div
          className="glass-panel"
          style={{
            padding: '28px',
            marginBottom: '36px',
            border: '1px solid rgba(255, 0, 60, 0.3)',
            background: 'linear-gradient(90deg, rgba(255, 0, 60, 0.08) 0%, rgba(20, 20, 26, 0.95) 100%)'
          }}
        >
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '24px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <button
                onClick={() => togglePlay(currentTrack)}
                className="btn btn-primary"
                style={{
                  width: '58px',
                  height: '58px',
                  padding: 0,
                  borderRadius: '50%',
                  flexShrink: 0
                }}
                aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
              >
                {isPlaying ? <Pause size={24} fill="#fff" /> : <Play size={24} fill="#fff" style={{ marginLeft: '3px' }} />}
              </button>

              <div>
                <span
                  style={{
                    fontSize: '0.75rem',
                    color: '#FF003C',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase'
                  }}
                >
                  REPRODUCIENDO DEMO • {currentTrack.bpm}
                </span>
                <h3
                  className="font-display"
                  style={{ fontSize: '1.25rem', color: '#fff', margin: '3px 0' }}
                >
                  {currentTrack.title}
                </h3>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>
                  Key: {currentTrack.key} • {currentTrack.duration}
                </span>
              </div>
            </div>

            {/* Waveform / Progress Bar */}
            <div style={{ flex: '1 1 300px', maxWidth: '460px' }}>
              <div
                style={{
                  width: '100%',
                  height: '6px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  marginBottom: '8px'
                }}
              >
                <div
                  style={{
                    width: `${progress}%`,
                    height: '100%',
                    background: 'var(--gradient-crimson)',
                    borderRadius: '4px',
                    transition: 'width 0.2s linear'
                  }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                <span>01:24</span>
                <span>{currentTrack.duration}</span>
              </div>
            </div>

            <a
              href="https://soundcloud.com/missael-arath"
              target="_blank"
              rel="noreferrer"
              className="btn btn-secondary btn-sm"
              style={{ gap: '8px' }}
            >
              <span>Ver en SoundCloud</span>
              <ExternalLink size={15} />
            </a>
          </div>
        </div>

        {/* Tracks List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredTracks.map((track, idx) => {
            const isCurrent = currentTrack.id === track.id;
            return (
              <div
                key={track.id}
                className="glass-panel"
                style={{
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px',
                  borderColor: isCurrent ? 'rgba(255, 0, 60, 0.4)' : 'var(--border-glass)',
                  background: isCurrent ? 'rgba(255, 0, 60, 0.04)' : 'var(--bg-card)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <button
                    onClick={() => togglePlay(track)}
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '50%',
                      background: isCurrent && isPlaying ? '#FF003C' : 'rgba(255, 255, 255, 0.08)',
                      border: 'none',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer'
                    }}
                  >
                    {isCurrent && isPlaying ? <Pause size={16} fill="#fff" /> : <Play size={16} fill="#fff" style={{ marginLeft: '2px' }} />}
                  </button>

                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#fff' }}>
                      {track.title}
                    </h4>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                      {track.bpm} • {track.key}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {track.tags.map(tag => (
                      <span
                        key={tag}
                        style={{
                          fontSize: '0.72rem',
                          background: 'rgba(255, 255, 255, 0.05)',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          color: 'var(--text-muted)'
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <a
                    href={track.url}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                  >
                    <ExternalLink size={13} />
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* Global SoundCloud CTA */}
        <div style={{ textAlign: 'center', marginTop: '36px' }}>
          <a
            href="https://soundcloud.com/missael-arath"
            target="_blank"
            rel="noreferrer"
            className="btn btn-secondary"
            style={{ gap: '10px' }}
          >
            <Disc size={18} color="#FF003C" /> Ir al Perfil Completo en SoundCloud
          </a>
        </div>
      </div>
    </section>
  );
}
