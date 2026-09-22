import { SignUp } from "@clerk/nextjs";

const BULLETS = [
  "Grounded symptom checks",
  "Verified documents",
  "One place for everything",
];

export default function SignupPage() {
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
        <SignUp
          path="/signup"
          routing="path"
          signInUrl="/login"
          forceRedirectUrl="/dashboard"
          appearance={{
            elements: {
              formButtonPrimary:
                "bg-teal hover:bg-teal-dark text-sm normal-case shadow-none",
              footerActionLink: "text-teal",
              card: "shadow-none",
            },
          }}
        />
      </div>
    </div>
  );
}