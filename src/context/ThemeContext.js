import React, { createContext, useState, useContext, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : false;
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    const root = document.documentElement;
    if (isDark) {
      root.style.setProperty('--background-color', '#14213d');
      root.style.setProperty('--text-color', '#f1f1f1');
      root.style.setProperty('--card-bg', '#1a2233');
      root.style.setProperty('--input-bg', '#1e2746');
      root.style.setProperty('--border-color', '#22304a');
      root.style.setProperty('--hover-bg', '#22304a');
      root.style.setProperty('--shadow-color', 'rgba(0, 0, 0, 0.3)');
      root.style.setProperty('--header-bg', 'rgba(20, 33, 61, 0.95)');
      root.style.setProperty('--button-bg', '#22304a');
      root.style.setProperty('--button-hover', '#1a2233');
    } else {
      root.style.setProperty('--background-color', '#f5f6fa');
      root.style.setProperty('--text-color', '#222');
      root.style.setProperty('--card-bg', '#fff');
      root.style.setProperty('--input-bg', '#f5f6fa');
      root.style.setProperty('--border-color', '#e0e0e0');
      root.style.setProperty('--hover-bg', '#f0f0f0');
      root.style.setProperty('--shadow-color', 'rgba(0, 0, 0, 0.08)');
      root.style.setProperty('--header-bg', 'rgba(255,255,255,0.95)');
      root.style.setProperty('--button-bg', '#4f8cff');
      root.style.setProperty('--button-hover', '#3a6fd8');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark((prev) => !prev);

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext); 