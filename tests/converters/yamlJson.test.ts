import { describe, it, expect } from "vitest";
import { yamlToJson } from "../../src/plugins/converters/yamlToJson.js";
import { jsonToYaml } from "../../src/plugins/converters/jsonToYaml.js";

describe("yamlToJson", () => {
  it("converts simple YAML to JSON", async () => {
    const res = await yamlToJson.run({ input: "name: Alice\nage: 30" });
    const parsed = JSON.parse(res.result) as { name: string; age: number };
    expect(parsed.name).toBe("Alice");
    expect(parsed.age).toBe(30);
    expect(res.language).toBe("json");
  });

  it("handles nested YAML", async () => {
    const yaml = "person:\n  name: Bob\n  address:\n    city: NYC";
    const res = await yamlToJson.run({ input: yaml });
    const parsed = JSON.parse(res.result) as {
      person: { name: string; address: { city: string } };
    };
    expect(parsed.person.address.city).toBe("NYC");
  });

  it("handles YAML arrays", async () => {
    const res = await yamlToJson.run({ input: "- a\n- b\n- c" });
    expect(JSON.parse(res.result)).toEqual(["a", "b", "c"]);
  });

  it("includes from/to metadata", async () => {
    const res = await yamlToJson.run({ input: "x: 1" });
    expect(res.metadata?.from).toBe("yaml");
    expect(res.metadata?.to).toBe("json");
  });

  it("throws on invalid YAML", async () => {
    await expect(yamlToJson.run({ input: "key: [unclosed" })).rejects.toThrow("Invalid YAML");
  });

  it("throws on empty input", async () => {
    await expect(yamlToJson.run({ input: "" })).rejects.toThrow("required");
  });
});

describe("jsonToYaml", () => {
  it("converts simple JSON object to YAML", async () => {
    const res = await jsonToYaml.run({ input: '{"name":"Alice","age":30}' });
    expect(res.result).toContain("name: Alice");
    expect(res.result).toContain("age: 30");
    expect(res.language).toBe("yaml");
  });

  it("handles nested JSON", async () => {
    const json = '{"person":{"name":"Bob","city":"NYC"}}';
    const res = await jsonToYaml.run({ input: json });
    expect(res.result).toContain("person:");
    expect(res.result).toContain("name: Bob");
  });

  it("handles JSON arrays", async () => {
    const res = await jsonToYaml.run({ input: '["a","b","c"]' });
    expect(res.result).toContain("- a");
    expect(res.result).toContain("- b");
  });

  it("round-trips with yamlToJson", async () => {
    const original = '{"x":1,"y":2}';
    const toYaml = await jsonToYaml.run({ input: original });
    const backToJson = await yamlToJson.run({ input: toYaml.result });
    expect(JSON.parse(backToJson.result)).toEqual({ x: 1, y: 2 });
  });

  it("throws on invalid JSON", async () => {
    await expect(jsonToYaml.run({ input: "{bad}" })).rejects.toThrow("Invalid JSON");
  });

  it("throws on empty input", async () => {
    await expect(jsonToYaml.run({ input: "" })).rejects.toThrow("required");
  });
});
