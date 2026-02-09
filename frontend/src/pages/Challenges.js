import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Copy, Check } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { LanguageToggle } from '../components/LanguageToggle';
import { calculateResults } from '../utils/scoring';

const Challenges = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [response, setResponse] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [results, setResults] = useState(null);
  
  useEffect(() => {
    const savedAnswers = localStorage.getItem('seedling-answers');
    if (!savedAnswers) {
      navigate('/');
      return;
    }
    
    const answers = JSON.parse(savedAnswers);
    const calculatedResults = calculateResults(answers);
    setResults(calculatedResults);
  }, [navigate]);
  
  const challenges = [
    {
      id: 'cyber',
      title: t('challenges.themes.cyber.title'),
      icon: t('challenges.themes.cyber.icon'),
      description: t('challenges.themes.cyber.description'),
      prompt: t('challenges.themes.cyber.prompt')
    },
    {
      id: 'focus',
      title: t('challenges.themes.focus.title'),
      icon: t('challenges.themes.focus.icon'),
      description: t('challenges.themes.focus.description'),
      prompt: t('challenges.themes.focus.prompt')
    },
    {
      id: 'civic',
      title: t('challenges.themes.civic.title'),
      icon: t('challenges.themes.civic.icon'),
      description: t('challenges.themes.civic.description'),
      prompt: t('challenges.themes.civic.prompt')
    }
  ];
  
  const handleSubmit = () => {
    if (response.trim()) {
      setIsSubmitted(true);
    }
  };
  
  const generateSummary = () => {
    if (!results || !selectedChallenge || !response) return '';
    
    return `🌱 Seedling - My Reflection & Action

Primary Style: ${results.primary.title}
${results.primary.description}

Challenge Completed: ${selectedChallenge.title}
${selectedChallenge.description}

My Response:
${response}

Key Strength: ${results.primary.strengths[0]}
Next Step: ${results.primary.nextSteps}

---
Completed via Seedling - Self-Reflection Tool`;
  };
  
  const handleCopy = async () => {
    const summary = generateSummary();
    
    // Try modern clipboard API first
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(summary);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        return;
      } catch (err) {
        console.log('Clipboard API failed, using fallback');
      }
    }
    
    // Fallback for non-secure contexts or if clipboard API fails
    const textArea = document.createElement('textarea');
    textArea.value = summary;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      document.execCommand('copy');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      alert('Failed to copy. Please manually select and copy the text above.');
    }
    
    document.body.removeChild(textArea);
  };
  
  if (!results) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="animate-pulse">Loading...</div>
    </div>;
  }
  
  return (
    <div className="min-h-screen bg-background">
      <LanguageToggle />
      
      <div className="max-w-4xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="mb-12">
          <button
            data-testid="back-to-results-btn"
            onClick={() => navigate('/results')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>{t('challenges.backToResults')}</span>
          </button>
          
          <div className="text-center space-y-2">
            <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground">
              {t('challenges.title')}
            </h1>
            <p className="text-lg text-muted-foreground">
              {t('challenges.subtitle')}
            </p>
          </div>
        </div>
        
        {!selectedChallenge ? (
          // Challenge Selection
          <div className="grid md:grid-cols-3 gap-6">
            {challenges.map((challenge) => (
              <button
                key={challenge.id}
                data-testid={`challenge-${challenge.id}-btn`}
                onClick={() => setSelectedChallenge(challenge)}
                className="bg-card border border-border/50 rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.08)] transition-all hover:scale-105 active:scale-95 text-left group"
              >
                <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform">
                  {challenge.icon}
                </div>
                <h3 className="text-xl font-heading font-semibold text-foreground mb-2">
                  {challenge.title}
                </h3>
                <p className="text-base text-muted-foreground leading-relaxed">
                  {challenge.description}
                </p>
              </button>
            ))}
          </div>
        ) : !isSubmitted ? (
          // Challenge Response
          <div className="space-y-6">
            <div className="bg-card border border-border/50 rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-4xl">{selectedChallenge.icon}</span>
                <div>
                  <h2 className="text-2xl font-heading font-bold text-foreground">
                    {selectedChallenge.title}
                  </h2>
                  <p className="text-sm text-muted-foreground">{selectedChallenge.description}</p>
                </div>
              </div>
              
              <div className="bg-muted/50 rounded-2xl p-6 mb-6">
                <p className="text-base text-foreground leading-relaxed">
                  {selectedChallenge.prompt}
                </p>
              </div>
              
              <textarea
                data-testid="challenge-response-input"
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                placeholder="Write your thoughts here..."
                className="w-full h-48 p-4 rounded-2xl border border-border bg-white/50 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none text-base"
              />
            </div>
            
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setSelectedChallenge(null);
                  setResponse('');
                }}
                className="border-2 border-border text-foreground hover:bg-muted rounded-full px-6 py-3 font-medium transition-all"
              >
                Change Challenge
              </button>
              <button
                data-testid="submit-challenge-btn"
                onClick={handleSubmit}
                disabled={!response.trim()}
                className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-8 py-3 font-medium transition-all hover:scale-105 active:scale-95 shadow-[0_4px_14px_0_rgba(0,0,0,0.1)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {t('challenges.submitButton')}
              </button>
            </div>
          </div>
        ) : (
          // Challenge Summary
          <div className="space-y-6">
            <div className="bg-accent/10 border border-accent/30 rounded-3xl p-8">
              <h2 className="text-2xl font-heading font-bold text-foreground mb-4 flex items-center gap-2">
                <Check className="w-6 h-6 text-primary" />
                {t('challenges.outputTitle')}
              </h2>
              
              <div className="bg-card rounded-2xl p-6 mb-6 text-sm whitespace-pre-line text-foreground/80">
                {generateSummary()}
              </div>
              
              <div className="flex gap-4">
                <button
                  data-testid="copy-summary-btn"
                  onClick={handleCopy}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-6 py-3 font-medium transition-all hover:scale-105 active:scale-95 shadow-[0_4px_14px_0_rgba(0,0,0,0.1)] inline-flex items-center gap-2"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? t('challenges.copiedButton') : t('challenges.copyButton')}
                </button>
                <button
                  onClick={() => navigate('/results')}
                  className="border-2 border-primary text-primary hover:bg-primary/5 rounded-full px-6 py-3 font-medium transition-all"
                >
                  {t('challenges.backToResults')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Challenges;
