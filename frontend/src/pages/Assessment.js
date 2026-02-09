import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { LanguageToggle } from '../components/LanguageToggle';
import { questions } from '../data/questions';

const Assessment = () => {
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  
  const questionsList = questions[language] || questions.en;
  const totalQuestions = questionsList.length;
  
  const answerOptions = [
    { value: 0, label: t('assessment.options.no') },
    { value: 1, label: t('assessment.options.notReally') },
    { value: 2, label: t('assessment.options.mostlyYes') },
    { value: 3, label: t('assessment.options.yes') }
  ];
  
  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 300);
    return () => clearTimeout(timer);
  }, [currentQuestion]);
  
  const handleAnswer = (value) => {
    setSelectedAnswer(value);
    setIsAnimating(true);
    
    setTimeout(() => {
      const newAnswers = [...answers];
      newAnswers[currentQuestion] = value;
      setAnswers(newAnswers);
      
      if (currentQuestion < totalQuestions - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
      } else {
        // Save to localStorage and navigate to results
        localStorage.setItem('seedling-answers', JSON.stringify(newAnswers));
        navigate('/results');
      }
    }, 300);
  };
  
  const goBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setSelectedAnswer(answers[currentQuestion - 1] ?? null);
    } else {
      navigate('/');
    }
  };
  
  const progress = ((currentQuestion + 1) / totalQuestions) * 100;
  
  return (
    <div className="min-h-screen bg-background">
      <LanguageToggle />
      
      <div className="max-w-2xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="mb-12">
          <button
            data-testid="back-button"
            onClick={goBack}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>{t('nav.home')}</span>
          </button>
          
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
            {t('assessment.title')}
          </h1>
          
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>
                {t('assessment.progress')} {currentQuestion + 1} {t('assessment.of')} {totalQuestions}
              </span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
        
        {/* Question Card */}
        <div 
          className={`bg-card border border-border/50 rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] mb-8 transition-all duration-300 ${
            isAnimating ? 'opacity-50 scale-95' : 'opacity-100 scale-100'
          }`}
        >
          <p className="text-xl md:text-2xl font-medium text-foreground leading-relaxed">
            {questionsList[currentQuestion].text}
          </p>
        </div>
        
        {/* Answer Options */}
        <div className="grid grid-cols-2 gap-4">
          {answerOptions.map((option) => (
            <button
              key={option.value}
              data-testid={`answer-option-${option.value}`}
              onClick={() => handleAnswer(option.value)}
              className={`p-6 rounded-2xl border-2 transition-all text-center font-medium ${
                selectedAnswer === option.value
                  ? 'border-primary bg-primary/5 scale-95'
                  : 'border-border hover:border-primary/50 hover:bg-primary/5 hover:scale-105 active:scale-95'
              }`}
            >
              <span className="text-lg">{option.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Assessment;
