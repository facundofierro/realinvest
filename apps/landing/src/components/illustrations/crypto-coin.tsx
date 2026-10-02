export function CryptoCoin({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 84 84" aria-hidden="true" className={className}>
      <circle cx="42" cy="42" r="40" fill="#fff" stroke="#DCC4EC" strokeWidth="2" />
      <circle cx="42" cy="42" r="28" fill="#5B1187" />
      <path
        d="M34 30h12a6 6 0 010 12H34zm0 12h14a6 6 0 010 12H34zM40 26v4M40 54v4M46 26v4M46 54v4"
        stroke="#fff"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
