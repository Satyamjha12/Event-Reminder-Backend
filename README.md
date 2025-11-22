# Event Reminder Application

A full-stack web application for creating, managing, and receiving notifications for events.

## Project Structure

```
.
├── backend/          # Node.js + Express + TypeScript backend
├── frontend/         # React + TypeScript + Vite frontend
└── README.md         # This file
```

## Technology Stack

### Frontend
- React 18 with TypeScript
- Vite for build tooling
- React Router for navigation
- Framer Motion for animations
- Tailwind CSS for styling
- Axios for API calls

### Backend
- Node.js with Express
- TypeScript
- MongoDB with Mongoose
- JWT for authentication
- web-push for push notifications

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies (already done):
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Configure your environment variables in `.env`

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Build for production:
   ```bash
   npm run build
   npm start
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies (already done):
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Configure your environment variables in `.env`

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Build for production:
   ```bash
   npm run build
   ```

## Development

- Backend runs on `http://localhost:5000` by default
- Frontend runs on `http://localhost:5173` by default
- Both projects support hot-reload during development

## API Documentation

API endpoints will be documented as they are implemented. The backend includes a health check endpoint:

```
GET /health - Returns API status
```

## Features

- ✅ User authentication (signup/login)
- ✅ Event creation and management
- ✅ Event status tracking (upcoming/completed)
- ✅ Push notifications for upcoming events
- ✅ Dashboard with event statistics
- ✅ Animated UI with Framer Motion
- ✅ Responsive design with Tailwind CSS

## Testing

### End-to-End Notification Flow Test

The application includes comprehensive testing for the notification system. See the [Notification Test Guide](NOTIFICATION_TEST_GUIDE.md) for detailed instructions.

**Quick Test:**
```bash
cd backend
npx ts-node src/tests/getUserId.ts your-email@example.com
npx ts-node src/tests/notificationFlowTest.ts <your-user-id>
```

This tests:
- Creating events 30 minutes in the future
- Sending push notifications at the right time
- Notification click behavior (opens Dashboard)



