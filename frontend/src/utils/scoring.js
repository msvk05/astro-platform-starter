export const calculateResults = (answers, language = 'en') => {
  const categoryScores = {};
  const maxScore = 4; // Max value for each answer (0-3 mapped to "No" through "Yes")
  
  // Calculate scores for each category
  answers.forEach((answer, index) => {
    const questionIndex = index; // 0-based
    const category = getQuestionCategory(questionIndex);
    const isPositive = isQuestionPositive(questionIndex);
    
    // Score: 0=No, 1=Not really, 2=Mostly yes, 3=Yes
    let score = answer;
    
    // For negative questions, invert the score
    if (!isPositive) {
      score = 3 - score;
    }
    
    if (!categoryScores[category]) {
      categoryScores[category] = 0;
    }
    categoryScores[category] += score;
  });
  
  // Determine primary and secondary styles
  const sortedCategories = Object.entries(categoryScores)
    .sort(([, a], [, b]) => b - a);
  
  const primaryCategory = sortedCategories[0]?.[0] || 'balanced';
  const secondaryCategory = sortedCategories[1]?.[0] || 'balanced';
  
  // Get all category profiles with scores
  const allCategories = sortedCategories.map(([category, score]) => ({
    category,
    score,
    maxScore: 3,
    percentage: Math.round((score / 3) * 100),
    profile: getStyleProfile(category)
  }));
  
  // Ensure all categories are present even if score is 0
  const allCategoryNames = ['structure', 'analytical', 'social', 'empathy', 'curiosity', 'focus', 'civic', 'responsibility', 'decisiveness', 'adaptability'];
  
  const completeCategories = allCategoryNames.map(category => {
    const score = categoryScores[category] || 0;
    return {
      category,
      score,
      maxScore: 3,
      percentage: Math.round((score / 3) * 100),
      profile: getStyleProfile(category)
    };
  }).sort((a, b) => b.score - a.score);
  
  return {
    primary: getStyleProfile(primaryCategory),
    secondary: getStyleProfile(secondaryCategory),
    scores: categoryScores,
    allCategories: completeCategories,
    detailedInsights: getDetailedInsights(primaryCategory, secondaryCategory, language)
  };
};

const getQuestionCategory = (index) => {
  const categories = [
    'structure',      // Q1
    'analytical',     // Q2
    'social',         // Q3
    'empathy',        // Q4
    'curiosity',      // Q5
    'focus',          // Q6
    'civic',          // Q7
    'responsibility', // Q8
    'decisiveness',   // Q9
    'adaptability'    // Q10
  ];
  return categories[index] || 'balanced';
};

const isQuestionPositive = (index) => {
  // Questions 6 and 9 are negatively framed
  return index !== 5 && index !== 8;
};

