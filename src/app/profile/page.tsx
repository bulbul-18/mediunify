"use client";

import { useState } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { AppNavbar } from "@/components/AppNavbar";

const TABS = ["Account", "Notifications", "Privacy", "Security"];

const MEDICAL_BASICS = [
  { label: "Blood type", value: "O+" },
  { label: "Known allergies", value: "Penicillin" },
];

export default function ProfilePage() {
  const [tab, setTab] = useState("Account");
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();

  const fields = [
    { label: "Full name", value: user?.fullName || "—" },
    { label: "Email", value: user?.primaryEmailAddress?.emailAddress || "—" },
  ];

  const initial =
    user?.firstName?.[0] || user?.primaryEmailAddress?.emailAddress?.[0] || "?";
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })
    : "";

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
        ) : !isLoaded ? (
          <p className="mt-8 text-sm text-foreground/50">Loading your profile</p>
        ) : (
          <>
            <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1fr]">
              <div className="rounded-2xl border border-navy/10 bg-white p-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-purple-light text-xl font-bold text-purple">
                    {initial.toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-navy">{user?.fullName || "Your account"}</p>
                    {memberSince && (
                      <p className="text-sm text-foreground/50">Member since {memberSince}</p>
                    )}
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  {fields.map((f) => (
                    <div key={f.label} className="border-b border-navy/10 pb-3">
                      <p className="text-xs font-semibold text-foreground/50">{f.label}</p>
                      <p className="mt-1 text-sm text-foreground">{f.value}</p>
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-xs text-foreground/40">
                  To change your name, email, or password, use the account menu in the top
                  right (click your avatar).
                </p>
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
                <p className="mt-4 text-xs text-foreground/40">
                  Still placeholder data, editable medical basics aren't wired up yet.
                </p>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => signOut({ redirectUrl: "/login" })}
                className="rounded-full border border-coral px-5 py-2.5 text-sm font-medium text-coral hover:bg-coral-light"
              >
                Log out
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}