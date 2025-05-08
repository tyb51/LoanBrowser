# Loan Insurance Refactoring Progress

## Completed Tasks

### Phase 1: Data Model & Backend API Changes
- [x] 1.1: Update Prisma Schema (prisma/schema.prisma)
  - [x] 1.1.1: Define InsuranceSimulation model with fields: id, name, type (ENUM), parameters (Json), calculationResult (Json?), clientId, client relation, caseId, case relation, createdAt, updatedAt.
  - [x] 1.1.2: Define InsuranceType ENUM (LIFE, HOME).
  - [x] 1.1.3: Modify LoanSimulation: Remove direct insurance fields (if any outside calculationResult). Keep calculationResult for pure loan data.
  - [x] 1.1.4: Modify Client: Remove insurances relation (if it links to old combined model).
  - [x] 1.1.5: Deprecate/Remove old Insurance, LifeInsurance, HomeInsurance models (assuming they are replaced).
  - [x] 1.1.6: Run npx prisma migrate dev --name decouple_insurance_simulations.
  - [x] 1.1.7: Run npx prisma generate.

- [x] 1.2: Create/Modify Insurance Simulation API Endpoints
  - [x] 1.2.1: Create app/api/insurance-simulations/route.ts with POST (create) and GET (list by caseId).
  - [x] 1.2.2: Create app/api/insurance-simulations/[simId]/route.ts with GET (single), PUT (update), DELETE (delete).
  - [x] 1.2.3: Implement validation (auth, ownership) in all new insurance simulation endpoints.
  - [x] 1.2.4: Implement optional calculation and storage of calculationResult in POST and PUT insurance endpoints.

- [x] 1.3: Modify Calculation Endpoints (Python Backend & API Routes)
  - [x] 1.3.1: Update Python backend calculate_loan function to accept optional insurance_simulation_ids
  - [x] 1.3.2: Update Python backend compare_loans function to accept optional ref_insurance_simulation_ids and alt_insurance_simulation_ids
  - [x] 1.3.3: Update Backend API Route for calculate-loan to pass insuranceSimulationIds if received.
  - [x] 1.3.4: Update Backend API Route for compare-loans to pass refInsuranceSimulationIds and altInsuranceSimulationIds if received.
  - [x] 1.3.5: Update Backend API Route for calculate-multi-client-loan to pass insuranceSimulationIds if received.

- [x] 1.4: Modify Loan Endpoints
  - [x] 1.4.1: Review PUT /api/loans/[id] (app/api/loans/[id]/route.ts) and remove any direct insurance update logic.

