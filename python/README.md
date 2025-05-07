# LoanLogic Python API

This directory contains the Python backend API for the LoanLogic application. The API is built using FastAPI and provides endpoints for loan calculations and comparisons.

## Setup

1. Create a virtual environment:

```bash
python -m venv venv
```

2. Activate the virtual environment:

   **Windows**:
   ```bash
   venv\Scripts\activate
   ```

   **Unix/MacOS**:
   ```bash
   source venv/bin/activate
   ```

3. Install the required packages:

```bash
pip install -r requirements.txt
```

## Running the API

To start the API server, run:

```bash
python run_api.py
```

This will start the FastAPI server on port 8000 with automatic reload enabled.

Alternatively, you can use uvicorn directly:

```bash
uvicorn api.main:app --reload --host 0.0.0.0 --port 8000
```

## API Documentation

Once the API is running, you can access the auto-generated API documentation at:

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## API Endpoints

### Calculate Loan

```
POST /api/calculate-loan
```

Calculates a single loan based on the provided parameters. Supports annuity, bullet, and modular loans.

### Compare Loans

```
POST /api/compare-loans
```

Compares two loans with optional investment simulation.

## Development

The main API code is located in `api/main.py`. It uses the loan calculation functions from `calculation_functions.py`.

To add new endpoints or modify existing ones, edit the `api/main.py` file. The API uses Pydantic for data validation and FastAPI for routing.
