import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import type { UtilityDefinition, UtilityResult } from "../../types/plugin.js";

dayjs.extend(utc);

export const unixToDate: UtilityDefinition = {
  id: "unix-to-date",
  label: "Unix → Human Date",
  description: "Convert a Unix timestamp (seconds or ms) to human-readable local and UTC",
  pipeAlias: "ts:todate",
  inputs: [
    {
      name: "input",
      label: "Unix timestamp",
      type: "text",
      placeholder: "1700000000",
      required: true,
    },
  ],
  async run(inputs: Record<string, string>): Promise<UtilityResult> {
    const raw = inputs["input"]?.trim();
    if (!raw) throw new Error("Unix timestamp is required");

    const n = Number(raw);
    if (!Number.isFinite(n)) throw new Error("Input must be a valid number");

    // Auto-detect ms vs seconds: values > 1e12 are treated as milliseconds
    const ms = n > 1e12 ? n : n * 1000;
    const d = dayjs(ms);
    if (!d.isValid()) throw new Error("Could not parse timestamp into a valid date");

    const localStr = d.format("YYYY-MM-DD HH:mm:ss");
    const utcStr = d.utc().format("YYYY-MM-DD HH:mm:ss [UTC]");
    const iso = d.toISOString();

    const result = [
      `Local : ${localStr}`,
      `UTC   : ${utcStr}`,
      `ISO   : ${iso}`,
    ].join("\n");

    return {
      result,
      language: "text",
      metadata: {
        unix: String(Math.floor(ms / 1000)),
        local: localStr,
        utc: utcStr,
        iso,
      },
    };
  },
};

export const dateToUnix: UtilityDefinition = {
  id: "date-to-unix",
  label: "Human Date → Unix",
  description: "Convert a human-readable date/time string to a Unix timestamp",
  pipeAlias: "ts:fromdate",
  inputs: [
    {
      name: "input",
      label: "Date / time string",
      type: "text",
      placeholder: "2024-01-15 10:30:00",
      required: true,
    },
  ],
  async run(inputs: Record<string, string>): Promise<UtilityResult> {
    const raw = inputs["input"]?.trim();
    if (!raw) throw new Error("Date/time string is required");

    const d = dayjs(raw);
    if (!d.isValid()) throw new Error(`Could not parse "${raw}" as a date`);

    const unix = d.unix();
    const unixMs = d.valueOf();

    return {
      result: String(unix),
      language: "text",
      metadata: {
        unix: String(unix),
        unixMs: String(unixMs),
        iso: d.toISOString(),
      },
    };
  },
};
