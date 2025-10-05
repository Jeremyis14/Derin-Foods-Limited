import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  name: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
}, { _id: false });

const priceHistorySchema = new mongoose.Schema({
  price: { type: Number, required: true },
  date: { type: Date, default: Date.now }
}, { _id: false });

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please enter product name'],
      trim: true,
      maxLength: [100, 'Product name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please enter product description'],
    },
    price: {
      type: Number,
      required: [true, 'Please enter product price'],
      maxLength: [5, 'Product price cannot exceed 5 characters'],
      default: 0.0,
    },
    category: {
      type: String,
      required: [true, 'Please select category for this product'],
      enum: {
        values: ['Food', 'Beverages', 'Snacks', 'Desserts', 'Others'],
        message: 'Please select correct category for product',
      },
    },
    stock: {
      type: Number,
      required: [true, 'Please enter product stock'],
      min: [0, 'Stock cannot be negative'],
      default: 0,
    },
    sold: {
      type: Number,
      default: 0,
      min: 0
    },
    priceHistory: [priceHistorySchema],
    ratings: {
      type: Number,
      default: 0
    },
    numReviews: {
      type: Number,
      default: 0
    },
    reviews: [reviewSchema],
    image: {
      type: String,
      default: '',
    },
    weight: {
      type: Number,
      default: 0,
    },
    inStock: {
      type: Boolean,
      default: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    minOrderQty: {
      type: Number,
      default: 1,
      min: 1
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Update inStock based on stock before saving
productSchema.pre('save', function(next) {
  this.inStock = this.stock > 0;
  
  // If price is being modified, add to price history
  if (this.isModified('price')) {
    if (!this.priceHistory) {
      this.priceHistory = [];
    }
    this.priceHistory.push({
      price: this.price,
      date: new Date()
    });
  }
  
  next();
});

// Method to check if product is available in the requested quantity
productSchema.methods.isAvailable = function(quantity = 1) {
  return this.stock >= quantity && this.inStock && this.isActive;
};

// Method to update stock (use negative numbers to reduce stock)
productSchema.methods.updateStock = async function(quantity) {
  if (this.stock + quantity < 0) {
    throw new Error('Insufficient stock');
  }
  
  this.stock += quantity;
  this.inStock = this.stock > 0;
  
  if (quantity < 0) {
    this.sold += Math.abs(quantity);
  }
  
  return this.save();
};

export default mongoose.models.Product || mongoose.model('Product', productSchema);
