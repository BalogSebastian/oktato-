// lib/models/Setting.model.ts
import { Schema, model, models } from 'mongoose';
import { ISetting } from '@/lib/types';

const SettingSchema = new Schema<ISetting>({
  key: { type: String, required: true, unique: true },
  value: { type: Schema.Types.Mixed, required: true }, // Mixed típus, bármilyen értéket tárolhat
  description: { type: String },
  type: { type: String, enum: ['string', 'number', 'boolean', 'json'], required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, {
  timestamps: true // Automatikusan kezeli a createdAt és updatedAt mezőket
});

const Setting = models.Setting || model<ISetting>('Setting', SettingSchema);

export default Setting;