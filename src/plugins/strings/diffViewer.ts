import { createTwoFilesPatch, diffLines } from "diff";
import type { UtilityDefinition, UtilityResult } from "../../types/plugin.js";

export interface DiffStats {
  added: number;
  removed: number;
  unchanged: number;
}

export function computeDiffStats(textA: string, textB: string): DiffStats {
  const changes = diffLines(textA, textB);
  let added = 0;
  let removed = 0;
  let unchanged = 0;

  for (const change of changes) {
    const lines = (change.value.match(/\n/g) ?? []).length || 1;
    if (change.added) added += lines;
    else if (change.removed) removed += lines;
    else unchanged += lines;
  }

  return { added, removed, unchanged };
}

export const diffViewer: UtilityDefinition = {
  id: "diff-viewer",
  label: "Line Diff",
  description: "Compare two text blocks and show a unified diff",
  pipeAlias: "str:diff",
  inputs: [
    {
      name: "input",
      label: "Text A (original)",
      type: "textarea",
      placeholder: "Original text…",
      required: true,
    },
    {
      name: "textB",
      label: "Text B (modified)",
      type: "textarea",
      placeholder: "Modified text…",
      required: true,
    },
  ],
  async run(inputs: Record<string, string>): Promise<UtilityResult> {
    const textA = inputs["input"];
    const textB = inputs["textB"];

    if (textA === undefined || textA === "") throw new Error("Text A is required");
    if (textB === undefined || textB === "") throw new Error("Text B is required");

    const patch = createTwoFilesPatch("text-a", "text-b", textA, textB, "", "", {
      context: 3,
    });

    const { added, removed, unchanged } = computeDiffStats(textA, textB);

    return {
      result: patch,
      language: "text",
      metadata: {
        linesAdded: String(added),
        linesRemoved: String(removed),
        linesUnchanged: String(unchanged),
        identical: String(added === 0 && removed === 0),
      },
    };
  },
};
