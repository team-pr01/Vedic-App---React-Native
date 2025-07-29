// src/hooks/useTranslate.ts

import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';

// This hook provides a translate function based on the current language state in Redux
export const useTranslate = () => {
  // Get all current translations from the Redux state
  const translations = useSelector((state: RootState) => state.language.translations);

  /**
   * Translates a key into the current language.
   * @param key The key of the string to translate (e.g., 'createYourAccount').
   * @param fallback A fallback string to use if the key is not found.
   * @returns The translated string.
   */
  const t = (key: keyof typeof translations, fallback: string): string => {
    return translations[key] || fallback;
  };

  return t;
};