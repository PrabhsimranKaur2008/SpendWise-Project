import { describe, expect, it } from "vitest";
import { budgetStatus, monthTotal } from "./finance";

describe("budget", () => {
  it("computes remaining budget", () => {
    expect(budgetStatus(10000, 7250).remaining).toBe(2750);
  });
  it("warns at 80% of budget", () => {
    expect(budgetStatus(10000, 8000).level).toBe("warning");
    expect(budgetStatus(10000, 7999).level).toBe("ok");
  });
  it("flags over budget at 100%", () => {
    expect(budgetStatus(10000, 10000).level).toBe("over");
  });
  it("sums only the given month", () => {
    const ex = [
      { id: "a", name: "x", amount: 100.5, category: "Food" as const, date: "2026-11-02" },
      { id: "b", name: "y", amount: 200, category: "Food" as const, date: "2026-10-30" },
    ];
    expect(monthTotal(ex, "2026-11")).toBe(100.5);
  });
});
