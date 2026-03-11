import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";
import type { UtilityDefinition, UtilityResult } from "../../types/plugin.js";

dayjs.extend(utc);
dayjs.extend(timezone);

export const timezoneConverter: UtilityDefinition = {
  id: "timezone-converter",
  label: "Timezone Converter",
  description: "Convert a datetime from one timezone to another",
  pipeAlias: "dt:tzconvert",
  inputs: [
    {
      name: "input",
      label: "Date/time (ISO or YYYY-MM-DD HH:mm:ss)",
      type: "text",
      placeholder: "2024-03-15 14:30:00",
      required: true,
    },
    {
      name: "from",
      label: "Source timezone (IANA, e.g. America/New_York)",
      type: "text",
      placeholder: "UTC",
      required: true,
      defaultValue: "UTC",
    },
    {
      name: "to",
      label: "Target timezone (IANA, e.g. Asia/Kolkata)",
      type: "text",
      placeholder: "Asia/Kolkata",
      required: true,
    },
  ],
  async run(inputs: Record<string, string>): Promise<UtilityResult> {
    const raw = inputs["input"]?.trim();
    const fromTz = inputs["from"]?.trim();
    const toTz = inputs["to"]?.trim();

    if (!raw) throw new Error("Date/time input is required");
    if (!fromTz) throw new Error("Source timezone is required");
    if (!toTz) throw new Error("Target timezone is required");

    let source: dayjs.Dayjs;
    try {
      source = dayjs.tz(raw, fromTz);
      if (!source.isValid()) throw new Error("invalid");
    } catch {
      throw new Error(`Could not parse "${raw}" in timezone "${fromTz}"`);
    }

    let converted: dayjs.Dayjs;
    try {
      converted = source.tz(toTz);
      if (!converted.isValid()) throw new Error("invalid");
    } catch {
      throw new Error(`Unknown target timezone "${toTz}"`);
    }

    const fmt = "YYYY-MM-DD HH:mm:ss";
    const result = [
      `${source.format(fmt)} ${fromTz}`,
      `  →  `,
      `${converted.format(fmt)} ${toTz}`,
    ].join("\n");

    return {
      result,
      language: "text",
      metadata: {
        from: fromTz,
        to: toTz,
        sourceIso: source.toISOString(),
        convertedIso: converted.toISOString(),
        offsetDiff: String(
          (converted.utcOffset() - source.utcOffset()) / 60
        ) + "h",
      },
    };
  },
};
