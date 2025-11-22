import Event from '../models/Event';
import User from '../models/User';
import webpush from '../config/webPush';

/**
 * Notification scheduler service
 * Checks for upcoming events and sends push notifications
 */
class NotificationScheduler {
  private intervalId: NodeJS.Timeout | null = null;
  private readonly CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes
  private readonly NOTIFICATION_WINDOW_START = 25; // minutes
  private readonly NOTIFICATION_WINDOW_END = 35; // minutes

  /**
   * Start the notification scheduler
   */
  start() {
    if (this.intervalId) {
      console.log('⚠️  Notification scheduler already running');
      return;
    }

    console.log('✓ Starting notification scheduler...');
    console.log(`  Checking every ${this.CHECK_INTERVAL / 60000} minutes`);
    console.log(`  Notification window: ${this.NOTIFICATION_WINDOW_START}-${this.NOTIFICATION_WINDOW_END} minutes before event`);

    // Run immediately on start
    this.checkAndSendNotifications();

    // Then run every CHECK_INTERVAL
    this.intervalId = setInterval(() => {
      this.checkAndSendNotifications();
    }, this.CHECK_INTERVAL);
  }

  /**
   * Stop the notification scheduler
   */
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('✓ Notification scheduler stopped');
    }
  }

  /**
   * Check for upcoming events and send notifications
   */
  private async checkAndSendNotifications() {
    try {
      const now = new Date();
      const windowStart = new Date(now.getTime() + this.NOTIFICATION_WINDOW_START * 60000);
      const windowEnd = new Date(now.getTime() + this.NOTIFICATION_WINDOW_END * 60000);

      console.log(`\n[${now.toISOString()}] Checking for events between ${windowStart.toISOString()} and ${windowEnd.toISOString()}`);

      // Find events that:
      // 1. Start within the notification window
      // 2. Haven't had notifications sent yet
      // 3. Are still in 'upcoming' status
      const events = await Event.find({
        date: {
          $gte: windowStart,
          $lte: windowEnd,
        },
        notificationSent: false,
        status: 'upcoming',
      }).populate('userId');

      if (events.length === 0) {
        console.log('  No events requiring notifications');
        return;
      }

      console.log(`  Found ${events.length} event(s) requiring notifications`);

      for (const event of events) {
        await this.sendEventNotification(event);
      }
    } catch (error) {
      console.error('Error in notification scheduler:', error);
    }
  }

  /**
   * Send notification for a specific event
   */
  private async sendEventNotification(event: any) {
    try {
      const user = await User.findById(event.userId);

      if (!user || user.pushSubscriptions.length === 0) {
        console.log(`  No subscriptions for event: ${event.title}`);
        // Mark as sent even if no subscriptions to avoid repeated checks
        event.notificationSent = true;
        await event.save();
        return;
      }

      const eventTime = new Date(event.date);
      const minutesUntil = Math.round((eventTime.getTime() - Date.now()) / 60000);

      const payload = JSON.stringify({
        title: '🔔 Event Reminder',
        body: `"${event.title}" starts in ${minutesUntil} minutes!`,
        icon: event.imageUrl || '/vite.svg',
        badge: '/vite.svg',
        data: {
          eventId: event._id.toString(),
          url: '/dashboard',
        },
        tag: `event-${event._id}`,
        requireInteraction: true,
      });

      console.log(`  Sending notifications for: ${event.title}`);

      // Send to all user subscriptions
      const results = await Promise.allSettled(
        user.pushSubscriptions.map(async (subscription, index) => {
          try {
            await webpush.sendNotification(subscription as any, payload);
            console.log(`    ✓ Sent to subscription ${index + 1}`);
          } catch (error: any) {
            console.error(`    ✗ Failed to send to subscription ${index + 1}:`, error.message);
            
            // Remove invalid subscriptions (410 Gone or 404 Not Found)
            if (error.statusCode === 410 || error.statusCode === 404) {
              console.log(`    Removing invalid subscription ${index + 1}`);
              user.pushSubscriptions.splice(index, 1);
              await user.save();
            }
            
            throw error;
          }
        })
      );

      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;

      console.log(`  Results: ${successful} successful, ${failed} failed`);

      // Mark notification as sent
      event.notificationSent = true;
      await event.save();
      console.log(`  ✓ Marked event as notified: ${event.title}`);
    } catch (error) {
      console.error(`Error sending notification for event ${event.title}:`, error);
    }
  }

  /**
   * Manually trigger notification check (useful for testing)
   */
  async triggerCheck() {
    console.log('Manually triggering notification check...');
    await this.checkAndSendNotifications();
  }
}

// Export singleton instance
export default new NotificationScheduler();
