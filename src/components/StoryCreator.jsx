import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  ArrowLeft,
  Download,
  Upload,
  Layers,
  Type,
  Maximize2,
  Sliders,
  Check,
  RefreshCw,
  Eye,
  EyeOff,
  Sparkles,
  Smartphone,
  Square,
  RectangleVertical,
  CheckCircle2,
  AlertCircle,
  Palette,
  Play,
  Pause,
  Film,
  Video,
  Zap,
  Activity,
  Radio,
  Clock,
  ChevronDown,
  ChevronUp,
  AlignLeft,
  AlignCenter,
  AlignRight,
  RotateCcw
} from 'lucide-react';
import { GIFEncoder, quantize, applyPalette } from 'gifenc';
import { Muxer, ArrayBufferTarget } from 'mp4-muxer';
import { useLanguage } from '../context/LanguageContext';

const FORMATS = {
  story: {
    id: 'story',
    nameKey: 'storyFormat',
    dimKey: 'storyDim',
    noteKey: 'storyNote',
    width: 1080,
    height: 1920,
    aspectRatio: '9 / 16',
    icon: Smartphone
  },
  square: {
    id: 'square',
    nameKey: 'squareFormat',
    dimKey: 'squareDim',
    noteKey: 'squareNote',
    width: 1080,
    height: 1080,
    aspectRatio: '1 / 1',
    icon: Square
  },
  portrait: {
    id: 'portrait',
    nameKey: 'portraitFormat',
    dimKey: 'portraitDim',
    noteKey: 'portraitNote',
    width: 1080,
    height: 1350,
    aspectRatio: '4 / 5',
    icon: RectangleVertical
  }
};

const DEFAULT_PRESETS = [
  { id: 'capture1', nameKey: 'photoPreset1', name: '01 Pioneer CDJ Booth', src: '/gallery/missa-01.jpg' },
  { id: 'capture2', nameKey: 'photoPreset2', name: '02 Dark Clubber Art', src: '/gallery/missa-02.jpg' },
  { id: 'live3', name: '03 Studio Branding', src: '/gallery/missa-03.png' },
  { id: 'live4', name: '04 Club Energy', src: '/gallery/missa-04.jpg' },
  { id: 'live5', name: '05 Stage Lights', src: '/gallery/missa-05.jpg' },
  { id: 'live6', name: '06 Nightclub Crowd', src: '/gallery/missa-06.jpg' },
  { id: 'live7', name: '07 Headliner Set', src: '/gallery/missa-07.jpg' },
  { id: 'live8', name: '08 Peak Time Set', src: '/gallery/missa-08.jpg' },
  { id: 'live9', name: '09 Decks & FX', src: '/gallery/missa-09.jpg' }
];

const COLOR_PRESETS = [
  { id: 'red', nameKey: 'themeRed', hex: '#FF003C' },
  { id: 'kick', nameKey: 'themeKick', hex: '#53FC18' },
  { id: 'violet', nameKey: 'themeViolet', hex: '#A855F7' },
  { id: 'cyan', nameKey: 'themeCyan', hex: '#00F0FF' },
  { id: 'gold', nameKey: 'themeGold', hex: '#EAB308' },
  { id: 'white', nameKey: 'themeWhite', hex: '#FFFFFF' }
];

