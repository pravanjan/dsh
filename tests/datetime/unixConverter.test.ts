import { describe, it, expect } from "vitest";
import { unixToDate, dateToUnix } from "../../src/plugins/datetime/unixConverter.js";

describe("unixToDate", () => {
  it("converts a known Unix timestamp (seconds) to correct UTC string", async () => {
    // 1700000000 = 2023-11-14 22:13:20 UTC
    const res = await unixToDate.run({ input: "1700000000" });
    expect(res.result).toContain("2023-11-14");
    expect(res.result).toContain("UTC");
    expect(res.language).toBe("text");
  });

  it("auto-detects millisecond timestamps (> 1e12)", async () => {
    const res = await unixToDate.run({ input: "1700000000000" });
    expect(res.result).toContain("2023-11-14");
  });

  it("includes ISO string in metadata", async () => {
    const res = await unixToDate.run({ input: "1700000000" });
    expect(res.metadata?.iso).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it("includes unix (seconds) in metadata", async () => {
    const res = await unixToDate.run({ input: "1700000000" });
    expect(res.metadata?.unix).toBe("1700000000");
  });

  it("handles Unix timestamp 0 (epoch)", async () => {
    const res = await unixToDate.run({ input: "0" });
    expect(res.result).toContain("1970-01-01");
  });

  it("throws on non-numeric input", async () => {
    await expect(unixToDate.run({ input: "not-a-number" })).rejects.toThrow("valid number");
  });

  it("throws on empty input", async () => {
    await expect(unixToDate.run({ input: "" })).rejects.toThrow("required");
  });
});

describe("dateToUnix", () => {
  it("converts ISO date string to Unix timestamp", async () => {
    const res = await dateToUnix.run({ input: "2023-11-14T22:13:20.000Z" });
    expect(res.result).toBe("1700000000");
  });

  it("returns string representation of a number", async () => {
    const res = await dateToUnix.run({ input: "2024-01-01" });
    expect(Number(res.result)).toBeGreaterThan(0);
    expect(res.result).toMatch(/^\d+$/);
  });

  it("includes unixMs in metadata", async () => {
    const res = await dateToUnix.run({ input: "2024-01-01T00:00:00.000Z" });
    expect(Number(res.metadata?.unixMs)).toBe(Number(res.result) * 1000);
  });

  it("round-trips with unixToDate", async () => {
    const original = "2024-06-15T12:00:00.000Z";
    const toUnix = await dateToUnix.run({ input: original });
    const back = await unixToDate.run({ input: toUnix.result });
    expect(back.result).toContain("2024-06-15");
  });

  it("throws on invalid date string", async () => {
    await expect(dateToUnix.run({ input: "not-a-date" })).rejects.toThrow("parse");
  });

  it("throws on empty input", async () => {
    await expect(dateToUnix.run({ input: "" })).rejects.toThrow("required");
  });
});
