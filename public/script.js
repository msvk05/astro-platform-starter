// Seedling Assessment v1 (30 questions, 5 trait dimensions)
// Likert: 1..5 (Strongly Disagree..Strongly Agree)

const LIKERT = [
  "Strongly Disagree",
  "Disagree",
  "Neutral",
  "Agree",
  "Strongly Agree"
];

const questions = [
  // Think & Learn
  { id:"q1",  t:"I understand things better when I try them out, rather than only reading or watching.", d:{exec:.5,cur:.5,anal:.2} },
  { id:"q2",  t:"I like breaking big problems into clear steps before starting.", d:{exec:1.0,anal:.6} },
  { id:"q3",  t:"I often think about how things could be improved, even if they already work.", d:{cur:.8,anal:.5} },
  { id:"q4",  t:"I prefer clear instructions rather than vague guidance.", d:{exec:.8} },
  { id:"q5",  t:"I learn best when I understand the ‘why’, not just the ‘how’.", d:{anal:.6,cur:.4} },

  // Execution
  { id:"q6",  t:"I usually start tasks early rather than waiting till the last moment.", d:{exec:1.0} },
  { id:"q7",  t:"I enjoy planning my day or week.", d:{exec:.9} },
  { id:"q8",  t:"I feel satisfied when I finish tasks, even small ones.", d:{exec:.7} },
  { id:"q9",  t:"I adapt quickly when plans change.", d:{exec:.4,cur:.4} },
  { id:"q10", t:"I prefer doing something imperfectly than not starting at all.", d:{exec:.5,cur:.3} },

  // Social
  { id:"q11", t:"I often take the lead in group activities without being asked.", d:{soc:1.0,exec:.4} },
  { id:"q12", t:"I feel comfortable sharing my opinions, even if others disagree.", d:{soc:.8,anal:.2} },
  { id:"q13", t:"I enjoy helping others understand things better.", d:{emp:.8,soc:.3} },
  { id:"q14", t:"I prefer working in a team rather than alone.", d:{soc:.6,emp:.4} },
  { id:"q15", t:"I notice when people around me feel uncomfortable or left out.", d:{emp:1.0} },

  // Curiosity
  { id:"q16", t:"I explore topics out of curiosity, even if they’re not part of my syllabus/job.", d:{cur:1.0} },
  { id:"q17", t:"I get excited by new ideas and possibilities.", d:{cur:.9} },
  { id:"q18", t:"I like experimenting with new ways of doing things.", d:{cur:.8} },
  { id:"q19", t:"I feel bored doing the same routine for a long time.", d:{cur:.6} },
  { id:"q20", t:"I ask ‘why’ a lot.", d:{cur:.5,anal:.5} },

  // Decision & Values
  { id:"q21", t:"I prefer making decisions based on logic and facts rather than emotions.", d:{anal:1.0} },
  { id:"q22", t:"I think about how my decisions affect other people.", d:{emp:.9} },
  { id:"q23", t:"I like having clear rules and structure.", d:{exec:.7} },
  { id:"q24", t:"I am okay questioning rules if they don’t make sense.", d:{cur:.4,anal:.4} },
  { id:"q25", t:"I care more about doing things right than doing things fast.", d:{exec:.5,anal:.3} },

  // Confidence & Resilience
  { id:"q26", t:"I feel confident speaking in front of others.", d:{soc:.8} },
  { id:"q27", t:"I stay calm even in stressful situations.", d:{exec:.4,anal:.4} },
  { id:"q28", t:"I am comfortable taking responsibility if something goes wrong.", d:{exec:.8} },
  { id:"q29", t:"I believe I can figure things out, even if I fail initially.", d:{cur:.3,exec:.4,anal:.3} },
  { id:"q30", t:"I trust my ability to grow and improve over time.", d:{cur:.3,exec:.3} }
];

