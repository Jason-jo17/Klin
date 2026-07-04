import type { Metadata } from "next";
import { getAllTemplates } from "../lib/registry/templateRegistry";
import { TemplateGrid } from "../components/gallery/TemplateGrid";

export const metadata: Metadata = {
  title: "Template Gallery",
};

export default function GalleryPage() {
  const templates = getAllTemplates();

  return (
    <div>
      <header style={{ marginBottom: "var(--kiln-space-8)" }}>
        <h1 style={{ fontSize: "2rem" }}>The reference implementation and interactive lab for Generative UI patterns.</h1>
        <p style={{ color: "var(--kiln-text-secondary)", maxWidth: 640 }}>
          Bring your own API key, browse every template side by side, and see the Jury&apos;s validation score for
          each one — accessibility, design-token adherence, structural validity, sandbox safety, and latency.
        </p>
      </header>
      <TemplateGrid templates={templates} />
    </div>
  );
}
