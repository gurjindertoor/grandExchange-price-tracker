import mongoose from "mongoose";

const PriceSchema = new mongoose.Schema({
  timestamp: {
    type: Number,
    required: true,
  },
  item_id: {
    type: Number,
    required: true,
  },
  item_name: {
    type: String,
    required: true,
  },
  low_price: {
    type: Number,
    default: -1,
  },
  high_price: {
    type: Number,
    default: -1,
  },
});

// Combine timestamp and item_id as the primary key
PriceSchema.index({ timestamp: 1, item_id: 1 }, { unique: true });

export const PriceModel = mongoose.model("prices", PriceSchema);
