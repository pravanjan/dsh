import type { PluginManifest } from "../../types/plugin.js";
import { jsonFormat, jsonMinify, jsonValidate } from "./jsonFormatter.js";
import { yamlToJson } from "./yamlToJson.js";
import { jsonToYaml } from "./jsonToYaml.js";
import { xmlToJson } from "./xmlToJson.js";
import { jsonToXml } from "./jsonToXml.js";
import { csvToJson } from "./csvToJson.js";

export const convertersPlugin: PluginManifest = {
  id: "converters",
  label: "Format Converters",
  description: "Convert between JSON, YAML, XML, and CSV formats",
  version: "1.0.0",
  utilities: [
    jsonFormat,
    jsonMinify,
    jsonValidate,
    yamlToJson,
    jsonToYaml,
    xmlToJson,
    jsonToXml,
    csvToJson,
  ],
};
