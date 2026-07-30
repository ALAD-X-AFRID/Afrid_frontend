export default function LeafOverlay({ className = "" }: { className?: string }) {
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden opacity-30 ${className}`}>
      <svg
        className="absolute -right-12 top-0 h-80 w-80 text-accent-orange/20"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M17.6,2.3c-0.7-0.2-1.5,0.1-2,0.6c-0.7,0.7-1.5,1.1-2.4,1.4C9.7,5.4,7.2,8.4,7.6,12c0.1,0.9-0.2,1.8-0.8,2.5 c-1,1.2-1.4,2.7-1.2,4.2c0.1,0.9,0.5,1.8,1.1,2.5c0.1,0.1,0.2,0.2,0.2,0.3c0.5,0.6,0.9,1.3,1.1,2.1c0.1,0.5,0.3,0.9,0.6,1.2 c0.3,0.3,0.8,0.3,1.1,0c0.6-0.6,1.3-1.1,2-1.5c0.7-0.4,1.5-0.6,2.3-0.5c1.2,0.1,2.3-0.3,3.2-1.1c0.9-0.8,1.4-2,1.4-3.2 c0-0.9,0.4-1.7,1-2.4c0.7-0.8,1.1-1.8,1-2.8c-0.1-0.8-0.5-1.5-1-2c-0.7-0.7-1.1-1.6-1.2-2.6c-0.1-1.2-0.9-2.2-2-2.8 c-0.7-0.4-1.3-1-1.7-1.8C18.9,3.6,18.4,2.8,17.6,2.3z" />
      </svg>
      <svg
        className="absolute left-0 top-1/4 h-64 w-64 -rotate-12 text-accent-violet/20"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M12,2C7,2,3,6,3,11c0,4,3,8,9,11c6-3,9-7,9-11C21,6,17,2,12,2z M12,4c3,0,6,3,6,7c0,3-2,5-5,7v-9h-2v9 c-3-2-5-4-5-7C6,7,9,4,12,4z" />
      </svg>
      <svg
        className="absolute bottom-0 right-1/4 h-72 w-72 rotate-12 text-accent-cyan/15"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M12,2C7,2,3,6,3,11c0,4,3,8,9,11c6-3,9-7,9-11C21,6,17,2,12,2z M12,4c3,0,6,3,6,7c0,3-2,5-5,7v-9h-2v9 c-3-2-5-4-5-7C6,7,9,4,12,4z" />
      </svg>
    </div>
  );
}
