import React from 'react';

// Official Instagram Icon
export function InstagramIcon({ size = 24, color = 'gradient', className = '' }) {
  const isGrad = color === 'gradient';
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}
    >
      <defs>
        <radialGradient id="instaRadialGrad" cx="30%" cy="107%" r="130%">
          <stop offset="0%" stopColor="#fdf497" />
          <stop offset="10%" stopColor="#fdf497" />
          <stop offset="50%" stopColor="#fd5949" />
          <stop offset="68%" stopColor="#d6249f" />
          <stop offset="100%" stopColor="#285AEB" />
        </radialGradient>
      </defs>
      <rect
        x="2.5"
        y="2.5"
        width="19"
        height="19"
        rx="5"
        stroke={isGrad ? 'url(#instaRadialGrad)' : color}
        strokeWidth="2.2"
        fill="none"
      />
      <circle
        cx="12"
        cy="12"
        r="4.2"
        stroke={isGrad ? 'url(#instaRadialGrad)' : color}
        strokeWidth="2.2"
        fill="none"
      />
      <circle
        cx="17.2"
        cy="6.8"
        r="1.25"
        fill={isGrad ? 'url(#instaRadialGrad)' : color}
      />
    </svg>
  );
}

// Official WhatsApp Icon
export function WhatsAppIcon({ size = 24, color = '#25D366', innerColor = '#FFFFFF', className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}
    >
      <path
        d="M20.5 3.5C18.2 1.2 15.2 0 12 0 5.4 0 0 5.4 0 12c0 2.1.5 4.2 1.6 6L.2 24l6.2-1.6c1.8 1 3.7 1.6 5.6 1.6h.1c6.6 0 12-5.4 12-12 0-3.2-1.2-6.2-3.6-8.5z"
        fill={color}
      />
      <path
        d="M17.5 14.4c-.3-.2-1.7-.8-2-.9-.3-.1-.5-.2-.7.2-.2.3-.8.9-.9 1.1-.2.2-.4.2-.7.1-.3-.1-1.3-.5-2.5-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.7.1-.1.3-.4.4-.6.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5s-.7-1.7-1-2.3c-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4s-1.2 1.2-1.2 2.9 1.2 3.4 1.4 3.6c.2.2 2.4 3.7 5.9 5.2.8.4 1.5.6 2 .8.8.3 1.6.2 2.2.1.7-.1 2.1-.9 2.4-1.7.3-.8.3-1.6.2-1.7-.1-.2-.3-.3-.6-.4z"
        fill={innerColor}
      />
    </svg>
  );
}

// Official Kick.com Icon (Signature blocky K on neon green)
export function KickIcon({ size = 24, bg = '#0E120E', color = '#53FC18', className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}
    >
      <rect width="24" height="24" rx="5" fill={bg} stroke={color} strokeWidth="1.5" />
      <path
        d="M5 4.5h4v5h1.5v-2h2v-1.5h2v-1.5h4.5v4.5h-2v1.5h-2v2h-1.5v2.5H13v2h2v1.5h2v1.5h4.5v4.5h-4.5v-1.5h-2v-1.5h-2v-2H9v5H5v-19z"
        fill={color}
      />
    </svg>
  );
}

// Official YouTube Icon (Red pill with white triangle)
export function YouTubeIcon({ size = 24, color = '#FF0000', className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}
    >
      <rect x="1.5" y="4" width="21" height="16" rx="4.5" fill={color} />
      <polygon points="10,8.5 16,12 10,15.5" fill="#FFFFFF" />
    </svg>
  );
}

// Official SoundCloud Icon (Cloud with equalizer bars)
export function SoundCloudIcon({ size = 24, color = 'gradient', className = '' }) {
  const isGrad = color === 'gradient';
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}
    >
      <defs>
        <linearGradient id="scGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FF7700" />
          <stop offset="100%" stopColor="#FF3300" />
        </linearGradient>
      </defs>
      <path
        d="M1.5 14.5v-1M3 16v-4M4.5 17v-6M6 18v-8M7.5 18.5v-9M9 18.5v-9.5M10.5 18.5v-9M12 18.5V8.5"
        stroke={isGrad ? 'url(#scGradient)' : color}
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path
        d="M12.5 18.5h6.5a4 4 0 000-8 3.5 3.5 0 00-3.3-2.3 5 5 0 00-4.7 3.3"
        fill={isGrad ? 'url(#scGradient)' : color}
      />
    </svg>
  );
}