const styles = {
  Executive: {
    headline: "Outcome driver with structure and ownership",
    strengths: [
      "Turns ambiguity into clear steps and closure",
      "Reliable execution with calm decision-making",
      "Comfortable taking responsibility and aligning others"
    ],
    watchout: "Directness can sometimes sound blunt—pair clarity with warmth.",
    resume: "Structured, execution-oriented professional who takes ownership, organizes work into clear steps, and delivers outcomes reliably. Comfortable coordinating with stakeholders, making fact-based decisions, and driving closure under deadlines.",
    bullets: [
      "Owned task planning and execution to deliver outcomes on time",
      "Translated unclear requirements into structured steps and priorities",
      "Aligned stakeholders on responsibilities and timelines to ensure closure"
    ]
  },
  Builder: {
    headline: "Hands-on doer who learns by building",
    strengths: [
      "Learns quickly through practical implementation",
      "Moves ideas into tangible outputs and prototypes",
      "Stays focused on what works in the real world"
    ],
    watchout: "Avoid skipping documentation—make your work easy to understand and reuse.",
    resume: "Hands-on problem solver who learns by building, iterating, and shipping practical solutions. Comfortable experimenting, debugging, and converting concepts into working outcomes with clear ownership.",
    bullets: [
      "Built and iterated on solutions through hands-on experimentation",
      "Implemented features/prototypes and validated with real use-cases",
      "Improved reliability by debugging issues and refining implementation"
    ]
  },
  Analyst: {
    headline: "Logic-led thinker with strong scenario awareness",
    strengths: [
      "Breaks down complex problems and evaluates options",
      "Thinks ahead about risks, impacts, and edge cases",
      "Uses evidence and logic to make sound decisions"
    ],
    watchout: "Avoid analysis-paralysis—set decision deadlines and act on “enough” data.",
    resume: "Analytical, evidence-driven problem solver who breaks down complexity, anticipates outcomes, and makes structured decisions. Strong at reasoning, prioritization, and translating analysis into actionable plans.",
    bullets: [
      "Analyzed alternatives and selected practical approaches using evidence",
      "Anticipated risks/edge cases and proposed mitigations early",
      "Converted analysis into clear action steps for execution"
    ]
  },
  Connector: {
    headline: "People-aware collaborator who lifts teams",
    strengths: [
      "Builds trust, listens well, and supports others",
      "Improves collaboration and team clarity",
      "Helps translate ideas so teams move together"
    ],
    watchout: "Don’t over-accommodate—practice clear boundaries and decisive communication.",
    resume: "Collaborative, people-aware professional who builds trust, communicates clearly, and supports teamwork. Strong at coordination, empathy-led problem solving, and aligning people toward outcomes.",
    bullets: [
      "Supported teamwork through clear communication and proactive coordination",
      "Helped peers by explaining concepts and unblocking progress",
      "Improved collaboration by considering team dynamics and impact"
    ]
  },
  Explorer: {
    headline: "Curiosity-driven learner who finds new paths",
    strengths: [
      "High curiosity and fast learning across topics",
      "Generates new ideas and alternative approaches",
      "Comfortable exploring uncertainty and experimenting"
    ],
    watchout: "Channel curiosity into finish-lines—pick a goal and complete it before jumping.",
    resume: "Curiosity-driven learner who explores ideas, experiments with approaches, and adapts quickly. Brings fresh perspectives to problem solving—best when paired with clear goals and delivery checkpoints.",
    bullets: [
      "Learned new concepts independently and applied them to practical problems",
      "Experimented with alternative approaches and evaluated outcomes",
      "Adapted quickly to new information and iterated toward improvements"
    ]
  }
};

// ---------- Scoring ----------
function computeDims(ans){
  const dims = {exec:0, anal:0, soc:0, emp:0, cur:0};
  const wsum = {exec:0, anal:0, soc:0, emp:0, cur:0};

  for (const q of questions){
    const v = ans[q.id];
    if (!v) continue;
    for (const [d,w] of Object.entries(q.d)){
      dims[d] += v * w;
      wsum[d] += w;
    }
  }
  for (const k of Object.keys(dims)){
    dims[k] = wsum[k] ? dims[k]/wsum[k] : 0; // normalized 1..5
  }
  return dims;
}

function pickStyle(d){
  const exec=d.exec, anal=d.anal, soc=d.soc, emp=d.emp, cur=d.cur;

  const score = {
    Executive: exec*1.2 + anal*0.5 + soc*0.3,
    Explorer:  cur*1.2 + anal*0.4,
    Connector: (emp*1.0 + soc*1.0) + exec*0.2,
    Analyst:   anal*1.25 + exec*0.25,
    Builder:   (cur*0.6 + exec*0.6) + anal*0.2
  };

  let best = "Executive", bestVal = -Infinity;
  for (const [k,v] of Object.entries(score)){
    if (v > bestVal){ bestVal=v; best=k; }
  }
  return { best, score };
}

function pct(val){ return Math.round((val/5)*100); }

function learningModeLine(d){
  const parts = [];
  if (d.exec >= 3.6) parts.push("clear steps, checklists, and timelines");
  if (d.anal >= 3.6) parts.push("understanding the ‘why’ with real examples");
  if (d.cur  >= 3.6) parts.push("trying variations and learning by experimentation");
  if (d.soc  >= 3.6) parts.push("group learning, discussion, and collaboration");
  if (d.emp  >= 3.6) parts.push("supportive environments with feedback");

  if (!parts.length) return "a balanced mix of explanation and practice with real examples.";
  return "You learn best with " + parts.slice(0,3).join(", ") + ".";
}

function buildCopyText(styleName, s, d){
  return [
    "SEEDLING RESULT",
    `Style: ${styleName}`,
    "",
    "Hidden strengths:",
    ...s.strengths.map(x=>`- ${x}`),
    "",
    `Watch-out: ${s.watchout}`,
    "",
    "Resume summary:",
    s.resume,
    "",
    "Bullet bank:",
    ...s.bullets.map(b=>`- ${b}`),
    "",
    "Trait signals:",
    `- Structure & Execution: ${pct(d.exec)}/100`,
    `- Analytical Thinking: ${pct(d.anal)}/100`,
    `- Social Initiative: ${pct(d.soc)}/100`,
    `- Empathy & Cooperation: ${pct(d.emp)}/100`,
    `- Curiosity & Experimentation: ${pct(d.cur)}/100`,
  ].join("\n");
}

