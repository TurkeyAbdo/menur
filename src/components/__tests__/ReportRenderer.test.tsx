import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import ReportRenderer, { ReportRendererProps } from "../ReportRenderer";

const baseProps: ReportRendererProps = {
  title: "Sales Report",
  subtitle: "Monthly overview",
  stats: [
    { label: "Total Scans", value: 150 },
    { label: "Avg Rating", value: "4.5" },
  ],
  charts: [
    { label: "Mobile", value: 80, percent: 60 },
    { label: "Desktop", value: 50, percent: 40 },
  ],
  chartTitle: "Device Breakdown",
  headers: ["Date", "Type", "Count"],
  rows: [
    ["2024-01-01", "Scan", "10"],
    ["2024-01-02", "Scan", "15"],
  ],
};

describe("ReportRenderer", () => {
  it("renders title and subtitle", () => {
    render(<ReportRenderer {...baseProps} />);
    expect(screen.getByText("Sales Report")).toBeInTheDocument();
    expect(screen.getByText("Monthly overview")).toBeInTheDocument();
  });

  it("renders stat cards with labels and values", () => {
    render(<ReportRenderer {...baseProps} />);
    expect(screen.getByText("Total Scans")).toBeInTheDocument();
    expect(screen.getByText("150")).toBeInTheDocument();
    expect(screen.getByText("Avg Rating")).toBeInTheDocument();
    expect(screen.getByText("4.5")).toBeInTheDocument();
  });

  it("renders bar chart bars", () => {
    render(<ReportRenderer {...baseProps} />);
    expect(screen.getByText("Device Breakdown")).toBeInTheDocument();
    expect(screen.getByText("Mobile")).toBeInTheDocument();
    expect(screen.getByText(/80 \(60%\)/)).toBeInTheDocument();
  });

  it("renders table headers and rows", () => {
    render(<ReportRenderer {...baseProps} />);
    expect(screen.getByText("Date")).toBeInTheDocument();
    expect(screen.getByText("Type")).toBeInTheDocument();
    expect(screen.getByText("2024-01-01")).toBeInTheDocument();
    expect(screen.getByText("15")).toBeInTheDocument();
  });

  it("shows truncation message for >50 rows", () => {
    const manyRows = Array.from({ length: 60 }, (_, i) => [
      `2024-01-${String(i + 1).padStart(2, "0")}`,
      "Scan",
      String(i),
    ]);
    render(<ReportRenderer {...baseProps} rows={manyRows} />);
    expect(screen.getByText(/Showing 50 of 60 rows/)).toBeInTheDocument();
  });
});
