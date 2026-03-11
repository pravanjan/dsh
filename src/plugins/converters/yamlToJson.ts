import yaml from "js-yaml";
import type { UtilityDefinition, UtilityResult } from "../../types/plugin.js";

export const yamlToJson: UtilityDefinition = {
  id: "yaml-to-json",
  label: "YAML → JSON",
  description: "Convert YAML to formatted JSON",
  pipeAlias: "yaml:tojson",
  inputs: [
    {
      name: "input",
      label: "YAML input",
      type: "textarea",
      placeholder: "key: value",
      required: true,
    },
  ],
  async run(inputs: Record<string, string>): Promise<UtilityResult> {
    const text = inputs["input"];
    if (!text || text.trim() === "") throw new Error("YAML input is required");

    let parsed: unknown;
    try {
      parsed = yaml.load(text);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new Error(`Invalid YAML: ${msg}`);
    }

    const result = JSON.stringify(parsed, null, 2);
    return {
      result,
      language: "json",
      metadata: { from: "yaml", to: "json" },
    };
  },
};
