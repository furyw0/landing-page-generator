import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  openaiApiKey?: string;
  selectedModel: 'gpt-4o-mini' | 'gpt-4o' | 'gpt-4-turbo' | 'gpt-3.5-turbo';
  createdAt: Date;
  updatedAt: Date;
  role: string;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
    },
    openaiApiKey: {
      type: String,
      required: false,
    },
    selectedModel: {
      type: String,
      enum: ['gpt-4o-mini', 'gpt-4o', 'gpt-4-turbo', 'gpt-3.5-turbo'],
      default: 'gpt-4o-mini',
    },
    role: {
      type: String,
      default: 'user',
    },
  },
  {
    timestamps: true,
  }
);

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;

