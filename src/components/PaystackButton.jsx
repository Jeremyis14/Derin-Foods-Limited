import React, { useEffect, useState } from 'react';


const PaystackButton = ({
  amount,
  email,
  publicKey,
  metadata = {},
  onSuccess = () => {},
  onClose = () => {},
  children
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [error, setError] = useState(null);

  // Load Paystack script
  useEffect(() => {
    if (window.PaystackPop) {
      setScriptLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    
    script.onload = () => {
      console.log('Paystack script loaded');
      setScriptLoaded(true);
      setError(null);
    };
    
    script.onerror = () => {
      console.error('Failed to load Paystack script');
      setError('Failed to load payment processor. Please refresh the page and try again.');
    };
    
    document.body.appendChild(script);
    
    return () => {
      if (script.parentNode) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const handlePayment = () => {
    if (!publicKey) {
      setError('Payment processing is not configured. Please contact support.');
      return;
    }

    if (!window.PaystackPop) {
      setError('Payment processor not loaded. Please refresh the page and try again.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const handler = window.PaystackPop.setup({
        key: publicKey,
        email,
        amount: Math.round(amount * 100), // Convert to kobo and ensure it's an integer
        metadata,
        callback: (response) => {
          console.log('Paystack callback:', response);
          onSuccess(response);
          setIsLoading(false);
        },
        onClose: () => {
          console.log('Paystack payment window closed');
          onClose();
          setIsLoading(false);
        }
      });

      handler.openIframe();
    } catch (error) {
      console.error('Error initializing payment:', error);
      setError('Failed to initialize payment. Please try again.');
      setIsLoading(false);
    }
  };

  if (error) {
    return (
      <div className="text-red-600 text-sm mb-4 p-2 bg-red-50 rounded">
        {error}
      </div>
    );
  }

  return (
    <button
      onClick={handlePayment}
      disabled={isLoading || !scriptLoaded}
      className={`w-full py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200 ${
        isLoading || !scriptLoaded
          ? 'bg-gray-400 cursor-not-allowed'
          : 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500'
      }`}
    >
      {isLoading ? 'Processing...' : children}
    </button>
  );
};

export { PaystackButton };
export default PaystackButton;
