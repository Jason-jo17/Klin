import type { ReactNode } from "react";
import { Space_Grotesk, DM_Sans } from "next/font/google";
import { AppShell } from "../components/shell/AppShell";
import { getAllTemplates } from "../lib/registry/templateRegistry";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--kiln-font-display", display: "swap" });
const dmSans = DM_Sans({ subsets: ["latin"], variable: "--kiln-font-body", display: "swap" });

export const metadata = {
  title: { default: "Kiln — the Bench", template: "%s · Kiln" },
  description: "Browse and interact with every Kiln Generative UI template, BYOK.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const templates = getAllTemplates();

  return (
    <html lang="en" data-theme="dark">
      <body className={`${spaceGrotesk.variable} ${dmSans.variable}`}>
        <AppShell templates={templates}>{children}</AppShell>
      </body>
    </html>
  );
}
