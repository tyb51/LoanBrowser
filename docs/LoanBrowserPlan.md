# LoanLogic Website Plan

## Project Overview
This project aims to create an interactive web application for visualizing loan calculations. The application will leverage NextJS frontend with Chart.js for visualizations and connect to Python backend functions for complex loan calculations.

## Current Structure Analysis
- **Frontend**: NextJS application with Chart.js integration 
- **Backend**: Python functions for loan calculations (annuity/bullet loans, investment simulations)
- **Data Flow**: Python FastAPI server with a graceful fallback to JavaScript mock implementations

## Implementation Plan

### 1. Backend API Setup
- [x] Create Python FastAPI or Flask server to expose calculation functions
  - [x] Implement endpoints for loan calculations based on `python/calculation_functions.py`
  - [x] Create data transformation layer to format Python calculations for frontend consumption
  - [x] Add CORS support for local development
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

### 9. Authentication and User Management (NEW)
- [✓] Set up NextAuth.js for authentication
  - [✓] Implement multiple authentication providers (email/password, Google, etc.)
  - [✓] Create login and registration pages
  - [✓] Implement account activation and password recovery workflows
  - [✓] Set up protected routes and middleware
- [✓] Configure environment variables
  - [✓] Create .env.example file with necessary variables
  - [✓] Document environment setup process
  - [✓] Set up environment variable validation

### 10. Database Integration (NEW)
- [✓] Set up PostgreSQL database
  - [✓] Install and configure PostgreSQL locally for development
  - [✓] Set up connection pooling for production
- [✓] Implement Prisma ORM
  - [✓] Create Prisma schema with necessary models
  - [✓] Set up database migrations
  - [✓] Create database seeding scripts for development
- [✓] Create data models for:
  - [✓] User profiles and authentication
  - [✓] Cases/Dossiers
  - [✓] Clients (individuals and companies)
  - [✓] Loan simulations
  - [✓] Investment simulations

### 11. Case Management System (NEW)
- [✓] Create Case/Dossier management interface
  - [✓] List, create, edit, and delete cases
  - [✓] Search and filter cases
  - [✓] Case status tracking
- [✓] Implement Client management
  - [✓] Personal client information (biometrics, financial status)
  - [✓] Company client information
  - [✓] Client relationship management
- [✓] Create loan simulation storage
  - [✓] Save loan simulations to database
  - [✓] Associate simulations with cases and clients
  - [✓] Compare historical simulations

### 12. Enhanced Investment Simulation (NEW)
- [✓] Update investment simulation to support separate starting capitals
  - [✓] Modify InvestmentParameters interface to include separate starting capitals
  - [✓] Update investment simulation calculation logic
  - [✓] Update UI to show separate starting capital inputs
- [✓] Enhance investment simulation visualization
  - [✓] Add toggle controls for showing/hiding different scenarios
  - [✓] Create comparison view for multiple investment strategies
  - [✓] Implement visual indicators for profitable vs. risky strategies

### 13. Insurance Approximator Module (NEW)
- [✓] Implement life insurance calculation module
  - [✓] Create data models for insurance calculations
  - [✓] Implement algorithms for premium calculation based on biometrics
  - [✓] Create UI for insurance configuration
- [✓] Implement home insurance module
  - [✓] Develop models for property-based insurance calculation
  - [✓] Create UI for home insurance configuration
- [✓] Create insurance comparison functionality
  - [✓] Compare different insurance providers/options
  - [✓] Visualize impact of insurance on loan costs
- [✓] Implement multi-client insurance allocation
  - [✓] Support for assigning insurance to different clients
  - [✓] Allow multiple insurance policies per case
  - [✓] Calculate over-insurance scenarios

## Technical Implementation Details

### Frontend Stack
- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS
- **Charts**: Chart.js via react-chartjs-2
- **State Management**: React Context or Zustand
- **Form Handling**: React Hook Form with Zod validation
- **API Communication**: Fetch API or Axios
- **Authentication**: NextAuth.js (NEW)
- **Database ORM**: Prisma (NEW)

### Backend Integration
- **API**: Python FastAPI with a local fallback 
- **Calculation Engine**: Existing Python functions from `python/calculation_functions.py`
- **Data Format**: JSON
- **Communication**: HTTP/REST
- **Database**: PostgreSQL (NEW)

### Development Approach
1. Start with basic input components and single loan calculation
2. Add visualization components
3. Implement comparison functionality
4. Add advanced features (investment simulation, etc.)
5. Enhance UI/UX and responsiveness
6. Add export and saving functionality
7. Implement authentication and user management (NEW)
8. Integrate database and case management (NEW)
9. Enhance investment simulation (NEW)
10. Add insurance approximator module (NEW)

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
   - Investment growth curve with separate starting capitals (NEW)
   - Comparative visualization of multiple investment strategies (NEW)
   - Toggle controls for different scenarios (NEW)
   - Net worth (investment - remaining loan)

