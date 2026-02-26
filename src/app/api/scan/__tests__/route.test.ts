import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/db");

import { prisma } from "@/lib/db";
import { POST } from "../route";
import { createRequest, parseResponse } from "@/__tests__/helpers";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as unknown as Record<string, Record<string, any>>;

describe("POST /api/scan", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 when qrCodeId is missing", async () => {
    const req = createRequest("/api/scan", {
      method: "POST",
      body: {},
    });
    const { status, data } = await parseResponse(await POST(req));
    expect(status).toBe(400);
    expect(data.error).toBe("Missing qrCodeId");
  });

  it("returns 201 on success", async () => {
    const scan = { id: "scan-1", qrCodeId: "qr-1", deviceType: "desktop" };
    db.scan.create.mockResolvedValue(scan);

    const req = createRequest("/api/scan", {
      method: "POST",
      body: { qrCodeId: "qr-1" },
    });
    const { status, data } = await parseResponse(await POST(req));
    expect(status).toBe(201);
    expect(data.scan.id).toBe("scan-1");
  });

  it("detects mobile user-agent", async () => {
    db.scan.create.mockImplementation(({ data }: { data: Record<string, unknown> }) =>
      Promise.resolve({ id: "s1", ...data })
    );

    const req = createRequest("/api/scan", {
      method: "POST",
      body: { qrCodeId: "qr-1" },
      headers: {
        "user-agent": "Mozilla/5.0 (iPhone; CPU iPhone OS) Mobile Safari",
      },
    });
    await POST(req);

    const createArg = db.scan.create.mock.calls[0][0].data;
    expect(createArg.deviceType).toBe("mobile");
  });

  it("detects desktop user-agent", async () => {
    db.scan.create.mockImplementation(({ data }: { data: Record<string, unknown> }) =>
      Promise.resolve({ id: "s2", ...data })
    );

    const req = createRequest("/api/scan", {
      method: "POST",
      body: { qrCodeId: "qr-1" },
      headers: {
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120",
      },
    });
    await POST(req);

    const createArg = db.scan.create.mock.calls[0][0].data;
    expect(createArg.deviceType).toBe("desktop");
  });
});
