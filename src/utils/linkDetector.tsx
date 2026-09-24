import React from 'react';
import { Globe, ExternalLink } from 'lucide-react';

export type SocialPlatformId =
  | 'tiktok'
  | 'instagram'
  | 'facebook'
  | 'youtube'
  | 'twitter'
  | 'whatsapp'
  | 'telegram'
  | 'pinterest'
  | 'discord'
  | 'spotify'
  | 'artstation'
  | 'behance'
  | 'linkedin'
  | 'twitch'
  | 'snapchat'
  | 'website';

export interface DetectedPlatform {
  id: SocialPlatformId;
  name: string;
  sanitizedUrl: string;
  displayLabel: string;
  badgeBg: string;
  textColor: string;
  borderColor: string;
  hoverBg: string;
  icon: (className?: string) => React.ReactNode;
}

/**
 * Normalizes user input into a valid HTTP/HTTPS URL
 */
export function normalizeUrl(input: string): string {
  let trimmed = input.trim();
  if (!trimmed) return '';

  // If user pasted @handle without domain, assume instagram or tiktok if contextual, otherwise keep as is
  if (trimmed.startsWith('@')) {
    trimmed = `https://instagram.com/${trimmed.slice(1)}`;
  }

  // Prepend https:// if protocol is missing
  if (!/^https?:\/\//i.test(trimmed)) {
    trimmed = `https://${trimmed}`;
  }

  return trimmed;
}

/**
 * Extracts a concise human-friendly label from a URL
 */
function extractDisplayLabel(url: string, platformId: SocialPlatformId): string {
  try {
    const parsed = new URL(url);
    const path = parsed.pathname.replace(/^\/+|\/+$/g, '');
    const cleanPath = path.split('/')[0] || '';

    switch (platformId) {
      case 'tiktok': {
        const match = url.match(/@([a-zA-Z0-9_.-]+)/i) || path.match(/([a-zA-Z0-9_.-]+)/i);
        return match ? (match[0].startsWith('@') ? match[0] : `@${match[1]}`) : 'TikTok';
      }
      case 'instagram': {
        if (cleanPath && !['p', 'reel', 'stories', 'explore'].includes(cleanPath)) {
          return `@${cleanPath}`;
        }
        return 'Instagram';
      }
      case 'facebook': {
        if (cleanPath && !['profile.php', 'groups', 'share'].includes(cleanPath)) {
          return cleanPath;
        }
        return 'Facebook';
      }
      case 'youtube': {
        const channel = path.match(/@([a-zA-Z0-9_.-]+)/i);
        if (channel) return channel[0];
        return 'YouTube';
      }
      case 'twitter': {
        if (cleanPath) return `@${cleanPath}`;
        return 'X (Twitter)';
      }
      case 'whatsapp': {
        return 'WhatsApp';
      }
      case 'telegram': {
        if (cleanPath) return `@${cleanPath}`;
        return 'Telegram';
      }
      case 'pinterest': {
        if (cleanPath) return cleanPath;
        return 'Pinterest';
      }
      case 'discord': {
        return 'Discord';
      }
      case 'spotify': {
        return 'Spotify';
      }
      case 'artstation': {
        if (cleanPath) return cleanPath;
        return 'ArtStation';
      }
      case 'behance': {
        if (cleanPath) return cleanPath;
        return 'Behance';
      }
      case 'linkedin': {
        return 'LinkedIn';
      }
      case 'twitch': {
        if (cleanPath) return `@${cleanPath}`;
        return 'Twitch';
      }
      case 'snapchat': {
        const snap = path.replace('add/', '');
        return snap ? `@${snap}` : 'Snapchat';
      }
      default: {
        return parsed.hostname.replace(/^www\./i, '');
      }
    }
  } catch {
    return 'Web Sitesi';
  }
}

/**
 * Intelligent automatic platform detector from any URL or handle input
 */
