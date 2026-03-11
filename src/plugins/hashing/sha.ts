import { createHash } from "crypto";
import type { UtilityDefinition, UtilityResult } from "../../types/plugin.js";

function makeShaUtility(
  algorithm: "sha1" | "sha256" | "sha512",
  id: string,
  label: string,
  pipeAlias: string
): UtilityDefinition {
  return {
    id,
    label,
    description: `Generate a ${label} hash of the input`,
    pipeAlias,
    inputs: [
      {
        name: "input",
        label: "Text to hash",
        type: "textarea",
        placeholder: "Enter text",
        required: true,
      },
    ],
    async run(inputs: Record<string, string>): Promise<UtilityResult> {
      const text = inputs["input"];
      if (text === undefined || text === "") {
        throw new Error("Input text is required");
      }
      const result = createHash(algorithm).update(text, "utf-8").digest("hex");
      return {
        result,
        language: "text",
        metadata: {
          algorithm: algorithm.toUpperCase(),
          inputLength: String(text.length),
          hashLength: String(result.length),
        },
      };
    },
  };
}

export const sha1Hash = makeShaUtility("sha1", "sha1", "SHA-1", "hash:sha1");
export const sha256Hash = makeShaUtility("sha256", "sha256", "SHA-256", "hash:sha256");
export const sha512Hash = makeShaUtility("sha512", "sha512", "SHA-512", "hash:sha512");
