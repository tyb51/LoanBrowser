# Insurance and Case Linking Changes

## Overview of Changes

We've implemented several major improvements to the system:

1. **Case Linking Feature**: Cases can now be linked to each other, enabling users to create relationships between cases for better organization and analysis.

2. **Life Insurance Improvements**:
   - Life insurances are now directly linked to clients
   - They can accept a selected loan as input for variables
   - Only coverage percentage and payment type are required for setup
   - Loan amount and term are defined by the loan
   - When viewing the insurance page, users can select a loan and view the resulting values
   - Added amortization table to the insurance view

3. **Home Insurance Improvements**:
   - Home insurances are linked to cases, not necessarily to loans
   - They can have multiple clients associated (costs can be divided)
   - Added optional parameter for simulated interest
   - Improved user interface with client share distribution

4. **Enhanced Insurance Information**:
   - Added more detailed information about insurances to case pages and investment simulations
   - Added client initials and coverage percentage in summary views
   - Created dedicated components for insurance visualization

## Key Files Changed/Added

### Database Changes
- Updated Prisma schema to support these new features:
  - Added `CaseLink` model for linked cases
  - Added `HomeInsuranceClient` model for many-to-many relationships
  - Modified `InsuranceSimulation` model structure
  - Added a migration file to update the database schema

### Server Actions
- Created `app/actions/caseActions.ts` to handle server-side operations:
  - Functions to get case data, loans, clients, and insurance simulations
  - Functions to link and unlink cases

### New Components
- `app/components/insurance/InsuranceAmortizationTable.tsx`: Displays insurance amortization schedule
- `app/components/insurance/InsuranceSummarySection.tsx`: Enhanced insurance display for case page
- `app/components/insurance/InsuranceSelectionSummary.tsx`: Displays selected insurances in investment simulations
- `app/components/linked-cases/LinkedCasesSection.tsx`: Interface for managing case links

### API Changes
- Updated insurance simulation API routes:
  - Modified endpoints to handle client associations
  - Added ability to calculate insurance for specific loans
  - Support for the simulated interest rate
  
### UI Improvements
- Enhanced insurance visualization:
  - Added loan selection for life insurance
  - Better display of client associations in home insurance
  - Improved summary information in case and investment pages
  
## How to Use the New Features

### Case Linking
1. Navigate to a case detail page
2. Look for the "Linked Cases" section
3. Click "Link Case" and select from available cases
4. Cases can be unlinked by clicking "Unlink" button
5. Linked cases provide easy navigation between related cases

### Life Insurance with Loan Selection
1. Create a life insurance simulation for a client
2. On the insurance detail page, select different loans to see how they affect the insurance
3. View the amortization table to see insurance costs over time

### Home Insurance with Multiple Clients
1. Create a home insurance simulation and select multiple clients
2. Set percentage shares for each client (defaults to equal shares)
3. Optionally set a simulated interest rate for premium calculations

### Insurance in Investment Simulations
1. When creating investment simulations, select insurances to include
2. More detailed insurance information is shown in the selection
3. Results will include the impact of the selected insurances

## Implementation Notes

- Server-side actions are used instead of API routes where appropriate to reduce the number of API calls
- Insurance parameters are now more modular, with loan-specific values taken from selected loans
- Case linking uses a bi-directional relationship model to allow for different types of relationships
- The insurance amortization table supports both monthly and annual views

## Next Steps

1. Run database migrations to update the schema
2. Test all new features thoroughly
3. Consider adding more insurance types in the future
4. Add more visualization options for insurance impacts
5. Improve performance by optimizing queries and caching