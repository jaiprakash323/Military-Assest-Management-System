import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const THEMES = [
  {
    id: 'midnight',
    name: 'Midnight Obsidian',
    description: 'Sleek deep navy command aesthetic with subtle indigo glow',
    bgPreview: '#0a0e1a',
    accentPreview: '#3b82f6',
    cardPreview: '#1a1f35',
  },
  {
    id: 'stealth',
    name: 'Dark Stealth',
    description: 'Ultra-dark pitch stealth background for low-light ops',
    bgPreview: '#07090e',
    accentPreview: '#64748b',
    cardPreview: '#121624',
  },
  {
    id: 'emerald',
    name: 'Emerald Command',
    description: 'Military tactical teal & emerald command operations',
    bgPreview: '#061412',
    accentPreview: '#10b981',
    cardPreview: '#0f2b27',
  },
  {
    id: 'cyber',
    name: 'Cyber Operations',
    description: 'Futuristic high-contrast dark theme with cyan & purple glow',
    bgPreview: '#070a14',
    accentPreview: '#06b6d4',
    cardPreview: '#151b36',
  },
  {
    id: 'light',
    name: 'Light Tactical',
    description: 'Clean, high-visibility tactical light environment',
    bgPreview: '#f8fafc',
    accentPreview: '#2563eb',
    cardPreview: '#ffffff',
  },
];

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(() => {
    const savedTheme = localStorage.getItem('mil_assets_theme');
    return savedTheme || 'midnight';
  });

  const setTheme = (newTheme) => {
    setThemeState(newTheme);
    localStorage.setItem('mil_assets_theme', newTheme);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
