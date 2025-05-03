# Loan Browser Website Plan

## Project Overview
This project aims to create an interactive web application for visualizing loan calculations. The application will leverage NextJS frontend with Chart.js for visualizations and connect to Python backend functions for complex loan calculations.

## Current Structure Analysis
- **Frontend**: NextJS application with Chart.js integration 
- **Backend**: Python functions for loan calculations (annuity/bullet loans, investment simulations)
- **Data Flow**: Currently uses JSON server to serve data

## Implementation Plan

### 1. Backend API Setup
- [ ] Create Python FastAPI or Flask server to expose calculation functions
  - [ ] Implement endpoints for loan calculations based on `python/calculation_functions.py`
  - [ ] Create data transformation layer to format Python calculations for frontend consumption
  - [ ] Add CORS support for local development
  - [ ] Ensure error handling for calculation edge cases

### 2. Frontend Data Models
- [x] Create TypeScript interfaces for all loan-related data
  - [x] LoanParameters interface (loan type, amount, interest rate, term, etc.)
  - [x] LoanCalculationResult interface (monthly payments, interest paid, etc.)
  - [x] InvestmentSimulation interface (investment growth, comparison results)
  - [x] ModularLoanSchedule interface (for bullet/modular loans)

### 3. UI Components Development
- [x] Create Layout and Container Components
  - [x] Responsive layout with sections for inputs, charts, and tables
  - [x] Tab navigation for different loan types and comparison views
  - [x] Loading states for calculations

- [x] Input Components
  - [x] Loan Type Selection (Annuity vs Bullet/Modular)
  - [x] Basic Loan Parameters Form
    - [x] Loan amount / Purchase price
    - [x] Down payment / Own contribution
    - [x] Interest rate
    - [x] Loan term
    - [x] Start year
  - [x] Advanced Parameters Form
    - [x] Insurance percentage coverage
    - [x] Investment growth rate
    - [x] Initial investment capital
  - [x] Modular Loan Schedule Builder (for bullet/modular loans)
  - [x] Form validation and error handling

- [x] Chart Components
  - [x] Loan Balance Over Time Chart
  - [x] Payment Breakdown Chart (Principal vs Interest vs Insurance)
  - [x] Comparison Chart (for comparing different loan scenarios)
  - [x] Investment Growth Chart
  - [x] Net Worth Chart (Investment value minus remaining loan)
  - [ ] Interactive chart controls (zoom, filtering, tooltips)

- [x] Table Components
  - [x] Amortization Schedule Table
  - [x] Annual Summary Table
  - [x] Loan Comparison Table
  - [x] Statistics Summary Table

### 4. State Management
- [x] Implement state management for storing:
  - [ ] Multiple loan scenarios
  - [x] Calculation results
  - [ ] Chart configuration preferences
  - [ ] User input history
- [ ] Add localStorage integration for saving calculations

### 5. API Integration
- [x] Create API service for communicating with Python backend
  - [x] Calculate loan function (for single loan calculation)
  - [x] Compare loans function (for loan comparison)
  - [x] Investment simulation function
  - [x] Minimum growth rate calculation function

### 6. Dynamic Features
- [ ] Real-time calculation updates when parameters change
- [ ] Ability to save multiple loan scenarios for comparison
- [ ] Export functionality for charts and tables (PDF, CSV)
- [x] Mobile-responsive design
- [x] Multi-language support (optional)

### 7. Performance Optimization
- [x] Implement loading states and suspense boundaries
- [ ] Memoize expensive calculations
- [ ] Optimize chart rendering
- [x] Implement pagination for large datasets

### 8. Internationalization
- [x] Set up i18next for internationalization
- [x] Create language switcher component
- [x] Support multiple languages:
  - [x] English
  - [x] Dutch
  - [x] French
  - [x] German
  - [x] Spanish
- [x] Translate all UI elements
- [x] Format numbers and currencies according to locale

## Technical Implementation Details

### Frontend Stack
- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS
- **Charts**: Chart.js via react-chartjs-2
- **State Management**: React Context or Zustand
- **Form Handling**: React Hook Form with Zod validation
- **API Communication**: Fetch API or Axios

### Backend Integration
- **API**: Python FastAPI or Flask server
- **Calculation Engine**: Existing Python functions from `python/calculation_functions.py`
- **Data Format**: JSON
- **Communication**: HTTP/REST

### Development Approach
1. Start with basic input components and single loan calculation
2. Add visualization components
3. Implement comparison functionality
4. Add advanced features (investment simulation, etc.)
5. Enhance UI/UX and responsiveness
6. Add export and saving functionality

## Visualizations to Implement

### Charts
1. **Loan Balance Over Time**
   - Remaining principal over loan term
   - Cumulative costs (interest + insurance)

2. **Payment Breakdown**
   - Principal vs Interest vs Insurance components
   - Monthly payment trends

3. **Loan Comparison**
   - Direct comparison of different loan scenarios
   - Difference in total costs

4. **Investment Simulation**
   - Investment growth curve
   - Net worth (investment - remaining loan)

5. **Minimum Growth Visualization**
   - Required investment growth rate to break even

### Tables
1. **Amortization Schedule**
   - Monthly breakdown of payments
   - Running totals of interest and principal

2. **Annual Summary**
   - Yearly aggregation of payment data
   - Year-end totals

3. **Comparison Matrix**
   - Side-by-side comparison of different scenarios
   - Highlight differences in key metrics

4. **Statistics Summary**
   - Key metrics of loan calculations
   - Total interest, total payments, etc.

## Future Enhancements (Post-MVP)
- Integration with real interest rate data
- Additional loan types and specialized calculations
- Printable/shareable reports
- User accounts for saving calculations
- Mortgage affordability calculator
- Integration with property value estimation APIs
