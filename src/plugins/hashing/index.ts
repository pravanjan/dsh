import type { PluginManifest } from "../../types/plugin.js";
import { md5Hash } from "./md5.js";
import { sha1Hash, sha256Hash, sha512Hash } from "./sha.js";
import { hmacSha256 } from "./hmac.js";

export const hashingPlugin: PluginManifest = {
  id: "hashing",
  label: "Hashing",
  description: "Generate cryptographic hashes and HMAC signatures",
  version: "1.0.0",
  utilities: [md5Hash, sha1Hash, sha256Hash, sha512Hash, hmacSha256],
};
