Okay, this is a significant but valuable refactoring task. Decoupling loans and insurances while allowing them to be combined for analysis is a good architectural goal. It provides more flexibility and clarity. Saving parameters and calculating results on demand versus storing results is a common trade-off. Storing results is generally faster for retrieval but can lead to stale data if the calculation logic changes. Storing only parameters ensures results are always fresh but requires computation on load.
Given the complexity of loan/investment simulations, storing both the parameters and the calculation results (e.g., as a JSON blob) is often the most practical approach. This gives you fast display times and preserves historical simulation results. You can add a "Recalculate" button if needed to refresh results based on the latest logic or updated parameters/linked items. We'll proceed with this assumption.
Here's a detailed step-by-step plan to achieve the decoupling and enhancements:
Phase 1: Data Model & Backend API Changes
1.	Update Prisma Schema (prisma/schema.prisma)
o	Goal: Define Insurance Simulations separately and remove direct insurance calculation from loans.
o	Action:
	Create InsuranceSimulation Model:
	model InsuranceSimulation {
	  id                  String    @id @default(cuid())
	  name                String
	  type                InsuranceType // ENUM: LIFE, HOME
	  parameters          Json      // Store parameters like coverage%, paymentType, propertyValue, etc.
	  calculationResult   Json?     // Store calculated premium, amortization if needed (optional, can be calculated on demand)
	  clientId            String    // Link to the client this insurance is for
	  client              Client    @relation(fields: [clientId], references: [id], onDelete: Cascade)
	  caseId              String    // Link to the case
	  case                Case      @relation(fields: [caseId], references: [id], onDelete: Cascade)
	  createdAt           DateTime  @default(now())
	  updatedAt           DateTime  @updatedAt
	  // Optional: Link to LoanSimulation if you want a default/primary link,
	  // but selection will happen at calculation time.
	  // loanSimulationId  String?
	  // loanSimulation    LoanSimulation? @relation(fields: [loanSimulationId], references: [id])
	}
	
	enum InsuranceType {
	  LIFE
	  HOME
}
content_copydownload
Use code with caution.Prisma
	Modify LoanSimulation Model:
	Remove any fields directly storing calculated insurance results (e.g., totalInsurancePaid if it exists outside the calculationResult JSON). The calculationResult JSON should ideally only store the pure loan calculation without insurance initially. Insurance will be added dynamically during combined calculations.
	Keep the calculationResult Json? field to store the pure loan results.
	Modify Client Model: Remove the insurances relation if it points to the old combined model. The new InsuranceSimulation links back to the Client.
	Deprecate/Review Insurance, LifeInsurance, HomeInsurance Models: Decide if these existing models represent actual policies or the old simulation structure. If they are the old structure, remove them. If they represent actual policies, keep them separate from the new InsuranceSimulation. For this plan, let's assume they represent the old structure and will be replaced by InsuranceSimulation.
