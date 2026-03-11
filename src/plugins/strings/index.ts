import type { PluginManifest } from "../../types/plugin.js";
import { caseConverter } from "./caseConverter.js";
import { regexTester } from "./regexTester.js";
import { diffViewer } from "./diffViewer.js";

export const stringsPlugin: PluginManifest = {
  id: "strings",
  label: "String Utilities",
  description: "Case conversion, regex testing, and line diff",
  version: "1.0.0",
  utilities: [caseConverter, regexTester, diffViewer],
};
