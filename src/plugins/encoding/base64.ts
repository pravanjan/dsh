import type { UtilityDefinition, UtilityResult } from "../../types/plugin.js";

export const base64Encode: UtilityDefinition = {
  id: "base64-encode",
  label: "Base64 Encode",
  description: "Encode a string to Base64",
  pipeAlias: "base64:encode",
  inputs: [
    {
      name: "input",
      label: "Text to encode",
      type: "textarea",
      placeholder: "Enter text to encode",
      required: true,
    },
  ],
  async run(inputs: Record<string, string>): Promise<UtilityResult> {
    const text = inputs["input"];
    if (text === undefined || text === "") {
      throw new Error("Input text is required");
    }
    const result = Buffer.from(text, "utf-8").toString("base64");
    return {
      result,
      language: "text",
      metadata: {
        inputLength: String(text.length),
        outputLength: String(result.length),
      },
    };
  },
};

export const base64Decode: UtilityDefinition = {
  id: "base64-decode",
  label: "Base64 Decode",
  description: "Decode a Base64 string",
  pipeAlias: "base64:decode",
  inputs: [
    {
      name: "input",
      label: "Base64 string to decode",
      type: "textarea",
      placeholder: "Enter Base64 string",
      required: true,
    },
  ],
  async run(inputs: Record<string, string>): Promise<UtilityResult> {
    const text = inputs["input"];
    if (text === undefined || text === "") {
      throw new Error("Input text is required");
    }
    const trimmed = text.trim();
    if (!/^[A-Za-z0-9+/]*={0,2}$/.test(trimmed)) {
      throw new Error("Invalid Base64 string");
    }
    const result = Buffer.from(trimmed, "base64").toString("utf-8");
    return {
      result,
      language: "text",
      metadata: {
        inputLength: String(trimmed.length),
        outputLength: String(result.length),
      },
    };
  },
};
