import { XMLBuilder } from "fast-xml-parser";
import type { UtilityDefinition, UtilityResult } from "../../types/plugin.js";

export const jsonToXml: UtilityDefinition = {
  id: "json-to-xml",
  label: "JSON → XML",
  description: "Convert JSON to XML",
  pipeAlias: "json:toxml",
  inputs: [
    {
      name: "input",
      label: "JSON input",
      type: "textarea",
      placeholder: '{"root": {"key": "value"}}',
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

    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      throw new Error("JSON must be an object at the top level for XML conversion");
    }

    const builder = new XMLBuilder({
      ignoreAttributes: false,
      attributeNamePrefix: "@_",
      format: true,
      indentBy: "  ",
    });

    const result: string = builder.build(parsed);
    return {
      result: result.trim(),
      language: "xml",
      metadata: { from: "json", to: "xml" },
    };
  },
};
