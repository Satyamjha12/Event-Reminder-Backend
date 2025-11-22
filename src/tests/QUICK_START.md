# Quick Start: Notification Flow Test

## 🚀 Quick Test (3 Steps)

### 1. Get Your User ID
```bash
npx ts-node src/tests/getUserId.ts your-email@example.com
```

### 2. Run the Test
```bash
npx ts-node src/tests/notificationFlowTest.ts <your-user-id>
```

### 3. Verify in Browser
- Check for notification
- Click it
- Confirm Dashboard opens

## ✅ What Gets Tested

- ✅ Create event 30 minutes in future (Requirement 6.2)
- ✅ Notification is sent (Requirement 6.2, 6.3)
- ✅ Notification click opens Dashboard (Requirement 6.5)

## 📋 Prerequisites

- Backend running: `npm run dev`
- Frontend running: `npm run dev`
- User account created
- Notifications enabled in browser

## 🔧 Alternative: Manual Test via API

### Send Test Notification
```bash
curl -X POST http://localhost:5000/api/notifications/test \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Trigger Scheduler Check
```bash
curl -X POST http://localhost:5000/api/notifications/trigger-check \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 📖 Full Documentation

See `NOTIFICATION_TEST_GUIDE.md` in the root directory for complete instructions.
