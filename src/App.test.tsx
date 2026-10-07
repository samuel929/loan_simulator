import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { it, expect } from "vitest";
import App from "./App";
it("updates the estimate only after calculation, and resets the example", async () => {
  const user = userEvent.setup();
  render(<App />);
  expect(screen.getByText("Looking good!")).toBeInTheDocument();
  const expenses = screen.getByLabelText("Living expenses");
  await user.clear(expenses);
  await user.type(expenses, "25000");
  expect(screen.getByRole("status")).toHaveTextContent("inputs have changed");
  await user.click(
    screen.getByRole("button", { name: "Calculate my eligibility" }),
  );
  await waitFor(() =>
    expect(screen.getByText("Let’s adjust your loan")).toBeInTheDocument(),
  );
  expect(screen.queryByRole("status")).not.toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: /Start again/ }));
  expect(expenses).toHaveValue(10000);
  expect(screen.getByText("Looking good!")).toBeInTheDocument();
});
it("shows validation and focuses the invalid field", async () => {
  const user = userEvent.setup();
  render(<App />);
  const income = screen.getByLabelText("Monthly take-home income");
  await user.clear(income);
  await user.click(
    screen.getByRole("button", { name: "Calculate my eligibility" }),
  );
  expect(screen.getByRole("alert")).toHaveTextContent(
    "correct the highlighted",
  );
  await waitFor(() => expect(income).toHaveFocus());
  expect(income).toHaveAttribute("aria-invalid", "true");
});
it("supports loan terms and expandable help", async () => {
  const user = userEvent.setup();
  render(<App />);
  await user.click(screen.getByRole("button", { name: "60 months" }));
  expect(screen.getByRole("button", { name: "60 months" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await user.click(screen.getByRole("button", { name: "How it works" }));
  expect(
    screen.getByRole("heading", { name: "How this simulator works" }),
  ).toBeInTheDocument();
});
