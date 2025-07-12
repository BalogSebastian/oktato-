// Fájl: lib/models/User.model.ts

import { Schema, model, models } from 'mongoose';
import { IUser } from '@/lib/types';

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: false, select: false },
  role: {
    type: String,
    enum: ['SUPER_ADMIN', 'CLIENT_ADMIN', 'USER'],
    required: true,
  },
  client: { type: Schema.Types.ObjectId, ref: 'Client' },
  createdAt: { type: Date, default: Date.now },
  // ÚJ MEZŐK A SÉMÁBAN:
  passwordResetToken: { type: String, select: false },
  passwordResetExpires: { type: Date, select: false },
});

const User = models.User || model<IUser>('User', UserSchema);

export default User;