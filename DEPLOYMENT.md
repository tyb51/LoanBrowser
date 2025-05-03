# Loan Browser Deployment Guide

This guide provides instructions for setting up and running the Loan Browser application, including both the NextJS frontend and Python backend API.

## Project Structure

The Loan Browser application consists of two main components:

- **Frontend**: NextJS application with Chart.js for visualizations
- **Backend**: Python API built with FastAPI for loan calculations

## Prerequisites

- Node.js (v18 or higher)
- Python (v3.9 or higher)
- npm or yarn
- pip

## Backend Setup (Python API)

### 1. Navigate to the Python directory

```bash
cd T:\Development\LoanBrowser\python
```

### 2. Create a virtual environment

```bash
python -m venv venv
```

### 3. Activate the virtual environment

**On Windows**:
```bash
venv\Scripts\activate
```

**On Unix/MacOS**:
```bash
source venv/bin/activate
```

### 4. Install required packages

```bash
pip install -r requirements.txt
```

### 5. Start the API server

```bash
python run_api.py
```

The API server will start on http://localhost:8000. You can access the API documentation at http://localhost:8000/docs.

## Frontend Setup (NextJS)

### 1. Navigate to the project root directory

```bash
cd T:\Development\LoanBrowser
```

### 2. Install dependencies

```bash
npm install
# or
yarn install
```

### 3. Start the development server

```bash
npm run dev
# or
yarn dev
```

The frontend will be available at http://localhost:3000.

## Testing the API Connection

1. Start both the backend API server and the frontend development server as described above.
2. In your browser, navigate to http://localhost:3000/api-test
3. Use the test buttons to verify that the frontend can successfully communicate with the backend API.

## Production Deployment

### Backend (Python API)

For production deployment of the Python API, you can use various methods:

1. **Containerization with Docker**:
   - Create a Dockerfile in the python directory
   - Build and deploy as a container on your preferred hosting platform

2. **WSGI Server**:
   - Use a production WSGI server like Gunicorn
   - Example: `gunicorn api.main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000`

3. **Cloud Platforms**:
   - Deploy on cloud platforms like Heroku, AWS, Google Cloud, or Azure
   - Follow the platform-specific instructions for Python/FastAPI applications

### Frontend (NextJS)

For production deployment of the NextJS frontend:

1. **Build the application**:
   ```bash
   npm run build
   # or
   yarn build
   ```

2. **Start the production server**:
   ```bash
   npm start
   # or
   yarn start
   ```

3. **Alternatively**, deploy to platforms like Vercel, Netlify, or AWS Amplify which offer specialized NextJS support.

## API Configuration

### CORS Configuration

By default, the API allows requests from `http://localhost:3000`. If you deploy the frontend to a different URL, you'll need to update the CORS settings in `python/api/main.py`:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://your-production-url.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### API Base URL

If you deploy the API to a different URL, you'll need to update the `API_BASE_URL` in `app/services/backendLoanApi.ts`:

```typescript
const API_BASE_URL = 'https://your-api-url.com/api';
```

## Security Considerations

- In a production environment, consider adding authentication to the API
- Implement rate limiting for API endpoints to prevent abuse
- Use HTTPS for all communications between frontend and backend
- Set up proper error logging and monitoring