// Helper to convert hex to rgba
const hexToRgba = (hex, alpha = 1) => {
  if (!hex) return `rgba(255, 0, 60, ${alpha})`;
  let c = hex.replace('#', '');
  if (c.length === 3) {
    c = c.split('').map((char) => char + char).join('');
  }
  const num = parseInt(c, 16);
  if (isNaN(num)) return `rgba(255, 0, 60, ${alpha})`;
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

// Calculate brightness to validate contrast and prevent white-on-white / unreadable text
const isLightColor = (hex) => {
  if (!hex) return false;
  let c = hex.replace('#', '');
  if (c.length === 3) c = c.split('').map((x) => x + x).join('');
  const r = parseInt(c.substring(0, 2), 16) || 0;
  const g = parseInt(c.substring(2, 4), 16) || 0;
  const b = parseInt(c.substring(4, 6), 16) || 0;
  return (r * 299 + g * 587 + b * 114) / 1000 > 160;
};

const getAutoContrastColor = (bgHex) => {
  return isLightColor(bgHex) ? '#060608' : '#FFFFFF';
};

// Hardware-accelerated VHS Scanline pattern renderer (replaces 480 individual fillRect calls with 1 GPU quad)
let cachedVhsPatternCanvas = null;
const drawVhsScanlines = (ctx, width, height) => {
  if (typeof document === 'undefined') return;
  if (!cachedVhsPatternCanvas) {
    cachedVhsPatternCanvas = document.createElement('canvas');
    cachedVhsPatternCanvas.width = 4;
    cachedVhsPatternCanvas.height = 6;
    const pCtx = cachedVhsPatternCanvas.getContext('2d');
    if (pCtx) {
      pCtx.fillStyle = 'rgba(0, 0, 0, 0.22)';
      pCtx.fillRect(0, 3, 4, 3);
    }
  }
  try {
    const pat = ctx.createPattern(cachedVhsPatternCanvas, 'repeat');
    if (pat) {
      ctx.fillStyle = pat;
      ctx.fillRect(0, 0, width, height);
    }
  } catch {
    // Fallback if pattern fails
  }
};

export default function StoryCreator({ onBack }) {
  const { t } = useLanguage();
  const cT = t.storyCreator;

  // Active step (1 to 6)
  const [activeStep, setActiveStep] = useState(1);

  // Format selection
  const [format, setFormat] = useState('story');

  // Photo state
  const [photoSrc, setPhotoSrc] = useState('/missa-capture-2.jpg');
  const [photoScale, setPhotoScale] = useState(1.1);
  const [photoPanX, setPhotoPanX] = useState(0);
  const [photoPanY, setPhotoPanY] = useState(0);
  const [photoFilter, setPhotoFilter] = useState('contrast'); // normal | contrast | cyberpunk
  const [imageLoaded, setImageLoaded] = useState(false);

  // Typography state
  const [repeatedText, setRepeatedText] = useState('MISSA');
  const [mainTitle, setMainTitle] = useState('MISSAFX');
  const [subTitle, setSubTitle] = useState('TECH HOUSE');
  const [eventDate, setEventDate] = useState('SÁBADO // LIVE SET');
  const [eventVenue, setEventVenue] = useState('SAN LUIS POTOSÍ • MÉXICO');

  // Advanced Typography Controls (Size, Position X/Y, Tracking, Alignment, Uppercase)
  // 1. Repeated Lateral Text ("MISSA")
  const [repeatedTextSize, setRepeatedTextSize] = useState(88);
  const [repeatedTextPosX, setRepeatedTextPosX] = useState(60);
  const [repeatedTextPosY, setRepeatedTextPosY] = useState(0);
  const [repeatedTextSpacing, setRepeatedTextSpacing] = useState(104);
  const [repeatedTextTracking, setRepeatedTextTracking] = useState(0);
  const [repeatedTextAlign, setRepeatedTextAlign] = useState('left');
  const [repeatedTextUpper, setRepeatedTextUpper] = useState(true);

  // 2. Main Title ("MISSAFX")
  const [mainTitleSize, setMainTitleSize] = useState(110);
  const [mainTitleOffsetY, setMainTitleOffsetY] = useState(0);
  const [mainTitleOffsetX, setMainTitleOffsetX] = useState(0);
  const [mainTitleTracking, setMainTitleTracking] = useState(0);
  const [mainTitleAlign, setMainTitleAlign] = useState('center'); // left | center | right
  const [mainTitleUpper, setMainTitleUpper] = useState(true);

  // 3. Subtitle / Genre ("TECH HOUSE")
  const [subTitleSize, setSubTitleSize] = useState(24);
  const [subTitleOffsetY, setSubTitleOffsetY] = useState(0);
  const [subTitleOffsetX, setSubTitleOffsetX] = useState(0);
  const [subTitleTracking, setSubTitleTracking] = useState(2);
  const [subTitleAlign, setSubTitleAlign] = useState('center');
  const [subTitleUpper, setSubTitleUpper] = useState(true);
  const [subTitleColor, setSubTitleColor] = useState('');

  // 4. Date / Tagline ("SÁBADO // LIVE SET")
  const [eventDateSize, setEventDateSize] = useState(32);
  const [eventDateOffsetY, setEventDateOffsetY] = useState(0);
  const [eventDateOffsetX, setEventDateOffsetX] = useState(0);
  const [eventDateTracking, setEventDateTracking] = useState(1);
  const [eventDateAlign, setEventDateAlign] = useState('center');
  const [eventDateUpper, setEventDateUpper] = useState(true);
  const [eventDateColor, setEventDateColor] = useState('#FFFFFF');

  // 5. Venue / City ("SAN LUIS POTOSÍ • MÉXICO")
  const [eventVenueSize, setEventVenueSize] = useState(26);
  const [eventVenueOffsetY, setEventVenueOffsetY] = useState(0);
  const [eventVenueOffsetX, setEventVenueOffsetX] = useState(0);
  const [eventVenueTracking, setEventVenueTracking] = useState(1);
  const [eventVenueAlign, setEventVenueAlign] = useState('center');
  const [eventVenueUpper, setEventVenueUpper] = useState(true);
  const [eventVenueColor, setEventVenueColor] = useState('#CBD5E1');

  // 6. Booking / Contact Info ("BOOKING DIRECTO • WA +52 1 444 357 0777")
  const [bookingText, setBookingText] = useState('BOOKING DIRECTO • WA +52 1 444 357 0777');
  const [bookingTextSize, setBookingTextSize] = useState(20);
  const [bookingTextOffsetY, setBookingTextOffsetY] = useState(0);
  const [bookingTextOffsetX, setBookingTextOffsetX] = useState(0);
  const [bookingTextTracking, setBookingTextTracking] = useState(1);
  const [bookingTextAlign, setBookingTextAlign] = useState('center');
  const [bookingTextUpper, setBookingTextUpper] = useState(true);
  const [bookingTextColor, setBookingTextColor] = useState('#FF003C');

  // 7. Top Badge / Tag ("PIONEER DJ PRO SESSION")
  const [badgeTagText, setBadgeTagText] = useState('PIONEER DJ PRO SESSION');
  const [badgeTagSize, setBadgeTagSize] = useState(22);
  const [badgeTagOffsetY, setBadgeTagOffsetY] = useState(0);
  const [badgeTagOffsetX, setBadgeTagOffsetX] = useState(0);
  const [badgeTagTracking, setBadgeTagTracking] = useState(0);
  const [badgeTagAlign, setBadgeTagAlign] = useState('center');
  const [badgeTagUpper, setBadgeTagUpper] = useState(true);
  const [badgeTagTextColor, setBadgeTagTextColor] = useState('#FFFFFF');

  // 8. Audio Spec / Sub-badge ("• 48kHz / 24-BIT MASTER AUDIO •")
  const [audioSpecText, setAudioSpecText] = useState('• 48kHz / 24-BIT MASTER AUDIO •');
  const [audioSpecSize, setAudioSpecSize] = useState(18);
  const [audioSpecOffsetY, setAudioSpecOffsetY] = useState(0);
  const [audioSpecOffsetX, setAudioSpecOffsetX] = useState(0);
  const [audioSpecTracking, setAudioSpecTracking] = useState(1);
  const [audioSpecAlign, setAudioSpecAlign] = useState('center');
  const [audioSpecUpper, setAudioSpecUpper] = useState(true);
  const [audioSpecColor, setAudioSpecColor] = useState('rgba(255, 255, 255, 0.7)');

  // 9. HUD Technical Coordinates ("[ 22° 09' N // 100° 58' W ]")
  const [hudCoordsText, setHudCoordsText] = useState('[ 22° 09\' N // 100° 58\' W ]');
  const [hudCoordsSize, setHudCoordsSize] = useState(18);
  const [hudCoordsOffsetY, setHudCoordsOffsetY] = useState(0);
  const [hudCoordsOffsetX, setHudCoordsOffsetX] = useState(0);
  const [hudCoordsTracking, setHudCoordsTracking] = useState(1);
  const [hudCoordsAlign, setHudCoordsAlign] = useState('left');
  const [hudCoordsUpper, setHudCoordsUpper] = useState(true);
  const [hudCoordsColor, setHudCoordsColor] = useState('#F8FAFC');

  // 10. Graphic Equalizer (EQ) Position & Scale
  const [eqOffsetX, setEqOffsetX] = useState(0);
  const [eqOffsetY, setEqOffsetY] = useState(0);
  const [eqScale, setEqScale] = useState(1.35);

  // Expandable accordion section state (null or element id)
  const [expandedTextSection, setExpandedTextSection] = useState(null);

  const toggleTextSection = (sectionId) => {
    setExpandedTextSection((prev) => (prev === sectionId ? null : sectionId));
  };

  const handleResetText = (elementId) => {
    switch (elementId) {
      case 'repeat':
        setRepeatedTextSize(88);
        setRepeatedTextPosX(60);
        setRepeatedTextPosY(0);
        setRepeatedTextSpacing(104);
        setRepeatedTextTracking(0);
        setRepeatedTextAlign('left');
        setRepeatedTextUpper(true);
        setRepeatTextColor(frameColor);
        break;
      case 'title':
        setMainTitleSize(110);
        setMainTitleOffsetY(0);
        setMainTitleOffsetX(0);
        setMainTitleTracking(0);
        setMainTitleAlign('center');
        setMainTitleUpper(true);
        setTitleColor(frameColor);
        setTitleFxColor('#FFFFFF');
        break;
      case 'subTitle':
        setSubTitleSize(24);
        setSubTitleOffsetY(0);
        setSubTitleOffsetX(0);
        setSubTitleTracking(2);
        setSubTitleAlign('center');
        setSubTitleUpper(true);
        setSubTitleColor('');
        break;
      case 'eventDate':
        setEventDateSize(32);
        setEventDateOffsetY(0);
        setEventDateOffsetX(0);
        setEventDateTracking(1);
        setEventDateAlign('center');
        setEventDateUpper(true);
        setEventDateColor('#FFFFFF');
        break;
      case 'eventVenue':
        setEventVenueSize(26);
        setEventVenueOffsetY(0);
        setEventVenueOffsetX(0);
        setEventVenueTracking(1);
        setEventVenueAlign('center');
        setEventVenueUpper(true);
        setEventVenueColor('#CBD5E1');
        break;
      case 'booking':
        setBookingTextSize(20);
        setBookingTextOffsetY(0);
        setBookingTextOffsetX(0);
        setBookingTextTracking(1);
        setBookingTextAlign('center');
        setBookingTextUpper(true);
        setBookingTextColor(techColor);
        break;
      case 'badgeTag':
        setBadgeTagSize(22);
        setBadgeTagOffsetY(0);
        setBadgeTagOffsetX(0);
        setBadgeTagTracking(0);
        setBadgeTagAlign('center');
        setBadgeTagUpper(true);
        setBadgeTagTextColor('#FFFFFF');
        break;
      case 'audioSpec':
        setAudioSpecSize(18);
        setAudioSpecOffsetY(0);
        setAudioSpecOffsetX(0);
        setAudioSpecTracking(1);
        setAudioSpecAlign('center');
        setAudioSpecUpper(true);
        setAudioSpecColor('rgba(255, 255, 255, 0.7)');
        break;
      case 'hudCoords':
        setHudCoordsSize(18);
        setHudCoordsOffsetY(0);
        setHudCoordsOffsetX(0);
        setHudCoordsTracking(1);
        setHudCoordsAlign('left');
        setHudCoordsUpper(true);
        setHudCoordsColor('#F8FAFC');
        break;
      case 'eq':
        setEqOffsetX(0);
        setEqOffsetY(0);
        setEqScale(1.35);
        break;
      default:
        break;
    }
  };

  const handleResetAllTypography = () => {
    setRepeatedTextSize(88);
    setRepeatedTextPosX(60);
    setRepeatedTextPosY(0);
    setRepeatedTextSpacing(104);
    setRepeatedTextTracking(0);
    setRepeatedTextAlign('left');
    setRepeatedTextUpper(true);
    setRepeatTextColor(frameColor);

    setMainTitleSize(110);
    setMainTitleOffsetY(0);
    setMainTitleOffsetX(0);
    setMainTitleTracking(0);
    setMainTitleAlign('center');
    setMainTitleUpper(true);
    setTitleColor(frameColor);
    setTitleFxColor('#FFFFFF');

    setSubTitleSize(24);
    setSubTitleOffsetY(0);
    setSubTitleOffsetX(0);
    setSubTitleTracking(2);
    setSubTitleAlign('center');
    setSubTitleUpper(true);
    setSubTitleColor('');

    setEventDateSize(32);
    setEventDateOffsetY(0);
    setEventDateOffsetX(0);
    setEventDateTracking(1);
    setEventDateAlign('center');
    setEventDateUpper(true);
    setEventDateColor('#FFFFFF');

    setEventVenueSize(26);
    setEventVenueOffsetY(0);
    setEventVenueOffsetX(0);
    setEventVenueTracking(1);
    setEventVenueAlign('center');
    setEventVenueUpper(true);
    setEventVenueColor('#CBD5E1');

    setBookingTextSize(20);
    setBookingTextOffsetY(0);
    setBookingTextOffsetX(0);
    setBookingTextTracking(1);
    setBookingTextAlign('center');
    setBookingTextUpper(true);
    setBookingTextColor(techColor);

    setBadgeTagSize(22);
    setBadgeTagOffsetY(0);
    setBadgeTagOffsetX(0);
    setBadgeTagTracking(0);
    setBadgeTagAlign('center');
    setBadgeTagUpper(true);
    setBadgeTagTextColor('#FFFFFF');

    setAudioSpecSize(18);
    setAudioSpecOffsetY(0);
    setAudioSpecOffsetX(0);
    setAudioSpecTracking(1);
    setAudioSpecAlign('center');
    setAudioSpecUpper(true);
    setAudioSpecColor('rgba(255, 255, 255, 0.7)');

    setHudCoordsSize(18);
    setHudCoordsOffsetY(0);
    setHudCoordsOffsetX(0);
    setHudCoordsTracking(1);
    setHudCoordsAlign('left');
    setHudCoordsUpper(true);
    setHudCoordsColor('#F8FAFC');

    setEqOffsetX(0);
    setEqOffsetY(0);
    setEqScale(1.35);
  };

  // Granular Color Customization State
  const [frameColor, setFrameColor] = useState('#FF003C');
  const [titleColor, setTitleColor] = useState('#FF003C');
  const [titleFxColor, setTitleFxColor] = useState('#FFFFFF');
  const [repeatTextColor, setRepeatTextColor] = useState('#FF003C');
  const [badgeColor, setBadgeColor] = useState('#FF003C');
  const [badgeTextColor, setBadgeTextColor] = useState('#FFFFFF');
  const [textColor, setTextColor] = useState('#FFFFFF');
  const [techColor, setTechColor] = useState('#FF003C');

  // Apply unified color theme to all elements at once with smart contrast
  const applyUnifiedColor = (hex) => {
    setFrameColor(hex);
    setTitleColor(hex);
    setRepeatTextColor(hex);
    setBadgeColor(hex);
    setTechColor(hex);
    setBookingTextColor(hex);
    // Anti-empalme: automatically set badge text to dark if background is white/light
    const contrastText = getAutoContrastColor(hex);
    setBadgeTextColor(contrastText);
    if (hex === '#FFFFFF') {
      setTitleFxColor('#FF003C');
      setTextColor('#FFFFFF');
      setEventDateColor('#FFFFFF');
      setEventVenueColor('#CBD5E1');
    } else {
      setTitleFxColor('#FFFFFF');
      setTextColor('#FFFFFF');
      setEventDateColor('#FFFFFF');
      setEventVenueColor('#CBD5E1');
    }
  };

  // Masks and layers toggles (on/off)
  const [showRepeatText, setShowRepeatText] = useState(true);
  const [showCyberFrame, setShowCyberFrame] = useState(true);
  const [frameFitSafeZone, setFrameFitSafeZone] = useState(true); // Default: fit inside safe zone for Story
  const [showTechAccents, setShowTechAccents] = useState(true);
  const [showBadges, setShowBadges] = useState(true);
  const [showAudioSpec, setShowAudioSpec] = useState(true);
  const [showHudCoords, setShowHudCoords] = useState(true);
  const [showEq, setShowEq] = useState(true);
  const [showDividerLine, setShowDividerLine] = useState(true);
  const [showSubtitleBox, setShowSubtitleBox] = useState(true);
  const [showTitleGlow, setShowTitleGlow] = useState(true);
  const [showVignette, setShowVignette] = useState(true);
  const [showPhotoLayer, setShowPhotoLayer] = useState(true);

  // Preview overlay guide
  const [showSafeZones, setShowSafeZones] = useState(false);

  // Export status
  const [isExporting, setIsExporting] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [exportStatusText, setExportStatusText] = useState('');
  const [lastExportedVideoUrl, setLastExportedVideoUrl] = useState(null);

  // Motion FX & Story Animation States
  const [isMotionActive, setIsMotionActive] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [loopDuration, setLoopDuration] = useState(7); // default 7s for Instagram Stories / Reels loop
  const [motionFps, setMotionFps] = useState(60); // 30 | 60 | 120 FPS

  // 1. Cascada Lateral ("MISSA MISSA")
  const [cascadeEffect, setCascadeEffect] = useState('scroll-down'); // none | scroll-down | scroll-up | breathe | glitch | wave-sine | neon-scan
  const [cascadeSpeed, setCascadeSpeed] = useState(1.0); // 0.2 to 3.0

  // 2. Titular Principal ("MISSAFX")
  const [titleEffect, setTitleEffect] = useState('neon-breathe'); // none | neon-breathe | neon-flicker | glitch | strobe | color-cycle | laser-sweep | bass-shake | rgb-split
  const [titleGlow, setTitleGlow] = useState(1.2); // 0.2 to 2.5
  const [titleBpm, setTitleBpm] = useState(128); // 60 to 180

  // 3. Ecualizador Gráfico (EQ)
  const [eqEffect, setEqEffect] = useState('vu-bounce'); // none | vu-bounce | wave-flow | bass-pulse | peak-meter | center-split
  const [eqSpeed, setEqSpeed] = useState(1.0); // 0.5 to 2.5
  const [eqIntensity, setEqIntensity] = useState(1.0); // 0.5 to 2.0

  // 4. Foto de Cabina / Artista
  const [photoEffect, setPhotoEffect] = useState('ken-burns-in'); // none | ken-burns-in | ken-burns-out | pan-sway | club-strobe | kick-punch | prism-roll
  const [photoMotionIntensity, setPhotoMotionIntensity] = useState(1.0); // 0.2 to 2.0

  // 5. Atmósfera & Partículas
  const [atmosphereEffect, setAtmosphereEffect] = useState('dust-laser'); // none | dust-laser | scanlines | rave-smoke | cold-sparks | laser-beams | bass-shockwave | vhs-cyber | confetti-blast | matrix-rain | radar-sweep | stage-lightning | star-glints | aurora-laser
  const [atmosphereDensity, setAtmosphereDensity] = useState(1.0); // 0.3 to 2.0

  const handleResetMotion = () => {
    setCascadeEffect('scroll-down');
    setCascadeSpeed(1.0);
    setTitleEffect('neon-breathe');
    setTitleGlow(1.2);
    setTitleBpm(128);
    setEqEffect('vu-bounce');
    setEqSpeed(1.0);
    setEqIntensity(1.0);
    setPhotoEffect('ken-burns-in');
    setPhotoMotionIntensity(1.0);
    setAtmosphereEffect('dust-laser');
    setAtmosphereDensity(1.0);
    setLoopDuration(7);
    setMotionFps(60);
  };

  // Canvas & Image refs
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const fileInputRef = useRef(null);

  // Pre-load image whenever photoSrc changes
  useEffect(() => {
    setImageLoaded(false);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = photoSrc;
    img.onload = () => {
      imageRef.current = img;
      setImageLoaded(true);
    };
    img.onerror = () => {
      console.warn('Failed to load image:', photoSrc);
    };
  }, [photoSrc]);

  // Handle local file upload
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setPhotoSrc(event.target.result);
        setPhotoPanX(0);
        setPhotoPanY(0);
        setPhotoScale(1.0);
      };
      reader.readAsDataURL(file);
    }
  };

  // Main Canvas Render function with Motion FX Time Parameter
  const renderCanvas = useCallback(
    (time = 0, targetCanvas = null) => {
      const canvas = targetCanvas || canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const currentFormat = FORMATS[format];
      const width = currentFormat.width;
      const height = currentFormat.height;

      // Set canvas dimensions
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      // Loop & beat calculations
      const t = loopDuration > 0 ? (time % loopDuration) / loopDuration : 0;
      const beatPhase = (time * (titleBpm / 60)) % 1;
      const omega = 2 * Math.PI * t;

      // 1. Dark Base Background
      ctx.fillStyle = '#060608';
      ctx.fillRect(0, 0, width, height);

      // 2. Draw Photo Layer (Element #4 FX)
      const img = imageRef.current;
      if (img && imageLoaded && showPhotoLayer) {
        ctx.save();

        let animScale = photoScale;
        let animPanX = photoPanX;
        let animPanY = photoPanY;
        let animBrightness = 1.0;

        if (isMotionActive) {
          if (photoEffect === 'ken-burns-in') {
            const k = Math.sin(t * Math.PI);
            animScale = photoScale * (1 + 0.08 * k * photoMotionIntensity);
            animPanY = photoPanY - (15 * k * photoMotionIntensity);
          } else if (photoEffect === 'ken-burns-out') {
            const k = Math.sin(t * Math.PI);
            animScale = photoScale * (1 + 0.08 * (1 - k) * photoMotionIntensity);
            animPanY = photoPanY + (15 * k * photoMotionIntensity);
          } else if (photoEffect === 'pan-sway') {
            animPanX = photoPanX + Math.sin(omega) * 22 * photoMotionIntensity;
            animPanY = photoPanY + Math.cos(omega) * 12 * photoMotionIntensity;
          } else if (photoEffect === 'club-strobe') {
            const strobePulse = Math.pow(Math.sin(Math.PI * beatPhase), 6);
            animBrightness = 1.0 + 0.5 * strobePulse * photoMotionIntensity;
            animScale = photoScale * (1 + 0.02 * strobePulse * photoMotionIntensity);
          } else if (photoEffect === 'kick-punch') {
            const kick = Math.pow(Math.max(0, 1 - beatPhase * 3.5), 3);
            animScale = photoScale * (1 + 0.09 * kick * photoMotionIntensity);
            animBrightness = 1.0 + 0.3 * kick * photoMotionIntensity;
          } else if (photoEffect === 'prism-roll') {
            const rollAngle = Math.sin(omega * 0.5) * 0.025 * photoMotionIntensity;
            ctx.translate(width / 2, height / 2);
            ctx.rotate(rollAngle);
            ctx.translate(-width / 2, -height / 2);
            animScale = photoScale * (1 + 0.04 * photoMotionIntensity);
          }
        }

        // Color filter with dynamic brightness
        if (photoFilter === 'contrast') {
          ctx.filter = `contrast(130%) brightness(${Math.round(95 * animBrightness)}%) saturate(110%)`;
        } else if (photoFilter === 'cyberpunk') {
          ctx.filter = `grayscale(100%) contrast(150%) brightness(${Math.round(85 * animBrightness)}%)`;
        } else {
          ctx.filter = animBrightness !== 1.0 ? `brightness(${Math.round(100 * animBrightness)}%)` : 'none';
        }

        // Calculate cover dimensions
        const imgRatio = img.width / img.height;
        const canvasRatio = width / height;
        let drawW, drawH;

        if (imgRatio > canvasRatio) {
          drawH = height;
          drawW = height * imgRatio;
        } else {
          drawW = width;
          drawH = width / imgRatio;
        }

        // Apply zoom/scale
        drawW *= animScale;
        drawH *= animScale;

        // Center + pan offsets
        const drawX = (width - drawW) / 2 + animPanX;
        const drawY = (height - drawH) / 2 + animPanY;

        ctx.drawImage(img, drawX, drawY, drawW, drawH);
        ctx.restore();
      }

      // 3. Dark Vignette & Gradient Overlays (if enabled)
      if (showVignette) {
        ctx.save();

        // Top Header Gradient
        const topGrad = ctx.createLinearGradient(0, 0, 0, height * 0.28);
        topGrad.addColorStop(0, 'rgba(6, 6, 8, 0.88)');
        topGrad.addColorStop(1, 'rgba(6, 6, 8, 0)');
        ctx.fillStyle = topGrad;
        ctx.fillRect(0, 0, width, height * 0.28);

        // Bottom Typography Gradient
        const bottomGrad = ctx.createLinearGradient(0, height * 0.45, 0, height);
        bottomGrad.addColorStop(0, 'rgba(6, 6, 8, 0)');
        bottomGrad.addColorStop(0.55, 'rgba(6, 6, 8, 0.75)');
        bottomGrad.addColorStop(1, 'rgba(6, 6, 8, 0.98)');
        ctx.fillStyle = bottomGrad;
        ctx.fillRect(0, height * 0.45, width, height * 0.55);

        // Lateral Vignette for repeated text contrast
        const leftGrad = ctx.createLinearGradient(0, 0, width * 0.45, 0);
        leftGrad.addColorStop(0, 'rgba(6, 6, 8, 0.85)');
        leftGrad.addColorStop(1, 'rgba(6, 6, 8, 0)');
        ctx.fillStyle = leftGrad;
        ctx.fillRect(0, 0, width * 0.45, height);

        ctx.restore();
      }

      // 4. Atmosphere & Particles Layer (Element #5 FX)
      if (isMotionActive && atmosphereEffect !== 'none') {
        ctx.save();
        if (atmosphereEffect === 'dust-laser') {
          const particleCount = 35;
          for (let i = 0; i < particleCount; i++) {
            const seedX = (i * 137.5) % width;
            const seedY = (i * 219.7) % height;
            const speed = 40 + (i % 5) * 20;
            const size = 1.5 + (i % 4) * 1.5;
            const curY = (seedY - time * speed * atmosphereDensity + height * 10) % height;
            const curX = (seedX + Math.sin(time * 1.6 + i) * 25) % width;
            const alpha = (0.2 + 0.35 * Math.sin(time * 2.5 + i)) * Math.min(1, atmosphereDensity);

            ctx.fillStyle = hexToRgba(frameColor, Math.max(0.05, alpha));
            ctx.beginPath();
            ctx.arc(curX, curY, size, 0, Math.PI * 2);
            ctx.fill();
          }
        } else if (atmosphereEffect === 'scanlines') {
          // Optimized: batch all scanline strokes into a single draw call
          const scanGap = 12;
          const scanSpeed = (time * 90) % scanGap;
          ctx.strokeStyle = hexToRgba(frameColor, 0.05 * atmosphereDensity);
          ctx.lineWidth = 1;
          ctx.beginPath();
          for (let sy = scanSpeed; sy < height; sy += scanGap) {
            ctx.moveTo(0, sy);
            ctx.lineTo(width, sy);
          }
          ctx.stroke();

          const beamY = (time * 300) % height;
          const beamGrad = ctx.createLinearGradient(0, beamY - 40, 0, beamY + 40);
          beamGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
          beamGrad.addColorStop(0.5, hexToRgba(frameColor, 0.08 * atmosphereDensity));
          beamGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
          ctx.fillStyle = beamGrad;
          ctx.fillRect(0, beamY - 40, width, 80);
        } else if (atmosphereEffect === 'rave-smoke') {
          for (let i = 0; i < 3; i++) {
            const fx = width * (0.3 + 0.4 * Math.sin(omega + i * 2));
            const fy = height * (0.35 + 0.3 * Math.cos(omega + i * 1.5));
            const fRadius = width * (0.35 + 0.08 * Math.sin(time + i));
            const fogGrad = ctx.createRadialGradient(fx, fy, 10, fx, fy, fRadius);
            fogGrad.addColorStop(0, hexToRgba(frameColor, 0.09 * atmosphereDensity));
            fogGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = fogGrad;
            ctx.fillRect(0, 0, width, height);
          }
        } else if (atmosphereEffect === 'cold-sparks') {
          // Optimized: additive blending glow without expensive inner-loop shadowBlur
          const sparkCount = 36;
          ctx.save();
          ctx.globalCompositeOperation = 'lighter';
          ctx.shadowBlur = 0;

          for (let i = 0; i < sparkCount; i++) {
            const seedX = (width * 0.12 + (i * 97.3) % (width * 0.76));
            const speed = 320 + (i % 8) * 50;
            const sparkLife = (time * (speed / height) + (i * 0.13)) % 1;
            const curY = height * (1 - Math.pow(sparkLife, 0.85));
            const curX = seedX + Math.sin(sparkLife * 12 + i) * 22 + ((i % 2 === 0 ? 1 : -1) * sparkLife * 40);
            const sparkAlpha = Math.max(0, (1 - sparkLife) * Math.min(1.2, atmosphereDensity));
            const sparkSize = (1.5 + (i % 3)) * (1 - sparkLife * 0.5);

            // Outer golden glow
            ctx.fillStyle = hexToRgba('#FFA500', sparkAlpha * 0.45);
            ctx.beginPath();
            ctx.arc(curX, curY, sparkSize * 2.2, 0, Math.PI * 2);
            ctx.fill();

            // Core bright spark
            ctx.fillStyle = i % 3 === 0 ? '#FFFFFF' : '#FFE600';
            ctx.beginPath();
            ctx.arc(curX, curY, sparkSize, 0, Math.PI * 2);
            ctx.fill();

            // Fiery spark trail
            ctx.strokeStyle = hexToRgba('#FF5500', sparkAlpha * 0.7);
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(curX, curY);
            ctx.lineTo(curX - ((i % 2 === 0 ? 1 : -1) * 4), curY + 12);
            ctx.stroke();
          }
          ctx.restore();
        } else if (atmosphereEffect === 'laser-beams') {
          // Optimized: multi-stroke additive neon bloom (ZERO Gaussian blur cost, 120 FPS fluid)
          const beamCount = 6;
          ctx.save();
          ctx.globalCompositeOperation = 'lighter';
          ctx.shadowBlur = 0;

          for (let i = 0; i < beamCount; i++) {
            const originX = (i % 2 === 0) ? width * 0.08 : width * 0.92;
            const originY = height * 0.05 + (i * 30);
            const sweepPhase = Math.sin(time * 1.8 + i * 0.9);
            const targetX = width * (0.5 + sweepPhase * 0.55);
            const targetY = height * 0.85 + Math.cos(time * 1.2 + i) * (height * 0.1);

            ctx.beginPath();
            ctx.moveTo(originX, originY);
            ctx.lineTo(targetX, targetY);

            // Pass 1: Wide atmospheric neon halo
            ctx.strokeStyle = hexToRgba(frameColor, 0.16 * atmosphereDensity);
            ctx.lineWidth = 16 * atmosphereDensity;
            ctx.stroke();

            // Pass 2: High-energy laser body
            ctx.strokeStyle = hexToRgba(frameColor, 0.55 * atmosphereDensity);
            ctx.lineWidth = 5 * atmosphereDensity;
            ctx.stroke();

            // Pass 3: Ultra-bright photon core
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.92)';
            ctx.lineWidth = 1.6;
            ctx.stroke();
          }
          ctx.restore();
        } else if (atmosphereEffect === 'bass-shockwave') {
          // Optimized: 3-layer electric shockwave (ZERO Gaussian blur on huge 2880px circles)
          const rings = 3;
          ctx.save();
          ctx.globalCompositeOperation = 'lighter';
          ctx.shadowBlur = 0;

          for (let r = 0; r < rings; r++) {
            const ringPhase = (beatPhase + r * (1 / rings)) % 1;
            const maxRadius = Math.max(width, height) * 0.72;
            const radius = ringPhase * maxRadius;
            const ringAlpha = Math.pow(1 - ringPhase, 2) * 0.75 * atmosphereDensity;

            if (radius > 8 && ringAlpha > 0.01) {
              ctx.beginPath();
              ctx.arc(width / 2, height * 0.52, radius, 0, Math.PI * 2);

              // Layer 1: Ambient pressure wave
              ctx.strokeStyle = hexToRgba(frameColor, ringAlpha * 0.22);
              ctx.lineWidth = 14 + (1 - ringPhase) * 16;
              ctx.stroke();

              // Layer 2: Vivid neon pulse ring
              ctx.strokeStyle = hexToRgba(frameColor, ringAlpha * 0.65);
              ctx.lineWidth = 4 + (1 - ringPhase) * 5;
              ctx.stroke();

              // Layer 3: Blinding electric leading edge
              ctx.strokeStyle = hexToRgba('#FFFFFF', ringAlpha * 0.9);
              ctx.lineWidth = 1.5 + (1 - ringPhase) * 2;
              ctx.stroke();
            }
          }
          ctx.restore();
        } else if (atmosphereEffect === 'vhs-cyber') {
          // Optimized: Single GPU pattern fill for all scanlines + 3 rolling tracking bars (0 lag)
          ctx.save();
          const bandCount = 3;
          for (let b = 0; b < bandCount; b++) {
            const bandY = ((time * (90 + b * 40)) + b * 320) % height;
            const bandH = 16 + (b % 3) * 10;
            ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
            ctx.fillRect(0, bandY, width, bandH);

            ctx.fillStyle = hexToRgba(frameColor, 0.08 * atmosphereDensity);
            ctx.fillRect(0, bandY + bandH * 0.3, width, 2);
          }

          // Single draw call for entire screen CRT lines
          drawVhsScanlines(ctx, width, height);

          // Subtle analog video glitch flash
          if (Math.sin(time * 24) > 0.88) {
            ctx.fillStyle = hexToRgba('#00F0FF', 0.05 * atmosphereDensity);
            ctx.fillRect(0, 0, width, height);
          }
          ctx.restore();
        } else if (atmosphereEffect === 'confetti-blast') {
          // 8. Lluvia de Confeti Festival (Gold & Cyber Confetti 3D Tumble)
          ctx.save();
          const flakeCount = 42;
          for (let i = 0; i < flakeCount; i++) {
            const seedX = (width * 0.08 + (i * 127.3) % (width * 0.84));
            const fallSpeed = 100 + (i % 7) * 35;
            const progress = ((time * (fallSpeed / height) + i * 0.17) % 1);
            const curY = progress * (height + 60) - 30;
            const curX = seedX + Math.sin(time * 2.5 + i * 1.5) * 45;
            const angle = time * 3.5 + i * 2.1;
            const flipScaleY = Math.sin(time * 4.2 + i * 3.3);
            const flakeW = 11 + (i % 4) * 4;
            const flakeH = 6 + (i % 3) * 3;
            const palette = ['#FFD700', '#FFFFFF', frameColor, '#00F0FF', '#FF007F', '#EAB308'];
            const col = palette[i % palette.length];

            ctx.save();
            ctx.translate(curX, curY);
            ctx.rotate(angle);
            ctx.scale(1, flipScaleY);
            ctx.fillStyle = hexToRgba(col, (0.78 + 0.22 * Math.sin(time * 6 + i)) * Math.min(1.2, atmosphereDensity));
            ctx.fillRect(-flakeW / 2, -flakeH / 2, flakeW, flakeH);
            ctx.restore();
          }
          ctx.restore();
        } else if (atmosphereEffect === 'matrix-rain') {
          // 9. Lluvia de Código Matrix (Cascading Cyber Code Stream)
          ctx.save();
          ctx.font = '700 16px monospace';
          ctx.textAlign = 'center';
          const cols = 22;
          const colSpacing = width / cols;
          const glyphs = ['0', '1', 'M', 'I', 'S', 'S', 'A', 'F', 'X', '9', 'X', '+', '<', '>', '/', '#', '•', '§', 'Δ'];
          for (let c = 0; c < cols; c++) {
            const colSpeed = 170 + (c % 6) * 45;
            const colProgress = (time * colSpeed + c * 240) % (height + 280);
            const colX = c * colSpacing + colSpacing / 2;

            for (let k = 0; k < 5; k++) {
              const charY = colProgress - k * 26;
              if (charY > 0 && charY < height) {
                const glyphIdx = Math.floor(c * 7 + k + time * 7) % glyphs.length;
                const char = glyphs[glyphIdx];
                if (k === 0) {
                  ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
                } else {
                  const alpha = (0.75 - k * 0.15) * atmosphereDensity;
                  ctx.fillStyle = hexToRgba(frameColor, Math.max(0, alpha));
                }
                ctx.fillText(char, colX, charY);
              }
            }
          }
          ctx.restore();
        } else if (atmosphereEffect === 'radar-sweep') {
          // 10. Radar Sónico de Cabina (Sonar Sweep & Distance Rings)
          ctx.save();
          ctx.globalCompositeOperation = 'lighter';
          ctx.shadowBlur = 0;
          const cx = width / 2;
          const cy = height * 0.52;
          const maxR = width * 0.54;

          // Concentric faint sonar range rings
          ctx.strokeStyle = hexToRgba(frameColor, 0.09 * atmosphereDensity);
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.arc(cx, cy, maxR * 0.33, 0, Math.PI * 2);
          ctx.arc(cx, cy, maxR * 0.66, 0, Math.PI * 2);
          ctx.arc(cx, cy, maxR, 0, Math.PI * 2);
          ctx.stroke();

          // Radar grid crosshairs
          ctx.beginPath();
          ctx.moveTo(cx - maxR, cy);
          ctx.lineTo(cx + maxR, cy);
          ctx.moveTo(cx, cy - maxR);
          ctx.lineTo(cx, cy + maxR);
          ctx.stroke();

          // Sweeping radar wedge & glowing tail
          const sweepAngle = (time * 1.8) % (Math.PI * 2);
          const trailSegments = 8;
          for (let s = 0; s < trailSegments; s++) {
            const a1 = sweepAngle - (s + 1) * 0.055;
            const a2 = sweepAngle - s * 0.055;
            const trailAlpha = (1 - s / trailSegments) * 0.14 * atmosphereDensity;
            ctx.fillStyle = hexToRgba(frameColor, trailAlpha);
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.arc(cx, cy, maxR, a1, a2);
            ctx.closePath();
            ctx.fill();
          }

          // Sharp white leading beam line
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(cx + Math.cos(sweepAngle) * maxR, cy + Math.sin(sweepAngle) * maxR);
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.restore();
        } else if (atmosphereEffect === 'stage-lightning') {
          // 11. Relámpagos Neón de Escenario (Procedural Electric Lightning Arcs)
          ctx.save();
          ctx.globalCompositeOperation = 'lighter';
          ctx.shadowBlur = 0;
          const lightningActive = (Math.sin(time * 15) > 0.68) || (beatPhase < 0.16);
          if (lightningActive) {
            const strikeCount = 2;
            for (let s = 0; s < strikeCount; s++) {
              const strikeX = width * (0.22 + s * 0.52 + Math.sin(time * 9 + s * 4) * 0.12);
              const points = 8;
              const pts = [{ x: strikeX, y: 0 }];
              for (let p = 1; p < points; p++) {
                const segY = (height * 0.82) * (p / points);
                const jitter = Math.sin(time * 35 + p * 8 + s * 13) * 55;
                pts.push({ x: strikeX + jitter, y: segY });
              }

              ctx.beginPath();
              ctx.moveTo(pts[0].x, pts[0].y);
              for (let p = 1; p < pts.length; p++) {
                ctx.lineTo(pts[p].x, pts[p].y);
              }

              // Pass 1: Neon ambient electric aura
              ctx.strokeStyle = hexToRgba(frameColor, 0.35 * atmosphereDensity);
              ctx.lineWidth = 12 * atmosphereDensity;
              ctx.stroke();

              // Pass 2: High-energy electric arc
              ctx.strokeStyle = hexToRgba(frameColor, 0.85 * atmosphereDensity);
              ctx.lineWidth = 4 * atmosphereDensity;
              ctx.stroke();

              // Pass 3: White-hot core bolt
              ctx.strokeStyle = '#FFFFFF';
              ctx.lineWidth = 1.8;
              ctx.stroke();
            }
          }
          ctx.restore();
        } else if (atmosphereEffect === 'star-glints') {
          // 12. Destellos Prisma Estelares (Diamond Sparkles & 4-Point Star Flares)
          ctx.save();
          ctx.globalCompositeOperation = 'lighter';
          ctx.shadowBlur = 0;
          const glintCount = 15;
          for (let i = 0; i < glintCount; i++) {
            const gx = (width * 0.1 + (i * 157.3) % (width * 0.8));
            const gy = (height * 0.12 + (i * 219.7) % (height * 0.76));
            const glintPhase = Math.sin(time * 3.8 + i * 1.7);
            if (glintPhase > 0) {
              const glintScale = Math.pow(glintPhase, 3) * 24 * atmosphereDensity;
              const glintRot = time * 0.6 + i;

              ctx.save();
              ctx.translate(gx, gy);
              ctx.rotate(glintRot);

              // 4-point diamond star flare
              ctx.fillStyle = hexToRgba(frameColor, glintPhase * 0.45);
              ctx.beginPath();
              ctx.moveTo(0, -glintScale * 1.5);
              ctx.lineTo(glintScale * 0.32, 0);
              ctx.lineTo(0, glintScale * 1.5);
              ctx.lineTo(-glintScale * 0.32, 0);
              ctx.closePath();
              ctx.fill();

              ctx.beginPath();
              ctx.moveTo(-glintScale * 1.5, 0);
              ctx.lineTo(0, glintScale * 0.32);
              ctx.lineTo(glintScale * 1.5, 0);
              ctx.lineTo(0, -glintScale * 0.32);
              ctx.closePath();
              ctx.fill();

              // Core brilliant pinpoint
              ctx.fillStyle = '#FFFFFF';
              ctx.beginPath();
              ctx.arc(0, 0, Math.max(1, glintScale * 0.2), 0, Math.PI * 2);
              ctx.fill();

              ctx.restore();
            }
          }
          ctx.restore();
        } else if (atmosphereEffect === 'aurora-laser') {
          // 13. Cortinas Láser Aurora (Flowing Northern Wave Laser Curtains)
          ctx.save();
          ctx.globalCompositeOperation = 'lighter';
          ctx.shadowBlur = 0;
          const ribbonCount = 3;
          for (let r = 0; r < ribbonCount; r++) {
            const ribbonAlpha = (0.13 + 0.06 * Math.sin(time * 1.4 + r * 1.2)) * atmosphereDensity;
            const baseY = height * (0.28 + r * 0.18);
            const waveFreq = 0.0035 + r * 0.0012;
            const waveSpeed = time * (1.2 + r * 0.4);

            ctx.beginPath();
            ctx.moveTo(0, height);
            for (let x = 0; x <= width; x += 30) {
              const y = baseY + Math.sin(x * waveFreq + waveSpeed) * 65 + Math.cos(x * 0.0055 - waveSpeed * 0.8) * 35;
              ctx.lineTo(x, y);
            }
            ctx.lineTo(width, height);
            ctx.closePath();

            const aurGrad = ctx.createLinearGradient(0, baseY - 65, 0, baseY + 130);
            aurGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
            aurGrad.addColorStop(0.35, hexToRgba(r % 2 === 0 ? frameColor : '#00F0FF', ribbonAlpha));
            aurGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = aurGrad;
            ctx.fill();
          }
          ctx.restore();
        }
        ctx.restore();
      }

      // 5. Repeated Lateral Outline Typography ("MISSA MISSA") (Element #1 FX)
      if (showRepeatText && repeatedText.trim()) {
        ctx.save();
        const textToRepeat = repeatedTextUpper ? repeatedText.trim().toUpperCase() : repeatedText.trim();
        ctx.font = `900 ${repeatedTextSize}px "Syne", "Outfit", sans-serif`;
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'left';
        if (ctx.letterSpacing !== undefined) {
          ctx.letterSpacing = `${repeatedTextTracking}px`;
        }

        const startY = height * 0.14 + repeatedTextPosY;
        const endY = height * 0.82 + repeatedTextPosY;
        const stepY = Math.max(30, repeatedTextSpacing);
        let curBaseX = repeatedTextPosX;
        if (repeatedTextAlign === 'center') {
          curBaseX = width / 2 + (repeatedTextPosX - 60);
          ctx.textAlign = 'center';
        } else if (repeatedTextAlign === 'right') {
          curBaseX = width - 60 + (repeatedTextPosX - 60);
          ctx.textAlign = 'right';
        } else {
          ctx.textAlign = 'left';
        }

        let shiftY = 0;
        let dynamicLineWidth = 2.5;
        let jitterX = 0;
        let isGlitchActive = false;

        if (isMotionActive) {
          if (cascadeEffect === 'scroll-down') {
            shiftY = (time * 80 * cascadeSpeed) % stepY;
          } else if (cascadeEffect === 'scroll-up') {
            shiftY = -((time * 80 * cascadeSpeed) % stepY);
          } else if (cascadeEffect === 'breathe') {
            dynamicLineWidth = 2.5 + Math.sin(omega * 2) * 1.8 * cascadeSpeed;
          } else if (cascadeEffect === 'glitch') {
            const gFrame = Math.sin(time * 20) > 0.85;
            if (gFrame) {
              isGlitchActive = true;
              jitterX = Math.sin(time * 50) * 8 * cascadeSpeed;
            }
          } else if (cascadeEffect === 'wave-sine') {
            shiftY = (time * 45 * cascadeSpeed) % stepY;
          } else if (cascadeEffect === 'neon-scan') {
            shiftY = (time * 65 * cascadeSpeed) % stepY;
          }
        }

        ctx.beginPath();
        ctx.rect(0, 0, width, height);
        ctx.clip();

        const loopMinY = Math.min(-stepY * 2, startY - stepY * 4);
        const loopMaxY = Math.max(height + stepY * 2, endY + stepY * 4);

        let count = 0;
        const scanPos = ((time * 190 * cascadeSpeed) % (height + stepY * 2)) - stepY;
        for (let y = loopMinY; y <= loopMaxY; y += stepY) {
          const curY = y + shiftY;
          let curX = curBaseX + jitterX;
          if (cascadeEffect === 'wave-sine') {
            curX += Math.sin(time * 3.2 * cascadeSpeed + count * 0.75) * 22;
          }

          let isScanActive = false;
          if (cascadeEffect === 'neon-scan') {
            if (Math.abs(curY - scanPos) < stepY * 0.75) {
              isScanActive = true;
            }
          }

          ctx.lineWidth = isScanActive ? 3.5 : Math.max(1, dynamicLineWidth);
          ctx.strokeStyle = isScanActive ? '#FFFFFF' : repeatTextColor;

          if (isGlitchActive) {
            ctx.save();
            ctx.shadowColor = '#00F0FF';
            ctx.shadowBlur = 10;
            ctx.strokeText(textToRepeat, curX + 3, curY);
            ctx.restore();
          }

          if (isScanActive) {
            ctx.save();
            ctx.shadowColor = repeatTextColor;
            ctx.shadowBlur = 22;
            ctx.strokeText(textToRepeat, curX, curY);
            ctx.fillStyle = repeatTextColor;
            ctx.fillText(textToRepeat, curX, curY);
            ctx.restore();
          } else {
            ctx.strokeText(textToRepeat, curX, curY);

            if (count % 7 === 1) {
              ctx.fillStyle = repeatTextColor;
              ctx.fillText(textToRepeat, curX, curY);
            } else {
              ctx.fillStyle = hexToRgba(repeatTextColor, 0.04);
              ctx.fillText(textToRepeat, curX, curY);
            }
          }
          count++;
        }
        ctx.restore();
      }

      // 6. Cyberpunk Frame with Neon Glow
      if (showCyberFrame) {
        ctx.save();
        const insetX = 44;
        const insetY = (format === 'story' && frameFitSafeZone) ? 215 : 44;
        const bevel = 36;

        ctx.beginPath();
        ctx.moveTo(insetX + bevel, insetY);
        ctx.lineTo(width - insetX - bevel, insetY);
        ctx.lineTo(width - insetX, insetY + bevel);
        ctx.lineTo(width - insetX, height - insetY - bevel);
        ctx.lineTo(width - insetX - bevel, height - insetY);
        ctx.lineTo(insetX + bevel, height - insetY);
        ctx.lineTo(insetX, height - insetY - bevel);
        ctx.lineTo(insetX, insetY + bevel);
        ctx.closePath();

        ctx.strokeStyle = frameColor;
        ctx.lineWidth = 4;
        ctx.shadowColor = frameColor;
        ctx.shadowBlur = isMotionActive ? 14 + Math.sin(omega) * 6 : 14;
        ctx.stroke();

        ctx.shadowBlur = 0;
        ctx.fillStyle = frameColor;
        ctx.fillRect(insetX + bevel, insetY - 4, 30, 8);
        ctx.fillRect(width - insetX - bevel - 30, insetY - 4, 30, 8);
        ctx.fillRect(insetX + bevel, height - insetY - 4, 30, 8);
        ctx.fillRect(width - insetX - bevel - 30, height - insetY - 4, 30, 8);

        ctx.restore();
      }

      // 7. Technical Accents & HUD Coordinates
      if (showHudCoords) {
        ctx.save();
        ctx.fillStyle = '#94A3B8';
        ctx.font = '600 13px "Outfit", monospace';
        ctx.letterSpacing = '1px';

        const crossSize = 10;
        const topCornerY = (format === 'story' && frameFitSafeZone) ? 230 : 75;
        const bottomCornerY = (format === 'story' && frameFitSafeZone) ? height - 230 : height - 75;
        const corners = [
          [75, topCornerY],
          [width - 75, topCornerY],
          [75, bottomCornerY],
          [width - 75, bottomCornerY]
        ];

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 1.5;
        corners.forEach(([cx, cy]) => {
          ctx.beginPath();
          ctx.moveTo(cx - crossSize, cy);
          ctx.lineTo(cx + crossSize, cy);
          ctx.moveTo(cx, cy - crossSize);
          ctx.lineTo(cx, cy + crossSize);
          ctx.stroke();
        });

        if (hudCoordsText.trim()) {
          const coordsToRender = hudCoordsUpper ? hudCoordsText.trim().toUpperCase() : hudCoordsText.trim();
          ctx.font = `600 ${hudCoordsSize}px "Outfit", monospace`;
          if (ctx.letterSpacing !== undefined) {
            ctx.letterSpacing = `${hudCoordsTracking}px`;
          }
          ctx.fillStyle = hudCoordsColor || '#F8FAFC';
          ctx.textBaseline = 'middle';
          const hudBaseY = (format === 'story' && frameFitSafeZone) ? 245 : 80;

          let hudX = 110 + hudCoordsOffsetX;
          if (hudCoordsAlign === 'center') {
            hudX = width / 2 + hudCoordsOffsetX;
          } else if (hudCoordsAlign === 'right') {
            hudX = width - 110 + hudCoordsOffsetX;
          }
          ctx.textAlign = hudCoordsAlign;
          ctx.fillText(coordsToRender, hudX, hudBaseY + hudCoordsOffsetY);
        }

        ctx.restore();
      }

      // 7b. Graphic Equalizer Overlay (Element #3 FX: Equalizer)
      if (showEq) {
        ctx.save();
        const baseEqX = width - 220 + eqOffsetX;
        const baseEqY = (format === 'story' ? 238 : 70) + eqOffsetY;
        const barCount = 12;
        const baseHeights = [14, 22, 10, 26, 18, 12, 28, 20, 16, 24, 15, 8];

        for (let i = 0; i < barCount; i++) {
          let barH = baseHeights[i] * eqScale;
          if (isMotionActive) {
            if (eqEffect === 'vu-bounce') {
              barH = Math.min(28 * eqScale, Math.max(4, Math.abs(Math.sin(time * 7 * eqSpeed + i * 0.65)) * 24 * eqIntensity * eqScale));
            } else if (eqEffect === 'wave-flow') {
              barH = Math.min(28 * eqScale, Math.max(4, ((Math.sin(time * 5 * eqSpeed + i * 0.5) * 0.5 + 0.5) * 25 * eqIntensity * eqScale)));
            } else if (eqEffect === 'bass-pulse') {
              const bassHit = Math.pow(Math.sin(Math.PI * beatPhase), 4);
              barH = Math.min(28 * eqScale, Math.max(4, (bassHit * 22 * eqIntensity + Math.sin(time * 12 + i) * 5) * eqScale));
            } else if (eqEffect === 'peak-meter') {
              const bounce = Math.abs(Math.sin(time * 7.5 * eqSpeed + i * 0.7));
              barH = Math.min(26 * eqScale, Math.max(4, bounce * 23 * eqIntensity * eqScale));
            } else if (eqEffect === 'center-split') {
              const wave = Math.abs(Math.sin(time * 6 * eqSpeed + i * 0.5));
              barH = Math.min(26 * eqScale, Math.max(4, wave * 24 * eqIntensity * eqScale));
            }
          }

          if (eqEffect === 'center-split') {
            const halfH = barH / 2;
            ctx.fillStyle = i % 3 === 0 ? techColor : 'rgba(255, 255, 255, 0.7)';
            ctx.fillRect(baseEqX + i * 8 * eqScale, baseEqY + (14 * eqScale) - halfH, 5 * eqScale, halfH * 2);
          } else {
            ctx.fillStyle = i % 3 === 0 ? techColor : 'rgba(255, 255, 255, 0.7)';
            ctx.fillRect(baseEqX + i * 8 * eqScale, baseEqY + (28 * eqScale - barH), 5 * eqScale, barH);

            if (eqEffect === 'peak-meter') {
              const peakOffset = ((Math.sin(time * 3.5 * eqSpeed + i * 0.9) * 0.5 + 0.5) * 4 * eqScale);
              const peakY = Math.max(baseEqY, baseEqY + (28 * eqScale - barH) - (3 * eqScale) - peakOffset);
              ctx.fillStyle = '#FFFFFF';
              ctx.fillRect(baseEqX + i * 8 * eqScale, peakY, 5 * eqScale, 2 * eqScale);
            }
          }
        }

        ctx.restore();
      }

      // 8. Top Badge & Logos (if enabled)
      if (showBadges && badgeTagText.trim()) {
        ctx.save();

        const tagText = badgeTagUpper ? badgeTagText.trim().toUpperCase() : badgeTagText.trim();
        ctx.font = `700 ${badgeTagSize}px "Outfit", sans-serif`;
        if (ctx.letterSpacing !== undefined) {
          ctx.letterSpacing = `${badgeTagTracking}px`;
        }
        const tagMetrics = ctx.measureText(tagText);
        const tagW = tagMetrics.width + (badgeTagSize * 2.5);
        const tagH = Math.round(badgeTagSize * 2.4);

        let tagX = (width - tagW) / 2 + badgeTagOffsetX;
        if (badgeTagAlign === 'left') tagX = width * 0.12 + badgeTagOffsetX;
        if (badgeTagAlign === 'right') tagX = width * 0.88 - tagW + badgeTagOffsetX;
        const tagBaseY = format === 'story' ? 300 : height * 0.08;
        const tagY = tagBaseY + badgeTagOffsetY;

        ctx.fillStyle = 'rgba(12, 12, 16, 0.85)';
        ctx.strokeStyle = badgeColor;
        ctx.lineWidth = 1.5;

        ctx.beginPath();
        ctx.roundRect(tagX, tagY, tagW, tagH, 8);
        ctx.fill();
        ctx.stroke();

        const dotRadius = isMotionActive ? (badgeTagSize * 0.28) + Math.sin(omega * 3) * 1.2 : (badgeTagSize * 0.28);
        ctx.fillStyle = badgeColor;
        ctx.beginPath();
        ctx.arc(tagX + (badgeTagSize * 1.1), tagY + tagH / 2, dotRadius, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = badgeTagTextColor || '#FFFFFF';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(tagText, tagX + (badgeTagSize * 1.8), tagY + tagH / 2);

        ctx.restore();
      }

      // 8b. Audio Spec / Sub-badge
      if (showAudioSpec && audioSpecText.trim()) {
        ctx.save();
        const specText = audioSpecUpper ? audioSpecText.trim().toUpperCase() : audioSpecText.trim();
        ctx.font = `600 ${audioSpecSize}px "Outfit", monospace`;
        if (ctx.letterSpacing !== undefined) {
          ctx.letterSpacing = `${audioSpecTracking}px`;
        }
        ctx.fillStyle = audioSpecColor || 'rgba(255, 255, 255, 0.7)';
        ctx.textBaseline = 'middle';

        let specX = width / 2 + audioSpecOffsetX;
        if (audioSpecAlign === 'left') specX = width * 0.12 + audioSpecOffsetX;
        if (audioSpecAlign === 'right') specX = width * 0.88 + audioSpecOffsetX;
        ctx.textAlign = audioSpecAlign;

        const specBaseY = format === 'story' ? 300 : height * 0.08;
        const specY = specBaseY + (badgeTagSize * 2.4) + 20 + audioSpecOffsetY;
        ctx.fillText(specText, specX, specY);

        ctx.restore();
      }

      // 9. Main Typography & Event Information (Element #2 FX: Titular)
      ctx.save();
      const bottomBase = height - (format === 'story' ? 355 : (format === 'portrait' ? 170 : 130));

      let titleGlowBlur = 0;
      let titleShadowColor = titleColor;
      let titleAlpha = 1.0;
      let titleGlitchOffset = 0;
      let titleShakeY = 0;
      let isRgbSplit = false;
      let isLaserSweep = false;
      let effectiveTitleColor = titleColor;

      if (isMotionActive) {
        if (titleEffect === 'neon-breathe') {
          const glowFactor = Math.sin(2 * Math.PI * (titleBpm / 60) * time) * 0.5 + 0.5;
          titleGlowBlur = 12 + glowFactor * 32 * titleGlow;
          titleShadowColor = titleColor;
        } else if (titleEffect === 'neon-flicker') {
          const fRand = Math.sin(time * 33) * Math.cos(time * 19);
          const isFlicker = fRand > 0.72;
          titleGlowBlur = isFlicker ? 4 : 24 * titleGlow;
          titleAlpha = isFlicker ? 0.65 : 1.0;
          titleShadowColor = titleColor;
        } else if (titleEffect === 'glitch') {
          const isGlitch = Math.sin(time * 26) > 0.85;
          titleGlitchOffset = isGlitch ? Math.sin(time * 50) * 8 : 0;
          titleGlowBlur = isGlitch ? 20 * titleGlow : 0;
          titleShadowColor = '#00F0FF';
        } else if (titleEffect === 'strobe') {
          const strobeVal = Math.pow(Math.sin(Math.PI * beatPhase), 8);
          titleGlowBlur = 8 + strobeVal * 42 * titleGlow;
          titleShadowColor = '#FFFFFF';
        } else if (titleEffect === 'color-cycle') {
          const hue = Math.round(t * 360);
          effectiveTitleColor = `hsl(${hue}, 100%, 65%)`;
          titleShadowColor = effectiveTitleColor;
          titleGlowBlur = 20 * titleGlow;
        } else if (titleEffect === 'laser-sweep') {
          isLaserSweep = true;
          titleGlowBlur = 16 * titleGlow;
          titleShadowColor = titleColor;
        } else if (titleEffect === 'bass-shake') {
          const punch = Math.pow(Math.max(0, 1 - beatPhase * 3.0), 2);
          titleGlitchOffset = Math.sin(time * 65) * 8 * punch * titleGlow;
          titleShakeY = Math.cos(time * 75) * 5 * punch * titleGlow;
          titleGlowBlur = 12 + punch * 36 * titleGlow;
          titleShadowColor = titleColor;
        } else if (titleEffect === 'rgb-split') {
          isRgbSplit = true;
          titleGlowBlur = 14 * titleGlow;
          titleShadowColor = '#00F0FF';
        }
      }

      // Calculate dynamic title position for glow & rendering
      const titleY = bottomBase - 100 + mainTitleOffsetY + titleShakeY;
      let titleX = width / 2 + mainTitleOffsetX + titleGlitchOffset;
      const titleAlign = mainTitleAlign;

      if (titleAlign === 'left') {
        titleX = width * 0.12 + mainTitleOffsetX + titleGlitchOffset;
      } else if (titleAlign === 'right') {
        titleX = width * 0.88 + mainTitleOffsetX + titleGlitchOffset;
      }

      // Glow background behind title (follows title dynamically across full canvas)
      if (showTitleGlow) {
        const glowGrad = ctx.createRadialGradient(
          titleX, titleY, 10,
          titleX, titleY, width * 0.48
        );
        const bgGlowAlpha = isMotionActive && titleEffect === 'neon-breathe'
          ? 0.15 + (Math.sin(2 * Math.PI * (titleBpm / 60) * time) * 0.5 + 0.5) * 0.15
          : 0.22;
        glowGrad.addColorStop(0, hexToRgba(titleColor, bgGlowAlpha));
        glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = glowGrad;
        ctx.fillRect(titleX - width * 0.5, titleY - 180, width, 360);
      }

      // Subtitle Pill
      if (subTitle.trim()) {
        const textToRender = subTitleUpper ? subTitle.trim().toUpperCase() : subTitle.trim();
        ctx.font = `800 ${subTitleSize}px "Syne", sans-serif`;
        if (ctx.letterSpacing !== undefined) {
          ctx.letterSpacing = `${subTitleTracking}px`;
        }
        const subMetrics = ctx.measureText(textToRender);
        const subPaddingX = Math.round(subTitleSize * 0.9);
        const subW = subMetrics.width + subPaddingX * 2;
        const subH = Math.round(subTitleSize * 2.0);

        let subCenterX = width / 2 + subTitleOffsetX;
        if (subTitleAlign === 'left') {
          subCenterX = width * 0.12 + subW / 2 + subTitleOffsetX;
        } else if (subTitleAlign === 'right') {
          subCenterX = width * 0.88 - subW / 2 + subTitleOffsetX;
        }

        const subX = subCenterX - subW / 2;
        const subY = bottomBase - 205 + subTitleOffsetY;

        let effectiveBadgeTextColor = subTitleColor || badgeTextColor;
        if (!subTitleColor) {
          if (isLightColor(badgeColor) && isLightColor(badgeTextColor)) {
            effectiveBadgeTextColor = '#060608';
          } else if (!isLightColor(badgeColor) && !isLightColor(badgeTextColor)) {
            effectiveBadgeTextColor = '#FFFFFF';
          }
        }

        if (showSubtitleBox) {
          ctx.fillStyle = badgeColor;
          ctx.beginPath();
          ctx.roundRect(subX, subY, subW, subH, 6);
          ctx.fill();
        }

        ctx.fillStyle = showSubtitleBox ? effectiveBadgeTextColor : (subTitleColor || badgeColor);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(textToRender, subCenterX, subY + subH / 2);
      }

      // Main Title
      if (mainTitle.trim()) {
        const titleText = mainTitleUpper ? mainTitle.trim().toUpperCase() : mainTitle.trim();
        ctx.font = `900 ${mainTitleSize}px "Syne", sans-serif`;
        if (ctx.letterSpacing !== undefined) {
          ctx.letterSpacing = `${mainTitleTracking}px`;
        }
        ctx.textBaseline = 'middle';
        ctx.shadowColor = titleShadowColor;
        ctx.shadowBlur = titleGlowBlur;
        ctx.globalAlpha = titleAlpha;

        const drawTitlePass = (curX, curY, colMissa, colFx) => {
          if (titleText.startsWith('MISSA') && titleText.endsWith('FX') && titleText.length >= 7) {
            const missaPart = titleText.slice(0, -2);
            const fxPart = titleText.slice(-2);
            const missaMetrics = ctx.measureText(missaPart);
            const fxMetrics = ctx.measureText(fxPart);
            const fullW = missaMetrics.width + fxMetrics.width;

            let startX = curX - fullW / 2;
            if (titleAlign === 'left') startX = curX;
            else if (titleAlign === 'right') startX = curX - fullW;

            ctx.textAlign = 'left';
            ctx.fillStyle = colMissa;
            ctx.fillText(missaPart, startX, curY);

            ctx.fillStyle = colFx;
            ctx.fillText(fxPart, startX + missaMetrics.width, curY);
          } else {
            ctx.textAlign = titleAlign;
            ctx.fillStyle = colMissa;
            ctx.fillText(titleText, curX, curY);
          }
        };

        if (isRgbSplit) {
          ctx.save();
          ctx.shadowBlur = 0;
          ctx.globalAlpha = 0.75;
          drawTitlePass(titleX - 5, titleY, '#00F0FF', '#00F0FF');
          drawTitlePass(titleX + 5, titleY, '#FF0055', '#FF0055');
          ctx.restore();
        }

        drawTitlePass(titleX, titleY, effectiveTitleColor, titleFxColor);

        if (isLaserSweep) {
          ctx.save();
          ctx.globalCompositeOperation = 'lighter';
          const sweepX = (((time * 0.9) % 1) * (width * 1.5)) - width * 0.25;
          const sweepGrad = ctx.createLinearGradient(sweepX - 50, 0, sweepX + 50, 0);
          sweepGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
          sweepGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.95)');
          sweepGrad.addColorStop(0.7, hexToRgba(titleColor, 0.8));
          sweepGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
          ctx.fillStyle = sweepGrad;
          ctx.fillRect(sweepX - 50, titleY - mainTitleSize * 0.7, 100, mainTitleSize * 1.4);
          ctx.restore();
        }
      }

      // Divider Line
      if (showDividerLine) {
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1.0;
        ctx.strokeStyle = hexToRgba(textColor, 0.2);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(width * 0.15 + eventDateOffsetX, bottomBase - 35 + eventDateOffsetY);
        ctx.lineTo(width * 0.85 + eventDateOffsetX, bottomBase - 35 + eventDateOffsetY);
        ctx.stroke();
      }

      // Event Date & Venue Info
      ctx.textBaseline = 'middle';

      if (eventDate.trim()) {
        const textToRender = eventDateUpper ? eventDate.trim().toUpperCase() : eventDate.trim();
        ctx.font = `800 ${eventDateSize}px "Outfit", sans-serif`;
        if (ctx.letterSpacing !== undefined) {
          ctx.letterSpacing = `${eventDateTracking}px`;
        }
        let dateX = width / 2 + eventDateOffsetX;
        if (eventDateAlign === 'left') dateX = width * 0.12 + eventDateOffsetX;
        if (eventDateAlign === 'right') dateX = width * 0.88 + eventDateOffsetX;

        ctx.textAlign = eventDateAlign;
        ctx.fillStyle = eventDateColor || textColor;
        ctx.fillText(textToRender, dateX, bottomBase + 12 + eventDateOffsetY);
      }

      if (eventVenue.trim()) {
        const textToRender = eventVenueUpper ? eventVenue.trim().toUpperCase() : eventVenue.trim();
        ctx.font = `500 ${eventVenueSize}px "Outfit", sans-serif`;
        if (ctx.letterSpacing !== undefined) {
          ctx.letterSpacing = `${eventVenueTracking}px`;
        }
        let venueX = width / 2 + eventVenueOffsetX;
        if (eventVenueAlign === 'left') venueX = width * 0.12 + eventVenueOffsetX;
        if (eventVenueAlign === 'right') venueX = width * 0.88 + eventVenueOffsetX;

        ctx.textAlign = eventVenueAlign;
        ctx.fillStyle = eventVenueColor || hexToRgba(textColor, 0.75);
        ctx.fillText(textToRender, venueX, bottomBase + 55 + eventVenueOffsetY);
      }

      // 6. Booking / Contact Info
      if (bookingText.trim()) {
        const textToRender = bookingTextUpper ? bookingText.trim().toUpperCase() : bookingText.trim();
        ctx.font = `700 ${bookingTextSize}px "Outfit", sans-serif`;
        if (ctx.letterSpacing !== undefined) {
          ctx.letterSpacing = `${bookingTextTracking}px`;
        }
        let bookX = width / 2 + bookingTextOffsetX;
        if (bookingTextAlign === 'left') bookX = width * 0.12 + bookingTextOffsetX;
        if (bookingTextAlign === 'right') bookX = width * 0.88 + bookingTextOffsetX;

        ctx.textAlign = bookingTextAlign;
        ctx.fillStyle = bookingTextColor || techColor;
        ctx.fillText(textToRender, bookX, bottomBase + 92 + bookingTextOffsetY);
      }

      ctx.restore();

      // 10. Safe Zone Guides (Preview only overlay)
      if (showSafeZones && format === 'story') {
        ctx.save();
        ctx.strokeStyle = 'rgba(250, 204, 21, 0.75)';
        ctx.lineWidth = 2;
        ctx.setLineDash([8, 8]);

        ctx.strokeRect(40, 220, width - 80, height - 440);

        ctx.fillStyle = 'rgba(250, 204, 21, 0.15)';
        ctx.fillRect(0, 0, width, 220);
        ctx.fillRect(0, height - 220, width, 220);

        ctx.fillStyle = '#FACC15';
        ctx.font = '700 18px "Outfit", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('ZONA HEADER INSTAGRAM (Evitar textos)', width / 2, 110);
        ctx.fillText('ZONA RESPUESTA / MENSAJE (Evitar textos)', width / 2, height - 110);

        ctx.restore();
      }
    },
    [
      format,
      photoScale,
      photoPanX,
      photoPanY,
      photoFilter,
      imageLoaded,
      repeatedText,
      repeatedTextSize,
      repeatedTextPosX,
      repeatedTextPosY,
      repeatedTextSpacing,
      repeatedTextTracking,
      repeatedTextAlign,
      repeatedTextUpper,
      mainTitle,
      mainTitleSize,
      mainTitleOffsetY,
      mainTitleOffsetX,
      mainTitleTracking,
      mainTitleAlign,
      mainTitleUpper,
      subTitle,
      subTitleSize,
      subTitleOffsetY,
      subTitleOffsetX,
      subTitleTracking,
      subTitleAlign,
      subTitleUpper,
      subTitleColor,
      eventDate,
      eventDateSize,
      eventDateOffsetY,
      eventDateOffsetX,
      eventDateTracking,
      eventDateAlign,
      eventDateUpper,
      eventDateColor,
      eventVenue,
      eventVenueSize,
      eventVenueOffsetY,
      eventVenueOffsetX,
      eventVenueTracking,
      eventVenueAlign,
      eventVenueUpper,
      eventVenueColor,
      bookingText,
      bookingTextSize,
      bookingTextOffsetY,
      bookingTextOffsetX,
      bookingTextTracking,
      bookingTextAlign,
      bookingTextUpper,
      bookingTextColor,
      frameColor,
      titleColor,
      titleFxColor,
      repeatTextColor,
      badgeColor,
      badgeTextColor,
      textColor,
      techColor,
      badgeTagText,
      badgeTagSize,
      badgeTagOffsetY,
      badgeTagOffsetX,
      badgeTagTracking,
      badgeTagAlign,
      badgeTagUpper,
      badgeTagTextColor,
      audioSpecText,
      audioSpecSize,
      audioSpecOffsetY,
      audioSpecOffsetX,
      audioSpecTracking,
      audioSpecAlign,
      audioSpecUpper,
      audioSpecColor,
      hudCoordsText,
      hudCoordsSize,
      hudCoordsOffsetY,
      hudCoordsOffsetX,
      hudCoordsTracking,
      hudCoordsAlign,
      hudCoordsUpper,
      hudCoordsColor,
      eqOffsetX,
      eqOffsetY,
      eqScale,
      showRepeatText,
      showCyberFrame,
      frameFitSafeZone,
      showTechAccents,
      showBadges,
      showAudioSpec,
      showHudCoords,
      showEq,
      showDividerLine,
      showSubtitleBox,
      showTitleGlow,
      showVignette,
      showPhotoLayer,
      showSafeZones,
      isMotionActive,
      loopDuration,
      cascadeEffect,
      cascadeSpeed,
      titleEffect,
      titleGlow,
      titleBpm,
      eqEffect,
      eqSpeed,
      eqIntensity,
      photoEffect,
      photoMotionIntensity,
      atmosphereEffect,
      atmosphereDensity
    ]
  );

  // Animation frame loop for continuous live motion preview (pauses completely during export to avoid GPU/canvas race conditions)
  useEffect(() => {
    if (!isPlaying || !isMotionActive || isExporting) {
      if (!isExporting) renderCanvas(0);
      return;
    }

    let animationFrameId;
    const startTime = performance.now();

    const renderLoop = (currentTime) => {
      const elapsed = (currentTime - startTime) / 1000;
      renderCanvas(elapsed);
      animationFrameId = requestAnimationFrame(renderLoop);
    };

    animationFrameId = requestAnimationFrame(renderLoop);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isPlaying, isMotionActive, isExporting, renderCanvas]);

  // Export 1: High resolution PNG (Static Flyer)
  const handleDownload = () => {
    setIsExporting(true);

    const wasSafeZonesActive = showSafeZones;
    if (wasSafeZonesActive) {
      setShowSafeZones(false);
    }

    setTimeout(() => {
      renderCanvas(0);
      const canvas = canvasRef.current;
      if (!canvas) {
        setIsExporting(false);
        return;
      }

      try {
        const dataUrl = canvas.toDataURL('image/png', 1.0);
        const link = document.createElement('a');
        const filename = `missafx-${format}-${FORMATS[format].width}x${FORMATS[format].height}.png`;
        link.download = filename;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setDownloadSuccess(true);
        setTimeout(() => setDownloadSuccess(false), 4000);
      } catch (err) {
        console.error('Download error:', err);
      } finally {
        setIsExporting(false);
        if (wasSafeZonesActive) {
          setShowSafeZones(true);
        }
      }
    }, 150);
  };

  // Export 2: Video Story (True 100% ISO MP4 via WebCodecs + mp4-muxer with MediaRecorder fallback)
  const handleExportVideo = async () => {
    setIsExporting(true);
    setLastExportedVideoUrl(null);

    const wasSafeZonesActive = showSafeZones;
    if (wasSafeZonesActive) setShowSafeZones(false);

    const width = FORMATS[format].width;
    const height = FORMATS[format].height;
    const fps = motionFps;
    const totalFrames = Math.round(loopDuration * fps);
    const targetBitrate = fps === 120 ? 28000000 : (fps === 60 ? 16000000 : 9000000);

    // Dedicated offscreen canvas for export: 100% isolated, zero DOM or preview interference
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = width;
    exportCanvas.height = height;

    // 1. Try modern frame-by-frame WebCodecs VideoEncoder (True CFR MP4, ZERO dropped frames, 100% smooth)
    if (typeof window !== 'undefined' && 'VideoEncoder' in window && 'VideoFrame' in window) {
      try {
        setExportStatusText(`Configurando codificador MP4 H.264 @ ${fps} FPS...`);

        const muxer = new Muxer({
          target: new ArrayBufferTarget(),
          video: {
            codec: 'avc',
            width,
            height
          },
          fastStart: 'in-memory',
          firstTimestampBehavior: 'offset'
        });

        let encoderError = null;
        const videoEncoder = new VideoEncoder({
          output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
          error: (e) => {
            console.error('VideoEncoder error:', e);
            encoderError = e;
          }
        });

        // Test supported codecs in order of highest capability for 1080p high FPS
        const codecCandidates = [
          'avc1.640033', // High Profile, Level 5.1 (1080p up to 120 FPS)
          'avc1.4d0033', // Main Profile, Level 5.1
          'avc1.640034', // High Profile, Level 5.2
          'avc1.4d0034', // Main Profile, Level 5.2
          'avc1.64002a', // High Profile, Level 4.2 (1080p up to 60 FPS)
          'avc1.4d002a', // Main Profile, Level 4.2
          'avc1.42002a', // Baseline Profile, Level 4.2
          'avc1.42001f'  // Baseline Profile, Level 3.1
        ];

        let chosenCodec = null;
        for (const cand of codecCandidates) {
          try {
            const isSupported = await VideoEncoder.isConfigSupported({
              codec: cand,
              width,
              height,
              bitrate: targetBitrate,
              framerate: fps
            });
            if (isSupported && isSupported.supported) {
              chosenCodec = cand;
              break;
            }
          } catch (_) {}
        }

        if (!chosenCodec) {
          chosenCodec = fps === 120 ? 'avc1.4d0033' : 'avc1.4d002a';
        }

        videoEncoder.configure({
          codec: chosenCodec,
          width,
          height,
          bitrate: targetBitrate,
          framerate: fps
        });

        const frameIntervalUs = Math.round(1_000_000 / fps);

        for (let i = 0; i < totalFrames; i++) {
          if (encoderError) throw encoderError;

          const frameTime = (i / totalFrames) * loopDuration;
          renderCanvas(frameTime, exportCanvas);

          // Backpressure: if hardware encoder buffer is getting full, wait for it to catch up
          while (videoEncoder.encodeQueueSize > 4) {
            await new Promise((resolve) => setTimeout(resolve, 8));
          }

          const frame = new VideoFrame(exportCanvas, {
            timestamp: i * frameIntervalUs,
            duration: frameIntervalUs
          });

          // Keyframe every 1 second (GOP = fps) for ultra-smooth seek & playback on phones
          const isKeyFrame = i % fps === 0;
          videoEncoder.encode(frame, { keyFrame: isKeyFrame });
          frame.close();

          const pct = Math.round(((i + 1) / totalFrames) * 100);
          setExportStatusText(`Renderizando cuadro ${i + 1}/${totalFrames} (${pct}%) @ ${fps} FPS...`);

          // Allow the browser to process UI render every 8 frames
          if (i % 8 === 0) {
            await new Promise((resolve) => setTimeout(resolve, 0));
          }
        }

        setExportStatusText('Empaquetando video MP4 con FastStart...');
        await videoEncoder.flush();
        videoEncoder.close();
        muxer.finalize();

        const blob = new Blob([muxer.target.buffer], { type: 'video/mp4' });
        const url = URL.createObjectURL(blob);
        setLastExportedVideoUrl(url);

        const a = document.createElement('a');
        a.href = url;
        a.download = `missafx-story-${format}-${width}x${height}-${fps}fps.mp4`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        setIsExporting(false);
        setExportStatusText('');
        setDownloadSuccess(true);
        setTimeout(() => setDownloadSuccess(false), 5000);
        if (wasSafeZonesActive) setShowSafeZones(true);
        return;
      } catch (err) {
        console.warn('WebCodecs MP4 encoding failed, falling back to MediaRecorder:', err);
      }
    }

    // 2. Fallback for legacy browsers without WebCodecs: MediaRecorder
    try {
      const canvas = canvasRef.current;
      if (!canvas) {
        setIsExporting(false);
        return;
      }
      setExportStatusText(`Grabando video @ ${fps} FPS (${loopDuration}s)...`);
      const candidateTypes = [
        'video/mp4;codecs=avc1.42E01E,mp4a.40.2',
        'video/mp4;codecs=avc1',
        'video/mp4;codecs=h264',
        'video/mp4',
        'video/webm;codecs=h264',
        'video/webm;codecs=vp9',
        'video/webm'
      ];
      const selectedMime = candidateTypes.find((type) => MediaRecorder.isTypeSupported(type)) || 'video/mp4';

      setIsPlaying(true);
      setIsMotionActive(true);

      const stream = canvas.captureStream(fps);
      const recorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported(selectedMime) ? selectedMime : undefined,
        videoBitsPerSecond: targetBitrate
      });

      const chunks = [];
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const isNativeMp4 = selectedMime.startsWith('video/mp4');
        const blob = new Blob(chunks, { type: isNativeMp4 ? 'video/mp4' : selectedMime });
        const url = URL.createObjectURL(blob);
        setLastExportedVideoUrl(url);
        const a = document.createElement('a');
        a.href = url;
        const ext = isNativeMp4 ? 'mp4' : 'webm';
        a.download = `missafx-story-${format}-${width}x${height}-${fps}fps.${ext}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setIsExporting(false);
        setExportStatusText('');
        setDownloadSuccess(true);
        setTimeout(() => setDownloadSuccess(false), 5000);
        if (wasSafeZonesActive) setShowSafeZones(true);
      };

      recorder.start();
      setTimeout(() => {
        recorder.stop();
      }, loopDuration * 1000);
    } catch (err) {
      console.error('Video recording error:', err);
      setIsExporting(false);
      setExportStatusText('');
      if (wasSafeZonesActive) setShowSafeZones(true);
    }
  };

  // Export 3: Animated GIF (.gif) using gifenc
  const handleExportGif = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setIsExporting(true);
    setExportStatusText(cT.exportGifRendering || 'Generando frames GIF...');

    const wasSafeZonesActive = showSafeZones;
    if (wasSafeZonesActive) setShowSafeZones(false);

    try {
      const gifScale = 0.5;
      const gW = Math.round(FORMATS[format].width * gifScale);
      const gH = Math.round(FORMATS[format].height * gifScale);

      const offCanvas = document.createElement('canvas');
      offCanvas.width = gW;
      offCanvas.height = gH;
      const offCtx = offCanvas.getContext('2d', { willReadFrequently: true });

      const gif = GIFEncoder();
      const fps = 15;
      const totalFrames = Math.round(loopDuration * fps);
      const frameDelay = Math.round(1000 / fps);

      for (let i = 0; i < totalFrames; i++) {
        const frameTime = (i / totalFrames) * loopDuration;

        renderCanvas(frameTime);

        offCtx.clearRect(0, 0, gW, gH);
        offCtx.drawImage(canvas, 0, 0, gW, gH);

        const imgData = offCtx.getImageData(0, 0, gW, gH);
        const palette = quantize(imgData.data, 256);
        const index = applyPalette(imgData.data, palette);

        gif.writeFrame(index, gW, gH, {
          palette,
          delay: frameDelay,
          repeat: 0
        });

        setExportStatusText(
          `${cT.exportGifRendering || 'Generando frames GIF...'} (${Math.round(((i + 1) / totalFrames) * 100)}%)`
        );
        await new Promise((resolve) => setTimeout(resolve, 12));
      }

      gif.finish();
      const buffer = gif.bytesView();
      const blob = new Blob([buffer], { type: 'image/gif' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `missafx-animated-story-${format}.gif`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    } catch (err) {
      console.error('GIF export error:', err);
    } finally {
      setIsExporting(false);
      setExportStatusText('');
      if (wasSafeZonesActive) setShowSafeZones(true);
      renderCanvas(0);
    }
  };

  // Reset Photo position
  const handleResetPosition = () => {
    setPhotoScale(1.1);
    setPhotoPanX(0);
    setPhotoPanY(0);
  };

  // Helper component for granular color picker row
  const renderColorItem = (label, value, setter) => (
    <div
      style={{
        padding: '12px 14px',
        borderRadius: '12px',
        background: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '10px'
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontSize: '0.84rem', fontWeight: 600, color: '#fff' }}>{label}</span>
        <span style={{ fontSize: '0.72rem', fontFamily: 'monospace', color: 'var(--text-dim)' }}>
          {value.toUpperCase()}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* Quick color dots */}
        {['#FF003C', '#53FC18', '#A855F7', '#00F0FF', '#EAB308', '#FFFFFF'].map((c) => (
          <button
            key={c}
            onClick={() => setter(c)}
            style={{
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              background: c,
              border: value.toUpperCase() === c ? '2px solid #fff' : '1px solid rgba(0,0,0,0.5)',
              cursor: 'pointer',
              padding: 0,
              boxShadow: value.toUpperCase() === c ? `0 0 8px ${c}` : 'none'
            }}
          />
        ))}

        {/* Native color picker */}
        <input
          type="color"
          value={value}
          onChange={(e) => setter(e.target.value)}
          title="Selector de Color Personalizado"
          style={{
            width: '28px',
            height: '28px',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            background: 'transparent',
            padding: 0
          }}
        />
      </div>
    </div>
  );

  // Reusable helper for Alignment buttons (Left, Center, Right) across all text elements
  const renderAlignmentSelector = (currentAlign, setAlign) => (
    <div>
      <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
        {cT.alignLabel}:
      </span>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
        {[
          { id: 'left', label: cT.alignLeft, icon: AlignLeft },
          { id: 'center', label: cT.alignCenter, icon: AlignCenter },
          { id: 'right', label: cT.alignRight, icon: AlignRight }
        ].map((al) => {
          const Icon = al.icon;
          const isActive = currentAlign === al.id;
          return (
            <button
              key={al.id}
              type="button"
              onClick={() => setAlign(al.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '5px',
                padding: '6px 10px',
                borderRadius: '8px',
                border: isActive ? `1px solid ${frameColor}` : '1px solid rgba(255, 255, 255, 0.08)',
                background: isActive ? hexToRgba(frameColor, 0.2) : 'rgba(255, 255, 255, 0.04)',
                color: isActive ? '#fff' : 'var(--text-muted)',
                fontSize: '0.74rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <Icon size={12} />
              <span>{al.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );

  // Reusable helper for Inline Color Picker inside typography drawers
  const renderInlineColorPicker = (label, currentColor, setColor, defaultColors = ['#FF003C', '#53FC18', '#A855F7', '#00F0FF', '#EAB308', '#FFFFFF', '#CBD5E1']) => (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
        <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{label}:</span>
        <span style={{ fontSize: '0.74rem', color: '#fff', fontFamily: 'monospace', fontWeight: 700 }}>
          {currentColor ? currentColor.toUpperCase() : '#DEFAULT'}
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        {defaultColors.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setColor(c)}
            style={{
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              background: c,
              border: currentColor?.toUpperCase() === c ? '2px solid #fff' : '1px solid rgba(0,0,0,0.5)',
              cursor: 'pointer',
              padding: 0,
              boxShadow: currentColor?.toUpperCase() === c ? `0 0 8px ${c}` : 'none'
            }}
          />
        ))}
        <input
          type="color"
          value={currentColor?.startsWith('#') ? currentColor : '#FFFFFF'}
          onChange={(e) => setColor(e.target.value)}
          title="Color personalizado"
          style={{
            width: '26px',
            height: '26px',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            background: 'transparent',
            padding: 0
          }}
        />
      </div>
    </div>
  );

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#060608',
        color: '#F8FAFC',
        paddingBottom: '80px'
      }}
    >
      {/* Top Navbar Bar */}
      <header
        style={{
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'rgba(12, 12, 16, 0.85)',
          backdropFilter: 'blur(16px)',
          position: 'sticky',
          top: 0,
          zIndex: 50,
          padding: '16px 0'
        }}
      >
        <div
          className="container"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <button
            onClick={onBack}
            className="btn btn-secondary btn-sm"
            style={{
              gap: '8px',
              padding: '8px 16px',
              cursor: 'pointer',
              border: '1px solid rgba(255, 255, 255, 0.12)'
            }}
          >
            <ArrowLeft size={16} color={frameColor} />
            <span>{cT.backToHome}</span>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                padding: '4px 10px',
                borderRadius: '6px',
                background: hexToRgba(frameColor, 0.12),
                color: frameColor,
                border: `1px solid ${hexToRgba(frameColor, 0.3)}`
              }}
            >
              {cT.badge}
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="container" style={{ marginTop: '36px' }}>
        {/* Header Hero */}
        <div style={{ marginBottom: '32px' }}>
          <h1
            className="font-display"
            style={{
              fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
              color: '#FFFFFF',
              marginBottom: '10px',
              letterSpacing: '-0.02em'
            }}
          >
            {cT.title}
          </h1>
          <p
            style={{
              color: 'var(--text-muted)',
              fontSize: '0.98rem',
              maxWidth: '750px',
              lineHeight: 1.6
            }}
          >
            {cT.subtitle}
          </p>
        </div>

        {/* Step Progress Tabs Bar (7 Steps) */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            marginBottom: '32px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            paddingBottom: '16px'
          }}
        >
          {[
            { id: 1, label: cT.step1, icon: Maximize2 },
            { id: 2, label: cT.step2, icon: Sliders },
            { id: 3, label: cT.step3, icon: Type },
            { id: 4, label: cT.step4, icon: Palette },
            { id: 5, label: cT.step5, icon: Film },
            { id: 6, label: cT.step6, icon: Layers },
            { id: 7, label: cT.step7, icon: Download }
          ].map((step) => {
            const Icon = step.icon;
            const isActive = activeStep === step.id;
            return (
              <button
                key={step.id}
                onClick={() => setActiveStep(step.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 18px',
                  borderRadius: '10px',
                  fontSize: '0.86rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: isActive
                    ? `1px solid ${frameColor}`
                    : '1px solid rgba(255, 255, 255, 0.06)',
                  background: isActive
                    ? hexToRgba(frameColor, 0.12)
                    : 'rgba(255, 255, 255, 0.02)',
                  color: isActive ? '#FFFFFF' : 'var(--text-muted)',
                  transition: 'all 0.2s ease'
                }}
              >
                <Icon size={15} color={isActive ? frameColor : 'var(--text-dim)'} />
                <span>{step.label}</span>
              </button>
            );
          })}
        </div>

        {/* 2-Column Responsive Layout */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '36px',
            alignItems: 'start'
          }}
        >
          {/* Left Column: Interactive Steps Controls */}
          <div
            className="glass-panel"
            style={{
              padding: '28px',
              borderRadius: '20px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              background: 'rgba(12, 12, 16, 0.65)'
            }}
          >
            {/* STEP 1: Format Selection */}
            {activeStep === 1 && (
              <div>
                <h3
                  className="font-display"
                  style={{ fontSize: '1.25rem', marginBottom: '8px', color: '#fff' }}
                >
                  {cT.formatTitle}
                </h3>
                <p
                  style={{
                    color: 'var(--text-muted)',
                    fontSize: '0.88rem',
                    marginBottom: '20px'
                  }}
                >
                  {cT.formatHint}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {Object.values(FORMATS).map((fmt) => {
                    const Icon = fmt.icon;
                    const isSelected = format === fmt.id;
                    return (
                      <div
                        key={fmt.id}
                        onClick={() => setFormat(fmt.id)}
                        style={{
                          padding: '18px 20px',
                          borderRadius: '14px',
                          border: isSelected
                            ? `2px solid ${frameColor}`
                            : '1px solid rgba(255, 255, 255, 0.08)',
                          background: isSelected
                            ? hexToRgba(frameColor, 0.08)
                            : 'rgba(255, 255, 255, 0.02)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <div
                            style={{
                              width: '44px',
                              height: '44px',
                              borderRadius: '10px',
                              background: isSelected
                                ? hexToRgba(frameColor, 0.2)
                                : 'rgba(255, 255, 255, 0.04)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: isSelected ? frameColor : 'var(--text-muted)'
                            }}
                          >
                            <Icon size={24} />
                          </div>
                          <div>
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                marginBottom: '4px'
                              }}
                            >
                              <strong style={{ color: '#fff', fontSize: '0.98rem' }}>
                                {cT[fmt.nameKey]}
                              </strong>
                              <span
                                style={{
                                  fontSize: '0.72rem',
                                  padding: '2px 8px',
                                  borderRadius: '6px',
                                  background: 'rgba(255, 255, 255, 0.08)',
                                  color: 'var(--text-muted)',
                                  fontFamily: 'monospace'
                                }}
                              >
                                {cT[fmt.dimKey]}
                              </span>
                            </div>
                            <p
                              style={{
                                fontSize: '0.82rem',
                                color: 'var(--text-dim)',
                                margin: 0
                              }}
                            >
                              {cT[fmt.noteKey]}
                            </p>
                          </div>
                        </div>

                        {isSelected && <CheckCircle2 size={20} color={frameColor} />}
                      </div>
                    );
                  })}
                </div>

                <div style={{ marginTop: '28px', display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => setActiveStep(2)}
                    className="btn btn-primary btn-sm"
                    style={{ padding: '10px 24px', cursor: 'pointer' }}
                  >
                    <span>Siguiente: Foto & Ajuste →</span>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Photo and Pan/Zoom adjustments */}
            {activeStep === 2 && (
              <div>
                <h3
                  className="font-display"
                  style={{ fontSize: '1.25rem', marginBottom: '8px', color: '#fff' }}
                >
                  {cT.photoTitle}
                </h3>
                <p
                  style={{
                    color: 'var(--text-muted)',
                    fontSize: '0.88rem',
                    marginBottom: '20px'
                  }}
                >
                  Sube una foto de tu cabina o utiliza los retratos oficiales de Missafx.
                </p>

                {/* Upload Button */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="btn btn-secondary"
                  style={{
                    width: '100%',
                    padding: '16px',
                    border: `1px dashed ${hexToRgba(frameColor, 0.5)}`,
                    background: hexToRgba(frameColor, 0.04),
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '22px',
                    cursor: 'pointer'
                  }}
                >
                  <Upload size={24} color={frameColor} />
                  <span style={{ fontWeight: 600, color: '#fff' }}>{cT.photoUpload}</span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                    {cT.photoUploadSub}
                  </span>
                </button>

                {/* Preset Photos */}
                <div style={{ marginBottom: '24px' }}>
                  <label
                    style={{
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      color: 'var(--text-muted)',
                      display: 'block',
                      marginBottom: '10px'
                    }}
                  >
                    {cT.photoPresets}
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '10px' }}>
                    {DEFAULT_PRESETS.map((preset) => {
                      const isChosen = photoSrc === preset.src;
                      const label = preset.nameKey && cT[preset.nameKey] ? cT[preset.nameKey] : preset.name;
                      return (
                        <div
                          key={preset.id}
                          onClick={() => {
                            setPhotoSrc(preset.src);
                            handleResetPosition();
                          }}
                          style={{
                            borderRadius: '12px',
                            overflow: 'hidden',
                            border: isChosen
                              ? `2px solid ${frameColor}`
                              : '1px solid rgba(255, 255, 255, 0.1)',
                            background: '#000',
                            cursor: 'pointer',
                            position: 'relative',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <img
                            src={preset.src}
                            alt={label}
                            style={{
                              width: '100%',
                              height: '80px',
                              objectFit: 'cover',
                              display: 'block',
                              opacity: isChosen ? 1 : 0.65
                            }}
                          />
                          <div
                            style={{
                              padding: '5px 6px',
                              fontSize: '0.72rem',
                              fontWeight: 600,
                              color: isChosen ? frameColor : '#fff',
                              background: 'rgba(12, 12, 16, 0.92)',
                              textAlign: 'center',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}
                          >
                            {label}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Adjustments: Scale, Pan X, Pan Y */}
                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    padding: '18px',
                    borderRadius: '14px',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    marginBottom: '20px'
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '14px'
                    }}
                  >
                    <span style={{ fontSize: '0.84rem', fontWeight: 600, color: '#fff' }}>
                      Ajuste de Encuadre & Posición
                    </span>
                    <button
                      onClick={handleResetPosition}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: frameColor,
                        fontSize: '0.78rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <RefreshCw size={12} />
                      <span>Centrar</span>
                    </button>
                  </div>

                  {/* Zoom Slider */}
                  <div style={{ marginBottom: '14px' }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '0.78rem',
                        color: 'var(--text-muted)',
                        marginBottom: '6px'
                      }}
                    >
                      <span>{cT.photoScale}</span>
                      <span style={{ fontFamily: 'monospace' }}>{photoScale.toFixed(2)}x</span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="2.5"
                      step="0.05"
                      value={photoScale}
                      onChange={(e) => setPhotoScale(parseFloat(e.target.value))}
                      style={{ width: '100%', accentColor: frameColor }}
                    />
                  </div>

                  {/* Horizontal Pan */}
                  <div style={{ marginBottom: '14px' }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '0.78rem',
                        color: 'var(--text-muted)',
                        marginBottom: '6px'
                      }}
                    >
                      <span>{cT.photoX}</span>
                      <span style={{ fontFamily: 'monospace' }}>{photoPanX}px</span>
                    </div>
                    <input
                      type="range"
                      min="-400"
                      max="400"
                      step="5"
                      value={photoPanX}
                      onChange={(e) => setPhotoPanX(parseInt(e.target.value))}
                      style={{ width: '100%', accentColor: frameColor }}
                    />
                  </div>

                  {/* Vertical Pan */}
                  <div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '0.78rem',
                        color: 'var(--text-muted)',
                        marginBottom: '6px'
                      }}
                    >
                      <span>{cT.photoY}</span>
                      <span style={{ fontFamily: 'monospace' }}>{photoPanY}px</span>
                    </div>
                    <input
                      type="range"
                      min="-400"
                      max="400"
                      step="5"
                      value={photoPanY}
                      onChange={(e) => setPhotoPanY(parseInt(e.target.value))}
                      style={{ width: '100%', accentColor: frameColor }}
                    />
                  </div>
                </div>

                {/* Color Filters */}
                <div style={{ marginBottom: '24px' }}>
                  <label
                    style={{
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      color: 'var(--text-muted)',
                      display: 'block',
                      marginBottom: '10px'
                    }}
                  >
                    {cT.photoFilter}
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                    {[
                      { id: 'normal', label: cT.filterOriginal },
                      { id: 'contrast', label: cT.filterContrast },
                      { id: 'cyberpunk', label: cT.filterCyberpunk }
                    ].map((f) => (
                      <button
                        key={f.id}
                        onClick={() => setPhotoFilter(f.id)}
                        style={{
                          padding: '8px 10px',
                          borderRadius: '8px',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          border:
                            photoFilter === f.id
                              ? `1px solid ${frameColor}`
                              : '1px solid rgba(255, 255, 255, 0.08)',
                          background:
                            photoFilter === f.id
                              ? hexToRgba(frameColor, 0.15)
                              : 'rgba(255, 255, 255, 0.03)',
                          color: photoFilter === f.id ? '#fff' : 'var(--text-muted)'
                        }}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Next / Prev */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '28px' }}>
                  <button
                    onClick={() => setActiveStep(1)}
                    className="btn btn-secondary btn-sm"
                    style={{ cursor: 'pointer' }}
                  >
                    <span>← Formato</span>
                  </button>
                  <button
                    onClick={() => setActiveStep(3)}
                    className="btn btn-primary btn-sm"
                    style={{ cursor: 'pointer' }}
                  >
                    <span>Siguiente: Textos →</span>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Typography & Text details */}
            {activeStep === 3 && (
              <div>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <h3
                      className="font-display"
                      style={{ fontSize: '1.25rem', marginBottom: '4px', color: '#fff' }}
                    >
                      {cT.textTitle}
                    </h3>
                    <p
                      style={{
                        color: 'var(--text-muted)',
                        fontSize: '0.84rem',
                        margin: 0
                      }}
                    >
                      {cT.textSubtitle || 'Modifica textos, tamaños, posiciones y espaciados para lograr una composición perfecta.'}
                    </p>
                  </div>

                  <button
                    onClick={handleResetAllTypography}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 12px',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      color: 'var(--text-muted)',
                      fontSize: '0.74rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                    title="Restablecer todos los tamaños y posiciones"
                  >
                    <RotateCcw size={13} />
                    <span>{cT.textResetDefaults}</span>
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {/* 1. Repeated Lateral Outline Text */}
                  <div
                    style={{
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: expandedTextSection === 'repeat' ? `1px solid ${hexToRgba(frameColor, 0.35)}` : '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '14px',
                      padding: '14px 16px',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#fff' }}>
                          {cT.textRepeatLabel}
                        </span>
                        <span
                          style={{
                            fontSize: '0.72rem',
                            color: repeatTextColor,
                            background: hexToRgba(repeatTextColor, 0.12),
                            padding: '2px 8px',
                            borderRadius: '6px',
                            fontWeight: 700,
                            fontFamily: 'monospace'
                          }}
                        >
                          {repeatedTextSize}px • {repeatedTextAlign.toUpperCase()}
                        </span>
                      </div>

                      <button
                        onClick={() => toggleTextSection('repeat')}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '5px 10px',
                          borderRadius: '8px',
                          border: expandedTextSection === 'repeat' ? `1px solid ${frameColor}` : '1px solid rgba(255, 255, 255, 0.1)',
                          background: expandedTextSection === 'repeat' ? hexToRgba(frameColor, 0.2) : 'rgba(255, 255, 255, 0.04)',
                          color: expandedTextSection === 'repeat' ? '#fff' : 'var(--text-muted)',
                          fontSize: '0.74rem',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        <Sliders size={13} />
                        <span>{expandedTextSection === 'repeat' ? 'Ocultar' : cT.textAdvancedToggle}</span>
                        <ChevronDown size={13} style={{ transform: expandedTextSection === 'repeat' ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                      </button>
                    </div>

                    <input
                      type="text"
                      value={repeatedText}
                      maxLength={120}
                      onChange={(e) => setRepeatedText(e.target.value)}
                      placeholder={cT.textRepeatPlaceholder}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        background: 'rgba(0, 0, 0, 0.4)',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        borderRadius: '10px',
                        color: '#fff',
                        fontSize: '0.9rem',
                        outline: 'none'
                      }}
                    />
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '4px', display: 'block' }}>
                      {cT.textRepeatHelp}
                    </span>

                    {/* Expandable Controls for Repeated Text */}
                    {expandedTextSection === 'repeat' && (
                      <div
                        style={{
                          marginTop: '14px',
                          padding: '14px',
                          background: 'rgba(0, 0, 0, 0.35)',
                          borderRadius: '10px',
                          border: '1px solid rgba(255, 255, 255, 0.05)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '12px'
                        }}
                      >
                        {/* Size */}
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{cT.fontSizeLabel}:</span>
                            <span style={{ fontSize: '0.76rem', color: '#fff', fontFamily: 'monospace', fontWeight: 700 }}>{repeatedTextSize} px</span>
                          </div>
                          <input
                            type="range"
                            min="20"
                            max="220"
                            step="2"
                            value={repeatedTextSize}
                            onChange={(e) => setRepeatedTextSize(parseInt(e.target.value, 10))}
                            style={{ width: '100%', accentColor: frameColor, cursor: 'pointer' }}
                          />
                        </div>

                        {/* Spacing between repeats */}
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{cT.cascadeSpacingLabel}:</span>
                            <span style={{ fontSize: '0.76rem', color: '#fff', fontFamily: 'monospace', fontWeight: 700 }}>{repeatedTextSpacing} px</span>
                          </div>
                          <input
                            type="range"
                            min="25"
                            max="320"
                            step="2"
                            value={repeatedTextSpacing}
                            onChange={(e) => setRepeatedTextSpacing(parseInt(e.target.value, 10))}
                            style={{ width: '100%', accentColor: frameColor, cursor: 'pointer' }}
                          />
                        </div>

                        {/* Position Y */}
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{cT.cascadePosYLabel}:</span>
                            <span style={{ fontSize: '0.76rem', color: '#fff', fontFamily: 'monospace', fontWeight: 700 }}>{repeatedTextPosY > 0 ? `+${repeatedTextPosY}` : repeatedTextPosY} px</span>
                          </div>
                          <input
                            type="range"
                            min="-1650"
                            max="1650"
                            step="5"
                            value={repeatedTextPosY}
                            onChange={(e) => setRepeatedTextPosY(parseInt(e.target.value, 10))}
                            style={{ width: '100%', accentColor: frameColor, cursor: 'pointer' }}
                          />
                        </div>

                        {/* Position X */}
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{cT.cascadePosXLabel}:</span>
                            <span style={{ fontSize: '0.76rem', color: '#fff', fontFamily: 'monospace', fontWeight: 700 }}>{repeatedTextPosX} px</span>
                          </div>
                          <input
                            type="range"
                            min="-650"
                            max="1100"
                            step="5"
                            value={repeatedTextPosX}
                            onChange={(e) => setRepeatedTextPosX(parseInt(e.target.value, 10))}
                            style={{ width: '100%', accentColor: frameColor, cursor: 'pointer' }}
                          />
                        </div>

                        {/* Tracking / Letter Spacing */}
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{cT.letterSpacingLabel}:</span>
                            <span style={{ fontSize: '0.76rem', color: '#fff', fontFamily: 'monospace', fontWeight: 700 }}>{repeatedTextTracking} px</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="40"
                            step="1"
                            value={repeatedTextTracking}
                            onChange={(e) => setRepeatedTextTracking(parseInt(e.target.value, 10))}
                            style={{ width: '100%', accentColor: frameColor, cursor: 'pointer' }}
                          />
                        </div>

                        {/* Alignment */}
                        {renderAlignmentSelector(repeatedTextAlign, setRepeatedTextAlign)}

                        {/* Dedicated Color */}
                        {renderInlineColorPicker(cT.colorRepeatText || 'Color del Texto Repetido', repeatTextColor, setRepeatTextColor)}

                        {/* Toggle Uppercase & Reset */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '6px', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                            <input
                              type="checkbox"
                              checked={repeatedTextUpper}
                              onChange={(e) => setRepeatedTextUpper(e.target.checked)}
                              style={{ accentColor: frameColor, cursor: 'pointer' }}
                            />
                            <span>{cT.uppercaseLabel}</span>
                          </label>

                          <button
                            onClick={() => handleResetText('repeat')}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '5px',
                              background: 'none',
                              border: 'none',
                              color: 'var(--text-dim)',
                              fontSize: '0.72rem',
                              cursor: 'pointer',
                              padding: '2px 6px'
                            }}
                          >
                            <RotateCcw size={11} />
                            <span>{cT.textResetThis}</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 2. Main Title */}
                  <div
                    style={{
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: expandedTextSection === 'title' ? `1px solid ${hexToRgba(frameColor, 0.35)}` : '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '14px',
                      padding: '14px 16px',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#fff' }}>
                          {cT.mainTitleLabel}
                        </span>
                        <span
                          style={{
                            fontSize: '0.72rem',
                            color: titleColor,
                            background: hexToRgba(titleColor, 0.12),
                            padding: '2px 8px',
                            borderRadius: '6px',
                            fontWeight: 700,
                            fontFamily: 'monospace'
                          }}
                        >
                          {mainTitleSize}px • {mainTitleAlign.toUpperCase()}
                        </span>
                      </div>

                      <button
                        onClick={() => toggleTextSection('title')}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '5px 10px',
                          borderRadius: '8px',
                          border: expandedTextSection === 'title' ? `1px solid ${frameColor}` : '1px solid rgba(255, 255, 255, 0.1)',
                          background: expandedTextSection === 'title' ? hexToRgba(frameColor, 0.2) : 'rgba(255, 255, 255, 0.04)',
                          color: expandedTextSection === 'title' ? '#fff' : 'var(--text-muted)',
                          fontSize: '0.74rem',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        <Sliders size={13} />
                        <span>{expandedTextSection === 'title' ? 'Ocultar' : cT.textAdvancedToggle}</span>
                        <ChevronDown size={13} style={{ transform: expandedTextSection === 'title' ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                      </button>
                    </div>

                    <input
                      type="text"
                      value={mainTitle}
                      maxLength={120}
                      onChange={(e) => setMainTitle(e.target.value)}
                      placeholder={cT.mainTitlePlaceholder}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        background: 'rgba(0, 0, 0, 0.4)',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        borderRadius: '10px',
                        color: '#fff',
                        fontSize: '0.9rem',
                        outline: 'none'
                      }}
                    />

                    {/* Expandable Controls for Main Title */}
                    {expandedTextSection === 'title' && (
                      <div
                        style={{
                          marginTop: '14px',
                          padding: '14px',
                          background: 'rgba(0, 0, 0, 0.35)',
                          borderRadius: '10px',
                          border: '1px solid rgba(255, 255, 255, 0.05)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '12px'
                        }}
                      >
                        {/* Size */}
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{cT.fontSizeLabel}:</span>
                            <span style={{ fontSize: '0.76rem', color: '#fff', fontFamily: 'monospace', fontWeight: 700 }}>{mainTitleSize} px</span>
                          </div>
                          <input
                            type="range"
                            min="24"
                            max="250"
                            step="2"
                            value={mainTitleSize}
                            onChange={(e) => setMainTitleSize(parseInt(e.target.value, 10))}
                            style={{ width: '100%', accentColor: frameColor, cursor: 'pointer' }}
                          />
                        </div>

                        {/* Position Y */}
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{cT.positionYLabel} (Subir / Bajar):</span>
                            <span style={{ fontSize: '0.76rem', color: '#fff', fontFamily: 'monospace', fontWeight: 700 }}>{mainTitleOffsetY > 0 ? `+${mainTitleOffsetY}` : mainTitleOffsetY} px</span>
                          </div>
                          <input
                            type="range"
                            min="-1650"
                            max="450"
                            step="5"
                            value={mainTitleOffsetY}
                            onChange={(e) => setMainTitleOffsetY(parseInt(e.target.value, 10))}
                            style={{ width: '100%', accentColor: frameColor, cursor: 'pointer' }}
                          />
                        </div>

                        {/* Position X */}
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{cT.positionXLabel} (Izquierda / Derecha):</span>
                            <span style={{ fontSize: '0.76rem', color: '#fff', fontFamily: 'monospace', fontWeight: 700 }}>{mainTitleOffsetX > 0 ? `+${mainTitleOffsetX}` : mainTitleOffsetX} px</span>
                          </div>
                          <input
                            type="range"
                            min="-650"
                            max="650"
                            step="5"
                            value={mainTitleOffsetX}
                            onChange={(e) => setMainTitleOffsetX(parseInt(e.target.value, 10))}
                            style={{ width: '100%', accentColor: frameColor, cursor: 'pointer' }}
                          />
                        </div>

                        {/* Tracking */}
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{cT.letterSpacingLabel}:</span>
                            <span style={{ fontSize: '0.76rem', color: '#fff', fontFamily: 'monospace', fontWeight: 700 }}>{mainTitleTracking} px</span>
                          </div>
                          <input
                            type="range"
                            min="-4"
                            max="40"
                            step="1"
                            value={mainTitleTracking}
                            onChange={(e) => setMainTitleTracking(parseInt(e.target.value, 10))}
                            style={{ width: '100%', accentColor: frameColor, cursor: 'pointer' }}
                          />
                        </div>

                        {/* Alignment */}
                        {renderAlignmentSelector(mainTitleAlign, setMainTitleAlign)}

                        {/* Colors for Main Title: Primary (MISSA) and Suffix (FX) */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {renderInlineColorPicker(cT.colorTitle || 'Color del Título (MISSA)', titleColor, setTitleColor)}
                          {renderInlineColorPicker(cT.colorTitleFx || 'Color del Sufijo (FX)', titleFxColor, setTitleFxColor)}
                        </div>

                        {/* Toggle Uppercase & Reset */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '6px', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                            <input
                              type="checkbox"
                              checked={mainTitleUpper}
                              onChange={(e) => setMainTitleUpper(e.target.checked)}
                              style={{ accentColor: frameColor, cursor: 'pointer' }}
                            />
                            <span>{cT.uppercaseLabel}</span>
                          </label>

                          <button
                            onClick={() => handleResetText('title')}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '5px',
                              background: 'none',
                              border: 'none',
                              color: 'var(--text-dim)',
                              fontSize: '0.72rem',
                              cursor: 'pointer',
                              padding: '2px 6px'
                            }}
                          >
                            <RotateCcw size={11} />
                            <span>{cT.textResetThis}</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 3. Subtitle / Genre */}
                  <div
                    style={{
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: expandedTextSection === 'subTitle' ? `1px solid ${hexToRgba(frameColor, 0.35)}` : '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '14px',
                      padding: '14px 16px',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#fff' }}>
                          {cT.genreLabel}
                        </span>
                        <span
                          style={{
                            fontSize: '0.72rem',
                            color: badgeColor,
                            background: hexToRgba(badgeColor, 0.12),
                            padding: '2px 8px',
                            borderRadius: '6px',
                            fontWeight: 700,
                            fontFamily: 'monospace'
                          }}
                        >
                          {subTitleSize}px • {subTitleAlign.toUpperCase()}
                        </span>
                      </div>

                      <button
                        onClick={() => toggleTextSection('subTitle')}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '5px 10px',
                          borderRadius: '8px',
                          border: expandedTextSection === 'subTitle' ? `1px solid ${frameColor}` : '1px solid rgba(255, 255, 255, 0.1)',
                          background: expandedTextSection === 'subTitle' ? hexToRgba(frameColor, 0.2) : 'rgba(255, 255, 255, 0.04)',
                          color: expandedTextSection === 'subTitle' ? '#fff' : 'var(--text-muted)',
                          fontSize: '0.74rem',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        <Sliders size={13} />
                        <span>{expandedTextSection === 'subTitle' ? 'Ocultar' : cT.textAdvancedToggle}</span>
                        <ChevronDown size={13} style={{ transform: expandedTextSection === 'subTitle' ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                      </button>
                    </div>

                    <input
                      type="text"
                      value={subTitle}
                      maxLength={120}
                      onChange={(e) => setSubTitle(e.target.value)}
                      placeholder={cT.genrePlaceholder}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        background: 'rgba(0, 0, 0, 0.4)',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        borderRadius: '10px',
                        color: '#fff',
                        fontSize: '0.9rem',
                        outline: 'none'
                      }}
                    />

                    {/* Expandable Controls for Subtitle */}
                    {expandedTextSection === 'subTitle' && (
                      <div
                        style={{
                          marginTop: '14px',
                          padding: '14px',
                          background: 'rgba(0, 0, 0, 0.35)',
                          borderRadius: '10px',
                          border: '1px solid rgba(255, 255, 255, 0.05)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '12px'
                        }}
                      >
                        {/* Size */}
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{cT.fontSizeLabel}:</span>
                            <span style={{ fontSize: '0.76rem', color: '#fff', fontFamily: 'monospace', fontWeight: 700 }}>{subTitleSize} px</span>
                          </div>
                          <input
                            type="range"
                            min="10"
                            max="90"
                            step="1"
                            value={subTitleSize}
                            onChange={(e) => setSubTitleSize(parseInt(e.target.value, 10))}
                            style={{ width: '100%', accentColor: frameColor, cursor: 'pointer' }}
                          />
                        </div>

                        {/* Position Y */}
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{cT.positionYLabel} (Subir / Bajar):</span>
                            <span style={{ fontSize: '0.76rem', color: '#fff', fontFamily: 'monospace', fontWeight: 700 }}>{subTitleOffsetY > 0 ? `+${subTitleOffsetY}` : subTitleOffsetY} px</span>
                          </div>
                          <input
                            type="range"
                            min="-1650"
                            max="450"
                            step="5"
                            value={subTitleOffsetY}
                            onChange={(e) => setSubTitleOffsetY(parseInt(e.target.value, 10))}
                            style={{ width: '100%', accentColor: frameColor, cursor: 'pointer' }}
                          />
                        </div>

                        {/* Position X */}
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{cT.positionXLabel} (Izquierda / Derecha):</span>
                            <span style={{ fontSize: '0.76rem', color: '#fff', fontFamily: 'monospace', fontWeight: 700 }}>{subTitleOffsetX > 0 ? `+${subTitleOffsetX}` : subTitleOffsetX} px</span>
                          </div>
                          <input
                            type="range"
                            min="-650"
                            max="650"
                            step="5"
                            value={subTitleOffsetX}
                            onChange={(e) => setSubTitleOffsetX(parseInt(e.target.value, 10))}
                            style={{ width: '100%', accentColor: frameColor, cursor: 'pointer' }}
                          />
                        </div>

                        {/* Tracking */}
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{cT.letterSpacingLabel}:</span>
                            <span style={{ fontSize: '0.76rem', color: '#fff', fontFamily: 'monospace', fontWeight: 700 }}>{subTitleTracking} px</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="30"
                            step="1"
                            value={subTitleTracking}
                            onChange={(e) => setSubTitleTracking(parseInt(e.target.value, 10))}
                            style={{ width: '100%', accentColor: frameColor, cursor: 'pointer' }}
                          />
                        </div>

                        {/* Alignment */}
                        {renderAlignmentSelector(subTitleAlign, setSubTitleAlign)}

                        {/* Color for Subtitle */}
                        {renderInlineColorPicker(cT.colorBadgeText || 'Color del Texto', subTitleColor || badgeTextColor || '#FDE047', setSubTitleColor)}

                        {/* Toggle Uppercase & Reset */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '6px', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                            <input
                              type="checkbox"
                              checked={subTitleUpper}
                              onChange={(e) => setSubTitleUpper(e.target.checked)}
                              style={{ accentColor: frameColor, cursor: 'pointer' }}
                            />
                            <span>{cT.uppercaseLabel}</span>
                          </label>

                          <button
                            onClick={() => handleResetText('subTitle')}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '5px',
                              background: 'none',
                              border: 'none',
                              color: 'var(--text-dim)',
                              fontSize: '0.72rem',
                              cursor: 'pointer',
                              padding: '2px 6px'
                            }}
                          >
                            <RotateCcw size={11} />
                            <span>{cT.textResetThis}</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 4. Date / Tagline */}
                  <div
                    style={{
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: expandedTextSection === 'eventDate' ? `1px solid ${hexToRgba(frameColor, 0.35)}` : '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '14px',
                      padding: '14px 16px',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#fff' }}>
                          {cT.dateLabel}
                        </span>
                        <span
                          style={{
                            fontSize: '0.72rem',
                            color: textColor,
                            background: 'rgba(255, 255, 255, 0.08)',
                            padding: '2px 8px',
                            borderRadius: '6px',
                            fontWeight: 700,
                            fontFamily: 'monospace'
                          }}
                        >
                          {eventDateSize}px • {eventDateAlign.toUpperCase()}
                        </span>
                      </div>

                      <button
                        onClick={() => toggleTextSection('eventDate')}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '5px 10px',
                          borderRadius: '8px',
                          border: expandedTextSection === 'eventDate' ? `1px solid ${frameColor}` : '1px solid rgba(255, 255, 255, 0.1)',
                          background: expandedTextSection === 'eventDate' ? hexToRgba(frameColor, 0.2) : 'rgba(255, 255, 255, 0.04)',
                          color: expandedTextSection === 'eventDate' ? '#fff' : 'var(--text-muted)',
                          fontSize: '0.74rem',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        <Sliders size={13} />
                        <span>{expandedTextSection === 'eventDate' ? 'Ocultar' : cT.textAdvancedToggle}</span>
                        <ChevronDown size={13} style={{ transform: expandedTextSection === 'eventDate' ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                      </button>
                    </div>

                    <input
                      type="text"
                      value={eventDate}
                      maxLength={120}
                      onChange={(e) => setEventDate(e.target.value)}
                      placeholder={cT.datePlaceholder}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        background: 'rgba(0, 0, 0, 0.4)',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        borderRadius: '10px',
                        color: '#fff',
                        fontSize: '0.9rem',
                        outline: 'none'
                      }}
                    />

                    {/* Expandable Controls for Event Date */}
                    {expandedTextSection === 'eventDate' && (
                      <div
                        style={{
                          marginTop: '14px',
                          padding: '14px',
                          background: 'rgba(0, 0, 0, 0.35)',
                          borderRadius: '10px',
                          border: '1px solid rgba(255, 255, 255, 0.05)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '12px'
                        }}
                      >
                        {/* Size */}
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{cT.fontSizeLabel}:</span>
                            <span style={{ fontSize: '0.76rem', color: '#fff', fontFamily: 'monospace', fontWeight: 700 }}>{eventDateSize} px</span>
                          </div>
                          <input
                            type="range"
                            min="10"
                            max="100"
                            step="1"
                            value={eventDateSize}
                            onChange={(e) => setEventDateSize(parseInt(e.target.value, 10))}
                            style={{ width: '100%', accentColor: frameColor, cursor: 'pointer' }}
                          />
                        </div>

                        {/* Position Y */}
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{cT.positionYLabel} (Subir / Bajar):</span>
                            <span style={{ fontSize: '0.76rem', color: '#fff', fontFamily: 'monospace', fontWeight: 700 }}>{eventDateOffsetY > 0 ? `+${eventDateOffsetY}` : eventDateOffsetY} px</span>
                          </div>
                          <input
                            type="range"
                            min="-1650"
                            max="450"
                            step="5"
                            value={eventDateOffsetY}
                            onChange={(e) => setEventDateOffsetY(parseInt(e.target.value, 10))}
                            style={{ width: '100%', accentColor: frameColor, cursor: 'pointer' }}
                          />
                        </div>

                        {/* Position X */}
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{cT.positionXLabel} (Izquierda / Derecha):</span>
                            <span style={{ fontSize: '0.76rem', color: '#fff', fontFamily: 'monospace', fontWeight: 700 }}>{eventDateOffsetX > 0 ? `+${eventDateOffsetX}` : eventDateOffsetX} px</span>
                          </div>
                          <input
                            type="range"
                            min="-650"
                            max="650"
                            step="5"
                            value={eventDateOffsetX}
                            onChange={(e) => setEventDateOffsetX(parseInt(e.target.value, 10))}
                            style={{ width: '100%', accentColor: frameColor, cursor: 'pointer' }}
                          />
                        </div>

                        {/* Tracking */}
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{cT.letterSpacingLabel}:</span>
                            <span style={{ fontSize: '0.76rem', color: '#fff', fontFamily: 'monospace', fontWeight: 700 }}>{eventDateTracking} px</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="30"
                            step="1"
                            value={eventDateTracking}
                            onChange={(e) => setEventDateTracking(parseInt(e.target.value, 10))}
                            style={{ width: '100%', accentColor: frameColor, cursor: 'pointer' }}
                          />
                        </div>

                        {/* Alignment */}
                        {renderAlignmentSelector(eventDateAlign, setEventDateAlign)}

                        {/* Color for Event Date */}
                        {renderInlineColorPicker(cT.colorDateText || 'Color de Fecha / Evento', eventDateColor, setEventDateColor)}

                        {/* Toggle Uppercase & Reset */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '6px', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                            <input
                              type="checkbox"
                              checked={eventDateUpper}
                              onChange={(e) => setEventDateUpper(e.target.checked)}
                              style={{ accentColor: frameColor, cursor: 'pointer' }}
                            />
                            <span>{cT.uppercaseLabel}</span>
                          </label>

                          <button
                            onClick={() => handleResetText('eventDate')}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '5px',
                              background: 'none',
                              border: 'none',
                              color: 'var(--text-dim)',
                              fontSize: '0.72rem',
                              cursor: 'pointer',
                              padding: '2px 6px'
                            }}
                          >
                            <RotateCcw size={11} />
                            <span>{cT.textResetThis}</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 5. Venue / City */}
                  <div
                    style={{
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: expandedTextSection === 'eventVenue' ? `1px solid ${hexToRgba(frameColor, 0.35)}` : '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '14px',
                      padding: '14px 16px',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#fff' }}>
                          {cT.venueLabel}
                        </span>
                        <span
                          style={{
                            fontSize: '0.72rem',
                            color: 'rgba(255, 255, 255, 0.7)',
                            background: 'rgba(255, 255, 255, 0.08)',
                            padding: '2px 8px',
                            borderRadius: '6px',
                            fontWeight: 700,
                            fontFamily: 'monospace'
                          }}
                        >
                          {eventVenueSize}px • {eventVenueAlign.toUpperCase()}
                        </span>
                      </div>

                      <button
                        onClick={() => toggleTextSection('eventVenue')}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '5px 10px',
                          borderRadius: '8px',
                          border: expandedTextSection === 'eventVenue' ? `1px solid ${frameColor}` : '1px solid rgba(255, 255, 255, 0.1)',
                          background: expandedTextSection === 'eventVenue' ? hexToRgba(frameColor, 0.2) : 'rgba(255, 255, 255, 0.04)',
                          color: expandedTextSection === 'eventVenue' ? '#fff' : 'var(--text-muted)',
                          fontSize: '0.74rem',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        <Sliders size={13} />
                        <span>{expandedTextSection === 'eventVenue' ? 'Ocultar' : cT.textAdvancedToggle}</span>
                        <ChevronDown size={13} style={{ transform: expandedTextSection === 'eventVenue' ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                      </button>
                    </div>

                    <input
                      type="text"
                      value={eventVenue}
                      maxLength={120}
                      onChange={(e) => setEventVenue(e.target.value)}
                      placeholder={cT.venuePlaceholder}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        background: 'rgba(0, 0, 0, 0.4)',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        borderRadius: '10px',
                        color: '#fff',
                        fontSize: '0.9rem',
                        outline: 'none'
                      }}
                    />

                    {/* Expandable Controls for Event Venue */}
                    {expandedTextSection === 'eventVenue' && (
                      <div
                        style={{
                          marginTop: '14px',
                          padding: '14px',
                          background: 'rgba(0, 0, 0, 0.35)',
                          borderRadius: '10px',
                          border: '1px solid rgba(255, 255, 255, 0.05)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '12px'
                        }}
                      >
                        {/* Size */}
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{cT.fontSizeLabel}:</span>
                            <span style={{ fontSize: '0.76rem', color: '#fff', fontFamily: 'monospace', fontWeight: 700 }}>{eventVenueSize} px</span>
                          </div>
                          <input
                            type="range"
                            min="10"
                            max="90"
                            step="1"
                            value={eventVenueSize}
                            onChange={(e) => setEventVenueSize(parseInt(e.target.value, 10))}
                            style={{ width: '100%', accentColor: frameColor, cursor: 'pointer' }}
                          />
                        </div>

                        {/* Position Y */}
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{cT.positionYLabel} (Subir / Bajar):</span>
                            <span style={{ fontSize: '0.76rem', color: '#fff', fontFamily: 'monospace', fontWeight: 700 }}>{eventVenueOffsetY > 0 ? `+${eventVenueOffsetY}` : eventVenueOffsetY} px</span>
                          </div>
                          <input
                            type="range"
                            min="-1650"
                            max="450"
                            step="5"
                            value={eventVenueOffsetY}
                            onChange={(e) => setEventVenueOffsetY(parseInt(e.target.value, 10))}
                            style={{ width: '100%', accentColor: frameColor, cursor: 'pointer' }}
                          />
                        </div>

                        {/* Position X */}
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{cT.positionXLabel} (Izquierda / Derecha):</span>
                            <span style={{ fontSize: '0.76rem', color: '#fff', fontFamily: 'monospace', fontWeight: 700 }}>{eventVenueOffsetX > 0 ? `+${eventVenueOffsetX}` : eventVenueOffsetX} px</span>
                          </div>
                          <input
                            type="range"
                            min="-650"
                            max="650"
                            step="5"
                            value={eventVenueOffsetX}
                            onChange={(e) => setEventVenueOffsetX(parseInt(e.target.value, 10))}
                            style={{ width: '100%', accentColor: frameColor, cursor: 'pointer' }}
                          />
                        </div>

                        {/* Tracking */}
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{cT.letterSpacingLabel}:</span>
                            <span style={{ fontSize: '0.76rem', color: '#fff', fontFamily: 'monospace', fontWeight: 700 }}>{eventVenueTracking} px</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="30"
                            step="1"
                            value={eventVenueTracking}
                            onChange={(e) => setEventVenueTracking(parseInt(e.target.value, 10))}
                            style={{ width: '100%', accentColor: frameColor, cursor: 'pointer' }}
                          />
                        </div>

                        {/* Alignment */}
                        {renderAlignmentSelector(eventVenueAlign, setEventVenueAlign)}

                        {/* Color for Event Venue */}
                        {renderInlineColorPicker(cT.colorVenueText || 'Color de Ubicación / Club', eventVenueColor, setEventVenueColor)}

                        {/* Toggle Uppercase & Reset */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '6px', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                            <input
                              type="checkbox"
                              checked={eventVenueUpper}
                              onChange={(e) => setEventVenueUpper(e.target.checked)}
                              style={{ accentColor: frameColor, cursor: 'pointer' }}
                            />
                            <span>{cT.uppercaseLabel}</span>
                          </label>

                          <button
                            onClick={() => handleResetText('eventVenue')}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '5px',
                              background: 'none',
                              border: 'none',
                              color: 'var(--text-dim)',
                              fontSize: '0.72rem',
                              cursor: 'pointer',
                              padding: '2px 6px'
                            }}
                          >
                            <RotateCcw size={11} />
                            <span>{cT.textResetThis}</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 6. Booking / Contact Info */}
                  <div
                    style={{
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: expandedTextSection === 'booking' ? `1px solid ${hexToRgba(frameColor, 0.35)}` : '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '14px',
                      padding: '14px 16px',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#fff' }}>
                          {cT.bookingLabel}
                        </span>
                        <span
                          style={{
                            fontSize: '0.72rem',
                            color: 'rgba(255, 255, 255, 0.7)',
                            background: 'rgba(255, 255, 255, 0.08)',
                            padding: '2px 8px',
                            borderRadius: '6px',
                            fontWeight: 700,
                            fontFamily: 'monospace'
                          }}
                        >
                          {bookingTextSize}px • {bookingTextAlign.toUpperCase()}
                        </span>
                      </div>

                      <button
                        onClick={() => toggleTextSection('booking')}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '5px 10px',
                          borderRadius: '8px',
                          border: expandedTextSection === 'booking' ? `1px solid ${frameColor}` : '1px solid rgba(255, 255, 255, 0.1)',
                          background: expandedTextSection === 'booking' ? hexToRgba(frameColor, 0.2) : 'rgba(255, 255, 255, 0.04)',
                          color: expandedTextSection === 'booking' ? '#fff' : 'var(--text-muted)',
                          fontSize: '0.74rem',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        <Sliders size={13} />
                        <span>{expandedTextSection === 'booking' ? 'Ocultar' : cT.textAdvancedToggle}</span>
                        <ChevronDown size={13} style={{ transform: expandedTextSection === 'booking' ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                      </button>
                    </div>

                    <input
                      type="text"
                      value={bookingText}
                      maxLength={120}
                      onChange={(e) => setBookingText(e.target.value)}
                      placeholder={cT.bookingPlaceholder}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        background: 'rgba(0, 0, 0, 0.4)',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        borderRadius: '10px',
                        color: '#fff',
                        fontSize: '0.9rem',
                        outline: 'none'
                      }}
                    />
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '4px', paddingLeft: '2px' }}>
                      {cT.bookingHelp}
                    </div>

                    {/* Expandable Controls for Booking Text */}
                    {expandedTextSection === 'booking' && (
                      <div
                        style={{
                          marginTop: '14px',
                          padding: '14px',
                          background: 'rgba(0, 0, 0, 0.35)',
                          borderRadius: '10px',
                          border: '1px solid rgba(255, 255, 255, 0.05)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '12px'
                        }}
                      >
                        {/* Size */}
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{cT.fontSizeLabel}:</span>
                            <span style={{ fontSize: '0.76rem', color: '#fff', fontFamily: 'monospace', fontWeight: 700 }}>{bookingTextSize} px</span>
                          </div>
                          <input
                            type="range"
                            min="8"
                            max="50"
                            step="1"
                            value={bookingTextSize}
                            onChange={(e) => setBookingTextSize(parseInt(e.target.value, 10))}
                            style={{ width: '100%', accentColor: frameColor, cursor: 'pointer' }}
                          />
                        </div>

                        {/* Position Y */}
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{cT.positionYLabel} (Subir / Bajar):</span>
                            <span style={{ fontSize: '0.76rem', color: '#fff', fontFamily: 'monospace', fontWeight: 700 }}>{bookingTextOffsetY > 0 ? `+${bookingTextOffsetY}` : bookingTextOffsetY} px</span>
                          </div>
                          <input
                            type="range"
                            min="-1650"
                            max="450"
                            step="5"
                            value={bookingTextOffsetY}
                            onChange={(e) => setBookingTextOffsetY(parseInt(e.target.value, 10))}
                            style={{ width: '100%', accentColor: frameColor, cursor: 'pointer' }}
                          />
                        </div>

                        {/* Position X */}
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{cT.positionXLabel} (Izquierda / Derecha):</span>
                            <span style={{ fontSize: '0.76rem', color: '#fff', fontFamily: 'monospace', fontWeight: 700 }}>{bookingTextOffsetX > 0 ? `+${bookingTextOffsetX}` : bookingTextOffsetX} px</span>
                          </div>
                          <input
                            type="range"
                            min="-650"
                            max="650"
                            step="5"
                            value={bookingTextOffsetX}
                            onChange={(e) => setBookingTextOffsetX(parseInt(e.target.value, 10))}
                            style={{ width: '100%', accentColor: frameColor, cursor: 'pointer' }}
                          />
                        </div>

                        {/* Tracking */}
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{cT.letterSpacingLabel}:</span>
                            <span style={{ fontSize: '0.76rem', color: '#fff', fontFamily: 'monospace', fontWeight: 700 }}>{bookingTextTracking} px</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="30"
                            step="1"
                            value={bookingTextTracking}
                            onChange={(e) => setBookingTextTracking(parseInt(e.target.value, 10))}
                            style={{ width: '100%', accentColor: frameColor, cursor: 'pointer' }}
                          />
                        </div>

                        {/* Alignment */}
                        {renderAlignmentSelector(bookingTextAlign, setBookingTextAlign)}

                        {/* Color for Booking Text */}
                        {renderInlineColorPicker(cT.colorBookingText || 'Color de Booking / Contacto', bookingTextColor, setBookingTextColor)}

                        {/* Toggle Uppercase & Reset */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '6px', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                            <input
                              type="checkbox"
                              checked={bookingTextUpper}
                              onChange={(e) => setBookingTextUpper(e.target.checked)}
                              style={{ accentColor: frameColor, cursor: 'pointer' }}
                            />
                            <span>{cT.uppercaseLabel}</span>
                          </label>

                          <button
                            onClick={() => handleResetText('booking')}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '5px',
                              background: 'none',
                              border: 'none',
                              color: 'var(--text-dim)',
                              fontSize: '0.72rem',
                              cursor: 'pointer',
                              padding: '2px 6px'
                            }}
                          >
                            <RotateCcw size={11} />
                            <span>{cT.textResetThis}</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 7. Top Badge / Tag */}
                  <div
                    style={{
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: expandedTextSection === 'badgeTag' ? `1px solid ${hexToRgba(frameColor, 0.35)}` : '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '14px',
                      padding: '14px 16px',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#fff' }}>
                          {cT.badgeTagLabel}
                        </span>
                        <span
                          style={{
                            fontSize: '0.72rem',
                            color: 'rgba(255, 255, 255, 0.7)',
                            background: 'rgba(255, 255, 255, 0.08)',
                            padding: '2px 8px',
                            borderRadius: '6px',
                            fontWeight: 700,
                            fontFamily: 'monospace'
                          }}
                        >
                          {badgeTagSize}px • {badgeTagAlign.toUpperCase()}
                        </span>
                      </div>

                      <button
                        onClick={() => toggleTextSection('badgeTag')}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '5px 10px',
                          borderRadius: '8px',
                          border: expandedTextSection === 'badgeTag' ? `1px solid ${frameColor}` : '1px solid rgba(255, 255, 255, 0.1)',
                          background: expandedTextSection === 'badgeTag' ? hexToRgba(frameColor, 0.2) : 'rgba(255, 255, 255, 0.04)',
                          color: expandedTextSection === 'badgeTag' ? '#fff' : 'var(--text-muted)',
                          fontSize: '0.74rem',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        <Sliders size={13} />
                        <span>{expandedTextSection === 'badgeTag' ? 'Ocultar' : cT.textAdvancedToggle}</span>
                        <ChevronDown size={13} style={{ transform: expandedTextSection === 'badgeTag' ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                      </button>
                    </div>

                    <input
                      type="text"
                      value={badgeTagText}
                      maxLength={120}
                      onChange={(e) => setBadgeTagText(e.target.value)}
                      placeholder={cT.badgeTagPlaceholder}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        background: 'rgba(0, 0, 0, 0.4)',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        borderRadius: '10px',
                        color: '#fff',
                        fontSize: '0.9rem',
                        outline: 'none'
                      }}
                    />
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '4px', paddingLeft: '2px' }}>
                      {cT.badgeTagHelp}
                    </div>

                    {expandedTextSection === 'badgeTag' && (
                      <div
                        style={{
                          marginTop: '14px',
                          padding: '14px',
                          background: 'rgba(0, 0, 0, 0.35)',
                          borderRadius: '10px',
                          border: '1px solid rgba(255, 255, 255, 0.05)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '12px'
                        }}
                      >
                        {/* Size */}
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{cT.fontSizeLabel}:</span>
                            <span style={{ fontSize: '0.76rem', color: '#fff', fontFamily: 'monospace', fontWeight: 700 }}>{badgeTagSize} px</span>
                          </div>
                          <input
                            type="range"
                            min="9"
                            max="48"
                            step="1"
                            value={badgeTagSize}
                            onChange={(e) => setBadgeTagSize(parseInt(e.target.value, 10))}
                            style={{ width: '100%', accentColor: frameColor, cursor: 'pointer' }}
                          />
                        </div>

                        {/* Position Y */}
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{cT.positionYLabel} (Subir / Bajar):</span>
                            <span style={{ fontSize: '0.76rem', color: '#fff', fontFamily: 'monospace', fontWeight: 700 }}>{badgeTagOffsetY > 0 ? `+${badgeTagOffsetY}` : badgeTagOffsetY} px</span>
                          </div>
                          <input
                            type="range"
                            min="-1650"
                            max="450"
                            step="5"
                            value={badgeTagOffsetY}
                            onChange={(e) => setBadgeTagOffsetY(parseInt(e.target.value, 10))}
                            style={{ width: '100%', accentColor: frameColor, cursor: 'pointer' }}
                          />
                        </div>

                        {/* Position X */}
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{cT.positionXLabel} (Izquierda / Derecha):</span>
                            <span style={{ fontSize: '0.76rem', color: '#fff', fontFamily: 'monospace', fontWeight: 700 }}>{badgeTagOffsetX > 0 ? `+${badgeTagOffsetX}` : badgeTagOffsetX} px</span>
                          </div>
                          <input
                            type="range"
                            min="-650"
                            max="650"
                            step="5"
                            value={badgeTagOffsetX}
                            onChange={(e) => setBadgeTagOffsetX(parseInt(e.target.value, 10))}
                            style={{ width: '100%', accentColor: frameColor, cursor: 'pointer' }}
                          />
                        </div>

                        {/* Tracking */}
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{cT.letterSpacingLabel}:</span>
                            <span style={{ fontSize: '0.76rem', color: '#fff', fontFamily: 'monospace', fontWeight: 700 }}>{badgeTagTracking} px</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="20"
                            step="1"
                            value={badgeTagTracking}
                            onChange={(e) => setBadgeTagTracking(parseInt(e.target.value, 10))}
                            style={{ width: '100%', accentColor: frameColor, cursor: 'pointer' }}
                          />
                        </div>

                        {/* Alignment */}
                        {renderAlignmentSelector(badgeTagAlign, setBadgeTagAlign)}

                        {/* Color for Top Badge */}
                        {renderInlineColorPicker(cT.colorBadgeTagText || 'Color del Badge Superior', badgeTagTextColor, setBadgeTagTextColor)}

                        {/* Toggle Uppercase & Reset */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '6px', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                            <input
                              type="checkbox"
                              checked={badgeTagUpper}
                              onChange={(e) => setBadgeTagUpper(e.target.checked)}
                              style={{ accentColor: frameColor, cursor: 'pointer' }}
                            />
                            <span>{cT.uppercaseLabel}</span>
                          </label>

                          <button
                            onClick={() => handleResetText('badgeTag')}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '5px',
                              background: 'none',
                              border: 'none',
                              color: 'var(--text-dim)',
                              fontSize: '0.72rem',
                              cursor: 'pointer',
                              padding: '2px 6px'
                            }}
                          >
                            <RotateCcw size={11} />
                            <span>{cT.textResetThis}</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 8. Audio Spec / Sub-badge */}
                  <div
                    style={{
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: expandedTextSection === 'audioSpec' ? `1px solid ${hexToRgba(frameColor, 0.35)}` : '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '14px',
                      padding: '14px 16px',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#fff' }}>
                          {cT.audioSpecLabel}
                        </span>
                        <span
                          style={{
                            fontSize: '0.72rem',
                            color: 'rgba(255, 255, 255, 0.7)',
                            background: 'rgba(255, 255, 255, 0.08)',
                            padding: '2px 8px',
                            borderRadius: '6px',
                            fontWeight: 700,
                            fontFamily: 'monospace'
                          }}
                        >
                          {audioSpecSize}px • {audioSpecAlign.toUpperCase()}
                        </span>
                      </div>

                      <button
                        onClick={() => toggleTextSection('audioSpec')}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '5px 10px',
                          borderRadius: '8px',
                          border: expandedTextSection === 'audioSpec' ? `1px solid ${frameColor}` : '1px solid rgba(255, 255, 255, 0.1)',
                          background: expandedTextSection === 'audioSpec' ? hexToRgba(frameColor, 0.2) : 'rgba(255, 255, 255, 0.04)',
                          color: expandedTextSection === 'audioSpec' ? '#fff' : 'var(--text-muted)',
                          fontSize: '0.74rem',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        <Sliders size={13} />
                        <span>{expandedTextSection === 'audioSpec' ? 'Ocultar' : cT.textAdvancedToggle}</span>
                        <ChevronDown size={13} style={{ transform: expandedTextSection === 'audioSpec' ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                      </button>
                    </div>

                    <input
                      type="text"
                      value={audioSpecText}
                      maxLength={120}
                      onChange={(e) => setAudioSpecText(e.target.value)}
                      placeholder={cT.audioSpecPlaceholder}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        background: 'rgba(0, 0, 0, 0.4)',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        borderRadius: '10px',
                        color: '#fff',
                        fontSize: '0.9rem',
                        outline: 'none'
                      }}
                    />
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '4px', paddingLeft: '2px' }}>
                      {cT.audioSpecHelp}
                    </div>

                    {expandedTextSection === 'audioSpec' && (
                      <div
                        style={{
                          marginTop: '14px',
                          padding: '14px',
                          background: 'rgba(0, 0, 0, 0.35)',
                          borderRadius: '10px',
                          border: '1px solid rgba(255, 255, 255, 0.05)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '12px'
                        }}
                      >
                        {/* Size */}
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{cT.fontSizeLabel}:</span>
                            <span style={{ fontSize: '0.76rem', color: '#fff', fontFamily: 'monospace', fontWeight: 700 }}>{audioSpecSize} px</span>
                          </div>
                          <input
                            type="range"
                            min="8"
                            max="40"
                            step="1"
                            value={audioSpecSize}
                            onChange={(e) => setAudioSpecSize(parseInt(e.target.value, 10))}
                            style={{ width: '100%', accentColor: frameColor, cursor: 'pointer' }}
                          />
                        </div>

                        {/* Position Y */}
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{cT.positionYLabel} (Subir / Bajar):</span>
                            <span style={{ fontSize: '0.76rem', color: '#fff', fontFamily: 'monospace', fontWeight: 700 }}>{audioSpecOffsetY > 0 ? `+${audioSpecOffsetY}` : audioSpecOffsetY} px</span>
                          </div>
                          <input
                            type="range"
                            min="-1650"
                            max="450"
                            step="5"
                            value={audioSpecOffsetY}
                            onChange={(e) => setAudioSpecOffsetY(parseInt(e.target.value, 10))}
                            style={{ width: '100%', accentColor: frameColor, cursor: 'pointer' }}
                          />
                        </div>

                        {/* Position X */}
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{cT.positionXLabel} (Izquierda / Derecha):</span>
                            <span style={{ fontSize: '0.76rem', color: '#fff', fontFamily: 'monospace', fontWeight: 700 }}>{audioSpecOffsetX > 0 ? `+${audioSpecOffsetX}` : audioSpecOffsetX} px</span>
                          </div>
                          <input
                            type="range"
                            min="-650"
                            max="650"
                            step="5"
                            value={audioSpecOffsetX}
                            onChange={(e) => setAudioSpecOffsetX(parseInt(e.target.value, 10))}
                            style={{ width: '100%', accentColor: frameColor, cursor: 'pointer' }}
                          />
                        </div>

                        {/* Tracking */}
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{cT.letterSpacingLabel}:</span>
                            <span style={{ fontSize: '0.76rem', color: '#fff', fontFamily: 'monospace', fontWeight: 700 }}>{audioSpecTracking} px</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="20"
                            step="1"
                            value={audioSpecTracking}
                            onChange={(e) => setAudioSpecTracking(parseInt(e.target.value, 10))}
                            style={{ width: '100%', accentColor: frameColor, cursor: 'pointer' }}
                          />
                        </div>

                        {/* Alignment */}
                        {renderAlignmentSelector(audioSpecAlign, setAudioSpecAlign)}

                        {/* Color for Audio Spec */}
                        {renderInlineColorPicker(cT.colorAudioSpecText || 'Color de Formato de Audio', audioSpecColor, setAudioSpecColor)}

                        {/* Toggle Uppercase & Reset */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '6px', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                            <input
                              type="checkbox"
                              checked={audioSpecUpper}
                              onChange={(e) => setAudioSpecUpper(e.target.checked)}
                              style={{ accentColor: frameColor, cursor: 'pointer' }}
                            />
                            <span>{cT.uppercaseLabel}</span>
                          </label>

                          <button
                            onClick={() => handleResetText('audioSpec')}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '5px',
                              background: 'none',
                              border: 'none',
                              color: 'var(--text-dim)',
                              fontSize: '0.72rem',
                              cursor: 'pointer',
                              padding: '2px 6px'
                            }}
                          >
                            <RotateCcw size={11} />
                            <span>{cT.textResetThis}</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 9. Technical Coordinates / HUD */}
                  <div
                    style={{
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: expandedTextSection === 'hudCoords' ? `1px solid ${hexToRgba(frameColor, 0.35)}` : '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '14px',
                      padding: '14px 16px',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#fff' }}>
                          {cT.hudCoordsLabel}
                        </span>
                        <span
                          style={{
                            fontSize: '0.72rem',
                            color: 'rgba(255, 255, 255, 0.7)',
                            background: 'rgba(255, 255, 255, 0.08)',
                            padding: '2px 8px',
                            borderRadius: '6px',
                            fontWeight: 700,
                            fontFamily: 'monospace'
                          }}
                        >
                          {hudCoordsSize}px • {hudCoordsAlign.toUpperCase()}
                        </span>
                      </div>

                      <button
                        onClick={() => toggleTextSection('hudCoords')}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '5px 10px',
                          borderRadius: '8px',
                          border: expandedTextSection === 'hudCoords' ? `1px solid ${frameColor}` : '1px solid rgba(255, 255, 255, 0.1)',
                          background: expandedTextSection === 'hudCoords' ? hexToRgba(frameColor, 0.2) : 'rgba(255, 255, 255, 0.04)',
                          color: expandedTextSection === 'hudCoords' ? '#fff' : 'var(--text-muted)',
                          fontSize: '0.74rem',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        <Sliders size={13} />
                        <span>{expandedTextSection === 'hudCoords' ? 'Ocultar' : cT.textAdvancedToggle}</span>
                        <ChevronDown size={13} style={{ transform: expandedTextSection === 'hudCoords' ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                      </button>
                    </div>

                    <input
                      type="text"
                      value={hudCoordsText}
                      maxLength={120}
                      onChange={(e) => setHudCoordsText(e.target.value)}
                      placeholder={cT.hudCoordsPlaceholder}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        background: 'rgba(0, 0, 0, 0.4)',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        borderRadius: '10px',
                        color: '#fff',
                        fontSize: '0.9rem',
                        outline: 'none'
                      }}
                    />
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '4px', paddingLeft: '2px' }}>
                      {cT.hudCoordsHelp}
                    </div>

                    {expandedTextSection === 'hudCoords' && (
                      <div
                        style={{
                          marginTop: '14px',
                          padding: '14px',
                          background: 'rgba(0, 0, 0, 0.35)',
                          borderRadius: '10px',
                          border: '1px solid rgba(255, 255, 255, 0.05)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '12px'
                        }}
                      >
                        {/* Size */}
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{cT.fontSizeLabel}:</span>
                            <span style={{ fontSize: '0.76rem', color: '#fff', fontFamily: 'monospace', fontWeight: 700 }}>{hudCoordsSize} px</span>
                          </div>
                          <input
                            type="range"
                            min="8"
                            max="40"
                            step="1"
                            value={hudCoordsSize}
                            onChange={(e) => setHudCoordsSize(parseInt(e.target.value, 10))}
                            style={{ width: '100%', accentColor: frameColor, cursor: 'pointer' }}
                          />
                        </div>

                        {/* Position Y */}
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{cT.positionYLabel} (Subir / Bajar):</span>
                            <span style={{ fontSize: '0.76rem', color: '#fff', fontFamily: 'monospace', fontWeight: 700 }}>{hudCoordsOffsetY > 0 ? `+${hudCoordsOffsetY}` : hudCoordsOffsetY} px</span>
                          </div>
                          <input
                            type="range"
                            min="-1650"
                            max="450"
                            step="5"
                            value={hudCoordsOffsetY}
                            onChange={(e) => setHudCoordsOffsetY(parseInt(e.target.value, 10))}
                            style={{ width: '100%', accentColor: frameColor, cursor: 'pointer' }}
                          />
                        </div>

                        {/* Position X */}
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{cT.positionXLabel} (Izquierda / Derecha):</span>
                            <span style={{ fontSize: '0.76rem', color: '#fff', fontFamily: 'monospace', fontWeight: 700 }}>{hudCoordsOffsetX > 0 ? `+${hudCoordsOffsetX}` : hudCoordsOffsetX} px</span>
                          </div>
                          <input
                            type="range"
                            min="-650"
                            max="650"
                            step="5"
                            value={hudCoordsOffsetX}
                            onChange={(e) => setHudCoordsOffsetX(parseInt(e.target.value, 10))}
                            style={{ width: '100%', accentColor: frameColor, cursor: 'pointer' }}
                          />
                        </div>

                        {/* Tracking */}
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{cT.letterSpacingLabel}:</span>
                            <span style={{ fontSize: '0.76rem', color: '#fff', fontFamily: 'monospace', fontWeight: 700 }}>{hudCoordsTracking} px</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="20"
                            step="1"
                            value={hudCoordsTracking}
                            onChange={(e) => setHudCoordsTracking(parseInt(e.target.value, 10))}
                            style={{ width: '100%', accentColor: frameColor, cursor: 'pointer' }}
                          />
                        </div>

                        {/* Alignment */}
                        {renderAlignmentSelector(hudCoordsAlign, setHudCoordsAlign)}

                        {/* Color for Technical HUD */}
                        {renderInlineColorPicker(cT.colorHudCoordsText || 'Color de Coordenadas HUD', hudCoordsColor, setHudCoordsColor)}

                        {/* Toggle Uppercase & Reset */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '6px', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                            <input
                              type="checkbox"
                              checked={hudCoordsUpper}
                              onChange={(e) => setHudCoordsUpper(e.target.checked)}
                              style={{ accentColor: frameColor, cursor: 'pointer' }}
                            />
                            <span>{cT.uppercaseLabel}</span>
                          </label>

                          <button
                            onClick={() => handleResetText('hudCoords')}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '5px',
                              background: 'none',
                              border: 'none',
                              color: 'var(--text-dim)',
                              fontSize: '0.72rem',
                              cursor: 'pointer',
                              padding: '2px 6px'
                            }}
                          >
                            <RotateCcw size={11} />
                            <span>{cT.textResetThis}</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 10. Graphic Equalizer Position & Scale */}
                  <div
                    style={{
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: expandedTextSection === 'eq' ? `1px solid ${hexToRgba(frameColor, 0.35)}` : '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '14px',
                      padding: '14px 16px',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#fff' }}>
                          {cT.eqSettingsLabel}
                        </span>
                        <span
                          style={{
                            fontSize: '0.72rem',
                            color: 'rgba(255, 255, 255, 0.7)',
                            background: 'rgba(255, 255, 255, 0.08)',
                            padding: '2px 8px',
                            borderRadius: '6px',
                            fontWeight: 700,
                            fontFamily: 'monospace'
                          }}
                        >
                          {eqScale.toFixed(1)}x
                        </span>
                      </div>

                      <button
                        onClick={() => toggleTextSection('eq')}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '5px 10px',
                          borderRadius: '8px',
                          border: expandedTextSection === 'eq' ? `1px solid ${frameColor}` : '1px solid rgba(255, 255, 255, 0.1)',
                          background: expandedTextSection === 'eq' ? hexToRgba(frameColor, 0.2) : 'rgba(255, 255, 255, 0.04)',
                          color: expandedTextSection === 'eq' ? '#fff' : 'var(--text-muted)',
                          fontSize: '0.74rem',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        <Sliders size={13} />
                        <span>{expandedTextSection === 'eq' ? 'Ocultar' : cT.textAdvancedToggle}</span>
                        <ChevronDown size={13} style={{ transform: expandedTextSection === 'eq' ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                      </button>
                    </div>

                    <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '4px', paddingLeft: '2px' }}>
                      {cT.eqSettingsHelp}
                    </div>

                    {expandedTextSection === 'eq' && (
                      <div
                        style={{
                          marginTop: '14px',
                          padding: '14px',
                          background: 'rgba(0, 0, 0, 0.35)',
                          borderRadius: '10px',
                          border: '1px solid rgba(255, 255, 255, 0.05)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '12px'
                        }}
                      >
                        {/* Scale */}
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Escala / Tamaño:</span>
                            <span style={{ fontSize: '0.76rem', color: '#fff', fontFamily: 'monospace', fontWeight: 700 }}>{eqScale.toFixed(1)}x</span>
                          </div>
                          <input
                            type="range"
                            min="0.5"
                            max="2.5"
                            step="0.05"
                            value={eqScale}
                            onChange={(e) => setEqScale(parseFloat(e.target.value))}
                            style={{ width: '100%', accentColor: frameColor, cursor: 'pointer' }}
                          />
                        </div>

                        {/* Position Y */}
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{cT.positionYLabel} (Subir / Bajar):</span>
                            <span style={{ fontSize: '0.76rem', color: '#fff', fontFamily: 'monospace', fontWeight: 700 }}>{eqOffsetY > 0 ? `+${eqOffsetY}` : eqOffsetY} px</span>
                          </div>
                          <input
                            type="range"
                            min="-1650"
                            max="450"
                            step="5"
                            value={eqOffsetY}
                            onChange={(e) => setEqOffsetY(parseInt(e.target.value, 10))}
                            style={{ width: '100%', accentColor: frameColor, cursor: 'pointer' }}
                          />
                        </div>

                        {/* Position X */}
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{cT.positionXLabel} (Izquierda / Derecha):</span>
                            <span style={{ fontSize: '0.76rem', color: '#fff', fontFamily: 'monospace', fontWeight: 700 }}>{eqOffsetX > 0 ? `+${eqOffsetX}` : eqOffsetX} px</span>
                          </div>
                          <input
                            type="range"
                            min="-650"
                            max="650"
                            step="5"
                            value={eqOffsetX}
                            onChange={(e) => setEqOffsetX(parseInt(e.target.value, 10))}
                            style={{ width: '100%', accentColor: frameColor, cursor: 'pointer' }}
                          />
                        </div>

                        {/* Reset */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '6px', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                          <button
                            onClick={() => handleResetText('eq')}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '5px',
                              background: 'none',
                              border: 'none',
                              color: 'var(--text-dim)',
                              fontSize: '0.72rem',
                              cursor: 'pointer',
                              padding: '2px 6px'
                            }}
                          >
                            <RotateCcw size={11} />
                            <span>{cT.textResetThis}</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Next / Prev */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '28px' }}>
                  <button
                    onClick={() => setActiveStep(2)}
                    className="btn btn-secondary btn-sm"
                    style={{ cursor: 'pointer' }}
                  >
                    <span>← Foto</span>
                  </button>
                  <button
                    onClick={() => setActiveStep(4)}
                    className="btn btn-primary btn-sm"
                    style={{ cursor: 'pointer' }}
                  >
                    <span>Siguiente: Colores & Estilo →</span>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: Colors & Style Customization */}
            {activeStep === 4 && (
              <div>
                <h3 className="font-display" style={{ fontSize: '1.25rem', marginBottom: '8px', color: '#fff' }}>
                  {cT.colorsTitle}
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '20px' }}>
                  {cT.colorsHint}
                </p>

                {/* 1-Click Unified Color Themes */}
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '10px' }}>
                    {cT.colorThemesTitle}
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                    {COLOR_PRESETS.map((p) => {
                      const isSelected = frameColor === p.hex && titleColor === p.hex && repeatTextColor === p.hex;
                      return (
                        <button
                          key={p.id}
                          onClick={() => applyUnifiedColor(p.hex)}
                          style={{
                            padding: '10px',
                            borderRadius: '10px',
                            border: isSelected ? `2px solid ${p.hex}` : '1px solid rgba(255, 255, 255, 0.1)',
                            background: isSelected ? hexToRgba(p.hex, 0.15) : 'rgba(255, 255, 255, 0.03)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <span
                            style={{
                              width: '14px',
                              height: '14px',
                              borderRadius: '50%',
                              background: p.hex,
                              boxShadow: `0 0 8px ${p.hex}`
                            }}
                          />
                          <span style={{ fontSize: '0.78rem', fontWeight: 600, color: isSelected ? '#fff' : 'var(--text-muted)' }}>
                            {cT[p.nameKey].split(' ')[0]}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Contrast protection notice */}
                <div
                  style={{
                    padding: '12px 14px',
                    borderRadius: '10px',
                    background: 'rgba(250, 204, 21, 0.08)',
                    border: '1px solid rgba(250, 204, 21, 0.25)',
                    color: '#FACC15',
                    fontSize: '0.78rem',
                    marginBottom: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    lineHeight: 1.4
                  }}
                >
                  <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
                  <span>{cT.contrastNotice}</span>
                </div>

                {/* Granular Elements Colors */}
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#fff', display: 'block', marginBottom: '12px' }}>
                    {cT.colorElementsTitle}
                  </label>

                  {/* 1. Cyberpunk Frame */}
                  {renderColorItem(cT.colorFrame, frameColor, setFrameColor)}

                  {/* 2. Main Title (MISSA) */}
                  {renderColorItem(cT.colorTitle, titleColor, setTitleColor)}

                  {/* 3. Title Suffix (FX) */}
                  {renderColorItem(cT.colorTitleFx, titleFxColor, setTitleFxColor)}

                  {/* 4. Subtitle / Genre Badge Background */}
                  {renderColorItem(cT.colorBadge, badgeColor, (c) => {
                    setBadgeColor(c);
                    setBadgeTextColor(getAutoContrastColor(c));
                  })}

                  {/* 5. Subtitle / Genre Badge Text */}
                  {renderColorItem(cT.colorBadgeText, subTitleColor || badgeTextColor, setSubTitleColor)}

                  {/* 6. Event Date Text */}
                  {renderColorItem(cT.colorDateText || 'Color de Fecha / Evento', eventDateColor, setEventDateColor)}

                  {/* 7. Event Venue / Location Text */}
                  {renderColorItem(cT.colorVenueText || 'Color de Ubicación / Club', eventVenueColor, setEventVenueColor)}

                  {/* 8. Booking / Contact Info */}
                  {renderColorItem(cT.colorBookingText || 'Color de Booking / Contacto', bookingTextColor, setBookingTextColor)}

                  {/* 9. Top Badge Tag Text */}
                  {renderColorItem(cT.colorBadgeTagText || 'Color del Badge Superior', badgeTagTextColor, setBadgeTagTextColor)}

                  {/* 10. Audio Spec Text */}
                  {renderColorItem(cT.colorAudioSpecText || 'Color de Formato de Audio', audioSpecColor, setAudioSpecColor)}

                  {/* 11. Lateral Repeated Text */}
                  {renderColorItem(cT.colorRepeatText, repeatTextColor, setRepeatTextColor)}

                  {/* 12. Technical HUD Coordinates */}
                  {renderColorItem(cT.colorHudCoordsText || 'Color de Coordenadas HUD', hudCoordsColor, setHudCoordsColor)}

                  {/* 13. Tech Accents, Graphic EQ */}
                  {renderColorItem(cT.colorTech, techColor, setTechColor)}
                </div>

                {/* Next / Prev */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '28px' }}>
                  <button
                    onClick={() => setActiveStep(3)}
                    className="btn btn-secondary btn-sm"
                    style={{ cursor: 'pointer' }}
                  >
                    <span>← Textos</span>
                  </button>
                  <button
                    onClick={() => setActiveStep(5)}
                    className="btn btn-primary btn-sm"
                    style={{ cursor: 'pointer' }}
                  >
                    <span>Siguiente: Motion FX →</span>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 5: Motion FX & Story Animation */}
            {activeStep === 5 && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <h3 className="font-display" style={{ fontSize: '1.25rem', color: '#fff' }}>
                    {cT.motionTitle}
                  </h3>
                  <button
                    onClick={handleResetMotion}
                    title={cT.motionReset}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: 'var(--text-muted)',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      fontSize: '0.76rem',
                      cursor: 'pointer'
                    }}
                  >
                    <RefreshCw size={12} />
                    <span>{cT.motionReset}</span>
                  </button>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '22px' }}>
                  {cT.motionSubtitle}
                </p>

                {/* Master Playback & Loop Settings Bar */}
                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: `1px solid ${hexToRgba(frameColor, 0.3)}`,
                    borderRadius: '14px',
                    padding: '16px',
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '14px',
                    marginBottom: '24px'
                  }}
                >
                  {/* Master Play/Pause */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="btn btn-primary btn-sm"
                      style={{
                        padding: '10px 18px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '0.86rem',
                        fontWeight: 700
                      }}
                    >
                      {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                      <span>{isPlaying ? cT.motionMasterPause : cT.motionMasterPlay}</span>
                    </button>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: isPlaying ? '#22c55e' : '#ef4444',
                          boxShadow: isPlaying ? '0 0 8px #22c55e' : 'none'
                        }}
                      />
                      <span style={{ fontSize: '0.78rem', color: isPlaying ? '#22c55e' : 'var(--text-dim)', fontWeight: 600 }}>
                        {isPlaying ? `${motionFps} FPS LIVE` : 'PAUSADO'}
                      </span>
                    </div>
                  </div>

                  {/* FPS Selector */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: 'rgba(0, 0, 0, 0.25)',
                      padding: '8px 14px',
                      borderRadius: '12px',
                      border: '1px solid rgba(255, 255, 255, 0.08)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Activity size={14} color={motionFps === 120 ? '#00F0FF' : frameColor} />
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                        {cT.motionFpsLabel || 'FPS'}:
                      </span>
                      <span
                        style={{
                          padding: '3px 8px',
                          borderRadius: '6px',
                          background: motionFps === 120 ? 'rgba(0, 240, 255, 0.2)' : hexToRgba(frameColor, 0.2),
                          border: motionFps === 120 ? '1px solid rgba(0, 240, 255, 0.5)' : `1px solid ${hexToRgba(frameColor, 0.45)}`,
                          color: motionFps === 120 ? '#00F0FF' : frameColor,
                          fontSize: '0.82rem',
                          fontWeight: 800,
                          fontFamily: 'monospace'
                        }}
                      >
                        {motionFps}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {[
                        { fps: 30, label: '30' },
                        { fps: 60, label: '60 (Default)' },
                        { fps: 120, label: '⚡ 120 ProMotion' }
                      ].map(({ fps, label }) => (
                        <button
                          key={fps}
                          onClick={() => setMotionFps(fps)}
                          style={{
                            padding: '5px 9px',
                            borderRadius: '8px',
                            border: motionFps === fps
                              ? (fps === 120 ? '1px solid #00F0FF' : `1px solid ${frameColor}`)
                              : '1px solid rgba(255, 255, 255, 0.08)',
                            background: motionFps === fps
                              ? (fps === 120 ? 'rgba(0, 240, 255, 0.25)' : hexToRgba(frameColor, 0.25))
                              : 'rgba(255, 255, 255, 0.03)',
                            color: motionFps === fps ? '#fff' : 'var(--text-muted)',
                            fontSize: '0.74rem',
                            fontWeight: motionFps === fps ? 700 : 500,
                            cursor: 'pointer',
                            boxShadow: motionFps === fps
                              ? (fps === 120 ? '0 0 12px rgba(0, 240, 255, 0.4)' : `0 0 10px ${hexToRgba(frameColor, 0.3)}`)
                              : 'none',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Settable Loop Duration Selector & Slider */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      flexWrap: 'wrap',
                      background: 'rgba(0, 0, 0, 0.25)',
                      padding: '8px 14px',
                      borderRadius: '12px',
                      border: '1px solid rgba(255, 255, 255, 0.08)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Clock size={15} color={frameColor} />
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                        {cT.motionLoopDuration}:
                      </span>
                      <span
                        style={{
                          padding: '3px 8px',
                          borderRadius: '6px',
                          background: hexToRgba(frameColor, 0.2),
                          border: `1px solid ${hexToRgba(frameColor, 0.45)}`,
                          color: frameColor,
                          fontSize: '0.84rem',
                          fontWeight: 800,
                          fontFamily: 'monospace'
                        }}
                      >
                        {loopDuration}s
                      </span>
                    </div>

                    {/* Quick Presets */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      {[
                        { sec: 3, label: '3s' },
                        { sec: 5, label: '5s' },
                        { sec: 7, label: '7s ★ Default' },
                        { sec: 10, label: '10s' },
                        { sec: 15, label: '15s Story' }
                      ].map(({ sec, label }) => (
                        <button
                          key={sec}
                          onClick={() => setLoopDuration(sec)}
                          style={{
                            padding: '5px 10px',
                            borderRadius: '8px',
                            border: loopDuration === sec ? `1px solid ${frameColor}` : '1px solid rgba(255, 255, 255, 0.08)',
                            background: loopDuration === sec ? hexToRgba(frameColor, 0.25) : 'rgba(255, 255, 255, 0.03)',
                            color: loopDuration === sec ? '#fff' : 'var(--text-muted)',
                            fontSize: '0.74rem',
                            fontWeight: loopDuration === sec ? 700 : 500,
                            cursor: 'pointer',
                            boxShadow: loopDuration === sec ? `0 0 10px ${hexToRgba(frameColor, 0.3)}` : 'none',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          {label}
                        </button>
                      ))}
                    </div>

                    {/* Interactive Slider */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <input
                        type="range"
                        min="2"
                        max="15"
                        step="1"
                        value={loopDuration}
                        onChange={(e) => setLoopDuration(parseInt(e.target.value, 10) || 7)}
                        style={{
                          width: '90px',
                          accentColor: frameColor,
                          cursor: 'pointer'
                        }}
                        title={`${loopDuration}s`}
                      />
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontFamily: 'monospace' }}>2-15s</span>
                    </div>
                  </div>
                </div>

                {/* 5 Dropdown & Controller Effect Cards */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                  {/* 1. Cascada Lateral ("MISSA MISSA") */}
                  <div
                    style={{
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '14px',
                      padding: '16px 18px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff' }}>
                        {cT.elementCascadeTitle}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: frameColor, fontFamily: 'monospace', fontWeight: 600 }}>
                        {cascadeEffect.toUpperCase()}
                      </span>
                    </div>

                    <div style={{ marginBottom: '14px' }}>
                      <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                        {cT.cascadeEffectLabel}
                      </label>
                      <select
                        value={cascadeEffect}
                        onChange={(e) => setCascadeEffect(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          background: 'rgba(0, 0, 0, 0.5)',
                          border: `1px solid ${hexToRgba(frameColor, 0.4)}`,
                          borderRadius: '8px',
                          color: '#fff',
                          fontSize: '0.86rem',
                          outline: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        <option value="scroll-down" style={{ background: '#0c0c10', color: '#fff' }}>{cT.fxCascadeScrollDown}</option>
                        <option value="scroll-up" style={{ background: '#0c0c10', color: '#fff' }}>{cT.fxCascadeScrollUp}</option>
                        <option value="breathe" style={{ background: '#0c0c10', color: '#fff' }}>{cT.fxCascadeBreathe}</option>
                        <option value="glitch" style={{ background: '#0c0c10', color: '#fff' }}>{cT.fxCascadeGlitch}</option>
                        <option value="wave-sine" style={{ background: '#0c0c10', color: '#fff' }}>{cT.fxCascadeWaveSine}</option>
                        <option value="neon-scan" style={{ background: '#0c0c10', color: '#fff' }}>{cT.fxCascadeNeonScan}</option>
                        <option value="none" style={{ background: '#0c0c10', color: '#fff' }}>{cT.fxCascadeNone}</option>
                      </select>
                    </div>

                    {cascadeEffect !== 'none' && (
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{cT.cascadeSpeedLabel}</span>
                          <span style={{ fontSize: '0.76rem', color: frameColor, fontFamily: 'monospace', fontWeight: 700 }}>
                            {cascadeSpeed.toFixed(1)}x
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0.2"
                          max="3.0"
                          step="0.1"
                          value={cascadeSpeed}
                          onChange={(e) => setCascadeSpeed(parseFloat(e.target.value))}
                          style={{ width: '100%', accentColor: frameColor, cursor: 'pointer' }}
                        />
                      </div>
                    )}
                  </div>

                  {/* 2. Titular Principal ("MISSAFX") */}
                  <div
                    style={{
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '14px',
                      padding: '16px 18px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff' }}>
                        {cT.elementTitleFxTitle}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: titleColor, fontFamily: 'monospace', fontWeight: 600 }}>
                        {titleEffect.toUpperCase()}
                      </span>
                    </div>

                    <div style={{ marginBottom: '14px' }}>
                      <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                        {cT.titleEffectLabel}
                      </label>
                      <select
                        value={titleEffect}
                        onChange={(e) => setTitleEffect(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          background: 'rgba(0, 0, 0, 0.5)',
                          border: `1px solid ${hexToRgba(titleColor, 0.4)}`,
                          borderRadius: '8px',
                          color: '#fff',
                          fontSize: '0.86rem',
                          outline: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        <option value="neon-breathe" style={{ background: '#0c0c10', color: '#fff' }}>{cT.fxTitleNeonBreathe}</option>
                        <option value="neon-flicker" style={{ background: '#0c0c10', color: '#fff' }}>{cT.fxTitleNeonFlicker}</option>
                        <option value="glitch" style={{ background: '#0c0c10', color: '#fff' }}>{cT.fxTitleGlitch}</option>
                        <option value="strobe" style={{ background: '#0c0c10', color: '#fff' }}>{cT.fxTitleStrobe}</option>
                        <option value="color-cycle" style={{ background: '#0c0c10', color: '#fff' }}>{cT.fxTitleColorCycle}</option>
                        <option value="laser-sweep" style={{ background: '#0c0c10', color: '#fff' }}>{cT.fxTitleLaserSweep}</option>
                        <option value="bass-shake" style={{ background: '#0c0c10', color: '#fff' }}>{cT.fxTitleBassShake}</option>
                        <option value="rgb-split" style={{ background: '#0c0c10', color: '#fff' }}>{cT.fxTitleRgbSplit}</option>
                        <option value="none" style={{ background: '#0c0c10', color: '#fff' }}>{cT.fxTitleNone}</option>
                      </select>
                    </div>

                    {titleEffect !== 'none' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{cT.titleGlowLabel}</span>
                            <span style={{ fontSize: '0.76rem', color: titleColor, fontFamily: 'monospace', fontWeight: 700 }}>
                              {titleGlow.toFixed(1)}x
                            </span>
                          </div>
                          <input
                            type="range"
                            min="0.2"
                            max="2.5"
                            step="0.1"
                            value={titleGlow}
                            onChange={(e) => setTitleGlow(parseFloat(e.target.value))}
                            style={{ width: '100%', accentColor: titleColor, cursor: 'pointer' }}
                          />
                        </div>

                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{cT.titleBpmLabel}</span>
                            <span style={{ fontSize: '0.76rem', color: titleColor, fontFamily: 'monospace', fontWeight: 700 }}>
                              {titleBpm} BPM
                            </span>
                          </div>
                          <input
                            type="range"
                            min="60"
                            max="180"
                            step="2"
                            value={titleBpm}
                            onChange={(e) => setTitleBpm(parseInt(e.target.value))}
                            style={{ width: '100%', accentColor: titleColor, cursor: 'pointer' }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 3. Ecualizador Gráfico (EQ) */}
                  <div
                    style={{
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '14px',
                      padding: '16px 18px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff' }}>
                        {cT.elementEqTitle}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: techColor, fontFamily: 'monospace', fontWeight: 600 }}>
                        {eqEffect.toUpperCase()}
                      </span>
                    </div>

                    <div style={{ marginBottom: '14px' }}>
                      <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                        {cT.eqEffectLabel}
                      </label>
                      <select
                        value={eqEffect}
                        onChange={(e) => setEqEffect(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          background: 'rgba(0, 0, 0, 0.5)',
                          border: `1px solid ${hexToRgba(techColor, 0.4)}`,
                          borderRadius: '8px',
                          color: '#fff',
                          fontSize: '0.86rem',
                          outline: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        <option value="vu-bounce" style={{ background: '#0c0c10', color: '#fff' }}>{cT.fxEqVuBounce}</option>
                        <option value="wave-flow" style={{ background: '#0c0c10', color: '#fff' }}>{cT.fxEqWaveFlow}</option>
                        <option value="bass-pulse" style={{ background: '#0c0c10', color: '#fff' }}>{cT.fxEqBassPulse}</option>
                        <option value="peak-meter" style={{ background: '#0c0c10', color: '#fff' }}>{cT.fxEqPeakMeter}</option>
                        <option value="center-split" style={{ background: '#0c0c10', color: '#fff' }}>{cT.fxEqCenterSplit}</option>
                        <option value="none" style={{ background: '#0c0c10', color: '#fff' }}>{cT.fxEqNone}</option>
                      </select>
                    </div>

                    {eqEffect !== 'none' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{cT.eqIntensityLabel}</span>
                            <span style={{ fontSize: '0.76rem', color: techColor, fontFamily: 'monospace', fontWeight: 700 }}>
                              {eqIntensity.toFixed(1)}x
                            </span>
                          </div>
                          <input
                            type="range"
                            min="0.5"
                            max="2.0"
                            step="0.1"
                            value={eqIntensity}
                            onChange={(e) => setEqIntensity(parseFloat(e.target.value))}
                            style={{ width: '100%', accentColor: techColor, cursor: 'pointer' }}
                          />
                        </div>

                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{cT.eqSpeedLabel}</span>
                            <span style={{ fontSize: '0.76rem', color: techColor, fontFamily: 'monospace', fontWeight: 700 }}>
                              {eqSpeed.toFixed(1)}x
                            </span>
                          </div>
                          <input
                            type="range"
                            min="0.5"
                            max="2.5"
                            step="0.1"
                            value={eqSpeed}
                            onChange={(e) => setEqSpeed(parseFloat(e.target.value))}
                            style={{ width: '100%', accentColor: techColor, cursor: 'pointer' }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 4. Foto de Cabina / Artista */}
                  <div
                    style={{
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '14px',
                      padding: '16px 18px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff' }}>
                        {cT.elementPhotoTitle}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: frameColor, fontFamily: 'monospace', fontWeight: 600 }}>
                        {photoEffect.toUpperCase()}
                      </span>
                    </div>

                    <div style={{ marginBottom: '14px' }}>
                      <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                        {cT.photoEffectLabel}
                      </label>
                      <select
                        value={photoEffect}
                        onChange={(e) => setPhotoEffect(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          background: 'rgba(0, 0, 0, 0.5)',
                          border: `1px solid ${hexToRgba(frameColor, 0.4)}`,
                          borderRadius: '8px',
                          color: '#fff',
                          fontSize: '0.86rem',
                          outline: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        <option value="ken-burns-in" style={{ background: '#0c0c10', color: '#fff' }}>{cT.fxPhotoKenBurnsIn}</option>
                        <option value="ken-burns-out" style={{ background: '#0c0c10', color: '#fff' }}>{cT.fxPhotoKenBurnsOut}</option>
                        <option value="pan-sway" style={{ background: '#0c0c10', color: '#fff' }}>{cT.fxPhotoPanSway}</option>
                        <option value="club-strobe" style={{ background: '#0c0c10', color: '#fff' }}>{cT.fxPhotoClubStrobe}</option>
                        <option value="kick-punch" style={{ background: '#0c0c10', color: '#fff' }}>{cT.fxPhotoKickPunch}</option>
                        <option value="prism-roll" style={{ background: '#0c0c10', color: '#fff' }}>{cT.fxPhotoPrismRoll}</option>
                        <option value="none" style={{ background: '#0c0c10', color: '#fff' }}>{cT.fxPhotoNone}</option>
                      </select>
                    </div>

                    {photoEffect !== 'none' && (
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{cT.photoMotionLabel}</span>
                          <span style={{ fontSize: '0.76rem', color: frameColor, fontFamily: 'monospace', fontWeight: 700 }}>
                            {photoMotionIntensity.toFixed(1)}x
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0.2"
                          max="2.0"
                          step="0.1"
                          value={photoMotionIntensity}
                          onChange={(e) => setPhotoMotionIntensity(parseFloat(e.target.value))}
                          style={{ width: '100%', accentColor: frameColor, cursor: 'pointer' }}
                        />
                      </div>
                    )}
                  </div>

                  {/* 5. Atmósfera & Partículas */}
                  <div
                    style={{
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '14px',
                      padding: '16px 18px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff' }}>
                        {cT.elementAtmosphereTitle}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: frameColor, fontFamily: 'monospace', fontWeight: 600 }}>
                        {atmosphereEffect.toUpperCase()}
                      </span>
                    </div>

                    <div style={{ marginBottom: '14px' }}>
                      <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                        {cT.atmosphereEffectLabel}
                      </label>
                      <select
                        value={atmosphereEffect}
                        onChange={(e) => setAtmosphereEffect(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          background: 'rgba(0, 0, 0, 0.5)',
                          border: `1px solid ${hexToRgba(frameColor, 0.4)}`,
                          borderRadius: '8px',
                          color: '#fff',
                          fontSize: '0.86rem',
                          outline: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        <option value="dust-laser" style={{ background: '#0c0c10', color: '#fff' }}>{cT.fxAtmosphereDustLaser}</option>
                        <option value="scanlines" style={{ background: '#0c0c10', color: '#fff' }}>{cT.fxAtmosphereScanlines}</option>
                        <option value="rave-smoke" style={{ background: '#0c0c10', color: '#fff' }}>{cT.fxAtmosphereRaveSmoke}</option>
                        <option value="cold-sparks" style={{ background: '#0c0c10', color: '#fff' }}>{cT.fxAtmosphereColdSparks}</option>
                        <option value="laser-beams" style={{ background: '#0c0c10', color: '#fff' }}>{cT.fxAtmosphereLaserBeams}</option>
                        <option value="bass-shockwave" style={{ background: '#0c0c10', color: '#fff' }}>{cT.fxAtmosphereBassShockwave}</option>
                        <option value="vhs-cyber" style={{ background: '#0c0c10', color: '#fff' }}>{cT.fxAtmosphereVhsCyber}</option>
                        <option value="confetti-blast" style={{ background: '#0c0c10', color: '#fff' }}>{cT.fxAtmosphereConfetti}</option>
                        <option value="matrix-rain" style={{ background: '#0c0c10', color: '#fff' }}>{cT.fxAtmosphereMatrix}</option>
                        <option value="radar-sweep" style={{ background: '#0c0c10', color: '#fff' }}>{cT.fxAtmosphereRadar}</option>
                        <option value="stage-lightning" style={{ background: '#0c0c10', color: '#fff' }}>{cT.fxAtmosphereLightning}</option>
                        <option value="star-glints" style={{ background: '#0c0c10', color: '#fff' }}>{cT.fxAtmosphereStarGlints}</option>
                        <option value="aurora-laser" style={{ background: '#0c0c10', color: '#fff' }}>{cT.fxAtmosphereAurora}</option>
                        <option value="none" style={{ background: '#0c0c10', color: '#fff' }}>{cT.fxAtmosphereNone}</option>
                      </select>
                    </div>

                    {atmosphereEffect !== 'none' && (
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{cT.atmosphereDensityLabel}</span>
                          <span style={{ fontSize: '0.76rem', color: frameColor, fontFamily: 'monospace', fontWeight: 700 }}>
                            {atmosphereDensity.toFixed(1)}x
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0.3"
                          max="2.0"
                          step="0.1"
                          value={atmosphereDensity}
                          onChange={(e) => setAtmosphereDensity(parseFloat(e.target.value))}
                          style={{ width: '100%', accentColor: frameColor, cursor: 'pointer' }}
                        />
                      </div>
                    )}
                  </div>

                </div>

                {/* Next / Prev */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '28px' }}>
                  <button
                    onClick={() => setActiveStep(4)}
                    className="btn btn-secondary btn-sm"
                    style={{ cursor: 'pointer' }}
                  >
                    <span>← Colores</span>
                  </button>
                  <button
                    onClick={() => setActiveStep(6)}
                    className="btn btn-primary btn-sm"
                    style={{ cursor: 'pointer' }}
                  >
                    <span>Siguiente: Máscaras & Capas →</span>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 6: Masks & Layers Toggles (Prender/Apagar) */}
            {activeStep === 6 && (
              <div>
                <h3
                  className="font-display"
                  style={{ fontSize: '1.25rem', marginBottom: '8px', color: '#fff' }}
                >
                  {cT.masksTitle}
                </h3>
                <p
                  style={{
                    color: 'var(--text-muted)',
                    fontSize: '0.88rem',
                    marginBottom: '20px'
                  }}
                >
                  Activa o desactiva las capas y máscaras visuales para obtener el estilo exacto que buscas.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {[
                    {
                      id: 'repeatText',
                      label: cT.maskRepeatText,
                      active: showRepeatText,
                      toggle: () => setShowRepeatText(!showRepeatText)
                    },
                    {
                      id: 'cyberFrame',
                      label: cT.maskCyberFrame,
                      active: showCyberFrame,
                      toggle: () => setShowCyberFrame(!showCyberFrame)
                    },
                    {
                      id: 'badges',
                      label: cT.maskBadges,
                      active: showBadges,
                      toggle: () => setShowBadges(!showBadges)
                    },
                    {
                      id: 'audioSpec',
                      label: cT.maskAudioSpec,
                      active: showAudioSpec,
                      toggle: () => setShowAudioSpec(!showAudioSpec)
                    },
                    {
                      id: 'hudCoords',
                      label: cT.maskHudCoords,
                      active: showHudCoords,
                      toggle: () => setShowHudCoords(!showHudCoords)
                    },
                    {
                      id: 'eq',
                      label: cT.maskEq,
                      active: showEq,
                      toggle: () => setShowEq(!showEq)
                    },
                    {
                      id: 'dividerLine',
                      label: cT.maskDividerLine,
                      active: showDividerLine,
                      toggle: () => setShowDividerLine(!showDividerLine)
                    },
                    {
                      id: 'subtitleBox',
                      label: cT.maskSubtitleBox,
                      active: showSubtitleBox,
                      toggle: () => setShowSubtitleBox(!showSubtitleBox)
                    },
                    {
                      id: 'titleGlow',
                      label: cT.maskTitleGlow,
                      active: showTitleGlow,
                      toggle: () => setShowTitleGlow(!showTitleGlow)
                    },
                    {
                      id: 'vignette',
                      label: cT.maskVignette,
                      active: showVignette,
                      toggle: () => setShowVignette(!showVignette)
                    },
                    {
                      id: 'photoLayer',
                      label: cT.maskPhotoLayer,
                      active: showPhotoLayer,
                      toggle: () => setShowPhotoLayer(!showPhotoLayer)
                    }
                  ].map((layer) => (
                    <div key={layer.id} style={{ display: 'flex', flexDirection: 'column' }}>
                      <div
                        onClick={layer.toggle}
                        style={{
                          padding: '16px 18px',
                          borderRadius: (layer.id === 'cyberFrame' && showCyberFrame && format === 'story')
                            ? '12px 12px 0 0'
                            : '12px',
                          border: layer.active
                            ? `1px solid ${hexToRgba(frameColor, 0.4)}`
                            : '1px solid rgba(255, 255, 255, 0.08)',
                          background: layer.active
                            ? hexToRgba(frameColor, 0.06)
                            : 'rgba(255, 255, 255, 0.02)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          {layer.active ? (
                            <Eye size={18} color={frameColor} />
                          ) : (
                            <EyeOff size={18} color="var(--text-dim)" />
                          )}
                          <span
                            style={{
                              fontSize: '0.88rem',
                              fontWeight: 600,
                              color: layer.active ? '#fff' : 'var(--text-dim)'
                            }}
                          >
                            {layer.label}
                          </span>
                        </div>

                        {/* Switch Pill */}
                        <div
                          style={{
                            width: '44px',
                            height: '24px',
                            borderRadius: '12px',
                            background: layer.active ? frameColor : 'rgba(255, 255, 255, 0.1)',
                            position: 'relative',
                            transition: 'background 0.2s ease'
                          }}
                        >
                          <div
                            style={{
                              width: '18px',
                              height: '18px',
                              borderRadius: '50%',
                              background: '#FFFFFF',
                              position: 'absolute',
                              top: '3px',
                              left: layer.active ? '23px' : '3px',
                              transition: 'left 0.2s ease',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.4)'
                            }}
                          />
                        </div>
                      </div>

                      {/* Sub-control for Cyberpunk Frame: Safe Zone Fit vs Full Screen */}
                      {layer.id === 'cyberFrame' && showCyberFrame && format === 'story' && (
                        <div
                          style={{
                            padding: '12px 16px 14px 16px',
                            background: hexToRgba(frameColor, 0.04),
                            border: `1px solid ${hexToRgba(frameColor, 0.3)}`,
                            borderTop: 'none',
                            borderRadius: '0 0 12px 12px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '10px'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                              {cT.maskCyberFrameFitLabel || 'Ajuste del Marco (Instagram Story):'}
                            </span>
                            <span
                              style={{
                                fontSize: '0.70rem',
                                color: frameFitSafeZone ? '#22c55e' : '#94a3b8',
                                fontWeight: 700,
                                fontFamily: 'monospace'
                              }}
                            >
                              {frameFitSafeZone ? 'SAFE (215px)' : 'FULL (44px)'}
                            </span>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setFrameFitSafeZone(true);
                              }}
                              style={{
                                padding: '8px 10px',
                                borderRadius: '8px',
                                border: frameFitSafeZone
                                  ? `1.5px solid ${frameColor}`
                                  : '1px solid rgba(255,255,255,0.1)',
                                background: frameFitSafeZone
                                  ? hexToRgba(frameColor, 0.22)
                                  : 'rgba(255,255,255,0.03)',
                                color: frameFitSafeZone ? '#fff' : 'var(--text-muted)',
                                fontSize: '0.78rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px'
                              }}
                            >
                              {cT.maskCyberFrameFitSafe || '🛡️ Zona Segura'}
                            </button>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setFrameFitSafeZone(false);
                              }}
                              style={{
                                padding: '8px 10px',
                                borderRadius: '8px',
                                border: !frameFitSafeZone
                                  ? `1.5px solid ${frameColor}`
                                  : '1px solid rgba(255,255,255,0.1)',
                                background: !frameFitSafeZone
                                  ? hexToRgba(frameColor, 0.22)
                                  : 'rgba(255,255,255,0.03)',
                                color: !frameFitSafeZone ? '#fff' : 'var(--text-muted)',
                                fontSize: '0.78rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px'
                              }}
                            >
                              {cT.maskCyberFrameFitFull || '⬛ Pantalla Completa'}
                            </button>
                          </div>

                          <p style={{ fontSize: '0.72rem', color: 'var(--text-dim)', margin: 0, lineHeight: 1.4 }}>
                            {cT.maskCyberFrameFitHint || 'En Zona Segura el marco queda 100% visible sin ser tapado por historias de Instagram.'}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Safe Zone Toggle for Instagram Story */}
                {format === 'story' && (
                  <div
                    onClick={() => setShowSafeZones(!showSafeZones)}
                    style={{
                      marginTop: '16px',
                      padding: '12px 16px',
                      borderRadius: '10px',
                      border: '1px dashed rgba(250, 204, 21, 0.4)',
                      background: showSafeZones
                        ? 'rgba(250, 204, 21, 0.1)'
                        : 'rgba(250, 204, 21, 0.03)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <AlertCircle size={16} color="#FACC15" />
                      <span style={{ fontSize: '0.82rem', color: '#FACC15', fontWeight: 600 }}>
                        Ver Guía de Zonas Seguras de Instagram
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: '0.74rem',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        background: showSafeZones ? '#FACC15' : 'rgba(255,255,255,0.06)',
                        color: showSafeZones ? '#000' : '#fff',
                        fontWeight: 700
                      }}
                    >
                      {showSafeZones ? 'ACTIVA' : 'INACTIVA'}
                    </span>
                  </div>
                )}

                {/* Next / Prev */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '28px' }}>
                  <button
                    onClick={() => setActiveStep(5)}
                    className="btn btn-secondary btn-sm"
                    style={{ cursor: 'pointer' }}
                  >
                    <span>← Motion FX</span>
                  </button>
                  <button
                    onClick={() => setActiveStep(7)}
                    className="btn btn-primary btn-sm"
                    style={{ cursor: 'pointer' }}
                  >
                    <span>Siguiente: Exportar →</span>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 7: Export & Final Download (Video, GIF, PNG) */}
            {activeStep === 7 && (
              <div>
                <h3
                  className="font-display"
                  style={{ fontSize: '1.25rem', marginBottom: '8px', color: '#fff' }}
                >
                  {cT.exportTitle}
                </h3>
                <p
                  style={{
                    color: 'var(--text-muted)',
                    fontSize: '0.88rem',
                    marginBottom: '20px'
                  }}
                >
                  {cT.exportDesc}
                </p>

                {/* Spec Summary Card */}
                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    padding: '20px',
                    borderRadius: '14px',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    marginBottom: '24px'
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '10px'
                    }}
                  >
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Formato:</span>
                    <strong style={{ color: '#fff', fontSize: '0.86rem' }}>
                      {cT[FORMATS[format].nameKey]}
                    </strong>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '10px'
                    }}
                  >
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Resolución Nativa:</span>
                    <strong style={{ color: frameColor, fontSize: '0.86rem', fontFamily: 'monospace' }}>
                      {FORMATS[format].width} × {FORMATS[format].height} px
                    </strong>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '10px'
                    }}
                  >
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Efectos de Animación:</span>
                    <strong style={{ color: motionFps === 120 ? '#00F0FF' : '#22c55e', fontSize: '0.86rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Zap size={14} />
                      <span>{loopDuration}s Loop @ {motionFps} FPS</span>
                    </strong>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Capas Gráficas Activas:</span>
                    <strong style={{ color: '#fff', fontSize: '0.86rem' }}>
                      {[showRepeatText, showCyberFrame, showBadges, showAudioSpec, showHudCoords, showEq, showDividerLine, showSubtitleBox, showTitleGlow, showVignette, showPhotoLayer].filter(Boolean).length} / 11
                    </strong>
                  </div>
                </div>

                {/* Triple Export Options Cards */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                  
                  {/* Option 1: Video Story (MP4 / WebM) */}
                  <div
                    style={{
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: `1px solid ${hexToRgba(frameColor, 0.35)}`,
                      borderRadius: '16px',
                      padding: '18px 20px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '10px',
                            background: hexToRgba(frameColor, 0.2),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: frameColor
                          }}
                        >
                          <Video size={18} />
                        </div>
                        <div>
                          <strong style={{ color: '#fff', fontSize: '0.94rem' }}>{cT.exportVideoTitle}</strong>
                          <span
                            style={{
                              marginLeft: '8px',
                              fontSize: '0.7rem',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              background: motionFps === 120 ? 'rgba(0, 240, 255, 0.2)' : hexToRgba(frameColor, 0.15),
                              color: motionFps === 120 ? '#00F0FF' : frameColor,
                              fontWeight: 700
                            }}
                          >
                            {loopDuration}s • {motionFps} FPS • MP4
                          </span>
                        </div>
                      </div>
                    </div>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
                      {cT.exportVideoDesc}
                    </p>

                    {/* Quick FPS selector directly in export card */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        background: 'rgba(0, 0, 0, 0.3)',
                        borderRadius: '10px',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                        flexWrap: 'wrap',
                        gap: '8px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Activity size={14} color={motionFps === 120 ? '#00F0FF' : frameColor} />
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                          {cT.motionFpsLabel || 'Tasa de Cuadros'}:
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {[
                          { fps: 30, label: '30 FPS' },
                          { fps: 60, label: '60 FPS' },
                          { fps: 120, label: '⚡ 120 FPS Pro' }
                        ].map(({ fps, label }) => (
                          <button
                            key={fps}
                            onClick={() => setMotionFps(fps)}
                            style={{
                              padding: '5px 10px',
                              borderRadius: '6px',
                              border: motionFps === fps
                                ? (fps === 120 ? '1px solid #00F0FF' : `1px solid ${frameColor}`)
                                : '1px solid rgba(255, 255, 255, 0.08)',
                              background: motionFps === fps
                                ? (fps === 120 ? 'rgba(0, 240, 255, 0.25)' : hexToRgba(frameColor, 0.25))
                                : 'rgba(255, 255, 255, 0.04)',
                              color: motionFps === fps ? '#fff' : 'var(--text-muted)',
                              fontSize: '0.74rem',
                              fontWeight: motionFps === fps ? 700 : 500,
                              cursor: 'pointer',
                              boxShadow: motionFps === fps
                                ? (fps === 120 ? '0 0 10px rgba(0, 240, 255, 0.35)' : `0 0 8px ${hexToRgba(frameColor, 0.25)}`)
                                : 'none',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={handleExportVideo}
                      disabled={isExporting}
                      className="btn btn-primary btn-sm"
                      style={{
                        padding: '12px 18px',
                        fontSize: '0.86rem',
                        fontWeight: 700,
                        justifyContent: 'center',
                        cursor: isExporting ? 'wait' : 'pointer',
                        gap: '8px',
                        boxShadow: `0 4px 16px ${hexToRgba(frameColor, 0.3)}`
                      }}
                    >
                      <Video size={16} />
                      <span>{cT.exportVideoBtn}</span>
                    </button>
                  </div>

                  {/* Option 2: Animated GIF (.gif) */}
                  <div
                    style={{
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '16px',
                      padding: '18px 20px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '10px',
                            background: 'rgba(0, 240, 255, 0.15)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#00F0FF'
                          }}
                        >
                          <Film size={18} />
                        </div>
                        <div>
                          <strong style={{ color: '#fff', fontSize: '0.94rem' }}>{cT.exportGifTitle}</strong>
                          <span
                            style={{
                              marginLeft: '8px',
                              fontSize: '0.7rem',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              background: 'rgba(0, 240, 255, 0.12)',
                              color: '#00F0FF',
                              fontWeight: 700
                            }}
                          >
                            {loopDuration}s • .GIF • LOOP
                          </span>
                        </div>
                      </div>
                    </div>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
                      {cT.exportGifDesc}
                    </p>
                    <button
                      onClick={handleExportGif}
                      disabled={isExporting}
                      className="btn btn-secondary btn-sm"
                      style={{
                        padding: '12px 18px',
                        fontSize: '0.86rem',
                        fontWeight: 700,
                        justifyContent: 'center',
                        cursor: isExporting ? 'wait' : 'pointer',
                        gap: '8px',
                        border: '1px solid rgba(0, 240, 255, 0.4)',
                        color: '#00F0FF'
                      }}
                    >
                      <Film size={16} />
                      <span>{cT.exportGifBtn}</span>
                    </button>
                  </div>

                  {/* Option 3: Static PNG (1080p) */}
                  <div
                    style={{
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '16px',
                      padding: '18px 20px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '10px',
                            background: 'rgba(255, 255, 255, 0.08)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff'
                          }}
                        >
                          <Download size={18} />
                        </div>
                        <div>
                          <strong style={{ color: '#fff', fontSize: '0.94rem' }}>{cT.exportPngTitle}</strong>
                          <span
                            style={{
                              marginLeft: '8px',
                              fontSize: '0.7rem',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              background: 'rgba(255, 255, 255, 0.08)',
                              color: 'var(--text-muted)',
                              fontWeight: 700
                            }}
                          >
                            PNG • 1080p HI-RES
                          </span>
                        </div>
                      </div>
                    </div>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
                      {cT.exportPngDesc}
                    </p>
                    <button
                      onClick={handleDownload}
                      disabled={isExporting}
                      className="btn btn-secondary btn-sm"
                      style={{
                        padding: '12px 18px',
                        fontSize: '0.86rem',
                        fontWeight: 700,
                        justifyContent: 'center',
                        cursor: isExporting ? 'wait' : 'pointer',
                        gap: '8px',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        color: '#fff'
                      }}
                    >
                      <Download size={16} />
                      <span>{cT.exportBtn}</span>
                    </button>
                  </div>

                </div>

                {/* Progress / Status feedback */}
                {isExporting && exportStatusText && (
                  <div
                    style={{
                      padding: '14px 18px',
                      borderRadius: '12px',
                      background: hexToRgba(frameColor, 0.15),
                      border: `1px solid ${hexToRgba(frameColor, 0.4)}`,
                      color: '#fff',
                      fontSize: '0.86rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      marginBottom: '16px'
                    }}
                  >
                    <RefreshCw size={16} className="spin" color={frameColor} />
                    <span>{exportStatusText}</span>
                  </div>
                )}

                {downloadSuccess && (
                  <div
                    style={{
                      padding: '12px 16px',
                      borderRadius: '10px',
                      background: 'rgba(34, 197, 94, 0.15)',
                      border: '1px solid rgba(34, 197, 94, 0.3)',
                      color: '#22c55e',
                      fontSize: '0.84rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '16px'
                    }}
                  >
                    <CheckCircle2 size={16} />
                    <span>{cT.exportSuccess}</span>
                  </div>
                )}

                {/* Instant In-App Video Preview Player */}
                {lastExportedVideoUrl && (
                  <div
                    style={{
                      marginTop: '16px',
                      marginBottom: '20px',
                      background: 'rgba(0, 0, 0, 0.45)',
                      padding: '16px',
                      borderRadius: '14px',
                      border: '1px solid rgba(34, 197, 94, 0.35)',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.5)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <span style={{ fontSize: '0.84rem', color: '#22c55e', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Play size={14} /> Reproductor de Video Exportado (Verifica Fluidez):
                      </span>
                      <button
                        onClick={() => {
                          URL.revokeObjectURL(lastExportedVideoUrl);
                          setLastExportedVideoUrl(null);
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--text-dim)',
                          cursor: 'pointer',
                          fontSize: '0.74rem'
                        }}
                      >
                        ✕ Cerrar
                      </button>
                    </div>
                    <video
                      src={lastExportedVideoUrl}
                      controls
                      autoPlay
                      loop
                      playsInline
                      style={{
                        width: '100%',
                        maxHeight: '320px',
                        borderRadius: '10px',
                        background: '#060608',
                        display: 'block'
                      }}
                    />
                  </div>
                )}

                <p
                  style={{
                    fontSize: '0.78rem',
                    color: 'var(--text-dim)',
                    lineHeight: 1.5
                  }}
                >
                  {cT.safeZoneWarning}
                </p>

                {/* Back to previous step */}
                <div style={{ marginTop: '24px' }}>
                  <button
                    onClick={() => setActiveStep(6)}
                    className="btn btn-secondary btn-sm"
                    style={{ cursor: 'pointer' }}
                  >
                    <span>← Modificar Máscaras</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Sticky Live Preview & Fast Action */}
          <div
            style={{
              position: 'sticky',
              top: '90px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
          >
            <div
              style={{
                width: '100%',
                maxWidth: format === 'story' ? '380px' : '420px',
                background: 'rgba(12, 12, 16, 0.85)',
                padding: '18px',
                borderRadius: '24px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: `0 24px 48px rgba(0, 0, 0, 0.8), 0 0 30px ${hexToRgba(frameColor, 0.12)}`
              }}
            >
              {/* Preview Header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '14px',
                  paddingBottom: '10px',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.06)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={16} color={frameColor} />
                  <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#fff' }}>
                    {cT.previewTitle}
                  </span>
                </div>

                <span
                  style={{
                    fontSize: '0.72rem',
                    fontFamily: 'monospace',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    background: hexToRgba(frameColor, 0.15),
                    color: frameColor,
                    border: `1px solid ${hexToRgba(frameColor, 0.25)}`
                  }}
                >
                  {FORMATS[format].width} × {FORMATS[format].height}
                </span>
              </div>

              {/* Canvas Preview Container */}
              <div
                style={{
                  width: '100%',
                  aspectRatio: FORMATS[format].aspectRatio,
                  borderRadius: '16px',
                  overflow: 'hidden',
                  position: 'relative',
                  background: '#000',
                  boxShadow: 'inset 0 0 20px rgba(0,0,0,0.8)'
                }}
              >
                <canvas
                  ref={canvasRef}
                  style={{
                    width: '100%',
                    height: '100%',
                    display: 'block',
                    objectFit: 'contain'
                  }}
                />

                {/* Floating Play / Pause Overlay */}
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  title={isPlaying ? 'Pausar Animación' : 'Reproducir Animación'}
                  style={{
                    position: 'absolute',
                    bottom: '12px',
                    left: '12px',
                    zIndex: 10,
                    background: 'rgba(12, 12, 16, 0.85)',
                    border: `1px solid ${hexToRgba(frameColor, 0.4)}`,
                    borderRadius: '20px',
                    padding: '6px 12px',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                    backdropFilter: 'blur(8px)',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
                  }}
                >
                  {isPlaying ? <Pause size={12} color={frameColor} /> : <Play size={12} color={frameColor} />}
                  <span>{isPlaying ? 'MOTION ON' : 'PAUSA'}</span>
                </button>
              </div>

              {/* Quick Actions Below Canvas */}
              <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <button
                    onClick={handleExportVideo}
                    disabled={isExporting}
                    className="btn btn-primary"
                    style={{
                      justifyContent: 'center',
                      padding: '10px 12px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: isExporting ? 'wait' : 'pointer',
                      gap: '6px'
                    }}
                  >
                    <Video size={14} />
                    <span>Video (MP4)</span>
                  </button>

                  <button
                    onClick={handleExportGif}
                    disabled={isExporting}
                    className="btn btn-secondary"
                    style={{
                      justifyContent: 'center',
                      padding: '10px 12px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: isExporting ? 'wait' : 'pointer',
                      gap: '6px',
                      border: '1px solid rgba(0, 240, 255, 0.4)',
                      color: '#00F0FF'
                    }}
                  >
                    <Film size={14} />
                    <span>GIF Animado</span>
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={handleDownload}
                    disabled={isExporting}
                    className="btn btn-secondary"
                    style={{
                      flex: 1,
                      justifyContent: 'center',
                      padding: '10px 12px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: isExporting ? 'wait' : 'pointer',
                      border: '1px solid rgba(255, 255, 255, 0.12)'
                    }}
                  >
                    <Download size={14} />
                    <span>Descargar PNG</span>
                  </button>

                  {format === 'story' && (
                    <button
                      onClick={() => setShowSafeZones(!showSafeZones)}
                      title="Alternar Zonas Seguras de Instagram"
                      style={{
                        padding: '10px 14px',
                        borderRadius: '10px',
                        border: showSafeZones
                          ? '1px solid #FACC15'
                          : '1px solid rgba(255, 255, 255, 0.1)',
                        background: showSafeZones
                          ? 'rgba(250, 204, 21, 0.15)'
                          : 'rgba(255, 255, 255, 0.04)',
                        color: showSafeZones ? '#FACC15' : 'var(--text-muted)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Eye size={15} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