export function detectPlatform(rawInput: string): DetectedPlatform | null {
  if (!rawInput || !rawInput.trim()) return null;

  const url = normalizeUrl(rawInput);
  const lower = url.toLowerCase();

  // 1. TikTok
  if (lower.includes('tiktok.com') || lower.includes('musical.ly')) {
    return {
      id: 'tiktok',
      name: 'TikTok',
      sanitizedUrl: url,
      displayLabel: extractDisplayLabel(url, 'tiktok'),
      badgeBg: 'bg-[#000000]',
      textColor: 'text-white',
      borderColor: 'border-[#25F4EE]/40 hover:border-[#FE2C55]',
      hoverBg: 'hover:bg-[#121212]',
      icon: (className = 'w-4 h-4') => (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.86 4.46 6.27 6.27 0 0 0 1.94-4.46V8.92a8.28 8.28 0 0 0 4.79 1.5V6.97a4.91 4.91 0 0 1-1-.28z"/>
        </svg>
      ),
    };
  }

  // 2. Instagram
  if (lower.includes('instagram.com') || lower.includes('instagr.am')) {
    return {
      id: 'instagram',
      name: 'Instagram',
      sanitizedUrl: url,
      displayLabel: extractDisplayLabel(url, 'instagram'),
      badgeBg: 'bg-gradient-to-r from-[#833ab4]/20 via-[#fd1d1d]/20 to-[#fcb045]/20',
      textColor: 'text-white',
      borderColor: 'border-[#fd1d1d]/40 hover:border-[#fcb045]',
      hoverBg: 'hover:bg-gradient-to-r hover:from-[#833ab4]/40 hover:to-[#fd1d1d]/40',
      icon: (className = 'w-4 h-4') => (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
          <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
        </svg>
      ),
    };
  }

  // 3. Facebook
  if (lower.includes('facebook.com') || lower.includes('fb.com') || lower.includes('fb.me') || lower.includes('fb.watch')) {
    return {
      id: 'facebook',
      name: 'Facebook',
      sanitizedUrl: url,
      displayLabel: extractDisplayLabel(url, 'facebook'),
      badgeBg: 'bg-[#1877F2]/15',
      textColor: 'text-white',
      borderColor: 'border-[#1877F2]/40 hover:border-[#1877F2]',
      hoverBg: 'hover:bg-[#1877F2]/25',
      icon: (className = 'w-4 h-4') => (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      ),
    };
  }

  // 4. YouTube
  if (lower.includes('youtube.com') || lower.includes('youtu.be')) {
    return {
      id: 'youtube',
      name: 'YouTube',
      sanitizedUrl: url,
      displayLabel: extractDisplayLabel(url, 'youtube'),
      badgeBg: 'bg-[#FF0000]/15',
      textColor: 'text-white',
      borderColor: 'border-[#FF0000]/40 hover:border-[#FF0000]',
      hoverBg: 'hover:bg-[#FF0000]/25',
      icon: (className = 'w-4 h-4') => (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
      ),
    };
  }

  // 5. X / Twitter
  if (lower.includes('twitter.com') || lower.includes('x.com')) {
    return {
      id: 'twitter',
      name: 'X (Twitter)',
      sanitizedUrl: url,
      displayLabel: extractDisplayLabel(url, 'twitter'),
      badgeBg: 'bg-white/10',
      textColor: 'text-white',
      borderColor: 'border-white/30 hover:border-white',
      hoverBg: 'hover:bg-white/20',
      icon: (className = 'w-4 h-4') => (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      ),
    };
  }

  // 6. WhatsApp
  if (lower.includes('wa.me') || lower.includes('whatsapp.com')) {
    return {
      id: 'whatsapp',
      name: 'WhatsApp',
      sanitizedUrl: url,
      displayLabel: extractDisplayLabel(url, 'whatsapp'),
      badgeBg: 'bg-[#25D366]/15',
      textColor: 'text-white',
      borderColor: 'border-[#25D366]/40 hover:border-[#25D366]',
      hoverBg: 'hover:bg-[#25D366]/25',
      icon: (className = 'w-4 h-4') => (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12.031 0C5.399 0 0 5.402 0 12.033c0 2.118.552 4.187 1.603 6.007L.067 24l6.143-1.611a12.015 12.015 0 0 0 5.82 1.488h.005c6.63 0 12.032-5.402 12.032-12.033.001-3.214-1.251-6.236-3.525-8.51A11.954 11.954 0 0 0 12.031 0zm-.006 21.84a9.98 9.98 0 0 1-5.097-1.393l-.366-.217-3.784.992 1.01-3.689-.239-.38a9.97 9.97 0 0 1-1.528-5.32c0-5.503 4.478-9.982 9.984-9.982 2.666 0 5.172 1.038 7.057 2.924a9.927 9.927 0 0 1 2.921 7.057c-.001 5.505-4.48 9.985-9.988 9.985zm5.474-7.472c-.3-.15-1.777-.877-2.052-.977-.275-.1-.475-.15-.675.15-.2.3-.775.977-.95 1.177-.175.2-.35.225-.65.075-.3-.15-1.267-.467-2.414-1.489-.893-.796-1.496-1.779-1.671-2.079-.175-.3-.019-.462.131-.611.136-.134.3-.35.45-.525.15-.175.2-.3.3-.5.1-.2.05-.375-.025-.525s-.675-1.626-.925-2.227c-.244-.585-.492-.506-.675-.515-.175-.009-.375-.01-.575-.01-.2 0-.525.075-.8.375s-1.05 1.026-1.05 2.502 1.075 2.899 1.225 3.1 2.115 3.23 5.125 4.529c.716.31 1.275.495 1.71.634.72.229 1.375.197 1.893.12.578-.087 1.777-.726 2.027-1.427.25-.701.25-1.302.175-1.427-.075-.125-.275-.2-.575-.35z"/>
        </svg>
      ),
    };
  }

  // 7. Telegram
  if (lower.includes('t.me') || lower.includes('telegram.me') || lower.includes('telegram.org')) {
    return {
      id: 'telegram',
      name: 'Telegram',
      sanitizedUrl: url,
      displayLabel: extractDisplayLabel(url, 'telegram'),
      badgeBg: 'bg-[#229ED9]/15',
      textColor: 'text-white',
      borderColor: 'border-[#229ED9]/40 hover:border-[#229ED9]',
      hoverBg: 'hover:bg-[#229ED9]/25',
      icon: (className = 'w-4 h-4') => (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.121l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.458c.538-.196 1.006.128.832.943z"/>
        </svg>
      ),
    };
  }

  // 8. Pinterest
  if (lower.includes('pinterest.com') || lower.includes('pin.it')) {
    return {
      id: 'pinterest',
      name: 'Pinterest',
      sanitizedUrl: url,
      displayLabel: extractDisplayLabel(url, 'pinterest'),
      badgeBg: 'bg-[#E60023]/15',
      textColor: 'text-white',
      borderColor: 'border-[#E60023]/40 hover:border-[#E60023]',
      hoverBg: 'hover:bg-[#E60023]/25',
      icon: (className = 'w-4 h-4') => (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0a12 12 0 0 0-4.37 23.18c-.06-.98-.11-2.49.02-3.56l.82-3.48s-.21-.42-.21-1.04c0-.98.57-1.71 1.28-1.71.6 0 .89.45.89 1 0 .61-.39 1.51-.59 2.35-.17.7.35 1.27 1.03 1.27 1.24 0 2.19-1.31 2.19-3.2 0-1.67-1.2-2.84-2.92-2.84-2.13 0-3.38 1.6-3.38 3.25 0 .64.25 1.33.56 1.71.06.07.07.14.05.22l-.21.87c-.03.14-.11.17-.26.1-1-.46-1.62-1.92-1.62-3.08 0-2.51 1.83-4.82 5.27-4.82 2.77 0 4.92 1.97 4.92 4.61 0 2.75-1.73 4.96-4.14 4.96-.81 0-1.57-.42-1.83-.92l-.5 1.9c-.18.7-.67 1.57-1 2.1A12 12 0 1 0 12 0z"/>
        </svg>
      ),
    };
  }

  // 9. Discord
  if (lower.includes('discord.gg') || lower.includes('discord.com')) {
    return {
      id: 'discord',
      name: 'Discord',
      sanitizedUrl: url,
      displayLabel: extractDisplayLabel(url, 'discord'),
      badgeBg: 'bg-[#5865F2]/15',
      textColor: 'text-white',
      borderColor: 'border-[#5865F2]/40 hover:border-[#5865F2]',
      hoverBg: 'hover:bg-[#5865F2]/25',
      icon: (className = 'w-4 h-4') => (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
        </svg>
      ),
    };
  }

  // 10. Spotify
  if (lower.includes('spotify.com')) {
    return {
      id: 'spotify',
      name: 'Spotify',
      sanitizedUrl: url,
      displayLabel: extractDisplayLabel(url, 'spotify'),
      badgeBg: 'bg-[#1DB954]/15',
      textColor: 'text-white',
      borderColor: 'border-[#1DB954]/40 hover:border-[#1DB954]',
      hoverBg: 'hover:bg-[#1DB954]/25',
      icon: (className = 'w-4 h-4') => (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.49 17.306a.75.75 0 0 1-1.03.248c-2.825-1.727-6.381-2.118-10.57-1.162a.75.75 0 1 1-.334-1.462c4.584-1.047 8.528-.607 11.686 1.345a.75.75 0 0 1 .248 1.031zm1.465-3.26a.937.937 0 0 1-1.288.309c-3.235-1.988-8.166-2.564-11.993-1.401a.938.938 0 0 1-.55-1.794c4.37-1.326 9.808-.686 13.522 1.598a.937.937 0 0 1 .309 1.288zm.125-3.393c-3.878-2.303-10.28-2.516-13.99-1.389a1.125 1.125 0 1 1-.655-2.154c4.267-1.296 11.332-1.044 15.797 1.607a1.125 1.125 0 1 1-1.152 1.936z"/>
        </svg>
      ),
    };
  }

  // 11. ArtStation
  if (lower.includes('artstation.com')) {
    return {
      id: 'artstation',
      name: 'ArtStation',
      sanitizedUrl: url,
      displayLabel: extractDisplayLabel(url, 'artstation'),
      badgeBg: 'bg-[#13AFF0]/15',
      textColor: 'text-white',
      borderColor: 'border-[#13AFF0]/40 hover:border-[#13AFF0]',
      hoverBg: 'hover:bg-[#13AFF0]/25',
      icon: (className = 'w-4 h-4') => (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <path d="M1.77 18.57 3.5 21.6h17l-1.73-3.03H1.77zM9.46 8.35l3.08-5.38a2 2 0 0 1 3.47 0l6.23 10.9-2.9 5.08-9.88-10.6zM0 15.63l5.59-9.76 5.48 9.76H0z"/>
        </svg>
      ),
    };
  }

  // 12. Behance
  if (lower.includes('behance.net')) {
    return {
      id: 'behance',
      name: 'Behance',
      sanitizedUrl: url,
      displayLabel: extractDisplayLabel(url, 'behance'),
      badgeBg: 'bg-[#0057FF]/15',
      textColor: 'text-white',
      borderColor: 'border-[#0057FF]/40 hover:border-[#0057FF]',
      hoverBg: 'hover:bg-[#0057FF]/25',
      icon: (className = 'w-4 h-4') => (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <path d="M22 7h-7V5h7v2zm1.726 10c-.442 1.297-2.029 3-4.726 3-3.141 0-5-2.28-5-5.5 0-3.37 2.039-5.5 5-5.5 3.018 0 4.887 2.154 4.887 5.5 0 .426-.062.836-.094 1h-7.669c.094 1.726 1.48 2.658 2.923 2.658 1.155 0 2.115-.558 2.456-1.158h2.223zm-6.903-3.5h5.059c-.114-1.424-.969-2.158-2.456-2.158-1.503 0-2.455.77-2.603 2.158zM8.384 10.155c.783-.538 1.233-1.402 1.233-2.38 0-2.19-1.745-3.775-4.571-3.775H0v16h5.207c2.973 0 4.793-1.591 4.793-4.004 0-1.425-.662-2.584-1.616-3.176l-.001.002-.001-.002a.85.85 0 0 0 .002-.002v.001-.002.001-.002.001-.002.001l-.001-.001zm-5.384-3.655h2.15c1.196 0 1.956.634 1.956 1.637 0 .977-.76 1.612-1.956 1.612H3v-3.249zm2.348 10.749H3v-3.805h2.348c1.329 0 2.137.731 2.137 1.894 0 1.15-.808 1.911-2.137 1.911z"/>
        </svg>
      ),
    };
  }

  // 13. Generic Website / Portfolio
  return {
    id: 'website',
    name: 'Web Sitesi',
    sanitizedUrl: url,
    displayLabel: extractDisplayLabel(url, 'website'),
    badgeBg: 'bg-white/5',
    textColor: 'text-white',
    borderColor: 'border-white/15 hover:border-white/40',
    hoverBg: 'hover:bg-white/10',
    icon: (className = 'w-4 h-4') => <Globe className={className} />,
  };
}

