import { describe, it, expect } from "vitest";
import { testRegex, regexTester } from "../../src/plugins/strings/regexTester.js";

describe("testRegex (pure function)", () => {
  it("finds all word matches with global flag", () => {
    const { matches, totalMatches } = testRegex("\\w+", "g", "hello world");
    expect(totalMatches).toBe(2);
    expect(matches[0].match).toBe("hello");
    expect(matches[1].match).toBe("world");
  });

  it("returns empty matches when pattern does not match", () => {
    const { totalMatches } = testRegex("xyz", "g", "hello world");
    expect(totalMatches).toBe(0);
  });

  it("captures named groups", () => {
    const { matches } = testRegex("(?<year>\\d{4})-(?<month>\\d{2})", "g", "2024-01 and 2025-06");
    expect(matches[0].groups?.year).toBe("2024");
    expect(matches[0].groups?.month).toBe("01");
    expect(matches[1].groups?.year).toBe("2025");
  });

  it("captures unnamed groups", () => {
    const { matches } = testRegex("(\\d+)-(\\w+)", "g", "42-hello");
    expect(matches[0].captures[0]).toBe("42");
    expect(matches[0].captures[1]).toBe("hello");
  });

  it("reports correct match index", () => {
    const { matches } = testRegex("world", "g", "hello world");
    expect(matches[0].index).toBe(6);
  });

  it("case-insensitive flag works", () => {
    const { totalMatches } = testRegex("HELLO", "gi", "hello Hello HELLO");
    expect(totalMatches).toBe(3);
  });

  it("throws on invalid regex pattern", () => {
    expect(() => testRegex("[invalid", "g", "test")).toThrow("Invalid regex");
  });
});

describe("regexTester utility", () => {
  it("returns JSON result with totalMatches", async () => {
    const res = await regexTester.run({
      input: "foo bar baz",
      pattern: "\\b\\w+\\b",
      flags: "g",
    });
    const parsed = JSON.parse(res.result) as { totalMatches: number };
    expect(parsed.totalMatches).toBe(3);
    expect(res.language).toBe("json");
  });

  it("includes pattern and flags in metadata", async () => {
    const res = await regexTester.run({ input: "abc", pattern: "a", flags: "g" });
    expect(res.metadata?.pattern).toBe("a");
    expect(res.metadata?.flags).toBe("g");
  });

  it("includes totalMatches in metadata", async () => {
    const res = await regexTester.run({ input: "aaa", pattern: "a", flags: "g" });
    expect(res.metadata?.totalMatches).toBe("3");
  });

  it("defaults flags to g when not provided", async () => {
    const res = await regexTester.run({ input: "aa", pattern: "a" });
    const parsed = JSON.parse(res.result) as { totalMatches: number };
    expect(parsed.totalMatches).toBe(2);
  });

  it("throws on empty test string", async () => {
    await expect(regexTester.run({ input: "", pattern: "a" })).rejects.toThrow("required");
  });

  it("throws on empty pattern", async () => {
    await expect(regexTester.run({ input: "hello", pattern: "" })).rejects.toThrow("required");
  });

  it("throws on invalid regex", async () => {
    await expect(regexTester.run({ input: "hello", pattern: "[bad" })).rejects.toThrow(
      "Invalid regex"
    );
  });
});
