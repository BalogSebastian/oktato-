import { Schema, model, models } from 'mongoose';
import { IClient } from '@/lib/types'; // <-- Importálás a központi fájlból

const ClientSchema = new Schema<IClient>({
  name: { type: String, required: true },
  adminUser: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  subscribedCourses: [{ type: Schema.Types.ObjectId, ref: 'Course' }],
  licenseCount: { type: Number, required: true, default: 1 },
  createdAt: { type: Date, default: Date.now },
});

const Client = models.Client || model<IClient>('Client', ClientSchema);

export default Client;