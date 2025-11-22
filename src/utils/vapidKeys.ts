import webpush from 'web-push';

/**
 * Generate VAPID keys for web push notifications
 * Run this file directly to generate new keys: ts-node src/utils/vapidKeys.ts
 */
export function generateVapidKeys() {
  const vapidKeys = webpush.generateVAPIDKeys();
  
  console.log('\n=== VAPID Keys Generated ===\n');
  console.log('Add these to your .env file:\n');
  console.log(`VAPID_PUBLIC_KEY=${vapidKeys.publicKey}`);
  console.log(`VAPID_PRIVATE_KEY=${vapidKeys.privateKey}`);
  console.log(`VAPID_SUBJECT=mailto:your_email@example.com\n`);
  
  return vapidKeys;
}

// Run this file directly to generate keys
if (require.main === module) {
  generateVapidKeys();
}
