export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#03040d]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-[#39e0ff]/30 border-t-[#39e0ff] rounded-full animate-spin" />
        <p className="text-sm text-[#9DBAAE]">Loading…</p>
      </div>
    </div>
  );
}
