import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Readable } from "stream";
import { PluginRegistry } from "../../src/core/PluginRegistry.js";
import { handlePipe } from "../../src/core/PipeHandler.js";
import { encodingPlugin } from "../../src/plugins/encoding/index.js";
import { hashingPlugin } from "../../src/plugins/hashing/index.js";
import { jwtPlugin } from "../../src/plugins/jwt/index.js";
import { generatorsPlugin } from "../../src/plugins/generators/index.js";
import { convertersPlugin } from "../../src/plugins/converters/index.js";
import { datetimePlugin } from "../../src/plugins/datetime/index.js";
import { stringsPlugin } from "../../src/plugins/strings/index.js";

// ── Helpers ─────────────────────────────────────────────────────────────────

function makeRegistry(): PluginRegistry {
  const registry = new PluginRegistry();
  for (const plugin of [
    encodingPlugin,
    hashingPlugin,
    jwtPlugin,
    generatorsPlugin,
    convertersPlugin,
    datetimePlugin,
    stringsPlugin,
  ]) {
    registry.register(plugin);
  }
  return registry;
}

// Replaces process.stdin with a Readable that yields `data` then ends.
// Returns a cleanup function that restores the original.
function replaceStdin(data: string): () => void {
  const readable = Readable.from([data]);
  const original = Object.getOwnPropertyDescriptor(process, "stdin");
  Object.defineProperty(process, "stdin", {
    value: readable,
    writable: true,
    configurable: true,
  });
  return () => {
    if (original) {
      Object.defineProperty(process, "stdin", original);
    }
  };
}

// ── Test suite ───────────────────────────────────────────────────────────────

