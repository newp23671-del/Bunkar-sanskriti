import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { BusinessSettings } from '../types/index.ts';
import { api, type SettingsResponse } from '../utils/api.ts';

const DEFAULT_SETTINGS: SettingsResponse = {
  businessName: 'BUNKAR SANSKRITI',
  tagline: 'TRADITION WOVEN WITH GRACE',
  sonuPhone: '9305564295',
  shopPhone: '9250420097',
  amanPhone: '8468098924',
  email: 'shadabk3050@gamil.com',
  address: 'Plot No-17, Ravindrapuri Extension, Lanka Road, Opp. Oriyana Hospital, Near Champaran Restaurant, Varanasi – 221005, Uttar Pradesh, India',
  googleMapsUrl: 'https://maps.app.goo.gl/Bnx9Se7HRZ9hL7bB9',
  instagramHandle: '@BUNKAR.__SANSKRITI',
  instagramUrl: 'https://www.instagram.com/BUNKAR.__SANSKRITI',
  whatsappNumber: '9305564295',
  businessHours: [
    { day: 'Monday', isOpen: true, openTime: '10:30', closeTime: '20:30' },
    { day: 'Tuesday', isOpen: true, openTime: '10:30', closeTime: '20:30' },
    { day: 'Wednesday', isOpen: true, openTime: '10:30', closeTime: '20:30' },
    { day: 'Thursday', isOpen: true, openTime: '10:30', closeTime: '20:30' },
    { day: 'Friday', isOpen: true, openTime: '10:30', closeTime: '20:30' },
    { day: 'Saturday', isOpen: true, openTime: '10:30', closeTime: '20:30' },
    { day: 'Sunday', isOpen: true, openTime: '11:00', closeTime: '20:00' },
  ],
  currentStatus: {
    isOpen: true,
    statusText: 'Open Now',
    day: 'Today',
    detail: 'Visit our store in Varanasi',
  },
};

interface SettingsContextValue {
  settings: SettingsResponse;
  loading: boolean;
  refreshSettings: () => Promise<void>;
  updateSettings: (newSettings: Partial<BusinessSettings>, token: string) => Promise<void>;
}

const SettingsContext = createContext<SettingsContextValue>({
  settings: DEFAULT_SETTINGS,
  loading: false,
  refreshSettings: async () => {},
  updateSettings: async () => {},
});

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SettingsResponse>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  const refreshSettings = useCallback(async () => {
    try {
      const data = await api.getSettings();
      setSettings(data);
    } catch (err) {
      console.warn('Using default business settings fallback', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSettings = async (newSettings: Partial<BusinessSettings>, token: string) => {
    const updated = await api.updateSettings(newSettings, token);
    setSettings(updated);
  };

  useEffect(() => {
    refreshSettings();
    // Poll store status every 5 minutes to stay accurate
    const interval = setInterval(refreshSettings, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [refreshSettings]);

  return (
    <SettingsContext.Provider value={{ settings, loading, refreshSettings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
