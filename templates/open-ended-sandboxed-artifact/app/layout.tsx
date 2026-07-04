import type { ReactNode } from "react";
import { Space_Grotesk, DM_Sans } from "next/font/google";
import "@kiln/tokens/tokens.css";
import "@kiln/ui/styles.css";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--kiln-font-display", display: "swap" });
const dmSans = DM_Sans({ subsets: ["latin"], variable: "--kiln-font-body", display: "swap" });

export const metadata = {
  title: "Kiln — Sandboxed Artifact",
  description: "Reference implementation of Open-Ended GenUI: free-form HTML in a locked-down iframe.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" data-theme="dark">
      <body className={`${spaceGrotesk.variable} ${dmSans.variable}`}>{children}</body>
    </html>
  );
}
