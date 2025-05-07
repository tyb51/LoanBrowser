# Python Backend Integration Guide

This document explains how the LoanLogic frontend integrates with the Python backend API.

## Architecture Overview

The application is structured with:

1. **Frontend**: NextJS application with Chart.js for visualizations
2. **Backend**: Python FastAPI server for loan calculations

## Integration Components

### API Service Layer

The integration uses a service layer pattern with three components:

1. **Mock API** (`loanApi.ts`): Provides simplified loan calculations directly in JavaScript
2. **Backend API** (`backendLoanApi.ts`): Communicates with the Python backend
3. **API Service** (`apiService.ts`): Serves as a facade that selects which implementation to use

This pattern allows for:
- Graceful fallback if the backend is unavailable
- Easy switching between implementations for testing
- Consistent interface for the rest of the application

### Configuration UI

The `/api-config` page allows users to:
- Enable/disable the Python backend
- Configure the backend URL
- Test the backend connection

Settings are stored in `localStorage` and applied when the application loads.

## Data Flow

1. UI components call methods from `apiService.ts`
2. The service layer determines whether to use the mock or backend implementation
3. If using the backend, requests are sent to the Python API
4. The Python API performs calculations using functions from `calculation_functions.py`
5. Results are formatted and returned to the frontend
6. UI components render the data using charts and tables

## Backend API Endpoints

The backend exposes two main endpoints:

1. `/api/calculate-loan`: Calculates a single loan with parameters
2. `/api/compare-loans`: Compares two loans and simulates investment if requested

Both endpoints accept POST requests with JSON payloads containing loan parameters, modular schedules, and investment parameters as needed.

## Type Consistency

TypeScript interfaces in the frontend match Pydantic models in the backend:

- `LoanParameters` → `LoanParameters`
- `ModularLoanSchedule` → `ModularLoanSchedule`
- `InvestmentParameters` → `InvestmentParameters`

Response data also maintains consistency with both new enum-based fields and legacy string-based fields for backward compatibility.

## Error Handling

The integration includes robust error handling:

1. API errors are caught and displayed to the user
2. If the backend is unavailable, the application falls back to the mock API
3. Network errors and invalid responses are handled gracefully

## Usage Example

```typescript
// In a React component
import { calculateLoan } from '@/app/services/apiService';

// ...

const handleSubmit = async (params: LoanParameters) => {
  try {
    const result = await calculateLoan(params);
    // Display result
  } catch (error) {
    // Handle error
  }
};
```

## Testing and Configuration

To test the backend integration:

1. Ensure the Python backend is running (`python run_api.py`)
2. Visit `/api-test` to test API calls directly
3. Visit `/api-config` to manage API settings

The application will gracefully handle both the presence and absence of the backend.
