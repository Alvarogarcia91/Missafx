import React, { useState, useRef, useEffect, useCallback } from 'react';
import QRCode from 'qrcode';
import {
  ArrowLeft,
  Download,
  QrCode,
  Layers,
  Type,
  Maximize2,
  RefreshCw,
  Eye,
  EyeOff,
  Sparkles,
  Smartphone,
  Square,
  RectangleHorizontal,
  RectangleVertical,
  CheckCircle2,
  Phone,
  MapPin,
  Globe,
  Share2,
  Check
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const CARD_FORMATS = {
  horizontal: {
    id: 'horizontal',
    nameKey: 'formatHorizontal',
    dimKey: 'formatHorizontalDim',
    noteKey: 'formatHorizontalNote',
    width: 1050,
    height: 600,
    aspectRatio: '1050 / 600',
    icon: RectangleHorizontal
  },
  vertical: {
    id: 'vertical',
    nameKey: 'formatVertical',
    dimKey: 'formatVerticalDim',
    noteKey: 'formatVerticalNote',
    width: 600,
    height: 1050,
    aspectRatio: '600 / 1050',
    icon: RectangleVertical
  },
  square: {
    id: 'square',
    nameKey: 'formatSquare',
    dimKey: 'formatSquareDim',
    noteKey: 'formatSquareNote',
    width: 750,
    height: 750,
    aspectRatio: '1 / 1',
    icon: Square
  }
};

const QR_PRESETS = [
  { id: 'whatsapp', labelKey: 'presetWhatsapp', url: 'https://wa.me/5214443570777' },
  { id: 'instagram', labelKey: 'presetInstagram', url: 'https://instagram.com/missafx_' },
  { id: 'soundcloud', labelKey: 'presetSoundcloud', url: 'https://soundcloud.com/missafx' },
  { id: 'kick', labelKey: 'presetKick', url: 'https://kick.com/missafx' }
];

export default function CardCreator({ onBack }) {
  const { t } = useLanguage();
  const cT = t.cardCreator;

  // Wizard active step (1 to 5)
  const [activeStep, setActiveStep] = useState(1);

  // Format selection
  const [format, setFormat] = useState('horizontal');

  // Active side for preview ('front' | 'back')
  const [activeSide, setActiveSide] = useState('front');
  const [isFlipped, setIsFlipped] = useState(false);

  // Card Content State
  const [artistName, setArtistName] = useState('MISSAFX');
  const [realName, setRealName] = useState('Missael G.');
  const [roleGenre, setRoleGenre] = useState('DJ & TECH HOUSE PRODUCER');
  const [phoneWhatsapp, setPhoneWhatsapp] = useState('+52 1 444 357 0777');
  const [cityLocation, setCityLocation] = useState('San Luis Potosí, México');
  const [tagline, setTagline] = useState('Tech House • Club Dates • Festivals');
  const [accentColor, setAccentColor] = useState('#FF003C');

  // QR Code State
  const [qrUrl, setQrUrl] = useState('https://wa.me/5214443570777');
  const [qrLabelText, setQrLabelText] = useState('ESCANEA PARA BOOKING DIRECTO & SESIONES');
  const [qrDataUrl, setQrDataUrl] = useState('');

  // Masks / Layers Toggles (on/off)
  const [showQr, setShowQr] = useState(true);
  const [showCyberFrame, setShowCyberFrame] = useState(true);
  const [showTechAccents, setShowTechAccents] = useState(true);
  const [showSocialBadges, setShowSocialBadges] = useState(true);
  const [showPhotoBg, setShowPhotoBg] = useState(true);

  // Export State
  const [isExporting, setIsExporting] = useState(false);
  const [exportMessage, setExportMessage] = useState('');

  // Canvas Refs
  const frontCanvasRef = useRef(null);
  const backCanvasRef = useRef(null);
  const bgImageRef = useRef(null);

  // Load subtle background photo
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = '/missa-capture-2.jpg';
    img.onload = () => {
      bgImageRef.current = img;
      renderAllCanvases();
    };
  }, []);

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

  // Render FRONT Canvas
  const renderFrontCanvas = useCallback(() => {
    const canvas = frontCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const currentFmt = CARD_FORMATS[format];
    const w = currentFmt.width;
    const h = currentFmt.height;

    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }

    // 1. Dark Base
    ctx.fillStyle = '#060608';
    ctx.fillRect(0, 0, w, h);

    // 2. Subtle photo background if enabled
    if (showPhotoBg && bgImageRef.current) {
      ctx.save();
      ctx.globalAlpha = 0.28;
      ctx.filter = 'grayscale(100%) contrast(140%) brightness(70%)';

      const img = bgImageRef.current;
      const imgRatio = img.width / img.height;
      const canvasRatio = w / h;
      let dW, dH;
      if (imgRatio > canvasRatio) {
        dH = h;
        dW = h * imgRatio;
      } else {
        dW = w;
        dH = w / imgRatio;
      }
      ctx.drawImage(img, (w - dW) / 2, (h - dH) / 2, dW, dH);
      ctx.restore();
    }

    // Radial dark glow
    const radGrad = ctx.createRadialGradient(w / 2, h / 2, 40, w / 2, h / 2, w * 0.7);
    radGrad.addColorStop(0, 'rgba(255, 0, 60, 0.08)');
    radGrad.addColorStop(1, 'rgba(6, 6, 8, 0.92)');
    ctx.fillStyle = radGrad;
    ctx.fillRect(0, 0, w, h);

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

      ctx.strokeStyle = accentColor;
      ctx.lineWidth = 3;
      ctx.shadowColor = accentColor;
      ctx.shadowBlur = 10;
      ctx.stroke();

      // Corner accent blocks
      ctx.shadowBlur = 0;
      ctx.fillStyle = accentColor;
      ctx.fillRect(inset + bevel, inset - 3, 24, 6);
      ctx.fillRect(w - inset - bevel - 24, inset - 3, 24, 6);
      ctx.fillRect(inset + bevel, h - inset - 3, 24, 6);
      ctx.fillRect(w - inset - bevel - 24, h - inset - 3, 24, 6);

      ctx.restore();
    }

    // 4. Technical accents (if enabled)
    if (showTechAccents) {
      ctx.save();
      ctx.fillStyle = '#64748B';
      ctx.font = '600 12px "Outfit", monospace';
      ctx.letterSpacing = '1px';

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
      ctx.fillText('[ PRO DJ LINK • 48kHz MASTER ]', 70, 54);
      ctx.fillText('[ 22° 09\' N // 100° 58\' W ]', w - 240, 54);

      // Mini EQ bars
      const eqX = w - 130;
      const eqY = h - 60;
      const heights = [8, 14, 6, 18, 12, 16, 9, 5];
      for (let i = 0; i < heights.length; i++) {
        ctx.fillStyle = i % 2 === 0 ? accentColor : 'rgba(255, 255, 255, 0.5)';
        ctx.fillRect(eqX + i * 6, eqY - heights[i], 4, heights[i]);
      }
      ctx.restore();
    }

    // 5. Main Front Branding
    ctx.save();
    const centerY = format === 'horizontal' ? h * 0.46 : h * 0.42;

    // Pill badge: OFFICIAL DJ PRESS CARD
    const badgeText = 'OFFICIAL DJ PRESS CARD // PIONEER PRO DJ';
    ctx.font = '700 12px "Outfit", sans-serif';
    const bW = ctx.measureText(badgeText).width + 30;
    const bH = 26;
    const bX = (w - bW) / 2;
    const bY = centerY - 95;

    ctx.fillStyle = 'rgba(12, 12, 16, 0.9)';
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.roundRect(bX, bY, bW, bH, 6);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = accentColor;
    ctx.beginPath();
    ctx.arc(bX + 12, bY + bH / 2, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(badgeText, bX + 22, bY + bH / 2);

    // Main Artist Title: MISSAFX
    const titleUpper = artistName.trim().toUpperCase() || 'MISSAFX';
    ctx.font = '900 88px "Syne", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    if (titleUpper.startsWith('MISSA') && titleUpper.endsWith('FX')) {
      const p1 = 'MISSA';
      const p2 = 'FX';
      const m1 = ctx.measureText(p1).width;
      const m2 = ctx.measureText(p2).width;
      const totalW = m1 + m2;
      const sX = (w - totalW) / 2;

      ctx.textAlign = 'left';
      ctx.fillStyle = accentColor;
      ctx.fillText(p1, sX, centerY);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(p2, sX + m1, centerY);
    } else {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(titleUpper, w / 2, centerY);
    }

    // Role / Genre Pill
    if (roleGenre.trim()) {
      ctx.font = '800 16px "Syne", sans-serif';
      const rText = roleGenre.trim().toUpperCase();
      const rW = ctx.measureText(rText).width + 28;
      const rH = 30;
      const rX = (w - rW) / 2;
      const rY = centerY + 58;

      ctx.fillStyle = accentColor;
      ctx.beginPath();
      ctx.roundRect(rX, rY, rW, rH, 5);
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(rText, w / 2, rY + rH / 2);
    }

    // Real name & Location bottom bar
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '600 15px "Outfit", sans-serif';
    ctx.fillStyle = '#E2E8F0';
    ctx.fillText(realName.trim(), w / 2, centerY + 115);

    ctx.font = '500 13px "Outfit", sans-serif';
    ctx.fillStyle = '#94A3B8';
    ctx.fillText(`${cityLocation.trim()} • DIRECT BOOKING & TOURS`, w / 2, centerY + 138);

    ctx.restore();
  }, [
    format,
    artistName,
    realName,
    roleGenre,
    cityLocation,
    accentColor,
    showCyberFrame,
    showTechAccents,
    showPhotoBg
  ]);

  // Render BACK Canvas
  const renderBackCanvas = useCallback(() => {
    const canvas = backCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const currentFmt = CARD_FORMATS[format];
    const w = currentFmt.width;
    const h = currentFmt.height;

    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }

    // 1. Dark Base Background
    ctx.fillStyle = '#060608';
    ctx.fillRect(0, 0, w, h);

    // Subtle technical grid
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

      ctx.strokeStyle = accentColor;
      ctx.lineWidth = 3;
      ctx.shadowColor = accentColor;
      ctx.shadowBlur = 10;
      ctx.stroke();

      ctx.shadowBlur = 0;
      ctx.fillStyle = accentColor;
      ctx.fillRect(inset + bevel, inset - 3, 24, 6);
      ctx.fillRect(w - inset - bevel - 24, inset - 3, 24, 6);
      ctx.fillRect(inset + bevel, h - inset - 3, 24, 6);
      ctx.fillRect(w - inset - bevel - 24, h - inset - 3, 24, 6);
      ctx.restore();
    }

    // 3. Technical Accents (if enabled)
    if (showTechAccents) {
      ctx.save();
      ctx.fillStyle = '#64748B';
      ctx.font = '600 12px "Outfit", monospace';

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

      ctx.fillText('NEXORA SECURITY // ENCRYPTED QR', 70, 54);
      ctx.fillText('[ CARD AUTH ID: #MFX-2026 ]', w - 240, 54);
      ctx.restore();
    }

    // 4. Content Layout (Horizontal: Left = Info, Right = QR. Vertical/Square: Stacked)
    if (format === 'horizontal') {
      const leftColX = 75;
      const rightColX = w - 340;
      const qrBoxSize = 220;
      const qrBoxY = (h - qrBoxSize) / 2 - 10;

      // Left Column: Contact & Booking Info
      ctx.save();
      // Mini Logo Header
      ctx.font = '900 32px "Syne", sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillStyle = accentColor;
      ctx.fillText('MISSA', leftColX, 85);
      const m1 = ctx.measureText('MISSA').width;
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText('FX', leftColX + m1, 85);

      ctx.font = '700 13px "Outfit", sans-serif';
      ctx.fillStyle = 'var(--text-muted)';
      ctx.fillText('DIRECT BOOKING & PRESS KIT', leftColX, 126);

      // Red Accent Divider
      ctx.strokeStyle = accentColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(leftColX, 150);
      ctx.lineTo(leftColX + 320, 150);
      ctx.stroke();

      // Info rows
      ctx.font = '600 16px "Outfit", sans-serif';
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(`WA: ${phoneWhatsapp.trim()}`, leftColX, 180);

      ctx.font = '500 14px "Outfit", sans-serif';
      ctx.fillStyle = '#94A3B8';
      ctx.fillText(`LOC: ${cityLocation.trim()}`, leftColX, 214);
      ctx.fillText(`TAG: ${tagline.trim()}`, leftColX, 244);

      // Social networks pills if enabled
      if (showSocialBadges) {
        ctx.font = '700 12px "Outfit", monospace';
        ctx.fillStyle = accentColor;
        ctx.fillText('CHANNELS: IG • KICK • SOUNDCLOUD • WA', leftColX, 280);

        ctx.font = '600 13px "Outfit", sans-serif';
        ctx.fillStyle = '#E2E8F0';
        ctx.fillText('@missafx_ // oficial', leftColX, 305);
      }

      // Nexora Footer
      ctx.font = '600 11px "Outfit", monospace';
      ctx.fillStyle = '#475569';
      ctx.fillText('BY NEXORA IT // WWW.ITNEXORA.COM', leftColX, h - 60);
      ctx.restore();

      // Right Column: QR Code Box (if enabled)
      if (showQr && qrDataUrl) {
        ctx.save();
        // White rounded background container for maximum scan readability
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.roundRect(rightColX, qrBoxY, qrBoxSize, qrBoxSize, 14);
        ctx.fill();

        // Glowing cyber border around QR
        ctx.strokeStyle = accentColor;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw QR Image
        const qrImg = new Image();
        qrImg.src = qrDataUrl;
        if (qrImg.complete) {
          ctx.drawImage(qrImg, rightColX + 10, qrBoxY + 10, qrBoxSize - 20, qrBoxSize - 20);
        } else {
          qrImg.onload = () => {
            renderBackCanvas();
          };
        }

        // QR label text below
        ctx.fillStyle = '#E2E8F0';
        ctx.font = '700 11px "Outfit", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';

        const maxLabelW = 260;
        ctx.fillText(qrLabelText.trim().toUpperCase(), rightColX + qrBoxSize / 2, qrBoxY + qrBoxSize + 14);
        ctx.restore();
      }
    } else {
      // Vertical or Square Layout: Stacked
      ctx.save();
      const qrBoxSize = format === 'vertical' ? 260 : 220;
      const qrBoxX = (w - qrBoxSize) / 2;
      const qrBoxY = format === 'vertical' ? 140 : 120;

      // Header
      ctx.font = '900 36px "Syne", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillStyle = accentColor;
      ctx.fillText('MISSAFX', w / 2, 70);

      // QR Box
      if (showQr && qrDataUrl) {
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.roundRect(qrBoxX, qrBoxY, qrBoxSize, qrBoxSize, 16);
        ctx.fill();

        ctx.strokeStyle = accentColor;
        ctx.lineWidth = 2.5;
        ctx.stroke();

        const qrImg = new Image();
        qrImg.src = qrDataUrl;
        if (qrImg.complete) {
          ctx.drawImage(qrImg, qrBoxX + 12, qrBoxY + 12, qrBoxSize - 24, qrBoxSize - 24);
        } else {
          qrImg.onload = () => renderBackCanvas();
        }

        ctx.fillStyle = '#FFFFFF';
        ctx.font = '700 13px "Outfit", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(qrLabelText.trim().toUpperCase(), w / 2, qrBoxY + qrBoxSize + 18);
      }

      // Contact details below
      const infoBaseY = qrBoxY + qrBoxSize + 60;
      ctx.font = '700 18px "Outfit", sans-serif';
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(`WA: ${phoneWhatsapp.trim()}`, w / 2, infoBaseY);

      ctx.font = '500 14px "Outfit", sans-serif';
      ctx.fillStyle = '#94A3B8';
      ctx.fillText(cityLocation.trim(), w / 2, infoBaseY + 28);
      ctx.fillText(tagline.trim(), w / 2, infoBaseY + 52);

      if (showSocialBadges) {
        ctx.font = '700 13px "Outfit", monospace';
        ctx.fillStyle = accentColor;
        ctx.fillText('@missafx_ • KICK • INSTAGRAM • SOUNDCLOUD', w / 2, infoBaseY + 90);
      }

      ctx.font = '600 11px "Outfit", monospace';
      ctx.fillStyle = '#475569';
      ctx.fillText('BY NEXORA IT // WWW.ITNEXORA.COM', w / 2, h - 55);

      ctx.restore();
    }
  }, [
    format,
    artistName,
    realName,
    roleGenre,
    phoneWhatsapp,
    cityLocation,
    tagline,
    accentColor,
    qrDataUrl,
    qrLabelText,
    showQr,
    showCyberFrame,
    showTechAccents,
    showSocialBadges
  ]);

  // Master render for all canvases
  const renderAllCanvases = useCallback(() => {
    renderFrontCanvas();
    renderBackCanvas();
  }, [renderFrontCanvas, renderBackCanvas]);

  useEffect(() => {
    renderAllCanvases();
  }, [renderAllCanvases]);

  // Export functions
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
        `missafx-card-front-${CARD_FORMATS[format].width}x${CARD_FORMATS[format].height}.png`
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
        `missafx-card-back-${CARD_FORMATS[format].width}x${CARD_FORMATS[format].height}.png`
      );
      setIsExporting(false);
      setExportMessage(cT.exportSuccess);
      setTimeout(() => setExportMessage(''), 3500);
    }, 100);
  };

  // Download both sides together in one combined print-ready sheet
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

      const w = CARD_FORMATS[format].width;
      const h = CARD_FORMATS[format].height;

      const dualCanvas = document.createElement('canvas');
      const ctx = dualCanvas.getContext('2d');

      if (format === 'horizontal') {
        // Stacked vertically with trim gap
        dualCanvas.width = w + 80;
        dualCanvas.height = h * 2 + 140;

        ctx.fillStyle = '#0a0a0e';
        ctx.fillRect(0, 0, dualCanvas.width, dualCanvas.height);

        // Header sheet title
        ctx.fillStyle = '#94A3B8';
        ctx.font = '700 16px "Outfit", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('MISSAFX // PRINT READY DUAL-SIDE PRESS CARD (300 DPI)', dualCanvas.width / 2, 35);

        // Draw Front
        ctx.drawImage(frontCanvas, 40, 55);

        // Divider
        ctx.strokeStyle = 'rgba(255, 0, 60, 0.4)';
        ctx.lineWidth = 2;
        ctx.setLineDash([8, 8]);
        ctx.beginPath();
        ctx.moveTo(40, h + 85);
        ctx.lineTo(w + 40, h + 85);
        ctx.stroke();

        ctx.fillStyle = '#FF003C';
        ctx.font = '600 12px "Outfit", monospace';
        ctx.fillText('--- LÍNEA DE CORTE / TRIM LINE ---', dualCanvas.width / 2, h + 89);

        // Draw Back
        ctx.drawImage(backCanvas, 40, h + 115);
      } else {
        // Side by side
        dualCanvas.width = w * 2 + 140;
        dualCanvas.height = h + 80;

        ctx.fillStyle = '#0a0a0e';
        ctx.fillRect(0, 0, dualCanvas.width, dualCanvas.height);

        ctx.drawImage(frontCanvas, 40, 40);
        ctx.drawImage(backCanvas, w + 100, 40);
      }

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

        {/* Wizard Step Tabs */}
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
            { id: 2, label: cT.step2, icon: Type },
            { id: 3, label: cT.step3, icon: QrCode },
            { id: 4, label: cT.step4, icon: Layers },
            { id: 5, label: cT.step5, icon: Download }
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
                    ? '1px solid #FF003C'
                    : '1px solid rgba(255, 255, 255, 0.06)',
                  background: isActive
                    ? 'rgba(255, 0, 60, 0.12)'
                    : 'rgba(255, 255, 255, 0.02)',
                  color: isActive ? '#FFFFFF' : 'var(--text-muted)',
                  transition: 'all 0.2s ease'
                }}
              >
                <Icon size={15} color={isActive ? '#FF003C' : 'var(--text-dim)'} />
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
            {/* STEP 1: Format Selection */}
            {activeStep === 1 && (
              <div>
                <h3 className="font-display" style={{ fontSize: '1.25rem', marginBottom: '8px', color: '#fff' }}>
                  {cT.formatTitle}
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '20px' }}>
                  {cT.formatHint}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {Object.values(CARD_FORMATS).map((fmt) => {
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
                            ? '2px solid #FF003C'
                            : '1px solid rgba(255, 255, 255, 0.08)',
                          background: isSelected
                            ? 'rgba(255, 0, 60, 0.08)'
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
                                ? 'rgba(255, 0, 60, 0.2)'
                                : 'rgba(255, 255, 255, 0.04)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: isSelected ? '#FF003C' : 'var(--text-muted)'
                            }}
                          >
                            <Icon size={24} />
                          </div>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
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
                            <p style={{ fontSize: '0.82rem', color: 'var(--text-dim)', margin: 0 }}>
                              {cT[fmt.noteKey]}
                            </p>
                          </div>
                        </div>

                        {isSelected && <CheckCircle2 size={20} color="#FF003C" />}
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
                    <span>Siguiente: Datos & Textos →</span>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Info & Details */}
            {activeStep === 2 && (
              <div>
                <h3 className="font-display" style={{ fontSize: '1.25rem', marginBottom: '8px', color: '#fff' }}>
                  {cT.textTitle}
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '20px' }}>
                  Personaliza los datos artísticos y de contacto que se imprimirán en la tarjeta.
                </p>

                {/* Artist Name */}
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#fff', display: 'block', marginBottom: '6px' }}>
                    {cT.artistName}
                  </label>
                  <input
                    type="text"
                    value={artistName}
                    maxLength={20}
                    onChange={(e) => setArtistName(e.target.value)}
                    placeholder="MISSAFX"
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

                {/* Real Name */}
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#fff', display: 'block', marginBottom: '6px' }}>
                    {cT.realName}
                  </label>
                  <input
                    type="text"
                    value={realName}
                    maxLength={30}
                    onChange={(e) => setRealName(e.target.value)}
                    placeholder="Missael G."
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

                {/* Role / Genre */}
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#fff', display: 'block', marginBottom: '6px' }}>
                    {cT.roleGenre}
                  </label>
                  <input
                    type="text"
                    value={roleGenre}
                    maxLength={35}
                    onChange={(e) => setRoleGenre(e.target.value)}
                    placeholder="DJ & TECH HOUSE PRODUCER"
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

                {/* WhatsApp */}
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#fff', display: 'block', marginBottom: '6px' }}>
                    {cT.phoneWhatsapp}
                  </label>
                  <input
                    type="text"
                    value={phoneWhatsapp}
                    maxLength={25}
                    onChange={(e) => setPhoneWhatsapp(e.target.value)}
                    placeholder="+52 1 444 357 0777"
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

                {/* City */}
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#fff', display: 'block', marginBottom: '6px' }}>
                    {cT.cityLocation}
                  </label>
                  <input
                    type="text"
                    value={cityLocation}
                    maxLength={35}
                    onChange={(e) => setCityLocation(e.target.value)}
                    placeholder="San Luis Potosí, México"
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

                {/* Tagline */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#fff', display: 'block', marginBottom: '6px' }}>
                    {cT.tagline}
                  </label>
                  <input
                    type="text"
                    value={tagline}
                    maxLength={45}
                    onChange={(e) => setTagline(e.target.value)}
                    placeholder="Tech House • Club Dates • Festivals"
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

                {/* Accent Color */}
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '10px' }}>
                    {cT.accentColor}
                  </label>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    {[
                      { color: '#FF003C', label: 'Rojo' },
                      { color: '#FFFFFF', label: 'Blanco' },
                      { color: '#53FC18', label: 'Kick Neón' },
                      { color: '#EAB308', label: 'VIP Gold' }
                    ].map((item) => (
                      <button
                        key={item.color}
                        onClick={() => setAccentColor(item.color)}
                        style={{
                          flex: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          padding: '10px',
                          borderRadius: '8px',
                          border:
                            accentColor === item.color
                              ? '2px solid #fff'
                              : '1px solid rgba(255, 255, 255, 0.1)',
                          background: 'rgba(255, 255, 255, 0.04)',
                          cursor: 'pointer',
                          color: '#fff',
                          fontSize: '0.78rem',
                          fontWeight: 600
                        }}
                      >
                        <span
                          style={{
                            width: '12px',
                            height: '12px',
                            borderRadius: '50%',
                            background: item.color,
                            display: 'inline-block'
                          }}
                        />
                        <span>{item.label}</span>
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
                    <span>← Formato</span>
                  </button>
                  <button
                    onClick={() => {
                      setActiveStep(3);
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

            {/* STEP 3: QR Code Configuration */}
            {activeStep === 3 && (
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
                              ? '1px solid #FF003C'
                              : '1px solid rgba(255, 255, 255, 0.1)',
                            background: isSelected
                              ? 'rgba(255, 0, 60, 0.12)'
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
                          {isSelected && <Check size={14} color="#FF003C" />}
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
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#fff', display: 'block', marginBottom: '6px' }}>
                    {cT.qrLabelText}
                  </label>
                  <input
                    type="text"
                    value={qrLabelText}
                    maxLength={40}
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

                {/* Prev / Next */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '28px' }}>
                  <button
                    onClick={() => {
                      setActiveStep(2);
                      setIsFlipped(false);
                      setActiveSide('front');
                    }}
                    className="btn btn-secondary btn-sm"
                    style={{ cursor: 'pointer' }}
                  >
                    <span>← Datos</span>
                  </button>
                  <button
                    onClick={() => setActiveStep(4)}
                    className="btn btn-primary btn-sm"
                    style={{ cursor: 'pointer' }}
                  >
                    <span>Siguiente: Máscaras →</span>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: Masks & Layers */}
            {activeStep === 4 && (
              <div>
                <h3 className="font-display" style={{ fontSize: '1.25rem', marginBottom: '8px', color: '#fff' }}>
                  {cT.masksTitle}
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '20px' }}>
                  Activa o desactiva las capas y detalles estéticos para personalizar ambas caras.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {[
                    {
                      id: 'qr',
                      label: cT.maskQr,
                      active: showQr,
                      toggle: () => setShowQr(!showQr)
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
                      id: 'socialBadges',
                      label: cT.maskSocialBadges,
                      active: showSocialBadges,
                      toggle: () => setShowSocialBadges(!showSocialBadges)
                    },
                    {
                      id: 'photoBg',
                      label: cT.maskPhotoBg,
                      active: showPhotoBg,
                      toggle: () => setShowPhotoBg(!showPhotoBg)
                    }
                  ].map((layer) => (
                    <div
                      key={layer.id}
                      onClick={layer.toggle}
                      style={{
                        padding: '16px 18px',
                        borderRadius: '12px',
                        border: layer.active
                          ? '1px solid rgba(255, 0, 60, 0.4)'
                          : '1px solid rgba(255, 255, 255, 0.08)',
                        background: layer.active
                          ? 'rgba(255, 0, 60, 0.06)'
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
                          <Eye size={18} color="#FF003C" />
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

                      {/* Toggle switch */}
                      <div
                        style={{
                          width: '44px',
                          height: '24px',
                          borderRadius: '12px',
                          background: layer.active ? '#FF003C' : 'rgba(255, 255, 255, 0.1)',
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

                {/* Prev / Next */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '28px' }}>
                  <button
                    onClick={() => setActiveStep(3)}
                    className="btn btn-secondary btn-sm"
                    style={{ cursor: 'pointer' }}
                  >
                    <span>← Código QR</span>
                  </button>
                  <button
                    onClick={() => setActiveStep(5)}
                    className="btn btn-primary btn-sm"
                    style={{ cursor: 'pointer' }}
                  >
                    <span>Siguiente: Exportar →</span>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 5: Export & Downloads */}
            {activeStep === 5 && (
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
                      border: '1px solid rgba(255, 0, 60, 0.4)'
                    }}
                  >
                    <Download size={18} color="#FF003C" />
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
                    onClick={() => setActiveStep(4)}
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
                maxWidth: format === 'horizontal' ? '460px' : format === 'square' ? '380px' : '340px',
                background: 'rgba(12, 12, 16, 0.85)',
                padding: '20px',
                borderRadius: '24px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 24px 48px rgba(0, 0, 0, 0.8), 0 0 30px rgba(255, 0, 60, 0.12)'
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
                  <Sparkles size={16} color="#FF003C" />
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
                    background: isFlipped ? 'rgba(83, 252, 24, 0.15)' : 'rgba(255, 0, 60, 0.15)',
                    color: isFlipped ? '#53fc18' : '#FF003C',
                    border: isFlipped ? '1px solid rgba(83, 252, 24, 0.3)' : '1px solid rgba(255, 0, 60, 0.3)'
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
                  aspectRatio: CARD_FORMATS[format].aspectRatio,
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
                      ? '1px solid #FF003C'
                      : '1px solid rgba(255, 255, 255, 0.08)',
                    background: !isFlipped
                      ? 'rgba(255, 0, 60, 0.15)'
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
                      ? '1px solid #FF003C'
                      : '1px solid rgba(255, 255, 255, 0.08)',
                    background: isFlipped
                      ? 'rgba(255, 0, 60, 0.15)'
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
                  <RefreshCw size={14} color="#FF003C" />
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
