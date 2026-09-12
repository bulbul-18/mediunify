export type TimelineEntry = {
  id: string;
  date: string; // pre-formatted, e.g. "Mar 12"
  kind: "document" | "session" | "flag";
  title: string;
  detail: string;
};

const DOT_COLOR: Record<TimelineEntry["kind"], string> = {
  document: "bg-teal",
  session: "bg-purple",
  flag: "bg-coral",
};

const LABEL: Record<TimelineEntry["kind"], string> = {
  document: "Document",
  session: "AI check-in",
  flag: "Flagged for review",
};

// A real sequence (chronological patient history) earns the timeline
// device — dots + a connecting rule — per the design principles: don't use
// this structure unless the content genuinely is a sequence.
export function Timeline({ entries }: { entries: TimelineEntry[] }) {
  return (
    <ol className="relative border-l border-navy/15 pl-6">
      {entries.map((entry, i) => (
        <li key={entry.id} className={i === 0 ? "" : "mt-7"}>
          <span
            className={`absolute -left-[5px] mt-1.5 h-2.5 w-2.5 rounded-full ${DOT_COLOR[entry.kind]}`}
            aria-hidden="true"
          />
          <div className="flex items-baseline gap-3">
            <span className="text-xs font-medium tracking-wide text-navy/50">
              {entry.date}
            </span>
            <span className="text-xs text-navy/40">{LABEL[entry.kind]}</span>
          </div>
          <p className="mt-1 font-medium text-foreground">{entry.title}</p>
          <p className="mt-0.5 text-sm text-foreground/70">{entry.detail}</p>
        </li>
      ))}
    </ol>
  );
}
