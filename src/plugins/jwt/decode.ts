import type { UtilityDefinition, UtilityResult } from "../../types/plugin.js";

interface JwtHeader {
  alg?: string;
  typ?: string;
  [key: string]: unknown;
}

interface JwtPayload {
  iat?: number;
  exp?: number;
  nbf?: number;
  [key: string]: unknown;
}

export function parseJwtParts(token: string): {
  header: JwtHeader;
  payload: JwtPayload;
  signature: string;
} {
  const parts = token.trim().split(".");
  if (parts.length !== 3) {
    throw new Error("Invalid JWT — expected 3 dot-separated parts");
  }

  const decodeSegment = (segment: string): unknown => {
    const padded = segment + "=".repeat((4 - (segment.length % 4)) % 4);
    const json = Buffer.from(padded, "base64url").toString("utf-8");
    return JSON.parse(json) as unknown;
  };

  const header = decodeSegment(parts[0]) as JwtHeader;
  const payload = decodeSegment(parts[1]) as JwtPayload;

  return { header, payload, signature: parts[2] };
}

export function formatJwtDecode(token: string): string {
  const { header, payload, signature } = parseJwtParts(token);

  const now = Math.floor(Date.now() / 1000);
  let expiredStatus = "";
  if (typeof payload.exp === "number") {
    expiredStatus = payload.exp < now ? " (EXPIRED)" : " (valid)";
  }

  const result = {
    header,
    payload: {
      ...payload,
      ...(typeof payload.iat === "number" && {
        iat_human: new Date(payload.iat * 1000).toISOString(),
      }),
      ...(typeof payload.exp === "number" && {
        exp_human: new Date(payload.exp * 1000).toISOString() + expiredStatus,
      }),
      ...(typeof payload.nbf === "number" && {
        nbf_human: new Date(payload.nbf * 1000).toISOString(),
      }),
    },
    signature,
  };

  return JSON.stringify(result, null, 2);
}

export const jwtDecode: UtilityDefinition = {
  id: "jwt-decode",
  label: "Decode JWT",
  description: "Decode a JWT and display header, payload, and signature info",
  pipeAlias: "jwt:decode",
  inputs: [
    {
      name: "input",
      label: "JWT token",
      type: "textarea",
      placeholder: "Paste your JWT here",
      required: true,
    },
  ],
  async run(inputs: Record<string, string>): Promise<UtilityResult> {
    const token = inputs["input"];
    if (!token || token.trim() === "") {
      throw new Error("JWT token is required");
    }

    const { header, payload } = parseJwtParts(token.trim());
    const now = Math.floor(Date.now() / 1000);
    const isExpired =
      typeof payload.exp === "number" && payload.exp < now;

    const result = formatJwtDecode(token.trim());

    return {
      result,
      language: "json",
      metadata: {
        algorithm: String(header.alg ?? "unknown"),
        type: String(header.typ ?? "JWT"),
        expired: isExpired ? "yes" : "no",
        ...(typeof payload.exp === "number" && {
          expiresAt: new Date(payload.exp * 1000).toISOString(),
        }),
      },
    };
  },
};
