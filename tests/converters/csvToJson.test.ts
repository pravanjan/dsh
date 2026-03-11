import { describe, it, expect } from "vitest";
import { csvToJson } from "../../src/plugins/converters/csvToJson.js";

describe("csvToJson", () => {
  it("converts CSV with header row to JSON array of objects", async () => {
    const csv = "name,age\nAlice,30\nBob,25";
    const res = await csvToJson.run({ input: csv, header: "yes" });
    const parsed = JSON.parse(res.result) as Array<{ name: string; age: number }>;
    expect(parsed).toHaveLength(2);
    expect(parsed[0].name).toBe("Alice");
    expect(parsed[0].age).toBe(30);
    expect(parsed[1].name).toBe("Bob");
    expect(res.language).toBe("json");
  });

  it("converts CSV without header to nested arrays", async () => {
    const csv = "Alice,30\nBob,25";
    const res = await csvToJson.run({ input: csv, header: "no" });
    const parsed = JSON.parse(res.result) as Array<Array<string | number>>;
    expect(parsed[0]).toEqual(["Alice", 30]);
    expect(parsed[1]).toEqual(["Bob", 25]);
  });

  it("handles quoted fields with commas inside", async () => {
    const csv = 'name,address\nAlice,"New York, NY"';
    const res = await csvToJson.run({ input: csv, header: "yes" });
    const parsed = JSON.parse(res.result) as Array<{ name: string; address: string }>;
    expect(parsed[0].address).toBe("New York, NY");
  });

  it("auto-casts numeric values", async () => {
    const csv = "x,y\n1,2.5\n3,4";
    const res = await csvToJson.run({ input: csv });
    const parsed = JSON.parse(res.result) as Array<{ x: number; y: number }>;
    expect(typeof parsed[0].x).toBe("number");
    expect(parsed[0].y).toBe(2.5);
  });

  it("includes row count in metadata", async () => {
    const csv = "a,b\n1,2\n3,4\n5,6";
    const res = await csvToJson.run({ input: csv });
    expect(res.metadata?.rows).toBe("3");
  });

  it("includes field count in metadata when header=yes", async () => {
    const csv = "a,b,c\n1,2,3";
    const res = await csvToJson.run({ input: csv, header: "yes" });
    expect(res.metadata?.fields).toBe("3");
  });

  it("skips empty lines", async () => {
    const csv = "name,age\nAlice,30\n\nBob,25\n";
    const res = await csvToJson.run({ input: csv });
    const parsed = JSON.parse(res.result) as unknown[];
    expect(parsed).toHaveLength(2);
  });

  it("throws on empty input", async () => {
    await expect(csvToJson.run({ input: "" })).rejects.toThrow("required");
  });
});
