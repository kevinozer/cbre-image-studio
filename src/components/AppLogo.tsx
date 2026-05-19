/** Logo: house silhouette with camera lens iris */
export function AppLogo({ size = 48, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <path d="M9 22l15-12 15 12v15a2 2 0 0 1-2 2H11a2 2 0 0 1-2-2V22z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <circle cx="24" cy="29" r="5" stroke="currentColor" strokeWidth="2" />
      <circle cx="24" cy="29" r="1.5" fill="currentColor" opacity="0.55" />
      <line x1="20" y1="29" x2="22" y2="29" stroke="currentColor" strokeWidth="1.5" opacity="0.55" />
      <line x1="26" y1="29" x2="28" y2="29" stroke="currentColor" strokeWidth="1.5" opacity="0.55" />
    </svg>
  );
}
