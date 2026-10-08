export interface Inputs {
  income: string;
  expenses: string;
  debt: string;
  amount: string;
  term: string;
  age: string;
  employment: string;
  duration: string;
  credit: string;
  purpose: string;
}
export const defaults: Inputs = {
  income: "25000",
  expenses: "10000",
  debt: "2000",
  amount: "100000",
  term: "36",
  age: "30",
  employment: "employed",
  duration: "24",
  credit: "",
  purpose: "home_improvement",
};
export const purposes = {
  home_improvement: "Home improvements",
  debt_consolidation: "Debt consolidation",
  education: "Education",
  medical: "Medical expenses",
  other: "Something else",
};