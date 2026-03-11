import { createHash } from "crypto";
import type { UtilityDefinition, UtilityResult } from "../../types/plugin.js";

export const md5Hash: UtilityDefinition = {
  id: "md5",
  label: "MD5",
  description: "Generate an MD5 hash of the input",
  pipeAlias: "hash:md5",
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
    const result = createHash("md5").update(text, "utf-8").digest("hex");
    return {
      result,
      language: "text",
      metadata: {
        algorithm: "MD5",
        inputLength: String(text.length),
        hashLength: String(result.length),
      },
    };
  },
};
