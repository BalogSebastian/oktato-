// lib/models/Payment.model.ts
import { Schema, model, models } from 'mongoose';
import { IPayment } from '@/lib/types';

const PaymentSchema = new Schema<IPayment>({
  client: { type: Schema.Types.ObjectId, ref: 'Client', required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  licensesAdded: { type: Number, required: true },
  packageType: {
    type: String,
    enum: ['5_LICENSES', '10_LICENSES', '15_LICENSES', '20_LICENSES', 'CUSTOM'],
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'completed', // Egyszerűsítve, alapból sikeresnek vesszük
    required: true,
  },
  transactionId: { type: String, required: false },
  createdAt: { type: Date, default: Date.now },
});

const Payment = models.Payment || model<IPayment>('Payment', PaymentSchema);

export default Payment;