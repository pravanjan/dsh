import { randomBytes } from "crypto";
import type { UtilityDefinition, UtilityResult } from "../../types/plugin.js";

const CHARSETS: Record<string, string> = {
  alphanumeric: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
  alpha: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
  numeric: "0123456789",
  hex: "0123456789abcdef",
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
};

export function generateRandomString(length: number, charset: string): string {
  if (charset.length === 0) throw new Error("Charset must not be empty");
  const result: string[] = [];
  const bytes = randomBytes(length * 2);
  for (let i = 0; i < bytes.length && result.length < length; i++) {
    const idx = bytes[i] % charset.length;
    result.push(charset[idx]);
  }
  return result.join("");
}

export const randomStringGenerator: UtilityDefinition = {
  id: "random-string",
  label: "Random String",
  description: "Generate a cryptographically random string with a chosen charset",
  pipeAlias: "gen:random",
  inputs: [
    {
      name: "length",
      label: "Length",
      type: "text",
      placeholder: "32",
      required: false,
      defaultValue: "32",
    },
    {
      name: "charset",
      label: "Charset",
      type: "select",
      options: Object.keys(CHARSETS).map((k) => ({ label: k, value: k })),
      required: false,
      defaultValue: "alphanumeric",
    },
    {
      name: "custom",
      label: "Custom charset (overrides above if set)",
      type: "text",
      placeholder: "Leave blank to use preset",
      required: false,
    },
  ],
  async run(inputs: Record<string, string>): Promise<UtilityResult> {
    const length = parseInt(inputs["length"] ?? "32", 10);
    if (isNaN(length) || length < 1) throw new Error("Length must be a positive integer");
    if (length > 4096) throw new Error("Length must be 4096 or fewer");

    const custom = inputs["custom"]?.trim();
    const charsetKey = inputs["charset"] ?? "alphanumeric";
    const charset = custom && custom.length > 0
      ? custom
      : (CHARSETS[charsetKey] ?? CHARSETS["alphanumeric"]);

    const result = generateRandomString(length, charset);

    return {
      result,
      language: "text",
      metadata: {
        length: String(result.length),
        charset: custom ? "custom" : charsetKey,
        charsetSize: String(charset.length),
      },
    };
  },
};
