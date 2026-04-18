# Expense Tracker Dashboard

A React-based expense tracking dashboard designed to demonstrate scalable state management, data visualization, and complex UI workflows.

## Features

- Full CRUD operations for transactions (income, expense, and investment)
- Overview dashboard with totals for balance, income, expense, and investment
- Category-wise expense insights with charts (via Recharts)
- Budget planning by category with usage tracking
- Advanced filtering (text, category, amount, date range)
- Export filtered transactions to CSV
- Light and dark mode toggle
- Client-side state persistence using Zustand and localStorage

## Key Highlights

- Implemented scalable global state using Zustand with persistence
- Designed modular component architecture for multi-page dashboard
- Integrated data visualization using Recharts for actionable insights
- Built advanced filtering and export functionality (CSV)

## Future Improvements

- Backend integration for multi-device sync
- Authentication and user-specific data
- Performance optimizations for large datasets

## Tech Stack

- React 18
- React Router DOM (multi-page dashboard routes)
- Zustand (state management + persistence)
- Tailwind CSS (UI styling)
- Recharts (visual insights)
- React Testing Library + Jest (tests)

## Project Pages

- `/` - Overview
- `/transactions` - Transaction management and filters
- `/budgets` - Budget setup and category usage

## Getting Started

### Prerequisites

- Node.js 18+ recommended
- npm

### Install

```bash
npm install
```

### Run Development Server

```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Scripts

- `npm start` - Start the app in development mode
- `npm test` - Run tests in watch mode
- `npm run build` - Create an optimized production build

## Project Structure

```text
src/
  components/        # Reusable UI components (forms, lists, charts, navbar)
  constants/         # Shared constants like categories
  context/           # Expense data context provider
  hooks/             # Custom hooks (expense logic)
  screens/           # Route-level screens and dashboard pages
  store/             # Zustand store and persistence setup
  tests/             # App tests and test setup
  utils/             # Utility helpers (currency/date formatting)
```

## Notes

- App data is stored in browser localStorage (`expense-tracker-store`).
- On first load, the app hydrates persisted state before rendering dashboard pages.
