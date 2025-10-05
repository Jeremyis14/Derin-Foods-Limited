import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import {
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiSave,
  FiLock,
  FiShield,
  FiBell,
  FiMoon,
  FiSun,
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export default function UserSettings() {
  const { currentUser, updateProfile } = useAuth();
  const { darkMode, toggleTheme } = useTheme();

  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });
  const [saving, setSaving] = useState(false);

  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [changingPwd, setChangingPwd] = useState(false);

  const prefKey = useMemo(() => `user:prefs:${currentUser?.id || currentUser?._id || 'guest'}`, [currentUser]);
  const [prefs, setPrefs] = useState(() => {
    try {
      const raw = localStorage.getItem(`user:prefs:${'guest'}`);
      return raw ? JSON.parse(raw) : { marketingEmails: true, orderUpdates: true };
    } catch {
      return { marketingEmails: true, orderUpdates: true };
    }
  });

  useEffect(() => {
    // Initialize from current user
    if (currentUser) {
      setProfile({
        name: currentUser.name || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        address: currentUser.address || ''
      });
    }
  }, [currentUser]);

  useEffect(() => {
    // Load user-specific prefs
    try {
      const raw = localStorage.getItem(prefKey);
      if (raw) setPrefs(JSON.parse(raw));
    } catch {}
  }, [prefKey]);

  const persistPrefs = (next) => {
    try {
      localStorage.setItem(prefKey, JSON.stringify(next));
    } catch {}
  };

  const onSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await updateProfile({
        name: profile.name,
        phone: profile.phone,
        address: profile.address
      });
      if (res?.success) {
        toast.success('Profile updated');
      } else {
        toast.error(res?.error || 'Failed to update profile');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const onChangePassword = async (e) => {
    e.preventDefault();
    if (!passwords.currentPassword || !passwords.newPassword) {
      toast.error('Fill all password fields');
      return;
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error('New password and confirmation do not match');
      return;
    }

    setChangingPwd(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword
        })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to change password');
      }
      toast.success('Password updated');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to change password');
    } finally {
      setChangingPwd(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-10">
      <div className="max-w-5xl px-4 mx-auto space-y-8 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
            <p className="mt-1 text-gray-600">Manage your personal information, security and preferences</p>
          </div>
          <span className="px-3 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded-full">
            {currentUser?.role || 'user'}
          </span>
        </div>

        {/* Profile */}
        <section className="p-6 bg-white border rounded-2xl">
          <div className="flex items-center gap-2 mb-4">
            <FiUser className="text-gray-500" />
            <h2 className="text-lg font-semibold">Profile</h2>
          </div>
          <form onSubmit={onSaveProfile} className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <TextField
              icon={FiUser}
              label="Full name"
              value={profile.name}
              onChange={(v) => setProfile((p) => ({ ...p, name: v }))}
              placeholder="Your name"
            />
            <TextField
              icon={FiMail}
              label="Email"
              value={profile.email}
              readOnly
              helper="Email cannot be changed"
            />
            <TextField
              icon={FiPhone}
              label="Phone"
              value={profile.phone}
              onChange={(v) => setProfile((p) => ({ ...p, phone: v }))}
              placeholder="e.g. +234..."
            />
            <TextField
              icon={FiMapPin}
              label="Address"
              value={profile.address}
              onChange={(v) => setProfile((p) => ({ ...p, address: v }))}
              placeholder="Delivery address"
            />
            <div className="md:col-span-2">
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                disabled={saving}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-white ${saving ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'}`}
              >
                <FiSave />
                {saving ? 'Saving...' : 'Save changes'}
              </motion.button>
            </div>
          </form>
        </section>

        {/* Security */}
        <section className="p-6 bg-white border rounded-2xl">
          <div className="flex items-center gap-2 mb-4">
            <FiShield className="text-gray-500" />
            <h2 className="text-lg font-semibold">Security</h2>
          </div>
          <form onSubmit={onChangePassword} className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <PasswordField
              label="Current password"
              value={passwords.currentPassword}
              onChange={(v) => setPasswords((p) => ({ ...p, currentPassword: v }))}
            />
            <PasswordField
              label="New password"
              value={passwords.newPassword}
              onChange={(v) => setPasswords((p) => ({ ...p, newPassword: v }))}
            />
            <PasswordField
              label="Confirm new password"
              value={passwords.confirmPassword}
              onChange={(v) => setPasswords((p) => ({ ...p, confirmPassword: v }))}
            />
            <div className="md:col-span-3">
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                disabled={changingPwd}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-white ${changingPwd ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'}`}
              >
                <FiLock />
                {changingPwd ? 'Updating...' : 'Update password'}
              </motion.button>
            </div>
          </form>
        </section>

        {/* Preferences */}
        <section className="p-6 bg-white border rounded-2xl">
          <div className="flex items-center gap-2 mb-4">
            <FiBell className="text-gray-500" />
            <h2 className="text-lg font-semibold">Preferences</h2>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Toggle
              label="Order updates"
              description="Receive notifications about order status"
              checked={!!prefs.orderUpdates}
              onChange={(v) => {
                const next = { ...prefs, orderUpdates: v };
                setPrefs(next);
                persistPrefs(next);
              }}
            />
            <Toggle
              label="Marketing emails"
              description="Receive promotions and offers"
              checked={!!prefs.marketingEmails}
              onChange={(v) => {
                const next = { ...prefs, marketingEmails: v };
                setPrefs(next);
                persistPrefs(next);
              }}
            />
            <div className="md:col-span-2">
              <ThemeToggle darkMode={darkMode} toggleTheme={toggleTheme} />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function TextField({ icon: Icon, label, value, onChange, readOnly = false, helper, placeholder = '' }) {
  return (
    <label className="block">
      <span className="block mb-1 text-sm font-medium text-gray-700">{label}</span>
      <div className={`relative ${readOnly ? 'opacity-75' : ''}`}>
        <div className="absolute inset-y-0 left-0 grid w-10 text-gray-400 place-items-center">
          <Icon />
        </div>
        <input
          className="w-full px-3 py-2 pl-10 transition bg-white border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
          type="text"
          readOnly={readOnly}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange?.(e.target.value)}
        />
      </div>
      {helper && <span className="text-xs text-gray-500">{helper}</span>}
    </label>
  );
}

function PasswordField({ label, value, onChange }) {
  const [show, setShow] = useState(false);
  return (
    <label className="block">
      <span className="block mb-1 text-sm font-medium text-gray-700">{label}</span>
      <div className="relative">
        <input
          className="w-full px-3 py-2 transition bg-white border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute inset-y-0 right-0 px-3 text-gray-500"
        >
          {show ? 'Hide' : 'Show'}
        </button>
      </div>
    </label>
  );
}

function Toggle({ label, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between p-4 border rounded-xl">
      <div>
        <div className="font-medium text-gray-900">{label}</div>
        {description && <div className="text-sm text-gray-600">{description}</div>}
      </div>
      <button
        type="button"
        onClick={() => onChange?.(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${checked ? 'bg-green-600' : 'bg-gray-300'}`}
        aria-checked={checked}
        role="switch"
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${checked ? 'translate-x-6' : 'translate-x-1'}`}
        />
      </button>
    </div>
  );
}

function ThemeToggle({ darkMode, toggleTheme }) {
  return (
    <div className="flex items-center justify-between p-4 border rounded-xl">
      <div>
        <div className="flex items-center gap-2 font-medium text-gray-900">
          {darkMode ? <FiMoon /> : <FiSun />}
          <span>Theme</span>
        </div>
        <div className="text-sm text-gray-600">Switch between light and dark mode</div>
      </div>
      <button
        type="button"
        onClick={toggleTheme}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${darkMode ? 'bg-gray-900' : 'bg-gray-300'}`}
        aria-checked={darkMode}
        role="switch"
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${darkMode ? 'translate-x-6' : 'translate-x-1'}`}
        />
      </button>
    </div>
  );
}
