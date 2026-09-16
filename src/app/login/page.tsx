import Link from "next/link";

const BULLETS = [
  "Grounded symptom checks",
  "Verified documents",
  "One place for everything",
];

export default function LoginPage() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col justify-center bg-navy px-10 py-14 text-white lg:px-16">
        <p className="font-display text-3xl leading-tight sm:text-4xl">
          Your health history, finally remembered.
        </p>
        <div className="mt-8 space-y-4">
          {BULLETS.map((b) => (
            <div key={b} className="flex items-center gap-3">
              <span className="h-2.5 w-2.5 rounded-full bg-teal" />
              <span className="text-sm text-white/80">{b}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col items-center justify-center bg-background px-8 py-14">
        <div className="w-full max-w-sm">
          <p className="text-center font-display text-xl text-navy">MediUnify</p>
          <p className="mt-6 text-center font-display text-2xl text-navy">
            Welcome back
          </p>
          <p className="mt-1 text-center text-sm text-foreground/60">
            Log in to see your health timeline
          </p>

          <div className="mt-8 space-y-4">
            <div>
              <label className="text-xs font-semibold text-foreground/60">
                Email
              </label>
              <input
                type="email"
                className="mt-1.5 w-full rounded-lg border border-navy/20 bg-white px-4 py-2.5 text-sm focus:border-teal focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground/60">
                Password
              </label>
              <input
                type="password"
                className="mt-1.5 w-full rounded-lg border border-navy/20 bg-white px-4 py-2.5 text-sm focus:border-teal focus:outline-none"
              />
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-foreground/60">
              <input type="checkbox" className="h-4 w-4 rounded border-navy/30" />
              Remember me
            </label>
            <a href="#" className="text-teal">
              Forgot password?
            </a>
          </div>

          <Link
            href="/dashboard"
            className="mt-6 block rounded-full bg-teal py-3 text-center text-sm font-semibold text-white hover:bg-teal-dark"
          >
            Log in
          </Link>

          <div className="mt-5 flex items-center gap-3">
            <span className="h-px flex-1 bg-navy/15" />
            <span className="text-xs text-foreground/40">or</span>
            <span className="h-px flex-1 bg-navy/15" />
          </div>

          <button className="mt-5 flex w-full items-center justify-center gap-2 rounded-full border border-navy/20 py-3 text-sm font-semibold text-navy hover:bg-navy/5">
            <span className="h-4 w-4 rounded-full bg-coral" />
            Continue with Google
          </button>

          <p className="mt-6 text-center text-sm text-foreground/60">
            Don't have an account?{" "}
            <Link href="/login" className="font-semibold text-teal">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}