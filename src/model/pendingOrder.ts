import mongoose, { Schema, Document } from 'mongoose';

export interface IPendingOrder extends Document {
  partNumber: string;
  modelName: string; // Renamed to avoid conflict with Document.model
  location: string;
  quantity: number;
  orderDate: Date;
  status: 'pending' | 'arrived';
}

const PendingOrderSchema: Schema = new Schema({
  partNumber: { type: String, required: true },
  modelName: { type: String, required: true }, // Renamed to avoid conflict
  location: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  orderDate: { type: Date, default: Date.now },
  status: { 
    type: String, 
    enum: ['pending', 'arrived'], 
    default: 'pending' 
  }
}, {
  timestamps: true // Adds createdAt and updatedAt fields
});

export default mongoose.model<IPendingOrder>('PendingOrder', PendingOrderSchema); 