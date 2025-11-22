import mongoose, { Schema, Document } from 'mongoose';

// Push subscription interface
export interface IPushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

// User document interface
export interface IUser extends Document {
  email: string;
  passwordHash: string;
  firebaseUid?: string;
  pushSubscriptions: IPushSubscription[];
  createdAt: Date;
  updatedAt: Date;
}

// Push subscription schema
const pushSubscriptionSchema = new Schema<IPushSubscription>(
  {
    endpoint: {
      type: String,
      required: true,
    },
    keys: {
      p256dh: {
        type: String,
        required: true,
      },
      auth: {
        type: String,
        required: true,
      },
    },
  },
  { _id: false }
);

// User schema
const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: function(this: IUser) {
        // Password hash is required only if firebaseUid is not present
        return !this.firebaseUid;
      },
    },
    firebaseUid: {
      type: String,
      sparse: true,
      unique: true,
      index: true,
    },
    pushSubscriptions: {
      type: [pushSubscriptionSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
userSchema.index({ email: 1 });
userSchema.index({ firebaseUid: 1 }, { sparse: true });

// Instance methods can be added here if needed
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.passwordHash;
  return user;
};

const User = mongoose.model<IUser>('User', userSchema);

export default User;
