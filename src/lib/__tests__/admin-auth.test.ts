import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock next-auth before importing the module under test
vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}));
vi.mock("@/lib/auth", () => ({ authOptions: {} }));

import { getServerSession } from "next-auth";
import { requireAdmin } from "../admin-auth";

const mockGetSession = getServerSession as ReturnType<typeof vi.fn>;

describe("requireAdmin", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when no session", async () => {
    mockGetSession.mockResolvedValue(null);
    const result = await requireAdmin();
    expect(result.error).toBe("Unauthorized");
    expect(result.status).toBe(401);
  });

  it("returns 403 when user is OWNER (not admin)", async () => {
    mockGetSession.mockResolvedValue({
      user: { id: "user-1", role: "OWNER" },
    });
    const result = await requireAdmin();
    expect(result.error).toBe("Forbidden");
    expect(result.status).toBe(403);
  });

  it("returns session when user is ADMIN", async () => {
    const session = { user: { id: "admin-1", role: "ADMIN" } };
    mockGetSession.mockResolvedValue(session);
    const result = await requireAdmin();
    expect(result.error).toBeNull();
    expect(result.session).toEqual(session);
  });
});