- [x] 1.5: Deprecate/Remove Old Insurance Endpoints
  - [x] 1.5.1: Remove app/api/insurance/* routes and associated logic.
  - [x] 1.5.2: Remove app/api/clients/[id]/insurances/* routes and associated logic.

- [x] 1.6: Update API Service Functions (services/*.ts)
  - [x] 1.6.1: Add functions for CRUD operations on /api/insurance-simulations in relevant service files (e.g., apiService.ts).
  - [x] 1.6.2: Modify calculateLoan service function signature to accept optional insuranceSimulationIds: string[] and pass it.
  - [x] 1.6.3: Modify compareLoans service function signature to accept optional refInsuranceSimulationIds: string[] and altInsuranceSimulationIds: string[] and pass them.
  - [x] 1.6.4: Modify calculateMultiClientLoan service function signature to accept optional insuranceSimulationIds: string[] and pass it.

### Phase 2: Frontend Implementation
- [x] 2.1: Create Insurance Simulation Management UI
  - [x] 2.1.1: Create components/forms/InsuranceSimulationForm.tsx component (handles LIFE/HOME specific fields).
  - [x] 2.1.2: Create app/cases/[id]/insurance-simulations/new/page.tsx (uses the form, calls POST API).
  - [x] 2.1.3: Create app/cases/[id]/insurance-simulations/[simId]/page.tsx (displays details, allows edit/delete using the form, calls PUT/DELETE API).

- [x] 2.2: Update Case Detail Page (app/cases/[id]/page.tsx)
  - [x] 2.2.1: Add "Insurance Simulations" section fetching data from GET /api/insurance-simulations?caseId={caseId}.
  - [x] 2.2.2: Display list of insurance simulations with links to their detail pages.
  - [x] 2.2.3: Add "Add Insurance Simulation" button linking to the new page.
  - [x] 2.2.4: Update "Quick Actions" - Adjust "Configure Insurance" link target.

- [x] 2.3: Create Case-Specific Comparison Page (app/cases/[id]/compare/page.tsx)
  - [x] 2.3.1: Create the page structure.
  - [x] 2.3.2: Fetch Loan Simulations and Insurance Simulations for the case.
  - [x] 2.3.3: Implement UI for selecting Reference Loan, Alternative Loan.
  - [x] 2.3.4: Implement UI for selecting Insurance Simulations for each loan (Reference and Alternative).
  - [x] 2.3.5: Implement "Compare" button logic calling the compareLoans service with selected loan params and insurance IDs.
  - [x] 2.3.6: Display results using LoanComparisonTable and LoanComparisonChart.

- [x] 2.4: Create Case-Specific Investment Simulation Page (app/cases/[id]/investment/page.tsx)
  - [x] 2.4.1: Create the page structure.
  - [x] 2.4.2: Fetch Loan Simulations and Insurance Simulations for the case.
  - [x] 2.4.3: Implement UI for selecting Reference Loan, Alternative Loan.
  - [x] 2.4.4: Implement UI for selecting Insurance Simulations for each loan.
  - [x] 2.4.5: Integrate InvestmentParametersForm.
  - [x] 2.4.6: Implement "Run Simulation" button logic calling compareLoans service with loans, insurance IDs, and investment params.
  - [x] 2.4.7: Display results using InvestmentGrowthChart, InvestmentSimulationTable, and summary stats.

## Completed Tasks (continued)

- [x] 2.5: Update Standalone Pages (/, /comparison, /investment)
  - [x] 2.5.1: Update backuppage.tsx (standalone calculator): Remove insurance inputs, set insuranceCoveragePct to 0, add note about using Cases for insurance.
  - [x] 2.5.2: Update /comparison: Remove insurance inputs, add note guiding users to use Cases for insurance functionality.
  - [x] 2.5.3: Update /investment: Remove insurance inputs, add note guiding users to use Cases for insurance functionality.

- [x] 2.6: Update Frontend Components (components/*)
  - [x] 2.6.1: Review all relevant chart and table components.
  - [x] 2.6.2: Verify they correctly interpret and display the combined loan+insurance data when it's provided by the API (e.g., updated totalLoanCosts).

### Phase 3: Refinement & Testing
- [x] 3.1: Refactor Insurance Calculation Logic (lib/insurance/*.ts)
  - [x] 3.1.1: Review calculateLifeInsurance and calculateHomeInsurance for robustness and parameter handling (ensure they work with data stored in InsuranceSimulation.parameters).
  - [x] 3.1.2: Confirm these functions can be effectively used by the backend API during combined calculations.

## Remaining Tasks

- [ ] 3.2: Comprehensive Testing
  - [ ] 3.2.1: Test Insurance Simulation CRUD operations.
  - [ ] 3.2.2: Test Case Comparison page (with 0, 1, or multiple insurance sims selected for each loan).
  - [ ] 3.2.3: Test Case Investment Simulation page (with 0, 1, or multiple insurance sims selected for each loan).
  - [ ] 3.2.4: Test Standalone pages for correct exclusion/simplification of insurance.
  - [ ] 3.2.5: Verify database integrity after operations.
  - [ ] 3.2.6: Test API endpoints directly if necessary.
  - [ ] 3.2.7: Perform User Acceptance Testing (UAT) on the new flows.
