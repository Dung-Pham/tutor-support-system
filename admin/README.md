# Admin Dashboard

Admin dashboard cho hệ thống Tutor Support System.

## Setup

```bash
# Install dependencies
npm install

# Start development server (port 3001)
npm run dev

# Build for production
npm run build
```

## Features

- **Dashboard Overview**: System statistics and metrics
- **User Management**: Manage students and general users
- **Tutor Management**: Approve tutors, manage profiles
- **Class Management**: Monitor classes and handle issues

## Tech Stack

- React 18 + TypeScript
- Vite
- TailwindCSS
- React Router v6
- Redux Toolkit
- React Query

## Development

Admin app runs on port 3001 to avoid conflicts with main frontend (port 3000).

API calls point to the same backend server as the main frontend app.
