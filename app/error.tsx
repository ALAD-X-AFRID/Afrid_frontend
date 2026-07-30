"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[AFRID Error Boundary]", error);
  }, [error]);

  return (
    <section className="flex min-h-screen flex-col items-center justify-center bg-[#03040d] px-6 text-center">
      <div
        className="mb-6 inline-flex items-center justify-center rounded-2xl text-3xl font-extrabold"
        style={{
          width: 56,
          height: 56,
          background: "linear-gradient(135deg, #ff6b6b, #b27bff)",
          color: "#03040d",
        }}
      >
        !
      </div>
      <h1 className="text-2xl font-bold text-white">Something went wrong</h1>
      <p className="mt-3 max-w-md text-sm text-[#9DBAAE]">
        {error.message || "An unexpected error occurred. Please try again."}
      </p>
      {error.digest && (
        <p className="mt-2 text-xs text-[#9DBAAE]/60">Error ID: {error.digest}</p>
      )}
      <div className="mt-8 flex gap-3">
        <button
          onClick={reset}
          className="btn-primary"
        >
          Try again
        </button>
        <Link href="/" className="btn-secondary">
          Back to Home
        </Link>
      </div>
    </section>
  );
}
