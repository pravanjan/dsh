import { describe, it, expect } from "vitest";
import { hmacSha256 } from "../../src/plugins/hashing/hmac.js";

describe("hmacSha256", () => {
  it("produces the known HMAC-SHA256 for 'hello' with key 'secret'", async () => {
    const res = await hmacSha256.run({ input: "hello", key: "secret" });
    expect(res.result).toBe(
      "88aab3ede8d3adf94d26ab90d3bafd4a2083070c3bcce9c014ee04a443847c0b"
    );
  });

  it("produces a 64-char hex string", async () => {
    const res = await hmacSha256.run({ input: "test", key: "mykey" });
    expect(res.result).toHaveLength(64);
    expect(res.result).toMatch(/^[0-9a-f]+$/);
  });

  it("same message with different keys produces different HMACs", async () => {
    const a = await hmacSha256.run({ input: "msg", key: "key1" });
    const b = await hmacSha256.run({ input: "msg", key: "key2" });
    expect(a.result).not.toBe(b.result);
  });

  it("same key with different messages produces different HMACs", async () => {
    const a = await hmacSha256.run({ input: "msg1", key: "key" });
    const b = await hmacSha256.run({ input: "msg2", key: "key" });
    expect(a.result).not.toBe(b.result);
  });

  it("includes algorithm in metadata", async () => {
    const res = await hmacSha256.run({ input: "hello", key: "secret" });
    expect(res.metadata?.algorithm).toBe("HMAC-SHA256");
    expect(res.metadata?.hashLength).toBe("64");
  });

  it("throws when message is empty", async () => {
    await expect(hmacSha256.run({ input: "", key: "secret" })).rejects.toThrow(
      "Message is required"
    );
  });

  it("throws when key is empty", async () => {
    await expect(hmacSha256.run({ input: "hello", key: "" })).rejects.toThrow(
      "Secret key is required"
    );
  });
});
