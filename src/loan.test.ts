import { describe, it, expect } from "vitest";
import { calculate, payment, validate } from "./loan";
import { defaults } from "./types/types";
describe("affordability model", () => {
  it("calculates an amortised repayment and reconciles totals", () => {
    const r = calculate(defaults);
    expect(r.monthlyPayment).toBeCloseTo(3345.36, 1);
    expect(r.totalRepayment).toBe(r.monthlyPayment * 36);
    expect(r.totalInterest + 100000).toBeCloseTo(r.totalRepayment);
    expect(r.remaining + r.expenses + r.debt + r.monthlyPayment).toBeCloseTo(
      r.income,
    );
    expect(r.eligible).toBe(true);
  });
  it("handles a zero interest rate", () =>
    expect(payment(12000, 12, 0)).toBe(1000));
  it("does not approve a loan with no disposable income", () => {
    const r = calculate({ ...defaults, expenses: "25000" });
    expect(r.eligible).toBe(false);
    expect(r.maxAmount).toBe(0);
  });
  it("uses debt payments when limiting affordability", () => {
    expect(calculate({ ...defaults, debt: "8500" }).eligible).toBe(false);
  });
  it("uses employment and credit in the mock decision", () => {
    expect(calculate({ ...defaults, employment: "unemployed" }).eligible).toBe(
      false,
    );
    expect(calculate({ ...defaults, credit: "500" }).eligible).toBe(false);
    expect(calculate({ ...defaults, credit: "750" }).rate).toBe(10.5);
  });
  it("rejects missing, non-finite and out-of-range values", () => {
    for (const income of ["", "Infinity", "NaN", "4999"])
      expect(validate({ ...defaults, income }).income).toBeTruthy();
    expect(validate({ ...defaults, term: "6.5" }).term).toBeTruthy();
    expect(validate({ ...defaults, amount: "300001" }).amount).toBeTruthy();
    expect(validate({ ...defaults, debt: "-1" }).debt).toBeTruthy();
    expect(() => calculate({ ...defaults, age: "17" })).toThrow();
  });
  it("accepts valid boundaries and an optional blank credit score", () => {
    expect(
      validate({
        ...defaults,
        income: "5000",
        amount: "5000",
        term: "6",
        age: "18",
        duration: "3",
      }),
    ).toEqual({});
    expect(
      validate({
        ...defaults,
        amount: "300000",
        term: "60",
        age: "65",
        credit: "850",
      }),
    ).toEqual({});
  });
});
