# Loan Browser

An interactive web application for visualizing loan calculations, comparing loan types, and simulating investment strategies.

## Features

- Single Loan Calculator: Calculate and visualize annuity, bullet, and modular loans
- Loan Comparison: Compare different loan types and their costs
- Investment Simulation: Simulate investing the difference in monthly payments

## Project Structure

- `/app`: Next.js app router structure
  - `/api`: API routes (mock implementation)
  - `/components`: React components for UI
  - `/services`: API service clients
  - `/types`: TypeScript type definitions
- `/python`: Python calculation functions (for future backend integration)
- `/_data`: Mock data for development

## Tech Stack

- **Frontend**: Next.js 15 with React 19, TypeScript, Tailwind CSS
- **Data Visualization**: Chart.js with react-chartjs-2
- **API**: Next.js API routes (mock implementation)
- **Future Backend**: Python FastAPI (not yet implemented)

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/loan-browser.git
   cd loan-browser
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Development

### Mock API

The current implementation uses mock API endpoints in `/app/api`. In a production environment, these would be connected to the Python backend.

### Python Integration

The Python calculation functions are available in the `/python` directory. These would be integrated as a FastAPI server in a production environment.

## License

This project is for educational purposes only.
