import { Request, Response } from 'express';
import User, { IPushSubscription } from '../models/User';
import webpush, { vapidPublicKey } from '../config/webPush';
import notificationScheduler from '../services/notificationScheduler';

/**
 * Get VAPID public key for client-side subscription
 */
export const getPublicKey = async (_req: Request, res: Response) => {
  try {
    if (!vapidPublicKey) {
      return res.status(500).json({ 
        error: 'Push notifications not configured on server' 
      });
    }

    return res.json({ publicKey: vapidPublicKey });
  } catch (error) {
    console.error('Error getting public key:', error);
    return res.status(500).json({ error: 'Failed to get public key' });
  }
};

/**
 * Subscribe user to push notifications
 */
export const subscribe = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const subscription: IPushSubscription = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Validate subscription object
    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return res.status(400).json({ 
        error: 'Invalid subscription object' 
      });
    }

    // Find user and add subscription if not already present
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if subscription already exists
    const existingIndex = user.pushSubscriptions.findIndex(
      sub => sub.endpoint === subscription.endpoint
    );

    if (existingIndex >= 0) {
      // Update existing subscription
      user.pushSubscriptions[existingIndex] = subscription;
    } else {
      // Add new subscription
      user.pushSubscriptions.push(subscription);
    }

    await user.save();

    return res.status(201).json({ 
      message: 'Subscription saved successfully',
      subscriptionCount: user.pushSubscriptions.length
    });
  } catch (error) {
    console.error('Error saving subscription:', error);
    return res.status(500).json({ error: 'Failed to save subscription' });
  }
};

/**
 * Unsubscribe user from push notifications
 */
export const unsubscribe = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { endpoint } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!endpoint) {
      return res.status(400).json({ error: 'Endpoint is required' });
    }

    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Remove subscription with matching endpoint
    user.pushSubscriptions = user.pushSubscriptions.filter(
      sub => sub.endpoint !== endpoint
    );

    await user.save();

    return res.json({ 
      message: 'Unsubscribed successfully',
      subscriptionCount: user.pushSubscriptions.length
    });
  } catch (error) {
    console.error('Error unsubscribing:', error);
    return res.status(500).json({ error: 'Failed to unsubscribe' });
  }
};

/**
 * Send a test notification to user
 */
export const sendTestNotification = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await User.findById(userId);
    
    if (!user || user.pushSubscriptions.length === 0) {
      return res.status(404).json({ 
        error: 'No push subscriptions found for user' 
      });
    }

    const payload = JSON.stringify({
      title: 'Test Notification',
      body: 'This is a test notification from Event Reminder App',
      icon: '/vite.svg',
      badge: '/vite.svg',
      data: {
        url: '/dashboard'
      }
    });

    const results = await Promise.allSettled(
      user.pushSubscriptions.map(subscription =>
        webpush.sendNotification(subscription as any, payload)
      )
    );

    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    return res.json({ 
      message: 'Test notifications sent',
      successful,
      failed,
      total: user.pushSubscriptions.length
    });
  } catch (error) {
    console.error('Error sending test notification:', error);
    return res.status(500).json({ error: 'Failed to send test notification' });
  }
};

/**
 * Manually trigger notification scheduler check
 * Useful for testing the notification flow
 */
export const triggerSchedulerCheck = async (_req: Request, res: Response) => {
  try {
    console.log('Manual trigger of notification scheduler requested');
    await notificationScheduler.triggerCheck();
    
    return res.json({ 
      message: 'Notification scheduler check triggered successfully',
      note: 'Check server logs for details about notifications sent'
    });
  } catch (error) {
    console.error('Error triggering scheduler check:', error);
    return res.status(500).json({ error: 'Failed to trigger scheduler check' });
  }
};
