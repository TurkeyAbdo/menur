"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en" dir="ltr">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f9fafb",
          fontFamily:
            'Inter, "Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif',
        }}
      >
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <div
            style={{
              width: 64,
              height: 64,
              margin: "0 auto",
              borderRadius: "50%",
              backgroundColor: "#fee2e2",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#dc2626"
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
          </div>
          <h1
            style={{
              marginTop: 24,
              fontSize: 24,
              fontWeight: 600,
              color: "#111827",
            }}
          >
            Something Went Wrong
          </h1>
          <p style={{ marginTop: 8, fontSize: 14, color: "#6b7280" }}>
            An unexpected error occurred. Please try again.
          </p>
          <button
            onClick={reset}
            style={{
              marginTop: 32,
              padding: "10px 20px",
              fontSize: 14,
              fontWeight: 500,
              color: "#fff",
              backgroundColor: "#6366f1",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
            }}
          >
            Try Again
          </button>
          <p style={{ marginTop: 48, fontSize: 12, color: "#9ca3af" }}>
            Menur
          </p>
        </div>
      </body>
    </html>
  );
}
