import type { UtilityDefinition, UtilityResult } from "../../types/plugin.js";

export const jsonFormat: UtilityDefinition = {
  id: "json-format",
  label: "JSON Format",
  description: "Pretty-print and validate JSON",
  pipeAlias: "json:format",
  inputs: [
    {
      name: "input",
      label: "JSON to format",
      type: "textarea",
      placeholder: '{"key":"value"}',
      required: true,
    },
    {
      name: "indent",
      label: "Indent size",
      type: "select",
      options: [
        { label: "2 spaces", value: "2" },
        { label: "4 spaces", value: "4" },
        { label: "Tab", value: "tab" },
      ],
      required: false,
      defaultValue: "2",
    },
  ],
  async run(inputs: Record<string, string>): Promise<UtilityResult> {
    const text = inputs["input"];
    if (!text || text.trim() === "") throw new Error("JSON input is required");

    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new Error(`Invalid JSON: ${msg}`);
    }

    const indentRaw = inputs["indent"] ?? "2";
    const indent = indentRaw === "tab" ? "\t" : parseInt(indentRaw, 10);
    const result = JSON.stringify(parsed, null, indent);

    return {
      result,
      language: "json",
      metadata: { indent: indentRaw, valid: "true" },
    };
  },
};

export const jsonMinify: UtilityDefinition = {
  id: "json-minify",
  label: "JSON Minify",
  description: "Minify JSON by removing whitespace",
  pipeAlias: "json:minify",
  inputs: [
    {
      name: "input",
      label: "JSON to minify",
      type: "textarea",
      placeholder: '{ "key": "value" }',
      required: true,
    },
  ],
  async run(inputs: Record<string, string>): Promise<UtilityResult> {
    const text = inputs["input"];
    if (!text || text.trim() === "") throw new Error("JSON input is required");

    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new Error(`Invalid JSON: ${msg}`);
    }

    const result = JSON.stringify(parsed);
    return {
      result,
      language: "json",
      metadata: {
        originalLength: String(text.length),
        minifiedLength: String(result.length),
        saved: String(text.length - result.length),
      },
    };
  },
};

export const jsonValidate: UtilityDefinition = {
  id: "json-validate",
  label: "JSON Validate",
  description: "Validate whether a string is valid JSON",
  pipeAlias: "json:validate",
  inputs: [
    {
      name: "input",
      label: "JSON to validate",
      type: "textarea",
      placeholder: '{"key":"value"}',
      required: true,
    },
  ],
  async run(inputs: Record<string, string>): Promise<UtilityResult> {
    const text = inputs["input"];
    if (!text || text.trim() === "") throw new Error("JSON input is required");

    try {
      const parsed = JSON.parse(text);
      const type = Array.isArray(parsed) ? "array" : typeof parsed;
      return {
        result: "Valid JSON",
        language: "text",
        metadata: { valid: "true", type },
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new Error(`Invalid JSON: ${msg}`);
    }
  },
};
