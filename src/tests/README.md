# End-to-End Notification Flow Test

This directory contains tests for the notification system.

## Test: Notification Flow (Task 12.4)

**Requirements:** 6.2, 6.3, 6.5

### What This Test Verifies

1. **Create test event 30 minutes in future** - Verifies that events can be created with the correct timing
2. **Verify notification is received** - Confirms that the notification scheduler sends push notifications
3. **Verify notification click opens Dashboard** - Ensures the service worker handles notification clicks correctly

### Running the Test

#### Prerequisites

1. Backend server must be running (`npm run dev` in backend folder)
2. Frontend must be running (`npm run dev` in frontend folder)
3. You must have a user account created
4. Push notifications must be enabled in the browser

#### Steps

1. **Get your User ID:**
   ```bash
   # Option 1: Check MongoDB directly
   # Connect to your MongoDB and find your user document
   
   # Option 2: Add a console.log in the frontend after login
   # In AuthContext.tsx, log the user ID after successful login
   ```

2. **Run the test:**
   ```bash
   cd backend
   npx ts-node src/tests/notificationFlowTest.ts <your-user-id>
   ```

3. **Verify the results:**
   - The script will create a test event 30 minutes in the future
   - It will trigger the notification scheduler
   - Check your browser for the push notification
   - Click the notification and verify it opens the Dashboard

### Expected Output

```
═══════════════════════════════════════════════════════
  End-to-End Notification Flow Test
  Requirements: 6.2, 6.3, 6.5
═══════════════════════════════════════════════════════

✓ Connected to database

📝 Test 1: Creating test event 30 minutes in future...
✓ Test event created successfully
  Event ID: 507f1f77bcf86cd799439011
  Title: E2E Test Event - Notification Flow
  Date: 2024-01-15T10:30:00.000Z
  Status: upcoming
  User has 1 push subscription(s)

🔔 Test 2: Triggering notification scheduler...
  Note: The scheduler checks for events 25-35 minutes in the future
  Waiting for notification to be sent...

✓ Notification sent successfully
  Event "E2E Test Event - Notification Flow" marked as notified

✓ Test 2 Passed: Notification sent and event marked as notified

👆 Test 3: Verify notification click opens Dashboard
  This is a manual verification step:
  1. Check your browser for the notification
  2. Click on the notification
  3. Verify that the Dashboard page opens
  4. Verify that the notification closes after clicking

═══════════════════════════════════════════════════════
  Test Summary
═══════════════════════════════════════════════════════
  Test 1 (Create Event): ✓ PASSED
  Test 2 (Send Notification): ✓ PASSED
  Test 3 (Click Behavior): ⚠️  MANUAL VERIFICATION REQUIRED
═══════════════════════════════════════════════════════
```

### Troubleshooting

**"User has no push subscriptions"**
- Make sure you've enabled notifications in the frontend Dashboard
- Check that the service worker is registered
- Verify notification permissions are granted in your browser

**"Event not marked as notified"**
- The event might be outside the 25-35 minute notification window
- Check the backend logs for any errors
- Verify the notification scheduler is running

**"No notification received in browser"**
- Check browser notification permissions
- Verify the service worker is active (check DevTools > Application > Service Workers)
- Check browser console for any errors
- Some browsers block notifications in incognito/private mode

### Manual Testing Alternative

If you prefer to test manually without the script:

1. **Create an event:**
   - Log in to the application
   - Go to Dashboard
   - Create a new event with a time 30 minutes from now
   - Enable push notifications when prompted

2. **Wait for notification:**
   - The notification scheduler runs every 5 minutes
   - You should receive a notification when the event is 25-35 minutes away
   - Or wait for the next scheduler run (max 5 minutes)

3. **Test notification click:**
   - When you receive the notification, click on it
   - Verify that the Dashboard opens
   - Verify that the notification closes

### Service Worker Verification

The notification click behavior is handled by the service worker at `frontend/public/sw.js`.

Key behaviors:
- Notification closes when clicked
- Dashboard page opens or gets focus
- If Dashboard is already open, it gets focused instead of opening a new tab

You can verify the service worker is working by:
1. Open DevTools > Application > Service Workers
2. Check that the service worker is "activated and running"
3. Check the Console for service worker logs when notifications arrive
