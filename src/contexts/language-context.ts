import { createContext } from 'react'
import { LanguageContext as LanguageContextType } from '../types/admin'

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined)