import { describe, it, expect } from "vitest";
import { dateDiff, calcDateDiff } from "../../src/plugins/datetime/dateDiff.js";

describe("calcDateDiff (pure function)", () => {
  it("calculates difference of exactly 1 day", () => {
    const r = calcDateDiff("2024-01-01", "2024-01-02");
    expect(r.days).toBe(1);
    expect(r.hours).toBe(24);
    expect(r.minutes).toBe(1440);
  });

  it("calculates difference of exactly 1 hour", () => {
    const r = calcDateDiff("2024-01-01 00:00:00", "2024-01-01 01:00:00");
    expect(r.hours).toBe(1);
    expect(r.minutes).toBe(60);
  });

  it("is order-independent (absolute diff)", () => {
    const forward = calcDateDiff("2024-01-01", "2024-01-10");
    const backward = calcDateDiff("2024-01-10", "2024-01-01");
    expect(forward.days).toBe(backward.days);
  });

  it("returns 0 for identical dates", () => {
    const r = calcDateDiff("2024-06-15", "2024-06-15");
    expect(r.days).toBe(0);
    expect(r.totalMs).toBe(0);
  });

  it("handles a multi-year span", () => {
    const r = calcDateDiff("2020-01-01", "2024-01-01");
    expect(r.days).toBe(1461); // 4 years including one leap year (2020)
  });

  it("throws on invalid start date", () => {
    expect(() => calcDateDiff("not-a-date", "2024-01-01")).toThrow("Invalid date");
  });

  it("throws on invalid end date", () => {
    expect(() => calcDateDiff("2024-01-01", "not-a-date")).toThrow("Invalid date");
  });
});

describe("dateDiff utility", () => {
  it("produces a formatted result with days/hours/minutes/seconds", async () => {
    const res = await dateDiff.run({ input: "2024-01-01", end: "2024-01-03" });
    expect(res.result).toContain("Days   : 2");
    expect(res.result).toContain("Hours  : 48");
    expect(res.language).toBe("text");
  });

  it("includes days metadata", async () => {
    const res = await dateDiff.run({ input: "2024-01-01", end: "2024-01-08" });
    expect(res.metadata?.days).toBe("7");
    expect(res.metadata?.hours).toBe("168");
  });

  it("handles same-day input (zero diff)", async () => {
    const res = await dateDiff.run({ input: "2024-06-15", end: "2024-06-15" });
    expect(res.metadata?.days).toBe("0");
    expect(res.metadata?.minutes).toBe("0");
  });

  it("handles ISO datetime strings", async () => {
    const res = await dateDiff.run({
      input: "2024-01-01T00:00:00.000Z",
      end: "2024-01-01T01:30:00.000Z",
    });
    expect(res.metadata?.minutes).toBe("90");
  });

  it("throws on missing start date", async () => {
    await expect(dateDiff.run({ input: "", end: "2024-01-01" })).rejects.toThrow("required");
  });

  it("throws on missing end date", async () => {
    await expect(dateDiff.run({ input: "2024-01-01", end: "" })).rejects.toThrow("required");
  });
});
