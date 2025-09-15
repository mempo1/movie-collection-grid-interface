import mongoose, { Document, Schema } from 'mongoose';

export interface IPayment extends Document {
  user?: mongoose.Types.ObjectId;
  email?: string;
  amount: number; // в центах
  currency: string;
  status: 'created' | 'succeeded' | 'failed' | 'canceled';
  sessionId: string;
  paymentIntentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  email: {
    type: String,
    required: false,
    trim: true,
    lowercase: true
  },
  amount: {
    type: Number,
    required: true,
    min: [50, 'Minimum amount is 50 cents'] // минимум 50 центов
  },
  currency: {
    type: String,
    required: true,
    default: 'usd',
    lowercase: true
  },
  status: {
    type: String,
    enum: ['created', 'succeeded', 'failed', 'canceled'],
    default: 'created',
    required: true
  },
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  paymentIntentId: {
    type: String,
    required: false
  }
}, {
  timestamps: true
});

// Индексы
PaymentSchema.index({ sessionId: 1 }, { unique: true });
PaymentSchema.index({ createdAt: -1 }); // сортировка по убыванию даты
PaymentSchema.index({ status: 1 });
PaymentSchema.index({ user: 1 });

export default mongoose.models.Payment || mongoose.model<IPayment>('Payment', PaymentSchema);
