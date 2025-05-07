# LoanLogic Project Guide

## Project Structure
- NextJS 15 application with TypeScript and Tailwind CSS
- `/app`: Main Next.js app router directory
  - `/api`: API routes with mock implementations 
  - `/components`: UI components (charts, forms, tables, navigation)
  - `/i18n`: Internationalization setup
  - `/services`: Service modules for API communication
  - `/types`: TypeScript type definitions

## Key Type System
- Uses enum-based field references instead of string literals
- Key enums: `LoanType`, `LoanDataField`, `LoanStatisticsField`
- All data objects maintain both enum fields and legacy string-based fields for compatibility

## API Endpoints
- `/api/calculate-loan-dummy`: Calculates single loan scenarios
- `/api/compare-loans`: Compares loans and simulates investments
- API follows RESTful patterns and returns structured data per types

## Internationalization
- Supports English, Dutch, French, German, and Spanish
- Translations in `/app/i18n/locales/{lang}.json`
- Uses i18next with React hooks: `const { t, i18n } = useTranslation()`
- Language switcher component in the header

## Adding New Components
1. Create component in the appropriate `/components/` subdirectory
2. Use enum-based field references: `data[LoanDataField.MONTH]` instead of `data["Maand"]`
3. Add translations for all component text in all language files
4. Format currency with locale: `new Intl.NumberFormat(i18n.language, { style: 'currency', currency: 'EUR' })`

## Adding New Features
1. Define types in `/app/types/loan/`
2. Add API endpoints in `/app/api/` if needed
3. Create API service functions in `/app/services/`
4. Add necessary translations to all language files
5. Implement UI components

## Running the Project
- Development: `npm run dev`
- JSON Server: `npm run json-server` (serves mock data)