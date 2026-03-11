import { describe, it, expect } from "vitest";
import { hexEncode, hexDecode } from "../../src/plugins/encoding/hexEncode.js";

describe("hexEncode", () => {
  it("encodes a simple ASCII string", async () => {
    const res = await hexEncode.run({ input: "hello" });
    expect(res.result).toBe("68656c6c6f");
    expect(res.language).toBe("text");
  });

  it("encodes a single character", async () => {
    const res = await hexEncode.run({ input: "A" });
    expect(res.result).toBe("41");
  });

  it("encodes a UTF-8 multibyte character", async () => {
    const res = await hexEncode.run({ input: "é" });
    expect(res.result).toBe(Buffer.from("é", "utf-8").toString("hex"));
  });

  it("includes metadata with bytesEncoded", async () => {
    const res = await hexEncode.run({ input: "hello" });
    expect(res.metadata?.bytesEncoded).toBe("5");
    expect(res.metadata?.inputLength).toBe("5");
  });

  it("throws when input is empty", async () => {
    await expect(hexEncode.run({ input: "" })).rejects.toThrow("Input text is required");
  });
});

describe("hexDecode", () => {
  it("decodes a hex string to text", async () => {
    const res = await hexDecode.run({ input: "68656c6c6f" });
    expect(res.result).toBe("hello");
  });

  it("accepts uppercase hex", async () => {
    const res = await hexDecode.run({ input: "48454C4C4F" });
    expect(res.result).toBe("HELLO");
  });

  it("strips spaces from input", async () => {
    const res = await hexDecode.run({ input: "68 65 6c 6c 6f" });
    expect(res.result).toBe("hello");
  });

  it("includes metadata", async () => {
    const res = await hexDecode.run({ input: "68656c6c6f" });
    expect(res.metadata?.outputLength).toBe("5");
  });

  it("throws on invalid hex characters", async () => {
    await expect(hexDecode.run({ input: "zzzz" })).rejects.toThrow("Invalid hex string");
  });

  it("throws on odd-length hex string", async () => {
    await expect(hexDecode.run({ input: "abc" })).rejects.toThrow("length must be even");
  });

  it("throws when input is empty", async () => {
    await expect(hexDecode.run({ input: "" })).rejects.toThrow("Input text is required");
  });
});
