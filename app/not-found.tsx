import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#03040d] px-6 text-center">
      <div
        className="mb-6 inline-flex items-center justify-center rounded-2xl text-5xl font-extrabold"
        style={{
          width: 72,
          height: 72,
          background: "linear-gradient(135deg, #39e0ff, #b27bff)",
          color: "#03040d",
        }}
      >
        A
      </div>
      <h1 className="text-4xl font-bold text-white">404 — Page Not Found</h1>
      <p className="mt-3 max-w-md text-[#9DBAAE]">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link href="/" className="btn-primary mt-8">
        Back to Home
      </Link>
    </div>
  );
}
