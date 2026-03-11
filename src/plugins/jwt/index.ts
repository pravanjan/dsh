import type { PluginManifest } from "../../types/plugin.js";
import { jwtDecode } from "./decode.js";
import { jwtVerify } from "./verify.js";

export const jwtPlugin: PluginManifest = {
  id: "jwt",
  label: "JWT Tools",
  description: "Decode and verify JSON Web Tokens",
  version: "1.0.0",
  utilities: [jwtDecode, jwtVerify],
};
