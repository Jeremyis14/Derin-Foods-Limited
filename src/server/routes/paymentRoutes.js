const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const { 
  verifyPayment, 
  paystackWebhook, 
  uploadPaymentProof 
} = require('../controllers/paymentController');
const upload = require('../middleware/uploadMiddleware');

// Public webhook endpoint (no auth required)
router.post('/webhook/paystack', paystackWebhook);

// Protected routes
router.use(protect);

// Verify payment
router.post('/verify', verifyPayment);

// Upload payment proof
router.post('/upload-proof', 
  upload.single('proof'), 
  uploadPaymentProof
);

module.exports = router;
