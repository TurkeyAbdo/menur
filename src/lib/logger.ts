type LogLevel = "info" | "warn" | "error";

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  [key: string]: unknown;
}

function log(level: LogLevel, message: string, meta?: Record<string, unknown>) {
  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...meta,
  };

  // In production, output JSON for log aggregators (Vercel, Datadog, etc.)
  // In development, use readable console output
  if (process.env.NODE_ENV === "production") {
    const output = JSON.stringify(entry);
    if (level === "error") {
      console.error(output);
    } else if (level === "warn") {
      console.warn(output);
    } else {
      console.log(output);
    }
  } else {
    const prefix = `[${level.toUpperCase()}]`;
    if (level === "error") {
      console.error(prefix, message, meta || "");
    } else if (level === "warn") {
      console.warn(prefix, message, meta || "");
    } else {
      console.log(prefix, message, meta || "");
    }
  }
}

export const logger = {
  info: (message: string, meta?: Record<string, unknown>) => log("info", message, meta),
  warn: (message: string, meta?: Record<string, unknown>) => log("warn", message, meta),
  error: (message: string, meta?: Record<string, unknown>) => log("error", message, meta),
};
