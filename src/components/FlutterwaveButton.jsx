import React, { useEffect, useState } from 'react';
import { useFlutterwave, closePaymentModal } from 'flutterwave-react-v3';

const FlutterwaveButton = ({
  amount,
  email,
  name,
  phone,
  onSuccess = () => {},
  onClose = () => {},
  onError = () => {},
  children,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const config = {
    public_key: process.env.VITE_FLUTTERWAVE_PUBLIC_KEY,
    tx_ref: `MANAGE-${Date.now()}`,
    amount: amount / 100, // Convert from kobo to naira
    currency: 'NGN',
    payment_options: 'card,mobilemoney,ussd',
    customer: {
      email: email,
      phone_number: phone || '',
      name: name || 'Customer',
    },
    customizations: {
      title: 'MANAGE Store',
      description: 'Payment for your order',
      logo: '/logo.png',
    },
  };

  const handleFlutterPayment = useFlutterwave(config);

  const handlePayment = () => {
    if (!process.env.VITE_FLUTTERWAVE_PUBLIC_KEY) {
      setError('Payment processing is not configured. Please contact support.');
      return;
    }

    setIsLoading(true);
    setError(null);

    handleFlutterPayment({
      callback: (response) => {
        if (response.status === 'successful') {
          onSuccess(response);
        } else {
          onError(new Error('Payment was not successful'));
        }
        closePaymentModal();
        setIsLoading(false);
      },
      onClose: () => {
        onClose();
        setIsLoading(false);
      },
    });
  };

  return (
    <div className="space-y-2">
      <button
        onClick={handlePayment}
        disabled={isLoading}
        className={`w-full py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200 ${
          isLoading
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-purple-600 hover:bg-purple-700 text-white focus:ring-purple-500'
        }`}
      >
        {isLoading ? 'Processing...' : children || 'Pay with Card'}
      </button>
      {error && (
        <div className="text-red-600 text-sm p-2 bg-red-50 rounded">
          {error}
        </div>
      )}
    </div>
  );
};

export { FlutterwaveButton };
export default FlutterwaveButton;
