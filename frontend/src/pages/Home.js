import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sprout, CheckCircle2, Users, Zap } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { LanguageToggle } from '../components/LanguageToggle';

const Home = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  return (
    <div className="min-h-screen bg-background">
      <LanguageToggle />
      
      {/* Hero Section */}
      <div className="max-w-4xl mx-auto px-6 py-16 md:py-24">
        <div className="text-center space-y-6 animate-fade-in">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center">
              <Sprout className="w-12 h-12 text-primary" />
            </div>
          </div>
          
          {/* Title */}
          <div className="space-y-2">
            <h1 className="text-5xl md:text-6xl font-heading font-bold text-foreground tracking-tight">
              {t('home.title')}
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground font-medium">
              {t('home.subtitle')}
            </p>
          </div>
          
          {/* Tagline */}
          <p className="text-lg md:text-xl text-foreground/80 max-w-2xl mx-auto">
            {t('home.tagline')}
          </p>
          
          {/* CTA Button */}
          <div className="pt-4">
            <button
              data-testid="start-assessment-btn"
              onClick={() => navigate('/assessment')}
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-8 py-4 text-lg font-medium transition-all hover:scale-105 active:scale-95 shadow-[0_4px_14px_0_rgba(0,0,0,0.1)] inline-flex items-center gap-2"
            >
              {t('home.startButton')}
              <span className="text-sm opacity-80">({t('home.duration')})</span>
            </button>
          </div>
          
          {/* Promise */}
          <p className="text-sm text-muted-foreground italic">
            {t('home.promise')}
          </p>
        </div>
        
        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-6 mt-20 animate-slide-up">
          {/* Card 1 */}
          <div className="bg-card border border-border/50 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.08)] transition-all">
            <div className="w-12 h-12 bg-accent/20 rounded-2xl flex items-center justify-center mb-4">
              <CheckCircle2 className="w-6 h-6 text-accent-foreground" />
            </div>
            <h3 className="text-xl font-heading font-semibold mb-2 text-foreground">
              {t('home.whatIs')}
            </h3>
            <p className="text-base text-muted-foreground leading-relaxed">
              {t('home.whatIsDesc')}
            </p>
          </div>
          
          {/* Card 2 */}
          <div className="bg-card border border-border/50 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.08)] transition-all">
            <div className="w-12 h-12 bg-secondary/20 rounded-2xl flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-secondary" />
            </div>
            <h3 className="text-xl font-heading font-semibold mb-2 text-foreground">
              {t('home.whoFor')}
            </h3>
            <p className="text-base text-muted-foreground leading-relaxed">
              {t('home.whoForDesc')}
            </p>
          </div>
          
          {/* Card 3 */}
          <div className="bg-card border border-border/50 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.08)] transition-all">
            <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-heading font-semibold mb-2 text-foreground">
              {t('home.whatYouGet')}
            </h3>
            <p className="text-base text-muted-foreground leading-relaxed">
              {t('home.whatYouGetDesc')}
            </p>
          </div>
        </div>
        
        {/* Image Section */}
        <div className="mt-16 rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <img 
            src="https://images.unsplash.com/photo-1766393610174-8643aa76c037?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzF8MHwxfHNlYXJjaHwxfHxzbWFsbCUyMGdyZWVuJTIwcGxhbnQlMjBzZWVkbGluZyUyMGdyb3dpbmclMjBzb2lsfGVufDB8fHx8MTc3MDY0MTkwM3ww&ixlib=rb-4.1.0&q=85"
            alt="Seedling growing"
            className="w-full h-64 md:h-96 object-cover"
          />
        </div>
      </div>
    </div>
  );
};

export default Home;
