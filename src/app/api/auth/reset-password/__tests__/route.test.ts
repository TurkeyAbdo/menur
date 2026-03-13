import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/db");
vi.mock("@/lib/rate-limit", () => ({
  rateLimitByIp: vi.fn().mockReturnValue({ success: true, remaining: 4 }),
  rateLimitResponse: vi.fn(),
}));

import { prisma } from "@/lib/db";
import { POST } from "../route";
import { createRequest, parseResponse } from "@/__tests__/helpers";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as unknown as Record<string, Record<string, any>>;

describe("POST /api/auth/reset-password", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 if token or password is missing", async () => {
    const req = createRequest("http://localhost/api/auth/reset-password", {
      method: "POST",
      body: { token: "tok" },
    });
    const { status, data } = await parseResponse(await POST(req));
    expect(status).toBe(400);
    expect(data.error).toBe("Missing required fields");
  });

  it("returns 400 if password is too short", async () => {
    const req = createRequest("http://localhost/api/auth/reset-password", {
      method: "POST",
      body: { token: "tok", password: "short" },
    });
    const { status, data } = await parseResponse(await POST(req));
    expect(status).toBe(400);
    expect(data.error).toContain("8 characters");
  });

  it("returns 400 for invalid token", async () => {
    db.passwordResetToken.findUnique = vi.fn().mockResolvedValue(null);
    const req = createRequest("http://localhost/api/auth/reset-password", {
      method: "POST",
      body: { token: "bad-token", password: "newpassword123" },
    });
    const { status, data } = await parseResponse(await POST(req));
    expect(status).toBe(400);
    expect(data.error).toBe("Invalid or expired token");
  });

  it("returns 400 for expired token", async () => {
    db.passwordResetToken.findUnique = vi.fn().mockResolvedValue({
      token: "expired-tok",
      email: "user@test.com",
      expires: new Date(Date.now() - 10000),
    });
    db.passwordResetToken.delete = vi.fn().mockResolvedValue({});
    const req = createRequest("http://localhost/api/auth/reset-password", {
      method: "POST",
      body: { token: "expired-tok", password: "newpassword123" },
    });
    const { status, data } = await parseResponse(await POST(req));
    expect(status).toBe(400);
    expect(data.error).toBe("Token has expired");
  });

  it("resets password for valid token", async () => {
    db.passwordResetToken.findUnique = vi.fn().mockResolvedValue({
      token: "valid-tok",
      email: "user@test.com",
      expires: new Date(Date.now() + 3600000),
    });
    db.$transaction = vi.fn().mockResolvedValue([]);
    const req = createRequest("http://localhost/api/auth/reset-password", {
      method: "POST",
      body: { token: "valid-tok", password: "newpassword123" },
    });
    const { status, data } = await parseResponse(await POST(req));
    expect(status).toBe(200);
    expect(data.message).toBe("Password reset successfully");
  });
});
