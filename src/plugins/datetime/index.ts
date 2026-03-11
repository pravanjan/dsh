import type { PluginManifest } from "../../types/plugin.js";
import { unixToDate, dateToUnix } from "./unixConverter.js";
import { timezoneConverter } from "./timezoneConverter.js";
import { dateDiff } from "./dateDiff.js";

export const datetimePlugin: PluginManifest = {
  id: "datetime",
  label: "Date / Time",
  description: "Unix timestamp conversion, timezone conversion, and date diff",
  version: "1.0.0",
  utilities: [unixToDate, dateToUnix, timezoneConverter, dateDiff],
};