describe("Pipe mode — integration", () => {
  let registry: PluginRegistry;
  let stdoutOutput: string;
  let stderrOutput: string;
  let exitCode: number | undefined;
  let restoreStdin: (() => void) | undefined;

  beforeEach(() => {
    registry = makeRegistry();
    stdoutOutput = "";
    stderrOutput = "";
    exitCode = undefined;
    restoreStdin = undefined;

    vi.spyOn(process.stdout, "write").mockImplementation((data) => {
      stdoutOutput += String(data);
      return true;
    });
    vi.spyOn(process.stderr, "write").mockImplementation((data) => {
      stderrOutput += String(data);
      return true;
    });

    // For exit(0): don't throw — let the function return naturally so the
    // try-block doesn't accidentally trigger handlePipe's own catch.
    // For exit(1/2): throw to stop execution early.
    vi.spyOn(process, "exit").mockImplementation(
      (code?: string | number | null) => {
        const n = typeof code === "number" ? code : 0;
        exitCode = n;
        if (n !== 0) {
          throw new Error(`__exit__:${n}`);
        }
        return undefined as never;
      }
    );
  });

  afterEach(() => {
    restoreStdin?.();
    vi.restoreAllMocks();
  });

  async function run(alias: string, stdin: string, extraArgv: string[] = []) {
    restoreStdin?.();
    restoreStdin = replaceStdin(stdin);
    try {
      await handlePipe(registry, ["node", "devtool", alias, ...extraArgv]);
    } catch (err) {
      if (!(err instanceof Error && err.message.startsWith("__exit__"))) {
        throw err;
      }
    }
  }

  // ── Exit codes ──────────────────────────────────────────────────────────

  it("exits 0 on success", async () => {
    await run("base64:encode", "hello");
    expect(exitCode).toBe(0);
  });

  it("exits 2 for unknown alias", async () => {
    await run("unknown:alias", "");
    expect(exitCode).toBe(2);
  });

  it("exits 2 when no alias provided", async () => {
    restoreStdin?.();
    restoreStdin = replaceStdin("");
    try {
      await handlePipe(registry, ["node", "devtool"]);
    } catch {
      /* __exit__ sentinel */
    }
    expect(exitCode).toBe(2);
  });

  it("exits 1 on runtime error", async () => {
    await run("base64:decode", "!!!not-valid-base64!!!");
    expect(exitCode).toBe(1);
  });

  // ── stdout / stderr routing ─────────────────────────────────────────────

  it("writes result to stdout, not stderr", async () => {
    await run("base64:encode", "hello");
    expect(stdoutOutput).toContain("aGVsbG8=");
    expect(stderrOutput).toBe("");
  });

  it("writes error to stderr, not stdout", async () => {
    await run("base64:decode", "!!!not-valid-base64!!!");
    expect(stderrOutput).toContain("Error:");
    expect(stdoutOutput).toBe("");
  });

  it("writes unknown alias error to stderr", async () => {
    await run("no:such", "");
    expect(stderrOutput).toContain("Unknown pipe alias");
    expect(stderrOutput).toContain("no:such");
  });

  // ── Stdin trimming ──────────────────────────────────────────────────────

  it("trims trailing newline from stdin (piped echo)", async () => {
    await run("base64:encode", "hello\n");
    expect(stdoutOutput.trim()).toBe("aGVsbG8=");
  });

  it("trims leading/trailing whitespace from stdin", async () => {
    await run("base64:encode", "  hello  ");
    expect(stdoutOutput.trim()).toBe("aGVsbG8=");
  });

  // ── Flag parsing ────────────────────────────────────────────────────────

  it("parses --key flag for HMAC", async () => {
    await run("hash:hmac", "hello", ["--key", "secret"]);
    expect(exitCode).toBe(0);
    expect(stdoutOutput.trim()).toMatch(/^[a-f0-9]{64}$/);
  });

  it("trims flag values (padded key produces same HMAC as plain key)", async () => {
    await run("hash:hmac", "hello", ["--key", "secret"]);
    const hash1 = stdoutOutput.trim();

    stdoutOutput = "";
    await run("hash:hmac", "hello", ["--key", "  secret  "]);
    const hash2 = stdoutOutput.trim();

    expect(hash1).toBe(hash2);
  });

  // ── Encoding round-trips ────────────────────────────────────────────────

  it("base64:encode → base64:decode round-trip", async () => {
    await run("base64:encode", "hello world");
    const encoded = stdoutOutput.trim();
    stdoutOutput = "";
    await run("base64:decode", encoded);
    expect(stdoutOutput.trim()).toBe("hello world");
  });

  it("url:encode → url:decode round-trip", async () => {
    await run("url:encode", "hello world");
    const encoded = stdoutOutput.trim();
    stdoutOutput = "";
    await run("url:decode", encoded);
    expect(stdoutOutput.trim()).toBe("hello world");
  });

  it("hex:encode → hex:decode round-trip", async () => {
    await run("hex:encode", "hello");
    const encoded = stdoutOutput.trim();
    stdoutOutput = "";
    await run("hex:decode", encoded);
    expect(stdoutOutput.trim()).toBe("hello");
  });

  // ── Hashing ─────────────────────────────────────────────────────────────

  it("hash:md5 produces 32-char hex", async () => {
    await run("hash:md5", "hello");
    expect(stdoutOutput.trim()).toMatch(/^[a-f0-9]{32}$/);
  });

  it("hash:sha256 produces 64-char hex", async () => {
    await run("hash:sha256", "hello");
    expect(stdoutOutput.trim()).toMatch(/^[a-f0-9]{64}$/);
  });

  // ── Converters ──────────────────────────────────────────────────────────

  it("json:format outputs valid formatted JSON", async () => {
    await run("json:format", '{"b":2,"a":1}');
    const parsed = JSON.parse(stdoutOutput.trim());
    expect(parsed).toEqual({ b: 2, a: 1 });
  });

  it("json:validate outputs 'valid' for valid JSON", async () => {
    await run("json:validate", '{"ok":true}');
    expect(stdoutOutput.toLowerCase()).toContain("valid");
  });

  it("yaml:tojson converts YAML to JSON", async () => {
    await run("yaml:tojson", "key: value\nnum: 42");
    const parsed = JSON.parse(stdoutOutput.trim());
    expect(parsed).toEqual({ key: "value", num: 42 });
  });

  // ── Generators ──────────────────────────────────────────────────────────
  // UUID generators use stdin as the optional "count" field.
  // Pass "1" so parseCount("1") = 1 and generates a single UUID.

  it("gen:uuid4 outputs a valid UUIDv4", async () => {
    await run("gen:uuid4", "1");
    expect(stdoutOutput.trim()).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    );
  });

  it("gen:uuid7 outputs a valid UUIDv7 (version digit = 7)", async () => {
    await run("gen:uuid7", "1");
    expect(stdoutOutput.trim()).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    );
  });

  // ── Strings ─────────────────────────────────────────────────────────────

  it("str:camel converts snake_case to camelCase", async () => {
    await run("str:camel", "hello_world");
    expect(stdoutOutput.trim()).toBe("helloWorld");
  });

  // ── DateTime ────────────────────────────────────────────────────────────

  it("ts:todate converts unix timestamp 0 to epoch date string", async () => {
    await run("ts:todate", "0");
    expect(exitCode).toBe(0);
    expect(stdoutOutput).toContain("1970");
  });

  // ── All built-in aliases registered ─────────────────────────────────────

  it("all built-in pipe aliases resolve in the registry", () => {
    const expectedAliases = [
      "base64:encode", "base64:decode",
      "url:encode",    "url:decode",
      "html:encode",   "html:decode",
      "hex:encode",    "hex:decode",
      "hash:md5",      "hash:sha1",   "hash:sha256", "hash:sha512", "hash:hmac",
      "jwt:decode",    "jwt:verify",
      "gen:uuid4",     "gen:uuid7",   "gen:password", "gen:random",
      "json:format",   "json:minify", "json:validate",
      "yaml:tojson",   "json:toyaml",
      "xml:tojson",    "json:toxml",  "csv:tojson",
      "ts:todate",     "ts:fromdate",
      "dt:tzconvert",  "dt:diff",
      "str:camel",     "str:regex",   "str:diff",
    ];

    for (const alias of expectedAliases) {
      expect(
        registry.getUtilityByAlias(alias),
        `Alias "${alias}" should be registered`
      ).not.toBeNull();
    }
  });
});
