import { generate } from "generate-password";
import type { UtilityDefinition, UtilityResult } from "../../types/plugin.js";

export const passwordGenerator: UtilityDefinition = {
  id: "password",
  label: "Password Generator",
  description: "Generate a secure random password with configurable options",
  pipeAlias: "gen:password",
  inputs: [
    {
      name: "length",
      label: "Length",
      type: "text",
      placeholder: "16",
      required: false,
      defaultValue: "16",
    },
    {
      name: "symbols",
      label: "Include symbols? (yes/no)",
      type: "select",
      options: [
        { label: "Yes", value: "yes" },
        { label: "No", value: "no" },
      ],
      required: false,
      defaultValue: "yes",
    },
    {
      name: "numbers",
      label: "Include numbers? (yes/no)",
      type: "select",
      options: [
        { label: "Yes", value: "yes" },
        { label: "No", value: "no" },
      ],
      required: false,
      defaultValue: "yes",
    },
    {
      name: "uppercase",
      label: "Include uppercase? (yes/no)",
      type: "select",
      options: [
        { label: "Yes", value: "yes" },
        { label: "No", value: "no" },
      ],
      required: false,
      defaultValue: "yes",
    },
  ],
  async run(inputs: Record<string, string>): Promise<UtilityResult> {
    const length = parseInt(inputs["length"] ?? "16", 10);
    if (isNaN(length) || length < 4) throw new Error("Length must be at least 4");
    if (length > 256) throw new Error("Length must be 256 or fewer");

    const useSymbols = (inputs["symbols"] ?? "yes") !== "no";
    const useNumbers = (inputs["numbers"] ?? "yes") !== "no";
    const useUppercase = (inputs["uppercase"] ?? "yes") !== "no";

    const result = generate({
      length,
      numbers: useNumbers,
      symbols: useSymbols,
      uppercase: useUppercase,
      lowercase: true,
      strict: true,
    });

    return {
      result,
      language: "text",
      metadata: {
        length: String(result.length),
        symbols: String(useSymbols),
        numbers: String(useNumbers),
        uppercase: String(useUppercase),
      },
    };
  },
};
