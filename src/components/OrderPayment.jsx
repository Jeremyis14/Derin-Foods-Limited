import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from './CartContext';

const OrderPayment = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const token = (typeof window !== 'undefined' && localStorage.getItem('token')) || user?.token;

  const { getOrder } = useCart();
  const [paymentProof, setPaymentProof] = useState(null);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);

  // Try to read minimal order info from local CartContext (set when created)
  const localOrder = useMemo(() => getOrder?.(orderId), [getOrder, orderId]);
  const orderTotal = Number(localOrder?.total || 0);

  const bankDetails = {
    bankName: "Your Bank Name",
    accountNumber: "1234567890",
    accountName: "Your Business Name",
    swiftCode: "XXXXX"
  };

  const copyAccountDetails = () => {
    navigator.clipboard.writeText(
      `Bank: ${bankDetails.bankName}\nAccount: ${bankDetails.accountNumber}\nName: ${bankDetails.accountName}`
    );
    alert("Bank details copied to clipboard!");
  };

  const handleFileUpload = (event) => {
    setPaymentProof(event.target.files[0]);
  };

  const submitPaymentProof = async () => {
    if (!paymentProof) {
      alert("Please upload payment proof");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('proof', paymentProof);

      const res = await fetch(`/api/orders/${orderId}/payment-proof`, {
        method: 'POST',
        headers: {
          Authorization: token ? `Bearer ${token}` : ''
        },
        body: formData
      });

      if (!res.ok) {
        const msg = await res.json().catch(() => ({}));
        throw new Error(msg.error || 'Upload failed');
      }

      alert("Payment proof submitted successfully! Admin will verify soon.");
      navigate('/user/orders');

    } catch (error) {
      alert(error.message || "Error submitting payment proof. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const payOnlineWithPaystack = () => {
    try {
      const publicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
      if (!publicKey) {
        alert('Payment unavailable: missing Paystack public key');
        return;
      }
      if (!(window && window.PaystackPop)) {
        alert('Payment unavailable: Paystack script not loaded');
        return;
      }
      const amountKobo = Math.round((orderTotal || 0) * 100);
      if (!amountKobo) {
        alert('Invalid order amount.');
        return;
      }

      const reference = `DERIN-${Date.now()}`;
      const handler = window.PaystackPop.setup({
        key: publicKey,
        email: user?.email || 'customer@example.com',
        amount: amountKobo,
        ref: reference,
        onClose: function () {
          // No-op for now
        },
        callback: async function (response) {
          // Verify on backend (if JWT available)
          setVerifying(true);
          try {
            const res = await fetch('/api/payments/verify', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {})
              },
              body: JSON.stringify({ reference: response?.reference || reference, orderId })
            });
            if (!res.ok) {
              const msg = await res.json().catch(() => ({}));
              throw new Error(msg.error || 'Verification failed');
            }
            alert('Payment successful!');
            navigate('/user/orders');
          } catch (e) {
            alert(e.message || 'Payment recorded, but verification failed. Please contact support.');
          } finally {
            setVerifying(false);
          }
        }
      });
      handler.openIframe();
    } catch (e) {
      alert('Unable to start payment. Please try bank transfer.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6">Payment Details</h2>

        {/* Status Steps */}
        <div className="flex justify-between mb-8">
          <StatusStep step={1} active={true} label="Order Placed" />
          <StatusStep step={2} active={true} label="Payment Pending" />
          <StatusStep step={3} active={false} label="Payment Verified" />
          <StatusStep step={4} active={false} label="Order Processing" />
        </div>

        {/* Online Payment */}
        <div className="bg-green-50 p-6 rounded-lg mb-6 border border-green-100">
          <h3 className="text-lg font-semibold mb-2">Pay Online (Paystack)</h3>
          <p className="text-sm text-gray-700 mb-4">Amount: <span className="font-semibold">₦{orderTotal?.toLocaleString?.() || Number(orderTotal).toFixed(2)}</span></p>
          <button
            onClick={payOnlineWithPaystack}
            disabled={verifying}
            className={`mt-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 ${verifying ? 'opacity-60 cursor-not-allowed' : ''}`}
          >
            {verifying ? 'Verifying...' : 'Pay with Paystack'}
          </button>
        </div>

        {/* Bank Details */}
        <div className="bg-gray-50 p-6 rounded-lg mb-6">
          <h3 className="text-lg font-semibold mb-4">Bank Transfer Details</h3>
          <div className="space-y-2">
            <p><span className="font-medium">Bank Name:</span> {bankDetails.bankName}</p>
            <p><span className="font-medium">Account Number:</span> {bankDetails.accountNumber}</p>
            <p><span className="font-medium">Account Name:</span> {bankDetails.accountName}</p>
            <p><span className="font-medium">Swift Code:</span> {bankDetails.swiftCode}</p>
          </div>
          <button 
            onClick={copyAccountDetails}
            className="mt-4 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            Copy Bank Details
          </button>
        </div>

        {/* Payment Proof Upload */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4">Upload Payment Proof</h3>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-green-50 file:text-green-700
              hover:file:bg-green-100"
          />
        </div>

        <button
          onClick={submitPaymentProof}
          disabled={!paymentProof || loading}
          className={`w-full py-3 rounded-lg text-white font-medium
            ${loading || !paymentProof ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'}`}
        >
          {loading ? 'Submitting...' : 'Submit Payment Proof'}
        </button>
      </div>
    </div>
  );
};

const StatusStep = ({ step, active, label }) => (
  <div className="flex flex-col items-center">
    <div className={`w-8 h-8 rounded-full flex items-center justify-center
      ${active ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
      {step}
    </div>
    <span className={`text-sm mt-2 ${active ? 'text-green-600' : 'text-gray-600'}`}>
      {label}
    </span>
  </div>
);

export default OrderPayment;