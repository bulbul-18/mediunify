type StatCardProps = {
  value: string;
  label: string;
  dotColor: string;
};

export function StatCard({ value, label, dotColor }: StatCardProps) {
  return (
    <div className="flex-1 rounded-xl border border-navy/10 bg-white p-4">
      <span className={"inline-block h-5 w-5 rounded-full " + dotColor} />
      <p className="mt-3 text-2xl font-bold text-navy">{value}</p>
      <p className="mt-1 text-xs text-foreground/60">{label}</p>
    </div>
  );
}