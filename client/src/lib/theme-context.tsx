import { createContext, useContext, useEffect, useState } from 'react';
import { Language } from './translations';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  language: Language;
  setTheme: (theme: Theme) => void;
  setLanguage: (language: Language) => void;
  toggleTheme: () => void;
  toggleLanguage: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('community-hub-theme') as Theme;
    return savedTheme || 'dark'; // Mode sombre par défaut pour le design 2900
  });
  
  const [language, setLanguage] = useState<Language>(() => {
    const savedLang = localStorage.getItem('community-hub-language') as Language;
    return savedLang || 'fr'; // Français par défaut
  });

  useEffect(() => {
    const root = window.document.documentElement;
    
    // Supprimer les classes précédentes
    root.classList.remove('light', 'dark');
    
    // Ajouter la nouvelle classe de thème
    root.classList.add(theme);
    
    // Sauvegarder dans localStorage
    localStorage.setItem('community-hub-theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('community-hub-language', language);
  }, [language]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  const toggleLanguage = () => {
    setLanguage(prevLang => prevLang === 'fr' ? 'en' : 'fr');
  };

  const value = {
    theme,
    language,
    setTheme,
    setLanguage,
    toggleTheme,
    toggleLanguage,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};