o	Run Migrations:
o	npx prisma migrate dev --name decouple_insurance_simulations
npx prisma generate
content_copydownload
Use code with caution.Bash
2.	Create/Modify Backend API Endpoints
o	Goal: Provide CRUD for Insurance Simulations and update calculation endpoints.
o	Action:
	Create New Insurance Simulation Endpoints:
	POST /api/insurance-simulations: Create a new InsuranceSimulation. Requires name, type, parameters, clientId, caseId. Should validate that clientId and caseId belong to the authenticated user. Optionally calculates and stores calculationResult.
	File: app/api/insurance-simulations/route.ts
	GET /api/insurance-simulations?caseId={caseId}: Get all InsuranceSimulations for a specific case.
	File: app/api/insurance-simulations/route.ts
	GET /api/insurance-simulations/[simId]: Get a specific InsuranceSimulation.
	File: app/api/insurance-simulations/[simId]/route.ts
	PUT /api/insurance-simulations/[simId]: Update an InsuranceSimulation (parameters, name). Optionally recalculates.
	File: app/api/insurance-simulations/[simId]/route.ts
	DELETE /api/insurance-simulations/[simId]: Delete an InsuranceSimulation.
	File: app/api/insurance-simulations/[simId]/route.ts
	Modify Calculation Endpoints (Python Backend & API Routes):
	Files: python/api/endpoints.py (or similar), app/api/calculate-loan/route.ts (if exists, or handled by backendLoanApi), app/api/compare-loans/route.ts (if exists, or handled by backendLoanApi), app/api/calculate-multi-client-loan/route.ts (if exists, or handled by backendLoanApi).
	Request: Update the request body/payload to accept an optional array insuranceSimulationIds: string[].
	Logic (Python):
	If insuranceSimulationIds are provided:
	Fetch the specified InsuranceSimulation records from the database.
	For each simulation, calculate its monthly premium based on its stored parameters and the relevant loanSimulation context (e.g., loan term, remaining capital if basedOnRemainingCapital is true). You might need to adapt the lib/insurance logic or call it here.
	Sum the monthly premiums for all selected simulations for each month of the loan's duration.
	Perform the core loan calculation (calculate_loan_core function).
	Combine the results: Add the calculated monthly insurance premium sum to the totalMonthlyPayment of the core loan result for each month. Update cumulativeInsurancePaid and recalculate totalLoanCosts in the statistics. Add the selected insuranceSimulationIds to the result object for reference.
	Return the combined LoanCalculationResult.
	API Route: Ensure the API route correctly passes the insuranceSimulationIds to the backend service.
	Modify Loan Endpoints:
	PUT /api/loans/[id]: Remove any logic that directly updates insurance based on loan parameter changes.
	File: app/api/loans/[id]/route.ts
	Deprecate/Remove Old Insurance Endpoints:
	Remove app/api/insurance/* routes.
	Remove app/api/clients/[id]/insurances/* routes.
3.	Update API Service Functions (services/*.ts)
o	Goal: Align frontend service calls with the new API structure.
o	Action:
	Files: services/apiService.ts, services/backendLoanApi.ts, services/loanApi.ts, services/multiClientLoanApi.ts.
	Add new functions to interact with the /api/insurance-simulations endpoints (create, get, update, delete).
	Modify calculateLoan, compareLoans, calculateMultiClientLoan function signatures to accept an optional insuranceSimulationIds: string[] parameter. Pass this array to the corresponding backend API calls.
Phase 2: Frontend Implementation
1.	Create Insurance Simulation Management UI
o	Goal: Allow users to create, view, edit, and delete insurance simulations within a case.
o	Action:
	New Page: app/cases/[id]/insurance-simulations/new/page.tsx
	Form to select Client (from the case), Insurance Type (LIFE/HOME).
	Conditionally render form fields based on selected type (using a new InsuranceSimulationForm component).
	Input for simulation name.
	On submit, call the POST /api/insurance-simulations service function.
	Redirect back to the case detail page upon success.
	New Page: app/cases/[id]/insurance-simulations/[simId]/page.tsx
	Fetch the specific insurance simulation using its ID.
	Display simulation details (name, type, parameters).
	Include an "Edit" button leading to an edit state (using the InsuranceSimulationForm).
	Include a "Delete" button.
	On save (after edit), call the PUT /api/insurance-simulations/[simId] service function.
	On delete, call the DELETE /api/insurance-simulations/[simId] service function and redirect.
	New Component: components/forms/InsuranceSimulationForm.tsx
	Takes type (LIFE/HOME) and optional defaultValues (parameters).
	Renders appropriate fields for life (coverage%, paymentType, basedOnRemainingCapital) or home (propertyType, propertyValue, etc.).
	Handles state management for the parameters.
	Returns the parameters object via an onSubmit or onChange prop.
2.	Update Case Detail Page (app/cases/[id]/page.tsx)
o	Goal: Integrate Insurance Simulation management.
o	Action:
	Add a new section titled "Insurance Simulations".
	Fetch and display a list of InsuranceSimulations associated with the caseId.
	Each list item should show the simulation name, type, associated client name, and link to its detail/edit page (/cases/[id]/insurance-simulations/[simId]).
	Add an "Add Insurance Simulation" button linking to /cases/[id]/insurance-simulations/new.
	Modify the "Loan Simulations" list:
	Consider adding an icon or indicator showing if any insurance simulations are typically associated or calculated with this loan (this might be complex if the association is dynamic). Simpler might be to just handle selection on the comparison/investment pages.
	Update the "Quick Actions": Ensure the "Configure Insurance" link points to a relevant page, perhaps the list of insurance simulations or the "Add New" page.
3.	Create Case-Specific Comparison Page (app/cases/[id]/compare/page.tsx)
o	Goal: Allow comparison of two loan simulations within the case, optionally including selected insurance simulations.
o	Action:
	New Page: app/cases/[id]/compare/page.tsx
	Fetch all LoanSimulations and InsuranceSimulations for the caseId.
	UI:
	Two dropdowns/selectors to choose the "Reference Loan" and "Alternative Loan" from the fetched LoanSimulations.
	Two multi-select components (checkbox lists or similar) to choose which InsuranceSimulations to apply to the reference calculation and which to apply to the alternative calculation. Allow selecting none.
	A "Compare" button.
	Logic:
	When "Compare" is clicked:
	Get the selected LoanSimulation objects (or just their parameters if recalculating is desired).
	Get the selected insuranceSimulationIds for both reference and alternative.
	Call the compareLoans service function, passing the loan parameters and the respective arrays of selected insurance simulation IDs.
	Display the results using LoanComparisonTable and LoanComparisonChart. Ensure these components can handle the combined loan+insurance data correctly (e.g., updated total costs).
4.	Create Case-Specific Investment Simulation Page (app/cases/[id]/investment/page.tsx)
o	Goal: Allow investment simulation between two loans within the case, optionally including selected insurance simulations.
o	Action:
	New Page: app/cases/[id]/investment/page.tsx
	Fetch all LoanSimulations and InsuranceSimulations for the caseId.
	UI:
	Similar to the comparison page: Select Reference & Alternative Loans.
	Similar to the comparison page: Select Insurance Simulations for each loan.
	Include the InvestmentParametersForm.
	A "Run Simulation" button.
	Logic:
	When "Run Simulation" is clicked:
	Get selected loans, selected insurance IDs for each, and investment parameters.
	Call the compareLoans service function, passing all parameters (loans, insurance IDs, investment params).
	Display results using InvestmentGrowthChart and InvestmentSimulationTable. Ensure components correctly display combined loan+insurance effects on net worth, monthly differences, etc. Display stats like minimumRequiredGrowthRate and netWorthEndOfTerm.
5.	Update Standalone Pages (/, /comparison, /investment)
o	Goal: Simplify or remove direct insurance calculations, guiding users towards Cases for combined analysis.
o	Action:
	File: app/page.tsx (or the new main calculator page, potentially app/dashboard/page.tsx or a dedicated /calculator route if page.tsx is the landing page)
	Modify LoanParametersForm usage: Remove insurance-specific inputs if they exist directly in the form.
	Update handleSubmit: Call calculateLoan without any insurance simulation IDs.
	Display results using components (LoanStatisticsTable, AmortizationTable, LoanBalanceChart), ensuring they correctly display only loan data.
	Add a prominent note/link: "For scenarios including insurance, please create or use a Case."
	File: app/comparison/page.tsx
	Remove/simplify insurance inputs in the forms for both loans.
	Update handleCompare: Call compareLoans without insurance simulation IDs and without investment parameters.
	Display results using components, showing only the loan comparison.
	Add a note/link: "For comparisons including insurance or investment simulations, please use a Case."
	File: app/investment/page.tsx
	Remove/simplify insurance inputs.
	Remove the InvestmentParametersForm if you want to reserve investment sims for Cases only, or keep it but make it clear insurance isn't included.
	Update handleSimulate: Call compareLoans without insurance IDs, but with investment parameters (if keeping the form).
	Display results, noting that insurance costs are not factored in.
	Add a note/link: "For simulations including specific insurance policies, please use a Case."
6.	Update Frontend Components (components/*)
o	Goal: Ensure charts and tables can handle and display the potentially combined loan+insurance data returned by the API.
o	Action:
	Review LoanBalanceChart, PaymentBreakdownChart, LoanComparisonChart, InvestmentGrowthChart, AmortizationTable, LoanStatisticsTable, LoanComparisonTable, InvestmentSimulationTable.
	Check how they access data (e.g., totalMonthlyPayment, totalLoanCosts, cumulativeInsurancePaid).
	Ensure they correctly display the values returned by the updated API endpoints, which will now include the summed insurance premiums when requested. No major component logic changes should be needed if the API returns the combined figures correctly under the existing field names. Just ensure the source data passed to them is the combined result when applicable.
Phase 3: Refinement & Testing
1.	Refactor Insurance Calculation Logic (lib/insurance/*.ts)
o	Goal: Ensure the core calculation functions are robust and reusable by the backend API.
o	Action:
	Review calculateLifeInsurance and calculateHomeInsurance. Ensure they take all necessary parameters (which would be stored in the InsuranceSimulation.parameters JSON) and return consistent results, likely at least a monthlyPremium.
	These functions will likely be called by the backend API endpoint when calculating combined results, using the parameters fetched from the InsuranceSimulation records.
2.	Testing
o	Goal: Verify all changes work as expected.
o	Action:
	Test creating/editing/deleting Insurance Simulations.
	Test the new Case Comparison page with and without selecting insurance simulations.
	Test the new Case Investment Simulation page with and without selecting insurance simulations.
	Verify the standalone pages (/, /comparison, /investment) now correctly exclude or simplify insurance.
	Check database entries to confirm data is stored correctly.
	Test API endpoints directly (e.g., using Postman or curl) to verify request/response formats.

