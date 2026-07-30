export default function AfricaLogo({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 2C7 2 3 6 3 11c0 4 3 8 9 11 6-3 9-7 9-11 0-5-4-9-9-9zm0 2c3 0 6 3 6 7 0 3-2 5-5 7v-9h-2v9c-3-2-5-4-5-7 0-4 3-7 6-7z" />
    </svg>
  );
}
