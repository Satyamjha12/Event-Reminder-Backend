/**
 * End-to-End Notification Flow Test
 * Requirements: 6.2, 6.3, 6.5
 * 
 * This script tests the complete notification flow:
 * 1. Creates a test event 30 minutes in the future
 * 2. Triggers the notification scheduler
 * 3. Verifies notification is sent
 * 
 * To run this test:
 * 1. Ensure the backend server is running
 * 2. Ensure you have a user account with push notifications enabled
 * 3. Run: npx ts-node src/tests/notificationFlowTest.ts <userId>
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Event from '../models/Event';
import User from '../models/User';
import notificationScheduler from '../services/notificationScheduler';

dotenv.config();

interface TestResult {
  success: boolean;
  message: string;
  details?: any;
}

class NotificationFlowTest {
  private testEventId: string | null = null;

  /**
   * Connect to database
   */
  async connect(): Promise<void> {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/event-reminder';
    await mongoose.connect(mongoUri);
    console.log('✓ Connected to database');
  }

  /**
   * Disconnect from database
   */
  async disconnect(): Promise<void> {
    await mongoose.disconnect();
    console.log('✓ Disconnected from database');
  }

  /**
   * Test 1: Create a test event 30 minutes in the future
   */
  async createTestEvent(userId: string): Promise<TestResult> {
    try {
      console.log('\n📝 Test 1: Creating test event 30 minutes in future...');

      // Verify user exists
      const user = await User.findById(userId);
      if (!user) {
        return {
          success: false,
          message: 'User not found',
          details: { userId }
        };
      }

      // Check if user has push subscriptions
      if (user.pushSubscriptions.length === 0) {
        return {
          success: false,
          message: 'User has no push subscriptions. Please enable notifications in the frontend first.',
          details: { userId, subscriptionCount: 0 }
        };
      }

      // Create event 30 minutes in the future
      const eventDate = new Date(Date.now() + 30 * 60 * 1000);
      
      const event = await Event.create({
        userId,
        title: 'E2E Test Event - Notification Flow',
        date: eventDate,
        status: 'upcoming',
        notificationSent: false,
        imageUrl: '/vite.svg'
      });

      this.testEventId = event._id.toString();

      console.log('✓ Test event created successfully');
      console.log(`  Event ID: ${event._id}`);
      console.log(`  Title: ${event.title}`);
      console.log(`  Date: ${event.date.toISOString()}`);
      console.log(`  Status: ${event.status}`);
      console.log(`  User has ${user.pushSubscriptions.length} push subscription(s)`);

      return {
        success: true,
        message: 'Test event created successfully',
        details: {
          eventId: event._id,
          title: event.title,
          date: event.date,
          subscriptionCount: user.pushSubscriptions.length
        }
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'Failed to create test event',
        details: { error: error.message }
      };
    }
  }

  /**
   * Test 2: Trigger notification scheduler and verify notification is sent
   */
  async triggerNotificationScheduler(): Promise<TestResult> {
    try {
      console.log('\n🔔 Test 2: Triggering notification scheduler...');
      console.log('  Note: The scheduler checks for events 25-35 minutes in the future');
      console.log('  Waiting for notification to be sent...\n');

      // Trigger the notification check
      await notificationScheduler.triggerCheck();

      // Wait a moment for the notification to be processed
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Verify the event was updated
      if (!this.testEventId) {
        return {
          success: false,
          message: 'No test event ID available'
        };
      }

      const event = await Event.findById(this.testEventId);
      
      if (!event) {
        return {
          success: false,
          message: 'Test event not found after notification attempt'
        };
      }

      if (event.notificationSent) {
        console.log('✓ Notification sent successfully');
        console.log(`  Event "${event.title}" marked as notified`);
        
        return {
          success: true,
          message: 'Notification sent and event marked as notified',
          details: {
            eventId: event._id,
            notificationSent: event.notificationSent
          }
        };
      } else {
        console.log('⚠️  Event not marked as notified');
        console.log('  This could mean:');
        console.log('  - The event is outside the 25-35 minute notification window');
        console.log('  - The user has no valid push subscriptions');
        console.log('  - There was an error sending the notification');
        
        return {
          success: false,
          message: 'Event not marked as notified',
          details: {
            eventId: event._id,
            notificationSent: event.notificationSent,
            eventDate: event.date,
            now: new Date()
          }
        };
      }
    } catch (error: any) {
      return {
        success: false,
        message: 'Failed to trigger notification scheduler',
        details: { error: error.message }
      };
    }
  }

  /**
   * Test 3: Verify notification click behavior (manual verification)
   */
  verifyNotificationClick(): TestResult {
    console.log('\n👆 Test 3: Verify notification click opens Dashboard');
    console.log('  This is a manual verification step:');
    console.log('  1. Check your browser for the notification');
    console.log('  2. Click on the notification');
    console.log('  3. Verify that the Dashboard page opens');
    console.log('  4. Verify that the notification closes after clicking');
    console.log('\n  The service worker (frontend/public/sw.js) handles this behavior.');
    console.log('  It should open /dashboard when the notification is clicked.');

    return {
      success: true,
      message: 'Manual verification required - check browser notification',
      details: {
        expectedBehavior: 'Clicking notification should open Dashboard',
        serviceWorkerPath: 'frontend/public/sw.js'
      }
    };
  }

  /**
   * Cleanup: Remove test event
   */
  async cleanup(): Promise<void> {
    if (this.testEventId) {
      console.log('\n🧹 Cleaning up test event...');
      await Event.findByIdAndDelete(this.testEventId);
      console.log('✓ Test event removed');
    }
  }

  /**
   * Run all tests
   */
  async runTests(userId: string): Promise<void> {
    console.log('═══════════════════════════════════════════════════════');
    console.log('  End-to-End Notification Flow Test');
    console.log('  Requirements: 6.2, 6.3, 6.5');
    console.log('═══════════════════════════════════════════════════════');

    try {
      await this.connect();

      // Test 1: Create test event
      const createResult = await this.createTestEvent(userId);
      if (!createResult.success) {
        console.error('\n❌ Test 1 Failed:', createResult.message);
        console.error('   Details:', createResult.details);
        return;
      }

      // Test 2: Trigger notification
      const notificationResult = await this.triggerNotificationScheduler();
      if (!notificationResult.success) {
        console.error('\n❌ Test 2 Failed:', notificationResult.message);
        console.error('   Details:', notificationResult.details);
      } else {
        console.log('\n✓ Test 2 Passed:', notificationResult.message);
      }

      // Test 3: Manual verification
      const clickResult = this.verifyNotificationClick();
      console.log('\n⚠️  Test 3:', clickResult.message);

      console.log('\n═══════════════════════════════════════════════════════');
      console.log('  Test Summary');
      console.log('═══════════════════════════════════════════════════════');
      console.log(`  Test 1 (Create Event): ${createResult.success ? '✓ PASSED' : '❌ FAILED'}`);
      console.log(`  Test 2 (Send Notification): ${notificationResult.success ? '✓ PASSED' : '❌ FAILED'}`);
      console.log(`  Test 3 (Click Behavior): ⚠️  MANUAL VERIFICATION REQUIRED`);
      console.log('═══════════════════════════════════════════════════════\n');

      // Cleanup
      await this.cleanup();

    } catch (error: any) {
      console.error('\n❌ Test execution failed:', error.message);
      console.error(error);
    } finally {
      await this.disconnect();
    }
  }
}

// Main execution
const main = async () => {
  const userId = process.argv[2];

  if (!userId) {
    console.error('❌ Error: User ID is required');
    console.log('\nUsage: npx ts-node src/tests/notificationFlowTest.ts <userId>');
    console.log('\nTo get a user ID:');
    console.log('  1. Sign up or log in to the application');
    console.log('  2. Enable push notifications in the Dashboard');
    console.log('  3. Check the MongoDB database for your user ID');
    console.log('  4. Or use the /api/auth/verify endpoint to get your user ID\n');
    process.exit(1);
  }

  const test = new NotificationFlowTest();
  await test.runTests(userId);
  process.exit(0);
};

main();
