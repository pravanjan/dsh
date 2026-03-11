import type { UtilityDefinition, UtilityResult } from "../../types/plugin.js";

const HTML_ENTITIES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

const HTML_ENTITIES_REVERSE: Record<string, string> = Object.fromEntries(
  Object.entries(HTML_ENTITIES).map(([k, v]) => [v, k])
);

export function encodeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (ch) => HTML_ENTITIES[ch] ?? ch);
}

export function decodeHtml(text: string): string {
  return text
    .replace(/&amp;|&lt;|&gt;|&quot;|&#39;/g, (entity) => HTML_ENTITIES_REVERSE[entity] ?? entity)
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCharCode(parseInt(code, 10)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex: string) => String.fromCharCode(parseInt(hex, 16)));
}

export const htmlEncode: UtilityDefinition = {
  id: "html-encode",
  label: "HTML Encode",
  description: "Escape HTML special characters",
  pipeAlias: "html:encode",
  inputs: [
    {
      name: "input",
      label: "Text to HTML encode",
      type: "textarea",
      placeholder: "Enter text with HTML characters",
      required: true,
    },
  ],
  async run(inputs: Record<string, string>): Promise<UtilityResult> {
    const text = inputs["input"];
    if (text === undefined || text === "") {
      throw new Error("Input text is required");
    }
    const result = encodeHtml(text);
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

export const htmlDecode: UtilityDefinition = {
  id: "html-decode",
  label: "HTML Decode",
  description: "Unescape HTML entities",
  pipeAlias: "html:decode",
  inputs: [
    {
      name: "input",
      label: "HTML-encoded text to decode",
      type: "textarea",
      placeholder: "Enter HTML-encoded text",
      required: true,
    },
  ],
  async run(inputs: Record<string, string>): Promise<UtilityResult> {
    const text = inputs["input"];
    if (text === undefined || text === "") {
      throw new Error("Input text is required");
    }
    const result = decodeHtml(text);
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
