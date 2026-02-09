import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sprout, TrendingUp, AlertCircle, Lightbulb, Zap, RotateCcw, Briefcase, Target, TrendingDown, Shield, BarChart3, ChevronDown } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { LanguageToggle } from '../components/LanguageToggle';
import { calculateResults } from '../utils/scoring';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../components/ui/accordion";

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
    const calculatedResults = calculateResults(answers, language);
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
  
  const { primary, secondary, allCategories, detailedInsights } = results;
  
  // Get category label
  const getCategoryLabel = (category) => {
    const labels = {
      structure: 'Structure & Planning',
      analytical: 'Analytical Thinking',
      social: 'Social Initiative',
      empathy: 'Empathy & Support',
      curiosity: 'Curiosity & Learning',
      focus: 'Focus Management',
      civic: 'Civic Responsibility',
      responsibility: 'Personal Accountability',
      decisiveness: 'Decision Making',
      adaptability: 'Adaptability'
    };
    return labels[category] || category;
  };
  
  return (
    <div className="min-h-screen bg-background">
      <LanguageToggle />
      
      <div className="max-w-5xl mx-auto px-6 py-16">
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
          <p className="text-lg text-muted-foreground">Your comprehensive self-reflection insights</p>
        </div>
        
        {/* Primary & Secondary Styles */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div data-testid="primary-style-card" className="bg-primary text-primary-foreground rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-5 h-5" />
              <span className="text-sm font-medium opacity-90">{t('results.primaryStyle')}</span>
            </div>
            <h2 className="text-3xl font-heading font-bold mb-2">{primary.title}</h2>
            <p className="text-base opacity-90">{primary.description}</p>
          </div>
          
          <div data-testid="secondary-style-card" className="bg-secondary text-secondary-foreground rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="w-5 h-5" />
              <span className="text-sm font-medium opacity-90">{t('results.secondaryStyle')}</span>
            </div>
            <h2 className="text-3xl font-heading font-bold mb-2">{secondary.title}</h2>
            <p className="text-base opacity-90">{secondary.description}</p>
          </div>
        </div>
        
        {/* All Categories Score Breakdown */}
        <div className="bg-card border border-border/50 rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-accent/20 rounded-2xl flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-accent-foreground" />
            </div>
            <h3 className="text-2xl font-heading font-semibold text-foreground">
              Your Pattern Breakdown
            </h3>
          </div>
          <div className="space-y-4">
            {allCategories.map(({ category, score, maxScore, percentage, profile }) => (
              <div key={category} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-foreground">{getCategoryLabel(category)}</span>
                  <span className="text-sm text-muted-foreground">{score}/{maxScore}</span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Collapsible Detailed Sections */}
        <Accordion type="multiple" className="space-y-4 mb-8">
          {/* Strengths & Watch-outs */}
          <AccordionItem value="strengths" className="bg-card border border-border/50 rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <AccordionTrigger className="px-8 py-6 hover:no-underline">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
                <span className="text-xl font-heading font-semibold text-foreground">
                  Strengths & Watch-outs
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-8 pb-6">
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-foreground mb-3">Your Strengths</h4>
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
                <div>
                  <h4 className="font-semibold text-foreground mb-3">Watch-outs</h4>
                  <ul className="space-y-2">
                    {primary.watchOuts.map((watchOut, index) => (
                      <li key={index} className="flex items-start gap-2 text-muted-foreground">
                        <AlertCircle className="w-4 h-4 text-accent-foreground mt-1 flex-shrink-0" />
                        <span>{watchOut}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
          
          {/* Life Patterns & Next Steps */}
          <AccordionItem value="patterns" className="bg-card border border-border/50 rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <AccordionTrigger className="px-8 py-6 hover:no-underline">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-secondary/20 rounded-2xl flex items-center justify-center">
                  <Lightbulb className="w-5 h-5 text-secondary" />
                </div>
                <span className="text-xl font-heading font-semibold text-foreground">
                  Your Life Patterns & Next Steps
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-8 pb-6 space-y-4">
              <div>
                <h4 className="font-semibold text-foreground mb-2">Your Patterns</h4>
                <p className="text-base text-muted-foreground leading-relaxed">
                  {primary.patterns}
                </p>
              </div>
              <div className="bg-accent/10 border border-accent/30 rounded-2xl p-6">
                <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-accent-foreground" />
                  Next Steps
                </h4>
                <p className="text-base text-foreground/80 leading-relaxed">
                  {primary.nextSteps}
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>
          
          {/* How You Work Best */}
          <AccordionItem value="workstyle" className="bg-card border border-border/50 rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <AccordionTrigger className="px-8 py-6 hover:no-underline">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-primary" />
                </div>
                <span className="text-xl font-heading font-semibold text-foreground">
                  How You Work Best
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-8 pb-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Environment</h4>
                  <p className="text-sm text-muted-foreground">{detailedInsights.workStyle.environment}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Schedule</h4>
                  <p className="text-sm text-muted-foreground">{detailedInsights.workStyle.schedule}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Collaboration</h4>
                  <p className="text-sm text-muted-foreground">{detailedInsights.workStyle.collaboration}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Tools</h4>
                  <p className="text-sm text-muted-foreground">{detailedInsights.workStyle.tools}</p>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
          
          {/* Career & Study Paths */}
          <AccordionItem value="career" className="bg-card border border-border/50 rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <AccordionTrigger className="px-8 py-6 hover:no-underline">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-secondary/20 rounded-2xl flex items-center justify-center">
                  <Target className="w-5 h-5 text-secondary" />
                </div>
                <span className="text-xl font-heading font-semibold text-foreground">
                  Career & Study Paths
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-8 pb-6">
              <p className="text-sm text-muted-foreground mb-4">Based on your profile, these paths may align well with your natural strengths:</p>
              <div className="grid md:grid-cols-2 gap-3">
                {detailedInsights.careerPaths.map((path, index) => (
                  <div key={index} className="flex items-center gap-2 text-foreground bg-muted/50 rounded-xl px-4 py-3">
                    <div className="w-2 h-2 bg-primary rounded-full" />
                    <span className="text-sm font-medium">{path}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-4 italic">
                Note: These are suggestions, not limitations. Your interests and circumstances matter most.
              </p>
            </AccordionContent>
          </AccordionItem>
          
          {/* Growth Areas */}
          <AccordionItem value="growth" className="bg-card border border-border/50 rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <AccordionTrigger className="px-8 py-6 hover:no-underline">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-accent/20 rounded-2xl flex items-center justify-center">
                  <TrendingDown className="w-5 h-5 text-accent-foreground" />
                </div>
                <span className="text-xl font-heading font-semibold text-foreground">
                  Growth Areas
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-8 pb-6">
              <div className="space-y-6">
                {detailedInsights.growthAreas.map((growth, index) => (
                  <div key={index} className="border-l-4 border-primary pl-6 py-2">
                    <h4 className="font-semibold text-foreground mb-2">{growth.area}</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      <span className="font-medium text-foreground">Try this:</span> {growth.tip}
                    </p>
                    <p className="text-xs text-muted-foreground italic">
                      <span className="font-medium">Why:</span> {growth.why}
                    </p>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
          
          {/* Superhero Archetype */}
          <AccordionItem value="superhero" className="bg-gradient-to-br from-primary/5 to-secondary/5 border border-border/50 rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <AccordionTrigger className="px-8 py-6 hover:no-underline">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-accent/30 rounded-2xl flex items-center justify-center">
                  <Shield className="w-5 h-5 text-accent-foreground" />
                </div>
                <span className="text-xl font-heading font-semibold text-foreground">
                  Your Superhero Archetype
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-8 pb-6">
              <div className="text-center space-y-4">
                <div className="text-5xl mb-4">🦸</div>
                <h3 className="text-2xl font-heading font-bold text-foreground">
                  {detailedInsights.superhero.name}
                </h3>
                <p className="text-lg text-muted-foreground italic">
                  "{detailedInsights.superhero.motto}"
                </p>
                <div className="bg-card rounded-2xl p-6 space-y-3">
                  <div>
                    <span className="font-semibold text-foreground">Superpower:</span>
                    <p className="text-muted-foreground">{detailedInsights.superhero.power}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-foreground">Your Impact:</span>
                    <p className="text-muted-foreground">{detailedInsights.superhero.strength}</p>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        
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
