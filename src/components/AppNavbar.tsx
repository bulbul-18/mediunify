"use client";

import Link from "next/link";
import { UserButton } from "@clerk/nextjs";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Upload", href: "/upload" },
  { label: "Check symptoms", href: "/symptom-checker" },
  { label: "Chat", href: "/chat" },
  { label: "Reminders", href: "/reminders" },
];

export function AppNavbar({ active }: { active?: string }) {
  return (
    <header className="border-b border-navy/10 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/dashboard" className="font-display text-xl text-navy">
          MediUnify
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-sm font-medium ${
                active === item.label
                  ? "border-b-2 border-teal pb-1 text-teal"
                  : "text-foreground/70 hover:text-navy"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <button aria-label="Search" className="text-navy/50 hover:text-navy">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
              <path d="M21 21l-4.3-4.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
          <button aria-label="Notifications" className="relative text-navy/50 hover:text-navy">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path d="M13.7 21a2 2 0 0 1-3.4 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-coral text-[9px] font-bold text-white">
              2
            </span>
          </button>
          <UserButton appearance={{ elements: { avatarBox: "h-9 w-9" } }}>
            <UserButton.MenuItems>
              <UserButton.Link
                label="Medical profile"
                href="/profile"
                labelIcon={<span>🩺</span>}
              />
            </UserButton.MenuItems>
          </UserButton>
        </div>
      </div>
    </header>
  );
}