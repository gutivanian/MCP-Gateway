type IconName =
  | 'grid' | 'layers' | 'plus' | 'copy' | 'check' | 'key' | 'refresh' | 'trash'
  | 'power' | 'logout' | 'code' | 'arrow' | 'shield' | 'bolt' | 'terminal' | 'json'

const PATHS: Record<IconName, string> = {
  grid: 'M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z',
  layers: 'M12 3l9 5-9 5-9-5 9-5zM3 13l9 5 9-5M3 17l9 5 9-5',
  plus: 'M12 5v14M5 12h14',
  copy: 'M9 9h10v10H9zM5 15V5h10',
  check: 'M5 12.5l4.5 4.5L19 7.5',
  key: 'M15 7a4 4 0 11-3.2 6.4L4 21v-3h2v-2h2l2.6-2.6A4 4 0 0115 7z',
  refresh: 'M4 4v6h6M20 20v-6h-6M5.6 14a7 7 0 0012 2.6M18.4 10a7 7 0 00-12-2.6',
  trash: 'M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13',
  power: 'M12 3v9M6.3 6.3a8 8 0 1011.4 0',
  logout: 'M10 4H5v16h5M15 8l4 4-4 4M19 12H9',
  code: 'M8 8l-4 4 4 4M16 8l4 4-4 4M14 5l-4 14',
  arrow: 'M5 12h14M13 6l6 6-6 6',
  shield: 'M12 3l8 3v6c0 4.5-3.4 8-8 9-4.6-1-8-4.5-8-9V6l8-3z',
  bolt: 'M13 2L4 14h7l-1 8 9-12h-7l1-8z',
  terminal: 'M4 5h16v14H4zM7 9l3 3-3 3M12 15h5',
  json: 'M9 4c-2 0-2 1-2 3v3c0 1-1 2-2 2 1 0 2 1 2 2v3c0 2 0 3 2 3M15 4c2 0 2 1 2 3v3c0 1 1 2 2 2-1 0-2 1-2 2v3c0 2 0 3-2 3',
}

export function Icon({ name, size = 18, className = '' }: { name: IconName; size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={`icon ${className}`}
    >
      <path d={PATHS[name]} />
    </svg>
  )
}

export type { IconName }
