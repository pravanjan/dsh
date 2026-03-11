import { describe, it, expect } from "vitest";
import { randomStringGenerator, generateRandomString } from "../../src/plugins/generators/randomString.js";

describe("generateRandomString (pure function)", () => {
  it("returns a string of the requested length", () => {
    const result = generateRandomString(20, "abc");
    expect(result).toHaveLength(20);
  });

  it("only uses characters from the given charset", () => {
    const charset = "XYZ";
    const result = generateRandomString(50, charset);
    expect([...result].every((c) => charset.includes(c))).toBe(true);
  });

  it("throws when charset is empty", () => {
    expect(() => generateRandomString(10, "")).toThrow("Charset must not be empty");
  });

  it("generates different strings on repeated calls", () => {
    const a = generateRandomString(32, "abcdefghijklmnopqrstuvwxyz");
    const b = generateRandomString(32, "abcdefghijklmnopqrstuvwxyz");
    expect(a).not.toBe(b);
  });
});

describe("randomStringGenerator utility", () => {
  it("generates a string of the specified length", async () => {
    const res = await randomStringGenerator.run({ length: "16", charset: "alphanumeric" });
    expect(res.result).toHaveLength(16);
  });

  it("defaults to length 32 alphanumeric", async () => {
    const res = await randomStringGenerator.run({});
    expect(res.result).toHaveLength(32);
    expect(res.result).toMatch(/^[A-Za-z0-9]+$/);
  });

  it("numeric charset produces only digits", async () => {
    const res = await randomStringGenerator.run({ length: "20", charset: "numeric" });
    expect(res.result).toMatch(/^\d+$/);
  });

  it("hex charset produces only hex characters", async () => {
    const res = await randomStringGenerator.run({ length: "20", charset: "hex" });
    expect(res.result).toMatch(/^[0-9a-f]+$/);
  });

  it("lowercase charset produces only lowercase letters", async () => {
    const res = await randomStringGenerator.run({ length: "20", charset: "lowercase" });
    expect(res.result).toMatch(/^[a-z]+$/);
  });

  it("custom charset overrides preset", async () => {
    const res = await randomStringGenerator.run({ length: "30", custom: "ABC" });
    expect(res.result).toMatch(/^[ABC]+$/);
    expect(res.metadata?.charset).toBe("custom");
  });

  it("includes metadata", async () => {
    const res = await randomStringGenerator.run({ length: "10", charset: "hex" });
    expect(res.metadata?.length).toBe("10");
    expect(res.metadata?.charset).toBe("hex");
  });

  it("throws when length is 0", async () => {
    await expect(randomStringGenerator.run({ length: "0" })).rejects.toThrow("positive integer");
  });

  it("throws when length exceeds 4096", async () => {
    await expect(randomStringGenerator.run({ length: "4097" })).rejects.toThrow("4096 or fewer");
  });
});
