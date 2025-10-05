import React, { useState } from 'react';
  import { useAdminAuth } from '../../state/admin-auth';
  import { FiLock } from 'react-icons/fi';

  export default function AdminGate({ children }) {
    const [authed, login] = useAdminAuth();
    const [pin, setPin] = useState('');
    const [err, setErr] = useState('');

    if (authed) return children;

    const handleSubmit = (e) => {
      e.preventDefault();
      const ok = login(pin);
      if (!ok) {
        setErr('Invalid PIN. Try again.');
      } else {
        setErr('');
      }
      setPin('');
    };

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md bg-white border rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-3">
            <FiLock className="text-green-600" />
            <h1 className="text-xl font-semibold">Admin Access Required</h1>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Enter your Admin PIN to access the dashboard. You can set or change the PIN in Business Settings.
          </p>
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="password"
              inputMode="numeric"
              placeholder="Enter PIN"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="w-full border rounded px-3 py-2"
              autoFocus
            />
            {err && <div className="text-sm text-red-600">{err}</div>}
            <button type="submit" className="w-full bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-full font-medium">
              Unlock
            </button>
            <div className="text-xs text-gray-500">
              Tip: Default PIN is 0000. Change it after first login.
            </div>
          </form>
        </div>
      </div>
    );
  }