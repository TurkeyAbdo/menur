import { describe, it, expect } from "vitest";
import { escapeCsvField, toCsv } from "../csv";

describe("escapeCsvField", () => {
  it("returns empty string for null/undefined", () => {
    expect(escapeCsvField(null as unknown as string)).toBe("");
    expect(escapeCsvField(undefined as unknown as string)).toBe("");
  });

  it("passes through a simple string unchanged", () => {
    expect(escapeCsvField("hello")).toBe("hello");
  });

  it("quotes fields containing commas", () => {
    expect(escapeCsvField("a,b")).toBe('"a,b"');
  });

  it("doubles double-quotes and wraps in quotes", () => {
    expect(escapeCsvField('say "hi"')).toBe('"say ""hi"""');
  });

  it("quotes fields containing newlines", () => {
    expect(escapeCsvField("line1\nline2")).toBe('"line1\nline2"');
    expect(escapeCsvField("line1\r\nline2")).toBe('"line1\r\nline2"');
  });
});

describe("toCsv", () => {
  it("produces full CSV with headers and rows", () => {
    const csv = toCsv(["Name", "Price"], [["Latte", "20"], ["Tea", "10"]]);
    expect(csv).toBe("Name,Price\r\nLatte,20\r\nTea,10");
  });

  it("returns headers only when rows are empty", () => {
    const csv = toCsv(["A", "B"], []);
    expect(csv).toBe("A,B");
  });
});
