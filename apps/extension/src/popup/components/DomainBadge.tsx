import React, { useState } from 'react';

type TrustLevel = 'verified' | 'unknown' | 'suspicious';

interface DomainBadgeProps {
  domain: string;
  trustLevel: TrustLevel;
  fullUrl?: string;
}

const TRUST_CONFIG: Record<TrustLevel, { bg: string; text: string; icon: string; label: string }> = {
  verified: {
    bg: 'bg-pilot-success/20',
    text: 'text-pilot-success',
    icon: '\u2713',
    label: 'Verified',
  },
  unknown: {
    bg: 'bg-pilot-warning/20',
    text: 'text-pilot-warning',
    icon: '\u26A0',
    label: 'Unknown',
  },
  suspicious: {
    bg: 'bg-pilot-danger/20',
    text: 'text-pilot-danger',
    icon: '\u26D4',
    label: 'Suspicious',
  },
};

export const DomainBadge: React.FC<DomainBadgeProps> = ({ domain, trustLevel, fullUrl }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const config = TRUST_CONFIG[trustLevel];

  return (
    <div className="relative inline-flex items-center">
      <div
        className={`flex items-center gap-2 px-3 py-2 rounded-lg ${config.bg} min-h-[44px] cursor-default`}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        role="status"
        aria-label={`${domain} - ${config.label}`}
      >
        <span className={`text-base ${config.text}`} aria-hidden="true">
          {config.icon}
        </span>
        <span className={`font-bold text-sm ${config.text}`}>
          {domain}
        </span>
        <span className={`text-xs ${config.text} opacity-75`}>
          {config.label}
        </span>
      </div>

      {showTooltip && fullUrl && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-pilot-surface border border-pilot-border rounded text-xs text-pilot-muted whitespace-nowrap z-10">
          {fullUrl}
        </div>
      )}
    </div>
  );
};
