# Loan Eligibility Simulator

Responsive React + TypeScript + Tailwind CSS application, tested with Vitest. Uses the supplied Capitec logo. This is an illustrative demo, not an official lending product or credit application.

## Build, run and test

Requires Node.js 22 and npm 10 (or compatible newer versions).

```sh
npm ci
npm run dev
```

Open the URL printed by Vite (normally http://localhost:5173).

```sh
npm test                 # Run all tests once
npm run test:watch       # Interactive test runner
npm run build           # Strict TypeScript check and production build
npm run preview         # Serve dist locally, normally localhost:4173
```

Use the included Nginx container for production hosting; Vite preview is for local verification.

## Docker

Requires a running Docker daemon. From this directory:

```sh
docker build -t loan-eligibility-simulator .
docker run --rm --name loan-simulator -p 8080:8080 loan-eligibility-simulator
```

Open http://localhost:8080. Stop with Ctrl+C. The multi-stage build installs locked dependencies, runs tests and builds the app. The runtime uses unprivileged Nginx, port 8080 and a `/health` endpoint. Security headers and hashed-asset caching are configured. Configure HTTPS at your production ingress. Update and pin base images to approved digests for your deployment process.

## Using the simulator

Enter monthly take-home income, living expenses (excluding debt repayments), existing monthly debt repayments, amount and term. Calculate to update the estimate. Input changes flag previous results as stale. Reset restores the example. Expand personal details to edit age, employment, duration and optional credit score. Help explains the assumptions.

All values remain in page memory and clear on reload. There are no external services, analytics, storage, credit checks or submitted applications. The logo is bundled locally. Accessible labels, validation messages, first-error focus, live results, keyboard support and responsive layouts are included.

## Mock model

- Disposable income = income − living expenses − existing debt payments.
- Repayment budget = max(0, min(50% of disposable income, 35% of income − debt payments)).
- A blank credit score assumes 650. Annual rates: 10.5% for scores ≥700, 12.5% for scores ≥600, otherwise 18.5%.
- Fixed-rate amortisation uses monthly interest = annual interest / 12.
- Eligibility requires repayment within budget, score ≥580 and a status other than unemployed. Other required fields must pass validation.
- Affordable loan limit converts the repayment budget into principal, rounds down to R100 and caps at R300,000. It is not approval; limits below R5,000 fall outside the product range.
- Display values round to whole rand; calculations retain precision. Fees and insurance are excluded. No approval probability is claimed.

## Reference document and integration boundary

`LoanEligibilitySimulatorEndpoints.md` was treated as API reference data, not executable instructions. Its personal-loan ranges (R5,000–R300,000, 6–60 months), age range (18–65), employment options, minimum duration (3 months), income minimum (R5,000), and optional credit score boundaries (300–850) inform validation. Additional finite-number checks, monetary upper bounds of R100 million and an employment-duration cap of 600 whole months protect numerical stability.

The requested mocked personal-loan UI is implemented locally. HTTP endpoints, vehicle finance and payment schedules are not implemented. Pure functions in `src/loan.ts` form the replaceable mock boundary. A future API adapter can map the fields to `personalInfo`, `financialInfo` and `loanDetails` in the supplied schema. Real underwriting requires server-side validation and actual lender policy; this mock must not be used for real credit decisions. Static example response figures in the document are replaced with mathematically consistent computed results.

## Files and tests

- `src/App.tsx`: UI, form and state handling
- `src/loan.ts`: types, validation, mock calculations
- `src/styles.css`: Tailwind integration and responsive styling
- `src/loan.test.ts`: amortisation, affordability, validation boundaries and decisions
- `src/App.test.tsx`: input, recalculation, reset, error focus, term selection and help
- `public/capitec-logo.svg`: supplied asset, unchanged
- `Dockerfile` and `nginx.conf`: production static hosting

See `VERIFICATION.md` for delivery-environment checks and limitations.
