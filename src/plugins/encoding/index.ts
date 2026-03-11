import type { PluginManifest } from "../../types/plugin.js";
import { base64Encode, base64Decode } from "./base64.js";
import { urlEncode, urlDecode } from "./urlEncode.js";
import { htmlEncode, htmlDecode } from "./htmlEncode.js";
import { hexEncode, hexDecode } from "./hexEncode.js";

export const encodingPlugin: PluginManifest = {
  id: "encoding",
  label: "Encoding / Decoding",
  description: "Encode and decode strings using various formats",
  version: "1.0.0",
  utilities: [
    base64Encode,
    base64Decode,
    urlEncode,
    urlDecode,
    htmlEncode,
    htmlDecode,
    hexEncode,
    hexDecode,
  ],
};