/**
 * Parses an array of URLs or fallback social handles into a cleaned list of DetectedPlatforms
 */
export function getProfileDetectedLinks(user: {
  customLinks?: string[];
  instagram?: string;
  tiktok?: string;
  discord?: string;
  website?: string;
}): DetectedPlatform[] {
  const urlSet = new Set<string>();
  const results: DetectedPlatform[] = [];

  // Helper to add if valid and unique
  const addUrl = (raw: string | undefined, defaultPrefix = '') => {
    if (!raw || !raw.trim()) return;
    let finalUrl = raw.trim();

    // If it's just a username like 'johndoe' or '@johndoe'
    if (!finalUrl.includes('.') && !finalUrl.startsWith('http')) {
      if (defaultPrefix) {
        finalUrl = `${defaultPrefix}/${finalUrl.replace(/^@/, '')}`;
      }
    }

    const detected = detectPlatform(finalUrl);
    if (detected && !urlSet.has(detected.sanitizedUrl.toLowerCase())) {
      urlSet.add(detected.sanitizedUrl.toLowerCase());
      results.push(detected);
    }
  };

  // 1. Process custom links first (user defined list)
  if (user.customLinks && Array.isArray(user.customLinks)) {
    user.customLinks.forEach((l) => addUrl(l));
  }

  // 2. Add fallback legacy fields if not already present
  if (user.tiktok) addUrl(user.tiktok, 'https://tiktok.com/@');
  if (user.instagram) addUrl(user.instagram, 'https://instagram.com');
  if (user.website) addUrl(user.website);
  if (user.discord) addUrl(user.discord, 'https://discord.gg');

  return results;
}
