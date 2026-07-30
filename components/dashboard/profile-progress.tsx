"use client";

export default function ProfileProgress({ percent }: { percent: number }) {
  return (
    <div className="w-full">
      <div className="mb-2 flex justify-between text-xs uppercase tracking-wider text-muted">
        <span>Profile completion</span>
        <span>{percent}%</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface">
        <div
          className="h-full rounded-full bg-gradient-primary transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
