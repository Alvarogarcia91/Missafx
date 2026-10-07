import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  fetchGeneralSettings,
  saveGeneralSettings,
  resetGeneralSettings,
  DEFAULT_GENERAL_SETTINGS,
  applyFavicon,
  applyPageTitle
} from '../utils/supabaseClient';

export const SiteConfigContext = createContext();

export function SiteConfigProvider({ children }) {
  const [config, setConfig] = useState(() => {
    try {
      const saved = localStorage.getItem('missafx_general_settings');
      if (saved) return { ...DEFAULT_GENERAL_SETTINGS, ...JSON.parse(saved) };
    } catch (e) {}
    return DEFAULT_GENERAL_SETTINGS;
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    // Apply cached favicon and title immediately
    if (config.faviconUrl) {
      applyFavicon(config.faviconUrl);
    }
    if (config.tabTitle) {
      applyPageTitle(config.tabTitle);
    }

    // Fetch freshest settings from cloud
    fetchGeneralSettings().then((cloudSettings) => {
      if (isMounted && cloudSettings) {
        setConfig(cloudSettings);
        if (cloudSettings.faviconUrl) {
          applyFavicon(cloudSettings.faviconUrl);
        }
        if (cloudSettings.tabTitle) {
          applyPageTitle(cloudSettings.tabTitle);
        }
        setLoading(false);
      }
    });

    const handleUpdate = (e) => {
      if (e.detail) {
        setConfig(e.detail);
        if (e.detail.faviconUrl) {
          applyFavicon(e.detail.faviconUrl);
        }
        if (e.detail.tabTitle) {
          applyPageTitle(e.detail.tabTitle);
        }
      }
    };

    window.addEventListener('missafx-config-updated', handleUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener('missafx-config-updated', handleUpdate);
    };
  }, []);

  const updateConfig = async (newValues) => {
    const updated = await saveGeneralSettings(newValues);
    setConfig(updated);
    return updated;
  };

  const resetConfig = async () => {
    const def = await resetGeneralSettings();
    setConfig(def);
    return def;
  };

  return (
    <SiteConfigContext.Provider value={{ config, updateConfig, resetConfig, loading }}>
      {children}
    </SiteConfigContext.Provider>
  );
}

export function useSiteConfig() {
  const context = useContext(SiteConfigContext);
  if (!context) {
    return {
      config: DEFAULT_GENERAL_SETTINGS,
      updateConfig: async () => DEFAULT_GENERAL_SETTINGS,
      resetConfig: async () => DEFAULT_GENERAL_SETTINGS,
      loading: false
    };
  }
  return context;
}
