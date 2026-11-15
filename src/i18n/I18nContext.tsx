import React, { createContext, useContext, useEffect, useState } from 'react';
import { Language } from '../types/design';
import { translations } from './translations';

const LANG_STORAGE_KEY = 'sitecraft_language_v1';

interface I18nContextValue {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (typeof translations)['ru'] | (typeof translations)['en'];
}

const I18nContext = createContext<I18nContextValue>({
  lang: 'ru',
  setLang: () => {},
  t: translations.ru,
});

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(LANG_STORAGE_KEY);
      if (saved === 'en' || saved === 'ru') return saved;
    } catch {
      // ignore
    }
    return 'ru';
  });

  const setLang = (next: Language) => {
    setLangState(next);
    try {
      localStorage.setItem(LANG_STORAGE_KEY, next);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  return (
    <I18nContext.Provider value={{ lang, setLang, t: translations[lang] }}>
      {children}
    </I18nContext.Provider>
  );
};

export function useI18n() {
  return useContext(I18nContext);
}

export const LanguageSwitcher: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { lang, setLang } = useI18n();

  return (
    <div
      className={`inline-flex items-center bg-[#121218] border border-zinc-800 rounded-lg p-0.5 text-xs font-semibold shrink-0 ${className}`}
      role="group"
      aria-label="Language Switcher"
    >
      <button
        type="button"
        aria-label="Switch language to Russian"
        onClick={() => setLang('ru')}
        className={`px-2 py-1 rounded-md transition-colors cursor-pointer whitespace-nowrap ${
          lang === 'ru'
            ? 'bg-blue-600 text-white'
            : 'text-zinc-400 hover:text-white'
        }`}
      >
        RU
      </button>
      <button
        type="button"
        aria-label="Switch language to English"
        onClick={() => setLang('en')}
        className={`px-2 py-1 rounded-md transition-colors cursor-pointer whitespace-nowrap ${
          lang === 'en'
            ? 'bg-blue-600 text-white'
            : 'text-zinc-400 hover:text-white'
        }`}
      >
        EN
      </button>
    </div>
  );
};
