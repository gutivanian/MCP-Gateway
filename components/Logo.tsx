export function Logo({ withWordmark = true, size = 26 }: { withWordmark?: boolean; size?: number }) {
  return (
    <span className="logo">
      <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden>
        <defs>
          <linearGradient id="conduit-mark" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#06B6D4" />
            <stop offset="1" stopColor="#3B82F6" />
          </linearGradient>
        </defs>
        <rect x="1" y="1" width="30" height="30" rx="9" fill="#0D1B2A" stroke="#1D3A50" />
        <path d="M7 11h7a3 3 0 013 3v4a3 3 0 003 3h5" stroke="url(#conduit-mark)" strokeWidth="2.2" strokeLinecap="round" fill="none" />
        <circle cx="7" cy="11" r="2.2" fill="#14B8A6" />
        <circle cx="25" cy="21" r="2.2" fill="#06B6D4" />
      </svg>
      {withWordmark && <span className="logo__word">Conduit</span>}
    </span>
  )
}
