import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import ThemePicker, { ThemeOption } from "../ThemePicker";

const themes: ThemeOption[] = [
  {
    id: "t1",
    name: "Classic",
    nameAr: "كلاسيك",
    slug: "classic",
    isFree: true,
    config: {
      colors: {
        background: "#fff",
        surface: "#f5f5f5",
        text: "#111",
        textSecondary: "#666",
        primary: "#4f46e5",
        accent: "#ec4899",
        border: "#e5e7eb",
        price: "#059669",
        unavailable: "#9ca3af",
        special: "#f59e0b",
      },
    },
  },
  {
    id: "t2",
    name: "Dark Elegance",
    nameAr: "أناقة داكنة",
    slug: "dark-elegance",
    isFree: false,
    config: {
      colors: {
        background: "#1a1a2e",
        surface: "#16213e",
        text: "#eee",
        textSecondary: "#aaa",
        primary: "#e94560",
        accent: "#0f3460",
        border: "#333",
        price: "#4ecca3",
        unavailable: "#555",
        special: "#f59e0b",
      },
    },
  },
];

describe("ThemePicker", () => {
  it("renders all theme options", () => {
    render(
      <ThemePicker
        themes={themes}
        selectedTheme="t1"
        onSelect={() => {}}
        label="Choose theme"
      />
    );
    expect(screen.getByText("كلاسيك")).toBeInTheDocument();
    expect(screen.getByText("أناقة داكنة")).toBeInTheDocument();
  });

  it("shows checkmark on selected theme", () => {
    const { container } = render(
      <ThemePicker
        themes={themes}
        selectedTheme="t1"
        onSelect={() => {}}
        label="Choose theme"
      />
    );
    // The selected theme button has ring styling
    const buttons = container.querySelectorAll("button");
    expect(buttons[0].className).toContain("border-indigo-600");
  });

  it("calls onSelect when a theme is clicked", () => {
    const onSelect = vi.fn();
    render(
      <ThemePicker
        themes={themes}
        selectedTheme="t1"
        onSelect={onSelect}
        label="Choose theme"
      />
    );
    fireEvent.click(screen.getByText("أناقة داكنة"));
    expect(onSelect).toHaveBeenCalledWith("t2");
  });

  it("shows PRO badge on non-free themes", () => {
    render(
      <ThemePicker
        themes={themes}
        selectedTheme="t1"
        onSelect={() => {}}
        label="Choose theme"
      />
    );
    expect(screen.getByText("PRO")).toBeInTheDocument();
  });
});
