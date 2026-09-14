import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../i18n/translations';

export const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    try {
      const saved = localStorage.getItem('missafx_lang');
      return saved === 'en' ? 'en' : 'es'; // Por defecto Español
    } catch {
      return 'es';
    }
  });

  const setLang = (newLang) => {
    const valid = newLang === 'en' ? 'en' : 'es';
    setLangState(valid);
    try {
      localStorage.setItem('missafx_lang', valid);
    } catch (e) {
      console.warn('Could not save language to localStorage', e);
    }
  };

  const toggleLang = () => {
    setLang(lang === 'es' ? 'en' : 'es');
  };

  const t = translations[lang] || translations.es;

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