5. **Minimum Growth Visualization**
   - Required investment growth rate to break even

6. **Insurance Impact Visualization** (NEW)
   - Impact of insurance on monthly payments
   - Life insurance amortization visualization
   - Insurance cost comparison

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

5. **Insurance Premium Table** (NEW)
   - Life insurance premium calculation based on client biometrics
   - Coverage options and their impact

## Database Schema Design (NEW)

### User Model
- id: UUID (primary key)
- email: String (unique)
- name: String
- hashedPassword: String
- createdAt: DateTime
- updatedAt: DateTime
- Cases: Case[] (relation)

### Case/Dossier Model
- id: UUID (primary key)
- title: String
- description: String (optional)
- createdAt: DateTime
- updatedAt: DateTime
- userId: UUID (foreign key)
- User: User (relation)
- Clients: Client[] (relation)
- LoanSimulations: LoanSimulation[] (relation)
- InvestmentSimulations: InvestmentSimulation[] (relation)

### Client Model
- id: UUID (primary key)
- name: String
- type: Enum (INDIVIDUAL, COMPANY)
- age: Int (for individuals)
- height: Float (for individuals, in cm)
- weight: Float (for individuals, in kg)
- smoker: Boolean (for individuals)
- currentCapital: Float
- currentDebt: Float
- monthlyIncome: Float
- caseId: UUID (foreign key)
- Case: Case (relation)
- Insurances: Insurance[] (relation)

### LoanSimulation Model
- id: UUID (primary key)
- name: String
- loanType: Enum (ANNUITY, BULLET, MODULAR)
- principal: Float
- interestRate: Float
- termYears: Int
- ownContribution: Float
- purchasePrice: Float (optional)
- createdAt: DateTime
- updatedAt: DateTime
- caseId: UUID (foreign key)
- Case: Case (relation)
- ModularSchedule: ModularScheduleItem[] (relation)

### ModularScheduleItem Model
- id: UUID (primary key)
- month: Int
- amount: Float
- loanSimulationId: UUID (foreign key)
- LoanSimulation: LoanSimulation (relation)

### InvestmentSimulation Model
- id: UUID (primary key)
- name: String
- startCapital: Float
- annualGrowthRate: Float
- refInvestCapital: Float (NEW)
- altInvestCapital: Float (NEW)
- createdAt: DateTime
- updatedAt: DateTime
- caseId: UUID (foreign key)
- Case: Case (relation)
- referenceLoanId: UUID (foreign key)
- alternativeLoanId: UUID (foreign key)
- ReferenceLoan: LoanSimulation (relation)
- AlternativeLoan: LoanSimulation (relation)

### Insurance Model (NEW)
- id: UUID (primary key)
- type: Enum (LIFE, HOME)
- coveragePercentage: Float
- initialPremium: Float
- clientId: UUID (foreign key)
- Client: Client (relation)
- LifeInsurance: LifeInsurance (relation)
- HomeInsurance: HomeInsurance (relation)

### LifeInsurance Model (NEW)
- id: UUID (primary key)
- paymentType: Enum (LUMP_SUM, DISTRIBUTED)
- basedOnRemainingCapital: Boolean
- insuranceId: UUID (foreign key)
- Insurance: Insurance (relation)

### HomeInsurance Model (NEW)
- id: UUID (primary key)
- propertyValue: Float
- propertyType: String
- insuranceId: UUID (foreign key)
- Insurance: Insurance (relation)

## Authentication Implementation (NEW)

### NextAuth.js Setup
1. **Installation and Configuration**
   - Install NextAuth.js and dependencies
   - Create NextAuth API route
   - Configure providers (email/password, OAuth providers)

2. **Environment Variables**
   - DATABASE_URL: PostgreSQL connection string
   - NEXTAUTH_URL: Application URL
   - NEXTAUTH_SECRET: Secret for JWT encryption
   - Provider-specific secrets (e.g., GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET)

3. **User Authentication Flow**
   - Registration page with email verification
   - Login page with credential validation
   - Password reset functionality
   - Account settings page

4. **Session Management**
   - Implement session provider
   - Create protected routes using middleware
   - Add user context for global access to session data

## Future Enhancements (Post-MVP)
- Integration with real interest rate data
- Additional loan types and specialized calculations
- Printable/shareable reports
- Mortgage affordability calculator
- Integration with property value estimation APIs
- Advanced insurance calculation models
- Integration with external insurance APIs
- Multi-user collaboration on cases
- Document attachment for cases and clients
