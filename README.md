# LoanLogic

A comprehensive web application for visualizing and comparing different loan types, with investment simulation capabilities.

## Overview

LoanLogic is an interactive tool that helps users:

- Calculate and visualize annuity, bullet, and modular loans
- Compare different loan strategies side-by-side
- Simulate investment growth alongside loan repayments
- Visualize the impact of different strategies on net worth

## Features

- **Multiple Loan Types**:
  - Annuity loans (fixed monthly payments)
  - Bullet loans (interest-only with final balloon payment)
  - Modular loans (customizable payment schedule)

- **Comprehensive Visualizations**:
  - Loan balance over time
  - Payment breakdown (principal vs. interest vs. insurance)
  - Comparison charts for different loan strategies
  - Investment growth and net worth projections

- **Analysis Tools**:
  - Detailed amortization tables
  - Annual summary statistics
  - Loan cost comparisons
  - Minimum required investment growth calculations

- **Advanced Functionality**:
  - Real-time calculation updates
  - Multi-language support
  - Responsive design for all devices
  - Data export capabilities

## Project Structure

The application consists of:

- **Frontend**: NextJS application with TypeScript, Tailwind CSS, and Chart.js
- **Backend**: Python API with FastAPI for loan calculations
- **Loan Engine**: Sophisticated calculation functions for various loan types and investment simulations

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- Python (v3.9 or higher)
- npm or yarn
- pip

### Installation

1. Clone the repository
2. Set up the Python backend (see [Python README](python/README.md))
3. Install frontend dependencies with `npm install` or `yarn install`
4. Start development servers (see [Deployment Guide](DEPLOYMENT.md))

## Development

See the [Deployment Guide](DEPLOYMENT.md) for detailed instructions on setting up the development environment.

### Key Directories

- `app/`: NextJS frontend application
- `python/`: Backend API and calculation engine
- `python/api/`: FastAPI implementation
- `python/calculation_functions.py`: Core loan calculation functions
- `planning/`: Project planning documents and specifications

## Documentation

Refer to the following documents for more information:

- [Deployment Guide](DEPLOYMENT.md): Instructions for setting up and running the application
- [Python API Documentation](python/README.md): Details about the Python backend API
- [Planning Documentation](planning/LoanLogicPlan.md): Project overview and implementation plan
- [Technical Implementation](planning/TechnicalImplementation.md): Technical details and data flow
- [UI Mockups](planning/UIMockups.md): User interface design specifications

## License

This project is licensed under the MIT License - see the LICENSE file for details.
