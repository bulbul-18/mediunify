import Link from "next/link";

const FEATURES = [
  {
    title: "Grounded symptom checker",
    desc: "Uses your real history, not a blank slate.",
    color: "bg-teal",
  },
  {
    title: "Verified documents",
    desc: "Every upload checked before it's trusted.",
    color: "bg-coral",
  },
  {
    title: "AI chat & reminders",
    desc: "Ask questions, never miss a dose.",
    color: "bg-purple",
  },
];

const HOW_IT_WORKS = [
  { num: "1", label: "Upload a report", color: "bg-teal" },
  { num: "2", label: "AI checks your history", color: "bg-purple" },
  { num: "3", label: "Get grounded answers", color: "bg-coral" },
];

export default function LandingPage() {
  return (
    <div className="min-h-full bg-background">
      <header className="flex items-center justify-between border-b border-navy/10 bg-white px-10 py-5">
        <span className="font-display text-xl text-navy">MediUnify</span>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium text-navy">
            Log in
          </Link>
          <Link
            href="/signup"
            className="rounded-full bg-teal px-5 py-2.5 text-sm font-medium text-white hover:bg-teal-dark"
          >
            Get started
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-10 py-14">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <span className="inline-block rounded-full bg-purple-light px-4 py-1.5 text-xs font-semibold tracking-wide text-purple">
              AI-POWERED HEALTHCARE
            </span>
            <h1 className="mt-6 font-display text-4xl leading-tight text-navy sm:text-5xl">
              Most health apps forget you the moment you close them.
            </h1>
            <p className="mt-5 text-lg font-semibold text-purple">
              Ours remembers, verifies, and gets smarter with every visit.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/signup"
                className="rounded-full bg-teal px-6 py-3 text-sm font-semibold text-white hover:bg-teal-dark"
              >
                Get started
              </Link>
              <a href="#how-it-works" className="rounded-full border border-navy/20 px-6 py-3 text-sm font-semibold text-navy hover:bg-navy/5">
                See how it works
              </a>
            </div>
            <div className="mt-8 space-y-3">
              <div className="flex items-center gap-3">
                <span className="h-2.5 w-2.5 rounded-full bg-teal" />
                <span className="text-sm text-foreground/70">
                  Built on real medical symptom datasets
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="h-2.5 w-2.5 rounded-full bg-coral" />
                <span className="text-sm text-foreground/70">
                  Every upload verified before it's trusted
                </span>
              </div>   
            </div>
          </div>

          <div id="how-it-works" className="rounded-2xl border border-navy/10 bg-white p-7">
            <p className="text-xs font-semibold tracking-wide text-teal">
              HOW IT WORKS
            </p>
            <div className="mt-4 space-y-5">
              {HOW_IT_WORKS.map((step) => (
                <div key={step.num} className="flex items-center gap-3">
                  <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white ${step.color}`}>
                    {step.num}
                  </span>
                  <span className="text-sm font-medium text-foreground">
                    {step.label}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-6 border-t border-navy/10 pt-6">
              <div className="rounded-xl bg-background p-4">
                <p className="text-[11px] font-medium text-foreground/50">
                  Sample AI check-in
                </p>
                <p className="mt-2 text-sm font-semibold text-navy">
                  Tension headache, linked to dehydration
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <span className="h-1.5 w-28 overflow-hidden rounded-full bg-navy/10">
                    <span className="block h-full w-[82%] rounded-full bg-purple" />
                  </span>
                  <span className="text-xs font-semibold text-purple">
                    82%
                  </span>
                </div>
                <p className="mt-2 text-xs text-foreground/50">
                  Grounded in your Feb 28 prescription
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-20">
          <h2 className="font-display text-2xl text-navy">
            Everything in one place
          </h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="rounded-2xl border border-navy/10 bg-white p-6">
                <span className={`inline-block h-7 w-7 rounded-full ${f.color}`} />
                <p className="mt-4 font-semibold text-navy">{f.title}</p>
                <p className="mt-1 text-sm text-foreground/60">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 rounded-2xl bg-teal-light px-8 py-6 text-center">
          <p className="font-semibold text-teal-dark">
            Finally, an AI that checks its own homework before trusting a scan.
          </p>
          <p className="mt-1 text-sm text-teal-dark/80">
            Early pilot feedback
          </p>
        </div>

        <p className="mt-14 border-t border-navy/10 pt-4 text-xs text-foreground/50">
          MediUnify provides informational suggestions and is not a substitute for professional medical advice.
        </p>
      </main>
    </div>
  );
}