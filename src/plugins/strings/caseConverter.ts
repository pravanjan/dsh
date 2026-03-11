import type { UtilityDefinition, UtilityResult } from "../../types/plugin.js";

/** Split input into words, handling camelCase, PascalCase, snake_case, kebab-case, spaces */
export function tokenize(input: string): string[] {
  return input
    .replace(/([a-z])([A-Z])/g, "$1 $2") // camelCase / PascalCase split
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2") // ABCDef → ABC Def
    .replace(/[-_]+/g, " ") // snake_case / kebab-case
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

export function toCamel(words: string[]): string {
  return words
    .map((w, i) => (i === 0 ? w.toLowerCase() : w[0].toUpperCase() + w.slice(1).toLowerCase()))
    .join("");
}

export function toPascal(words: string[]): string {
  return words.map((w) => w[0].toUpperCase() + w.slice(1).toLowerCase()).join("");
}

export function toSnake(words: string[]): string {
  return words.map((w) => w.toLowerCase()).join("_");
}

export function toKebab(words: string[]): string {
  return words.map((w) => w.toLowerCase()).join("-");
}

export function toUpperSnake(words: string[]): string {
  return words.map((w) => w.toUpperCase()).join("_");
}

export function toLower(words: string[]): string {
  return words.map((w) => w.toLowerCase()).join(" ");
}

const CASES: Record<string, (words: string[]) => string> = {
  camel: toCamel,
  pascal: toPascal,
  snake: toSnake,
  kebab: toKebab,
  upper_snake: toUpperSnake,
  lower: toLower,
};

export const caseConverter: UtilityDefinition = {
  id: "case-converter",
  label: "Case Converter",
  description: "Convert text between camelCase, snake_case, kebab-case, PascalCase, and more",
  pipeAlias: "str:camel",
  inputs: [
    {
      name: "input",
      label: "Text to convert",
      type: "text",
      placeholder: "hello world",
      required: true,
    },
    {
      name: "target",
      label: "Target case",
      type: "select",
      options: [
        { label: "camelCase", value: "camel" },
        { label: "PascalCase", value: "pascal" },
        { label: "snake_case", value: "snake" },
        { label: "kebab-case", value: "kebab" },
        { label: "UPPER_SNAKE_CASE", value: "upper_snake" },
        { label: "lowercase", value: "lower" },
      ],
      required: false,
      defaultValue: "camel",
    },
  ],
  async run(inputs: Record<string, string>): Promise<UtilityResult> {
    const text = inputs["input"]?.trim();
    if (!text) throw new Error("Input text is required");

    const target = inputs["target"] ?? "camel";
    const converter = CASES[target];
    if (!converter) throw new Error(`Unknown target case: "${target}"`);

    const words = tokenize(text);
    if (words.length === 0) throw new Error("Input contains no convertible words");

    const result = converter(words);
    return {
      result,
      language: "text",
      metadata: { from: "auto", to: target, wordCount: String(words.length) },
    };
  },
};
