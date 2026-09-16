"use client";

import { useState } from "react";
import { AppNavbar } from "@/components/AppNavbar";

const TABS = ["Account", "Notifications", "Privacy", "Security"];

const FIELDS = [
  { label: "Full name", value: "Aanya" },
  { label: "Email", value: "aanya@example.com" },
  { label: "Phone", value: "+91 90000 00000" },
  { label: "Date of birth", value: "14 Jun 2001" },
];

const MEDICAL_BASICS = [
  { label: "Blood type", value: "O+" },
  { label: "Known allergies", value: "Penicillin" },
];

export default function ProfilePage() {
  const [tab, setTab] = useState("Account");

  return (
    <div className="min-h-full bg-background">
      <AppNavbar />

      <div className="mx-auto w-full max-w-6xl px-6 py-8">
        <p className="font-display text-2xl text-navy">Settings</p>

        <div className="mt-5 flex gap-8 border-b border-navy/10">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={
                "pb-3 text-sm font-medium " +
                (tab === t
                  ? "border-b-2 border-teal text-teal"
                  : "text-foreground/50 hover:text-navy")
              }
            >
              {t}
            </button>
          ))}
        </div>

        {tab !== "Account" ? (
          <div className="mt-8 rounded-2xl border border-navy/10 bg-white p-8 text-center text-sm text-foreground/50">
            {tab} settings coming soon.
          </div>
        ) : (
          <>
            <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1fr]">
              <div className="rounded-2xl border border-navy/10 bg-white p-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-purple-light text-xl font-bold text-purple">
                    A
                  </div>
                  <div>
                    <p className="font-semibold text-navy">Aanya</p>
                    <p className="text-sm text-foreground/50">Member since Feb 2026</p>
                    <button className="mt-1 rounded-full border border-navy/20 px-3 py-1 text-xs font-medium text-navy hover:bg-navy/5">
                      Change photo
                    </button>
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  {FIELDS.map((f) => (
                    <div key={f.label} className="border-b border-navy/10 pb-3">
                      <p className="text-xs font-semibold text-foreground/50">{f.label}</p>
                      <p className="mt-1 text-sm text-foreground">{f.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-navy/10 bg-white p-6">
                <h3 className="font-semibold text-navy">Medical basics</h3>
                <div className="mt-4 space-y-4">
                  {MEDICAL_BASICS.map((f) => (
                    <div key={f.label}>
                      <p className="text-xs font-semibold text-foreground/50">{f.label}</p>
                      <p className="mt-1 text-sm text-foreground">{f.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button className="rounded-full bg-teal px-5 py-2.5 text-sm font-medium text-white hover:bg-teal-dark">
                Save changes
              </button>
              <button className="rounded-full border border-coral px-5 py-2.5 text-sm font-medium text-coral hover:bg-coral-light">
                Log out
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}