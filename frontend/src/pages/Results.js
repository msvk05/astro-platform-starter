import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sprout, TrendingUp, AlertCircle, Lightbulb, Zap, RotateCcw } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { LanguageToggle } from '../components/LanguageToggle';
import { calculateResults } from '../utils/scoring';

const Results = () => {
  const navigate = useNavigate();
  const { language, t } = useLanguage();
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
  
  const handleRestart = () => {
    localStorage.removeItem('seedling-answers');
    navigate('/');
  };
  
  if (!results) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="animate-pulse">Loading...</div>
    </div>;
  }
  
  const { primary, secondary } = results;
  
  return (
    <div className="min-h-screen bg-background">
      <LanguageToggle />
      
      <div className="max-w-4xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-12 space-y-4 animate-fade-in">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-primary/10 rounded-3xl flex items-center justify-center">
              <Sprout className="w-10 h-10 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground">
            {t('results.title')}
          </h1>
        </div>
        
        {/* Primary & Secondary Styles */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Primary Style */}
          <div data-testid="primary-style-card" className="bg-primary text-primary-foreground rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-5 h-5" />
              <span className="text-sm font-medium opacity-90">{t('results.primaryStyle')}</span>
            </div>
            <h2 className="text-3xl font-heading font-bold mb-2">{primary.title}</h2>
            <p className="text-base opacity-90">{primary.description}</p>
          </div>
          
          {/* Secondary Style */}
          <div data-testid="secondary-style-card" className="bg-secondary text-secondary-foreground rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="w-5 h-5" />
              <span className="text-sm font-medium opacity-90">{t('results.secondaryStyle')}</span>
            </div>
            <h2 className="text-3xl font-heading font-bold mb-2">{secondary.title}</h2>
            <p className="text-base opacity-90">{secondary.description}</p>
          </div>
        </div>
        
        {/* Detailed Insights */}
        <div className="space-y-6 mb-8">
          {/* Strengths */}
          <div data-testid="strengths-card" className="bg-card border border-border/50 rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-2xl font-heading font-semibold text-foreground">
                {t('results.strengths')}
              </h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {primary.strengths.map((strength, index) => (
                <span 
                  key={index}
                  className="px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium"
                >
                  {strength}
                </span>
              ))}
            </div>
          </div>
          
          {/* Watch-outs */}
          <div data-testid="watchouts-card" className="bg-card border border-border/50 rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-accent/20 rounded-2xl flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-accent-foreground" />
              </div>
              <h3 className="text-2xl font-heading font-semibold text-foreground">
                {t('results.watchOuts')}
              </h3>
            </div>
            <ul className="space-y-2">
              {primary.watchOuts.map((watchOut, index) => (
                <li key={index} className="flex items-start gap-2 text-muted-foreground">
                  <span className="text-accent-foreground mt-1">•</span>
                  <span>{watchOut}</span>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Patterns */}
          <div data-testid="patterns-card" className="bg-card border border-border/50 rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-secondary/20 rounded-2xl flex items-center justify-center">
                <Lightbulb className="w-5 h-5 text-secondary" />
              </div>
              <h3 className="text-2xl font-heading font-semibold text-foreground">
                {t('results.patterns')}
              </h3>
            </div>
            <p className="text-base text-muted-foreground leading-relaxed">
              {primary.patterns}
            </p>
          </div>
          
          {/* Next Steps */}
          <div data-testid="nextsteps-card" className="bg-accent/10 border border-accent/30 rounded-3xl p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-accent/30 rounded-2xl flex items-center justify-center">
                <Zap className="w-5 h-5 text-accent-foreground" />
              </div>
              <h3 className="text-2xl font-heading font-semibold text-foreground">
                {t('results.nextSteps')}
              </h3>
            </div>
            <p className="text-base text-foreground/80 leading-relaxed mb-4">
              {primary.nextSteps}
            </p>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            data-testid="try-challenge-btn"
            onClick={() => navigate('/challenges')}
            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-8 py-4 text-lg font-medium transition-all hover:scale-105 active:scale-95 shadow-[0_4px_14px_0_rgba(0,0,0,0.1)] inline-flex items-center justify-center gap-2"
          >
            <Zap className="w-5 h-5" />
            {t('results.tryChallenge')}
            <span className="text-sm opacity-80">({t('results.challengeDuration')})</span>
          </button>
          
          <button
            data-testid="restart-btn"
            onClick={handleRestart}
            className="border-2 border-primary text-primary hover:bg-primary/5 rounded-full px-6 py-4 font-medium transition-all inline-flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-5 h-5" />
            {t('results.restart')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Results;
