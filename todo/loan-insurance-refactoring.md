Phase 1: Data Model & Backend API Changes
Goal: Update the database structure and backend logic to support separate Insurance Simulations and integrate them into calculations.
[ ] 1.1: Update Prisma Schema (prisma/schema.prisma)
    [ ]1.1.1: Define InsuranceSimulation model with fields: id, name, type (ENUM), parameters (Json), calculationResult (Json?), clientId, client relation, caseId, case relation, createdAt, updatedAt.
    [ ]1.1.2: Define InsuranceType ENUM (LIFE, HOME).
    [ ]1.1.3: Modify LoanSimulation: Remove direct insurance fields (if any outside calculationResult). Keep calculationResult for pure loan data.
    [ ]1.1.4: Modify Client: Remove insurances relation (if it links to old combined model).
    [ ]1.1.5: Deprecate/Remove old Insurance, LifeInsurance, HomeInsurance models (assuming they are replaced).
    [ ]1.1.6: Run npx prisma migrate dev --name decouple_insurance_simulations.
    [ ]1.1.7: Run npx prisma generate.
[ ] 1.2: Create/Modify Insurance Simulation API Endpoints
    [ ]1.2.1: Create app/api/insurance-simulations/route.ts with POST (create) and GET (list by caseId).
    [ ]1.2.2: Create app/api/insurance-simulations/[simId]/route.ts with GET (single), PUT (update), DELETE (delete).
    [ ]1.2.3: Implement validation (auth, ownership) in all new insurance simulation endpoints.
    [ ]1.2.4: Implement optional calculation and storage of calculationResult in POST and PUT insurance endpoints.
[ ] 1.3: Modify Calculation Endpoints (Python Backend & API Routes)
    [ ]1.3.1: Update Python backend calculate_loan function (or equivalent):
Accept optional insurance_simulation_ids: List[str].
If IDs provided, fetch simulations, calculate summed monthly premiums based on parameters & loan context.
Perform core loan calculation.
Combine loan results with summed insurance premiums (update totalMonthlyPayment, cumulativeInsurancePaid, totalLoanCosts).
Return combined LoanCalculationResult.
    [ ]1.3.2: Update Python backend compare_loans function (or equivalent):
Accept optional ref_insurance_simulation_ids: List[str] and alt_insurance_simulation_ids: List[str].
Call the updated calculate_loan function twice (once for ref, once for alt) passing the respective insurance IDs.
Perform comparison and investment simulation using the combined results from the previous step.
Return combined ComparisonResult.
    [ ]1.3.3: Update Backend API Route for calculate-loan (e.g., in app/api/calculate-loan/route.ts or handled by backendLoanApi): Pass insuranceSimulationIds if received.
    [ ]1.3.4: Update Backend API Route for compare-loans: Pass refInsuranceSimulationIds and altInsuranceSimulationIds if received.
    [ ]1.3.5: Update Backend API Route for calculate-multi-client-loan: Pass insuranceSimulationIds if received.
[ ] 1.4: Modify Loan Endpoints
    [ ]1.4.1: Review PUT /api/loans/[id] (app/api/loans/[id]/route.ts) and remove any direct insurance update logic.
