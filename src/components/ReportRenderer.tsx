import React from "react";

export interface ReportStat {
  label: string;
  value: string | number;
}

export interface ReportChart {
  label: string;
  value: number;
  /** 0-100 percentage for bar width */
  percent: number;
}

export interface ReportRendererProps {
  title: string;
  subtitle?: string;
  dateRange?: string;
  stats: ReportStat[];
  charts?: ReportChart[];
  chartTitle?: string;
  headers: string[];
  rows: string[][];
}

const ReportRenderer = React.forwardRef<HTMLDivElement, ReportRendererProps>(
  ({ title, subtitle, dateRange, stats, charts, chartTitle, headers, rows }, ref) => {
    const displayRows = rows.slice(0, 50);

    return (
      <div
        ref={ref}
        style={{
          width: 800,
          backgroundColor: "#ffffff",
          fontFamily: "Arial, Helvetica, sans-serif",
          color: "#1f2937",
          padding: 32,
        }}
      >
        {/* Header */}
        <div
          style={{
            borderBottom: "2px solid #4f46e5",
            paddingBottom: 16,
            marginBottom: 24,
          }}
        >
          <div
            style={{
              fontSize: 12,
              color: "#6366f1",
              fontWeight: 700,
              letterSpacing: 1,
              textTransform: "uppercase",
              marginBottom: 4,
            }}
          >
            Menur
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#111827" }}>
            {title}
          </div>
          {subtitle && (
            <div style={{ fontSize: 13, color: "#6b7280", marginTop: 2 }}>
              {subtitle}
            </div>
          )}
          {dateRange && (
            <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 4 }}>
              {dateRange}
            </div>
          )}
        </div>

        {/* Stat Cards */}
        {stats.length > 0 && (
          <div
            style={{
              display: "flex",
              gap: 12,
              marginBottom: 24,
              flexWrap: "wrap",
            }}
          >
            {stats.map((stat, i) => (
              <div
                key={i}
                style={{
                  flex: "1 1 0",
                  minWidth: 140,
                  backgroundColor: "#f5f3ff",
                  borderRadius: 8,
                  padding: "12px 16px",
                  border: "1px solid #e0e7ff",
                }}
              >
                <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 4 }}>
                  {stat.label}
                </div>
                <div style={{ fontSize: 20, fontWeight: 700, color: "#4f46e5" }}>
                  {stat.value}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Chart */}
        {charts && charts.length > 0 && (
          <div
            style={{
              marginBottom: 24,
              backgroundColor: "#fafafa",
              borderRadius: 8,
              padding: 16,
              border: "1px solid #e5e7eb",
            }}
          >
            {chartTitle && (
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#374151",
                  marginBottom: 12,
                }}
              >
                {chartTitle}
              </div>
            )}
            {charts.map((bar, i) => (
              <div key={i} style={{ marginBottom: i < charts.length - 1 ? 8 : 0 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 12,
                    color: "#4b5563",
                    marginBottom: 3,
                  }}
                >
                  <span>{bar.label}</span>
                  <span>
                    {bar.value} ({bar.percent}%)
                  </span>
                </div>
                <div
                  style={{
                    height: 16,
                    backgroundColor: "#e0e7ff",
                    borderRadius: 4,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${Math.max(bar.percent, 2)}%`,
                      backgroundColor: "#6366f1",
                      borderRadius: 4,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Data Table */}
        {headers.length > 0 && (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: 12,
              }}
            >
              <thead>
                <tr>
                  {headers.map((h, i) => (
                    <th
                      key={i}
                      style={{
                        textAlign: "left",
                        padding: "8px 10px",
                        backgroundColor: "#4f46e5",
                        color: "#ffffff",
                        fontWeight: 600,
                        fontSize: 11,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayRows.map((row, ri) => (
                  <tr key={ri}>
                    {row.map((cell, ci) => (
                      <td
                        key={ci}
                        style={{
                          padding: "6px 10px",
                          borderBottom: "1px solid #e5e7eb",
                          backgroundColor: ri % 2 === 0 ? "#ffffff" : "#f9fafb",
                          whiteSpace: "nowrap",
                          maxWidth: 200,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {rows.length > 50 && (
              <div
                style={{
                  textAlign: "center",
                  fontSize: 11,
                  color: "#9ca3af",
                  padding: "8px 0",
                }}
              >
                Showing 50 of {rows.length} rows
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
);

ReportRenderer.displayName = "ReportRenderer";

export default ReportRenderer;