// ---------- UI ----------
let idx = 0;
let answers = {};

const el = (id)=>document.getElementById(id);

const screens = {
  intro: el("screen-intro"),
  quiz: el("screen-quiz"),
  result: el("screen-result")
};

const qCounter = el("qCounter");
const bar = el("bar");

const qText = el("qText");
const scale = el("scale");
const backBtn = el("backBtn");
const nextBtn = el("nextBtn");
const tipLine = el("tipLine");

el("startBtn").onclick = () => {
  idx = 0; answers = {};
  show("quiz");
  renderQ();
};

backBtn.onclick = () => {
  if (idx > 0){ idx--; renderQ(); }
};

nextBtn.onclick = () => {
  if (idx < questions.length-1){
    idx++;
    renderQ();
  } else {
    showResult();
  }
};

el("restartBtn").onclick = () => {
  idx = 0; answers = {};
  show("intro");
  renderProgress();
  el("qCounter").textContent = `1 / ${questions.length}`;
};

el("copyBtn").onclick = async () => {
  try{
    await navigator.clipboard.writeText(el("copyBox").value);
    alert("Copied!");
  } catch(e){
    alert("Copy failed. You can manually select and copy.");
  }
};

function show(which){
  Object.values(screens).forEach(s=>s.classList.add("hidden"));
  screens[which].classList.remove("hidden");
}

function renderProgress(){
  const p = screens.quiz.classList.contains("hidden") ? 0 : Math.round((idx)/questions.length * 100);
  bar.style.width = `${p}%`;
}

function renderQ(){
  const q = questions[idx];
  qCounter.textContent = `${idx+1} / ${questions.length}`;
  bar.style.width = `${Math.round((idx)/questions.length * 100)}%`;

  qText.textContent = q.t;

  const selected = answers[q.id] || 0;
  nextBtn.disabled = !selected;
  nextBtn.textContent = (idx === questions.length-1) ? "See Result" : "Next";
  backBtn.disabled = (idx === 0);

  tipLine.textContent = (idx < 10)
    ? "Tip: Think of your last 2–3 months and answer based on patterns."
    : "Tip: Choose what feels true most of the time, not occasionally.";

  scale.innerHTML = "";
  for (let i=0;i<5;i++){
    const val = i+1;
    const opt = document.createElement("div");
    opt.className = "opt" + (val===selected ? " selected" : "");
    opt.innerHTML = `<strong>${val}</strong><small>${LIKERT[i]}</small>`;
    opt.onclick = () => {
      answers[q.id] = val;
      renderQ();
    };
    scale.appendChild(opt);
  }
}

function showResult(){
  const dims = computeDims(answers);
  const {best} = pickStyle(dims);
  const s = styles[best];

  bar.style.width = "100%";
  qCounter.textContent = `${questions.length} / ${questions.length}`;

  el("styleTitle").textContent = `Your Seedling Style: ${best}`;
  el("styleHeadline").textContent = s.headline;

  // strengths
  const strengthList = el("strengthList");
  strengthList.innerHTML = "";
  s.strengths.forEach(x=>{
    const li = document.createElement("li");
    li.textContent = x;
    strengthList.appendChild(li);
  });

  el("watchout").textContent = s.watchout;
  el("learningMode").textContent = learningModeLine(dims);
  el("resumeSummary").textContent = s.resume;

  // bullets
  const bulletList = el("bulletList");
  bulletList.innerHTML = "";
  s.bullets.forEach(b=>{
    const li = document.createElement("li");
    li.textContent = b;
    bulletList.appendChild(li);
  });

  // meters
  const meters = el("meters");
  meters.innerHTML = "";
  const rows = [
    ["Structure & Execution", dims.exec],
    ["Analytical Thinking", dims.anal],
    ["Social Initiative", dims.soc],
    ["Empathy & Cooperation", dims.emp],
    ["Curiosity & Experimentation", dims.cur],
  ];
  rows.forEach(([label,val])=>{
    const wrap = document.createElement("div");
    wrap.className = "meterRow";
    wrap.innerHTML = `
      <div class="meterTop">
        <div>${label}</div>
        <div class="muted">${pct(val)}/100</div>
      </div>
      <div class="meterBar"><div class="meterFill" style="width:${pct(val)}%"></div></div>
    `;
    meters.appendChild(wrap);
  });

  // copy text
  el("copyBox").value = buildCopyText(best, s, dims);

  show("result");
}

// init
show("intro");
bar.style.width = "0%";
qCounter.textContent = `1 / ${questions.length}`;