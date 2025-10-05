const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  // Link to user
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userId: { type: String },
  // Business identifiers
  orderNumber: { type: String },
  paymentReference: { type: String },
  // Line items
  items: [{
    productId: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true }
  }],
  totalAmount: { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending_payment', 'payment_verified', 'processing', 'shipped', 'delivered'],
    default: 'pending_payment'
  },
  // Payment
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed', 'pending_verification'], default: 'pending' },
  paymentDetails: {
    method: String,
    reference: String,
    amount: Number,
    paidAt: Date,
    channel: String
  },
  paymentProof: String,
  // Shipping address (no hard required to allow minimal orders)
  shippingAddress: {
    name: { type: String },
    address: { type: String },
    city: { type: String },
    state: { type: String },
    phone: { type: String },
    method: { type: String },
    cost: { type: Number },
    note: { type: String }
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);