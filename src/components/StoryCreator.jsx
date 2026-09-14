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
  Palette
} from 'lucide-react';
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
  { id: 'capture2', nameKey: 'photoPreset2', src: '/missa-capture-2.jpg' },
  { id: 'capture1', nameKey: 'photoPreset1', src: '/missa-capture.jpg' }
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
    // Anti-empalme: automatically set badge text to dark if background is white/light
    const contrastText = getAutoContrastColor(hex);
    setBadgeTextColor(contrastText);
    if (hex === '#FFFFFF') {
      setTitleFxColor('#FF003C');
      setTextColor('#FFFFFF');
    } else {
      setTitleFxColor('#FFFFFF');
      setTextColor('#FFFFFF');
    }
  };

  // Masks and layers toggles (on/off)
  const [showRepeatText, setShowRepeatText] = useState(true);
  const [showCyberFrame, setShowCyberFrame] = useState(true);
  const [showTechAccents, setShowTechAccents] = useState(true);
  const [showBadges, setShowBadges] = useState(true);
  const [showVignette, setShowVignette] = useState(true);

  // Preview overlay guide
  const [showSafeZones, setShowSafeZones] = useState(false);

  // Export status
  const [isExporting, setIsExporting] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

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

  // Main Canvas Render function
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
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

    // 1. Dark Base Background
    ctx.fillStyle = '#060608';
    ctx.fillRect(0, 0, width, height);

    // 2. Draw Photo Layer
    const img = imageRef.current;
    if (img && imageLoaded) {
      ctx.save();

      // Color filter
      if (photoFilter === 'contrast') {
        ctx.filter = 'contrast(130%) brightness(95%) saturate(110%)';
      } else if (photoFilter === 'cyberpunk') {
        ctx.filter = 'grayscale(100%) contrast(150%) brightness(85%)';
      } else {
        ctx.filter = 'none';
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
      drawW *= photoScale;
      drawH *= photoScale;

      // Center + pan offsets
      const drawX = (width - drawW) / 2 + photoPanX;
      const drawY = (height - drawH) / 2 + photoPanY;

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

    // 4. Repeated Lateral Outline Typography ("MISSA MISSA") (if enabled)
    if (showRepeatText && repeatedText.trim()) {
      ctx.save();
      const textToRepeat = repeatedText.trim().toUpperCase();
      ctx.font = '900 88px "Syne", "Outfit", sans-serif';
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'left';

      // Repeat down the left margin
      const startY = height * 0.14;
      const endY = height * 0.82;
      const stepY = 104;
      const posX = 60;

      let count = 0;
      for (let y = startY; y <= endY; y += stepY) {
        // Outline text styling
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = repeatTextColor;
        ctx.strokeText(textToRepeat, posX, y);

        // One line gets filled solid accent for editorial rhythm
        if (count === 1) {
          ctx.fillStyle = repeatTextColor;
          ctx.fillText(textToRepeat, posX, y);
        } else {
          ctx.fillStyle = hexToRgba(repeatTextColor, 0.04);
          ctx.fillText(textToRepeat, posX, y);
        }
        count++;
      }
      ctx.restore();
    }

    // 5. Cyberpunk Angular Frame with 45° Beveled Corners (if enabled)
    if (showCyberFrame) {
      ctx.save();
      const inset = 44;
      const bevel = 36;

      ctx.beginPath();
      // Top-Left bevel start
      ctx.moveTo(inset + bevel, inset);
      // Top line
      ctx.lineTo(width - inset - bevel, inset);
      // Top-Right bevel
      ctx.lineTo(width - inset, inset + bevel);
      // Right line
      ctx.lineTo(width - inset, height - inset - bevel);
      // Bottom-Right bevel
      ctx.lineTo(width - inset - bevel, height - inset);
      // Bottom line
      ctx.lineTo(inset + bevel, height - inset);
      // Bottom-Left bevel
      ctx.lineTo(inset, height - inset - bevel);
      // Left line
      ctx.lineTo(inset, inset + bevel);
      ctx.closePath();

      ctx.strokeStyle = frameColor;
      ctx.lineWidth = 4;
      ctx.shadowColor = frameColor;
      ctx.shadowBlur = 14;
      ctx.stroke();

      // Corner accent brackets & notches
      ctx.shadowBlur = 0;
      ctx.fillStyle = frameColor;

      // Top-left notch
      ctx.fillRect(inset + bevel, inset - 4, 30, 8);
      // Top-right notch
      ctx.fillRect(width - inset - bevel - 30, inset - 4, 30, 8);
      // Bottom-left notch
      ctx.fillRect(inset + bevel, height - inset - 4, 30, 8);
      // Bottom-right notch
      ctx.fillRect(width - inset - bevel - 30, height - inset - 4, 30, 8);

      ctx.restore();
    }

    // 6. Technical Accents & Overlays (if enabled)
    if (showTechAccents) {
      ctx.save();
      ctx.fillStyle = '#94A3B8';
      ctx.font = '600 13px "Outfit", monospace';
      ctx.letterSpacing = '1px';

      // Crosshairs in corners
      const crossSize = 10;
      const corners = [
        [75, 75],
        [width - 75, 75],
        [75, height - 75],
        [width - 75, height - 75]
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

      // Coordinates & Audio Protocol tags
      ctx.fillStyle = '#F8FAFC';
      ctx.fillText('[ 22° 09\' N // 100° 58\' W ]', 110, 80);

      // Mini Graphic Equalizer Bars (top right)
      const eqX = width - 220;
      const eqY = 70;
      const barCount = 12;
      const heights = [14, 22, 10, 26, 18, 12, 28, 20, 16, 24, 15, 8];

      for (let i = 0; i < barCount; i++) {
        const barH = heights[i];
        ctx.fillStyle = i % 3 === 0 ? techColor : 'rgba(255, 255, 255, 0.7)';
        ctx.fillRect(eqX + i * 8, eqY + (28 - barH), 5, barH);
      }

      ctx.restore();
    }

    // 7. Badges & Logos (if enabled)
    if (showBadges) {
      ctx.save();

      // Top Tag Pill
      const tagText = 'PIONEER DJ PRO SESSION';
      ctx.font = '700 14px "Outfit", sans-serif';
      const tagMetrics = ctx.measureText(tagText);
      const tagW = tagMetrics.width + 36;
      const tagH = 34;
      const tagX = (width - tagW) / 2;
      const tagY = height * 0.08;

      ctx.fillStyle = 'rgba(12, 12, 16, 0.85)';
      ctx.strokeStyle = badgeColor;
      ctx.lineWidth = 1.5;

      // Rounded rectangle
      ctx.beginPath();
      ctx.roundRect(tagX, tagY, tagW, tagH, 8);
      ctx.fill();
      ctx.stroke();

      // Active dot
      ctx.fillStyle = badgeColor;
      ctx.beginPath();
      ctx.arc(tagX + 16, tagY + tagH / 2, 4, 0, Math.PI * 2);
      ctx.fill();

      // Text inside pill
      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(tagText, tagX + 26, tagY + tagH / 2);

      // Audio spec tag
      ctx.font = '600 12px "Outfit", monospace';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.textAlign = 'center';
      ctx.fillText('• 48kHz / 24-BIT MASTER AUDIO •', width / 2, tagY + tagH + 18);

      ctx.restore();
    }

    // 8. Main Typography & Event Information
    ctx.save();
    const bottomBase = height - (format === 'story' ? 180 : 130);

    // Subtle atmospheric glow behind the artist title
    const glowGrad = ctx.createRadialGradient(
      width / 2, bottomBase - 85, 10,
      width / 2, bottomBase - 85, width * 0.42
    );
    glowGrad.addColorStop(0, hexToRgba(titleColor, 0.22));
    glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = glowGrad;
    ctx.fillRect(0, bottomBase - 260, width, 360);

    // Subtitle Pill (e.g. TECH HOUSE)
    if (subTitle.trim()) {
      ctx.font = '800 18px "Syne", sans-serif';
      const subMetrics = ctx.measureText(subTitle.toUpperCase());
      const subW = subMetrics.width + 32;
      const subH = 36;
      const subX = width / 2 - subW / 2;
      const subY = bottomBase - 180;

      // Smart contrast guarantee: text is NEVER same luminance as background pill
      let effectiveBadgeTextColor = badgeTextColor;
      if (isLightColor(badgeColor) && isLightColor(badgeTextColor)) {
        effectiveBadgeTextColor = '#060608';
      } else if (!isLightColor(badgeColor) && !isLightColor(badgeTextColor)) {
        effectiveBadgeTextColor = '#FFFFFF';
      }

      ctx.fillStyle = badgeColor;
      ctx.beginPath();
      ctx.roundRect(subX, subY, subW, subH, 6);
      ctx.fill();

      ctx.fillStyle = effectiveBadgeTextColor;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(subTitle.toUpperCase(), width / 2, subY + subH / 2);
    }

    // Main Title (e.g. MISSAFX)
    if (mainTitle.trim()) {
      ctx.font = '900 110px "Syne", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Split into "MISSA" and "FX" if matching default, or draw cleanly
      const titleUpper = mainTitle.trim().toUpperCase();
      if (titleUpper.startsWith('MISSA') && titleUpper.endsWith('FX')) {
        const missaPart = 'MISSA';
        const fxPart = 'FX';

        ctx.font = '900 110px "Syne", sans-serif';
        const missaMetrics = ctx.measureText(missaPart);
        const fxMetrics = ctx.measureText(fxPart);
        const fullW = missaMetrics.width + fxMetrics.width;
        const startX = (width - fullW) / 2;

        ctx.textAlign = 'left';
        ctx.fillStyle = titleColor;
        ctx.fillText(missaPart, startX, bottomBase - 90);

        ctx.fillStyle = titleFxColor;
        ctx.fillText(fxPart, startX + missaMetrics.width, bottomBase - 90);
      } else {
        ctx.fillStyle = titleColor;
        ctx.fillText(titleUpper, width / 2, bottomBase - 90);
      }
    }

    // Divider Line
    ctx.strokeStyle = hexToRgba(textColor, 0.2);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(width * 0.15, bottomBase - 30);
    ctx.lineTo(width * 0.85, bottomBase - 30);
    ctx.stroke();

    // Event Date & Venue Info
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Date
    if (eventDate.trim()) {
      ctx.font = '800 24px "Outfit", sans-serif';
      ctx.fillStyle = textColor;
      ctx.fillText(eventDate.toUpperCase(), width / 2, bottomBase + 10);
    }

    // Venue / Location
    if (eventVenue.trim()) {
      ctx.font = '500 17px "Outfit", sans-serif';
      ctx.fillStyle = hexToRgba(textColor, 0.75);
      ctx.fillText(eventVenue.toUpperCase(), width / 2, bottomBase + 45);
    }

    // Booking Pill
    ctx.font = '700 13px "Outfit", sans-serif';
    ctx.fillStyle = techColor;
    ctx.fillText('BOOKING DIRECTO • WA +52 1 444 357 0777', width / 2, bottomBase + 78);

    ctx.restore();

    // 9. Safe Zone Guides (Preview only overlay)
    if (showSafeZones && format === 'story') {
      ctx.save();
      ctx.strokeStyle = 'rgba(250, 204, 21, 0.75)'; // Yellow dashed line
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 8]);

      // Top safe zone (220px)
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
  }, [
    format,
    photoScale,
    photoPanX,
    photoPanY,
    photoFilter,
    imageLoaded,
    repeatedText,
    mainTitle,
    subTitle,
    eventDate,
    eventVenue,
    frameColor,
    titleColor,
    titleFxColor,
    repeatTextColor,
    badgeColor,
    badgeTextColor,
    textColor,
    techColor,
    showRepeatText,
    showCyberFrame,
    showTechAccents,
    showBadges,
    showVignette,
    showSafeZones
  ]);

  // Trigger render when inputs change
  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  // Export high resolution PNG
  const handleDownload = () => {
    setIsExporting(true);

    // Make sure safe zones overlay is NOT included in export
    const wasSafeZonesActive = showSafeZones;
    if (wasSafeZonesActive) {
      setShowSafeZones(false);
    }

    setTimeout(() => {
      renderCanvas();
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

        {/* Step Progress Tabs Bar (6 Steps) */}
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
            { id: 5, label: cT.step5, icon: Layers },
            { id: 6, label: cT.step6, icon: Download }
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
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    {DEFAULT_PRESETS.map((preset) => {
                      const isChosen = photoSrc === preset.src;
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
                            alt={preset.nameKey}
                            style={{
                              width: '100%',
                              height: '90px',
                              objectFit: 'cover',
                              display: 'block',
                              opacity: isChosen ? 1 : 0.65
                            }}
                          />
                          <div
                            style={{
                              padding: '6px 8px',
                              fontSize: '0.76rem',
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
                <h3
                  className="font-display"
                  style={{ fontSize: '1.25rem', marginBottom: '8px', color: '#fff' }}
                >
                  {cT.textTitle}
                </h3>
                <p
                  style={{
                    color: 'var(--text-muted)',
                    fontSize: '0.88rem',
                    marginBottom: '20px'
                  }}
                >
                  Modifica los textos que aparecerán en el flyer y en la columna de contorno lateral.
                </p>

                {/* Repeated Text */}
                <div style={{ marginBottom: '16px' }}>
                  <label
                    style={{
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      color: '#fff',
                      display: 'block',
                      marginBottom: '6px'
                    }}
                  >
                    {cT.textRepeatLabel}
                  </label>
                  <input
                    type="text"
                    value={repeatedText}
                    maxLength={15}
                    onChange={(e) => setRepeatedText(e.target.value)}
                    placeholder={cT.textRepeatPlaceholder}
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
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-dim)', marginTop: '4px', display: 'block' }}>
                    {cT.textRepeatHelp}
                  </span>
                </div>

                {/* Main Title */}
                <div style={{ marginBottom: '16px' }}>
                  <label
                    style={{
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      color: '#fff',
                      display: 'block',
                      marginBottom: '6px'
                    }}
                  >
                    {cT.mainTitleLabel}
                  </label>
                  <input
                    type="text"
                    value={mainTitle}
                    maxLength={20}
                    onChange={(e) => setMainTitle(e.target.value)}
                    placeholder={cT.mainTitlePlaceholder}
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

                {/* Subtitle / Genre */}
                <div style={{ marginBottom: '16px' }}>
                  <label
                    style={{
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      color: '#fff',
                      display: 'block',
                      marginBottom: '6px'
                    }}
                  >
                    {cT.genreLabel}
                  </label>
                  <input
                    type="text"
                    value={subTitle}
                    maxLength={25}
                    onChange={(e) => setSubTitle(e.target.value)}
                    placeholder={cT.genrePlaceholder}
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

                {/* Date / Line 1 */}
                <div style={{ marginBottom: '16px' }}>
                  <label
                    style={{
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      color: '#fff',
                      display: 'block',
                      marginBottom: '6px'
                    }}
                  >
                    {cT.dateLabel}
                  </label>
                  <input
                    type="text"
                    value={eventDate}
                    maxLength={30}
                    onChange={(e) => setEventDate(e.target.value)}
                    placeholder={cT.datePlaceholder}
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

                {/* Venue / City */}
                <div style={{ marginBottom: '20px' }}>
                  <label
                    style={{
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      color: '#fff',
                      display: 'block',
                      marginBottom: '6px'
                    }}
                  >
                    {cT.venueLabel}
                  </label>
                  <input
                    type="text"
                    value={eventVenue}
                    maxLength={35}
                    onChange={(e) => setEventVenue(e.target.value)}
                    placeholder={cT.venuePlaceholder}
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
                  {renderColorItem(cT.colorBadgeText, badgeTextColor, setBadgeTextColor)}

                  {/* 6. Event Info & Date Text */}
                  {renderColorItem(cT.colorText, textColor, setTextColor)}

                  {/* 7. Lateral Repeated Text */}
                  {renderColorItem(cT.colorRepeatText, repeatTextColor, setRepeatTextColor)}

                  {/* 8. Tech Accents, EQ & Booking */}
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
                    <span>Siguiente: Máscaras →</span>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 5: Masks & Layers Toggles (Prender/Apagar) */}
            {activeStep === 5 && (
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
                      id: 'techAccents',
                      label: cT.maskTechAccents,
                      active: showTechAccents,
                      toggle: () => setShowTechAccents(!showTechAccents)
                    },
                    {
                      id: 'badges',
                      label: cT.maskBadges,
                      active: showBadges,
                      toggle: () => setShowBadges(!showBadges)
                    },
                    {
                      id: 'vignette',
                      label: cT.maskVignette,
                      active: showVignette,
                      toggle: () => setShowVignette(!showVignette)
                    }
                  ].map((layer) => (
                    <div
                      key={layer.id}
                      onClick={layer.toggle}
                      style={{
                        padding: '16px 18px',
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
                    <span>Siguiente: Exportar →</span>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 6: Export & Final Download */}
            {activeStep === 6 && (
              <div>
                <h3
                  className="font-display"
                  style={{ fontSize: '1.25rem', marginBottom: '8px', color: '#fff' }}
                >
                  {cT.step6}: Descargar en Alta Calidad
                </h3>
                <p
                  style={{
                    color: 'var(--text-muted)',
                    fontSize: '0.88rem',
                    marginBottom: '20px'
                  }}
                >
                  Tu diseño está listo para ser exportado a resolución nativa de 1080px (PNG sin pérdida de calidad).
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
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Resolución:</span>
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
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Formato de Salida:</span>
                    <strong style={{ color: '#fff', fontSize: '0.86rem' }}>PNG 24-bit (Crisp)</strong>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Capas Activas:</span>
                    <strong style={{ color: '#fff', fontSize: '0.86rem' }}>
                      {[showRepeatText, showCyberFrame, showTechAccents, showBadges, showVignette].filter(Boolean).length} / 5
                    </strong>
                  </div>
                </div>

                {/* Big Download Button */}
                <button
                  onClick={handleDownload}
                  disabled={isExporting}
                  className="btn btn-primary"
                  style={{
                    width: '100%',
                    padding: '16px',
                    fontSize: '0.98rem',
                    fontWeight: 700,
                    cursor: isExporting ? 'wait' : 'pointer',
                    gap: '10px',
                    marginBottom: '16px',
                    boxShadow: `0 8px 24px ${hexToRgba(frameColor, 0.4)}`
                  }}
                >
                  <Download size={20} />
                  <span>{isExporting ? 'Generando PNG...' : cT.exportBtn}</span>
                </button>

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
              </div>

              {/* Quick Actions Below Canvas */}
              <div style={{ marginTop: '16px', display: 'flex', gap: '10px' }}>
                <button
                  onClick={handleDownload}
                  disabled={isExporting}
                  className="btn btn-primary"
                  style={{
                    flex: 1,
                    justifyContent: 'center',
                    padding: '12px 14px',
                    fontSize: '0.86rem',
                    fontWeight: 700,
                    cursor: isExporting ? 'wait' : 'pointer'
                  }}
                >
                  <Download size={16} />
                  <span>{isExporting ? 'Descargando...' : 'Descargar PNG'}</span>
                </button>

                {format === 'story' && (
                  <button
                    onClick={() => setShowSafeZones(!showSafeZones)}
                    title="Alternar Zonas Seguras de Instagram"
                    style={{
                      padding: '12px 14px',
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
                    <Eye size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
