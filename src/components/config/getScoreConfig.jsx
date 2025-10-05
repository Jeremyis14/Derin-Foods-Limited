const STORAGE_KEY = 'store-config:v1';

  export const STORE_CONFIG_DEFAULTS = {
    storeName: 'Deerin Foods',
    logoText: 'Deerin Foods',
    logoUrl: '',
    whatsappNumber: '2348055748661', // intl format without +
    whatsappMessage: 'Hello! I came from your website and would love to place an order.',
    currency: 'NGN',
    locale: 'en-NG',
  };

  export function getStoreConfig() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      return { ...STORE_CONFIG_DEFAULTS, ...parsed };
    } catch {
      return { ...STORE_CONFIG_DEFAULTS };
    }
  }

  export function setStoreConfig(partial) {
    const next = { ...getStoreConfig(), ...partial };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      window.dispatchEvent(new CustomEvent('store-config:updated', { detail: next }));
    } catch {}
    return next;
  }

  import { useEffect, useState } from 'react';

  export function useStoreConfig() {
    const [config, setConfig] = useState(() => getStoreConfig());

    useEffect(() => {
      const handler = (e) => setConfig(e?.detail || getStoreConfig());
      window.addEventListener('store-config:updated', handler);
      return () => window.removeEventListener('store-config:updated', handler);
    }, []);

    const save = (partial) => setConfig(setStoreConfig(partial));

    return [config, save];
  }

  // Optional helper
  export function formatCurrency(amount, currency = getStoreConfig().currency, locale = getStoreConfig().locale) {
    try {
      return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount || 0);
    } catch {
      return `${currency} ${Number(amount || 0).toFixed(2)}`;
    }
  }