import { describe, it, expect } from "vitest";
import { md5Hash } from "../../src/plugins/hashing/md5.js";

describe("md5Hash", () => {
  it("produces the known MD5 hash for 'hello'", async () => {
    const res = await md5Hash.run({ input: "hello" });
    expect(res.result).toBe("5d41402abc4b2a76b9719d911017c592");
  });

  it("produces a 32-char hex string", async () => {
    const res = await md5Hash.run({ input: "test" });
    expect(res.result).toHaveLength(32);
    expect(res.result).toMatch(/^[0-9a-f]+$/);
  });

  it("produces different hashes for different inputs", async () => {
    const a = await md5Hash.run({ input: "foo" });
    const b = await md5Hash.run({ input: "bar" });
    expect(a.result).not.toBe(b.result);
  });

  it("hashes empty-like UTF-8 string consistently", async () => {
    const res = await md5Hash.run({ input: " " });
    expect(res.result).toBe("7215ee9c7d9dc229d2921a40e899ec5f");
  });

  it("includes algorithm in metadata", async () => {
    const res = await md5Hash.run({ input: "hello" });
    expect(res.metadata?.algorithm).toBe("MD5");
    expect(res.metadata?.hashLength).toBe("32");
  });

  it("throws when input is empty", async () => {
    await expect(md5Hash.run({ input: "" })).rejects.toThrow("Input text is required");
  });
});
