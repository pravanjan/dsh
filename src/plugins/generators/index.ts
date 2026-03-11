import type { PluginManifest } from "../../types/plugin.js";
import { uuidV4Generator, uuidV7Generator } from "./uuid.js";
import { passwordGenerator } from "./password.js";
import { randomStringGenerator } from "./randomString.js";

export const generatorsPlugin: PluginManifest = {
  id: "generators",
  label: "Generators",
  description: "Generate UUIDs, passwords, and random strings",
  version: "1.0.0",
  utilities: [uuidV4Generator, uuidV7Generator, passwordGenerator, randomStringGenerator],
};
