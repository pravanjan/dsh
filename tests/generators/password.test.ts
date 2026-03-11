import { describe, it, expect } from "vitest";
import { passwordGenerator } from "../../src/plugins/generators/password.js";

describe("passwordGenerator", () => {
  it("generates a password of the specified length", async () => {
    const res = await passwordGenerator.run({ length: "20" });
    expect(res.result).toHaveLength(20);
  });

  it("defaults to length 16", async () => {
    const res = await passwordGenerator.run({});
    expect(res.result).toHaveLength(16);
  });

  it("generates different passwords on each call", async () => {
    const a = await passwordGenerator.run({ length: "24" });
    const b = await passwordGenerator.run({ length: "24" });
    expect(a.result).not.toBe(b.result);
  });

  it("includes a digit when numbers=yes", async () => {
    // Run several times to reduce flakiness
    const results = await Promise.all(
      Array.from({ length: 5 }, () =>
        passwordGenerator.run({ length: "32", numbers: "yes", symbols: "no", uppercase: "no" })
      )
    );
    expect(results.some((r) => /\d/.test(r.result))).toBe(true);
  });

  it("includes an uppercase letter when uppercase=yes", async () => {
    const results = await Promise.all(
      Array.from({ length: 5 }, () =>
        passwordGenerator.run({ length: "32", numbers: "no", symbols: "no", uppercase: "yes" })
      )
    );
    expect(results.some((r) => /[A-Z]/.test(r.result))).toBe(true);
  });

  it("includes a symbol when symbols=yes", async () => {
    const results = await Promise.all(
      Array.from({ length: 5 }, () =>
        passwordGenerator.run({ length: "32", numbers: "no", symbols: "yes", uppercase: "no" })
      )
    );
    expect(results.some((r) => /[^a-zA-Z0-9]/.test(r.result))).toBe(true);
  });

  it("includes metadata with correct length", async () => {
    const res = await passwordGenerator.run({ length: "12" });
    expect(res.metadata?.length).toBe("12");
  });

  it("throws when length is less than 4", async () => {
    await expect(passwordGenerator.run({ length: "3" })).rejects.toThrow("at least 4");
  });

  it("throws when length exceeds 256", async () => {
    await expect(passwordGenerator.run({ length: "257" })).rejects.toThrow("256 or fewer");
  });

  it("throws when length is not a number", async () => {
    await expect(passwordGenerator.run({ length: "abc" })).rejects.toThrow("at least 4");
  });
});
