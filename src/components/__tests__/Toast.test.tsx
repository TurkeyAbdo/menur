import { describe, it, expect } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import React from "react";
import { ToastProvider, useToast } from "../Toast";

function TestConsumer() {
  const { toast } = useToast();
  return (
    <button onClick={() => toast("success", "It worked!")}>
      Trigger Toast
    </button>
  );
}

describe("Toast", () => {
  it("Provider renders children", () => {
    render(
      <ToastProvider>
        <span>hello</span>
      </ToastProvider>
    );
    expect(screen.getByText("hello")).toBeInTheDocument();
  });

  it("toast() adds message to DOM", () => {
    render(
      <ToastProvider>
        <TestConsumer />
      </ToastProvider>
    );
    act(() => {
      fireEvent.click(screen.getByText("Trigger Toast"));
    });
    expect(screen.getByText("It worked!")).toBeInTheDocument();
  });

  it("close button removes toast", () => {
    render(
      <ToastProvider>
        <TestConsumer />
      </ToastProvider>
    );
    act(() => {
      fireEvent.click(screen.getByText("Trigger Toast"));
    });
    expect(screen.getByText("It worked!")).toBeInTheDocument();

    // The X button is the last button (close)
    const closeButton = screen.getByText("It worked!").parentElement!.querySelector("button");
    act(() => {
      fireEvent.click(closeButton!);
    });
    expect(screen.queryByText("It worked!")).not.toBeInTheDocument();
  });
});
