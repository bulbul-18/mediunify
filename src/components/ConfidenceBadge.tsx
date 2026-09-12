type ConfidenceBadgeProps = {
  confidence: number; // 0 to 1
};

// Purple is reserved across the whole app for "the AI generated this" —
// this badge is one of the places that convention shows up most, since
// showing the AI's confidence (rather than a bare answer) is core to the
// project's trust-by-design approach.
export function ConfidenceBadge({ confidence }: ConfidenceBadgeProps) {
  const pct = Math.round(confidence * 100);

  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-purple-light px-3 py-1">
      <span className="h-1.5 w-16 overflow-hidden rounded-full bg-white/60">
        <span
          className="block h-full rounded-full bg-purple"
          style={{ width: `${pct}%` }}
        />
      </span>
      <span className="text-xs font-medium text-purple">
        {pct}% confidence
      </span>
    </div>
  );
}
