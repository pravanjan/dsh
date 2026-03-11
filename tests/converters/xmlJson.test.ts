import { describe, it, expect } from "vitest";
import { xmlToJson } from "../../src/plugins/converters/xmlToJson.js";
import { jsonToXml } from "../../src/plugins/converters/jsonToXml.js";

describe("xmlToJson", () => {
  it("converts a simple XML element to JSON", async () => {
    const res = await xmlToJson.run({ input: "<root><name>Alice</name></root>" });
    const parsed = JSON.parse(res.result) as { root: { name: string } };
    expect(parsed.root.name).toBe("Alice");
    expect(res.language).toBe("json");
  });

  it("handles nested XML", async () => {
    const xml = "<person><name>Bob</name><address><city>NYC</city></address></person>";
    const res = await xmlToJson.run({ input: xml });
    const parsed = JSON.parse(res.result) as {
      person: { name: string; address: { city: string } };
    };
    expect(parsed.person.address.city).toBe("NYC");
  });

  it("preserves XML attributes with @_ prefix", async () => {
    const xml = '<item id="42"><label>Test</label></item>';
    const res = await xmlToJson.run({ input: xml });
    const parsed = JSON.parse(res.result) as { item: { "@_id": number; label: string } };
    expect(parsed.item["@_id"]).toBe(42);
    expect(parsed.item.label).toBe("Test");
  });

  it("includes from/to metadata", async () => {
    const res = await xmlToJson.run({ input: "<x>1</x>" });
    expect(res.metadata?.from).toBe("xml");
    expect(res.metadata?.to).toBe("json");
  });

  it("throws on empty input", async () => {
    await expect(xmlToJson.run({ input: "" })).rejects.toThrow("required");
  });
});

describe("jsonToXml", () => {
  it("converts a simple JSON object to XML", async () => {
    const res = await jsonToXml.run({ input: '{"root":{"name":"Alice"}}' });
    expect(res.result).toContain("<root>");
    expect(res.result).toContain("<name>Alice</name>");
    expect(res.language).toBe("xml");
  });

  it("handles nested JSON", async () => {
    const json = '{"person":{"name":"Bob","city":"NYC"}}';
    const res = await jsonToXml.run({ input: json });
    expect(res.result).toContain("<person>");
    expect(res.result).toContain("<name>Bob</name>");
    expect(res.result).toContain("<city>NYC</city>");
  });

  it("includes from/to metadata", async () => {
    const res = await jsonToXml.run({ input: '{"root":"x"}' });
    expect(res.metadata?.from).toBe("json");
    expect(res.metadata?.to).toBe("xml");
  });

  it("throws when top-level is an array", async () => {
    await expect(jsonToXml.run({ input: "[1,2,3]" })).rejects.toThrow("object at the top level");
  });

  it("throws on invalid JSON", async () => {
    await expect(jsonToXml.run({ input: "{broken}" })).rejects.toThrow("Invalid JSON");
  });

  it("throws on empty input", async () => {
    await expect(jsonToXml.run({ input: "" })).rejects.toThrow("required");
  });
});
