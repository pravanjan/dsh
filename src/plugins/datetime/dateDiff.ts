import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import type { UtilityDefinition, UtilityResult } from "../../types/plugin.js";

dayjs.extend(utc);

export function calcDateDiff(
  dateA: string,
  dateB: string
): { days: number; hours: number; minutes: number; seconds: number; totalMs: number } {
  const a = dayjs(dateA);
  const b = dayjs(dateB);
  if (!a.isValid()) throw new Error(`Invalid date: "${dateA}"`);
  if (!b.isValid()) throw new Error(`Invalid date: "${dateB}"`);

  const totalMs = Math.abs(b.valueOf() - a.valueOf());
  const totalSeconds = Math.floor(totalMs / 1000);
  const totalMinutes = Math.floor(totalSeconds / 60);
  const totalHours = Math.floor(totalMinutes / 60);
  const days = Math.floor(totalHours / 24);

  return {
    days,
    hours: totalHours,
    minutes: totalMinutes,
    seconds: totalSeconds,
    totalMs,
  };
}

export const dateDiff: UtilityDefinition = {
  id: "date-diff",
  label: "Date Diff",
  description: "Calculate the difference between two dates in days, hours, and minutes",
  pipeAlias: "dt:diff",
  inputs: [
    {
      name: "input",
      label: "Start date (ISO or YYYY-MM-DD HH:mm:ss)",
      type: "text",
      placeholder: "2024-01-01",
      required: true,
    },
    {
      name: "end",
      label: "End date (ISO or YYYY-MM-DD HH:mm:ss)",
      type: "text",
      placeholder: "2024-12-31",
      required: true,
    },
  ],
  async run(inputs: Record<string, string>): Promise<UtilityResult> {
    const start = inputs["input"]?.trim();
    const end = inputs["end"]?.trim();

    if (!start) throw new Error("Start date is required");
    if (!end) throw new Error("End date is required");

    const { days, hours, minutes, seconds } = calcDateDiff(start, end);

    const remainderHours = hours % 24;
    const remainderMinutes = minutes % 60;
    const remainderSeconds = seconds % 60;

    const result = [
      `Total  : ${days}d ${remainderHours}h ${remainderMinutes}m ${remainderSeconds}s`,
      `Days   : ${days}`,
      `Hours  : ${hours}`,
      `Minutes: ${minutes}`,
      `Seconds: ${seconds}`,
    ].join("\n");

    return {
      result,
      language: "text",
      metadata: {
        days: String(days),
        hours: String(hours),
        minutes: String(minutes),
        seconds: String(seconds),
      },
    };
  },
};
