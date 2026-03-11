import { describe, it, expect } from "vitest";
import { uuidV4Generator, uuidV7Generator } from "../../src/plugins/generators/uuid.js";

const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const UUID_V7_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

describe("uuidV4Generator", () => {
  it("generates a valid UUID v4", async () => {
    const res = await uuidV4Generator.run({});
    expect(res.result).toMatch(UUID_V4_REGEX);
  });

  it("generates multiple UUIDs when count > 1", async () => {
    const res = await uuidV4Generator.run({ count: "5" });
    const lines = res.result.split("\n");
    expect(lines).toHaveLength(5);
    lines.forEach((l) => expect(l).toMatch(UUID_V4_REGEX));
  });

  it("all generated UUIDs are unique", async () => {
    const res = await uuidV4Generator.run({ count: "10" });
    const lines = res.result.split("\n");
    expect(new Set(lines).size).toBe(10);
  });

  it("defaults to count=1 when no input given", async () => {
    const res = await uuidV4Generator.run({});
    expect(res.result.split("\n")).toHaveLength(1);
  });

  it("includes version and count in metadata", async () => {
    const res = await uuidV4Generator.run({ count: "3" });
    expect(res.metadata?.version).toBe("4");
    expect(res.metadata?.count).toBe("3");
  });

  it("throws when count is 0", async () => {
    await expect(uuidV4Generator.run({ count: "0" })).rejects.toThrow("positive integer");
  });

  it("throws when count exceeds 100", async () => {
    await expect(uuidV4Generator.run({ count: "101" })).rejects.toThrow("100 or fewer");
  });
});

describe("uuidV7Generator", () => {
  it("generates a valid UUID v7", async () => {
    const res = await uuidV7Generator.run({});
    expect(res.result).toMatch(UUID_V7_REGEX);
  });

  it("generates multiple UUIDs when count > 1", async () => {
    const res = await uuidV7Generator.run({ count: "4" });
    const lines = res.result.split("\n");
    expect(lines).toHaveLength(4);
    lines.forEach((l) => expect(l).toMatch(UUID_V7_REGEX));
  });

  it("UUID v7 values are time-ordered (monotonically non-decreasing)", async () => {
    const res = await uuidV7Generator.run({ count: "5" });
    const lines = res.result.split("\n");
    for (let i = 1; i < lines.length; i++) {
      expect(lines[i] >= lines[i - 1]).toBe(true);
    }
  });

  it("includes version metadata", async () => {
    const res = await uuidV7Generator.run({});
    expect(res.metadata?.version).toBe("7");
  });

  it("throws when count is negative", async () => {
    await expect(uuidV7Generator.run({ count: "-1" })).rejects.toThrow("positive integer");
  });
});
