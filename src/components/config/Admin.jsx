const PIN_STORAGE_KEY = 'admin:pin';
  const AUTH_FLAG_KEY = 'admin:auth';
  const EVT = 'admin:auth-changed';

  // Default fallback PIN (change in Business Settings)
  const DEFAULT_PIN = '0000';

  export function getAdminPin() {
    try {
      const pin = localStorage.getItem(PIN_STORAGE_KEY);
      return pin && pin.length >= 4 ? pin : DEFAULT_PIN;
    } catch {
      return DEFAULT_PIN;
    }
  }

  export function setAdminPin(pin) {
    if (!pin || String(pin).length < 4) {
      throw new Error('PIN must be at least 4 characters.');
    }
    try {
      localStorage.setItem(PIN_STORAGE_KEY, String(pin));
    } catch {}
  }

  export function isAdminAuthed() {
    try {
      return sessionStorage.getItem(AUTH_FLAG_KEY) === '1';
    } catch {
      return false;
    }
  }

  export function loginAdmin(pin) {
    const ok = String(pin) === getAdminPin();
    if (ok) {
      try {
        sessionStorage.setItem(AUTH_FLAG_KEY, '1');
        window.dispatchEvent(new CustomEvent(EVT, { detail: true }));
      } catch {}
    }
    return ok;
  }

  export function logoutAdmin() {
    try {
      sessionStorage.removeItem(AUTH_FLAG_KEY);
      window.dispatchEvent(new CustomEvent(EVT, { detail: false }));
    } catch {}
  }

  import { useEffect, useState } from 'react';

  export function useAdminAuth() {
    const [authed, setAuthed] = useState(() => isAdminAuthed());

    useEffect(() => {
      const onChange = (e) => setAuthed(!!(e?.detail ?? isAdminAuthed()));
      window.addEventListener(EVT, onChange);
      return () => window.removeEventListener(EVT, onChange);
    }, []);

    const login = (pin) => {
      const ok = loginAdmin(pin);
      setAuthed(ok);
      return ok;
    };
    const logout = () => {
      logoutAdmin();
      setAuthed(false);
    };

    return [authed, login, logout];
  }