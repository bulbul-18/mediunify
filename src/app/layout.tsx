import type { Metadata } from "next";
import "./globals.css";

// NOTE: this sandbox can't reach Google Fonts to build, so we use CSS font
// stacks (see globals.css) for now. On Vercel, swap in:
//   import { Fraunces, IBM_Plex_Sans } from "next/font/google";
// and apply their .variable classes below for crisper, on-brand type.

export const metadata: Metadata = {
  title: "MediUnify",
  description: "An AI healthcare platform with grounded, validated medical intelligence.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-background text-foreground">{children}</body>
    </html>
  );
}
