import { Inputs, purposes } from "./types/types";

export type Errors = Partial<Record<keyof Inputs, string>>;
export function validate(v: Inputs): Errors {
  const errors: Errors = {};
  const number = (
    key: keyof Inputs,
    min: number,
    max: number,
    label: string,
    integer = false,
  ) => {
    const n = Number(v[key]);
    if (
      !v[key].trim() ||
      !Number.isFinite(n) ||
      n < min ||
      n > max ||
      (integer && !Number.isInteger(n))
    )
      errors[key] = label;
  };
  number(
    "income",
    5000,
    100000000,
    "Enter monthly income between R5,000 and R100,000,000.",
  );
  number(
    "expenses",
    0,
    100000000,
    "Enter expenses of R0 or more (up to R100,000,000).",
  );
  number(
    "debt",
    0,
    100000000,
    "Enter debt repayments of R0 or more (up to R100,000,000).",
  );
  number("amount", 5000, 300000, "Choose an amount from R5,000 to R300,000.");
  number("term", 6, 60, "Choose a whole number of months from 6 to 60.", true);
  number("age", 18, 65, "Enter an age from 18 to 65.", true);
  number(
    "duration",
    3,
    600,
    "Enter employment duration from 3 to 600 months.",
    true,
  );
  if (v.credit !== "")
    number("credit", 300, 850, "Enter a credit score from 300 to 850.", true);
  if (
    !["employed", "self_employed", "unemployed", "retired"].includes(
      v.employment,
    )
  )
    errors.employment = "Select an employment status.";
  if (!(v.purpose in purposes)) errors.purpose = "Select a loan purpose.";
  return errors;
}
export function payment(amount: number, term: number, rate: number) {
  const r = rate / 1200;
  return r === 0 ? amount / term : (amount * r) / (1 - (1 + r) ** -term);
}
export function calculate(v: Inputs) {
  if (Object.keys(validate(v)).length)
    throw new Error("Invalid simulator inputs");
  const income = Number(v.income),
    expenses = Number(v.expenses),
    debt = Number(v.debt),
    amount = Number(v.amount),
    term = Number(v.term);
  const score = v.credit === "" ? 650 : Number(v.credit);
  const rate = score >= 700 ? 10.5 : score >= 600 ? 12.5 : 18.5;
  const disposable = income - expenses - debt;
  const budget = Math.max(0, Math.min(disposable * 0.5, income * 0.35 - debt));
  const monthlyPayment = payment(amount, term, rate);
  const maxAmount = Math.min(
    300000,
    Math.floor(budget / payment(1, term, rate) / 100) * 100,
  );
  const eligible =
    monthlyPayment <= budget && score >= 580 && v.employment !== "unemployed";
  return {
    eligible,
    rate,
    monthlyPayment,
    totalRepayment: monthlyPayment * term,
    totalInterest: monthlyPayment * term - amount,
    disposable,
    budget,
    maxAmount,
    remaining: disposable - monthlyPayment,
    term,
    amount,
    income,
    expenses,
    debt,
    reason:
      v.employment === "unemployed"
        ? "This example model requires an employment or retirement income source."
        : score < 580
          ? "Your entered credit score is below this model’s illustrative threshold."
          : eligible
            ? "Your estimated repayment fits comfortably within this example affordability budget."
            : "The repayment is above this example affordability budget. Try a smaller amount or a longer term.",
  };
}
export type Result = ReturnType<typeof calculate>;
export const money = (n: number) =>
  new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    maximumFractionDigits: 0,
  }).format(n);
