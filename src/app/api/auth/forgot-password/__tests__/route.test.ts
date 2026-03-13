import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/db");
vi.mock("@/lib/tokens", () => ({
  generatePasswordResetToken: vi.fn().mockResolvedValue({ token: "reset-tok" }),
}));
vi.mock("@/lib/email", () => ({
  sendPasswordResetEmail: vi.fn().mockResolvedValue(true),
}));
vi.mock("@/lib/rate-limit", () => ({
  rateLimitByIp: vi.fn().mockReturnValue({ success: true, remaining: 4 }),
  rateLimitResponse: vi.fn(),
}));

import { prisma } from "@/lib/db";
import { POST } from "../route";
import { createRequest, parseResponse } from "@/__tests__/helpers";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as unknown as Record<string, Record<string, any>>;

describe("POST /api/auth/forgot-password", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 if email is missing", async () => {
    const req = createRequest("http://localhost/api/auth/forgot-password", {
      method: "POST",
      body: {},
    });
    const { status, data } = await parseResponse(await POST(req));
    expect(status).toBe(400);
    expect(data.error).toBe("Email is required");
  });

  it("returns generic success even if user does not exist", async () => {
    db.user.findUnique = vi.fn().mockResolvedValue(null);
    const req = createRequest("http://localhost/api/auth/forgot-password", {
      method: "POST",
      body: { email: "noone@test.com" },
    });
    const { status, data } = await parseResponse(await POST(req));
    expect(status).toBe(200);
    expect(data.message).toContain("If an account exists");
  });

  it("returns generic success for existing user (prevents enumeration)", async () => {
    db.user.findUnique = vi.fn().mockResolvedValue({
      id: "u1",
      email: "user@test.com",
      provider: "EMAIL",
      password: "hashed",
    });
    const req = createRequest("http://localhost/api/auth/forgot-password", {
      method: "POST",
      body: { email: "user@test.com" },
    });
    const { status, data } = await parseResponse(await POST(req));
    expect(status).toBe(200);
    expect(data.message).toContain("If an account exists");
  });
});
