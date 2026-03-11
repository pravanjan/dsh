import { describe, it, expect } from "vitest";
import { base64Encode, base64Decode } from "../../src/plugins/encoding/base64.js";

describe("base64Encode", () => {
  it("encodes a simple ASCII string", async () => {
    const res = await base64Encode.run({ input: "hello" });
    expect(res.result).toBe("aGVsbG8=");
    expect(res.language).toBe("text");
  });

  it("encodes an empty-ish padded string", async () => {
    const res = await base64Encode.run({ input: "Man" });
    expect(res.result).toBe("TWFu");
  });

  it("encodes a UTF-8 multi-byte string", async () => {
    const res = await base64Encode.run({ input: "héllo" });
    expect(res.result).toBe(Buffer.from("héllo", "utf-8").toString("base64"));
  });

  it("includes metadata with lengths", async () => {
    const res = await base64Encode.run({ input: "test" });
    expect(res.metadata?.inputLength).toBe("4");
    expect(res.metadata?.outputLength).toBe(String(res.result.length));
  });

  it("throws when input is empty", async () => {
    await expect(base64Encode.run({ input: "" })).rejects.toThrow("Input text is required");
  });
});

describe("base64Decode", () => {
  it("decodes a valid Base64 string", async () => {
    const res = await base64Decode.run({ input: "aGVsbG8=" });
    expect(res.result).toBe("hello");
  });

  it("decodes without padding", async () => {
    const res = await base64Decode.run({ input: "TWFu" });
    expect(res.result).toBe("Man");
  });

  it("trims whitespace before decoding", async () => {
    const res = await base64Decode.run({ input: "  aGVsbG8=  " });
    expect(res.result).toBe("hello");
  });

  it("includes metadata with lengths", async () => {
    const res = await base64Decode.run({ input: "aGVsbG8=" });
    expect(res.metadata?.inputLength).toBe("8");
    expect(res.metadata?.outputLength).toBe("5");
  });

  it("throws on invalid Base64 characters", async () => {
    await expect(base64Decode.run({ input: "!!!not-base64!!!" })).rejects.toThrow("Invalid Base64 string");
  });

  it("throws when input is empty", async () => {
    await expect(base64Decode.run({ input: "" })).rejects.toThrow("Input text is required");
  });
});
