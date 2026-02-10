import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Copy, Check } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { LanguageToggle } from '../components/LanguageToggle';
import { calculateResults } from '../utils/scoring';

const Challenges = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [responses, setResponses] = useState({});
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
    const calculatedResults = calculateResults(answers, language);
    setResults(calculatedResults);
  }, [navigate, language]);
  
  const challenges = [
    {
      id: 'cyber',
      title: t('challenges.themes.cyber.title'),
      icon: t('challenges.themes.cyber.icon'),
      description: t('challenges.themes.cyber.description'),
      questions: t('challenges.themes.cyber.questions') || []
    },
    {
      id: 'focus',
      title: t('challenges.themes.focus.title'),
      icon: t('challenges.themes.focus.icon'),
      description: t('challenges.themes.focus.description'),
      questions: t('challenges.themes.focus.questions') || []
    },
    {
      id: 'civic',
      title: t('challenges.themes.civic.title'),
      icon: t('challenges.themes.civic.icon'),
      description: t('challenges.themes.civic.description'),
      questions: t('challenges.themes.civic.questions') || []
    }
  ];
  
  const handleResponseChange = (questionId, value) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
  };
  
  const handleSubmit = () => {
    const allAnswered = selectedChallenge.questions.every(q => 
      responses[q.id] && responses[q.id].trim() !== ''
    );
    
    if (allAnswered) {
      // Save challenge responses to localStorage for LLM enrichment
      localStorage.setItem('seedling-challenge', JSON.stringify({
        challengeId: selectedChallenge.id,
        responses: responses
      }));
      setIsSubmitted(true);
    }
  };
  
  const generateSummary = () => {
    if (!results || !selectedChallenge || !responses) return '';
    
    let summary = `🌱 Seedling - My Reflection & Action\n\n`;
    summary += `Primary Style: ${results.primary.title}\n`;
    summary += `${results.primary.description}\n\n`;
    summary += `Challenge Completed: ${selectedChallenge.title}\n`;
    summary += `${selectedChallenge.description}\n\n`;
    summary += `My Responses:\n`;
    
    selectedChallenge.questions.forEach(q => {
      summary += `${q.text}\n`;
      summary += `→ ${responses[q.id]}\n\n`;
    });
    
    summary += `Key Strength: ${results.primary.strengths[0]}\n`;
    summary += `Next Step: ${results.primary.nextSteps}\n\n`;
    summary += `---\nCompleted via Seedling - Self-Reflection Tool`;
    
    return summary;
  };
  
  const handleCopy = async () => {
    const summary = generateSummary();
    
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
          <div className="grid md:grid-cols-3 gap-6">
            {challenges.map((challenge) => (
              <button
                key={challenge.id}
                data-testid={`challenge-${challenge.id}-btn`}
                onClick={() => {
                  setSelectedChallenge(challenge);
                  setResponses({});
                  setIsSubmitted(false);
                }}
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
          <div className="space-y-6">
            <div className="bg-card border border-border/50 rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-4xl">{selectedChallenge.icon}</span>
                <div>
                  <h2 className="text-2xl font-heading font-bold text-foreground">
                    {selectedChallenge.title}
                  </h2>
                  <p className="text-sm text-muted-foreground">{selectedChallenge.description}</p>
                </div>
              </div>
              
              <div className="space-y-6">
                {selectedChallenge.questions.map((question, index) => (
                  <div key={question.id} className="space-y-3">
                    <label className="block text-base font-medium text-foreground">
                      {index + 1}. {question.text}
                    </label>
                    
                    {question.type === 'choice' ? (
                      <div className="space-y-2">
                        {question.options.map((option, optIndex) => (
                          <button
                            key={optIndex}
                            data-testid={`question-${question.id}-option-${optIndex}`}
                            onClick={() => handleResponseChange(question.id, option)}
                            className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all ${
                              responses[question.id] === option
                                ? 'border-primary bg-primary/5 font-medium'
                                : 'border-border hover:border-primary/50 hover:bg-primary/5'
                            }`}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <input
                        type="text"
                        data-testid={`question-${question.id}-input`}
                        value={responses[question.id] || ''}
                        onChange={(e) => handleResponseChange(question.id, e.target.value)}
                        placeholder={question.placeholder}
                        maxLength={question.maxLength}
                        className="w-full p-4 rounded-xl border border-border bg-white/50 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-base"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setSelectedChallenge(null);
                  setResponses({});
                }}
                className="border-2 border-border text-foreground hover:bg-muted rounded-full px-6 py-3 font-medium transition-all"
              >
                Change Challenge
              </button>
              <button
                data-testid="submit-challenge-btn"
                onClick={handleSubmit}
                disabled={!selectedChallenge.questions.every(q => responses[q.id]?.trim())}
                className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-8 py-3 font-medium transition-all hover:scale-105 active:scale-95 shadow-[0_4px_14px_0_rgba(0,0,0,0.1)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {t('challenges.submitButton')}
              </button>
            </div>
          </div>
        ) : (
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
