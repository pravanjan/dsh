import type { UtilityDefinition, UtilityResult } from "../../types/plugin.js";

export const hexEncode: UtilityDefinition = {
  id: "hex-encode",
  label: "Hex Encode",
  description: "Encode a string to hexadecimal",
  pipeAlias: "hex:encode",
  inputs: [
    {
      name: "input",
      label: "Text to hex encode",
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
    const result = Buffer.from(text, "utf-8").toString("hex");
    return {
      result,
      language: "text",
      metadata: {
        inputLength: String(text.length),
        outputLength: String(result.length),
        bytesEncoded: String(Buffer.byteLength(text, "utf-8")),
      },
    };
  },
};

export const hexDecode: UtilityDefinition = {
  id: "hex-decode",
  label: "Hex Decode",
  description: "Decode a hexadecimal string to text",
  pipeAlias: "hex:decode",
  inputs: [
    {
      name: "input",
      label: "Hex string to decode",
      type: "textarea",
      placeholder: "Enter hex string (e.g. 68656c6c6f)",
      required: true,
    },
  ],
  async run(inputs: Record<string, string>): Promise<UtilityResult> {
    const text = inputs["input"];
    if (text === undefined || text === "") {
      throw new Error("Input text is required");
    }
    const trimmed = text.trim().replace(/\s+/g, "").toLowerCase();
    if (!/^[0-9a-f]*$/.test(trimmed)) {
      throw new Error("Invalid hex string — only 0-9 and a-f characters are allowed");
    }
    if (trimmed.length % 2 !== 0) {
      throw new Error("Invalid hex string — length must be even");
    }
    const result = Buffer.from(trimmed, "hex").toString("utf-8");
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