const getStyleProfile = (category) => {
  const profiles = {
    en: {
      structure: {
        title: 'The Planner',
        description: 'You thrive with organization and clear goals',
        strengths: ['Strong execution', 'Reliable', 'Detail-oriented', 'Time management'],
        watchOuts: ['May struggle with sudden changes', 'Can be rigid at times'],
        patterns: 'You work best when you have a clear roadmap. You naturally break big goals into smaller steps.',
        nextSteps: 'Try managing a small project this week using a simple checklist or planner.'
      },
      analytical: {
        title: 'The Thinker',
        description: 'You approach problems with logic and reason',
        strengths: ['Problem-solving', 'Critical thinking', 'Pattern recognition', 'Research skills'],
        watchOuts: ['May overthink simple decisions', 'Could miss emotional aspects'],
        patterns: 'You like understanding "why" things work. You are naturally curious about root causes.',
        nextSteps: 'Pick one everyday problem and spend 10 minutes analyzing its root cause.'
      },
      social: {
        title: 'The Connector',
        description: 'You energize and bring people together',
        strengths: ['Communication', 'Team building', 'Leadership potential', 'Networking'],
        watchOuts: ['May struggle working alone', 'Can take on too much responsibility'],
        patterns: 'You gain energy from interactions. You naturally facilitate conversations and activities.',
        nextSteps: 'Initiate one meaningful conversation with someone new this week.'
      },
      empathy: {
        title: 'The Supporter',
        description: 'You understand and care about others deeply',
        strengths: ['Emotional intelligence', 'Conflict resolution', 'Trust-building', 'Listening'],
        watchOuts: ['May absorb others\' stress', 'Could neglect own needs'],
        patterns: 'You pick up on subtle cues others miss. People naturally open up to you.',
        nextSteps: 'Help someone this week, but also set one boundary to protect your energy.'
      },
      curiosity: {
        title: 'The Explorer',
        description: 'You love learning and trying new things',
        strengths: ['Adaptability', 'Innovation', 'Quick learning', 'Open-mindedness'],
        watchOuts: ['May start many things without finishing', 'Can get overwhelmed by options'],
        patterns: 'You\'re naturally drawn to new experiences. You enjoy experimenting and discovering.',
        nextSteps: 'Choose one new skill or topic and commit to learning it for 30 minutes this week.'
      },
      focus: {
        title: 'The Distracted',
        description: 'You struggle with maintaining concentration',
        strengths: ['Aware of the challenge', 'Multitasking ability', 'Flexible attention'],
        watchOuts: ['Reduced productivity', 'Incomplete tasks', 'Stress from switching'],
        patterns: 'Digital distractions pull your attention frequently. Deep work feels challenging.',
        nextSteps: 'Try one 25-minute focused work session with phone in another room.'
      },
      civic: {
        title: 'The Contributor',
        description: 'You care about your community and take action',
        strengths: ['Social responsibility', 'Initiative', 'Environmental awareness', 'Leadership'],
        watchOuts: ['May feel frustrated by others\' inaction', 'Can burn out'],
        patterns: 'You notice what needs fixing and feel motivated to act. Small actions matter to you.',
        nextSteps: 'Take one small civic action this week (pick up litter, help a neighbor, report an issue).'
      },
      responsibility: {
        title: 'The Accountable',
        description: 'You own your actions and their consequences',
        strengths: ['Integrity', 'Trustworthiness', 'Growth mindset', 'Maturity'],
        watchOuts: ['May be too hard on yourself', 'Could take blame unnecessarily'],
        patterns: 'You don\'t make excuses. You learn from mistakes and move forward.',
        nextSteps: 'Acknowledge one recent mistake, identify the lesson, and move on without guilt.'
      },
      decisiveness: {
        title: 'The Hesitant',
        description: 'You weigh options carefully, sometimes too much',
        strengths: ['Thoughtful', 'Risk-aware', 'Considers consequences'],
        watchOuts: ['Analysis paralysis', 'Missed opportunities', 'Decision fatigue'],
        patterns: 'You fear making the wrong choice. You seek more information before committing.',
        nextSteps: 'Make one small decision quickly this week (under 2 minutes). Notice what happens.'
      },
      adaptability: {
        title: 'The Flexible',
        description: 'You adjust to new situations with ease',
        strengths: ['Resilience', 'Problem-solving', 'Creativity', 'Stress management'],
        watchOuts: ['May lack consistency', 'Could avoid planning'],
        patterns: 'When plans change, you pivot easily. You see alternatives others miss.',
        nextSteps: 'When something doesn\'t work this week, try a different approach immediately.'
      },
      balanced: {
        title: 'The Balanced',
        description: 'You show a mix of different strengths',
        strengths: ['Versatile', 'Adaptable', 'Well-rounded perspective'],
        watchOuts: ['May lack a standout strength', 'Could feel unclear about direction'],
        patterns: 'You bring multiple perspectives to situations. No single style dominates.',
        nextSteps: 'Reflect on which situations energize you most - that is your hidden strength.'
      }
    },
    hi: {
      structure: {
        title: 'योजनाकार',
        description: 'आप संगठन और स्पष्ट लक्ष्यों के साथ फलते-फूलते हैं',
        strengths: ['मजबूत निष्पादन', 'विश्वसनीय', 'विस्तार-उन्मुख', 'समय प्रबंधन'],
        watchOuts: ['अचानक बदलावों से जूझ सकते हैं', 'कभी-कभी कठोर हो सकते हैं'],
        patterns: 'जब आपके पास स्पष्ट रोडमैप होता है तो आप सबसे अच्छा काम करते हैं। आप स्वाभाविक रूप से बड़े लक्ष्यों को छोटे चरणों में तोड़ते हैं।',
        nextSteps: 'इस हफ्ते एक साधारण चेकलिस्ट या प्लानर का उपयोग करके एक छोटी परियोजना का प्रबंधन करने का प्रयास करें।'
      },
      analytical: {
        title: 'विचारक',
        description: 'आप तर्क और कारण के साथ समस्याओं का समाधान करते हैं',
        strengths: ['समस्या-समाधान', 'आलोचनात्मक सोच', 'पैटर्न पहचान', 'अनुसंधान कौशल'],
        watchOuts: ['सरल निर्णयों पर अधिक सोच सकते हैं', 'भावनात्मक पहलुओं को चूक सकते हैं'],
        patterns: 'आपको "क्यों" चीजें काम करती हैं यह समझना पसंद है। आप स्वाभाविक रूप से मूल कारणों के बारे में उत्सुक हैं।',
        nextSteps: 'एक रोजमर्रा की समस्या चुनें और उसके मूल कारण का विश्लेषण करने में 10 मिनट बिताएं।'
      },
      social: {
        title: 'संपर्ककर्ता',
        description: 'आप लोगों को ऊर्जा देते हैं और एक साथ लाते हैं',
        strengths: ['संचार', 'टीम निर्माण', 'नेतृत्व क्षमता', 'नेटवर्किंग'],
        watchOuts: ['अकेले काम करने में संघर्ष हो सकता है', 'बहुत अधिक जिम्मेदारी ले सकते हैं'],
        patterns: 'आप इंटरैक्शन से ऊर्जा प्राप्त करते हैं। आप स्वाभाविक रूप से बातचीत और गतिविधियों को सुगम बनाते हैं।',
        nextSteps: 'इस हफ्ते किसी नए व्यक्ति के साथ एक सार्थक बातचीत शुरू करें।'
      },
      empathy: {
        title: 'समर्थक',
        description: 'आप दूसरों को गहराई से समझते और परवाह करते हैं',
        strengths: ['भावनात्मक बुद्धिमत्ता', 'संघर्ष समाधान', 'विश्वास निर्माण', 'सुनना'],
        watchOuts: ['दूसरों का तनाव सोख सकते हैं', 'अपनी जरूरतों की उपेक्षा कर सकते हैं'],
        patterns: 'आप सूक्ष्म संकेतों को पकड़ लेते हैं जो दूसरे चूक जाते हैं। लोग स्वाभाविक रूप से आपके सामने खुल जाते हैं।',
        nextSteps: 'इस हफ्ते किसी की मदद करें, लेकिन अपनी ऊर्जा की रक्षा के लिए एक सीमा भी निर्धारित करें।'
      },
      curiosity: {
        title: 'खोजकर्ता',
        description: 'आप सीखना और नई चीजें आजमाना पसंद करते हैं',
        strengths: ['अनुकूलन क्षमता', 'नवाचार', 'त्वरित सीखना', 'खुला दिमाग'],
        watchOuts: ['बिना खत्म किए कई चीजें शुरू कर सकते हैं', 'विकल्पों से अभिभूत हो सकते हैं'],
        patterns: 'आप स्वाभाविक रूप से नए अनुभवों की ओर आकर्षित होते हैं। आप प्रयोग और खोज का आनंद लेते हैं।',
        nextSteps: 'एक नया कौशल या विषय चुनें और इस हफ्ते 30 मिनट के लिए इसे सीखने के लिए प्रतिबद्ध हों।'
      },
      focus: {
        title: 'विचलित',
        description: 'आप एकाग्रता बनाए रखने में संघर्ष करते हैं',
        strengths: ['चुनौती के प्रति जागरूक', 'मल्टीटास्किंग क्षमता', 'लचीला ध्यान'],
        watchOuts: ['कम उत्पादकता', 'अधूरे कार्य', 'स्विच करने से तनाव'],
        patterns: 'डिजिटल विकर्षण अक्सर आपका ध्यान खींचते हैं। गहन कार्य चुनौतीपूर्ण लगता है।',
        nextSteps: 'दूसरे कमरे में फोन रखकर 25 मिनट का एक केंद्रित कार्य सत्र आजमाएं।'
      },
      civic: {
        title: 'योगदानकर्ता',
        description: 'आप अपने समुदाय की परवाह करते हैं और कार्रवाई करते हैं',
        strengths: ['सामाजिक जिम्मेदारी', 'पहल', 'पर्यावरण जागरूकता', 'नेतृत्व'],
        watchOuts: ['दूसरों की निष्क्रियता से निराश हो सकते हैं', 'थक सकते हैं'],
        patterns: 'आप नोटिस करते हैं कि क्या ठीक करने की जरूरत है और कार्य करने के लिए प्रेरित महसूस करते हैं। छोटी कार्रवाइयां आपके लिए मायने रखती हैं।',
        nextSteps: 'इस हफ्ते एक छोटी नागरिक कार्रवाई करें (कचरा उठाएं, पड़ोसी की मदद करें, एक मुद्दा रिपोर्ट करें)।'
      },
      responsibility: {
        title: 'जवाबदेह',
        description: 'आप अपने कार्यों और उनके परिणामों के मालिक हैं',
        strengths: ['सत्यनिष्ठा', 'विश्वसनीयता', 'विकास मानसिकता', 'परिपक्वता'],
        watchOuts: ['खुद पर बहुत कठोर हो सकते हैं', 'अनावश्यक रूप से दोष ले सकते हैं'],
        patterns: 'आप बहाने नहीं बनाते। आप गलतियों से सीखते हैं और आगे बढ़ते हैं।',
        nextSteps: 'एक हालिया गलती स्वीकार करें, सबक पहचानें, और बिना अपराध बोध के आगे बढ़ें।'
      },
      decisiveness: {
        title: 'संकोची',
        description: 'आप विकल्पों को सावधानी से तौलते हैं, कभी-कभी बहुत अधिक',
        strengths: ['विचारशील', 'जोखिम-जागरूक', 'परिणामों पर विचार करता है'],
        watchOuts: ['विश्लेषण पक्षाघात', 'छूटे अवसर', 'निर्णय थकान'],
        patterns: 'आप गलत विकल्प बनाने से डरते हैं। आप प्रतिबद्ध होने से पहले अधिक जानकारी चाहते हैं।',
        nextSteps: 'इस हफ्ते एक छोटा निर्णय जल्दी लें (2 मिनट से कम)। नोटिस करें क्या होता है।'
      },
      adaptability: {
        title: 'लचीला',
        description: 'आप आसानी से नई स्थितियों के अनुकूल हो जाते हैं',
        strengths: ['लचीलापन', 'समस्या-समाधान', 'रचनात्मकता', 'तनाव प्रबंधन'],
        watchOuts: ['निरंतरता की कमी हो सकती है', 'योजना से बच सकते हैं'],
        patterns: 'जब योजनाएं बदलती हैं, तो आप आसानी से बदल जाते हैं। आप वैकल्पिक विकल्प देखते हैं जो दूसरे चूक जाते हैं।',
        nextSteps: 'इस हफ्ते जब कुछ काम नहीं करता है, तो तुरंत एक अलग दृष्टिकोण आजमाएं।'
      },
      balanced: {
        title: 'संतुलित',
        description: 'आप विभिन्न शक्तियों का मिश्रण दिखाते हैं',
        strengths: ['बहुमुखी', 'अनुकूलनीय', 'सर्वांगीण दृष्टिकोण'],
        watchOuts: ['एक विशिष्ट शक्ति की कमी हो सकती है', 'दिशा के बारे में अस्पष्ट महसूस कर सकते हैं'],
        patterns: 'आप स्थितियों में कई दृष्टिकोण लाते हैं। कोई एकल शैली हावी नहीं होती।',
        nextSteps: 'विचार करें कि कौन सी स्थितियां आपको सबसे अधिक ऊर्जा देती हैं-वह आपकी छिपी ताकत है।'
      }
    },
    te: {
      structure: {
        title: 'ప్లానర్',
        description: 'మీరు సంస్థ మరియు స్పష్టమైన లక్ష్యాలతో అభివృద్ధి చెందుతారు',
        strengths: ['బలమైన అమలు', 'నమ్మదగిన', 'వివరాల-ఆధారిత', 'సమయ నిర్వహణ'],
        watchOuts: ['ఆకస్మిక మార్పులతో కష్టపడవచ్చు', 'కొన్నిసార్లు దృఢంగా ఉండవచ్చు'],
        patterns: 'మీకు స్పష్టమైన రోడ్‌మ్యాప్ ఉన్నప్పుడు మీరు ఉత్తమంగా పని చేస్తారు। మీరు సహజంగా పెద్ద లక్ష్యాలను చిన్న దశల్లోకి విభజిస్తారు।',
        nextSteps: 'ఈ వారం సాధారణ చెక్‌లిస్ట్ లేదా ప్లానర్ ఉపయోగించి ఒక చిన్న ప్రాజెక్ట్‌ను నిర్వహించడానికి ప్రయత్నించండి।'
      },
      analytical: {
        title: 'ఆలోచనాపరుడు',
        description: 'మీరు తర్కం మరియు కారణంతో సమస్యలను సంప్రదిస్తారు',
        strengths: ['సమస్య-పరిష్కారం', 'విమర్శనాత్మక ఆలోచన', 'నమూనా గుర్తింపు', 'పరిశోధన నైపుణ్యాలు'],
        watchOuts: ['సరళ నిర్ణయాలను అతిగా ఆలోచించవచ్చు', 'భావోద్వేగ అంశాలను కోల్పోవచ్చు'],
        patterns: '"ఎందుకు" విషయాలు పని చేస్తాయో అర్థం చేసుకోవడం మీకు ఇష్టం. మీరు సహజంగా మూల కారణాల గురించి ఆసక్తిగా ఉంటారు।',
        nextSteps: 'ఒక రోజువారీ సమస్యను ఎంచుకోండి మరియు దాని మూల కారణాన్ని విశ్లేషించడానికి 10 నిమిషాలు గడపండి।'
      },
      social: {
        title: 'కనెక్టర్',
        description: 'మీరు ప్రజలకు శక్తినిచ్చి, వారిని కలుపుతారు',
        strengths: ['కమ్యూనికేషన్', 'టీమ్ బిల్డింగ్', 'నాయకత్వ సామర్థ్యం', 'నెట్‌వర్కింగ్'],
        watchOuts: ['ఒంటరిగా పని చేయడంలో కష్టపడవచ్చు', 'చాలా బాధ్యత తీసుకోవచ్చు'],
        patterns: 'మీరు పరస్పర చర్యల నుండి శక్తిని పొందుతారు. మీరు సహజంగా సంభాషణలు మరియు కార్యకలాపాలను సులభతరం చేస్తారు।',
        nextSteps: 'ఈ వారం ఎవరైనా కొత్త వ్యక్తితో ఒక అర్థవంతమైన సంభాషణను ప్రారంభించండి।'
      },
      empathy: {
        title: 'మద్దతుదారు',
        description: 'మీరు ఇతరులను లోతుగా అర్థం చేసుకుంటారు మరియు శ్రద్ధ వహిస్తారు',
        strengths: ['భావోద్వేగ తెలివితేటలు', 'సంఘర్షణ పరిష్కారం', 'నమ్మకం-నిర్మాణం', 'వినడం'],
        watchOuts: ['ఇతరుల ఒత్తిడిని గ్రహించవచ్చు', 'స్వంత అవసరాలను నిర్లక్ష్యం చేయవచ్చు'],
        patterns: 'మీరు ఇతరులు కోల్పోయే సూక్ష్మ సంకేతాలను గుర్తించగలరు. ప్రజలు సహజంగా మీకు తెరుచుకుంటారు।',
        nextSteps: 'ఈ వారం ఎవరికైనా సహాయం చేయండి, కానీ మీ శక్తిని రక్షించడానికి ఒక హద్దును కూడా సెట్ చేయండి।'
      },
      curiosity: {
        title: 'అన్వేషకుడు',
        description: 'మీరు నేర్చుకోవడం మరియు కొత్త విషయాలను ప్రయత్నించడం ఇష్టపడతారు',
        strengths: ['అనుకూలత', 'ఆవిష్కరణ', 'త్వరిత అభ్యాసం', 'ముఖచిత్రం-మనస్సు'],
        watchOuts: ['పూర్తి చేయకుండా అనేక విషయాలను ప్రారంభించవచ్చు', 'ఎంపికలతో అధికంగా ఉండవచ్చు'],
        patterns: 'మీరు సహజంగా కొత్త అనుభవాల వైపు ఆకర్షితులవుతారు. మీరు ప్రయోగాలు మరియు కనుగొనడం ఆనందిస్తారు।',
        nextSteps: 'ఒక కొత్త నైపుణ్యం లేదా విషయం ఎంచుకోండి మరియు ఈ వారం 30 నిమిషాలు నేర్చుకోవడానికి కట్టుబడి ఉండండి।'
      },
      focus: {
        title: 'పరధ్యానంగా ఉండేవారు',
        description: 'మీరు ఏకాగ్రత కొనసాగించడంలో కష్టపడుతున్నారు',
        strengths: ['సవాలు గురించి అవగాహన', 'మల్టీటాస్కింగ్ సామర్థ్యం', 'సౌకర్యవంతమైన శ్రద్ध'],
        watchOuts: ['తగ్గిన ఉత్పాదకత', 'అసంపూర్ణ పనులు', 'మారడం నుండి ఒత్తిడి'],
        patterns: 'డిజిటల్ పరధ్యానాలు తరచుగా మీ శ్రద్ధను లాగుతాయి. లోతైన పని సవాలుగా అనిపిస్తుంది।',
        nextSteps: 'మరొక గదిలో ఫోన్‌తో 25 నిమిషాల ఏకాగ్రత పని సెషన్ ప్రయత్నించండి।'
      },
      civic: {
        title: 'సహకారి',
        description: 'మీరు మీ సమాజం గురించి శ్రద్ధ వహిస్తారు మరియు చర్య తీసుకుంటారు',
        strengths: ['సామాజిక బాధ్యత', 'చొరవ', 'పర్యావరణ అవగాహన', 'నాయకత్వం'],
        watchOuts: ['ఇతరుల నిష్క్రియత్వంతో నిరాశ చెందవచ్చు', 'కాల్చుకోవచ్చు'],
        patterns: 'మీరు ఏమి సరిచేయాలో గమనించి, చర్య తీసుకోవడానికి ప్రేరేపించబడతారు. చిన్న చర్యలు మీకు ముఖ్యం।',
        nextSteps: 'ఈ వారం ఒక చిన్న పౌర చర్య తీసుకోండి (చెత్తను తీయండి, పొరుగువారికి సహాయం చేయండి, సమస్యను నివేదించండి)।'
      },
      responsibility: {
        title: 'జవాబుదారీగా ఉండేవారు',
        description: 'మీరు మీ చర్యలు మరియు వాటి పర్యవసానాలకు యజమాని',
        strengths: ['సమగ్రత', 'నమ్మకత్వం', 'వృద్ధి మనస్తత్వం', 'పరిపక్వత'],
        watchOuts: ['మీపై చాలా కఠినంగా ఉండవచ్చు', 'అనవసరంగా నిందను తీసుకోవచ్చు'],
        patterns: 'మీరు సాకులు చెప్పరు. మీరు తప్పుల నుండి నేర్చుకుని ముందుకు సాగుతారు।',
        nextSteps: 'ఇటీవలి తప్పును అంగీకరించండి, పాఠాన్ని గుర్తించండి మరియు నేరారోపణ లేకుండా ముందుకు సాగండి।'
      },
      decisiveness: {
        title: 'సంకోచంగా ఉండేవారు',
        description: 'మీరు ఎంపికలను జాగ్రత్తగా తూచుతారు, కొన్నిసార్లు చాలా ఎక్కువ',
        strengths: ['ఆలోచనాపూర్వకం', 'ప్రమాద-అవగాహన', 'పర్యవసానాలను పరిగణిస్తుంది'],
        watchOuts: ['విశ్లేషణ పక్షవాతం', 'తప్పిపోయిన అవకాశాలు', 'నిర్ణయ అలసట'],
        patterns: 'మీరు తప్పు ఎంపిక చేయడానికి భయపడతారు. మీరు కట్టుబడే ముందు మరింత సమాచారం కోరుతారు।',
        nextSteps: 'ఈ వారం ఒక చిన్న నిర్ణయాన్ని త్వరగా తీసుకోండి (2 నిమిషాల కంటే తక్కువ). ఏమి జరుగుతుందో గమనించండి।'
      },
      adaptability: {
        title: 'సౌకర్యవంతమైన',
        description: 'మీరు కొత్త పరిస్థితులకు సులభంగా సర్దుబాటు చేస్తారు',
        strengths: ['స్థితిస్థాపకత', 'సమస్య-పరిష్కారం', 'సృజనాత్మకత', 'ఒత్తిడి నిర్వహణ'],
        watchOuts: ['స్థిరత్వం లేకపోవచ్చు', 'ప్లానింగ్ నుండి తప్పించుకోవచ్చు'],
        patterns: 'ప్లాన్‌లు మారినప్పుడు, మీరు సులభంగా మారిపోతారు. మీరు ఇతరులు కోల్పోయే ప్రత్యామ్నాయాలను చూస్తారు।',
        nextSteps: 'ఈ వారం ఏదైనా పని చేయనప్పుడు, వెంటనే వేరే విధానాన్ని ప్రయత్నించండి।'
      },
      balanced: {
        title: 'సమతుల్యత',
        description: 'మీరు వివిధ బలాల మిశ్రమాన్ని చూపిస్తారు',
        strengths: ['బహుముఖ', 'అనుకూలత', 'సమగ్ర దృక్పథం'],
        watchOuts: ['ప్రత్యేక బలం లేకపోవచ్చు', 'దిశ గురించి అస్పష్టంగా అనిపించవచ్చు'],
        patterns: 'మీరు పరిస్థితులకు బహుళ దృక్కోణాలను తీసుకువస్తారు. ఏ ఒక్క శైలి ఆధిపత్యం చెలాయించదు।',
        nextSteps: 'మీకు ఎక్కువ శక్తినిచ్చే పరిస్థితులను ప్రతిబింబించండి-అది మీ దాచిన బలం।'
      }
    }
  };
  
  return profiles.en[category] || profiles.en.balanced;
};


