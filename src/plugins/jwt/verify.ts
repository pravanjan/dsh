import jwt from "jsonwebtoken";
import type { UtilityDefinition, UtilityResult } from "../../types/plugin.js";

export const jwtVerify: UtilityDefinition = {
  id: "jwt-verify",
  label: "Verify JWT",
  description: "Verify a JWT signature using a secret or public key",
  pipeAlias: "jwt:verify",
  inputs: [
    {
      name: "input",
      label: "JWT token",
      type: "textarea",
      placeholder: "Paste your JWT here",
      required: true,
    },
    {
      name: "secret",
      label: "Secret / Public key",
      type: "password",
      placeholder: "Enter HMAC secret or RSA/EC public key",
      required: true,
    },
  ],
  async run(inputs: Record<string, string>): Promise<UtilityResult> {
    const token = inputs["input"];
    const secret = inputs["secret"];

    if (!token || token.trim() === "") {
      throw new Error("JWT token is required");
    }
    if (!secret || secret.trim() === "") {
      throw new Error("Secret or public key is required");
    }

    let decoded: jwt.JwtPayload | string;
    try {
      decoded = jwt.verify(token.trim(), secret.trim()) as jwt.JwtPayload | string;
    } catch (err: unknown) {
      if (err instanceof jwt.TokenExpiredError) {
        throw new Error(`JWT verification failed: token expired at ${err.expiredAt.toISOString()}`);
      }
      if (err instanceof jwt.JsonWebTokenError) {
        throw new Error(`JWT verification failed: ${err.message}`);
      }
      throw new Error("JWT verification failed: unknown error");
    }

    const payload = typeof decoded === "string" ? { raw: decoded } : decoded;
    const result = JSON.stringify({ valid: true, payload }, null, 2);

    return {
      result,
      language: "json",
      metadata: {
        valid: "true",
        ...(typeof payload.exp === "number" && {
          expiresAt: new Date(payload.exp * 1000).toISOString(),
        }),
        ...(typeof payload.iat === "number" && {
          issuedAt: new Date(payload.iat * 1000).toISOString(),
        }),
      },
    };
  },
};
