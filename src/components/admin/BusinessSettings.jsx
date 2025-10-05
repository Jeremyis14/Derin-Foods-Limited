import React, { useEffect, useState } from 'react';
import { FiSave } from 'react-icons/fi';

// Keys
const STORE_KEY = 'store-config:v1';
const PIN_KEY = 'admin:pin';

// Defaults
const DEFAULTS = {
  storeName: 'Deerin Foods',
  logoText: 'Deerin Foods',
  logoUrl: '',
  whatsappNumber: '2348055748661', // intl format without +
  whatsappMessage: 'Hello! I came from your website and would love to place an order.',
  currency: 'NGN',
  locale: 'en-NG'
};

function readStore() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : { ...DEFAULTS };
  } catch {
    return { ...DEFAULTS };
  }
}
function writeStore(next) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(next));
    // Best-effort: broadcast to app if you listen for this event
    window.dispatchEvent(new CustomEvent('store-config:updated', { detail: next }));
  } catch {}
}

export default function BusinessSettings() {
  const [config, setConfig] = useState(() => readStore());
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    // Load latest if changed elsewhere
    const onUpdate = (e) => setConfig(e.detail || readStore());
    window.addEventListener('store-config:updated', onUpdate);
    return () => window.removeEventListener('store-config:updated', onUpdate);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const next = { ...config, [name]: value };
    setConfig(next);
    writeStore(next);
  };

  const handleSavePin = () => {
    if (!pin || pin.length < 4) {
      setMsg('PIN must be at least 4 characters.');
      return;
    }
    if (pin !== confirmPin) {
      setMsg('PINs do not match.');
      return;
    }
    try {
      localStorage.setItem(PIN_KEY, pin);
      setMsg('Admin PIN updated successfully.');
      setPin('');
      setConfirmPin('');
      setTimeout(() => setMsg(''), 2000);
    } catch {
      setMsg('Failed to update PIN.');
    }
  };

  return (
    <div className="bg-white border rounded-2xl p-5 space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Business Settings</h3>
        <p className="text-sm text-gray-500">Changes are saved automatically.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Store name</label>
          <input name="storeName" value={config.storeName} onChange={handleChange} className="mt-1 w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="text-sm font-medium">Logo text</label>
          <input name="logoText" value={config.logoText} onChange={handleChange} className="mt-1 w-full border rounded px-3 py-2" />
        </div>
        <div className="md:col-span-2">
          <label className="text-sm font-medium">Logo URL</label>
          <input name="logoUrl" value={config.logoUrl} onChange={handleChange} className="mt-1 w-full border rounded px-3 py-2" placeholder="https://..." />
        </div>

        <div>
          <label className="text-sm font-medium">WhatsApp number (intl format without +)</label>
          <input name="whatsappNumber" value={config.whatsappNumber} onChange={handleChange} className="mt-1 w-full border rounded px-3 py-2" placeholder="23480..." />
        </div>
        <div>
          <label className="text-sm font-medium">WhatsApp message</label>
          <input name="whatsappMessage" value={config.whatsappMessage} onChange={handleChange} className="mt-1 w-full border rounded px-3 py-2" />
        </div>

        <div>
          <label className="text-sm font-medium">Currency</label>
          <input name="currency" value={config.currency} onChange={handleChange} className="mt-1 w-full border rounded px-3 py-2" placeholder="NGN" />
        </div>
        <div>
          <label className="text-sm font-medium">Locale</label>
          <input name="locale" value={config.locale} onChange={handleChange} className="mt-1 w-full border rounded px-3 py-2" placeholder="en-NG" />
        </div>
      </div>

      <div className="border-t pt-5">
        <h4 className="text-md font-semibold mb-3">Admin Security</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium">New PIN</label>
            <input value={pin} onChange={(e) => setPin(e.target.value)} className="mt-1 w-full border rounded px-3 py-2" placeholder="min 4 characters" />
          </div>
          <div>
            <label className="text-sm font-medium">Confirm PIN</label>
            <input value={confirmPin} onChange={(e) => setConfirmPin(e.target.value)} className="mt-1 w-full border rounded px-3 py-2" placeholder="retype PIN" />
          </div>
          <div className="flex items-end">
            <button onClick={handleSavePin} className="w-full px-4 py-2 rounded-full bg-green-600 text-white font-medium hover:bg-green-500 inline-flex items-center gap-2 justify-center">
              <FiSave />
              <span>Save PIN</span>
            </button>
          </div>
        </div>
        {msg && <div className="mt-2 text-sm text-gray-700">{msg}</div>}
      </div>
    </div>
  );
}