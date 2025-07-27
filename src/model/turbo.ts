import mongoose, { Schema, Document } from 'mongoose';

export interface ITurbo extends Document {
  location: string;
  partNumbers: string[]; // For basic entry
  hasSizeOption: boolean;
  sizeVariants?: {
    big?: {
      partNumbers: string[];
      quantity: number;
    };
    small?: {
      partNumbers: string[];
      quantity: number;
    };
  };
  quantity?: number; // Used only if no size variants
  threshold?: number;
}

const TurboSchema: Schema = new Schema({
  location: { type: String, required: true },

  partNumbers: {
    type: [String],
    required: function (this: any) {
      return !this.hasSizeOption;
    },
  },

  hasSizeOption: { type: Boolean, default: false },

  sizeVariants: {
    big: {
      partNumbers: [String],
      quantity: { type: Number, default: 0 },
    },
    small: {
      partNumbers: [String],
      quantity: { type: Number, default: 0 },
    },
  },

  quantity: {
    type: Number,
    default: 0,
    required: function (this: any) {
      return !this.hasSizeOption;
    },
  },

  threshold: {
    type: Number,
    default: 0,
  },
});

export default mongoose.model<ITurbo>('Turbo', TurboSchema);
