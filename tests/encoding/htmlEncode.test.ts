import { describe, it, expect } from "vitest";
import { htmlEncode, htmlDecode } from "../../src/plugins/encoding/htmlEncode.js";
import { encodeHtml, decodeHtml } from "../../src/plugins/encoding/htmlEncode.js";

describe("encodeHtml (pure function)", () => {
  it("escapes ampersand", () => {
    expect(encodeHtml("a & b")).toBe("a &amp; b");
  });

  it("escapes angle brackets", () => {
    expect(encodeHtml("<div>")).toBe("&lt;div&gt;");
  });

  it("escapes double quotes", () => {
    expect(encodeHtml('"hello"')).toBe("&quot;hello&quot;");
  });

  it("escapes single quotes", () => {
    expect(encodeHtml("it's")).toBe("it&#39;s");
  });

  it("escapes all special chars in a complex string", () => {
    expect(encodeHtml('<a href="test">it\'s & fine</a>')).toBe(
      "&lt;a href=&quot;test&quot;&gt;it&#39;s &amp; fine&lt;/a&gt;"
    );
  });
});

describe("decodeHtml (pure function)", () => {
  it("decodes &amp;", () => {
    expect(decodeHtml("a &amp; b")).toBe("a & b");
  });

  it("decodes &lt; and &gt;", () => {
    expect(decodeHtml("&lt;div&gt;")).toBe("<div>");
  });

  it("decodes &#39;", () => {
    expect(decodeHtml("it&#39;s")).toBe("it's");
  });

  it("decodes numeric character reference", () => {
    expect(decodeHtml("&#65;")).toBe("A");
  });

  it("decodes hex character reference", () => {
    expect(decodeHtml("&#x41;")).toBe("A");
  });
});

describe("htmlEncode utility", () => {
  it("runs encode correctly", async () => {
    const res = await htmlEncode.run({ input: "<b>bold</b>" });
    expect(res.result).toBe("&lt;b&gt;bold&lt;/b&gt;");
    expect(res.language).toBe("text");
  });

  it("includes metadata", async () => {
    const res = await htmlEncode.run({ input: "<b>" });
    expect(res.metadata?.inputLength).toBe("3");
  });

  it("throws when input is empty", async () => {
    await expect(htmlEncode.run({ input: "" })).rejects.toThrow("Input text is required");
  });
});

describe("htmlDecode utility", () => {
  it("runs decode correctly", async () => {
    const res = await htmlDecode.run({ input: "&lt;b&gt;bold&lt;/b&gt;" });
    expect(res.result).toBe("<b>bold</b>");
  });

  it("handles already decoded text passthrough", async () => {
    const res = await htmlDecode.run({ input: "plain text" });
    expect(res.result).toBe("plain text");
  });

  it("throws when input is empty", async () => {
    await expect(htmlDecode.run({ input: "" })).rejects.toThrow("Input text is required");
  });
});
