import type { UtilityDefinition, UtilityResult } from "../../types/plugin.js";

export const urlEncode: UtilityDefinition = {
  id: "url-encode",
  label: "URL Encode",
  description: "Percent-encode a URL or string",
  pipeAlias: "url:encode",
  inputs: [
    {
      name: "input",
      label: "Text to URL encode",
      type: "textarea",
      placeholder: "Enter text or URL",
      required: true,
    },
  ],
  async run(inputs: Record<string, string>): Promise<UtilityResult> {
    const text = inputs["input"];
    if (text === undefined || text === "") {
      throw new Error("Input text is required");
    }
    const result = encodeURIComponent(text);
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

export const urlDecode: UtilityDefinition = {
  id: "url-decode",
  label: "URL Decode",
  description: "Decode a percent-encoded URL or string",
  pipeAlias: "url:decode",
  inputs: [
    {
      name: "input",
      label: "URL-encoded text to decode",
      type: "textarea",
      placeholder: "Enter percent-encoded text",
      required: true,
    },
  ],
  async run(inputs: Record<string, string>): Promise<UtilityResult> {
    const text = inputs["input"];
    if (text === undefined || text === "") {
      throw new Error("Input text is required");
    }
    try {
      const result = decodeURIComponent(text.trim());
      return {
        result,
        language: "text",
        metadata: {
          inputLength: String(text.length),
          outputLength: String(result.length),
        },
      };
    } catch {
      throw new Error("Invalid URL-encoded string");
    }
  },
};
