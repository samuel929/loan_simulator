import { useRef, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  Info,
  LockKeyhole,
  RotateCcw,
  ShieldCheck,
  SlidersHorizontal,
  Wallet,
  Sparkles,
} from "lucide-react";
import {
  calculate,

  money,

  validate,
 
  type Errors,
  type Result,
} from "./loan";
import { defaults, Inputs, purposes } from "./types/types";
export default function App() {
  const [values, setValues] = useState<Inputs>({ ...defaults });
  const [result, setResult] = useState<Result>(() => calculate(defaults));
  const [errors, setErrors] = useState<Errors>({});
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [advanced, setAdvanced] = useState(false);
  const [help, setHelp] = useState(false);
  const [failure, setFailure] = useState("");
  const resultRef = useRef<HTMLElement>(null);
  const set = (key: keyof Inputs, value: string) => {
    setValues((v) => ({ ...v, [key]: value }));
    setDirty(true);
    setErrors((e) => ({ ...e, [key]: undefined }));
  };
  const field = (
    key: keyof Inputs,
    label: string,
    hint?: string,
    prefix = "R",
  ) => (
    <div className="field">
      <label htmlFor={key}>{label}</label>
      <div className={`input-shell ${errors[key] ? "invalid" : ""}`}>
        {prefix && <span>{prefix}</span>}
        <input
          id={key}
          type="number"
          inputMode="decimal"
          value={values[key]}
          onChange={(e) => set(key, e.target.value)}
          aria-invalid={!!errors[key]}
          aria-describedby={`${key}-hint`}
        />
      </div>
      <p id={`${key}-hint`} className={errors[key] ? "error" : "hint"}>
        {errors[key] || hint}
      </p>
    </div>
  );
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const next = validate(values);
    setErrors(next);
    setFailure("");
    if (Object.keys(next).length) {
      setAdvanced(true);
      setTimeout(
        () => document.getElementById(Object.keys(next)[0])?.focus(),
        0,
      );
      return;
    }
    setBusy(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 450));
      setResult(calculate(values));
      setDirty(false);
      requestAnimationFrame(() => resultRef.current?.focus());
    } catch {
      setFailure("We could not calculate your estimate. Please try again.");
    } finally {
      setBusy(false);
    }
  }
  const reset = () => {
    setValues({ ...defaults });
    setResult(calculate(defaults));
    setErrors({});
    setDirty(false);
    setFailure("");
  };
  return (
    <>
      <a className="skip-link" href="#simulator">
        Skip to simulator
      </a>
      <header className="site-header">
        <div className="header-inner">
          <img src="/capitec-logo.svg" alt="Capitec" width="160" height="23" />
          <span className="header-divider" />
          <span className="header-label">Tools for your financial life</span>
          <button
            className="help-button"
            onClick={() => setHelp(!help)}
            aria-expanded={help}
          >
            <CircleHelp size={18} /> How it works
          </button>
        </div>
      </header>
      <main id="simulator" className="page">
        <nav aria-label="Breadcrumb" className="breadcrumb">
          <span>Personal banking</span>
          <ChevronRight size={13} />
          <span>Credit</span>
          <ChevronRight size={13} />
          <span className="text-slate-700">Loan simulator</span>
        </nav>
        <section className="intro">
          <div>
            <div className="eyebrow">
              <span /> PLAN WITH CONFIDENCE
            </div>
            <h1>
              A little clarity.
              <br className="mobile-break" /> A world of possibility.
            </h1>
            <p>
              See what a personal loan could look like for you. No commitment,
              just a clearer picture.
            </p>
          </div>
          <div className="demo-badge">
            <span /> Interactive demo
          </div>
        </section>
        {help && (
          <section className="help-panel">
            <h2>How this simulator works</h2>
            <p>
              Enter your monthly take-home income, living expenses and existing
              debt repayments. Choose your amount and term, then calculate your
              estimate. The default example uses age 30, 24 months employed and
              an assumed credit score of 650; you can change these below. Your
              entries stay in this page’s memory and are cleared when you
              reload.
            </p>
          </section>
        )}
        <div className="workspace">
          <section className="form-card">
            <div className="card-heading">
              <div className="icon-box">
                <SlidersHorizontal size={21} />
              </div>
              <div>
                <h2>Let’s work out the possibilities</h2>
                <p>Tell us a little about your finances.</p>
              </div>
              <span className="step-label">01 / 02</span>
            </div>
            <form noValidate onSubmit={submit}>
              <fieldset disabled={busy}>
                <div className="section-title">
                  <span>1</span>
                  <h3>Your monthly finances</h3>
                  <span className="section-note">After tax, in rands</span>
                </div>
                {field(
                  "income",
                  "Monthly take-home income",
                  "Your income after tax and deductions.",
                )}
                <div className="two-cols">
                  {field(
                    "expenses",
                    "Living expenses",
                    "Rent, groceries, transport and more.",
                  )}
                  {field(
                    "debt",
                    "Existing debt repayments",
                    "Monthly credit and loan payments.",
                  )}
                </div>
                <div className="disposable">
                  <Wallet size={18} />
                  <span>Income left after expenses & debt</span>
                  <strong>
                    {[values.income, values.expenses, values.debt].every(
                      (v) => v.trim() && Number.isFinite(Number(v)),
                    )
                      ? money(
                          Number(values.income) -
                            Number(values.expenses) -
                            Number(values.debt),
                        )
                      : "—"}
                  </strong>
                </div>
                <div className="section-title loan-section">
                  <span>2</span>
                  <h3>The loan you have in mind</h3>
                </div>
                {field("amount", "How much would you like to borrow?")}
                <input
                  className="amount-range"
                  type="range"
                  aria-label="Loan amount slider"
                  min="5000"
                  max="300000"
                  step="1000"
                  value={Math.min(
                    300000,
                    Math.max(5000, Number(values.amount) || 5000),
                  )}
                  onChange={(e) => set("amount", e.target.value)}
                />
                <div className="range-labels">
                  <span>R5,000</span>
                  <span>R300,000</span>
                </div>
                <div className="field term-field">
                  <label htmlFor="term">Over how many months?</label>
                  <div className="term-options">
                    {[12, 24, 36, 48, 60].map((term) => (
                      <button
                        type="button"
                        aria-pressed={values.term === String(term)}
                        className={
                          values.term === String(term) ? "selected" : ""
                        }
                        key={term}
                        onClick={() => set("term", String(term))}
                      >
                        {term}
                        <span> months</span>
                      </button>
                    ))}
                  </div>
                  <div className="custom-term">
                    <label htmlFor="term">Or choose 6–60 months</label>
                    <input
                      id="term"
                      type="number"
                      min="6"
                      max="60"
                      value={values.term}
                      onChange={(e) => set("term", e.target.value)}
                      aria-invalid={!!errors.term}
                      aria-describedby="term-error"
                    />
                  </div>
                  {errors.term && (
                    <p className="error" id="term-error">
                      {errors.term}
                    </p>
                  )}
                </div>
                <div className="field">
                  <label htmlFor="purpose">What’s the loan for?</label>
                  <div className="select-shell">
                    <select
                      id="purpose"
                      value={values.purpose}
                      onChange={(e) => set("purpose", e.target.value)}
                    >
                      {Object.entries(purposes).map(([key, value]) => (
                        <option key={key} value={key}>
                          {value}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={17} />
                  </div>
                </div>
                <button
                  type="button"
                  className="advanced-toggle"
                  aria-expanded={advanced}
                  onClick={() => setAdvanced(!advanced)}
                >
                  Personal details & credit assumptions{" "}
                  <ChevronDown
                    size={16}
                    className={advanced ? "rotate-180" : ""}
                  />
                </button>
                {advanced && (
                  <div className="advanced">
                    <div className="two-cols">
                      {field("age", "Age", "18–65 years", "")}
                      {field(
                        "duration",
                        "Employment duration",
                        "Months; minimum 3",
                        "",
                      )}
                    </div>
                    <div className="field">
                      <label htmlFor="employment">Employment status</label>
                      <select
                        id="employment"
                        value={values.employment}
                        onChange={(e) => set("employment", e.target.value)}
                      >
                        <option value="employed">Employed</option>
                        <option value="self_employed">Self-employed</option>
                        <option value="retired">Retired</option>
                        <option value="unemployed">Unemployed</option>
                      </select>
                    </div>
                    {field(
                      "credit",
                      "Credit score (optional)",
                      "300–850. Leave blank to use an illustrative score of 650.",
                      "",
                    )}
                  </div>
                )}
                {Object.values(errors).some(Boolean) && (
                  <p role="alert" className="error">
                    Please correct the highlighted fields to continue.
                  </p>
                )}
                {failure && (
                  <p role="alert" className="error">
                    {failure}
                  </p>
                )}
                <button className="calculate-button" type="submit">
                  {busy
                    ? "Calculating your estimate…"
                    : "Calculate my eligibility"}
                  {!busy && <ArrowRight size={19} />}
                </button>
                <p className="privacy-note">
                  <LockKeyhole size={13} /> No credit check. No impact on your
                  credit score.
                </p>
              </fieldset>
            </form>
          </section>
          <aside className="results-column">
            <section
              className="result-card"
              ref={resultRef}
              tabIndex={-1}
              aria-label="Eligibility results"
              aria-live="polite"
              aria-busy={busy}
            >
              <div className="result-header">
                <span>
                  <Sparkles size={17} /> YOUR ESTIMATED RESULTS
                </span>
                <span className="mock-pill">SIMULATION</span>
              </div>
              <div className="result-content">
                {dirty && (
                  <p className="stale" role="status">
                    Your inputs have changed. Calculate to update these results.
                  </p>
                )}
                <div
                  className={`eligibility-icon ${result.eligible ? "" : "negative"}`}
                >
                  {result.eligible ? <Check size={26} /> : <Info size={26} />}
                </div>
                <h2>
                  {result.eligible ? "Looking good!" : "Let’s adjust your loan"}
                </h2>
                <p className="result-subtitle">
                  {result.eligible
                    ? "You could qualify for this personal loan."
                    : "This amount may be outside your budget."}
                </p>
                <div className="monthly">
                  <span>Estimated monthly repayment</span>
                  <div>
                    {money(result.monthlyPayment)}
                    <small>/ month</small>
                  </div>
                  <p>
                    For {money(result.amount)} over {result.term} months
                  </p>
                </div>
                <div className="result-details">
                  <div>
                    <span>Illustrative interest rate</span>
                    <strong>{result.rate}% p.a.</strong>
                  </div>
                  <div>
                    <span>Total interest</span>
                    <strong>{money(result.totalInterest)}</strong>
                  </div>
                  <div>
                    <span>Total repayment</span>
                    <strong>{money(result.totalRepayment)}</strong>
                  </div>
                </div>
                <div
                  className={`affordable-note ${result.eligible ? "" : "caution"}`}
                >
                  <ShieldCheck size={20} />
                  <div>
                    <strong>
                      {result.eligible
                        ? "A comfortable fit for your budget"
                        : "Room to reconsider"}
                    </strong>
                    <p>{result.reason}</p>
                  </div>
                </div>
              </div>
              <div className="result-foot">
                <Info size={15} />
                <span>
                  This is an estimate, not a credit offer or approval.
                </span>
              </div>
            </section>
            <section className="budget-card">
              <div className="budget-heading">
                <h2>Your money, at a glance</h2>
                <Wallet size={19} />
              </div>
              <p>Where your monthly income could go</p>
              <div
                className="budget-bar"
                role="img"
                aria-label={`Living expenses ${money(result.expenses)}, existing debt ${money(result.debt)}, new loan ${money(result.monthlyPayment)}, remaining ${money(result.remaining)}`}
              >
                {[
                  result.expenses,
                  result.debt,
                  result.monthlyPayment,
                  Math.max(0, result.remaining),
                ].map((n, i) => (
                  <span
                    key={i}
                    className={`segment segment-${i}`}
                    style={{ flexGrow: n }}
                  />
                ))}
              </div>
              <div className="budget-legend">
                {[
                  ["Living expenses", result.expenses],
                  ["Existing debt", result.debt],
                  ["New loan repayment", result.monthlyPayment],
                  ["Left for you", result.remaining],
                ].map(([label, n], i) => (
                  <div key={label}>
                    <span>
                      <i className={`segment-${i}`} />
                      {label}
                    </span>
                    <strong>{money(Number(n))}</strong>
                  </div>
                ))}
              </div>
              <div className="budget-bottom">
                Illustrative affordable loan limit{" "}
                <strong>{money(result.maxAmount)}</strong>
              </div>
            </section>
            <button className="reset-button" disabled={busy} onClick={reset}>
              <RotateCcw size={15} /> Start again with the example
            </button>
          </aside>
        </div>
        <section className="information">
          <div className="info-symbol">
            <Info size={20} />
          </div>
          <div>
            <h2>A helpful starting point, not a final answer</h2>
            <p>
              This demo uses mocked lending rules. Actual eligibility, interest
              rates and repayments depend on a full affordability assessment and
              credit checks. Estimates exclude initiation fees, monthly service
              fees and credit insurance. No application is submitted.
            </p>
          </div>
          <ArrowUpRight size={22} />
        </section>
        <footer>
          <span>
            Loan Eligibility Simulator <span className="footer-dot">·</span>{" "}
            Built for better planning
          </span>
          <span>
            <LockKeyhole size={13} /> Your information stays in this session
          </span>
        </footer>
      </main>
    </>
  );
}
