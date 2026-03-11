import { describe, it, expect } from "vitest";
import { urlEncode, urlDecode } from "../../src/plugins/encoding/urlEncode.js";

describe("urlEncode", () => {
  it("encodes special characters", async () => {
    const res = await urlEncode.run({ input: "hello world" });
    expect(res.result).toBe("hello%20world");
  });

  it("encodes a full URL with query params", async () => {
    const res = await urlEncode.run({ input: "https://example.com/path?a=1&b=2" });
    expect(res.result).toBe("https%3A%2F%2Fexample.com%2Fpath%3Fa%3D1%26b%3D2");
  });

  it("encodes unicode characters", async () => {
    const res = await urlEncode.run({ input: "café" });
    expect(res.result).toBe("caf%C3%A9");
  });

  it("includes metadata", async () => {
    const res = await urlEncode.run({ input: "hello" });
    expect(res.metadata?.inputLength).toBe("5");
  });

  it("throws when input is empty", async () => {
    await expect(urlEncode.run({ input: "" })).rejects.toThrow("Input text is required");
  });
});

describe("urlDecode", () => {
  it("decodes percent-encoded string", async () => {
    const res = await urlDecode.run({ input: "hello%20world" });
    expect(res.result).toBe("hello world");
  });

  it("decodes full URL", async () => {
    const res = await urlDecode.run({ input: "https%3A%2F%2Fexample.com%2Fpath" });
    expect(res.result).toBe("https://example.com/path");
  });

  it("decodes unicode sequences", async () => {
    const res = await urlDecode.run({ input: "caf%C3%A9" });
    expect(res.result).toBe("café");
  });

  it("includes metadata", async () => {
    const res = await urlDecode.run({ input: "hello%20world" });
    expect(res.metadata?.outputLength).toBe("11");
  });

  it("throws on malformed percent encoding", async () => {
    await expect(urlDecode.run({ input: "%ZZ" })).rejects.toThrow("Invalid URL-encoded string");
  });

  it("throws when input is empty", async () => {
    await expect(urlDecode.run({ input: "" })).rejects.toThrow("Input text is required");
  });
});
