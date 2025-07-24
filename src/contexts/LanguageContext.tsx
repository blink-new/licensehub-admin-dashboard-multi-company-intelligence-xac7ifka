import React, { useState, useEffect } from 'react'
import { Language, LanguageContext as LanguageContextType } from '../types/admin'
import { translations, TranslationKey } from '../i18n/translations'
import { LanguageContext } from './language-context'

interface LanguageProviderProps {
  children: React.ReactNode
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('fr') // Default to French

  // Load saved language preference
  useEffect(() => {
    const savedLanguage = localStorage.getItem('admin-language') as Language
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'fr')) {
      setLanguage(savedLanguage)
    }
  }, [])

  // Save language preference
  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang)
    localStorage.setItem('admin-language', lang)
  }

  // Translation function
  const t = (key: TranslationKey): string => {
    return translations[language][key] || key
  }

  const value: LanguageContextType = {
    language,
    setLanguage: handleSetLanguage,
    t
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}