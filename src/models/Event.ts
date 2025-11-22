import mongoose, { Schema, Document, Types } from 'mongoose';

// Event status enum
export enum EventStatus {
  UPCOMING = 'upcoming',
  COMPLETED = 'completed',
}

// Event document interface
export interface IEvent extends Document {
  userId: Types.ObjectId;
  title: string;
  date: Date;
  imageUrl?: string;
  status: EventStatus;
  notificationSent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Event schema
const eventSchema = new Schema<IEvent>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
      minlength: [1, 'Event title cannot be empty'],
      maxlength: [200, 'Event title cannot exceed 200 characters'],
    },
    date: {
      type: Date,
      required: [true, 'Event date is required'],
      index: true,
    },
    imageUrl: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: Object.values(EventStatus),
      default: EventStatus.UPCOMING,
      index: true,
    },
    notificationSent: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for efficient queries
eventSchema.index({ userId: 1, date: -1 });
eventSchema.index({ userId: 1, status: 1 });
eventSchema.index({ status: 1, notificationSent: 1, date: 1 });

// Virtual for checking if event is upcoming
eventSchema.virtual('isUpcoming').get(function(this: IEvent) {
  return this.status === EventStatus.UPCOMING && this.date > new Date();
});

// Instance method to check if notification should be sent
eventSchema.methods.shouldSendNotification = function(this: IEvent): boolean {
  if (this.notificationSent || this.status !== EventStatus.UPCOMING) {
    return false;
  }

  const now = new Date();
  const eventTime = new Date(this.date);
  const timeDiff = eventTime.getTime() - now.getTime();
  const minutesDiff = timeDiff / (1000 * 60);

  // Send notification if event is between 25-35 minutes away
  return minutesDiff >= 25 && minutesDiff <= 35;
};

const Event = mongoose.model<IEvent>('Event', eventSchema);

export default Event;
