import yaml from "js-yaml";
import type { UtilityDefinition, UtilityResult } from "../../types/plugin.js";

export const jsonToYaml: UtilityDefinition = {
  id: "json-to-yaml",
  label: "JSON → YAML",
  description: "Convert JSON to YAML",
  pipeAlias: "json:toyaml",
  inputs: [
    {
      name: "input",
      label: "JSON input",
      type: "textarea",
      placeholder: '{"key": "value"}',
      required: true,
    },
  ],
  async run(inputs: Record<string, string>): Promise<UtilityResult> {
    const text = inputs["input"];
    if (!text || text.trim() === "") throw new Error("JSON input is required");

    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new Error(`Invalid JSON: ${msg}`);
    }

    const result = yaml.dump(parsed, { indent: 2, lineWidth: -1 });
    return {
      result,
      language: "yaml",
      metadata: { from: "json", to: "yaml" },
    };
  },
};
