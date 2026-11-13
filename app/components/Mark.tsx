export function Mark({ size = 40 }: { size?: number }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} aria-hidden="true">
      <path d="M16 9.5L24 9.5A8 8 0 0 0 40 9.5L48 9.5A4.5 4.5 0 0 1 52.5 14L52.5 40.5L35 53.5A5.5 5.5 0 0 1 29 53.5L11.5 40.5L11.5 14A4.5 4.5 0 0 1 16 9.5Z" fill="none" stroke="#FAF8F4" strokeWidth="6.5" strokeLinejoin="round" />
      <circle cx="32" cy="10" r="5" fill="#1cbc10" />
    </svg>
  );
}
