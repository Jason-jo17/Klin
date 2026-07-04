import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllTemplates, getTemplate } from "../../../lib/registry/templateRegistry";
import { TemplatePlayer } from "../../../components/player/TemplatePlayer";

export function generateStaticParams() {
  return getAllTemplates().map((t) => ({ templateId: t.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ templateId: string }> }): Promise<Metadata> {
  const { templateId } = await params;
  const manifest = getTemplate(templateId);
  if (!manifest) return { title: "Template not found" };
  return { title: manifest.name, description: manifest.description };
}

export default async function PlayPage({ params }: { params: Promise<{ templateId: string }> }) {
  const { templateId } = await params;
  const manifest = getTemplate(templateId);

  if (!manifest) notFound();

  return <TemplatePlayer manifest={manifest} />;
}
