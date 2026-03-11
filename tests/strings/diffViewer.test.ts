import { describe, it, expect } from "vitest";
import { computeDiffStats, diffViewer } from "../../src/plugins/strings/diffViewer.js";

describe("computeDiffStats (pure function)", () => {
  it("reports 0 added/removed for identical texts", () => {
    const stats = computeDiffStats("hello\nworld\n", "hello\nworld\n");
    expect(stats.added).toBe(0);
    expect(stats.removed).toBe(0);
  });

  it("counts added lines correctly", () => {
    const stats = computeDiffStats("line1\n", "line1\nline2\n");
    expect(stats.added).toBe(1);
    expect(stats.removed).toBe(0);
  });

  it("counts removed lines correctly", () => {
    const stats = computeDiffStats("line1\nline2\n", "line1\n");
    expect(stats.removed).toBe(1);
    expect(stats.added).toBe(0);
  });

  it("counts both added and removed when lines change", () => {
    const stats = computeDiffStats("foo\nbar\n", "foo\nbaz\n");
    expect(stats.added).toBe(1);
    expect(stats.removed).toBe(1);
  });
});

describe("diffViewer utility", () => {
  it("returns unified diff format output", async () => {
    const res = await diffViewer.run({
      input: "hello\nworld\n",
      textB: "hello\nearth\n",
    });
    expect(res.result).toContain("---");
    expect(res.result).toContain("+++");
    expect(res.result).toContain("-world");
    expect(res.result).toContain("+earth");
    expect(res.language).toBe("text");
  });

  it("shows no diff for identical texts", async () => {
    const text = "same\ntext\n";
    const res = await diffViewer.run({ input: text, textB: text });
    expect(res.metadata?.identical).toBe("true");
    expect(res.metadata?.linesAdded).toBe("0");
    expect(res.metadata?.linesRemoved).toBe("0");
  });

  it("includes linesAdded in metadata", async () => {
    const res = await diffViewer.run({
      input: "line1\n",
      textB: "line1\nline2\nline3\n",
    });
    expect(Number(res.metadata?.linesAdded)).toBeGreaterThan(0);
  });

  it("includes linesRemoved in metadata", async () => {
    const res = await diffViewer.run({
      input: "line1\nline2\nline3\n",
      textB: "line1\n",
    });
    expect(Number(res.metadata?.linesRemoved)).toBeGreaterThan(0);
  });

  it("diff output contains file labels text-a and text-b", async () => {
    const res = await diffViewer.run({ input: "a\n", textB: "b\n" });
    expect(res.result).toContain("text-a");
    expect(res.result).toContain("text-b");
  });

  it("throws when Text A is empty", async () => {
    await expect(diffViewer.run({ input: "", textB: "hello" })).rejects.toThrow(
      "Text A is required"
    );
  });

  it("throws when Text B is empty", async () => {
    await expect(diffViewer.run({ input: "hello", textB: "" })).rejects.toThrow(
      "Text B is required"
    );
  });
});
