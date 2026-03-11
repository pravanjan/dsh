import { createHmac } from "crypto";
import type { UtilityDefinition, UtilityResult } from "../../types/plugin.js";

export const hmacSha256: UtilityDefinition = {
  id: "hmac-sha256",
  label: "HMAC-SHA256",
  description: "Generate an HMAC-SHA256 signature using a secret key",
  pipeAlias: "hash:hmac",
  inputs: [
    {
      name: "input",
      label: "Message",
      type: "textarea",
      placeholder: "Enter message to sign",
      required: true,
    },
    {
      name: "key",
      label: "Secret key",
      type: "password",
      placeholder: "Enter secret key",
      required: true,
    },
  ],
  async run(inputs: Record<string, string>): Promise<UtilityResult> {
    const message = inputs["input"];
    const key = inputs["key"];
    if (message === undefined || message === "") {
      throw new Error("Message is required");
    }
    if (key === undefined || key === "") {
      throw new Error("Secret key is required");
    }
    const result = createHmac("sha256", key).update(message, "utf-8").digest("hex");
    return {
      result,
      language: "text",
      metadata: {
        algorithm: "HMAC-SHA256",
        messageLength: String(message.length),
        hashLength: String(result.length),
      },
    };
  },
};
