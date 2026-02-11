"use client"

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Language, translations, TranslationKey } from '@/lib/i18n'

interface LanguageState {
  language: Language
  setLanguage: (lang: Language) => void
  toggleLanguage: () => void
  t: TranslationKey
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set, get) => ({
      language: 'en',
      setLanguage: (lang) => set({ language: lang }),
      toggleLanguage: () => set((state) => ({ language: state.language === 'en' ? 'zh' : 'en' })),
      t: translations.en
    }),
    {
      name: 'language-storage',
      partialize: (state) => ({ language: state.language })
    }
  )
)

// Hook to get translations for current language
export const useTranslation = () => {
  const { language, setLanguage, toggleLanguage, t } = useLanguageStore()
  const currentTranslations = translations[language]

  return {
    language,
    setLanguage,
    toggleLanguage,
    t: currentTranslations
  }
}
