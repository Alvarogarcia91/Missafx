import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Disc, ExternalLink, Radio, Flame, Sparkles } from 'lucide-react';

const TRACKS = [
  {
    id: 1,
    title: 'Midnight Velocity (Club Mix)',
    category: 'Original Mixes',
    duration: '05:42',
    bpm: '126 BPM',
    key: 'F#m',
    tags: ['Tech House', 'Peak Time'],
    links: {
      spotify: 'https://spotify.com',
      soundcloud: 'https://soundcloud.com',
      beatport: 'https://beatport.com'
    }
  },
  {
    id: 2,
    title: 'Euphoria Festival Live Set 2026',
    category: 'Live Sets',
    duration: '58:14',
    bpm: '128 BPM',
    key: 'Gm',
    tags: ['Mainstage', 'Festival'],
    links: {
      spotify: 'https://spotify.com',
      soundcloud: 'https://soundcloud.com',
      youtube: 'https://youtube.com'
    }
  },
  {
    id: 3,
    title: 'Sunset Sessions Vol. 04',
    category: 'Live Sets',
    duration: '42:30',
    bpm: '124 BPM',
    key: 'Am',
    tags: ['Deep Melodic', 'Sunset'],
    links: {
      spotify: 'https://spotify.com',
      soundcloud: 'https://soundcloud.com',
      youtube: 'https://youtube.com'
    }
  },
  {
    id: 4,
    title: 'Neon Pulse (Underground Edit)',
    category: 'Original Mixes',
    duration: '06:15',
    bpm: '127 BPM',
    key: 'Dm',
    tags: ['Minimal Techno', 'Club'],
    links: {
      spotify: 'https://spotify.com',
      soundcloud: 'https://soundcloud.com',
      beatport: 'https://beatport.com'
    }
  },
  {
    id: 5,
    title: 'Resonance Rework (Missa Bootleg)',
    category: 'Remixes',
    duration: '04:58',
    bpm: '128 BPM',
    key: 'Em',
    tags: ['Bootleg', 'Bassline'],
    links: {
      soundcloud: 'https://soundcloud.com'
    }
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

  // Web Audio Synth for interactive ambient beat demo
  const togglePlay = (track) => {
    if (currentTrack.id === track.id && isPlaying) {
      setIsPlaying(false);
      stopAudioSynth();
    } else {
      setCurrentTrack(track);
      setIsPlaying(true);
      startAudioSynth();
    }
  };

  const startAudioSynth = () => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
    } catch (e) {
      console.log('AudioContext not allowed yet:', e);
    }
  };

  const stopAudioSynth = () => {
    // Keep context alive
  };

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setProgress((prev) => (prev >= 100 ? 0 : prev + 0.5));
      }, 500);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isPlaying]);

  return (
    <section id="music" style={{ padding: '100px 0', position: 'relative' }}>
      <div className="container">
        <div className="section-header">
          <span className="section-tag">DISCOGRAFÍA & SETS</span>
          <h2>ÚLTIMOS LANZAMIENTOS</h2>
          <p>
            Escucha la selección curada de producciones originales, sets en vivo y remezclas exclusivas de DJ Missa.
          </p>
        </div>

        {/* Category Filters */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '12px',
            flexWrap: 'wrap',
            marginBottom: '40px'
          }}
        >
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className="btn btn-sm"
              style={{
                background: selectedCategory === cat ? 'var(--gradient-neon)' : 'rgba(255, 255, 255, 0.05)',
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
            marginBottom: '40px',
            border: '1px solid rgba(168, 85, 247, 0.3)',
            background: 'linear-gradient(90deg, rgba(168, 85, 247, 0.08) 0%, rgba(6, 182, 212, 0.08) 100%)'
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
                  width: '60px',
                  height: '60px',
                  padding: 0,
                  borderRadius: '50%',
                  flexShrink: 0
                }}
                aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
              >
                {isPlaying ? <Pause size={24} fill="#fff" /> : <Play size={24} fill="#fff" style={{ marginLeft: '3px' }} />}
              </button>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span className="badge" style={{ padding: '2px 8px', fontSize: '0.7rem' }}>
                    {isPlaying ? 'REPRODUCIENDO PREVIEW' : 'PREVIEW LISTO'}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)' }}>
                    {currentTrack.bpm} • {currentTrack.key}
                  </span>
                </div>
                <h3 className="font-display" style={{ fontSize: '1.25rem', color: '#fff' }}>
                  {currentTrack.title}
                </h3>
              </div>
            </div>

            {/* Progress Bar & EQ */}
            <div style={{ flex: '1 1 300px', maxWidth: '450px' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.75rem',
                  color: 'var(--text-dim)',
                  marginBottom: '8px'
                }}
              >
                <span>01:45</span>
                <span>{currentTrack.duration}</span>
              </div>
              <div
                style={{
                  width: '100%',
                  height: '6px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '3px',
                  overflow: 'hidden',
                  cursor: 'pointer'
                }}
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const clickX = e.clientX - rect.left;
                  setProgress((clickX / rect.width) * 100);
                }}
              >
                <div
                  style={{
                    width: `${progress}%`,
                    height: '100%',
                    background: 'var(--gradient-neon)',
                    boxShadow: '0 0 10px rgba(236, 72, 153, 0.6)',
                    transition: 'width 0.2s linear'
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Tracks List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {filteredTracks.map((track, idx) => {
            const isCurrent = currentTrack.id === track.id;
            return (
              <div
                key={track.id}
                className="glass-panel"
                style={{
                  padding: '16px 24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '16px',
                  borderColor: isCurrent ? 'var(--accent-purple)' : 'var(--border-glass)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
                  <button
                    onClick={() => togglePlay(track)}
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '50%',
                      background: isCurrent && isPlaying ? 'var(--gradient-neon)' : 'rgba(255, 255, 255, 0.08)',
                      border: 'none',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {isCurrent && isPlaying ? (
                      <Pause size={18} fill="#fff" />
                    ) : (
                      <Play size={18} fill="#fff" style={{ marginLeft: '2px' }} />
                    )}
                  </button>

                  <div>
                    <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#fff', marginBottom: '2px' }}>
                      {track.title}
                    </h4>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)' }}>{track.bpm}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>•</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{track.key}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>•</span>
                      {track.tags.map((tag) => (
                        <span
                          key={tag}
                          style={{
                            fontSize: '0.7rem',
                            padding: '2px 8px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            borderRadius: '4px',
                            color: 'var(--text-dim)'
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-dim)', fontVariantNumeric: 'tabular-nums' }}>
                    {track.duration}
                  </span>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    {track.links.spotify && (
                      <a
                        href={track.links.spotify}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                      >
                        Spotify <ExternalLink size={12} />
                      </a>
                    )}
                    {track.links.soundcloud && (
                      <a
                        href={track.links.soundcloud}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                      >
                        SoundCloud <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
