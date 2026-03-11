import type { UtilityDefinition, UtilityResult } from "../../types/plugin.js";

export interface RegexMatch {
  index: number;
  match: string;
  groups: Record<string, string> | null;
  captures: string[];
}

export function testRegex(
  pattern: string,
  flags: string,
  subject: string
): { matches: RegexMatch[]; totalMatches: number } {
  let re: RegExp;
  try {
    re = new RegExp(pattern, flags);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(`Invalid regex pattern: ${msg}`);
  }

  const matches: RegexMatch[] = [];
  // Ensure global flag for iterating all matches
  const globalRe = re.flags.includes("g")
    ? re
    : new RegExp(re.source, re.flags + "g");

  let m: RegExpExecArray | null;
  while ((m = globalRe.exec(subject)) !== null) {
    matches.push({
      index: m.index,
      match: m[0],
      groups: m.groups ? { ...m.groups } : null,
      captures: Array.from(m).slice(1).map((c) => c ?? ""),
    });
    // Prevent infinite loop on zero-width matches
    if (m[0].length === 0) globalRe.lastIndex++;
  }

  return { matches, totalMatches: matches.length };
}

export const regexTester: UtilityDefinition = {
  id: "regex-tester",
  label: "Regex Tester",
  description: "Test a regular expression against a string and show all matches",
  pipeAlias: "str:regex",
  inputs: [
    {
      name: "input",
      label: "Test string",
      type: "textarea",
      placeholder: "The quick brown fox",
      required: true,
    },
    {
      name: "pattern",
      label: "Regex pattern (without /slashes/)",
      type: "text",
      placeholder: "\\b\\w+\\b",
      required: true,
    },
    {
      name: "flags",
      label: "Flags (e.g. gi)",
      type: "text",
      placeholder: "g",
      required: false,
      defaultValue: "g",
    },
  ],
  async run(inputs: Record<string, string>): Promise<UtilityResult> {
    const subject = inputs["input"];
    const pattern = inputs["pattern"]?.trim();
    const flags = inputs["flags"]?.trim() ?? "g";

    if (!subject) throw new Error("Test string is required");
    if (!pattern) throw new Error("Regex pattern is required");

    const { matches, totalMatches } = testRegex(pattern, flags, subject);

    const result = JSON.stringify(
      {
        totalMatches,
        pattern: `/${pattern}/${flags}`,
        matches: matches.map((m) => ({
          index: m.index,
          match: m.match,
          ...(m.captures.length > 0 && { captures: m.captures }),
          ...(m.groups && { groups: m.groups }),
        })),
      },
      null,
      2
    );

    return {
      result,
      language: "json",
      metadata: {
        totalMatches: String(totalMatches),
        pattern,
        flags,
      },
    };
  },
};
