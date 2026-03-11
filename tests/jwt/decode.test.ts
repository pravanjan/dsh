import { describe, it, expect } from "vitest";
import jwt from "jsonwebtoken";
import { jwtDecode, parseJwtParts } from "../../src/plugins/jwt/decode.js";

const SECRET = "test-secret";

function makeToken(payload: object, options?: jwt.SignOptions): string {
  return jwt.sign(payload, SECRET, options);
}

describe("parseJwtParts", () => {
  it("correctly splits a valid JWT into header, payload, signature", () => {
    const token = makeToken({ sub: "123", name: "Alice" });
    const { header, payload, signature } = parseJwtParts(token);
    expect(header.alg).toBe("HS256");
    expect(header.typ).toBe("JWT");
    expect(payload.sub).toBe("123");
    expect(payload.name).toBe("Alice");
    expect(signature).toBeTypeOf("string");
    expect(signature.length).toBeGreaterThan(0);
  });

  it("throws on a token with fewer than 3 parts", () => {
    expect(() => parseJwtParts("only.two")).toThrow("Invalid JWT");
  });

  it("throws on a token with more than 3 parts", () => {
    expect(() => parseJwtParts("a.b.c.d")).toThrow("Invalid JWT");
  });

  it("throws on completely invalid input", () => {
    expect(() => parseJwtParts("not-a-jwt")).toThrow("Invalid JWT");
  });
});

describe("jwtDecode utility", () => {
  it("decodes a valid JWT and returns JSON result", async () => {
    const token = makeToken({ sub: "1", role: "admin" });
    const res = await jwtDecode.run({ input: token });
    const parsed = JSON.parse(res.result) as {
      header: { alg: string; typ: string };
      payload: { sub: string; role: string };
      signature: string;
    };
    expect(parsed.header.alg).toBe("HS256");
    expect(parsed.payload.sub).toBe("1");
    expect(parsed.payload.role).toBe("admin");
    expect(res.language).toBe("json");
  });

  it("adds human-readable iat and exp fields", async () => {
    const token = makeToken({ sub: "1" }, { expiresIn: "1h" });
    const res = await jwtDecode.run({ input: token });
    const parsed = JSON.parse(res.result) as {
      payload: { iat_human: string; exp_human: string };
    };
    expect(parsed.payload.iat_human).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(parsed.payload.exp_human).toContain("(valid)");
  });

  it("marks an expired token in exp_human", async () => {
    const token = makeToken({ sub: "1" }, { expiresIn: -1 });
    const res = await jwtDecode.run({ input: token });
    const parsed = JSON.parse(res.result) as { payload: { exp_human: string } };
    expect(parsed.payload.exp_human).toContain("(EXPIRED)");
  });

  it("sets metadata.expired = yes for expired token", async () => {
    const token = makeToken({ sub: "1" }, { expiresIn: -1 });
    const res = await jwtDecode.run({ input: token });
    expect(res.metadata?.expired).toBe("yes");
  });

  it("sets metadata.expired = no for valid token", async () => {
    const token = makeToken({ sub: "1" }, { expiresIn: "1h" });
    const res = await jwtDecode.run({ input: token });
    expect(res.metadata?.expired).toBe("no");
  });

  it("includes algorithm in metadata", async () => {
    const token = makeToken({ sub: "1" });
    const res = await jwtDecode.run({ input: token });
    expect(res.metadata?.algorithm).toBe("HS256");
  });

  it("trims whitespace from input token", async () => {
    const token = makeToken({ sub: "1" });
    const res = await jwtDecode.run({ input: `  ${token}  ` });
    expect(res.result).toBeTruthy();
  });

  it("throws when input is empty", async () => {
    await expect(jwtDecode.run({ input: "" })).rejects.toThrow("JWT token is required");
  });

  it("throws on malformed token", async () => {
    await expect(jwtDecode.run({ input: "bad.token" })).rejects.toThrow("Invalid JWT");
  });
});
