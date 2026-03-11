import { describe, it, expect } from "vitest";
import { jsonFormat, jsonMinify, jsonValidate } from "../../src/plugins/converters/jsonFormatter.js";

describe("jsonFormat", () => {
  it("pretty-prints compact JSON with 2-space indent", async () => {
    const res = await jsonFormat.run({ input: '{"a":1,"b":2}' });
    expect(res.result).toBe('{\n  "a": 1,\n  "b": 2\n}');
    expect(res.language).toBe("json");
  });

  it("formats with 4-space indent", async () => {
    const res = await jsonFormat.run({ input: '{"x":1}', indent: "4" });
    expect(res.result).toBe('{\n    "x": 1\n}');
  });

  it("formats with tab indent", async () => {
    const res = await jsonFormat.run({ input: '{"x":1}', indent: "tab" });
    expect(res.result).toBe('{\n\t"x": 1\n}');
  });

  it("handles nested objects", async () => {
    const input = '{"a":{"b":{"c":1}}}';
    const res = await jsonFormat.run({ input });
    const parsed = JSON.parse(res.result) as { a: { b: { c: number } } };
    expect(parsed.a.b.c).toBe(1);
  });

  it("handles JSON arrays", async () => {
    const res = await jsonFormat.run({ input: "[1,2,3]" });
    expect(JSON.parse(res.result)).toEqual([1, 2, 3]);
  });

  it("throws on invalid JSON", async () => {
    await expect(jsonFormat.run({ input: "{bad json}" })).rejects.toThrow("Invalid JSON");
  });

  it("throws on empty input", async () => {
    await expect(jsonFormat.run({ input: "" })).rejects.toThrow("required");
  });
});

describe("jsonMinify", () => {
  it("removes all whitespace from formatted JSON", async () => {
    const res = await jsonMinify.run({ input: '{\n  "a": 1,\n  "b": 2\n}' });
    expect(res.result).toBe('{"a":1,"b":2}');
  });

  it("minified result is valid JSON", async () => {
    const input = '{ "name": "Alice", "age": 30 }';
    const res = await jsonMinify.run({ input });
    expect(() => JSON.parse(res.result)).not.toThrow();
  });

  it("minified is shorter than original", async () => {
    const input = '{\n  "a": 1\n}';
    const res = await jsonMinify.run({ input });
    expect(res.result.length).toBeLessThan(input.length);
    expect(Number(res.metadata?.saved)).toBeGreaterThan(0);
  });

  it("throws on invalid JSON", async () => {
    await expect(jsonMinify.run({ input: "not json" })).rejects.toThrow("Invalid JSON");
  });

  it("throws on empty input", async () => {
    await expect(jsonMinify.run({ input: "" })).rejects.toThrow("required");
  });
});

describe("jsonValidate", () => {
  it("returns valid for correct JSON object", async () => {
    const res = await jsonValidate.run({ input: '{"a":1}' });
    expect(res.result).toBe("Valid JSON");
    expect(res.metadata?.valid).toBe("true");
    expect(res.metadata?.type).toBe("object");
  });

  it("detects array type", async () => {
    const res = await jsonValidate.run({ input: "[1,2,3]" });
    expect(res.metadata?.type).toBe("array");
  });

  it("detects string type", async () => {
    const res = await jsonValidate.run({ input: '"hello"' });
    expect(res.metadata?.type).toBe("string");
  });

  it("throws on invalid JSON", async () => {
    await expect(jsonValidate.run({ input: "{broken" })).rejects.toThrow("Invalid JSON");
  });

  it("throws on empty input", async () => {
    await expect(jsonValidate.run({ input: "" })).rejects.toThrow("required");
  });
});
