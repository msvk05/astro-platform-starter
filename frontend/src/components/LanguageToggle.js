import React from 'react';
import { Globe } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const LanguageToggle = () => {
  const { language, setLanguage } = useLanguage();
  
  const languages = [
    { code: 'en', label: 'EN' },
    { code: 'hi', label: 'हिं' },
    { code: 'te', label: 'తె' }
  ];
  
  return (
    <div className="fixed top-6 right-6 z-50 flex items-center gap-2 bg-card/80 backdrop-blur-md border border-border rounded-full px-4 py-2 shadow-lg">
      <Globe className="w-4 h-4 text-muted-foreground" />
      {languages.map(({ code, label }) => (
        <button
          key={code}
          data-testid={`language-toggle-${code}`}
          onClick={() => setLanguage(code)}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
            language === code
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-foreground hover:bg-muted'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
};
