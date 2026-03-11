import { describe, it, expect } from "vitest";
import jwt from "jsonwebtoken";
import { jwtVerify } from "../../src/plugins/jwt/verify.js";

const SECRET = "my-test-secret";

function makeToken(payload: object, secret: string, options?: jwt.SignOptions): string {
  return jwt.sign(payload, secret, options);
}

describe("jwtVerify utility", () => {
  it("verifies a valid token and returns the payload", async () => {
    const token = makeToken({ sub: "42", role: "user" }, SECRET);
    const res = await jwtVerify.run({ input: token, secret: SECRET });
    const parsed = JSON.parse(res.result) as { valid: boolean; payload: { sub: string } };
    expect(parsed.valid).toBe(true);
    expect(parsed.payload.sub).toBe("42");
    expect(res.language).toBe("json");
  });

  it("sets metadata.valid = true on success", async () => {
    const token = makeToken({ sub: "1" }, SECRET);
    const res = await jwtVerify.run({ input: token, secret: SECRET });
    expect(res.metadata?.valid).toBe("true");
  });

  it("includes issuedAt and expiresAt in metadata when present", async () => {
    const token = makeToken({ sub: "1" }, SECRET, { expiresIn: "2h" });
    const res = await jwtVerify.run({ input: token, secret: SECRET });
    expect(res.metadata?.issuedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(res.metadata?.expiresAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it("throws on wrong secret", async () => {
    const token = makeToken({ sub: "1" }, SECRET);
    await expect(jwtVerify.run({ input: token, secret: "wrong-secret" })).rejects.toThrow(
      "JWT verification failed"
    );
  });

  it("throws on expired token", async () => {
    const token = makeToken({ sub: "1" }, SECRET, { expiresIn: -1 });
    await expect(jwtVerify.run({ input: token, secret: SECRET })).rejects.toThrow(
      "JWT verification failed: token expired"
    );
  });

  it("throws on a completely malformed token", async () => {
    await expect(jwtVerify.run({ input: "not.a.jwt", secret: SECRET })).rejects.toThrow(
      "JWT verification failed"
    );
  });

  it("throws when token is empty", async () => {
    await expect(jwtVerify.run({ input: "", secret: SECRET })).rejects.toThrow(
      "JWT token is required"
    );
  });

  it("throws when secret is empty", async () => {
    const token = makeToken({ sub: "1" }, SECRET);
    await expect(jwtVerify.run({ input: token, secret: "" })).rejects.toThrow(
      "Secret or public key is required"
    );
  });
});
