import { describe, it, expect, vi, beforeEach } from "vitest";
import bcrypt from "bcryptjs";

vi.mock("@/lib/db");
vi.mock("@/lib/email", () => ({
  sendWelcomeEmail: vi.fn().mockResolvedValue(undefined),
}));

import { prisma } from "@/lib/db";
import { POST } from "../route";
import { createRequest, parseResponse } from "@/__tests__/helpers";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as unknown as Record<string, Record<string, any>>;

describe("POST /api/auth/signup", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 when fields are missing", async () => {
    const req = createRequest("/api/auth/signup", {
      method: "POST",
      body: { email: "a@b.com" },
    });
    const { status, data } = await parseResponse(await POST(req));
    expect(status).toBe(400);
    expect(data.error).toBe("Missing required fields");
  });

  it("returns 400 when password is too short", async () => {
    const req = createRequest("/api/auth/signup", {
      method: "POST",
      body: { email: "a@b.com", password: "short", name: "Test" },
    });
    const { status, data } = await parseResponse(await POST(req));
    expect(status).toBe(400);
    expect(data.error).toContain("8 characters");
  });

  it("returns 409 when email already exists", async () => {
    db.user.findUnique.mockResolvedValue({ id: "existing" });
    const req = createRequest("/api/auth/signup", {
      method: "POST",
      body: { email: "dup@test.com", password: "password123", name: "Test" },
    });
    const { status, data } = await parseResponse(await POST(req));
    expect(status).toBe(409);
    expect(data.error).toBe("Email already registered");
  });

  it("returns 201 with userId on success", async () => {
    db.user.findUnique.mockResolvedValue(null);
    db.user.create.mockResolvedValue({ id: "new-user-1" });

    const req = createRequest("/api/auth/signup", {
      method: "POST",
      body: { email: "new@test.com", password: "password123", name: "New User" },
    });
    const { status, data } = await parseResponse(await POST(req));
    expect(status).toBe(201);
    expect(data.userId).toBe("new-user-1");
    expect(data.message).toContain("created");
  });

  it("hashes the password before storing", async () => {
    db.user.findUnique.mockResolvedValue(null);
    db.user.create.mockResolvedValue({ id: "u1" });

    const req = createRequest("/api/auth/signup", {
      method: "POST",
      body: { email: "hash@test.com", password: "password123", name: "Hash" },
    });
    await POST(req);

    const createCall = db.user.create.mock.calls[0][0];
    const storedPassword = createCall.data.password;
    expect(storedPassword).not.toBe("password123");
    expect(await bcrypt.compare("password123", storedPassword)).toBe(true);
  });

  it("returns 500 on unexpected error", async () => {
    db.user.findUnique.mockRejectedValue(new Error("DB down"));
    const req = createRequest("/api/auth/signup", {
      method: "POST",
      body: { email: "err@test.com", password: "password123", name: "Err" },
    });
    const { status, data } = await parseResponse(await POST(req));
    expect(status).toBe(500);
    expect(data.error).toBe("Internal server error");
  });
});
