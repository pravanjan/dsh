import { describe, it, expect } from "vitest";
import {
  tokenize,
  toCamel,
  toPascal,
  toSnake,
  toKebab,
  toUpperSnake,
  toLower,
  caseConverter,
} from "../../src/plugins/strings/caseConverter.js";

describe("tokenize", () => {
  it("splits space-separated words", () => {
    expect(tokenize("hello world")).toEqual(["hello", "world"]);
  });

  it("splits snake_case", () => {
    expect(tokenize("hello_world_foo")).toEqual(["hello", "world", "foo"]);
  });

  it("splits kebab-case", () => {
    expect(tokenize("hello-world-foo")).toEqual(["hello", "world", "foo"]);
  });

  it("splits camelCase", () => {
    expect(tokenize("helloWorldFoo")).toEqual(["hello", "World", "Foo"]);
  });

  it("splits PascalCase", () => {
    expect(tokenize("HelloWorldFoo")).toEqual(["Hello", "World", "Foo"]);
  });

  it("handles consecutive uppercase (ABCDef)", () => {
    const tokens = tokenize("ABCDef");
    expect(tokens.join(" ").toLowerCase()).toContain("abc");
  });
});

describe("case converters (pure functions)", () => {
  const words = ["hello", "world", "foo"];

  it("toCamel", () => expect(toCamel(words)).toBe("helloWorldFoo"));
  it("toPascal", () => expect(toPascal(words)).toBe("HelloWorldFoo"));
  it("toSnake", () => expect(toSnake(words)).toBe("hello_world_foo"));
  it("toKebab", () => expect(toKebab(words)).toBe("hello-world-foo"));
  it("toUpperSnake", () => expect(toUpperSnake(words)).toBe("HELLO_WORLD_FOO"));
  it("toLower", () => expect(toLower(words)).toBe("hello world foo"));
});

describe("caseConverter utility", () => {
  it("converts snake_case to camelCase", async () => {
    const res = await caseConverter.run({ input: "hello_world", target: "camel" });
    expect(res.result).toBe("helloWorld");
  });

  it("converts camelCase to snake_case", async () => {
    const res = await caseConverter.run({ input: "helloWorld", target: "snake" });
    expect(res.result).toBe("hello_world");
  });

  it("converts space-separated words to PascalCase", async () => {
    const res = await caseConverter.run({ input: "hello world", target: "pascal" });
    expect(res.result).toBe("HelloWorld");
  });

  it("converts to kebab-case", async () => {
    const res = await caseConverter.run({ input: "HelloWorld", target: "kebab" });
    expect(res.result).toBe("hello-world");
  });

  it("converts to UPPER_SNAKE_CASE", async () => {
    const res = await caseConverter.run({ input: "hello world", target: "upper_snake" });
    expect(res.result).toBe("HELLO_WORLD");
  });

  it("converts to lowercase", async () => {
    const res = await caseConverter.run({ input: "Hello_World", target: "lower" });
    expect(res.result).toBe("hello world");
  });

  it("defaults to camelCase when no target given", async () => {
    const res = await caseConverter.run({ input: "hello_world" });
    expect(res.result).toBe("helloWorld");
  });

  it("includes metadata", async () => {
    const res = await caseConverter.run({ input: "hello world", target: "snake" });
    expect(res.metadata?.to).toBe("snake");
    expect(res.metadata?.wordCount).toBe("2");
  });

  it("throws on empty input", async () => {
    await expect(caseConverter.run({ input: "" })).rejects.toThrow("required");
  });

  it("throws on unknown target case", async () => {
    await expect(caseConverter.run({ input: "hello", target: "zigzag" })).rejects.toThrow(
      "Unknown target case"
    );
  });
});
