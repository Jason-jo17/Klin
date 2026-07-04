import type { Metadata } from "next";
import { JuryRunClient } from "../../../components/player/JuryRunClient";

export const metadata: Metadata = {
  title: "Jury Run",
};

export default async function JuryRunPage({ params }: { params: Promise<{ runId: string }> }) {
  const { runId } = await params;
  return <JuryRunClient runId={runId} />;
}
