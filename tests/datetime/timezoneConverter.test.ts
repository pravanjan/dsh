import { describe, it, expect } from "vitest";
import { timezoneConverter } from "../../src/plugins/datetime/timezoneConverter.js";

describe("timezoneConverter", () => {
  it("converts UTC to Asia/Kolkata (+5:30)", async () => {
    const res = await timezoneConverter.run({
      input: "2024-01-01 00:00:00",
      from: "UTC",
      to: "Asia/Kolkata",
    });
    // UTC+5:30 → 05:30
    expect(res.result).toContain("2024-01-01 05:30:00");
    expect(res.result).toContain("Asia/Kolkata");
  });

  it("converts America/New_York to Europe/London", async () => {
    const res = await timezoneConverter.run({
      input: "2024-06-01 10:00:00",
      from: "America/New_York",
      to: "Europe/London",
    });
    // EDT (UTC-4) → BST (UTC+1) = +5h
    expect(res.result).toContain("2024-06-01 15:00:00");
  });

  it("includes from and to in metadata", async () => {
    const res = await timezoneConverter.run({
      input: "2024-01-01 00:00:00",
      from: "UTC",
      to: "America/New_York",
    });
    expect(res.metadata?.from).toBe("UTC");
    expect(res.metadata?.to).toBe("America/New_York");
  });

  it("includes ISO strings in metadata", async () => {
    const res = await timezoneConverter.run({
      input: "2024-01-01 00:00:00",
      from: "UTC",
      to: "UTC",
    });
    expect(res.metadata?.sourceIso).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(res.metadata?.convertedIso).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it("handles same source and target timezone", async () => {
    const res = await timezoneConverter.run({
      input: "2024-03-15 08:00:00",
      from: "UTC",
      to: "UTC",
    });
    expect(res.result).toContain("2024-03-15 08:00:00");
  });

  it("throws on empty datetime input", async () => {
    await expect(
      timezoneConverter.run({ input: "", from: "UTC", to: "Asia/Kolkata" })
    ).rejects.toThrow("required");
  });

  it("throws on missing from timezone", async () => {
    await expect(
      timezoneConverter.run({ input: "2024-01-01", from: "", to: "UTC" })
    ).rejects.toThrow("required");
  });

  it("throws on invalid target timezone", async () => {
    await expect(
      timezoneConverter.run({ input: "2024-01-01 00:00:00", from: "UTC", to: "Not/AZone" })
    ).rejects.toThrow("timezone");
  });
});
