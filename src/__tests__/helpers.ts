import { NextRequest } from "next/server";
import { vi } from "vitest";

// ---------- Request helpers ----------

interface RequestOptions {
  method?: string;
  body?: Record<string, unknown>;
  headers?: Record<string, string>;
}

export function createRequest(
  url: string,
  { method = "GET", body, headers = {} }: RequestOptions = {}
): NextRequest {
  const init = {
    method,
    headers: { "content-type": "application/json", ...headers },
    body: body ? JSON.stringify(body) : undefined,
  };
  return new NextRequest(new URL(url, "http://localhost:3000"), init);
}

export async function parseResponse(res: Response) {
  const status = res.status;
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return { status, data: await res.json() };
  }
  return { status, data: await res.text() };
}

// ---------- Session helpers ----------

export const sessions = {
  owner: {
    user: { id: "user-1", name: "Owner", email: "owner@test.com", role: "OWNER" },
    expires: new Date(Date.now() + 86400000).toISOString(),
  },
  admin: {
    user: { id: "admin-1", name: "Admin", email: "admin@test.com", role: "ADMIN" },
    expires: new Date(Date.now() + 86400000).toISOString(),
  },
  unauthenticated: null,
};

/**
 * Mock getServerSession from next-auth to return the given session.
 * Call BEFORE importing the route handler.
 */
export function mockSession(session: typeof sessions.owner | null) {
  vi.doMock("next-auth", () => ({
    getServerSession: vi.fn().mockResolvedValue(session),
  }));
}
