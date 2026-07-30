export default function LeafAccent({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 200 200"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M100 20c-35 30-55 65-55 100 0 30 20 55 55 60 35-5 55-30 55-60 0-35-20-70-55-100z" opacity="0.9" />
      <path d="M100 20v160" stroke="currentColor" strokeOpacity="0.3" strokeWidth="2" />
      <path d="M100 80c-20 10-35 25-45 45M100 100c20 8 35 22 45 40" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2" />
    </svg>
  );
}
