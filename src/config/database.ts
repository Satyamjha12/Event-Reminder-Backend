import mongoose from 'mongoose';

interface ConnectionOptions {
  maxRetries?: number;
  retryDelay?: number;
}

class DatabaseConnection {
  private maxRetries: number;
  private retryDelay: number;
  private retryCount: number = 0;

  constructor(options: ConnectionOptions = {}) {
    this.maxRetries = options.maxRetries || 5;
    this.retryDelay = options.retryDelay || 5000;
  }

  async connect(): Promise<void> {
    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
      throw new Error('MONGODB_URI environment variable is not defined');
    }

    await this.connectWithRetry(mongoUri);
  }

  private async connectWithRetry(uri: string): Promise<void> {
    try {
      await mongoose.connect(uri);
      console.log('✅ MongoDB connected successfully');
      this.retryCount = 0;

      // Handle connection events
      mongoose.connection.on('error', (error) => {
        console.error('❌ MongoDB connection error:', error);
      });

      mongoose.connection.on('disconnected', () => {
        console.warn('⚠️  MongoDB disconnected. Attempting to reconnect...');
        this.handleDisconnection(uri);
      });

      mongoose.connection.on('reconnected', () => {
        console.log('✅ MongoDB reconnected successfully');
      });

    } catch (error) {
      this.retryCount++;
      console.error(
        `❌ MongoDB connection failed (attempt ${this.retryCount}/${this.maxRetries}):`,
        error instanceof Error ? error.message : error
      );

      if (this.retryCount < this.maxRetries) {
        console.log(`⏳ Retrying in ${this.retryDelay / 1000} seconds...`);
        await this.delay(this.retryDelay);
        return this.connectWithRetry(uri);
      } else {
        throw new Error(
          `Failed to connect to MongoDB after ${this.maxRetries} attempts`
        );
      }
    }
  }

  private async handleDisconnection(uri: string): Promise<void> {
    if (this.retryCount < this.maxRetries) {
      await this.delay(this.retryDelay);
      await this.connectWithRetry(uri);
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async disconnect(): Promise<void> {
    try {
      await mongoose.disconnect();
      console.log('MongoDB disconnected');
    } catch (error) {
      console.error('Error disconnecting from MongoDB:', error);
      throw error;
    }
  }

  isConnected(): boolean {
    return mongoose.connection.readyState === 1;
  }
}

export const dbConnection = new DatabaseConnection();
export default dbConnection;
