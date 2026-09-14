import React, { useState, useRef, useEffect, useCallback } from 'react';
import QRCode from 'qrcode';
import {
  ArrowLeft,
  Download,
  QrCode,
  Layers,
  Type,
  RefreshCw,
  Eye,
  EyeOff,
  Sparkles,
  CheckCircle2,
  Palette,
  Share2,
  Check,
  CreditCard,
  Upload,
  Image as ImageIcon,
  ZoomIn,
  Move,
  Sliders,
  ChevronDown,
  AlignLeft,
  AlignCenter,
  AlignRight,
  RotateCcw
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

// Official standard business card dimensions (3.5" × 2" at 300 DPI)
const CARD_WIDTH = 1050;
const CARD_HEIGHT = 600;
const CARD_ASPECT_RATIO = '1050 / 600';

const DEFAULT_PRESETS = [
  { id: 'capture2', nameKey: 'photoPreset2', src: '/missa-capture-2.jpg' },
  { id: 'capture1', nameKey: 'photoPreset1', src: '/missa-capture.jpg' }
];

const QR_PRESETS = [
  { id: 'whatsapp', labelKey: 'presetWhatsapp', url: 'https://wa.me/5214443570777' },
  { id: 'instagram', labelKey: 'presetInstagram', url: 'https://instagram.com/missafx_' },
  { id: 'soundcloud', labelKey: 'presetSoundcloud', url: 'https://soundcloud.com/missafx' },
  { id: 'kick', labelKey: 'presetKick', url: 'https://kick.com/missafx' }
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
    c = c.split('').map((x) => x + x).join('');
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

export default function CardCreator({ onBack }) {
  const { t } = useLanguage();
  const cT = t.cardCreator;

  // Wizard active step (1 to 6)
  const [activeStep, setActiveStep] = useState(1);

  // Active side for preview ('front' | 'back')
  const [activeSide, setActiveSide] = useState('front');
  const [isFlipped, setIsFlipped] = useState(false);

  // Text Subtabs for Step 1 ('front' | 'back')
  const [textSideTab, setTextSideTab] = useState('front');
  const [openDrawer, setOpenDrawer] = useState('artist'); // active accordion drawer

  // 1. FRONT TEXTS & CONTROLS
  // 1.1 Front Top Badge
  const [frontBadgeText, setFrontBadgeText] = useState('OFFICIAL DJ PRESS CARD // PIONEER PRO DJ');
  const [frontBadgeSize, setFrontBadgeSize] = useState(12);
  const [frontBadgeX, setFrontBadgeX] = useState(0);
  const [frontBadgeY, setFrontBadgeY] = useState(0);
  const [frontBadgeTracking, setFrontBadgeTracking] = useState(1);
  const [frontBadgeBgColor, setFrontBadgeBgColor] = useState('rgba(12, 12, 16, 0.9)');
  const [frontBadgeBorderColor, setFrontBadgeBorderColor] = useState('');
  const [frontBadgeTextColor, setFrontBadgeTextColor] = useState('#FFFFFF');

  // 1.2 Artist Main Title
  const [artistName, setArtistName] = useState('MISSAFX');
  const [artistNameSize, setArtistNameSize] = useState(88);
  const [artistNameX, setArtistNameX] = useState(0);
  const [artistNameY, setArtistNameY] = useState(0);
  const [artistNameTracking, setArtistNameTracking] = useState(0);
  const [artistNameAlign, setArtistNameAlign] = useState('center');
  const [artistNameUppercase, setArtistNameUppercase] = useState(true);

  // 1.3 Role / Genre
  const [roleGenre, setRoleGenre] = useState('DJ & TECH HOUSE PRODUCER');
  const [roleGenreSize, setRoleGenreSize] = useState(16);
  const [roleGenreX, setRoleGenreX] = useState(0);
  const [roleGenreY, setRoleGenreY] = useState(0);
  const [roleGenreTracking, setRoleGenreTracking] = useState(2);
  const [roleGenreBgColor, setRoleGenreBgColor] = useState('');
  const [roleGenreTextColor, setRoleGenreTextColor] = useState('');
  const [roleGenreUppercase, setRoleGenreUppercase] = useState(true);

  // 1.4 Real Name
  const [realName, setRealName] = useState('Missael G.');
  const [realNameSize, setRealNameSize] = useState(15);
  const [realNameX, setRealNameX] = useState(0);
  const [realNameY, setRealNameY] = useState(0);
  const [realNameTracking, setRealNameTracking] = useState(0);
  const [realNameColor, setRealNameColor] = useState('');
  const [realNameAlign, setRealNameAlign] = useState('center');

  // 1.5 Location & Subtext
  const [cityLocation, setCityLocation] = useState('San Luis Potosí, México');
  const [locationSubtext, setLocationSubtext] = useState('DIRECT BOOKING & TOURS');
  const [citySize, setCitySize] = useState(13);
  const [cityX, setCityX] = useState(0);
  const [cityY, setCityY] = useState(0);
  const [cityColor, setCityColor] = useState('');

  // 1.6 Front Technical HUD & Audio
  const [frontAudioSpec, setFrontAudioSpec] = useState('[ PRO DJ LINK • 48kHz MASTER ]');
  const [frontGpsCoords, setFrontGpsCoords] = useState('[ 22° 09\' N // 100° 58\' W ]');
  const [frontHudSize, setFrontHudSize] = useState(12);
  const [frontHudX, setFrontHudX] = useState(0);
  const [frontHudY, setFrontHudY] = useState(0);
  const [frontHudColor, setFrontHudColor] = useState('#64748B');

  // 1.7 Front Mini EQ
  const [frontEqScale, setFrontEqScale] = useState(1.0);
  const [frontEqX, setFrontEqX] = useState(0);
  const [frontEqY, setFrontEqY] = useState(0);

  // 2. BACK TEXTS & CONTROLS
  // 2.1 Back Header Logo & Subtitle
  const [backLogoText, setBackLogoText] = useState('MISSAFX');
  const [backSubtitle, setBackSubtitle] = useState('DIRECT BOOKING & PRESS KIT');
  const [backHeaderSize, setBackHeaderSize] = useState(32);
  const [backHeaderX, setBackHeaderX] = useState(0);
  const [backHeaderY, setBackHeaderY] = useState(0);
  const [backHeaderColor, setBackHeaderColor] = useState('');

  // 2.2 Contact Block (WA, City, Tagline)
  const [phoneWhatsapp, setPhoneWhatsapp] = useState('+52 1 444 357 0777');
  const [tagline, setTagline] = useState('Tech House • Club Dates • Festivals');
  const [backContactSize, setBackContactSize] = useState(15);
  const [backContactX, setBackContactX] = useState(0);
  const [backContactY, setBackContactY] = useState(0);
  const [backContactColor, setBackContactColor] = useState('');

  // 2.3 Back Channels & Handle
  const [backChannelsText, setBackChannelsText] = useState('CHANNELS: IG • KICK • SOUNDCLOUD • WA');
  const [backHandleText, setBackHandleText] = useState('@missafx_ // oficial');
  const [backChannelsSize, setBackChannelsSize] = useState(13);
  const [backChannelsX, setBackChannelsX] = useState(0);
  const [backChannelsY, setBackChannelsY] = useState(0);
  const [backChannelsColor, setBackChannelsColor] = useState('');

  // 2.4 Back Security & Footer
  const [backSecurityTag, setBackSecurityTag] = useState('NEXORA SECURITY // ENCRYPTED QR');
  const [backAuthId, setBackAuthId] = useState('[ CARD AUTH ID: #MFX-2026 ]');
  const [backFooterCredit, setBackFooterCredit] = useState('BY NEXORA IT // WWW.ITNEXORA.COM');
  const [backSecuritySize, setBackSecuritySize] = useState(12);
  const [backSecurityX, setBackSecurityX] = useState(0);
  const [backSecurityY, setBackSecurityY] = useState(0);
  const [backSecurityColor, setBackSecurityColor] = useState('#64748B');

  // Photo & Framing State
  const [photoSrc, setPhotoSrc] = useState('/missa-capture-2.jpg');
  const [photoScale, setPhotoScale] = useState(1.1);
  const [photoPanX, setPhotoPanX] = useState(0);
  const [photoPanY, setPhotoPanY] = useState(0);
  const [photoOpacity, setPhotoOpacity] = useState(0.32);
  const [photoFilter, setPhotoFilter] = useState('cyberpunk'); // 'cyberpunk' | 'contrast' | 'normal'
  const [showPhotoBack, setShowPhotoBack] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Granular Color Customization State
  const [frameColor, setFrameColor] = useState('#FF003C');
  const [titleColor, setTitleColor] = useState('#FF003C');
  const [titleFxColor, setTitleFxColor] = useState('#FFFFFF');
  const [badgeColor, setBadgeColor] = useState('#FF003C');
  const [badgeTextColor, setBadgeTextColor] = useState('#FFFFFF');
  const [textColor, setTextColor] = useState('#E2E8F0');
  const [backAccentColor, setBackAccentColor] = useState('#FF003C');
  const [glowColor, setGlowColor] = useState('#FF003C');

  // QR Code State
  const [qrUrl, setQrUrl] = useState('https://wa.me/5214443570777');
  const [qrLabelText, setQrLabelText] = useState('ESCANEA PARA BOOKING DIRECTO & SESIONES');
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [qrSize, setQrSize] = useState(220);
  const [qrPanX, setQrPanX] = useState(0);
  const [qrPanY, setQrPanY] = useState(0);
  const [qrGlow, setQrGlow] = useState(8);
  const [qrBorderColor, setQrBorderColor] = useState('');
  const [qrLabelSize, setQrLabelSize] = useState(11);
  const [qrLabelY, setQrLabelY] = useState(0);
  const [qrLabelColor, setQrLabelColor] = useState('#E2E8F0');

  // Masks / Layers Toggles (15 toggles)
  const [showCyberFrame, setShowCyberFrame] = useState(true);
  const [showFrontBadge, setShowFrontBadge] = useState(true);
  const [showRoleBadge, setShowRoleBadge] = useState(true);
  const [showFrontHud, setShowFrontHud] = useState(true);
  const [showFrontEq, setShowFrontEq] = useState(true);
  const [showGlowBg, setShowGlowBg] = useState(true);
  const [showPhotoBg, setShowPhotoBg] = useState(true);

  const [showBackHeader, setShowBackHeader] = useState(true);
  const [showBackDivider, setShowBackDivider] = useState(true);
  const [showBackContact, setShowBackContact] = useState(true);
  const [showSocialBadges, setShowSocialBadges] = useState(true);
  const [showBackSecurity, setShowBackSecurity] = useState(true);
  const [showBackFooter, setShowBackFooter] = useState(true);
  const [showBackGrid, setShowBackGrid] = useState(true);
  const [showQr, setShowQr] = useState(true);

  // Export State
  const [isExporting, setIsExporting] = useState(false);
  const [exportMessage, setExportMessage] = useState('');

  // Canvas Refs
  const frontCanvasRef = useRef(null);
  const backCanvasRef = useRef(null);
  const bgImageRef = useRef(null);

  // Load background photo dynamically
  useEffect(() => {
    setImageLoaded(false);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = photoSrc;
    img.onload = () => {
      bgImageRef.current = img;
      setImageLoaded(true);
      renderAllCanvases();
    };
    img.onerror = () => {
      console.warn('Error loading card photo:', photoSrc);
    };
  }, [photoSrc]);

  // Handle Photo Upload from local device
  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const result = uploadEvent.target?.result;
      if (typeof result === 'string') {
        setPhotoSrc(result);
        setPhotoScale(1.1);
        setPhotoPanX(0);
        setPhotoPanY(0);
        setShowPhotoBg(true);
      }
    };
    reader.readAsDataURL(file);
  };

  // Reset Photo Position
  const handleResetPosition = () => {
    setPhotoScale(1.1);
    setPhotoPanX(0);
    setPhotoPanY(0);
  };

  // Generate QR code Data URL dynamically
  useEffect(() => {
    if (!qrUrl.trim()) return;
    QRCode.toDataURL(qrUrl.trim(), {
      width: 400,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    })
      .then((url) => {
        setQrDataUrl(url);
      })
      .catch((err) => {
        console.error('Error generating QR code:', err);
      });
  }, [qrUrl]);

  // Apply a unified color theme to all elements at once with smart contrast
  const applyUnifiedColor = (hex) => {
    setFrameColor(hex);
    setTitleColor(hex);
    setBadgeColor(hex);
    setBackAccentColor(hex);
    setGlowColor(hex);

    // Smart auto-contrast for text elements
    const autoBadgeText = getAutoContrastColor(hex);
    setBadgeTextColor(autoBadgeText);

    if (isLightColor(hex)) {
      setTitleFxColor('#FF003C');
      setTextColor('#CBD5E1');
    } else {
      setTitleFxColor('#FFFFFF');
      setTextColor('#E2E8F0');
    }
  };

  // Render FRONT Canvas
  const renderFrontCanvas = useCallback(() => {
    const canvas = frontCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = CARD_WIDTH;
    const h = CARD_HEIGHT;

    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }

    // 1. Dark Base
    ctx.fillStyle = '#060608';
    ctx.fillRect(0, 0, w, h);

    // 2. Photo background if enabled
    if (showPhotoBg && bgImageRef.current) {
      ctx.save();
      ctx.globalAlpha = photoOpacity;
      if (photoFilter === 'contrast') {
        ctx.filter = 'contrast(140%) brightness(85%) saturate(110%)';
      } else if (photoFilter === 'cyberpunk') {
        ctx.filter = 'grayscale(100%) contrast(150%) brightness(75%)';
      } else {
        ctx.filter = 'none';
      }

      const img = bgImageRef.current;
      const imgRatio = img.width / img.height;
      const canvasRatio = w / h;
      let dW, dH;
      if (imgRatio > canvasRatio) {
        dH = h * photoScale;
        dW = dH * imgRatio;
      } else {
        dW = w * photoScale;
        dH = dW / imgRatio;
      }
      ctx.drawImage(img, (w - dW) / 2 + photoPanX, (h - dH) / 2 + photoPanY, dW, dH);
      ctx.restore();
    }

    // Radial atmospheric glow
    if (showGlowBg) {
      const radGrad = ctx.createRadialGradient(w / 2, h / 2, 40, w / 2, h / 2, w * 0.7);
      radGrad.addColorStop(0, hexToRgba(glowColor, 0.16));
      radGrad.addColorStop(1, 'rgba(6, 6, 8, 0.94)');
      ctx.fillStyle = radGrad;
      ctx.fillRect(0, 0, w, h);
    }

    // 3. Cyberpunk Beveled Frame (if enabled)
    if (showCyberFrame) {
      ctx.save();
      const inset = 30;
      const bevel = 26;

      ctx.beginPath();
      ctx.moveTo(inset + bevel, inset);
      ctx.lineTo(w - inset - bevel, inset);
      ctx.lineTo(w - inset, inset + bevel);
      ctx.lineTo(w - inset, h - inset - bevel);
      ctx.lineTo(w - inset - bevel, h - inset);
      ctx.lineTo(inset + bevel, h - inset);
      ctx.lineTo(inset, h - inset - bevel);
      ctx.lineTo(inset, inset + bevel);
      ctx.closePath();

      ctx.strokeStyle = frameColor;
      ctx.lineWidth = 3;
      ctx.shadowColor = frameColor;
      ctx.shadowBlur = 12;
      ctx.stroke();

      // Corner accent blocks
      ctx.shadowBlur = 0;
      ctx.fillStyle = frameColor;
      ctx.fillRect(inset + bevel, inset - 3, 24, 6);
      ctx.fillRect(w - inset - bevel - 24, inset - 3, 24, 6);
      ctx.fillRect(inset + bevel, h - inset - 3, 24, 6);
      ctx.fillRect(w - inset - bevel - 24, h - inset - 3, 24, 6);

      ctx.restore();
    }

    // 4. Technical accents & HUD (if enabled)
    if (showFrontHud) {
      ctx.save();
      ctx.fillStyle = frontHudColor || '#64748B';
      ctx.font = `600 ${frontHudSize}px "Outfit", monospace`;

      // Crosshairs
      const cs = 8;
      const pts = [
        [50, 50],
        [w - 50, 50],
        [50, h - 50],
        [w - 50, h - 50]
      ];
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.lineWidth = 1.2;
      pts.forEach(([px, py]) => {
        ctx.beginPath();
        ctx.moveTo(px - cs, py);
        ctx.lineTo(px + cs, py);
        ctx.moveTo(px, py - cs);
        ctx.lineTo(px, py + cs);
        ctx.stroke();
      });

      // Technical tags
      if (frontAudioSpec.trim()) {
        ctx.fillText(frontAudioSpec.trim(), 70 + frontHudX, 54 + frontHudY);
      }
      if (frontGpsCoords.trim()) {
        ctx.fillText(frontGpsCoords.trim(), w - 240 + frontHudX, 54 + frontHudY);
      }
      ctx.restore();
    }

    // Mini EQ bars (Front)
    if (showFrontEq) {
      ctx.save();
      const eqX = w - 130 + frontEqX;
      const eqY = h - 60 + frontEqY;
      const heights = [8, 14, 6, 18, 12, 16, 9, 5];
      for (let i = 0; i < heights.length; i++) {
        ctx.fillStyle = i % 2 === 0 ? frameColor : 'rgba(255, 255, 255, 0.5)';
        ctx.fillRect(eqX + i * 6 * frontEqScale, eqY - heights[i] * frontEqScale, 4 * frontEqScale, heights[i] * frontEqScale);
      }
      ctx.restore();
    }

    // 5. Main Front Branding
    ctx.save();
    const centerY = h * 0.46;

    // Pill badge: OFFICIAL DJ PRESS CARD
    if (showFrontBadge && frontBadgeText.trim()) {
      ctx.save();
      const bText = frontBadgeText.trim();
      ctx.font = `700 ${frontBadgeSize}px "Outfit", sans-serif`;
      if (ctx.letterSpacing !== undefined) {
        ctx.letterSpacing = `${frontBadgeTracking}px`;
      }
      const bW = ctx.measureText(bText).width + 32;
      const bH = Math.max(24, frontBadgeSize + 14);
      const bX = (w - bW) / 2 + frontBadgeX;
      const bY = centerY - 95 + frontBadgeY;

      ctx.fillStyle = frontBadgeBgColor || 'rgba(12, 12, 16, 0.9)';
      ctx.strokeStyle = frontBadgeBorderColor || frameColor;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.roundRect(bX, bY, bW, bH, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = frontBadgeBorderColor || frameColor;
      ctx.beginPath();
      ctx.arc(bX + 12, bY + bH / 2, 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = frontBadgeTextColor || '#FFFFFF';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(bText, bX + 22, bY + bH / 2);
      ctx.restore();
    }

    // Main Artist Title: MISSAFX with titleColor & titleFxColor
    if (artistName.trim()) {
      ctx.save();
      const titleRaw = artistName.trim();
      const titleUpper = artistNameUppercase ? titleRaw.toUpperCase() : titleRaw;
      ctx.font = `900 ${artistNameSize}px "Syne", sans-serif`;
      if (ctx.letterSpacing !== undefined) {
        ctx.letterSpacing = `${artistNameTracking}px`;
      }
      ctx.textBaseline = 'middle';

      const finalY = centerY + artistNameY;
      const isSplit = titleUpper.startsWith('MISSA') && titleUpper.endsWith('FX');

      if (isSplit) {
        const p1 = 'MISSA';
        const p2 = 'FX';
        const m1 = ctx.measureText(p1).width;
        const m2 = ctx.measureText(p2).width;
        const totalW = m1 + m2;
        let sX = (w - totalW) / 2 + artistNameX;
        if (artistNameAlign === 'left') sX = 90 + artistNameX;
        if (artistNameAlign === 'right') sX = w - 90 - totalW + artistNameX;

        ctx.textAlign = 'left';
        ctx.fillStyle = titleColor;
        ctx.fillText(p1, sX, finalY);
        ctx.fillStyle = titleFxColor;
        ctx.fillText(p2, sX + m1, finalY);
      } else {
        let textX = w / 2 + artistNameX;
        if (artistNameAlign === 'left') {
          ctx.textAlign = 'left';
          textX = 90 + artistNameX;
        } else if (artistNameAlign === 'right') {
          ctx.textAlign = 'right';
          textX = w - 90 + artistNameX;
        } else {
          ctx.textAlign = 'center';
        }
        ctx.fillStyle = titleColor;
        ctx.fillText(titleUpper, textX, finalY);
      }
      ctx.restore();
    }

    // Role / Genre Pill with badgeColor & intelligent contrast
    if (showRoleBadge && roleGenre.trim()) {
      ctx.save();
      const rText = roleGenreUppercase ? roleGenre.trim().toUpperCase() : roleGenre.trim();
      ctx.font = `800 ${roleGenreSize}px "Syne", sans-serif`;
      if (ctx.letterSpacing !== undefined) {
        ctx.letterSpacing = `${roleGenreTracking}px`;
      }
      const rW = ctx.measureText(rText).width + 28;
      const rH = Math.max(24, roleGenreSize + 14);
      const rX = (w - rW) / 2 + roleGenreX;
      const rY = centerY + 58 + roleGenreY;

      const activeBgColor = roleGenreBgColor || badgeColor;
      ctx.fillStyle = activeBgColor;
      ctx.beginPath();
      ctx.roundRect(rX, rY, rW, rH, 5);
      ctx.fill();

      // Intelligent contrast check for badge text
      let effectiveBadgeTextColor = roleGenreTextColor || badgeTextColor;
      if (isLightColor(activeBgColor) && isLightColor(effectiveBadgeTextColor)) {
        effectiveBadgeTextColor = '#060608';
      } else if (!isLightColor(activeBgColor) && !isLightColor(effectiveBadgeTextColor)) {
        effectiveBadgeTextColor = '#FFFFFF';
      }

      ctx.fillStyle = effectiveBadgeTextColor;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(rText, rX + rW / 2, rY + rH / 2);
      ctx.restore();
    }

    // Real name
    if (realName.trim()) {
      ctx.save();
      ctx.textBaseline = 'middle';
      ctx.font = `600 ${realNameSize}px "Outfit", sans-serif`;
      if (ctx.letterSpacing !== undefined) {
        ctx.letterSpacing = `${realNameTracking}px`;
      }
      let realX = w / 2 + realNameX;
      if (realNameAlign === 'left') {
        ctx.textAlign = 'left';
        realX = 90 + realNameX;
      } else if (realNameAlign === 'right') {
        ctx.textAlign = 'right';
        realX = w - 90 + realNameX;
      } else {
        ctx.textAlign = 'center';
      }
      ctx.fillStyle = realNameColor || textColor;
      ctx.fillText(realName.trim(), realX, centerY + 115 + realNameY);
      ctx.restore();
    }

    // Location & subtext bottom bar
    const fullLocation = [cityLocation.trim(), locationSubtext.trim()].filter(Boolean).join(' • ');
    if (fullLocation) {
      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = `500 ${citySize}px "Outfit", sans-serif`;
      ctx.fillStyle = cityColor || (isLightColor(textColor) ? 'rgba(255, 255, 255, 0.65)' : '#94A3B8');
      ctx.fillText(fullLocation, w / 2 + cityX, centerY + 138 + cityY);
      ctx.restore();
    }

    ctx.restore();
  }, [
    artistName,
    artistNameSize,
    artistNameX,
    artistNameY,
    artistNameTracking,
    artistNameAlign,
    artistNameUppercase,
    frontBadgeText,
    frontBadgeSize,
    frontBadgeX,
    frontBadgeY,
    frontBadgeTracking,
    frontBadgeBgColor,
    frontBadgeBorderColor,
    frontBadgeTextColor,
    roleGenre,
    roleGenreSize,
    roleGenreX,
    roleGenreY,
    roleGenreTracking,
    roleGenreBgColor,
    roleGenreTextColor,
    roleGenreUppercase,
    realName,
    realNameSize,
    realNameX,
    realNameY,
    realNameTracking,
    realNameColor,
    realNameAlign,
    cityLocation,
    locationSubtext,
    citySize,
    cityX,
    cityY,
    cityColor,
    frontAudioSpec,
    frontGpsCoords,
    frontHudSize,
    frontHudX,
    frontHudY,
    frontHudColor,
    frontEqScale,
    frontEqX,
    frontEqY,
    frameColor,
    titleColor,
    titleFxColor,
    badgeColor,
    badgeTextColor,
    textColor,
    glowColor,
    showCyberFrame,
    showFrontBadge,
    showRoleBadge,
    showFrontHud,
    showFrontEq,
    showGlowBg,
    showPhotoBg,
    photoScale,
    photoPanX,
    photoPanY,
    photoOpacity,
    photoFilter
  ]);

  // Render BACK Canvas
  const renderBackCanvas = useCallback(() => {
    const canvas = backCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = CARD_WIDTH;
    const h = CARD_HEIGHT;

    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }

    // 1. Dark Base Background
    ctx.fillStyle = '#060608';
    ctx.fillRect(0, 0, w, h);

    // Optional subtle photo background on back
    if (showPhotoBack && bgImageRef.current) {
      ctx.save();
      ctx.globalAlpha = Math.min(photoOpacity * 0.5, 0.18);
      if (photoFilter === 'contrast') {
        ctx.filter = 'contrast(140%) brightness(85%) saturate(110%)';
      } else if (photoFilter === 'cyberpunk') {
        ctx.filter = 'grayscale(100%) contrast(150%) brightness(70%)';
      } else {
        ctx.filter = 'none';
      }

      const img = bgImageRef.current;
      const imgRatio = img.width / img.height;
      const canvasRatio = w / h;
      let dW, dH;
      if (imgRatio > canvasRatio) {
        dH = h * photoScale;
        dW = dH * imgRatio;
      } else {
        dW = w * photoScale;
        dH = dW / imgRatio;
      }
      ctx.drawImage(img, (w - dW) / 2 + photoPanX, (h - dH) / 2 + photoPanY, dW, dH);
      ctx.restore();
    }

    // Subtle technical grid
    if (showBackGrid) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < w; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }
    }

    // 2. Cyberpunk Frame (if enabled)
    if (showCyberFrame) {
      ctx.save();
      const inset = 30;
      const bevel = 26;

      ctx.beginPath();
      ctx.moveTo(inset + bevel, inset);
      ctx.lineTo(w - inset - bevel, inset);
      ctx.lineTo(w - inset, inset + bevel);
      ctx.lineTo(w - inset, h - inset - bevel);
      ctx.lineTo(w - inset - bevel, h - inset);
      ctx.lineTo(inset + bevel, h - inset);
      ctx.lineTo(inset, h - inset - bevel);
      ctx.lineTo(inset, inset + bevel);
      ctx.closePath();

      ctx.strokeStyle = frameColor;
      ctx.lineWidth = 3;
      ctx.shadowColor = frameColor;
      ctx.shadowBlur = 12;
      ctx.stroke();

      ctx.shadowBlur = 0;
      ctx.fillStyle = frameColor;
      ctx.fillRect(inset + bevel, inset - 3, 24, 6);
      ctx.fillRect(w - inset - bevel - 24, inset - 3, 24, 6);
      ctx.fillRect(inset + bevel, h - inset - 3, 24, 6);
      ctx.fillRect(w - inset - bevel - 24, h - inset - 3, 24, 6);
      ctx.restore();
    }

    // 3. Technical Accents / Security Tags (if enabled)
    if (showBackSecurity) {
      ctx.save();
      ctx.fillStyle = backSecurityColor || '#64748B';
      ctx.font = `600 ${backSecuritySize}px "Outfit", monospace`;

      const cs = 8;
      const pts = [
        [50, 50],
        [w - 50, 50],
        [50, h - 50],
        [w - 50, h - 50]
      ];
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.lineWidth = 1.2;
      pts.forEach(([px, py]) => {
        ctx.beginPath();
        ctx.moveTo(px - cs, py);
        ctx.lineTo(px + cs, py);
        ctx.moveTo(px, py - cs);
        ctx.lineTo(px, py + cs);
        ctx.stroke();
      });

      if (backSecurityTag.trim()) {
        ctx.fillText(backSecurityTag.trim(), 70 + backSecurityX, 54 + backSecurityY);
      }
      if (backAuthId.trim()) {
        ctx.fillText(backAuthId.trim(), w - 240 + backSecurityX, 54 + backSecurityY);
      }
      ctx.restore();
    }

    // 4. Horizontal Standard Layout
    const leftColX = 75;
    const rightColX = w - 340;

    // Left Column: Contact & Booking Info
    ctx.save();

    // Mini Logo Header
    if (showBackHeader && backLogoText.trim()) {
      ctx.save();
      const logoUpper = backLogoText.trim().toUpperCase();
      ctx.font = `900 ${backHeaderSize}px "Syne", sans-serif`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';

      const isSplit = logoUpper.startsWith('MISSA') && logoUpper.endsWith('FX');
      if (isSplit) {
        ctx.fillStyle = backHeaderColor || titleColor;
        ctx.fillText('MISSA', leftColX + backHeaderX, 85 + backHeaderY);
        const m1 = ctx.measureText('MISSA').width;
        ctx.fillStyle = titleFxColor;
        ctx.fillText('FX', leftColX + backHeaderX + m1, 85 + backHeaderY);
      } else {
        ctx.fillStyle = backHeaderColor || titleColor;
        ctx.fillText(logoUpper, leftColX + backHeaderX, 85 + backHeaderY);
      }

      if (backSubtitle.trim()) {
        ctx.font = '700 13px "Outfit", sans-serif';
        ctx.fillStyle = 'var(--text-muted)';
        ctx.fillText(backSubtitle.trim(), leftColX + backHeaderX, 85 + backHeaderSize + 8 + backHeaderY);
      }
      ctx.restore();
    }

    // Accent Divider
    if (showBackDivider) {
      ctx.save();
      ctx.strokeStyle = backAccentColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(leftColX, 150 + backHeaderY);
      ctx.lineTo(leftColX + 320, 150 + backHeaderY);
      ctx.stroke();
      ctx.restore();
    }

    // Info rows
    if (showBackContact) {
      ctx.save();
      ctx.font = `600 ${backContactSize}px "Outfit", sans-serif`;
      ctx.fillStyle = backContactColor || textColor;
      if (phoneWhatsapp.trim()) {
        ctx.fillText(`WA: ${phoneWhatsapp.trim()}`, leftColX + backContactX, 180 + backContactY);
      }

      ctx.font = `500 ${Math.max(11, backContactSize - 2)}px "Outfit", sans-serif`;
      ctx.fillStyle = isLightColor(textColor) ? 'rgba(255, 255, 255, 0.7)' : '#94A3B8';
      if (cityLocation.trim()) {
        ctx.fillText(`LOC: ${cityLocation.trim()}`, leftColX + backContactX, 214 + backContactY);
      }
      if (tagline.trim()) {
        ctx.fillText(`TAG: ${tagline.trim()}`, leftColX + backContactX, 244 + backContactY);
      }
      ctx.restore();
    }

    // Social networks pills if enabled
    if (showSocialBadges) {
      ctx.save();
      if (backChannelsText.trim()) {
        ctx.font = '700 12px "Outfit", monospace';
        ctx.fillStyle = backChannelsColor || backAccentColor;
        ctx.fillText(backChannelsText.trim(), leftColX + backChannelsX, 280 + backChannelsY);
      }

      if (backHandleText.trim()) {
        ctx.font = `600 ${backChannelsSize}px "Outfit", sans-serif`;
        ctx.fillStyle = textColor;
        ctx.fillText(backHandleText.trim(), leftColX + backChannelsX, 305 + backChannelsY);
      }
      ctx.restore();
    }

    // Nexora Footer
    if (showBackFooter && backFooterCredit.trim()) {
      ctx.save();
      ctx.font = '600 11px "Outfit", monospace';
      ctx.fillStyle = '#475569';
      ctx.fillText(backFooterCredit.trim(), leftColX, h - 60);
      ctx.restore();
    }
    ctx.restore();

    // Right Column: QR Code Box (if enabled)
    if (showQr && qrDataUrl) {
      ctx.save();
      const qrBoxSize = qrSize;
      const finalQrX = rightColX + qrPanX;
      const finalQrY = ((h - qrBoxSize) / 2 - 10) + qrPanY;

      // White rounded background container
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.roundRect(finalQrX, finalQrY, qrBoxSize, qrBoxSize, 14);
      ctx.fill();

      // Glowing border around QR
      ctx.strokeStyle = qrBorderColor || backAccentColor;
      ctx.lineWidth = 2.5;
      if (qrGlow > 0) {
        ctx.shadowColor = qrBorderColor || backAccentColor;
        ctx.shadowBlur = qrGlow;
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Draw QR Image
      const qrImg = new Image();
      qrImg.src = qrDataUrl;
      if (qrImg.complete) {
        ctx.drawImage(qrImg, finalQrX + 10, finalQrY + 10, qrBoxSize - 20, qrBoxSize - 20);
      } else {
        qrImg.onload = () => renderBackCanvas();
      }

      // QR label text below
      if (qrLabelText.trim()) {
        ctx.fillStyle = qrLabelColor || '#E2E8F0';
        ctx.font = `700 ${qrLabelSize}px "Outfit", sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(qrLabelText.trim().toUpperCase(), finalQrX + qrBoxSize / 2, finalQrY + qrBoxSize + 14 + qrLabelY);
      }
      ctx.restore();
    }
  }, [
    backLogoText,
    backSubtitle,
    backHeaderSize,
    backHeaderX,
    backHeaderY,
    backHeaderColor,
    phoneWhatsapp,
    cityLocation,
    tagline,
    backContactSize,
    backContactX,
    backContactY,
    backContactColor,
    backChannelsText,
    backHandleText,
    backChannelsSize,
    backChannelsX,
    backChannelsY,
    backChannelsColor,
    backSecurityTag,
    backAuthId,
    backFooterCredit,
    backSecuritySize,
    backSecurityX,
    backSecurityY,
    backSecurityColor,
    frameColor,
    titleColor,
    titleFxColor,
    textColor,
    backAccentColor,
    qrDataUrl,
    qrLabelText,
    qrSize,
    qrPanX,
    qrPanY,
    qrGlow,
    qrBorderColor,
    qrLabelSize,
    qrLabelY,
    qrLabelColor,
    showQr,
    showCyberFrame,
    showBackSecurity,
    showBackHeader,
    showBackDivider,
    showBackContact,
    showSocialBadges,
    showBackFooter,
    showBackGrid,
    showPhotoBack,
    photoScale,
    photoPanX,
    photoPanY,
    photoOpacity,
    photoFilter
  ]);

  // Master render
  const renderAllCanvases = useCallback(() => {
    renderFrontCanvas();
    renderBackCanvas();
  }, [renderFrontCanvas, renderBackCanvas]);

  useEffect(() => {
    renderAllCanvases();
  }, [renderAllCanvases]);

  // Download helper
  const downloadCanvas = (canvas, filename) => {
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = filename;
    link.href = canvas.toDataURL('image/png', 1.0);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadFront = () => {
    setIsExporting(true);
    setTimeout(() => {
      renderFrontCanvas();
      downloadCanvas(
        frontCanvasRef.current,
        `missafx-card-front-${CARD_WIDTH}x${CARD_HEIGHT}.png`
      );
      setIsExporting(false);
      setExportMessage(cT.exportSuccess);
      setTimeout(() => setExportMessage(''), 3500);
    }, 100);
  };

  const handleDownloadBack = () => {
    setIsExporting(true);
    setTimeout(() => {
      renderBackCanvas();
      downloadCanvas(
        backCanvasRef.current,
        `missafx-card-back-${CARD_WIDTH}x${CARD_HEIGHT}.png`
      );
      setIsExporting(false);
      setExportMessage(cT.exportSuccess);
      setTimeout(() => setExportMessage(''), 3500);
    }, 100);
  };

  const handleDownloadBoth = () => {
    setIsExporting(true);
    setTimeout(() => {
      renderFrontCanvas();
      renderBackCanvas();

      const frontCanvas = frontCanvasRef.current;
      const backCanvas = backCanvasRef.current;
      if (!frontCanvas || !backCanvas) {
        setIsExporting(false);
        return;
      }

      const w = CARD_WIDTH;
      const h = CARD_HEIGHT;
      const dualCanvas = document.createElement('canvas');
      const ctx = dualCanvas.getContext('2d');

      // Stacked vertically with trim line for standard 3.5x2 cards
      dualCanvas.width = w + 80;
      dualCanvas.height = h * 2 + 140;

      ctx.fillStyle = '#0a0a0e';
      ctx.fillRect(0, 0, dualCanvas.width, dualCanvas.height);

      ctx.fillStyle = '#94A3B8';
      ctx.font = '700 16px "Outfit", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('MISSAFX // PRINT READY DUAL-SIDE PRESS CARD (300 DPI)', dualCanvas.width / 2, 35);

      ctx.drawImage(frontCanvas, 40, 55);

      ctx.strokeStyle = frameColor;
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 8]);
      ctx.beginPath();
      ctx.moveTo(40, h + 85);
      ctx.lineTo(w + 40, h + 85);
      ctx.stroke();

      ctx.fillStyle = frameColor;
      ctx.font = '600 12px "Outfit", monospace';
      ctx.fillText('--- LÍNEA DE CORTE / TRIM LINE ---', dualCanvas.width / 2, h + 89);

      ctx.drawImage(backCanvas, 40, h + 115);

      downloadCanvas(dualCanvas, `missafx-card-dual-sheet-${dualCanvas.width}x${dualCanvas.height}.png`);
      setIsExporting(false);
      setExportMessage(cT.exportSuccess);
      setTimeout(() => setExportMessage(''), 3500);
    }, 150);
  };

  const toggleFlip = () => {
    setIsFlipped(!isFlipped);
    setActiveSide(isFlipped ? 'front' : 'back');
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

  // Reusable helper for Inline Color Picker inside typography drawers
  const renderInlineColorPicker = (label, currentColor, setColor, defaultColors = ['#FF003C', '#53FC18', '#A855F7', '#00F0FF', '#EAB308', '#FFFFFF', '#CBD5E1']) => (
    <div style={{ marginTop: '4px' }}>
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

  // Reusable helper for Alignment Selector
  const renderAlignmentSelector = (currentAlign, setAlign) => (
    <div>
      <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
        {cT.alignmentLabel || 'Alineación'}:
      </span>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
        {[
          { id: 'left', label: 'Izquierda', icon: AlignLeft },
          { id: 'center', label: 'Centro', icon: AlignCenter },
          { id: 'right', label: 'Derecha', icon: AlignRight }
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

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#060608',
        color: '#F8FAFC',
        paddingBottom: '80px'
      }}
    >
      {/* Top Navbar */}
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
            <ArrowLeft size={16} color="#FF003C" />
            <span>{cT.backToHome}</span>
          </button>

          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              letterSpacing: '0.08em',
              padding: '4px 10px',
              borderRadius: '6px',
              background: 'rgba(255, 0, 60, 0.12)',
              color: '#FF003C',
              border: '1px solid rgba(255, 0, 60, 0.3)'
            }}
          >
            {cT.badge}
          </span>
        </div>
      </header>

      {/* Main Container */}
      <div className="container" style={{ marginTop: '36px' }}>
        {/* Hero Title */}
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

        {/* Wizard Step Tabs (6 Steps focused on Business Cards) */}
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
            { id: 1, label: cT.step1, icon: Type },
            { id: 2, label: cT.step2, icon: ImageIcon },
            { id: 3, label: cT.step3, icon: Palette },
            { id: 4, label: cT.step4, icon: QrCode },
            { id: 5, label: cT.step5, icon: Layers },
            { id: 6, label: cT.step6, icon: Download }
          ].map((step) => {
            const Icon = step.icon;
            const isActive = activeStep === step.id;
            return (
              <button
                key={step.id}
                onClick={() => {
                  setActiveStep(step.id);
                  if (step.id === 4) {
                    setIsFlipped(true);
                    setActiveSide('back');
                  } else if (step.id === 1 || step.id === 2 || step.id === 3) {
                    setIsFlipped(false);
                    setActiveSide('front');
                  }
                }}
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
                    ? hexToRgba(frameColor, 0.14)
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
          {/* LEFT COLUMN: Controls & Settings */}
          <div
            className="glass-panel"
            style={{
              padding: '28px',
              borderRadius: '20px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              background: 'rgba(12, 12, 16, 0.65)'
            }}
          >
            {/* STEP 1: Info & Text */}
            {activeStep === 1 && (
              <div>
                {/* Official standard size notification banner */}
                <div
                  style={{
                    padding: '14px 16px',
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '22px'
                  }}
                >
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '10px',
                      background: hexToRgba(frameColor, 0.15),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: frameColor
                    }}
                  >
                    <CreditCard size={20} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                      <strong style={{ fontSize: '0.86rem', color: '#fff' }}>
                        {cT.standardSizeBadge}
                      </strong>
                    </div>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)', margin: 0, lineHeight: 1.4 }}>
                      {cT.standardSizeHint}
                    </p>
                  </div>
                </div>

                <h3 className="font-display" style={{ fontSize: '1.25rem', marginBottom: '8px', color: '#fff' }}>
                  {cT.textTitle}
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '18px' }}>
                  Personaliza con control milimétrico todos los textos, tamaños, posiciones y colores de ambas caras.
                </p>

                {/* Sub-tabs: Frente / Reverso */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '8px',
                    padding: '4px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    marginBottom: '20px'
                  }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setTextSideTab('front');
                      setIsFlipped(false);
                      setActiveSide('front');
                    }}
                    style={{
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: textSideTab === 'front' ? `1px solid ${frameColor}` : 'none',
                      background: textSideTab === 'front' ? hexToRgba(frameColor, 0.2) : 'transparent',
                      color: textSideTab === 'front' ? '#fff' : 'var(--text-muted)',
                      fontSize: '0.84rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    🎴 {cT.tabFront || 'Cara Frontal (Frente)'}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setTextSideTab('back');
                      setIsFlipped(true);
                      setActiveSide('back');
                    }}
                    style={{
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: textSideTab === 'back' ? `1px solid ${frameColor}` : 'none',
                      background: textSideTab === 'back' ? hexToRgba(frameColor, 0.2) : 'transparent',
                      color: textSideTab === 'back' ? '#fff' : 'var(--text-muted)',
                      fontSize: '0.84rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    🔄 {cT.tabBack || 'Cara Trasera (Reverso)'}
                  </button>
                </div>

                {/* TAB 1: CARA FRONTAL */}
                {textSideTab === 'front' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {/* 1.1 Nombre Artístico */}
                    <div style={{ borderRadius: '12px', overflow: 'hidden', border: openDrawer === 'artist' ? `1px solid ${frameColor}` : '1px solid rgba(255, 255, 255, 0.08)' }}>
                      <div
                        onClick={() => setOpenDrawer(openDrawer === 'artist' ? null : 'artist')}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '12px 14px',
                          background: openDrawer === 'artist' ? 'rgba(255, 255, 255, 0.06)' : 'rgba(255, 255, 255, 0.02)',
                          cursor: 'pointer'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '0.86rem', fontWeight: 700, color: openDrawer === 'artist' ? '#fff' : 'var(--text-muted)' }}>
                            {cT.artistNameTitle || '1. Nombre Artístico / DJ'}
                          </span>
                          <span style={{ fontSize: '0.72rem', color: frameColor, fontFamily: 'monospace', fontWeight: 600 }}>
                            {artistNameSize}px • {artistNameAlign.toUpperCase()}
                          </span>
                        </div>
                        <ChevronDown size={15} color={openDrawer === 'artist' ? frameColor : 'var(--text-dim)'} style={{ transform: openDrawer === 'artist' ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                      </div>

                      {openDrawer === 'artist' && (
                        <div style={{ padding: '14px', background: 'rgba(0, 0, 0, 0.35)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          <div>
                            <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Texto del Nombre:</label>
                            <input
                              type="text"
                              value={artistName}
                              maxLength={120}
                              onChange={(e) => setArtistName(e.target.value)}
                              placeholder="MISSAFX"
                              style={{ width: '100%', padding: '10px 12px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: '#fff', fontSize: '0.88rem', outline: 'none' }}
                            />
                          </div>

                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                              <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{cT.fontSizeLabel || 'Tamaño de Fuente'}:</span>
                              <span style={{ fontSize: '0.76rem', color: '#fff', fontFamily: 'monospace', fontWeight: 700 }}>{artistNameSize} px</span>
                            </div>
                            <input type="range" min="32" max="130" step="1" value={artistNameSize} onChange={(e) => setArtistNameSize(parseInt(e.target.value))} style={{ width: '100%', accentColor: frameColor }} />
                          </div>

                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                              <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{cT.posYLabel || 'Posición Vertical (Y)'}:</span>
                              <span style={{ fontSize: '0.76rem', color: '#fff', fontFamily: 'monospace', fontWeight: 700 }}>{artistNameY > 0 ? `+${artistNameY}px (Bajar)` : artistNameY < 0 ? `${artistNameY}px (Subir)` : '0 px (Centro)'}</span>
                            </div>
                            <input type="range" min="-200" max="200" step="2" value={artistNameY} onChange={(e) => setArtistNameY(parseInt(e.target.value))} style={{ width: '100%', accentColor: frameColor }} />
                          </div>

                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                              <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{cT.posXLabel || 'Posición Horizontal (X)'}:</span>
                              <span style={{ fontSize: '0.76rem', color: '#fff', fontFamily: 'monospace', fontWeight: 700 }}>{artistNameX > 0 ? `+${artistNameX}px (Der)` : artistNameX < 0 ? `${artistNameX}px (Izq)` : '0 px (Centro)'}</span>
                            </div>
                            <input type="range" min="-350" max="350" step="2" value={artistNameX} onChange={(e) => setArtistNameX(parseInt(e.target.value))} style={{ width: '100%', accentColor: frameColor }} />
                          </div>

                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                              <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{cT.trackingLabel || 'Espaciado (Tracking)'}:</span>
                              <span style={{ fontSize: '0.76rem', color: '#fff', fontFamily: 'monospace', fontWeight: 700 }}>{artistNameTracking} px</span>
                            </div>
                            <input type="range" min="-4" max="16" step="1" value={artistNameTracking} onChange={(e) => setArtistNameTracking(parseInt(e.target.value))} style={{ width: '100%', accentColor: frameColor }} />
                          </div>

                          {renderAlignmentSelector(artistNameAlign, setArtistNameAlign)}

                          <button
                            type="button"
                            onClick={() => setArtistNameUppercase(!artistNameUppercase)}
                            style={{ padding: '8px 12px', borderRadius: '8px', border: artistNameUppercase ? `1px solid ${frameColor}` : '1px solid rgba(255, 255, 255, 0.1)', background: artistNameUppercase ? hexToRgba(frameColor, 0.2) : 'rgba(255, 255, 255, 0.04)', color: artistNameUppercase ? '#fff' : 'var(--text-muted)', fontSize: '0.76rem', fontWeight: 600, cursor: 'pointer' }}
                          >
                            MAYÚSCULAS: {artistNameUppercase ? 'ACTIVADAS (ON)' : 'DESACTIVADAS (OFF)'}
                          </button>

                          {renderInlineColorPicker(cT.colorTitle || 'Color Título (MISSA)', titleColor, setTitleColor)}
                          {renderInlineColorPicker(cT.colorTitleFx || 'Color Sufijo (FX)', titleFxColor, setTitleFxColor)}

                          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
                            <button
                              type="button"
                              onClick={() => {
                                setArtistNameSize(88);
                                setArtistNameY(0);
                                setArtistNameX(0);
                                setArtistNameTracking(0);
                                setArtistNameAlign('center');
                                setArtistNameUppercase(true);
                              }}
                              style={{ background: 'transparent', border: 'none', color: frameColor, fontSize: '0.74rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                            >
                              <RotateCcw size={11} />
                              <span>{cT.resetBtn || 'Restablecer'}</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* 1.2 Insignia Superior Frontal */}
                    <div style={{ borderRadius: '12px', overflow: 'hidden', border: openDrawer === 'frontBadge' ? `1px solid ${frameColor}` : '1px solid rgba(255, 255, 255, 0.08)' }}>
                      <div
                        onClick={() => setOpenDrawer(openDrawer === 'frontBadge' ? null : 'frontBadge')}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '12px 14px',
                          background: openDrawer === 'frontBadge' ? 'rgba(255, 255, 255, 0.06)' : 'rgba(255, 255, 255, 0.02)',
                          cursor: 'pointer'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '0.86rem', fontWeight: 700, color: openDrawer === 'frontBadge' ? '#fff' : 'var(--text-muted)' }}>
                            {cT.frontBadgeTitle || '2. Insignia / Badge Superior'}
                          </span>
                          <span style={{ fontSize: '0.72rem', color: frameColor, fontFamily: 'monospace', fontWeight: 600 }}>
                            {frontBadgeSize}px
                          </span>
                        </div>
                        <ChevronDown size={15} color={openDrawer === 'frontBadge' ? frameColor : 'var(--text-dim)'} style={{ transform: openDrawer === 'frontBadge' ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                      </div>

                      {openDrawer === 'frontBadge' && (
                        <div style={{ padding: '14px', background: 'rgba(0, 0, 0, 0.35)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          <div>
                            <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Texto de la Insignia:</label>
                            <input
                              type="text"
                              value={frontBadgeText}
                              maxLength={120}
                              onChange={(e) => setFrontBadgeText(e.target.value)}
                              placeholder="OFFICIAL DJ PRESS CARD // PIONEER PRO DJ"
                              style={{ width: '100%', padding: '10px 12px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: '#fff', fontSize: '0.88rem', outline: 'none' }}
                            />
                          </div>

                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                              <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{cT.fontSizeLabel || 'Tamaño de Fuente'}:</span>
                              <span style={{ fontSize: '0.76rem', color: '#fff', fontFamily: 'monospace', fontWeight: 700 }}>{frontBadgeSize} px</span>
                            </div>
                            <input type="range" min="8" max="26" step="1" value={frontBadgeSize} onChange={(e) => setFrontBadgeSize(parseInt(e.target.value))} style={{ width: '100%', accentColor: frameColor }} />
                          </div>

                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                              <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{cT.posYLabel || 'Posición Vertical (Y)'}:</span>
                              <span style={{ fontSize: '0.76rem', color: '#fff', fontFamily: 'monospace', fontWeight: 700 }}>{frontBadgeY > 0 ? `+${frontBadgeY}px` : frontBadgeY < 0 ? `${frontBadgeY}px` : '0 px'}</span>
                            </div>
                            <input type="range" min="-150" max="150" step="2" value={frontBadgeY} onChange={(e) => setFrontBadgeY(parseInt(e.target.value))} style={{ width: '100%', accentColor: frameColor }} />
                          </div>

                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                              <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{cT.posXLabel || 'Posición Horizontal (X)'}:</span>
                              <span style={{ fontSize: '0.76rem', color: '#fff', fontFamily: 'monospace', fontWeight: 700 }}>{frontBadgeX > 0 ? `+${frontBadgeX}px` : frontBadgeX < 0 ? `${frontBadgeX}px` : '0 px'}</span>
                            </div>
                            <input type="range" min="-300" max="300" step="2" value={frontBadgeX} onChange={(e) => setFrontBadgeX(parseInt(e.target.value))} style={{ width: '100%', accentColor: frameColor }} />
                          </div>

                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                              <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{cT.trackingLabel || 'Espaciado'}:</span>
                              <span style={{ fontSize: '0.76rem', color: '#fff', fontFamily: 'monospace', fontWeight: 700 }}>{frontBadgeTracking} px</span>
                            </div>
                            <input type="range" min="0" max="8" step="1" value={frontBadgeTracking} onChange={(e) => setFrontBadgeTracking(parseInt(e.target.value))} style={{ width: '100%', accentColor: frameColor }} />
                          </div>

                          {renderInlineColorPicker('Color del Borde & Punto', frontBadgeBorderColor || frameColor, setFrontBadgeBorderColor)}
                          {renderInlineColorPicker('Color del Texto', frontBadgeTextColor, setFrontBadgeTextColor)}

                          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
                            <button
                              type="button"
                              onClick={() => {
                                setFrontBadgeSize(12);
                                setFrontBadgeY(0);
                                setFrontBadgeX(0);
                                setFrontBadgeTracking(1);
                                setFrontBadgeBorderColor('');
                                setFrontBadgeTextColor('#FFFFFF');
                              }}
                              style={{ background: 'transparent', border: 'none', color: frameColor, fontSize: '0.74rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                            >
                              <RotateCcw size={11} />
                              <span>{cT.resetBtn || 'Restablecer'}</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* 1.3 Rol / Género Musical */}
                    <div style={{ borderRadius: '12px', overflow: 'hidden', border: openDrawer === 'roleGenre' ? `1px solid ${frameColor}` : '1px solid rgba(255, 255, 255, 0.08)' }}>
                      <div
                        onClick={() => setOpenDrawer(openDrawer === 'roleGenre' ? null : 'roleGenre')}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '12px 14px',
                          background: openDrawer === 'roleGenre' ? 'rgba(255, 255, 255, 0.06)' : 'rgba(255, 255, 255, 0.02)',
                          cursor: 'pointer'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '0.86rem', fontWeight: 700, color: openDrawer === 'roleGenre' ? '#fff' : 'var(--text-muted)' }}>
                            {cT.roleGenreTitle || '3. Píldora de Rol / Género'}
                          </span>
                          <span style={{ fontSize: '0.72rem', color: frameColor, fontFamily: 'monospace', fontWeight: 600 }}>
                            {roleGenreSize}px
                          </span>
                        </div>
                        <ChevronDown size={15} color={openDrawer === 'roleGenre' ? frameColor : 'var(--text-dim)'} style={{ transform: openDrawer === 'roleGenre' ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                      </div>

                      {openDrawer === 'roleGenre' && (
                        <div style={{ padding: '14px', background: 'rgba(0, 0, 0, 0.35)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          <div>
                            <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Texto del Rol / Género:</label>
                            <input
                              type="text"
                              value={roleGenre}
                              maxLength={120}
                              onChange={(e) => setRoleGenre(e.target.value)}
                              placeholder="DJ & TECH HOUSE PRODUCER"
                              style={{ width: '100%', padding: '10px 12px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: '#fff', fontSize: '0.88rem', outline: 'none' }}
                            />
                          </div>

                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                              <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{cT.fontSizeLabel || 'Tamaño de Fuente'}:</span>
                              <span style={{ fontSize: '0.76rem', color: '#fff', fontFamily: 'monospace', fontWeight: 700 }}>{roleGenreSize} px</span>
                            </div>
                            <input type="range" min="10" max="32" step="1" value={roleGenreSize} onChange={(e) => setRoleGenreSize(parseInt(e.target.value))} style={{ width: '100%', accentColor: frameColor }} />
                          </div>

                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                              <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{cT.posYLabel || 'Posición Vertical (Y)'}:</span>
                              <span style={{ fontSize: '0.76rem', color: '#fff', fontFamily: 'monospace', fontWeight: 700 }}>{roleGenreY > 0 ? `+${roleGenreY}px` : roleGenreY < 0 ? `${roleGenreY}px` : '0 px'}</span>
                            </div>
                            <input type="range" min="-150" max="150" step="2" value={roleGenreY} onChange={(e) => setRoleGenreY(parseInt(e.target.value))} style={{ width: '100%', accentColor: frameColor }} />
                          </div>

                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                              <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{cT.posXLabel || 'Posición Horizontal (X)'}:</span>
                              <span style={{ fontSize: '0.76rem', color: '#fff', fontFamily: 'monospace', fontWeight: 700 }}>{roleGenreX > 0 ? `+${roleGenreX}px` : roleGenreX < 0 ? `${roleGenreX}px` : '0 px'}</span>
                            </div>
                            <input type="range" min="-300" max="300" step="2" value={roleGenreX} onChange={(e) => setRoleGenreX(parseInt(e.target.value))} style={{ width: '100%', accentColor: frameColor }} />
                          </div>

                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                              <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{cT.trackingLabel || 'Espaciado'}:</span>
                              <span style={{ fontSize: '0.76rem', color: '#fff', fontFamily: 'monospace', fontWeight: 700 }}>{roleGenreTracking} px</span>
                            </div>
                            <input type="range" min="0" max="10" step="1" value={roleGenreTracking} onChange={(e) => setRoleGenreTracking(parseInt(e.target.value))} style={{ width: '100%', accentColor: frameColor }} />
                          </div>

                          <button
                            type="button"
                            onClick={() => setRoleGenreUppercase(!roleGenreUppercase)}
                            style={{ padding: '8px 12px', borderRadius: '8px', border: roleGenreUppercase ? `1px solid ${frameColor}` : '1px solid rgba(255, 255, 255, 0.1)', background: roleGenreUppercase ? hexToRgba(frameColor, 0.2) : 'rgba(255, 255, 255, 0.04)', color: roleGenreUppercase ? '#fff' : 'var(--text-muted)', fontSize: '0.76rem', fontWeight: 600, cursor: 'pointer' }}
                          >
                            MAYÚSCULAS: {roleGenreUppercase ? 'ACTIVADAS (ON)' : 'DESACTIVADAS (OFF)'}
                          </button>

                          {renderInlineColorPicker('Color Fondo de la Píldora', roleGenreBgColor || badgeColor, setRoleGenreBgColor)}
                          {renderInlineColorPicker('Color Texto de la Píldora', roleGenreTextColor || badgeTextColor, setRoleGenreTextColor)}

                          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
                            <button
                              type="button"
                              onClick={() => {
                                setRoleGenreSize(16);
                                setRoleGenreY(0);
                                setRoleGenreX(0);
                                setRoleGenreTracking(2);
                                setRoleGenreBgColor('');
                                setRoleGenreTextColor('');
                                setRoleGenreUppercase(true);
                              }}
                              style={{ background: 'transparent', border: 'none', color: frameColor, fontSize: '0.74rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                            >
                              <RotateCcw size={11} />
                              <span>{cT.resetBtn || 'Restablecer'}</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* 1.4 Nombre Real */}
                    <div style={{ borderRadius: '12px', overflow: 'hidden', border: openDrawer === 'realName' ? `1px solid ${frameColor}` : '1px solid rgba(255, 255, 255, 0.08)' }}>
                      <div
                        onClick={() => setOpenDrawer(openDrawer === 'realName' ? null : 'realName')}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '12px 14px',
                          background: openDrawer === 'realName' ? 'rgba(255, 255, 255, 0.06)' : 'rgba(255, 255, 255, 0.02)',
                          cursor: 'pointer'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '0.86rem', fontWeight: 700, color: openDrawer === 'realName' ? '#fff' : 'var(--text-muted)' }}>
                            {cT.realNameTitle || '4. Nombre Real'}
                          </span>
                          <span style={{ fontSize: '0.72rem', color: frameColor, fontFamily: 'monospace', fontWeight: 600 }}>
                            {realNameSize}px
                          </span>
                        </div>
                        <ChevronDown size={15} color={openDrawer === 'realName' ? frameColor : 'var(--text-dim)'} style={{ transform: openDrawer === 'realName' ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                      </div>

                      {openDrawer === 'realName' && (
                        <div style={{ padding: '14px', background: 'rgba(0, 0, 0, 0.35)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          <div>
                            <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Nombre:</label>
                            <input
                              type="text"
                              value={realName}
                              maxLength={120}
                              onChange={(e) => setRealName(e.target.value)}
                              placeholder="Missael G."
                              style={{ width: '100%', padding: '10px 12px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: '#fff', fontSize: '0.88rem', outline: 'none' }}
                            />
                          </div>

                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                              <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{cT.fontSizeLabel || 'Tamaño de Fuente'}:</span>
                              <span style={{ fontSize: '0.76rem', color: '#fff', fontFamily: 'monospace', fontWeight: 700 }}>{realNameSize} px</span>
                            </div>
                            <input type="range" min="10" max="30" step="1" value={realNameSize} onChange={(e) => setRealNameSize(parseInt(e.target.value))} style={{ width: '100%', accentColor: frameColor }} />
                          </div>

                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                              <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{cT.posYLabel || 'Posición Vertical (Y)'}:</span>
                              <span style={{ fontSize: '0.76rem', color: '#fff', fontFamily: 'monospace', fontWeight: 700 }}>{realNameY > 0 ? `+${realNameY}px` : realNameY < 0 ? `${realNameY}px` : '0 px'}</span>
                            </div>
                            <input type="range" min="-150" max="150" step="2" value={realNameY} onChange={(e) => setRealNameY(parseInt(e.target.value))} style={{ width: '100%', accentColor: frameColor }} />
                          </div>

                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                              <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{cT.posXLabel || 'Posición Horizontal (X)'}:</span>
                              <span style={{ fontSize: '0.76rem', color: '#fff', fontFamily: 'monospace', fontWeight: 700 }}>{realNameX > 0 ? `+${realNameX}px` : realNameX < 0 ? `${realNameX}px` : '0 px'}</span>
                            </div>
                            <input type="range" min="-300" max="300" step="2" value={realNameX} onChange={(e) => setRealNameX(parseInt(e.target.value))} style={{ width: '100%', accentColor: frameColor }} />
                          </div>

                          {renderAlignmentSelector(realNameAlign, setRealNameAlign)}
                          {renderInlineColorPicker('Color de Texto', realNameColor || textColor, setRealNameColor)}

                          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
                            <button
                              type="button"
                              onClick={() => {
                                setRealNameSize(15);
                                setRealNameY(0);
                                setRealNameX(0);
                                setRealNameTracking(0);
                                setRealNameColor('');
                                setRealNameAlign('center');
                              }}
                              style={{ background: 'transparent', border: 'none', color: frameColor, fontSize: '0.74rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                            >
                              <RotateCcw size={11} />
                              <span>{cT.resetBtn || 'Restablecer'}</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* 1.5 Ciudad & Subtexto */}
                    <div style={{ borderRadius: '12px', overflow: 'hidden', border: openDrawer === 'cityLocation' ? `1px solid ${frameColor}` : '1px solid rgba(255, 255, 255, 0.08)' }}>
                      <div
                        onClick={() => setOpenDrawer(openDrawer === 'cityLocation' ? null : 'cityLocation')}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '12px 14px',
                          background: openDrawer === 'cityLocation' ? 'rgba(255, 255, 255, 0.06)' : 'rgba(255, 255, 255, 0.02)',
                          cursor: 'pointer'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '0.86rem', fontWeight: 700, color: openDrawer === 'cityLocation' ? '#fff' : 'var(--text-muted)' }}>
                            {cT.cityLocationTitle || '5. Ciudad & Subtexto'}
                          </span>
                          <span style={{ fontSize: '0.72rem', color: frameColor, fontFamily: 'monospace', fontWeight: 600 }}>
                            {citySize}px
                          </span>
                        </div>
                        <ChevronDown size={15} color={openDrawer === 'cityLocation' ? frameColor : 'var(--text-dim)'} style={{ transform: openDrawer === 'cityLocation' ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                      </div>

                      {openDrawer === 'cityLocation' && (
                        <div style={{ padding: '14px', background: 'rgba(0, 0, 0, 0.35)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          <div>
                            <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Ciudad / Ubicación:</label>
                            <input
                              type="text"
                              value={cityLocation}
                              maxLength={120}
                              onChange={(e) => setCityLocation(e.target.value)}
                              placeholder="San Luis Potosí, México"
                              style={{ width: '100%', padding: '10px 12px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: '#fff', fontSize: '0.88rem', outline: 'none' }}
                            />
                          </div>

                          <div>
                            <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>{cT.locationSubtextLabel || 'Subtexto de Ubicación'}:</label>
                            <input
                              type="text"
                              value={locationSubtext}
                              maxLength={120}
                              onChange={(e) => setLocationSubtext(e.target.value)}
                              placeholder="DIRECT BOOKING & TOURS"
                              style={{ width: '100%', padding: '10px 12px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: '#fff', fontSize: '0.88rem', outline: 'none' }}
                            />
                          </div>

                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                              <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{cT.fontSizeLabel || 'Tamaño de Fuente'}:</span>
                              <span style={{ fontSize: '0.76rem', color: '#fff', fontFamily: 'monospace', fontWeight: 700 }}>{citySize} px</span>
                            </div>
                            <input type="range" min="9" max="24" step="1" value={citySize} onChange={(e) => setCitySize(parseInt(e.target.value))} style={{ width: '100%', accentColor: frameColor }} />
                          </div>

                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                              <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{cT.posYLabel || 'Posición Vertical (Y)'}:</span>
                              <span style={{ fontSize: '0.76rem', color: '#fff', fontFamily: 'monospace', fontWeight: 700 }}>{cityY > 0 ? `+${cityY}px` : cityY < 0 ? `${cityY}px` : '0 px'}</span>
                            </div>
                            <input type="range" min="-150" max="150" step="2" value={cityY} onChange={(e) => setCityY(parseInt(e.target.value))} style={{ width: '100%', accentColor: frameColor }} />
                          </div>

                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                              <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{cT.posXLabel || 'Posición Horizontal (X)'}:</span>
                              <span style={{ fontSize: '0.76rem', color: '#fff', fontFamily: 'monospace', fontWeight: 700 }}>{cityX > 0 ? `+${cityX}px` : cityX < 0 ? `${cityX}px` : '0 px'}</span>
                            </div>
                            <input type="range" min="-300" max="300" step="2" value={cityX} onChange={(e) => setCityX(parseInt(e.target.value))} style={{ width: '100%', accentColor: frameColor }} />
                          </div>

                          {renderInlineColorPicker('Color de Texto', cityColor || textColor, setCityColor)}

                          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
                            <button
                              type="button"
                              onClick={() => {
                                setCitySize(13);
                                setCityY(0);
                                setCityX(0);
                                setCityColor('');
                              }}
                              style={{ background: 'transparent', border: 'none', color: frameColor, fontSize: '0.74rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                            >
                              <RotateCcw size={11} />
                              <span>{cT.resetBtn || 'Restablecer'}</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* 1.6 Coordenadas Técnicas & Audio HUD */}
                    <div style={{ borderRadius: '12px', overflow: 'hidden', border: openDrawer === 'frontHud' ? `1px solid ${frameColor}` : '1px solid rgba(255, 255, 255, 0.08)' }}>
                      <div
                        onClick={() => setOpenDrawer(openDrawer === 'frontHud' ? null : 'frontHud')}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '12px 14px',
                          background: openDrawer === 'frontHud' ? 'rgba(255, 255, 255, 0.06)' : 'rgba(255, 255, 255, 0.02)',
                          cursor: 'pointer'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '0.86rem', fontWeight: 700, color: openDrawer === 'frontHud' ? '#fff' : 'var(--text-muted)' }}>
                            {cT.hudTechnicalTitle || '6. Coordenadas HUD & Audio'}
                          </span>
                          <span style={{ fontSize: '0.72rem', color: frameColor, fontFamily: 'monospace', fontWeight: 600 }}>
                            {frontHudSize}px
                          </span>
                        </div>
                        <ChevronDown size={15} color={openDrawer === 'frontHud' ? frameColor : 'var(--text-dim)'} style={{ transform: openDrawer === 'frontHud' ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                      </div>

                      {openDrawer === 'frontHud' && (
                        <div style={{ padding: '14px', background: 'rgba(0, 0, 0, 0.35)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          <div>
                            <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>{cT.audioSpecLabel || 'Especificación de Audio (Izquierda)'}:</label>
                            <input
                              type="text"
                              value={frontAudioSpec}
                              maxLength={120}
                              onChange={(e) => setFrontAudioSpec(e.target.value)}
                              placeholder="[ PRO DJ LINK • 48kHz MASTER ]"
                              style={{ width: '100%', padding: '10px 12px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: '#fff', fontSize: '0.88rem', outline: 'none' }}
                            />
                          </div>

                          <div>
                            <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>{cT.gpsCoordsLabel || 'Coordenadas GPS (Derecha)'}:</label>
                            <input
                              type="text"
                              value={frontGpsCoords}
                              maxLength={120}
                              onChange={(e) => setFrontGpsCoords(e.target.value)}
                              placeholder="[ 22° 09' N // 100° 58' W ]"
                              style={{ width: '100%', padding: '10px 12px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: '#fff', fontSize: '0.88rem', outline: 'none' }}
                            />
                          </div>

                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                              <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{cT.fontSizeLabel || 'Tamaño de Fuente'}:</span>
                              <span style={{ fontSize: '0.76rem', color: '#fff', fontFamily: 'monospace', fontWeight: 700 }}>{frontHudSize} px</span>
                            </div>
                            <input type="range" min="8" max="20" step="1" value={frontHudSize} onChange={(e) => setFrontHudSize(parseInt(e.target.value))} style={{ width: '100%', accentColor: frameColor }} />
                          </div>

                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                              <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{cT.posYLabel || 'Posición Vertical (Y)'}:</span>
                              <span style={{ fontSize: '0.76rem', color: '#fff', fontFamily: 'monospace', fontWeight: 700 }}>{frontHudY > 0 ? `+${frontHudY}px` : frontHudY < 0 ? `${frontHudY}px` : '0 px'}</span>
                            </div>
                            <input type="range" min="-60" max="60" step="2" value={frontHudY} onChange={(e) => setFrontHudY(parseInt(e.target.value))} style={{ width: '100%', accentColor: frameColor }} />
                          </div>

                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                              <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{cT.posXLabel || 'Posición Horizontal (X)'}:</span>
                              <span style={{ fontSize: '0.76rem', color: '#fff', fontFamily: 'monospace', fontWeight: 700 }}>{frontHudX > 0 ? `+${frontHudX}px` : frontHudX < 0 ? `${frontHudX}px` : '0 px'}</span>
                            </div>
                            <input type="range" min="-150" max="150" step="2" value={frontHudX} onChange={(e) => setFrontHudX(parseInt(e.target.value))} style={{ width: '100%', accentColor: frameColor }} />
                          </div>

                          {renderInlineColorPicker('Color de HUD', frontHudColor, setFrontHudColor)}

                          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
                            <button
                              type="button"
                              onClick={() => {
                                setFrontHudSize(12);
                                setFrontHudY(0);
                                setFrontHudX(0);
                                setFrontHudColor('#64748B');
                              }}
                              style={{ background: 'transparent', border: 'none', color: frameColor, fontSize: '0.74rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                            >
                              <RotateCcw size={11} />
                              <span>{cT.resetBtn || 'Restablecer'}</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* 1.7 Mini Ecualizador Gráfico */}
                    <div style={{ borderRadius: '12px', overflow: 'hidden', border: openDrawer === 'frontEq' ? `1px solid ${frameColor}` : '1px solid rgba(255, 255, 255, 0.08)' }}>
                      <div
                        onClick={() => setOpenDrawer(openDrawer === 'frontEq' ? null : 'frontEq')}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '12px 14px',
                          background: openDrawer === 'frontEq' ? 'rgba(255, 255, 255, 0.06)' : 'rgba(255, 255, 255, 0.02)',
                          cursor: 'pointer'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '0.86rem', fontWeight: 700, color: openDrawer === 'frontEq' ? '#fff' : 'var(--text-muted)' }}>
                            {cT.eqBarsTitle || '7. Mini Ecualizador Gráfico (EQ)'}
                          </span>
                          <span style={{ fontSize: '0.72rem', color: frameColor, fontFamily: 'monospace', fontWeight: 600 }}>
                            {frontEqScale.toFixed(2)}x
                          </span>
                        </div>
                        <ChevronDown size={15} color={openDrawer === 'frontEq' ? frameColor : 'var(--text-dim)'} style={{ transform: openDrawer === 'frontEq' ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                      </div>

                      {openDrawer === 'frontEq' && (
                        <div style={{ padding: '14px', background: 'rgba(0, 0, 0, 0.35)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                              <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{cT.eqScaleLabel || 'Escala de Tamaño'}:</span>
                              <span style={{ fontSize: '0.76rem', color: '#fff', fontFamily: 'monospace', fontWeight: 700 }}>{frontEqScale.toFixed(2)}x</span>
                            </div>
                            <input type="range" min="0.5" max="2.5" step="0.05" value={frontEqScale} onChange={(e) => setFrontEqScale(parseFloat(e.target.value))} style={{ width: '100%', accentColor: frameColor }} />
                          </div>

                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                              <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{cT.posYLabel || 'Posición Vertical (Y)'}:</span>
                              <span style={{ fontSize: '0.76rem', color: '#fff', fontFamily: 'monospace', fontWeight: 700 }}>{frontEqY > 0 ? `+${frontEqY}px` : frontEqY < 0 ? `${frontEqY}px` : '0 px'}</span>
                            </div>
                            <input type="range" min="-100" max="100" step="2" value={frontEqY} onChange={(e) => setFrontEqY(parseInt(e.target.value))} style={{ width: '100%', accentColor: frameColor }} />
                          </div>

                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                              <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{cT.posXLabel || 'Posición Horizontal (X)'}:</span>
                              <span style={{ fontSize: '0.76rem', color: '#fff', fontFamily: 'monospace', fontWeight: 700 }}>{frontEqX > 0 ? `+${frontEqX}px` : frontEqX < 0 ? `${frontEqX}px` : '0 px'}</span>
                            </div>
                            <input type="range" min="-300" max="300" step="2" value={frontEqX} onChange={(e) => setFrontEqX(parseInt(e.target.value))} style={{ width: '100%', accentColor: frameColor }} />
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
                            <button
                              type="button"
                              onClick={() => {
                                setFrontEqScale(1.0);
                                setFrontEqY(0);
                                setFrontEqX(0);
                              }}
                              style={{ background: 'transparent', border: 'none', color: frameColor, fontSize: '0.74rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                            >
                              <RotateCcw size={11} />
                              <span>{cT.resetBtn || 'Restablecer'}</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* TAB 2: CARA TRASERA */}
                {textSideTab === 'back' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {/* 2.1 Encabezado / Logotipo */}
                    <div style={{ borderRadius: '12px', overflow: 'hidden', border: openDrawer === 'backHeader' ? `1px solid ${frameColor}` : '1px solid rgba(255, 255, 255, 0.08)' }}>
                      <div
                        onClick={() => setOpenDrawer(openDrawer === 'backHeader' ? null : 'backHeader')}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '12px 14px',
                          background: openDrawer === 'backHeader' ? 'rgba(255, 255, 255, 0.06)' : 'rgba(255, 255, 255, 0.02)',
                          cursor: 'pointer'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '0.86rem', fontWeight: 700, color: openDrawer === 'backHeader' ? '#fff' : 'var(--text-muted)' }}>
                            {cT.backHeaderTitle || '1. Encabezado / Logotipo Trasero'}
                          </span>
                          <span style={{ fontSize: '0.72rem', color: frameColor, fontFamily: 'monospace', fontWeight: 600 }}>
                            {backHeaderSize}px
                          </span>
                        </div>
                        <ChevronDown size={15} color={openDrawer === 'backHeader' ? frameColor : 'var(--text-dim)'} style={{ transform: openDrawer === 'backHeader' ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                      </div>

                      {openDrawer === 'backHeader' && (
                        <div style={{ padding: '14px', background: 'rgba(0, 0, 0, 0.35)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          <div>
                            <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Logotipo Trasero:</label>
                            <input
                              type="text"
                              value={backLogoText}
                              maxLength={120}
                              onChange={(e) => setBackLogoText(e.target.value)}
                              placeholder="MISSAFX"
                              style={{ width: '100%', padding: '10px 12px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: '#fff', fontSize: '0.88rem', outline: 'none' }}
                            />
                          </div>

                          <div>
                            <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>{cT.backSubtitleLabel || 'Subtítulo de Logotipo'}:</label>
                            <input
                              type="text"
                              value={backSubtitle}
                              maxLength={120}
                              onChange={(e) => setBackSubtitle(e.target.value)}
                              placeholder="DIRECT BOOKING & PRESS KIT"
                              style={{ width: '100%', padding: '10px 12px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: '#fff', fontSize: '0.88rem', outline: 'none' }}
                            />
                          </div>

                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                              <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{cT.fontSizeLabel || 'Tamaño de Fuente'}:</span>
                              <span style={{ fontSize: '0.76rem', color: '#fff', fontFamily: 'monospace', fontWeight: 700 }}>{backHeaderSize} px</span>
                            </div>
                            <input type="range" min="18" max="60" step="1" value={backHeaderSize} onChange={(e) => setBackHeaderSize(parseInt(e.target.value))} style={{ width: '100%', accentColor: frameColor }} />
                          </div>

                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                              <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{cT.posYLabel || 'Posición Vertical (Y)'}:</span>
                              <span style={{ fontSize: '0.76rem', color: '#fff', fontFamily: 'monospace', fontWeight: 700 }}>{backHeaderY > 0 ? `+${backHeaderY}px` : backHeaderY < 0 ? `${backHeaderY}px` : '0 px'}</span>
                            </div>
                            <input type="range" min="-120" max="120" step="2" value={backHeaderY} onChange={(e) => setBackHeaderY(parseInt(e.target.value))} style={{ width: '100%', accentColor: frameColor }} />
                          </div>

                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                              <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{cT.posXLabel || 'Posición Horizontal (X)'}:</span>
                              <span style={{ fontSize: '0.76rem', color: '#fff', fontFamily: 'monospace', fontWeight: 700 }}>{backHeaderX > 0 ? `+${backHeaderX}px` : backHeaderX < 0 ? `${backHeaderX}px` : '0 px'}</span>
                            </div>
                            <input type="range" min="-200" max="200" step="2" value={backHeaderX} onChange={(e) => setBackHeaderX(parseInt(e.target.value))} style={{ width: '100%', accentColor: frameColor }} />
                          </div>

                          {renderInlineColorPicker('Color del Logotipo', backHeaderColor || titleColor, setBackHeaderColor)}

                          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
                            <button
                              type="button"
                              onClick={() => {
                                setBackHeaderSize(32);
                                setBackHeaderY(0);
                                setBackHeaderX(0);
                                setBackHeaderColor('');
                              }}
                              style={{ background: 'transparent', border: 'none', color: frameColor, fontSize: '0.74rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                            >
                              <RotateCcw size={11} />
                              <span>{cT.resetBtn || 'Restablecer'}</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* 2.2 Bloque de Contacto */}
                    <div style={{ borderRadius: '12px', overflow: 'hidden', border: openDrawer === 'backContact' ? `1px solid ${frameColor}` : '1px solid rgba(255, 255, 255, 0.08)' }}>
                      <div
                        onClick={() => setOpenDrawer(openDrawer === 'backContact' ? null : 'backContact')}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '12px 14px',
                          background: openDrawer === 'backContact' ? 'rgba(255, 255, 255, 0.06)' : 'rgba(255, 255, 255, 0.02)',
                          cursor: 'pointer'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '0.86rem', fontWeight: 700, color: openDrawer === 'backContact' ? '#fff' : 'var(--text-muted)' }}>
                            {cT.backContactTitle || '2. Contacto (WhatsApp, Ciudad, Tagline)'}
                          </span>
                          <span style={{ fontSize: '0.72rem', color: frameColor, fontFamily: 'monospace', fontWeight: 600 }}>
                            {backContactSize}px
                          </span>
                        </div>
                        <ChevronDown size={15} color={openDrawer === 'backContact' ? frameColor : 'var(--text-dim)'} style={{ transform: openDrawer === 'backContact' ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                      </div>

                      {openDrawer === 'backContact' && (
                        <div style={{ padding: '14px', background: 'rgba(0, 0, 0, 0.35)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          <div>
                            <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>WhatsApp / Teléfono:</label>
                            <input
                              type="text"
                              value={phoneWhatsapp}
                              maxLength={120}
                              onChange={(e) => setPhoneWhatsapp(e.target.value)}
                              placeholder="+52 1 444 357 0777"
                              style={{ width: '100%', padding: '10px 12px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: '#fff', fontSize: '0.88rem', outline: 'none' }}
                            />
                          </div>

                          <div>
                            <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Ciudad / Ubicación:</label>
                            <input
                              type="text"
                              value={cityLocation}
                              maxLength={120}
                              onChange={(e) => setCityLocation(e.target.value)}
                              placeholder="San Luis Potosí, México"
                              style={{ width: '100%', padding: '10px 12px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: '#fff', fontSize: '0.88rem', outline: 'none' }}
                            />
                          </div>

                          <div>
                            <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Tagline / Concepto:</label>
                            <input
                              type="text"
                              value={tagline}
                              maxLength={120}
                              onChange={(e) => setTagline(e.target.value)}
                              placeholder="Tech House • Club Dates • Festivals"
                              style={{ width: '100%', padding: '10px 12px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: '#fff', fontSize: '0.88rem', outline: 'none' }}
                            />
                          </div>

                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                              <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{cT.fontSizeLabel || 'Tamaño de Fuente'}:</span>
                              <span style={{ fontSize: '0.76rem', color: '#fff', fontFamily: 'monospace', fontWeight: 700 }}>{backContactSize} px</span>
                            </div>
                            <input type="range" min="10" max="24" step="1" value={backContactSize} onChange={(e) => setBackContactSize(parseInt(e.target.value))} style={{ width: '100%', accentColor: frameColor }} />
                          </div>

                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                              <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{cT.posYLabel || 'Posición Vertical (Y)'}:</span>
                              <span style={{ fontSize: '0.76rem', color: '#fff', fontFamily: 'monospace', fontWeight: 700 }}>{backContactY > 0 ? `+${backContactY}px` : backContactY < 0 ? `${backContactY}px` : '0 px'}</span>
                            </div>
                            <input type="range" min="-120" max="120" step="2" value={backContactY} onChange={(e) => setBackContactY(parseInt(e.target.value))} style={{ width: '100%', accentColor: frameColor }} />
                          </div>

                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                              <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{cT.posXLabel || 'Posición Horizontal (X)'}:</span>
                              <span style={{ fontSize: '0.76rem', color: '#fff', fontFamily: 'monospace', fontWeight: 700 }}>{backContactX > 0 ? `+${backContactX}px` : backContactX < 0 ? `${backContactX}px` : '0 px'}</span>
                            </div>
                            <input type="range" min="-200" max="200" step="2" value={backContactX} onChange={(e) => setBackContactX(parseInt(e.target.value))} style={{ width: '100%', accentColor: frameColor }} />
                          </div>

                          {renderInlineColorPicker('Color de Contacto', backContactColor || textColor, setBackContactColor)}

                          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
                            <button
                              type="button"
                              onClick={() => {
                                setBackContactSize(15);
                                setBackContactY(0);
                                setBackContactX(0);
                                setBackContactColor('');
                              }}
                              style={{ background: 'transparent', border: 'none', color: frameColor, fontSize: '0.74rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                            >
                              <RotateCcw size={11} />
                              <span>{cT.resetBtn || 'Restablecer'}</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* 2.3 Canales y Redes Sociales */}
                    <div style={{ borderRadius: '12px', overflow: 'hidden', border: openDrawer === 'backSocial' ? `1px solid ${frameColor}` : '1px solid rgba(255, 255, 255, 0.08)' }}>
                      <div
                        onClick={() => setOpenDrawer(openDrawer === 'backSocial' ? null : 'backSocial')}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '12px 14px',
                          background: openDrawer === 'backSocial' ? 'rgba(255, 255, 255, 0.06)' : 'rgba(255, 255, 255, 0.02)',
                          cursor: 'pointer'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '0.86rem', fontWeight: 700, color: openDrawer === 'backSocial' ? '#fff' : 'var(--text-muted)' }}>
                            {cT.backSocialTitle || '3. Canales y Redes Sociales'}
                          </span>
                          <span style={{ fontSize: '0.72rem', color: frameColor, fontFamily: 'monospace', fontWeight: 600 }}>
                            {backChannelsSize}px
                          </span>
                        </div>
                        <ChevronDown size={15} color={openDrawer === 'backSocial' ? frameColor : 'var(--text-dim)'} style={{ transform: openDrawer === 'backSocial' ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                      </div>

                      {openDrawer === 'backSocial' && (
                        <div style={{ padding: '14px', background: 'rgba(0, 0, 0, 0.35)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          <div>
                            <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>{cT.backChannelsLabel || 'Lista de Canales / Plataformas'}:</label>
                            <input
                              type="text"
                              value={backChannelsText}
                              maxLength={120}
                              onChange={(e) => setBackChannelsText(e.target.value)}
                              placeholder="CHANNELS: IG • KICK • SOUNDCLOUD • WA"
                              style={{ width: '100%', padding: '10px 12px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: '#fff', fontSize: '0.88rem', outline: 'none' }}
                            />
                          </div>

                          <div>
                            <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>{cT.backHandleLabel || 'Handle / Usuario Oficial'}:</label>
                            <input
                              type="text"
                              value={backHandleText}
                              maxLength={120}
                              onChange={(e) => setBackHandleText(e.target.value)}
                              placeholder="@missafx_ // oficial"
                              style={{ width: '100%', padding: '10px 12px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: '#fff', fontSize: '0.88rem', outline: 'none' }}
                            />
                          </div>

                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                              <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{cT.fontSizeLabel || 'Tamaño de Fuente'}:</span>
                              <span style={{ fontSize: '0.76rem', color: '#fff', fontFamily: 'monospace', fontWeight: 700 }}>{backChannelsSize} px</span>
                            </div>
                            <input type="range" min="9" max="22" step="1" value={backChannelsSize} onChange={(e) => setBackChannelsSize(parseInt(e.target.value))} style={{ width: '100%', accentColor: frameColor }} />
                          </div>

                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                              <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{cT.posYLabel || 'Posición Vertical (Y)'}:</span>
                              <span style={{ fontSize: '0.76rem', color: '#fff', fontFamily: 'monospace', fontWeight: 700 }}>{backChannelsY > 0 ? `+${backChannelsY}px` : backChannelsY < 0 ? `${backChannelsY}px` : '0 px'}</span>
                            </div>
                            <input type="range" min="-120" max="120" step="2" value={backChannelsY} onChange={(e) => setBackChannelsY(parseInt(e.target.value))} style={{ width: '100%', accentColor: frameColor }} />
                          </div>

                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                              <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{cT.posXLabel || 'Posición Horizontal (X)'}:</span>
                              <span style={{ fontSize: '0.76rem', color: '#fff', fontFamily: 'monospace', fontWeight: 700 }}>{backChannelsX > 0 ? `+${backChannelsX}px` : backChannelsX < 0 ? `${backChannelsX}px` : '0 px'}</span>
                            </div>
                            <input type="range" min="-200" max="200" step="2" value={backChannelsX} onChange={(e) => setBackChannelsX(parseInt(e.target.value))} style={{ width: '100%', accentColor: frameColor }} />
                          </div>

                          {renderInlineColorPicker('Color de Canales', backChannelsColor || backAccentColor, setBackChannelsColor)}

                          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
                            <button
                              type="button"
                              onClick={() => {
                                setBackChannelsSize(13);
                                setBackChannelsY(0);
                                setBackChannelsX(0);
                                setBackChannelsColor('');
                              }}
                              style={{ background: 'transparent', border: 'none', color: frameColor, fontSize: '0.74rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                            >
                              <RotateCcw size={11} />
                              <span>{cT.resetBtn || 'Restablecer'}</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* 2.4 Sello de Seguridad & Pie de Imprenta */}
                    <div style={{ borderRadius: '12px', overflow: 'hidden', border: openDrawer === 'backSecurity' ? `1px solid ${frameColor}` : '1px solid rgba(255, 255, 255, 0.08)' }}>
                      <div
                        onClick={() => setOpenDrawer(openDrawer === 'backSecurity' ? null : 'backSecurity')}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '12px 14px',
                          background: openDrawer === 'backSecurity' ? 'rgba(255, 255, 255, 0.06)' : 'rgba(255, 255, 255, 0.02)',
                          cursor: 'pointer'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '0.86rem', fontWeight: 700, color: openDrawer === 'backSecurity' ? '#fff' : 'var(--text-muted)' }}>
                            {cT.backSecurityTitle || '4. Sello de Seguridad & Créditos'}
                          </span>
                          <span style={{ fontSize: '0.72rem', color: frameColor, fontFamily: 'monospace', fontWeight: 600 }}>
                            {backSecuritySize}px
                          </span>
                        </div>
                        <ChevronDown size={15} color={openDrawer === 'backSecurity' ? frameColor : 'var(--text-dim)'} style={{ transform: openDrawer === 'backSecurity' ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                      </div>

                      {openDrawer === 'backSecurity' && (
                        <div style={{ padding: '14px', background: 'rgba(0, 0, 0, 0.35)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          <div>
                            <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>{cT.backSecurityLabel || 'Sello de Seguridad Superior'}:</label>
                            <input
                              type="text"
                              value={backSecurityTag}
                              maxLength={120}
                              onChange={(e) => setBackSecurityTag(e.target.value)}
                              placeholder="NEXORA SECURITY // ENCRYPTED QR"
                              style={{ width: '100%', padding: '10px 12px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: '#fff', fontSize: '0.88rem', outline: 'none' }}
                            />
                          </div>

                          <div>
                            <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>{cT.backAuthIdLabel || 'Código de Autenticación'}:</label>
                            <input
                              type="text"
                              value={backAuthId}
                              maxLength={120}
                              onChange={(e) => setBackAuthId(e.target.value)}
                              placeholder="[ CARD AUTH ID: #MFX-2026 ]"
                              style={{ width: '100%', padding: '10px 12px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: '#fff', fontSize: '0.88rem', outline: 'none' }}
                            />
                          </div>

                          <div>
                            <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>{cT.backFooterCreditLabel || 'Crédito Inferior / Imprenta'}:</label>
                            <input
                              type="text"
                              value={backFooterCredit}
                              maxLength={120}
                              onChange={(e) => setBackFooterCredit(e.target.value)}
                              placeholder="BY NEXORA IT // WWW.ITNEXORA.COM"
                              style={{ width: '100%', padding: '10px 12px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: '#fff', fontSize: '0.88rem', outline: 'none' }}
                            />
                          </div>

                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                              <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{cT.fontSizeLabel || 'Tamaño de Fuente'}:</span>
                              <span style={{ fontSize: '0.76rem', color: '#fff', fontFamily: 'monospace', fontWeight: 700 }}>{backSecuritySize} px</span>
                            </div>
                            <input type="range" min="8" max="20" step="1" value={backSecuritySize} onChange={(e) => setBackSecuritySize(parseInt(e.target.value))} style={{ width: '100%', accentColor: frameColor }} />
                          </div>

                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                              <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{cT.posYLabel || 'Posición Vertical (Y)'}:</span>
                              <span style={{ fontSize: '0.76rem', color: '#fff', fontFamily: 'monospace', fontWeight: 700 }}>{backSecurityY > 0 ? `+${backSecurityY}px` : backSecurityY < 0 ? `${backSecurityY}px` : '0 px'}</span>
                            </div>
                            <input type="range" min="-80" max="80" step="2" value={backSecurityY} onChange={(e) => setBackSecurityY(parseInt(e.target.value))} style={{ width: '100%', accentColor: frameColor }} />
                          </div>

                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                              <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{cT.posXLabel || 'Posición Horizontal (X)'}:</span>
                              <span style={{ fontSize: '0.76rem', color: '#fff', fontFamily: 'monospace', fontWeight: 700 }}>{backSecurityX > 0 ? `+${backSecurityX}px` : backSecurityX < 0 ? `${backSecurityX}px` : '0 px'}</span>
                            </div>
                            <input type="range" min="-120" max="120" step="2" value={backSecurityX} onChange={(e) => setBackSecurityX(parseInt(e.target.value))} style={{ width: '100%', accentColor: frameColor }} />
                          </div>

                          {renderInlineColorPicker('Color de Sellos', backSecurityColor, setBackSecurityColor)}

                          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
                            <button
                              type="button"
                              onClick={() => {
                                setBackSecuritySize(12);
                                setBackSecurityY(0);
                                setBackSecurityX(0);
                                setBackSecurityColor('#64748B');
                              }}
                              style={{ background: 'transparent', border: 'none', color: frameColor, fontSize: '0.74rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                            >
                              <RotateCcw size={11} />
                              <span>{cT.resetBtn || 'Restablecer'}</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div style={{ marginTop: '28px', display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => setActiveStep(2)}
                    className="btn btn-primary btn-sm"
                    style={{ padding: '10px 24px', cursor: 'pointer' }}
                  >
                    <span>Siguiente: Foto de Artista →</span>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Photo & Framing */}
            {activeStep === 2 && (
              <div>
                <h3 className="font-display" style={{ fontSize: '1.25rem', marginBottom: '8px', color: '#fff' }}>
                  {cT.photoTitle}
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '20px' }}>
                  {cT.photoHint}
                </p>

                {/* Upload Custom Photo */}
                <div style={{ marginBottom: '22px' }}>
                  <label
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '24px 16px',
                      border: '2px dashed rgba(255, 255, 255, 0.18)',
                      borderRadius: '14px',
                      background: 'rgba(255, 255, 255, 0.02)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      textAlign: 'center'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = frameColor)}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.18)')}
                  >
                    <Upload size={24} color={frameColor} style={{ marginBottom: '8px' }} />
                    <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#fff' }}>
                      {cT.photoUpload}
                    </span>
                    <span style={{ fontSize: '0.76rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                      {cT.photoUploadSub}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      style={{ display: 'none' }}
                    />
                  </label>
                </div>

                {/* Presets Grid */}
                <div style={{ marginBottom: '22px' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '10px' }}>
                    {cT.photoPresets}
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    {DEFAULT_PRESETS.map((preset) => {
                      const isChosen = photoSrc === preset.src;
                      return (
                        <div
                          key={preset.id}
                          onClick={() => {
                            setPhotoSrc(preset.src);
                            setShowPhotoBg(true);
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
                            alt={preset.nameKey}
                            style={{
                              width: '100%',
                              height: '80px',
                              objectFit: 'cover',
                              display: 'block',
                              opacity: isChosen ? 1 : 0.6
                            }}
                          />
                          <div
                            style={{
                              padding: '6px 8px',
                              fontSize: '0.74rem',
                              fontWeight: 600,
                              color: isChosen ? frameColor : '#fff',
                              background: 'rgba(12, 12, 16, 0.9)',
                              textAlign: 'center'
                            }}
                          >
                            {cT[preset.nameKey]}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Framing & Position Adjustments */}
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
                      <span>{cT.centerPhoto}</span>
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
                      min="0.6"
                      max="2.5"
                      step="0.05"
                      value={photoScale}
                      onChange={(e) => setPhotoScale(parseFloat(e.target.value))}
                      style={{ width: '100%', accentColor: frameColor }}
                    />
                  </div>

                  {/* Vertical Position (Subir / Bajar) */}
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
                      <span>{cT.photoY}</span>
                      <span style={{ fontFamily: 'monospace' }}>
                        {photoPanY > 0 ? `+${photoPanY}px (Bajar)` : photoPanY < 0 ? `${photoPanY}px (Subir)` : '0px (Centro)'}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="-350"
                      max="350"
                      step="5"
                      value={photoPanY}
                      onChange={(e) => setPhotoPanY(parseInt(e.target.value))}
                      style={{ width: '100%', accentColor: frameColor }}
                    />
                  </div>

                  {/* Horizontal Position (X) */}
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

                  {/* Opacity Slider */}
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
                      <span>{cT.photoOpacity}</span>
                      <span style={{ fontFamily: 'monospace' }}>{Math.round(photoOpacity * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.10"
                      max="0.90"
                      step="0.02"
                      value={photoOpacity}
                      onChange={(e) => setPhotoOpacity(parseFloat(e.target.value))}
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
                      { id: 'cyberpunk', label: cT.filterCyberpunk },
                      { id: 'contrast', label: cT.filterContrast },
                      { id: 'normal', label: cT.filterOriginal }
                    ].map((f) => (
                      <button
                        key={f.id}
                        onClick={() => setPhotoFilter(f.id)}
                        style={{
                          padding: '8px 10px',
                          borderRadius: '8px',
                          fontSize: '0.76rem',
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

                {/* Prev / Next */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '28px' }}>
                  <button
                    onClick={() => setActiveStep(1)}
                    className="btn btn-secondary btn-sm"
                    style={{ cursor: 'pointer' }}
                  >
                    <span>← Textos</span>
                  </button>
                  <button
                    onClick={() => setActiveStep(3)}
                    className="btn btn-primary btn-sm"
                    style={{ cursor: 'pointer' }}
                  >
                    <span>Siguiente: Colores & Estilo →</span>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Colors & Style Customization */}
            {activeStep === 3 && (
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
                      const isSelected = frameColor === p.hex && titleColor === p.hex;
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

                {/* Granular Elements Colors */}
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#fff', display: 'block', marginBottom: '12px' }}>
                    {cT.colorElementsTitle}
                  </label>

                  {/* Smart Contrast Notice */}
                  <div
                    style={{
                      padding: '10px 14px',
                      borderRadius: '10px',
                      background: 'rgba(0, 240, 255, 0.06)',
                      border: '1px solid rgba(0, 240, 255, 0.2)',
                      fontSize: '0.78rem',
                      color: 'var(--text-muted)',
                      marginBottom: '16px',
                      lineHeight: 1.4
                    }}
                  >
                    {cT.contrastNotice}
                  </div>

                  {/* 1. Cyberpunk Frame */}
                  {renderColorItem(cT.colorFrame, frameColor, setFrameColor)}

                  {/* 2. Artist Title */}
                  {renderColorItem(cT.colorTitle, titleColor, setTitleColor)}

                  {/* 3. Title FX Suffix */}
                  {renderColorItem(cT.colorTitleFx, titleFxColor, setTitleFxColor)}

                  {/* 4. Genre Badge Background */}
                  {renderColorItem(cT.colorBadge, badgeColor, setBadgeColor)}

                  {/* 5. Genre Badge Text */}
                  {renderColorItem(cT.colorBadgeText, badgeTextColor, setBadgeTextColor)}

                  {/* 6. Text & Details */}
                  {renderColorItem(cT.colorText, textColor, setTextColor)}

                  {/* 7. Background Glow */}
                  {renderColorItem(cT.colorGlow, glowColor, setGlowColor)}

                  {/* 8. Back Accent (QR & Handles) */}
                  {renderColorItem(cT.colorBack, backAccentColor, setBackAccentColor)}
                </div>

                {/* Prev / Next */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '28px' }}>
                  <button
                    onClick={() => setActiveStep(2)}
                    className="btn btn-secondary btn-sm"
                    style={{ cursor: 'pointer' }}
                  >
                    <span>← Foto de Artista</span>
                  </button>
                  <button
                    onClick={() => {
                      setActiveStep(4);
                      setIsFlipped(true);
                      setActiveSide('back');
                    }}
                    className="btn btn-primary btn-sm"
                    style={{ cursor: 'pointer' }}
                  >
                    <span>Siguiente: Código QR →</span>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: QR Code Configuration */}
            {activeStep === 4 && (
              <div>
                <h3 className="font-display" style={{ fontSize: '1.25rem', marginBottom: '8px', color: '#fff' }}>
                  {cT.qrTitle}
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '20px' }}>
                  {cT.qrHint}
                </p>

                {/* Presets buttons */}
                <div style={{ marginBottom: '18px' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '10px' }}>
                    {cT.qrPresets}
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                    {QR_PRESETS.map((preset) => {
                      const isSelected = qrUrl === preset.url;
                      return (
                        <button
                          key={preset.id}
                          onClick={() => setQrUrl(preset.url)}
                          style={{
                            padding: '10px 12px',
                            borderRadius: '10px',
                            border: isSelected
                              ? `1px solid ${backAccentColor}`
                              : '1px solid rgba(255, 255, 255, 0.1)',
                            background: isSelected
                              ? hexToRgba(backAccentColor, 0.14)
                              : 'rgba(255, 255, 255, 0.03)',
                            color: isSelected ? '#fff' : 'var(--text-muted)',
                            fontSize: '0.82rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                          }}
                        >
                          <span>{cT[preset.labelKey]}</span>
                          {isSelected && <Check size={14} color={backAccentColor} />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* URL Input */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#fff', display: 'block', marginBottom: '6px' }}>
                    {cT.qrDestination}
                  </label>
                  <input
                    type="url"
                    value={qrUrl}
                    onChange={(e) => setQrUrl(e.target.value)}
                    placeholder="https://wa.me/5214443570777"
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      background: 'rgba(0, 0, 0, 0.4)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: '10px',
                      color: '#fff',
                      fontSize: '0.88rem',
                      fontFamily: 'monospace',
                      outline: 'none'
                    }}
                  />
                </div>

                {/* Caption below QR */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#fff', display: 'block', marginBottom: '6px' }}>
                    {cT.qrLabelText}
                  </label>
                  <input
                    type="text"
                    value={qrLabelText}
                    maxLength={60}
                    onChange={(e) => setQrLabelText(e.target.value)}
                    placeholder={cT.qrLabelPlaceholder}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      background: 'rgba(0, 0, 0, 0.4)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: '10px',
                      color: '#fff',
                      fontSize: '0.9rem',
                      outline: 'none'
                    }}
                  />
                </div>

                {/* PRO QR CONTROLS PANEL */}
                <div
                  style={{
                    padding: '18px',
                    borderRadius: '14px',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px',
                    marginBottom: '20px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Sliders size={16} color={frameColor} />
                      <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#fff' }}>
                        Ajustes Pro del Código QR
                      </span>
                    </div>
                    <span style={{ fontSize: '0.74rem', color: frameColor, fontFamily: 'monospace', fontWeight: 600 }}>
                      {qrSize}px
                    </span>
                  </div>

                  {/* QR Scale / Size */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{cT.qrScaleLabel || 'Tamaño / Escala del QR'}:</span>
                      <span style={{ fontSize: '0.78rem', color: '#fff', fontFamily: 'monospace', fontWeight: 700 }}>{qrSize} px</span>
                    </div>
                    <input
                      type="range"
                      min="120"
                      max="320"
                      step="5"
                      value={qrSize}
                      onChange={(e) => setQrSize(parseInt(e.target.value))}
                      style={{ width: '100%', accentColor: frameColor }}
                    />
                  </div>

                  {/* QR Pos X */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{cT.qrPosXLabel || 'Posición Horizontal (X)'}:</span>
                      <span style={{ fontSize: '0.78rem', color: '#fff', fontFamily: 'monospace', fontWeight: 700 }}>
                        {qrPanX > 0 ? `+${qrPanX}px` : qrPanX < 0 ? `${qrPanX}px` : '0 px'}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="-350"
                      max="350"
                      step="5"
                      value={qrPanX}
                      onChange={(e) => setQrPanX(parseInt(e.target.value))}
                      style={{ width: '100%', accentColor: frameColor }}
                    />
                  </div>

                  {/* QR Pos Y */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{cT.qrPosYLabel || 'Posición Vertical (Y)'}:</span>
                      <span style={{ fontSize: '0.78rem', color: '#fff', fontFamily: 'monospace', fontWeight: 700 }}>
                        {qrPanY > 0 ? `+${qrPanY}px` : qrPanY < 0 ? `${qrPanY}px` : '0 px'}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="-150"
                      max="150"
                      step="5"
                      value={qrPanY}
                      onChange={(e) => setQrPanY(parseInt(e.target.value))}
                      style={{ width: '100%', accentColor: frameColor }}
                    />
                  </div>

                  {/* QR Neon Glow */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{cT.qrGlowLabel || 'Resplandor Neón del Contenedor'}:</span>
                      <span style={{ fontSize: '0.78rem', color: '#fff', fontFamily: 'monospace', fontWeight: 700 }}>{qrGlow} px</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="25"
                      step="1"
                      value={qrGlow}
                      onChange={(e) => setQrGlow(parseInt(e.target.value))}
                      style={{ width: '100%', accentColor: frameColor }}
                    />
                  </div>

                  {/* QR Border Color */}
                  {renderInlineColorPicker(cT.qrBorderColorLabel || 'Color de Marco del QR', qrBorderColor || backAccentColor, setQrBorderColor)}

                  {/* QR Caption Size */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Tamaño de Texto Inferior:</span>
                      <span style={{ fontSize: '0.78rem', color: '#fff', fontFamily: 'monospace', fontWeight: 700 }}>{qrLabelSize} px</span>
                    </div>
                    <input
                      type="range"
                      min="8"
                      max="20"
                      step="1"
                      value={qrLabelSize}
                      onChange={(e) => setQrLabelSize(parseInt(e.target.value))}
                      style={{ width: '100%', accentColor: frameColor }}
                    />
                  </div>

                  {/* QR Caption Offset Y */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Offset Vertical del Texto:</span>
                      <span style={{ fontSize: '0.78rem', color: '#fff', fontFamily: 'monospace', fontWeight: 700 }}>
                        {qrLabelY > 0 ? `+${qrLabelY}px` : qrLabelY < 0 ? `${qrLabelY}px` : '0 px'}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="-40"
                      max="40"
                      step="2"
                      value={qrLabelY}
                      onChange={(e) => setQrLabelY(parseInt(e.target.value))}
                      style={{ width: '100%', accentColor: frameColor }}
                    />
                  </div>

                  {/* Reset QR Button */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setQrSize(220);
                        setQrPanX(0);
                        setQrPanY(0);
                        setQrGlow(8);
                        setQrBorderColor('');
                        setQrLabelSize(11);
                        setQrLabelY(0);
                      }}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: frameColor,
                        fontSize: '0.74rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <RotateCcw size={11} />
                      <span>{cT.resetBtn || 'Restablecer Ajustes QR'}</span>
                    </button>
                  </div>
                </div>

                {/* Prev / Next */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '28px' }}>
                  <button
                    onClick={() => {
                      setActiveStep(3);
                      setIsFlipped(false);
                      setActiveSide('front');
                    }}
                    className="btn btn-secondary btn-sm"
                    style={{ cursor: 'pointer' }}
                  >
                    <span>← Colores</span>
                  </button>
                  <button
                    onClick={() => setActiveStep(5)}
                    className="btn btn-primary btn-sm"
                    style={{ cursor: 'pointer' }}
                  >
                    <span>Siguiente: Máscaras →</span>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 5: Masks & Layers */}
            {activeStep === 5 && (
              <div>
                <h3 className="font-display" style={{ fontSize: '1.25rem', marginBottom: '8px', color: '#fff' }}>
                  {cT.masksTitle}
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '20px' }}>
                  Activa o desactiva las capas y detalles estéticos para personalizar ambas caras.
                </p>

                {/* Section 1: Cara Frontal (Frente) */}
                <div style={{ marginBottom: '22px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: frameColor, letterSpacing: '0.05em' }}>
                      🎴 CARA FRONTAL (FRENTE)
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {[
                      { id: 'cyberFrame', label: cT.maskCyberFrame, active: showCyberFrame, toggle: () => setShowCyberFrame(!showCyberFrame) },
                      { id: 'frontBadge', label: cT.maskFrontBadge, active: showFrontBadge, toggle: () => setShowFrontBadge(!showFrontBadge) },
                      { id: 'roleBadge', label: cT.maskRoleBadge, active: showRoleBadge, toggle: () => setShowRoleBadge(!showRoleBadge) },
                      { id: 'frontHud', label: cT.maskFrontHud, active: showFrontHud, toggle: () => setShowFrontHud(!showFrontHud) },
                      { id: 'frontEq', label: cT.maskFrontEq, active: showFrontEq, toggle: () => setShowFrontEq(!showFrontEq) },
                      { id: 'glowBg', label: cT.maskGlowBg, active: showGlowBg, toggle: () => setShowGlowBg(!showGlowBg) },
                      { id: 'photoBg', label: cT.maskPhotoBg, active: showPhotoBg, toggle: () => setShowPhotoBg(!showPhotoBg) }
                    ].map((layer) => (
                      <div
                        key={layer.id}
                        onClick={layer.toggle}
                        style={{
                          padding: '13px 16px',
                          borderRadius: '12px',
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
                            <Eye size={17} color={frameColor} />
                          ) : (
                            <EyeOff size={17} color="var(--text-dim)" />
                          )}
                          <span
                            style={{
                              fontSize: '0.84rem',
                              fontWeight: 600,
                              color: layer.active ? '#fff' : 'var(--text-dim)'
                            }}
                          >
                            {layer.label}
                          </span>
                        </div>

                        <div
                          style={{
                            width: '40px',
                            height: '22px',
                            borderRadius: '11px',
                            background: layer.active ? frameColor : 'rgba(255, 255, 255, 0.1)',
                            position: 'relative',
                            transition: 'background 0.2s ease',
                            flexShrink: 0
                          }}
                        >
                          <div
                            style={{
                              width: '16px',
                              height: '16px',
                              borderRadius: '50%',
                              background: '#FFFFFF',
                              position: 'absolute',
                              top: '3px',
                              left: layer.active ? '21px' : '3px',
                              transition: 'left 0.2s ease',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.4)'
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section 2: Cara Trasera (Reverso) */}
                <div style={{ marginBottom: '18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: frameColor, letterSpacing: '0.05em' }}>
                      🔄 CARA TRASERA (REVERSO)
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {[
                      { id: 'qr', label: cT.maskQr, active: showQr, toggle: () => setShowQr(!showQr) },
                      { id: 'backHeader', label: cT.maskBackHeader, active: showBackHeader, toggle: () => setShowBackHeader(!showBackHeader) },
                      { id: 'backDivider', label: cT.maskBackDivider, active: showBackDivider, toggle: () => setShowBackDivider(!showBackDivider) },
                      { id: 'backContact', label: cT.maskBackContact, active: showBackContact, toggle: () => setShowBackContact(!showBackContact) },
                      { id: 'socialBadges', label: cT.maskSocialBadges, active: showSocialBadges, toggle: () => setShowSocialBadges(!showSocialBadges) },
                      { id: 'backSecurity', label: cT.maskBackSecurity, active: showBackSecurity, toggle: () => setShowBackSecurity(!showBackSecurity) },
                      { id: 'backFooter', label: cT.maskBackFooter, active: showBackFooter, toggle: () => setShowBackFooter(!showBackFooter) },
                      { id: 'backGrid', label: cT.maskBackGrid, active: showBackGrid, toggle: () => setShowBackGrid(!showBackGrid) },
                      { id: 'photoBack', label: cT.maskPhotoBack, active: showPhotoBack, toggle: () => setShowPhotoBack(!showPhotoBack) }
                    ].map((layer) => (
                      <div
                        key={layer.id}
                        onClick={layer.toggle}
                        style={{
                          padding: '13px 16px',
                          borderRadius: '12px',
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
                            <Eye size={17} color={frameColor} />
                          ) : (
                            <EyeOff size={17} color="var(--text-dim)" />
                          )}
                          <span
                            style={{
                              fontSize: '0.84rem',
                              fontWeight: 600,
                              color: layer.active ? '#fff' : 'var(--text-dim)'
                            }}
                          >
                            {layer.label}
                          </span>
                        </div>

                        <div
                          style={{
                            width: '40px',
                            height: '22px',
                            borderRadius: '11px',
                            background: layer.active ? frameColor : 'rgba(255, 255, 255, 0.1)',
                            position: 'relative',
                            transition: 'background 0.2s ease',
                            flexShrink: 0
                          }}
                        >
                          <div
                            style={{
                              width: '16px',
                              height: '16px',
                              borderRadius: '50%',
                              background: '#FFFFFF',
                              position: 'absolute',
                              top: '3px',
                              left: layer.active ? '21px' : '3px',
                              transition: 'left 0.2s ease',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.4)'
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Prev / Next */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '28px' }}>
                  <button
                    onClick={() => setActiveStep(4)}
                    className="btn btn-secondary btn-sm"
                    style={{ cursor: 'pointer' }}
                  >
                    <span>← Código QR</span>
                  </button>
                  <button
                    onClick={() => setActiveStep(6)}
                    className="btn btn-primary btn-sm"
                    style={{ cursor: 'pointer' }}
                  >
                    <span>Siguiente: Exportar →</span>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 6: Export & Downloads */}
            {activeStep === 6 && (
              <div>
                <h3 className="font-display" style={{ fontSize: '1.25rem', marginBottom: '8px', color: '#fff' }}>
                  {cT.exportTitle}
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '20px' }}>
                  Descarga tus tarjetas a resolución nativa de 300 DPI listas para imprenta o uso digital.
                </p>

                {/* Downloads Buttons */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                  <button
                    onClick={handleDownloadFront}
                    disabled={isExporting}
                    className="btn btn-primary"
                    style={{
                      width: '100%',
                      padding: '14px',
                      justifyContent: 'center',
                      gap: '10px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    <Download size={18} />
                    <span>{cT.exportFrontBtn}</span>
                  </button>

                  <button
                    onClick={handleDownloadBack}
                    disabled={isExporting}
                    className="btn btn-secondary"
                    style={{
                      width: '100%',
                      padding: '14px',
                      justifyContent: 'center',
                      gap: '10px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      border: `1px solid ${hexToRgba(frameColor, 0.4)}`
                    }}
                  >
                    <Download size={18} color={frameColor} />
                    <span>{cT.exportBackBtn}</span>
                  </button>

                  <button
                    onClick={handleDownloadBoth}
                    disabled={isExporting}
                    className="btn btn-secondary"
                    style={{
                      width: '100%',
                      padding: '14px',
                      justifyContent: 'center',
                      gap: '10px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    <Share2 size={18} color="#22c55e" />
                    <span>{cT.exportBothBtn}</span>
                  </button>
                </div>

                {exportMessage && (
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
                    <span>{exportMessage}</span>
                  </div>
                )}

                <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)', lineHeight: 1.5 }}>
                  {cT.printReadyNote}
                </p>

                <div style={{ marginTop: '24px' }}>
                  <button
                    onClick={() => setActiveStep(5)}
                    className="btn btn-secondary btn-sm"
                    style={{ cursor: 'pointer' }}
                  >
                    <span>← Modificar Máscaras</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: 3D Flip Card Interactive Live Preview */}
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
                maxWidth: '460px',
                background: 'rgba(12, 12, 16, 0.85)',
                padding: '20px',
                borderRadius: '24px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: `0 24px 48px rgba(0, 0, 0, 0.8), 0 0 30px ${hexToRgba(frameColor, 0.15)}`
              }}
            >
              {/* Preview Header & Flip controls */}
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

                {/* Flip Badge */}
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    letterSpacing: '0.05em',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    background: isFlipped ? 'rgba(83, 252, 24, 0.15)' : hexToRgba(frameColor, 0.15),
                    color: isFlipped ? '#53fc18' : frameColor,
                    border: isFlipped ? '1px solid rgba(83, 252, 24, 0.3)' : `1px solid ${hexToRgba(frameColor, 0.3)}`
                  }}
                >
                  {isFlipped ? cT.backBadge : cT.frontBadge}
                </span>
              </div>

              {/* 3D Flip Card Scene */}
              <div
                style={{
                  perspective: '1200px',
                  width: '100%',
                  aspectRatio: CARD_ASPECT_RATIO,
                  cursor: 'pointer'
                }}
                onClick={toggleFlip}
                title={cT.clickToFlip}
              >
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    position: 'relative',
                    transformStyle: 'preserve-3d',
                    transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                    transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
                  }}
                >
                  {/* FRONT FACE */}
                  <div
                    style={{
                      position: 'absolute',
                      width: '100%',
                      height: '100%',
                      backfaceVisibility: 'hidden',
                      borderRadius: '16px',
                      overflow: 'hidden',
                      boxShadow: '0 12px 30px rgba(0,0,0,0.7)'
                    }}
                  >
                    <canvas
                      ref={frontCanvasRef}
                      style={{
                        width: '100%',
                        height: '100%',
                        display: 'block',
                        objectFit: 'contain'
                      }}
                    />
                  </div>

                  {/* BACK FACE */}
                  <div
                    style={{
                      position: 'absolute',
                      width: '100%',
                      height: '100%',
                      backfaceVisibility: 'hidden',
                      transform: 'rotateY(180deg)',
                      borderRadius: '16px',
                      overflow: 'hidden',
                      boxShadow: '0 12px 30px rgba(0,0,0,0.7)'
                    }}
                  >
                    <canvas
                      ref={backCanvasRef}
                      style={{
                        width: '100%',
                        height: '100%',
                        display: 'block',
                        objectFit: 'contain'
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Flip Button & Quick Switcher */}
              <div
                style={{
                  marginTop: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <button
                  onClick={() => {
                    setIsFlipped(false);
                    setActiveSide('front');
                  }}
                  style={{
                    flex: 1,
                    padding: '9px',
                    borderRadius: '8px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    border: !isFlipped
                      ? `1px solid ${frameColor}`
                      : '1px solid rgba(255, 255, 255, 0.08)',
                    background: !isFlipped
                      ? hexToRgba(frameColor, 0.15)
                      : 'rgba(255, 255, 255, 0.03)',
                    color: !isFlipped ? '#fff' : 'var(--text-muted)'
                  }}
                >
                  {cT.viewFront}
                </button>

                <button
                  onClick={() => {
                    setIsFlipped(true);
                    setActiveSide('back');
                  }}
                  style={{
                    flex: 1,
                    padding: '9px',
                    borderRadius: '8px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    border: isFlipped
                      ? `1px solid ${frameColor}`
                      : '1px solid rgba(255, 255, 255, 0.08)',
                    background: isFlipped
                      ? hexToRgba(frameColor, 0.15)
                      : 'rgba(255, 255, 255, 0.03)',
                    color: isFlipped ? '#fff' : 'var(--text-muted)'
                  }}
                >
                  {cT.viewBack}
                </button>

                <button
                  onClick={toggleFlip}
                  title="Voltear 3D"
                  className="btn btn-secondary btn-sm"
                  style={{
                    padding: '9px 12px',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                >
                  <RefreshCw size={14} color={frameColor} />
                </button>
              </div>

              <div style={{ marginTop: '10px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-dim)' }}>
                  {cT.clickToFlip}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