const getDetailedInsights = (primaryCategory, secondaryCategory, language = 'en') => {
  const detailedProfiles = {
    structure: {
      workStyle: {
        environment: 'Organized workspace with clear systems and routines',
        schedule: 'Prefer fixed schedules with planned breaks',
        collaboration: 'Work well in structured teams with defined roles',
        tools: 'Love planners, checklists, project management tools'
      },
      careerPaths: [
        'Project Manager',
        'Operations Coordinator',
        'Event Planner',
        'Administrative Specialist',
        'Supply Chain Analyst',
        'Quality Assurance'
      ],
      growthAreas: [
        {
          area: 'Embrace Flexibility',
          tip: 'Practice saying "yes" to one unplanned activity each week',
          why: 'Life does not always follow plans - adaptability is a superpower'
        },
        {
          area: 'Creative Thinking',
          tip: 'Spend 15 minutes weekly brainstorming without judging ideas',
          why: 'Structure + creativity = innovation'
        },
        {
          area: 'Delegation',
          tip: 'Let others complete tasks their way, even if different from yours',
          why: 'Trust builds stronger teams than control'
        }
      ],
      superhero: {
        name: 'The Architect',
        power: 'Turns chaos into order',
        motto: 'A place for everything, and everything in its place',
        strength: 'You build systems that others can follow'
      }
    },
    analytical: {
      workStyle: {
        environment: 'Quiet space for deep thinking, access to information',
        schedule: 'Flexible with blocks of uninterrupted time',
        collaboration: 'Enjoy problem-solving discussions, prefer data over opinions',
        tools: 'Research databases, analytical software, whiteboards'
      },
      careerPaths: [
        'Data Analyst',
        'Research Scientist',
        'Software Developer',
        'Financial Analyst',
        'UX Researcher',
        'Strategy Consultant'
      ],
      growthAreas: [
        {
          area: 'Trust Your Gut',
          tip: 'Make one small decision daily based on intuition, not analysis',
          why: 'Not everything can be optimized - sometimes you need to feel it'
        },
        {
          area: 'Emotional Intelligence',
          tip: 'Ask "How do they feel?" before "What do they think?"',
          why: 'People are not problems to solve, but humans to understand'
        },
        {
          area: 'Speed Over Perfection',
          tip: 'Set a 10-minute timer for simple decisions',
          why: 'Done is better than perfect in most cases'
        }
      ],
      superhero: {
        name: 'The Detective',
        power: 'Sees patterns others miss',
        motto: 'Question everything',
        strength: 'You solve complex puzzles with logic and evidence'
      }
    },
    social: {
      workStyle: {
        environment: 'Collaborative spaces with people around',
        schedule: 'Energized by meetings and group activities',
        collaboration: 'Natural facilitator, brings teams together',
        tools: 'Communication platforms, networking events, team projects'
      },
      careerPaths: [
        'Human Resources',
        'Sales Professional',
        'Teacher/Trainer',
        'Marketing Manager',
        'Community Manager',
        'Event Coordinator'
      ],
      growthAreas: [
        {
          area: 'Solo Work',
          tip: 'Schedule one hour weekly for independent deep work',
          why: 'Some breakthroughs happen in solitude'
        },
        {
          area: 'Saying No',
          tip: 'Decline one request monthly that overextends you',
          why: 'You cannot pour from an empty cup'
        },
        {
          area: 'Written Communication',
          tip: 'Write down ideas before verbal discussions',
          why: 'Not everyone processes thoughts through talking'
        }
      ],
      superhero: {
        name: 'The Connector',
        power: 'Builds bridges between people',
        motto: 'Together we are stronger',
        strength: 'You create networks that amplify everyone'
      }
    },
    empathy: {
      workStyle: {
        environment: 'Supportive, psychologically safe spaces',
        schedule: 'Need breaks for emotional processing',
        collaboration: 'Excel in mentoring, counseling, team harmony',
        tools: 'One-on-one meetings, feedback sessions, support groups'
      },
      careerPaths: [
        'Counselor/Therapist',
        'Social Worker',
        'Healthcare Professional',
        'Customer Success',
        'NGO/Nonprofit Work',
        'HR Specialist'
      ],
      growthAreas: [
        {
          area: 'Boundaries',
          tip: 'Practice "I need time to recharge" without guilt',
          why: 'Caring for yourself enables caring for others'
        },
        {
          area: 'Direct Feedback',
          tip: 'Share one honest critique weekly (kindly)',
          why: 'True support sometimes means difficult conversations'
        },
        {
          area: 'Objectivity',
          tip: 'In conflicts, list facts before feelings',
          why: 'Balance heart with head for better decisions'
        }
      ],
      superhero: {
        name: 'The Healer',
        power: 'Feels what others feel',
        motto: 'I see you, I hear you',
        strength: 'You create safe spaces where people can be vulnerable'
      }
    },
    curiosity: {
      workStyle: {
        environment: 'Dynamic, ever-changing with new challenges',
        schedule: 'Variety over routine, rotation of activities',
        collaboration: 'Enjoy brainstorming, innovation projects',
        tools: 'Learning platforms, experimentation tools, diverse projects'
      },
      careerPaths: [
        'Product Designer',
        'Entrepreneur',
        'Journalist',
        'R&D Specialist',
        'Content Creator',
        'Innovation Consultant'
      ],
      growthAreas: [
        {
          area: 'Follow Through',
          tip: 'Finish one project before starting two new ones',
          why: 'Depth creates mastery; breadth creates surface knowledge'
        },
        {
          area: 'Commitment',
          tip: 'Stick with one hobby for 3 months minimum',
          why: 'Real growth happens past the initial excitement'
        },
        {
          area: 'Focus',
          tip: 'Use Pomodoro technique: 25 min focus, 5 min break',
          why: 'Your curiosity is a gift; focus turns it into achievement'
        }
      ],
      superhero: {
        name: 'The Explorer',
        power: 'Infinite learning capacity',
        motto: 'What if we tried...',
        strength: 'You bring fresh perspectives to old problems'
      }
    },
    focus: {
      workStyle: {
        environment: 'Currently struggles with distractions',
        schedule: 'Benefits from external structure and accountability',
        collaboration: 'May work better with body doubling or focus partners',
        tools: 'Needs time-blocking, distraction blockers, focus apps'
      },
      careerPaths: [
        'Roles with built-in structure',
        'Jobs with variety and movement',
        'Careers with clear deadlines',
        'Work with accountability partners',
        'Consider ADHD assessment if patterns persist'
      ],
      growthAreas: [
        {
          area: 'Environment Design',
          tip: 'Create a dedicated distraction-free zone',
          why: 'Your environment shapes your behavior more than willpower'
        },
        {
          area: 'Phone Management',
          tip: 'Use grayscale mode and app limits during work hours',
          why: 'Digital tools should serve you, not control you'
        },
        {
          area: 'Micro-Habits',
          tip: 'Start with just 5 minutes of focused work daily',
          why: 'Small wins build momentum for bigger changes'
        }
      ],
      superhero: {
        name: 'The Phoenix',
        power: 'Rising from distraction',
        motto: 'Every moment is a chance to refocus',
        strength: 'You are aware of the challenge - that is the first step'
      }
    },
    civic: {
      workStyle: {
        environment: 'Values-driven organizations with social impact',
        schedule: 'Energized by community projects and volunteering',
        collaboration: 'Lead by example, inspire others to action',
        tools: 'Community platforms, volunteer networks, activism tools'
      },
      careerPaths: [
        'Social Entrepreneur',
        'Urban Planner',
        'Environmental Scientist',
        'Policy Analyst',
        'NGO Leader',
        'Sustainability Consultant'
      ],
      growthAreas: [
        {
          area: 'Systemic Thinking',
          tip: 'Learn about root causes, not just symptoms',
          why: 'Real change requires understanding systems'
        },
        {
          area: 'Self-Care',
          tip: 'Schedule rest as seriously as you schedule service',
          why: 'Burnout helps no one - sustainable impact needs sustainable energy'
        },
        {
          area: 'Influence Skills',
          tip: 'Practice persuading others to join your causes',
          why: 'Collective action creates bigger impact than solo efforts'
        }
      ],
      superhero: {
        name: 'The Guardian',
        power: 'Protects the common good',
        motto: 'Be the change',
        strength: 'You take responsibility when others look away'
      }
    },
    responsibility: {
      workStyle: {
        environment: 'Trust-based cultures valuing integrity',
        schedule: 'Self-directed, owns their commitments',
        collaboration: 'Reliable team member, others count on them',
        tools: 'Accountability systems, reflection journals, feedback loops'
      },
      careerPaths: [
        'Leadership Roles',
        'Ethics & Compliance',
        'Financial Management',
        'Legal Professions',
        'Quality Control',
        'Any field valuing integrity'
      ],
      growthAreas: [
        {
          area: 'Self-Compassion',
          tip: 'Treat yourself as kindly as you treat others',
          why: 'Responsibility without self-forgiveness leads to paralysis'
        },
        {
          area: 'Shared Accountability',
          tip: 'Let others take responsibility too',
          why: 'Taking all blame prevents others from growing'
        },
        {
          area: 'Celebrate Wins',
          tip: 'Acknowledge what went right, not just what went wrong',
          why: 'Progress needs recognition, not just correction'
        }
      ],
      superhero: {
        name: 'The Keeper',
        power: 'Unwavering integrity',
        motto: 'Own it, fix it, grow from it',
        strength: 'You are trustworthy in a world that needs more trust'
      }
    },
    decisiveness: {
      workStyle: {
        environment: 'Benefits from structured decision frameworks',
        schedule: 'Needs time for consideration but working on faster choices',
        collaboration: 'Values input from others, sometimes too much',
        tools: 'Decision matrices, pros/cons lists, consultation processes'
      },
      careerPaths: [
        'Analyst roles with time for deliberation',
        'Research positions',
        'Advisory services',
        'Roles with collaborative decision-making'
      ],
      growthAreas: [
        {
          area: 'Two-Minute Rule',
          tip: 'If decision takes less than 2 minutes to make, decide now',
          why: 'Most decisions are reversible - speed matters more than perfection'
        },
        {
          area: 'Fail Fast',
          tip: 'Make one "safe to fail" decision weekly and learn from it',
          why: 'Experience builds confidence faster than analysis'
        },
        {
          area: 'Decision Fatigue',
          tip: 'Automate routine decisions (meal plans, clothes, etc.)',
          why: 'Save mental energy for decisions that truly matter'
        }
      ],
      superhero: {
        name: 'The Strategist',
        power: 'Considers all angles',
        motto: 'Measure twice, cut once (but actually cut)',
        strength: 'Your thoughtfulness prevents costly mistakes'
      }
    },
    adaptability: {
      workStyle: {
        environment: 'Dynamic, fast-paced with frequent changes',
        schedule: 'Thrives on variety and surprises',
        collaboration: 'Go-to person when plans change',
        tools: 'Agile methodologies, flexible systems, improvisation'
      },
      careerPaths: [
        'Startup Environment',
        'Crisis Management',
        'Emergency Services',
        'Travel Industry',
        'Freelance/Consulting',
        'Change Management'
      ],
      growthAreas: [
        {
          area: 'Consistency',
          tip: 'Build one non-negotiable daily habit',
          why: 'Flexibility works best on a foundation of stability'
        },
        {
          area: 'Planning',
          tip: 'Create a basic plan even if you expect to change it',
          why: 'Having something to deviate from is better than chaos'
        },
        {
          area: 'Documentation',
          tip: 'Track your pivots and what you learn from them',
          why: 'Your adaptability is valuable - capture the lessons'
        }
      ],
      superhero: {
        name: 'The Shapeshifter',
        power: 'Thrives in uncertainty',
        motto: 'When the wind changes, adjust your sails',
        strength: 'You find opportunity where others see obstacles'
      }
    },
    balanced: {
      workStyle: {
        environment: 'Adaptable to various settings',
        schedule: 'Can work in different structures',
        collaboration: 'Flexible in team dynamics',
        tools: 'Open to different approaches and methods'
      },
      careerPaths: [
        'Generalist roles',
        'Project coordination',
        'Business operations',
        'Multiple career paths possible'
      ],
      growthAreas: [
        {
          area: 'Find Your Edge',
          tip: 'Try 3 different activities and see which one excites you most',
          why: 'Being balanced is good; finding your passion is better'
        },
        {
          area: 'Deep Practice',
          tip: 'Choose one skill and go deep instead of staying broad',
          why: 'Specialization often creates more value than generalization'
        },
        {
          area: 'Personal Brand',
          tip: 'Identify what you want to be known for',
          why: 'Clarity of direction helps others help you'
        }
      ],
      superhero: {
        name: 'The Versatile',
        power: 'Adapts to any situation',
        motto: 'Jack of all trades, master of choice',
        strength: 'Your flexibility is your foundation - now build upward'
      }
    }
  };
  
  const profile = detailedProfiles[primaryCategory] || detailedProfiles.balanced;
  
  // For now, return English content but we can add full translations later
  // The UI labels will be translated via the translations.js file
  return profile;
};

