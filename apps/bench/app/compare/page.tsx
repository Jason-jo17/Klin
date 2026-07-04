import type { Metadata } from "next";
import { getAllTemplates } from "../../lib/registry/templateRegistry";
import { CompareClient } from "../../components/player/CompareClient";

export const metadata: Metadata = {
  title: "Compare",
};

export default function ComparePage() {
  const templates = getAllTemplates();
  return <CompareClient templates={templates} />;
}
