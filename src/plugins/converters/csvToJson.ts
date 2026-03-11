import Papa from "papaparse";
import type { UtilityDefinition, UtilityResult } from "../../types/plugin.js";

export const csvToJson: UtilityDefinition = {
  id: "csv-to-json",
  label: "CSV → JSON",
  description: "Convert CSV to a JSON array of objects",
  pipeAlias: "csv:tojson",
  inputs: [
    {
      name: "input",
      label: "CSV input",
      type: "textarea",
      placeholder: "name,age\nAlice,30\nBob,25",
      required: true,
    },
    {
      name: "header",
      label: "First row is header?",
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
    const text = inputs["input"];
    if (!text || text.trim() === "") throw new Error("CSV input is required");

    const hasHeader = (inputs["header"] ?? "yes") !== "no";

    const parsed = Papa.parse<unknown>(text.trim(), {
      header: hasHeader,
      skipEmptyLines: true,
      dynamicTyping: true,
    });

    if (parsed.errors.length > 0) {
      const first = parsed.errors[0];
      throw new Error(`CSV parse error on row ${first.row ?? "?"}: ${first.message}`);
    }

    const result = JSON.stringify(parsed.data, null, 2);
    return {
      result,
      language: "json",
      metadata: {
        rows: String(parsed.data.length),
        fields: hasHeader
          ? String(parsed.meta.fields?.length ?? 0)
          : "n/a",
        header: String(hasHeader),
      },
    };
  },
};
