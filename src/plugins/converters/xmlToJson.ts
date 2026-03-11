import { XMLParser } from "fast-xml-parser";
import type { UtilityDefinition, UtilityResult } from "../../types/plugin.js";

export const xmlToJson: UtilityDefinition = {
  id: "xml-to-json",
  label: "XML → JSON",
  description: "Convert XML to formatted JSON",
  pipeAlias: "xml:tojson",
  inputs: [
    {
      name: "input",
      label: "XML input",
      type: "textarea",
      placeholder: "<root><key>value</key></root>",
      required: true,
    },
  ],
  async run(inputs: Record<string, string>): Promise<UtilityResult> {
    const text = inputs["input"];
    if (!text || text.trim() === "") throw new Error("XML input is required");

    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_",
      parseAttributeValue: true,
      parseTagValue: true,
      trimValues: true,
    });

    let parsed: unknown;
    try {
      parsed = parser.parse(text);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new Error(`Invalid XML: ${msg}`);
    }

    const result = JSON.stringify(parsed, null, 2);
    return {
      result,
      language: "json",
      metadata: { from: "xml", to: "json" },
    };
  },
};
