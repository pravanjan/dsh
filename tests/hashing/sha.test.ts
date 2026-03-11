import { describe, it, expect } from "vitest";
import { sha1Hash, sha256Hash, sha512Hash } from "../../src/plugins/hashing/sha.js";

describe("sha1Hash", () => {
  it("produces the known SHA-1 hash for 'hello'", async () => {
    const res = await sha1Hash.run({ input: "hello" });
    expect(res.result).toBe("aaf4c61ddcc5e8a2dabede0f3b482cd9aea9434d");
  });

  it("produces a 40-char hex string", async () => {
    const res = await sha1Hash.run({ input: "test" });
    expect(res.result).toHaveLength(40);
    expect(res.result).toMatch(/^[0-9a-f]+$/);
  });

  it("includes algorithm metadata", async () => {
    const res = await sha1Hash.run({ input: "x" });
    expect(res.metadata?.algorithm).toBe("SHA1");
  });

  it("throws when input is empty", async () => {
    await expect(sha1Hash.run({ input: "" })).rejects.toThrow("Input text is required");
  });
});

describe("sha256Hash", () => {
  it("produces the known SHA-256 hash for 'hello'", async () => {
    const res = await sha256Hash.run({ input: "hello" });
    expect(res.result).toBe(
      "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824"
    );
  });

  it("produces a 64-char hex string", async () => {
    const res = await sha256Hash.run({ input: "test" });
    expect(res.result).toHaveLength(64);
    expect(res.result).toMatch(/^[0-9a-f]+$/);
  });

  it("different inputs produce different hashes", async () => {
    const a = await sha256Hash.run({ input: "foo" });
    const b = await sha256Hash.run({ input: "FOO" });
    expect(a.result).not.toBe(b.result);
  });

  it("includes algorithm metadata", async () => {
    const res = await sha256Hash.run({ input: "x" });
    expect(res.metadata?.algorithm).toBe("SHA256");
  });

  it("throws when input is empty", async () => {
    await expect(sha256Hash.run({ input: "" })).rejects.toThrow("Input text is required");
  });
});

describe("sha512Hash", () => {
  it("produces the known SHA-512 hash for 'hello'", async () => {
    const res = await sha512Hash.run({ input: "hello" });
    expect(res.result).toBe(
      "9b71d224bd62f3785d96d46ad3ea3d73319bfbc2890caadae2dff72519673ca72323c3d99ba5c11d7c7acc6e14b8c5da0c4663475c2e5c3adef46f73bcdec043"
    );
  });

  it("produces a 128-char hex string", async () => {
    const res = await sha512Hash.run({ input: "test" });
    expect(res.result).toHaveLength(128);
    expect(res.result).toMatch(/^[0-9a-f]+$/);
  });

  it("includes algorithm metadata", async () => {
    const res = await sha512Hash.run({ input: "x" });
    expect(res.metadata?.algorithm).toBe("SHA512");
    expect(res.metadata?.hashLength).toBe("128");
  });

  it("throws when input is empty", async () => {
    await expect(sha512Hash.run({ input: "" })).rejects.toThrow("Input text is required");
  });
});
