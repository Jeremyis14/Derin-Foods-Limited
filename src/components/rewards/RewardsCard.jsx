import { motion } from 'framer-motion';
import { REWARD_TIERS, calculateUserTier, getNextTier } from '../config/RewardsConfig';

export function RewardsCard({ totalSpent }) {
  const currentTierKey = calculateUserTier(totalSpent);
  const currentTier = REWARD_TIERS[currentTierKey];
  const nextTier = getNextTier(currentTierKey);

  return (
    <div className="bg-white rounded-2xl border p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Rewards Status</h3>
          <p className="text-sm text-gray-500">Your current benefits</p>
        </div>
        <div className={`p-3 rounded-xl ${currentTier.bg}`}>
          <span className="text-2xl">{currentTier.icon}</span>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className={`font-medium ${currentTier.color}`}>
              {currentTier.name} Member
            </p>
            <p className="text-sm text-gray-500">
              {currentTier.discount}% discount on all orders
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Total Spent</p>
            <p className="font-medium">₦{totalSpent.toLocaleString()}</p>
          </div>
        </div>

        {nextTier && (
          <div className="pt-4 border-t">
            <p className="text-sm text-gray-500 mb-2">
              Spend ₦{(nextTier.minSpent - totalSpent).toLocaleString()} more to reach {nextTier.name}
            </p>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(totalSpent / nextTier.minSpent) * 100}%` }}
                className="h-full bg-green-600"
              />
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 pt-4 border-t">
        {Object.entries(REWARD_TIERS).map(([key, tier]) => (
          <div
            key={key}
            className={`p-3 rounded-xl ${
              currentTierKey === key ? tier.bg : 'bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-2">
              <span>{tier.icon}</span>
              <div>
                <p className="font-medium">{tier.name}</p>
                <p className="text-xs text-gray-500">
                  {tier.discount}% off
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}