[ ] 1.5: Deprecate/Remove Old Insurance Endpoints
    [ ]1.5.1: Remove app/api/insurance/* routes and associated logic.
    [ ]1.5.2: Remove app/api/clients/[id]/insurances/* routes and associated logic.
[ ] 1.6: Update API Service Functions (services/*.ts)
    [ ]1.6.1: Add functions for CRUD operations on /api/insurance-simulations in relevant service files (e.g., apiService.ts).
    [ ]1.6.2: Modify calculateLoan service function signature to accept optional insuranceSimulationIds: string[] and pass it.
    [ ]1.6.3: Modify compareLoans service function signature to accept optional refInsuranceSimulationIds: string[] and altInsuranceSimulationIds: string[] and pass them.
    [ ]1.6.4: Modify calculateMultiClientLoan service function signature to accept optional insuranceSimulationIds: string[] and pass it.
Phase 2: Frontend Implementation
Goal: Build UI for managing Insurance Simulations and integrate selection into Case Comparison/Investment pages. Update standalone pages.
    [ ][ ] 2.1: Create Insurance Simulation Management UI
    [ ]2.1.1: Create components/forms/InsuranceSimulationForm.tsx component (handles LIFE/HOME specific fields).
    [ ]2.1.2: Create app/cases/[id]/insurance-simulations/new/page.tsx (uses the form, calls POST API).
    [ ]2.1.3: Create app/cases/[id]/insurance-simulations/[simId]/page.tsx (displays details, allows edit/delete using the form, calls PUT/DELETE API).
[ ] 2.2: Update Case Detail Page (app/cases/[id]/page.tsx)
    [ ]2.2.1: Add "Insurance Simulations" section fetching data from GET /api/insurance-simulations?caseId={caseId}.
    [ ]2.2.2: Display list of insurance simulations with links to their detail pages.
    [ ]2.2.3: Add "Add Insurance Simulation" button linking to the new page.
    [ ]2.2.4: Update "Quick Actions" - Adjust "Configure Insurance" link target.
[ ] 2.3: Create Case-Specific Comparison Page (app/cases/[id]/compare/page.tsx)
    [ ]2.3.1: Create the page structure.
    [ ]2.3.2: Fetch Loan Simulations and Insurance Simulations for the case.
    [ ]2.3.3: Implement UI for selecting Reference Loan, Alternative Loan.
    [ ]2.3.4: Implement UI for selecting Insurance Simulations for each loan (Reference and Alternative).
    [ ]2.3.5: Implement "Compare" button logic calling the compareLoans service with selected loan params and insurance IDs.
    [ ]2.3.6: Display results using LoanComparisonTable and LoanComparisonChart.
[ ] 2.4: Create Case-Specific Investment Simulation Page (app/cases/[id]/investment/page.tsx)
    [ ]2.4.1: Create the page structure.
    [ ]2.4.2: Fetch Loan Simulations and Insurance Simulations for the case.
    [ ]2.4.3: Implement UI for selecting Reference Loan, Alternative Loan.
    [ ]2.4.4: Implement UI for selecting Insurance Simulations for each loan.
    [ ]2.4.5: Integrate InvestmentParametersForm.
    [ ]2.4.6: Implement "Run Simulation" button logic calling compareLoans service with loans, insurance IDs, and investment params.
    [ ]2.4.7: Display results using InvestmentGrowthChart, InvestmentSimulationTable, and summary stats.
[ ] 2.5: Update Standalone Pages (/, /comparison, /investment)
    [ ]2.5.1: Update / (or main calculator page): Remove insurance inputs, call calculateLoan without insurance IDs, display only loan results, add note about using Cases for insurance.
    [ ]2.5.2: Update /comparison: Remove insurance inputs, call compareLoans without insurance/investment, display only loan comparison, add note.
    [ ]2.5.3: Update /investment: Remove insurance inputs, optionally remove investment form or clarify insurance exclusion, call compareLoans without insurance IDs, display results, add note.
[ ] 2.6: Update Frontend Components (components/*)
    [ ]2.6.1: Review all relevant chart and table components.
    [ ]2.6.2: Verify they correctly interpret and display the combined loan+insurance data when it's provided by the API (e.g., updated totalLoanCosts).
Phase 3: Refinement & Testing
Goal: Ensure core logic is sound and the entire system works correctly.
[ ] 3.1: Refactor Insurance Calculation Logic (lib/insurance/*.ts)
    [ ]3.1.1: Review calculateLifeInsurance and calculateHomeInsurance for robustness and parameter handling (ensure they work with data stored in InsuranceSimulation.parameters).
    [ ]3.1.2: Confirm these functions can be effectively used by the backend API during combined calculations.
[ ] 3.2: Comprehensive Testing
    [ ]3.2.1: Test Insurance Simulation CRUD operations.
    [ ]3.2.2: Test Case Comparison page (with 0, 1, or multiple insurance sims selected for each loan).
    [ ]3.2.3: Test Case Investment Simulation page (with 0, 1, or multiple insurance sims selected for each loan).
    [ ]3.2.4: Test Standalone pages for correct exclusion/simplification of insurance.
    [ ]3.2.5: Verify database integrity after operations.
    [ ]3.2.6: Test API endpoints directly if necessary.
    [ ]3.2.7: Perform User Acceptance Testing (UAT) on the new flows.
This checklist should help you manage the refactoring process effectively.