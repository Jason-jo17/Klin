import { create } from "zustand";
import type { JuryRunResult } from "@kiln/jury";

/**
 * v1 has no server-side persistence for Jury runs — results live in this
 * store for the session and can be exported as JSON (build.md §7,
 * JuryScorePanel). A page refresh loses them; that's an accepted v1
 * limitation, not an oversight.
 */
interface JuryStoreState {
  runs: Record<string, JuryRunResult>;
  addRun: (result: JuryRunResult) => void;
  getRun: (runId: string) => JuryRunResult | undefined;
}

export const useJuryStore = create<JuryStoreState>((set, get) => ({
  runs: {},
  addRun: (result) => set((state) => ({ runs: { ...state.runs, [result.runId]: result } })),
  getRun: (runId) => get().runs[runId],
}));
