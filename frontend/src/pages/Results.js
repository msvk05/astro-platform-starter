import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sprout, TrendingUp, AlertCircle, Lightbulb, Zap, RotateCcw, Briefcase, Target, TrendingDown, Shield, BarChart3, ChevronDown, Copy, Check } from 'lucide-react';
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
  const [enrichedInsights, setEnrichedInsights] = useState(null);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [showDeeperInsights, setShowDeeperInsights] = useState(false);
  const [enrichmentCallCount, setEnrichmentCallCount] = useState(0);
  const [enrichmentError, setEnrichmentError] = useState(null);
  
  const MAX_ENRICHMENT_CALLS = 1; // Strict limit: 1 AI call per session
  const ENRICHMENT_TIMEOUT = 7000; // 7 seconds max
  
  useEffect(() => {
    const savedAnswers = localStorage.getItem('seedling-answers');
    if (!savedAnswers) {
      navigate('/');
      return;
    }
    
    const answers = JSON.parse(savedAnswers);
    const calculatedResults = calculateResults(answers, language);
    setResults(calculatedResults);
    
    // Check session enrichment count
    const sessionCount = parseInt(sessionStorage.getItem('seedling-enrichment-count') || '0');
    setEnrichmentCallCount(sessionCount);
    
    // DO NOT auto-fetch - user must trigger
  }, [navigate, language]);
  
  const fetchEnrichedInsights = async () => {
    // Rate limit check
    if (enrichmentCallCount >= MAX_ENRICHMENT_CALLS) {
      setEnrichmentError('Insight generation limit reached for this session. Please retake assessment for new insights.');
      return;
    }
    
    // Clear error and start loading
    setEnrichmentError(null);
    setLoadingInsights(true);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), ENRICHMENT_TIMEOUT);
    
    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      const savedAnswers = localStorage.getItem('seedling-answers');
      const answers = JSON.parse(savedAnswers);
      
      const challengeData = localStorage.getItem('seedling-challenge');
      const microChallenge = challengeData ? JSON.parse(challengeData) : null;
      
      const response = await fetch(`${BACKEND_URL}/api/enrich-insights`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          answers: answers,
          scores: results.scores,
          primary_style: results.primary.title,
          secondary_style: results.secondary.title,
          language: language,
          micro_challenge: microChallenge
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        
        const hasInsights = !!(data && (
          data.insights ||
          data.why_this_fits ||
          data.deeper_watchouts ||
          data.shareable_summary ||
          data.micro_challenge_insight
        ));
        
        if (hasInsights) {
          setEnrichedInsights(data);
          setEnrichmentError(null);
          setLoadingInsights(false);
          
          const newCount = enrichmentCallCount + 1;
          setEnrichmentCallCount(newCount);
          sessionStorage.setItem('seedling-enrichment-count', newCount.toString());
          
          recordAnonymousAnalytics();
          return;
        } else {
          setEnrichmentError('Unable to generate insights. Please try again.');
        }
      } else {
        setEnrichmentError('Unable to generate insights. Your base results are still available below.');
      }
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        setEnrichmentError('Request timed out. Please try again.');
      } else {
        setEnrichmentError('Unable to generate insights. Your base results are still available below.');
      }
      console.error('Failed to fetch enriched insights:', error);
    } finally {
      setLoadingInsights(false);
    }
  };
  
  const recordAnonymousAnalytics = async () => {
    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      const challengeData = localStorage.getItem('seedling-challenge');
      
      // PRIVACY: Only aggregated, non-PII data
      await fetch(`${BACKEND_URL}/api/analytics/record`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          primary_style: results.primary.title,
          challenge_selected: challengeData ? JSON.parse(challengeData).challengeId : null,
          language: language
          // NO raw answers, NO text responses, NO identifiable data
        }),
      });
    } catch (error) {
      // Silent fail - analytics not critical
      console.log('Analytics recording skipped');
    }
  };
  
  const downloadPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let yPosition = 20;
    
    // Title
    doc.setFontSize(24);
    doc.setFont(undefined, 'bold');
    doc.text('Seedling Self-Reflection', margin, yPosition);
    yPosition += 10;
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(new Date().toLocaleDateString(), margin, yPosition);
    yPosition += 15;
    
    // Disclaimer
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text('This is a self-reflection snapshot, not a certificate', margin, yPosition);
    yPosition += 10;
    doc.setTextColor(0);
    
    // Primary Style
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text('Primary Style', margin, yPosition);
    yPosition += 8;
    
    doc.setFontSize(14);
    doc.text(results.primary.title, margin, yPosition);
    yPosition += 6;
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    const descLines = doc.splitTextToSize(results.primary.description, pageWidth - 2 * margin);
    doc.text(descLines, margin, yPosition);
    yPosition += descLines.length * 5 + 8;
    
    // Strengths
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('Your Strengths', margin, yPosition);
    yPosition += 6;
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    results.primary.strengths.forEach(strength => {
      doc.text(`- ${strength}`, margin + 5, yPosition);
      yPosition += 5;
    });
    yPosition += 5;
    
    // Watch-outs
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('Watch-outs', margin, yPosition);
    yPosition += 6;
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    results.primary.watchOuts.forEach(watchOut => {
      const lines = doc.splitTextToSize(`- ${watchOut}`, pageWidth - 2 * margin - 5);
      doc.text(lines, margin + 5, yPosition);
      yPosition += lines.length * 5;
    });
    yPosition += 5;
    
    // Patterns
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('Your Life Patterns', margin, yPosition);
    yPosition += 6;
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    const patternLines = doc.splitTextToSize(results.primary.patterns, pageWidth - 2 * margin);
    doc.text(patternLines, margin, yPosition);
    yPosition += patternLines.length * 5 + 8;
    
    // Next Steps
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('Next Steps', margin, yPosition);
    yPosition += 6;
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    const nextStepLines = doc.splitTextToSize(results.primary.nextSteps, pageWidth - 2 * margin);
    doc.text(nextStepLines, margin, yPosition);
    yPosition += nextStepLines.length * 5 + 10;
    
    // LLM Enriched Insights (if available)
    if (enrichedInsights) {
      if (yPosition > 240) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text('Personalized AI Insights', margin, yPosition);
      yPosition += 8;
      
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      const whyLines = doc.splitTextToSize(enrichedInsights.why_this_fits, pageWidth - 2 * margin);
      doc.text(whyLines, margin, yPosition);
      yPosition += whyLines.length * 5 + 6;
      
      const nextStepEnrichedLines = doc.splitTextToSize(enrichedInsights.personalized_next_steps, pageWidth - 2 * margin);
      doc.text(nextStepEnrichedLines, margin, yPosition);
      yPosition += nextStepEnrichedLines.length * 5 + 8;
    } else {
      if (yPosition > 240) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text('Personalized AI Insights', margin, yPosition);
      yPosition += 6;
      
      doc.setFontSize(9);
      doc.setFont(undefined, 'italic');
      doc.text('Not generated (click "Generate Insights" button to create)', margin, yPosition);
      yPosition += 10;
    }
    
    // Micro-challenge (if completed)
    const challengeData = localStorage.getItem('seedling-challenge');
    if (challengeData) {
      const challenge = JSON.parse(challengeData);
      
      if (yPosition > 230) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text('Micro-Challenge Completed', margin, yPosition);
      yPosition += 6;
      
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.text(`Challenge: ${challenge.challengeId}`, margin, yPosition);
      yPosition += 6;
      
      Object.entries(challenge.responses).forEach(([key, value]) => {
        const respLines = doc.splitTextToSize(`${key}: ${value}`, pageWidth - 2 * margin - 5);
        doc.text(respLines, margin + 5, yPosition);
        yPosition += respLines.length * 5;
      });
    }
    
    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text('Generated by Seedling - Self-Reflection Tool', margin, doc.internal.pageSize.getHeight() - 10);
    
    // Save PDF
    doc.save(`seedling-reflection-${new Date().toISOString().split('T')[0]}.pdf`);
  };
  
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
      en: {
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
      },
      hi: {
        structure: 'संरचना और योजना',
        analytical: 'विश्लेषणात्मक सोच',
        social: 'सामाजिक पहल',
        empathy: 'सहानुभूति और समर्थन',
        curiosity: 'जिज्ञासा और सीखना',
        focus: 'फोकस प्रबंधन',
        civic: 'नागरिक जिम्मेदारी',
        responsibility: 'व्यक्तिगत जवाबदेही',
        decisiveness: 'निर्णय लेना',
        adaptability: 'अनुकूलन क्षमता'
      },
      te: {
        structure: 'నిర్మాణం & ప్రణాళిक',
        analytical: 'విశ్లేషణాత్మక ఆలోచన',
        social: 'సామాజిక చొరవ',
        empathy: 'సానుభూతి & మద్దతు',
        curiosity: 'ఉత్సుకత & నేర్చుకోవడం',
        focus: 'ఫోకస్ నిర్వహణ',
        civic: 'పౌర బాధ్యత',
        responsibility: 'వ్యక్తిగత జవాబుదారీతనం',
        decisiveness: 'నిర్ణయం తీసుకోవడం',
        adaptability: 'అనుకూలత'
      }
    };
    return labels[language]?.[category] || labels.en[category] || category;
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
          <p className="text-lg text-muted-foreground">{t('results.subtitle')}</p>
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
              {t('results.patternBreakdown')}
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
                  {t('results.strengthsWatchouts')}
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-8 pb-6">
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-foreground mb-3">{t('results.strengths')}</h4>
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
                  <h4 className="font-semibold text-foreground mb-3">{t('results.watchOuts')}</h4>
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
                  {t('results.lifePatternsNextSteps')}
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-8 pb-6 space-y-4">
              <div>
                <h4 className="font-semibold text-foreground mb-2">{t('results.patterns')}</h4>
                <p className="text-base text-muted-foreground leading-relaxed">
                  {primary.patterns}
                </p>
              </div>
              <div className="bg-accent/10 border border-accent/30 rounded-2xl p-6">
                <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-accent-foreground" />
                  {t('results.nextSteps')}
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
                  {t('results.howYouWorkBest')}
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-8 pb-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-foreground mb-2">{t('results.environment')}</h4>
                  <p className="text-sm text-muted-foreground">{detailedInsights.workStyle.environment}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">{t('results.schedule')}</h4>
                  <p className="text-sm text-muted-foreground">{detailedInsights.workStyle.schedule}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">{t('results.collaboration')}</h4>
                  <p className="text-sm text-muted-foreground">{detailedInsights.workStyle.collaboration}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">{t('results.tools')}</h4>
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
                  {t('results.careerStudyPaths')}
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-8 pb-6">
              <p className="text-sm text-muted-foreground mb-4">{t('results.careerPathsNote')}</p>
              <div className="grid md:grid-cols-2 gap-3">
                {detailedInsights.careerPaths.map((path, index) => (
                  <div key={index} className="flex items-center gap-2 text-foreground bg-muted/50 rounded-xl px-4 py-3">
                    <div className="w-2 h-2 bg-primary rounded-full" />
                    <span className="text-sm font-medium">{path}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-4 italic">
                {t('results.careerPathsDisclaimer')}
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
                  {t('results.growthAreas')}
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-8 pb-6">
              <div className="space-y-6">
                {detailedInsights.growthAreas.map((growth, index) => (
                  <div key={index} className="border-l-4 border-primary pl-6 py-2">
                    <h4 className="font-semibold text-foreground mb-2">{growth.area}</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      <span className="font-medium text-foreground">{t('results.tryThis')}</span> {growth.tip}
                    </p>
                    <p className="text-xs text-muted-foreground italic">
                      <span className="font-medium">{t('results.why')}</span> {growth.why}
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
                  {t('results.superheroArchetype')}
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
                    <span className="font-semibold text-foreground">{t('results.superpower')}</span>
                    <p className="text-muted-foreground">{detailedInsights.superhero.power}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-foreground">{t('results.yourImpact')}</span>
                    <p className="text-muted-foreground">{detailedInsights.superhero.strength}</p>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        
        {/* LLM Enriched Insights - USER TRIGGERED ONLY */}
        {!enrichedInsights && !loadingInsights && enrichmentCallCount < MAX_ENRICHMENT_CALLS && (
          <div className="bg-gradient-to-br from-accent/10 to-primary/5 border border-accent/30 rounded-3xl p-8 text-center">
            <h3 className="text-xl font-heading font-semibold text-foreground mb-3">
              Get Personalized AI Insights
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Get deeper, personalized analysis of your results (uses AI, limited to {MAX_ENRICHMENT_CALLS} per session)
            </p>
            <button
              data-testid="generate-insights-btn"
              onClick={fetchEnrichedInsights}
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-8 py-3 font-medium transition-all hover:scale-105 active:scale-95 shadow-[0_4px_14px_0_rgba(0,0,0,0.1)]"
            >
              Generate Insights
            </button>
            <p className="text-xs text-muted-foreground mt-3">
              ({MAX_ENRICHMENT_CALLS - enrichmentCallCount} remaining this session)
            </p>
          </div>
        )}
        
        {loadingInsights && (
          <div className="bg-gradient-to-br from-accent/10 to-primary/5 border border-accent/30 rounded-3xl p-8 text-center">
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
            </div>
            <p className="text-muted-foreground">Generating personalized insights...</p>
            <p className="text-xs text-muted-foreground mt-2">This may take up to 7 seconds</p>
          </div>
        )}
        
        {enrichmentError && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-3xl p-6 text-center">
            <p className="text-sm text-destructive">{enrichmentError}</p>
          </div>
        )}
        
        {enrichedInsights && !showDeeperInsights && (
          <div className="bg-gradient-to-br from-accent/10 to-primary/5 border border-accent/30 rounded-3xl p-8 space-y-4">
            <h3 className="text-xl font-heading font-semibold text-foreground flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-accent-foreground" />
              Personalized Insights
            </h3>
            
            <div className="space-y-4 text-foreground/90">
              <div>
                <h4 className="font-semibold mb-2">Why This Fits You</h4>
                <p className="text-sm leading-relaxed">{enrichedInsights.why_this_fits}</p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Watch Out For</h4>
                <ul className="space-y-1 text-sm">
                  {enrichedInsights.deeper_watchouts.slice(0, 2).map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-accent-foreground mt-0.5">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Your Next Step</h4>
                <p className="text-sm leading-relaxed">{enrichedInsights.personalized_next_steps}</p>
              </div>
            </div>
            
            <button
              onClick={() => setShowDeeperInsights(true)}
              disabled={loadingInsights}
              className="text-primary hover:text-primary/80 font-medium text-sm flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Get Deeper Insights
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        )}
        
        {enrichedInsights && showDeeperInsights && (
          <div className="bg-gradient-to-br from-accent/10 to-primary/5 border border-accent/30 rounded-3xl p-8 space-y-6">
            <h3 className="text-xl font-heading font-semibold text-foreground flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-accent-foreground" />
              Complete Personalized Insights
            </h3>
            
            <div className="space-y-6 text-foreground/90">
              <div className="bg-card rounded-2xl p-6">
                <h4 className="font-semibold mb-3">Why This Fits You</h4>
                <p className="text-sm leading-relaxed">{enrichedInsights.why_this_fits}</p>
              </div>
              
              <div className="bg-card rounded-2xl p-6">
                <h4 className="font-semibold mb-3">Deeper Watch-Outs</h4>
                <ul className="space-y-2 text-sm">
                  {enrichedInsights.deeper_watchouts.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-accent-foreground mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="bg-card rounded-2xl p-6">
                <h4 className="font-semibold mb-3">Personalized Next Steps</h4>
                <p className="text-sm leading-relaxed">{enrichedInsights.personalized_next_steps}</p>
              </div>
              
              {enrichedInsights.micro_challenge_insight && (
                <div className="bg-primary/10 rounded-2xl p-6">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-primary" />
                    Your Challenge Insight
                  </h4>
                  <p className="text-sm leading-relaxed">{enrichedInsights.micro_challenge_insight}</p>
                </div>
              )}
              
              <div className="bg-card rounded-2xl p-6">
                <h4 className="font-semibold mb-3">Share Your Learning</h4>
                <p className="text-sm italic text-muted-foreground">"{enrichedInsights.shareable_summary}"</p>
              </div>
            </div>
            
            <button
              onClick={() => setShowDeeperInsights(false)}
              className="text-primary hover:text-primary/80 font-medium text-sm flex items-center gap-2 transition-colors"
            >
              Show Less
              <ChevronDown className="w-4 h-4 rotate-180" />
            </button>
          </div>
        )}
        
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
