import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Initialize Stripe with your public key
const stripePromise = loadStripe(process.env.VITE_STRIPE_PUBLIC_KEY);

// Checkout form component
const CheckoutForm = ({ amount, email, onSuccess, onError, children }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!stripe || !elements) {
      return; // Stripe.js has not loaded yet
    }

    setIsLoading(true);
    setError(null);

    try {
      // Create payment intent on the server
      const response = await fetch('/api/stripe/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ amount, email })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to process payment');
      }

      const { clientSecret } = await response.json();

      // Confirm the card payment
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: { email }
        },
        setup_future_usage: 'off_session'
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      if (result.paymentIntent.status === 'succeeded') {
        onSuccess(result.paymentIntent);
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError(err.message || 'Payment failed. Please try again.');
      onError(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="border rounded-md p-3 bg-white">
        <CardElement 
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
              invalid: {
                color: '#9e2146',
              },
            },
          }}
        />
      </div>
      
      {error && (
        <div className="text-red-600 text-sm p-2 bg-red-50 rounded">
          {error}
        </div>
      )}
      
      <button
        type="submit"
        disabled={!stripe || isLoading}
        className={`w-full py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200 ${
          isLoading || !stripe
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-indigo-600 hover:bg-indigo-700 text-white focus:ring-indigo-500'
        }`}
      >
        {isLoading ? 'Processing...' : children || 'Pay with Card'}
      </button>
    </form>
  );
};

// Main StripeButton component
const StripeButton = ({ amount, email, onSuccess, onError, children }) => {
  const [error, setError] = useState(null);

  const handleError = (err) => {
    console.error('Stripe error:', err);
    setError(err.message || 'Payment failed');
    onError?.(err);
  };

  const handleSuccess = (paymentIntent) => {
    onSuccess?.(paymentIntent);
  };

  return (
    <Elements stripe={stripePromise}>
      <div className="space-y-4">
        {error && (
          <div className="text-red-600 text-sm p-2 bg-red-50 rounded">
            {error}
          </div>
        )}
        <CheckoutForm 
          amount={amount} 
          email={email}
          onSuccess={handleSuccess}
          onError={handleError}
        >
          {children}
        </CheckoutForm>
      </div>
    </Elements>
  );
};

export { StripeButton };
export default StripeButton;
