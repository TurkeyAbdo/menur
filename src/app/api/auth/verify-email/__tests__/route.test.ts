import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/db");
vi.mock("@/lib/rate-limit", () => ({
  rateLimitByIp: vi.fn().mockReturnValue({ success: true, remaining: 9 }),
  rateLimitResponse: vi.fn(),
}));

import { prisma } from "@/lib/db";
import { POST } from "../route";
import { createRequest, parseResponse } from "@/__tests__/helpers";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as unknown as Record<string, Record<string, any>>;

describe("POST /api/auth/verify-email", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 if token is missing", async () => {
    const req = createRequest("http://localhost/api/auth/verify-email", {
      method: "POST",
      body: {},
    });
    const { status, data } = await parseResponse(await POST(req));
    expect(status).toBe(400);
    expect(data.error).toBe("Missing token");
  });

  it("returns 400 for invalid token", async () => {
    db.verificationToken.findUnique = vi.fn().mockResolvedValue(null);
    const req = createRequest("http://localhost/api/auth/verify-email", {
      method: "POST",
      body: { token: "bad-token" },
    });
    const { status, data } = await parseResponse(await POST(req));
    expect(status).toBe(400);
    expect(data.error).toBe("Invalid or expired token");
  });

  it("returns 400 for expired token", async () => {
    db.verificationToken.findUnique = vi.fn().mockResolvedValue({
      token: "expired-tok",
      identifier: "user@test.com",
      expires: new Date(Date.now() - 10000),
    });
    db.verificationToken.delete = vi.fn().mockResolvedValue({});
    const req = createRequest("http://localhost/api/auth/verify-email", {
      method: "POST",
      body: { token: "expired-tok" },
    });
    const { status, data } = await parseResponse(await POST(req));
    expect(status).toBe(400);
    expect(data.error).toBe("Token has expired");
  });

  it("verifies email for valid token", async () => {
    db.verificationToken.findUnique = vi.fn().mockResolvedValue({
      token: "valid-tok",
      identifier: "user@test.com",
      expires: new Date(Date.now() + 86400000),
    });
    db.$transaction = vi.fn().mockResolvedValue([]);
    const req = createRequest("http://localhost/api/auth/verify-email", {
      method: "POST",
      body: { token: "valid-tok" },
    });
    const { status, data } = await parseResponse(await POST(req));
    expect(status).toBe(200);
    expect(data.message).toBe("Email verified successfully");
  });
});
