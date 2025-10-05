import { motion } from 'framer-motion';
import { FiCheck, FiClock, FiCreditCard } from 'react-icons/fi';

export function CheckoutSteps({ step }) {
  return (
    <div className="max-w-3xl mx-auto mb-8">
      <div className="flex justify-between">
        <Step
          number={1}
          title="Review Cart"
          icon={FiCheck}
          status={step > 1 ? 'completed' : step === 1 ? 'current' : 'pending'}
        />
        <Step
          number={2}
          title="Payment"
          icon={FiCreditCard}
          status={step > 2 ? 'completed' : step === 2 ? 'current' : 'pending'}
        />
        <Step
          number={3}
          title="Confirmation"
          icon={FiClock}
          status={step === 3 ? 'current' : 'pending'}
        />
      </div>
    </div>
  );
}

function Step({ number, title, icon: Icon, status }) {
  return (
    <div className="flex flex-col items-center">
      <motion.div
        className={`w-10 h-10 rounded-full flex items-center justify-center ${
          status === 'completed'
            ? 'bg-green-600 text-white'
            : status === 'current'
            ? 'bg-green-600 text-white'
            : 'bg-gray-100 text-gray-400'
        }`}
        animate={{
          scale: status === 'current' ? 1.1 : 1,
          backgroundColor: 
            status === 'completed' 
              ? '#16a34a' 
              : status === 'current'
              ? '#16a34a'
              : '#f3f4f6'
        }}
      >
        <Icon size={20} />
      </motion.div>
      <p className="text-sm font-medium mt-2">{title}</p>
      <p className="text-xs text-gray-500">Step {number}</p>
    </div>
  );
}