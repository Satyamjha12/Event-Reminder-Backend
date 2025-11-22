/**
 * Helper script to get user ID by email
 * Usage: npx ts-node src/tests/getUserId.ts <email>
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User';

dotenv.config();

const getUserId = async (email: string) => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/event-reminder';
    await mongoose.connect(mongoUri);
    console.log('✓ Connected to database\n');

    const user = await User.findOne({ email });

    if (!user) {
      console.error(`❌ User not found with email: ${email}`);
      console.log('\nMake sure you have created an account with this email.');
      process.exit(1);
    }

    console.log('✓ User found!');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`  Email: ${user.email}`);
    console.log(`  User ID: ${user._id}`);
    console.log(`  Push Subscriptions: ${user.pushSubscriptions.length}`);
    console.log(`  Created: ${user.createdAt}`);
    console.log('═══════════════════════════════════════════════════════\n');

    if (user.pushSubscriptions.length === 0) {
      console.log('⚠️  Warning: This user has no push subscriptions.');
      console.log('   Please enable notifications in the Dashboard before running the test.\n');
    } else {
      console.log('✓ User has push subscriptions enabled.');
      console.log('\nYou can now run the notification test:');
      console.log(`  npx ts-node src/tests/notificationFlowTest.ts ${user._id}\n`);
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

const main = () => {
  const email = process.argv[2];

  if (!email) {
    console.error('❌ Error: Email is required\n');
    console.log('Usage: npx ts-node src/tests/getUserId.ts <email>\n');
    console.log('Example: npx ts-node src/tests/getUserId.ts user@example.com\n');
    process.exit(1);
  }

  getUserId(email);
};

main();
