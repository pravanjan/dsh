import { v4 as uuidv4 } from "uuid";
import { randomBytes } from "crypto";
import type { UtilityDefinition, UtilityResult } from "../../types/plugin.js";

/**
 * UUID v7 — time-ordered UUID per RFC 9562 with monotonic sub-ms sequence.
 * Layout: 48-bit ms timestamp | 4-bit version (7) | 12-bit seq | 2-bit variant (10) | 62-bit rand
 *
 * When multiple UUIDs are generated within the same millisecond, the 12-bit
 * sequence counter (rand_a field) is incremented to guarantee lexicographic ordering.
 */
let _lastMs = -1n;
let _seq = 0;

function uuidv7(): string {
  let ms = BigInt(Date.now());

  if (ms === _lastMs) {
    _seq += 1;
    if (_seq > 0xfff) {
      // Sequence exhausted — wait for next ms
      ms = _lastMs + 1n;
      _lastMs = ms;
      _seq = 0;
    }
  } else if (ms < _lastMs) {
    // Clock went backwards — stay on last ms and increment
    ms = _lastMs;
    _seq += 1;
  } else {
    _lastMs = ms;
    _seq = 0;
  }

  const rand = randomBytes(8);

  const tsHigh = Number((ms >> 16n) & 0xffffffffn);
  const tsLow = Number(ms & 0xffffn);

  // 12-bit monotonic sequence in rand_a
  const randA = _seq & 0xfff;

  // 2-bit variant (10) + 62-bit random
  const clockSeqHigh = (rand[0] & 0x3f) | 0x80;
  const clockSeqLow = rand[1];
  const node = Array.from(rand.slice(2))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return [
    tsHigh.toString(16).padStart(8, "0"),
    tsLow.toString(16).padStart(4, "0"),
    (0x7000 | randA).toString(16).padStart(4, "0"),
    clockSeqHigh.toString(16).padStart(2, "0") + clockSeqLow.toString(16).padStart(2, "0"),
    node,
  ].join("-");
}

export const uuidV4Generator: UtilityDefinition = {
  id: "uuid-v4",
  label: "UUID v4",
  description: "Generate a random UUID version 4",
  pipeAlias: "gen:uuid4",
  inputs: [
    {
      name: "count",
      label: "How many to generate (1–100)",
      type: "text",
      placeholder: "1",
      required: false,
      defaultValue: "1",
    },
  ],
  async run(inputs: Record<string, string>): Promise<UtilityResult> {
    const count = parseCount(inputs["count"]);
    const uuids = Array.from({ length: count }, () => uuidv4());
    return {
      result: uuids.join("\n"),
      language: "text",
      metadata: { version: "4", count: String(count) },
    };
  },
};

export const uuidV7Generator: UtilityDefinition = {
  id: "uuid-v7",
  label: "UUID v7",
  description: "Generate a time-ordered UUID version 7",
  pipeAlias: "gen:uuid7",
  inputs: [
    {
      name: "count",
      label: "How many to generate (1–100)",
      type: "text",
      placeholder: "1",
      required: false,
      defaultValue: "1",
    },
  ],
  async run(inputs: Record<string, string>): Promise<UtilityResult> {
    const count = parseCount(inputs["count"]);
    const uuids = Array.from({ length: count }, () => uuidv7());
    return {
      result: uuids.join("\n"),
      language: "text",
      metadata: { version: "7", count: String(count) },
    };
  },
};

function parseCount(raw: string | undefined): number {
  const n = parseInt(raw ?? "1", 10);
  if (isNaN(n) || n < 1) throw new Error("Count must be a positive integer");
  if (n > 100) throw new Error("Count must be 100 or fewer");
  return n;
}
