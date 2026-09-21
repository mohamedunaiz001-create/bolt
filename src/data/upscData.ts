import {
  UserProfile,
  SyllabusTopic,
  PrelimsQuestion,
  MainsModelAnswer,
  MainsAnswerEvaluation,
  NewsArticle,
  ModelSettingsState,
} from "../types";

export const initialUserProfile: UserProfile = {
  id: "guest-aspirant",
  name: "Aspirant",
  email: "",
  target: "UPSC CSE 2026",
  optionalSubject: "Public Administration",
  studyStreakDays: 0,
  totalStudyHours: 0,
  questionsAttempted: 0,
  mainsEvaluatedCount: 0,
  overallAccuracy: 0,
  themeMode: "dark",
  dailyStudyGoal: 6,
  dailyStudyHoursGoal: 6,
};

export const publicAdminSyllabus: SyllabusTopic[] = [
  // PAPER 1: ADMINISTRATIVE THEORY
  {
    id: "pa1-1",
    name: "Introduction to Public Administration",
    paper: "Paper 1",
    subject: "Public Administration",
    completionPercentage: 0,
    knowledgeScore: 0,
    mcqAccuracy: 0,
    mainsAverageScore: 0,
    attemptsCount: 0,
    status: "learning",
    lastStudiedDate: undefined,
    lastRevisedDate: undefined,
    commonMistakes: ["Confusing Wilsonian dichotomy with Goodnow's formulation", "Overlooking Waldo's critique"],
    keyThinkers: ["Woodrow Wilson", "Frank Goodnow", "Dwight Waldo", "Nicholas Henry"],
    subtopics: [
      { id: "pa1-1-1", name: "Meaning, Scope & Significance", status: "learning", confidence: 0 },
      { id: "pa1-1-2", name: "Wilson's Vision & Evolution of the Discipline", status: "learning", confidence: 0 },
      { id: "pa1-1-3", name: "New Public Administration (Minnowbrook I, II, III)", status: "learning", confidence: 0 },
      { id: "pa1-1-4", name: "Public Choice Approach & New Public Management", status: "learning", confidence: 0 },
      { id: "pa1-1-5", name: "Good Governance & Digital Era Governance (DEG)", status: "learning", confidence: 0 },
    ],
  },
  {
    id: "pa1-2",
    name: "Administrative Thought",
    paper: "Paper 1",
    subject: "Public Administration",
    completionPercentage: 0,
    knowledgeScore: 0,
    mcqAccuracy: 0,
    mainsAverageScore: 0,
    attemptsCount: 0,
    status: "learning",
    lastStudiedDate: undefined,
    lastRevisedDate: undefined,
    commonMistakes: [
      "Incomplete differentiation between Weberian ideal type and real bureaupathologies",
      "Omitting Chester Barnard's Zone of Indifference and Contribution-Satisfaction equilibrium",
      "Treating Taylor's Scientific Management purely as mechanical without mentioning mental revolution",
    ],
    keyThinkers: ["F.W. Taylor", "Henri Fayol", "Max Weber", "Elton Mayo", "Chester Barnard", "Herbert Simon", "Mary Parker Follett"],
    subtopics: [
      { id: "pa1-2-1", name: "Scientific Management (F.W. Taylor)", status: "learning", confidence: 0 },
      { id: "pa1-2-2", name: "Classical Theory (Fayol, Gulick, Urwick)", status: "learning", confidence: 0 },
      { id: "pa1-2-3", name: "Bureaucratic Theory (Max Weber & Critics)", status: "learning", confidence: 0 },
      { id: "pa1-2-4", name: "Human Relations School (Elton Mayo)", status: "learning", confidence: 0 },
      { id: "pa1-2-5", name: "Functions of Executive (Chester Barnard)", status: "learning", confidence: 0 },
      { id: "pa1-2-6", name: "Behavioural Decision-Making (Herbert Simon)", status: "learning", confidence: 0 },
      { id: "pa1-2-7", name: "Participative & Dynamic Administration (Mary Parker Follett)", status: "learning", confidence: 0 },
    ],
  },
  {
    id: "pa1-3",
    name: "Administrative Behaviour",
    paper: "Paper 1",
    subject: "Public Administration",
    completionPercentage: 0,
    knowledgeScore: 0,
    mcqAccuracy: 0,
    mainsAverageScore: 0,
    attemptsCount: 0,
    status: "learning",
    lastStudiedDate: undefined,
    lastRevisedDate: undefined,
    commonMistakes: ["Conflating Herzberg hygiene factors with intrinsic motivators"],
    keyThinkers: ["Abraham Maslow", "Douglas McGregor", "Frederick Herzberg", "Chris Argyris", "Rensis Likert"],
    subtopics: [
      { id: "pa1-3-1", name: "Process & Techniques of Decision-Making", status: "learning", confidence: 0 },
      { id: "pa1-3-2", name: "Theories of Leadership (Likert, Fiedler, Blake-Mouton)", status: "learning", confidence: 0 },
      { id: "pa1-3-3", name: "Theories of Motivation (Maslow, Herzberg, Vroom)", status: "learning", confidence: 0 },
      { id: "pa1-3-4", name: "Communication & Morale", status: "learning", confidence: 0 },
    ],
  },
  {
    id: "pa1-4",
    name: "Accountability and Control",
    paper: "Paper 1",
    subject: "Public Administration",
    completionPercentage: 0,
    knowledgeScore: 0,
    mcqAccuracy: 0,
    mainsAverageScore: 0,
    attemptsCount: 0,
    status: "learning",
    lastStudiedDate: undefined,
    lastRevisedDate: undefined,
    commonMistakes: [
      "Failing to cite 2nd ARC 4th Report on Ethics in Governance",
      "Vague distinctions between legislative oversight vs executive control",
      "Overlooking Social Audit mechanisms and Sevottam model benchmarks",
    ],
    keyThinkers: ["John Gaus", "Carl Friedrich", "Herman Finer", "2nd ARC"],
    subtopics: [
      { id: "pa1-4-1", name: "Legislative, Executive & Judicial Control", status: "learning", confidence: 0 },
      { id: "pa1-4-2", name: "Citizen & Administration (RTI, Citizens Charters)", status: "learning", confidence: 0 },
      { id: "pa1-4-3", name: "Social Audit & Ombudsman (Lokpal/Lokayukta)", status: "learning", confidence: 0 },
      { id: "pa1-4-4", name: "Administrative Ethics & Corruption (CVC, CAG)", status: "learning", confidence: 0 },
    ],
  },
  {
    id: "pa1-5",
    name: "Comparative Public Administration (CPA)",
    paper: "Paper 1",
    subject: "Public Administration",
    completionPercentage: 0,
    knowledgeScore: 0,
    mcqAccuracy: 0,
    mainsAverageScore: 0,
    attemptsCount: 0,
    status: "learning",
    lastStudiedDate: undefined,
    lastRevisedDate: undefined,
    commonMistakes: ["Superficial application of Riggs' Prismatic Sala model without bazaar-canteen traits"],
    keyThinkers: ["Fred W. Riggs", "Ferrel Heady", "Dwight Waldo"],
    subtopics: [
      { id: "pa1-5-1", name: "Historical & Sociological Factors in CPA", status: "learning", confidence: 0 },
      { id: "pa1-5-2", name: "Riggsian Ecological Models (Agraria-Industria to Sala)", status: "learning", confidence: 0 },
      { id: "pa1-5-3", name: "Administration in Developed & Developing Societies", status: "learning", confidence: 0 },
    ],
  },
  {
    id: "pa1-6",
    name: "Public Policy & Financial Administration",
    paper: "Paper 1",
    subject: "Public Administration",
    completionPercentage: 0,
    knowledgeScore: 0,
    mcqAccuracy: 0,
    mainsAverageScore: 0,
    attemptsCount: 0,
    status: "learning",
    lastStudiedDate: undefined,
    lastRevisedDate: undefined,
    commonMistakes: ["Confusing Performance Budgeting, Zero-Based Budgeting, and Outcome Budgeting"],
    keyThinkers: ["Yehezkel Dror", "Charles Lindblom", "Thomas Dye", "Aaron Wildavsky"],
    subtopics: [
      { id: "pa1-6-1", name: "Models of Policy Making (Incremental, Rational, Garbage Can)", status: "learning", confidence: 0 },
      { id: "pa1-6-2", name: "Policy Implementation & Evaluation", status: "learning", confidence: 0 },
      { id: "pa1-6-3", name: "Budgeting Types: Performance, ZBB, Gender & Outcome", status: "learning", confidence: 0 },
      { id: "pa1-6-4", name: "Parliamentary Financial Committees (PAC, Estimates, COPU)", status: "learning", confidence: 0 },
    ],
  },

  // PAPER 2: INDIAN ADMINISTRATION
  {
    id: "pa2-1",
    name: "Evolution & Constitutional Framework",
    paper: "Paper 2",
    subject: "Public Administration",
    completionPercentage: 0,
    knowledgeScore: 0,
    mcqAccuracy: 0,
    mainsAverageScore: 0,
    attemptsCount: 0,
    status: "learning",
    lastStudiedDate: undefined,
    lastRevisedDate: undefined,
    commonMistakes: ["Ignoring Kautilya's Arthashastra administrative machinery linkages"],
    keyThinkers: ["Kautilya", "B.R. Ambedkar", "Sardar Patel", "Sarkaria Commission"],
    subtopics: [
      { id: "pa2-1-1", name: "Kautilyan, Mughal & British Colonial Legacy", status: "learning", confidence: 0 },
      { id: "pa2-1-2", name: "Preamble, Fundamental Rights & DPSP Administrative Mandate", status: "learning", confidence: 0 },
      { id: "pa2-1-3", name: "Federal Framework & Inter-State Council", status: "learning", confidence: 0 },
    ],
  },
  {
    id: "pa2-2",
    name: "Union & State Government Administration",
    paper: "Paper 2",
    subject: "Public Administration",
    completionPercentage: 0,
    knowledgeScore: 0,
    mcqAccuracy: 0,
    mainsAverageScore: 0,
    attemptsCount: 0,
    status: "learning",
    lastStudiedDate: undefined,
    lastRevisedDate: undefined,
    commonMistakes: ["Cabinet Secretariat vs Prime Minister's Office (PMO) power shifts"],
    keyThinkers: ["Punchhi Commission", "2nd ARC 13th Report", "Administrative Reforms Commissions"],
    subtopics: [
      { id: "pa2-2-1", name: "Cabinet Secretariat, PMO & Central Secretariat", status: "learning", confidence: 0 },
      { id: "pa2-2-2", name: "Chief Secretary & State Secretariat Dynamics", status: "learning", confidence: 0 },
      { id: "pa2-2-3", name: "Governor's Discretionary Powers & Neutrality", status: "learning", confidence: 0 },
    ],
  },
  {
    id: "pa2-3",
    name: "Civil Services & Administrative Reforms",
    paper: "Paper 2",
    subject: "Public Administration",
    completionPercentage: 0,
    knowledgeScore: 0,
    mcqAccuracy: 0,
    mainsAverageScore: 0,
    attemptsCount: 0,
    status: "learning",
    lastStudiedDate: undefined,
    lastRevisedDate: undefined,
    commonMistakes: [
      "Vague knowledge of Article 311 constitutional protections and its caveats",
      "Lateral entry debates without mentioning 2nd ARC 10th Report on Refurbishing Personnel Admin",
      "Missing Mission Karmayogi capacity building framework",
    ],
    keyThinkers: ["2nd ARC 10th Report", "Sarkaria Commission", "Surinder Nath Committee", "Hota Committee"],
    subtopics: [
      { id: "pa2-3-1", name: "All India Services & Article 312 Federal Role", status: "learning", confidence: 0 },
      { id: "pa2-3-2", name: "Article 311 Safeguards & Accountability", status: "learning", confidence: 0 },
      { id: "pa2-3-3", name: "Mission Karmayogi & Capacity Building", status: "learning", confidence: 0 },
      { id: "pa2-3-4", name: "Lateral Entry & Generalist vs Specialist Debate", status: "learning", confidence: 0 },
    ],
  },
  {
    id: "pa2-4",
    name: "District Administration & Local Governance",
    paper: "Paper 2",
    subject: "Public Administration",
    completionPercentage: 0,
    knowledgeScore: 0,
    mcqAccuracy: 0,
    mainsAverageScore: 0,
    attemptsCount: 0,
    status: "learning",
    lastStudiedDate: undefined,
    lastRevisedDate: undefined,
    commonMistakes: ["Neglecting the District Planning Committee (Article 243ZD) operational deficits"],
    keyThinkers: ["Balwant Rai Mehta", "Ashok Mehta", "L.M. Singhvi", "2nd ARC 6th Report"],
    subtopics: [
      { id: "pa2-4-1", name: "Changing Role of District Collector / Magistrate", status: "learning", confidence: 0 },
      { id: "pa2-4-2", name: "73rd & 74th Constitutional Amendments & 3Fs (Funds, Functions, Functionaries)", status: "learning", confidence: 0 },
      { id: "pa2-4-3", name: "District Planning Committees & Smart Cities", status: "learning", confidence: 0 },
    ],
  },
  {
    id: "pa2-5",
    name: "Law and Order & Regulatory Governance",
    paper: "Paper 2",
    subject: "Public Administration",
    completionPercentage: 0,
    knowledgeScore: 0,
    mcqAccuracy: 0,
    mainsAverageScore: 0,
    attemptsCount: 0,
    status: "learning",
    lastStudiedDate: undefined,
    lastRevisedDate: undefined,
    commonMistakes: ["Missing Prakash Singh SC directives (2006) when analyzing police reforms"],
    keyThinkers: ["Prakash Singh Case (SC 2006)", "National Police Commission", "Dharampira Committee"],
    subtopics: [
      { id: "pa2-5-1", name: "Police-Public Interface & Modernization", status: "learning", confidence: 0 },
      { id: "pa2-5-2", name: "Independent Regulatory Bodies (TRAI, CCI, SEBI, RBI)", status: "learning", confidence: 0 },
      { id: "pa2-5-3", name: "Criminal Justice Reforms & Citizen Safety", status: "learning", confidence: 0 },
    ],
  },
  {
    id: "pa2-6",
    name: "Citizen-Centric Administration & E-Governance",
    paper: "Paper 2",
    subject: "Public Administration",
    completionPercentage: 0,
    knowledgeScore: 0,
    mcqAccuracy: 0,
    mainsAverageScore: 0,
    attemptsCount: 0,
    status: "learning",
    lastStudiedDate: undefined,
    lastRevisedDate: undefined,
    commonMistakes: ["Failing to highlight Sevottam model's three distinct modules"],
    keyThinkers: ["2nd ARC 12th Report", "Sevottam Model", "Digital India Framework"],
    subtopics: [
      { id: "pa2-6-1", name: "Right to Information Act & Institutional Bottlenecks", status: "learning", confidence: 0 },
      { id: "pa2-6-2", name: "Sevottam Model & Grievance Redressal Mechanisms", status: "learning", confidence: 0 },
      { id: "pa2-6-3", name: "Digital Public Infrastructure (Aadhaar, UPI, DigiLocker)", status: "learning", confidence: 0 },
    ],
  },
];

// UPSC PRELIMS PRACTICE QUESTIONS (Including exact screenshot question)
export const prelimsPracticeQuestions: PrelimsQuestion[] = [
  {
    id: "prelim-1",
    questionNumber: 1,
    subject: "Economy",
    topic: "Digital Payments & Monetary Governance",
    tags: ["Economy", "Current Affairs"],
    isCurrentAffairs: true,
    questionText:
      "Consider the following statements regarding the Unified Payments Interface (UPI) Merchant Discount Rate (MDR) framework introduced in 2026:\n\n1. The new UPI MDR framework excludes peer-to-peer transactions.\n2. A flat MDR applies to transactions in the fuel sector.\n3. The collected MDR is kept entirely by the acquiring bank.\n\nWhich of the statements given above are correct?",
    options: [
      { key: "A", text: "2 only" },
      { key: "B", text: "1 and 3 only" },
      { key: "C", text: "1 and 2 only" },
      { key: "D", text: "2 and 3 only" },
    ],
    correctOption: "C",
    explanation:
      "Statements 1 and 2 are correct. Under the NPCI framework, P2P and small P2M transactions up to ₹2,000 remain completely exempt. Specific essential sectors such as railways, fuel, telecom, and agriculture incur a flat ₹5 fee above ₹2,000. Statement 3 is incorrect because the collected MDR is shared proportionally across the ecosystem among acquiring banks, issuing banks, NPCI, and payment app providers (TPAPs).",
    optionAnalysis: [
      { optionKey: "1", analysis: "Correct: P2P payments are exempt from any merchant discount fees.", isCorrect: true },
      { optionKey: "2", analysis: "Correct: Fuel, railways, and telecom are granted a flat ₹5 rate for transactions > ₹2,000.", isCorrect: true },
      { optionKey: "3", analysis: "Incorrect: MDR is distributed across payment ecosystem partners, not kept solely by the acquiring bank.", isCorrect: false },
    ],
    relatedConcept: "Payment Systems in India & NPCI Regulatory Authority under PSS Act 2007",
    source: "The Hindu & NPCI Circular, Sep 16, 2026",
    difficulty: "Medium",
  },
  {
    id: "prelim-2",
    questionNumber: 2,
    subject: "Public Administration",
    topic: "Accountability & Constitutional Bodies",
    tags: ["Polity", "Governance"],
    isCurrentAffairs: false,
    questionText:
      "With reference to the Comptroller and Auditor General (CAG) of India, consider the following statements:\n\n1. The CAG audits all receipts and expenditures of the Union and State governments under Article 149.\n2. CAG's audit reports are examined by the Public Accounts Committee (PAC) of Parliament.\n3. The CAG can disallow any proposed expenditure of the government before money is drawn from the Consolidated Fund.\n\nWhich of the statements given above is/are correct?",
    options: [
      { key: "A", text: "1 and 2 only" },
      { key: "B", text: "2 only" },
      { key: "C", text: "1 and 3 only" },
      { key: "D", text: "1, 2 and 3" },
    ],
    correctOption: "A",
    explanation:
      "Statements 1 and 2 are correct. CAG is appointed under Article 148, and duties are framed under Article 149 and the DPC Act 1971. In India, unlike Britain's CAG who has 'Comptroller' powers to authorize withdrawals, India's CAG acts primarily as an 'Auditor General' conducting ex-post facto audit. He has no authority to disallow money before it is spent (Statement 3 is incorrect).",
    optionAnalysis: [
      { optionKey: "1", analysis: "Correct: CAG audits Union and state accounts under Art 149.", isCorrect: true },
      { optionKey: "2", analysis: "Correct: PAC acts as the parliamentary twin of CAG.", isCorrect: true },
      { optionKey: "3", analysis: "Incorrect: CAG does not possess control over the issue of money from the treasury.", isCorrect: false },
    ],
    relatedConcept: "Financial Accountability Mechanisms & Constitutional Mandate",
    source: "Indian Polity (M. Laxmikanth) & 2nd ARC Report on Financial Management",
    difficulty: "Medium",
  },
  {
    id: "prelim-3",
    questionNumber: 3,
    subject: "Public Administration",
    topic: "Civil Services in India",
    tags: ["Polity", "Civil Services"],
    isCurrentAffairs: false,
    questionText:
      "Which of the following bodies or commissions explicitly recommended the establishment of a National Civil Services Authority to regulate transfers, postings, and tenures of All India Services officers?",
    options: [
      { key: "A", text: "1st Administrative Reforms Commission (1966)" },
      { key: "B", text: "2nd Administrative Reforms Commission (10th Report)" },
      { key: "C", text: "Sarkaria Commission on Centre-State Relations" },
      { key: "D", text: "National Commission to Review the Working of the Constitution (NCRWC)" },
    ],
    correctOption: "B",
    explanation:
      "The 2nd ARC in its 10th Report ('Refurbishing of Personnel Administration – Scaling New Heights') explicitly recommended setting up a Central Civil Services Authority and State Civil Services Authorities to convert arbitrary political postings into objective merit-driven tenures.",
    optionAnalysis: [
      { optionKey: "A", analysis: "1st ARC focused heavily on functional specialization and unified grading structure.", isCorrect: false },
      { optionKey: "B", analysis: "Correct: 2nd ARC Report 10 recommended statutory Civil Services Boards and Authority.", isCorrect: true },
      { optionKey: "C", analysis: "Sarkaria Commission emphasized preserving All India Services for national unity.", isCorrect: false },
      { optionKey: "D", analysis: "NCRWC recommended tenure protection but the statutory Authority framework was detailed by 2nd ARC.", isCorrect: false },
    ],
    relatedConcept: "Civil Services Reforms & 2nd ARC Recommendations",
    source: "2nd ARC 10th Report",
    difficulty: "Hard",
  },
];

// MAINS PYQS & MODEL ANSWERS (Matching screenshots exactly!)
export const mainsPYQsList: MainsModelAnswer[] = [
  {
    id: "mains-pyq-1",
    year: 2026,
    paper: "GS 1",
    subject: "Indian Society",
    topic: "Social Impact of Globalization",
    marks: 15,
    directive: "Evaluate",
    tags: ["GS 1", "2026", "Indian Society", "15 Marks"],
    questionText:
      "Evaluate the impact of globalization on Indian youths with reference to social, political, economic and cultural spheres.",
    introduction:
      "Globalization, accelerated by the 1991 LPG reforms and contemporary digital hyper-connectivity, has fundamentally reshaped the aspirations and lifestyles of India's demographic dividend. It presents a dualistic reality of unprecedented socio-economic opportunity alongside complex structural disruptions.",
    diagramTitle: "Multidimensional Impact of Globalization on Indian Youth",
    diagramNodes: [
      {
        id: "d1",
        title: "Social Sphere",
        points: ["Individualism", "Nuclear Families", "Elder Care Pressures", "Urban Isolation"],
      },
      {
        id: "d2",
        title: "Economic Sphere",
        points: ["Gig Economy", "Startups & Tech", "Consumerism", "Skill Obsolescence"],
      },
      {
        id: "d3",
        title: "Political Sphere",
        points: ["Digital Activism", "Global Awareness", "Issue-based Mobilization", "Civic Tech"],
      },
      {
        id: "d4",
        title: "Cultural Sphere",
        points: ["Glocalization", "Hybrid Culture", "Identity Assertion", "Western Dietary Shifts"],
      },
    ],
    bodySections: [
      {
        title: "1. Impact on Social Sphere",
        points: [
          "Changing Family Dynamics: Accelerated transition from joint families to nuclear and single-person households in metropolitan corridors.",
          "Liberalization of Social Values: Greater acceptance of progressive ideas regarding gender equality, personal autonomy, and diverse identities.",
          "Educational Democratization: Unprecedented access to world-class pedagogy and certifications through digital platforms.",
        ],
        examples: "Surge in urban crèches, mental health support initiatives like KIRAN, and massive uptake of MOOCs like SWAYAM and Coursera by tier-2/3 students.",
      },
      {
        title: "2. Impact on Economic Sphere",
        points: [
          "Rise of Platform and Gig Economy: Flexible livelihoods empowering youth while simultaneously posing challenges regarding wage volatility and social security.",
          "Entrepreneurial Paradigm Shift: Cultural normalization of startup ventures over conventional bureaucratic career paths.",
          "Consumerism & Credit Penetration: Ease of digital micro-credit (BNPL) fueling lifestyle aspirations alongside household indebtedness.",
        ],
        examples: "India becoming the 3rd largest startup ecosystem globally with over 110+ unicorns predominantly led by founders under 35.",
      },
      {
        title: "3. Impact on Political & Civic Sphere",
        points: [
          "Digital Activism and Hashtag Mobilization: Real-time accountability demands and online public interest advocacy.",
          "Global Consciousness: Heightened awareness of planetary challenges such as climate justice, privacy rights, and algorithmic ethics.",
        ],
        examples: "Youth participation in environmental movements (Friday for Future) and digital open-source governance hackathons.",
      },
      {
        title: "4. Impact on Cultural Sphere",
        points: [
          "Glocalization: Organic synthesis of indigenous traditions with global entertainment, culinary arts, and language (Hinglish).",
          "Anomie & Cultural Alienation: Tension between traditional community expectations and Western individualistic benchmarks.",
        ],
        examples: "Global success of Indian creative industries (RRR, Yoga, Ayurveda) alongside western dietary shifts causing non-communicable health spikes.",
      },
    ],
    criticalAnalysis: [
      "Digital divide exacerbates inequality between urban digital-savvy youth and rural semi-connected populations.",
      "Informalization of employment leaves millions without health insurance or pension security in the private tech sector.",
    ],
    wayForward: [
      "Enact the National Platform Workers Social Security Framework to establish safety nets.",
      "Align vocational apprenticeships through National Education Policy (NEP) 2020 with Fourth Industrial Revolution skillsets.",
      "Institutionalize youth representation in local urban self-governance bodies (Ward Committees).",
    ],
    conclusion:
      "Globalization is neither purely an unmitigated boon nor an inescapable peril. By safeguarding constitutional values of social equity and equipping the youth with resilient capabilities, India can translate this demographic energy into inclusive national progress.",
    relevantCommitteesAndArticles: ["NEP 2020 Committee", "NITI Aayog Gig Economy Report", "Articles 39(f) and 41"],
  },
  {
    id: "mains-pyq-2",
    year: 2026,
    paper: "GS 1",
    subject: "Indian Society",
    topic: "Demography & Development",
    marks: 15,
    directive: "Critically examine",
    tags: ["GS 1", "2026", "Indian Society", "15 Marks"],
    questionText:
      "Critically examine the challenges of demographic transition in contemporary India.",
    introduction:
      "India's Total Fertility Rate (TFR) has dropped to 2.0 (below replacement rate), signaling that the nation is traversing an advanced stage of demographic transition characterized by a temporary working-age bulge alongside emerging geriatric burdens.",
    bodySections: [
      {
        title: "1. Spatial Asymmetry in Demographic Transition",
        points: [
          "Peninsular states (Kerala, Tamil Nadu) have reached sub-replacement fertility and face rapid population aging.",
          "Hinterland states (UP, Bihar) maintain youthful populations requiring immense educational and skilling capital.",
        ],
        examples: "Demographic divergence between Kerala (median age 35) and Bihar (median age 22).",
      },
      {
        title: "2. The Window of Demographic Opportunity vs Risk of Demographic Disaster",
        points: [
          "Jobless growth: Agriculture still employs ~45% of workforce while generating under 18% of GDP.",
          "Low female labor force participation rate (FLFPR) hovering around 37% despite rising female educational attainment.",
        ],
        examples: "NITI Aayog Strategy for New India highlights the urgent skilling gap.",
      },
    ],
    criticalAnalysis: [
      "Without massive social security infrastructure, India risks 'growing old before growing rich'.",
    ],
    wayForward: [
      "Invest 6% of GDP in education and 2.5% in public health.",
      "Promote care-economy infrastructure and gender-inclusive urban transit.",
    ],
    conclusion:
      "A demographic dividend is not an automatic annuity; it is a perishable opportunity requiring urgent investments in human capital and institutional support.",
    relevantCommitteesAndArticles: ["Economic Survey 2024-25 Demography Chapter", "Article 47"],
  },
  {
    id: "mains-pyq-3",
    year: 2026,
    paper: "GS 1",
    subject: "Indian Society",
    topic: "Social Stratification & Urbanization",
    marks: 15,
    directive: "Illustrate with examples",
    tags: ["GS 1", "2026", "Indian Society", "15 Marks"],
    questionText:
      "Is caste disappearing in urban India? Illustrate your answer with examples.",
    introduction:
      "While urban anonymity, secular workspaces, and metro transit have softened ritual pollution taboos, caste continues to mutate into modern relational networks, residential segregations, and matrimonial choices in urban India.",
    bodySections: [
      {
        title: "1. Spheres of Attenuation (Where Caste Is Weakening)",
        points: [
          "Public sphere anonymity: Commensality taboos have collapsed in cafes, public transit, and modern workplaces.",
          "Meritocratic corporate hiring: Globalized MNCs evaluate technical competencies over pedigree.",
        ],
      },
      {
        title: "2. Spheres of Persistence & Re-articulation",
        points: [
          "Residential Segregation: Discriminatory rental practices in metropolitan apartment societies.",
          "Matrimonial Endogamy: Caste filters remain dominant on modern digital matrimonial portals.",
          "Social Capital Networks: Privileged castes monopolize top tiers of judiciary, academia, and venture funding.",
        ],
      },
    ],
    criticalAnalysis: [
      "Caste in urban centers has shifted from a ritual hierarchy to an informal network of exclusionary social capital.",
    ],
    wayForward: [
      "Implement anti-discrimination rental housing statutes.",
      "Promote affirmative entrepreneurship through Stand-Up India and Dalit Indian Chamber of Commerce and Industry (DICCI).",
    ],
    conclusion:
      "Urbanization modifies the vocabulary of caste without extinguishing its structural leverage. Eradication demands active state intervention and transformative constitutional morality.",
    relevantCommitteesAndArticles: ["B.R. Ambedkar 'Annihilation of Caste'", "Articles 15, 17, and 38"],
  },
  {
    id: "mains-pyq-4",
    year: 2026,
    paper: "GS 1",
    subject: "Indian Geography",
    topic: "Resource Geography",
    marks: 15,
    directive: "Analyze",
    tags: ["GS 1", "2026", "Indian Geography", "15 Marks"],
    questionText:
      "Analyze the major drivers of human-induced land-use changes in India and their geographical consequences.",
    introduction:
      "Rapid economic expansion and urban population concentration have exerted acute pressure on India's 328.7 million hectares of geographical territory, catalyzing unprecedented land-use and land-cover (LULC) transformations.",
    bodySections: [
      {
        title: "1. Major Anthropogenic Drivers",
        points: [
          "Peri-urban sprawl converting fertile agricultural hinterlands into real estate layouts.",
          "Linear infrastructure expansion (highways, dedicated freight corridors) fragmenting ecological corridors.",
          "Intensive mining and mega-industrial parks in ecologically fragile tribal plateaus.",
        ],
      },
      {
        title: "2. Geographical Consequences",
        points: [
          "Creation of Urban Heat Islands (UHIs) due to pervasive concretization.",
          "Disruption of natural drainage basins leading to recurrent urban flash deluges.",
          "Accelerated desertification and soil salinity in intensive monoculture belts.",
        ],
      },
    ],
    criticalAnalysis: [
      "Encroachment of natural floodplains compromises long-term climate resilience.",
    ],
    wayForward: [
      "Enforce GIS-based Master Plans under AMRUT 2.0 and strictly protect eco-sensitive zones.",
    ],
    conclusion:
      "Sustainable land-use management is pivotal to reconciling India's infrastructure ambitions with ecological equilibrium.",
    relevantCommitteesAndArticles: ["ISRO Desertification Atlas", "Gadgil & Kasturirangan Reports"],
  },
  {
    id: "mains-pyq-5",
    year: 2026,
    paper: "GS 1",
    subject: "World Geography",
    topic: "Geopolitics & Maritime Trade",
    marks: 15,
    directive: "Examine",
    tags: ["GS 1", "2026", "World Geography", "15 Marks"],
    questionText:
      "\"The centre of global trade is gradually shifting from the Atlantic region to the Indo-Pacific region.\" Examine this statement.",
    introduction:
      "The 21st century has witnessed a geo-economic re-centering where the Indo-Pacific has eclipsed the transatlantic corridor as the primary engine of maritime commerce, supply-chain resilience, and energy flows.",
    bodySections: [
      {
        title: "1. Empirical Manifestations of the Shift",
        points: [
          "Over 60% of world maritime trade traverses Indo-Pacific waters, notably through the Straits of Malacca, Sunda, and Lombok.",
          "Economic dynamism of Asian giants (India, ASEAN, Japan) driving global GDP growth.",
          "Critical supply-chain nodes: High-end semiconductor fabrication concentrated in Taiwan, South Korea, and Japan.",
        ],
      },
      {
        title: "2. Strategic Vulnerabilities & Chokepoints",
        points: [
          "Vulnerability of narrow maritime straits to geopolitical coercion and piracy.",
          "Weaponization of critical minerals and trade chokepoints by revisionist powers.",
        ],
      },
    ],
    criticalAnalysis: [
      "The Indo-Pacific is also becoming the primary theater of geopolitical contestation.",
    ],
    wayForward: [
      "Uphold UNCLOS-compliant Freedom of Navigation Operations (FONOPs) and deepen QUAD/I2U2 maritime domain awareness.",
    ],
    conclusion:
      "As the geo-economic fulcrum permanently relocates eastwards, India's SAGAR doctrine and Act East Policy position it as a net security and prosperity provider in the region.",
    relevantCommitteesAndArticles: ["UNCLOS 1982", "SAGAR Doctrine"],
  },
  // PUBLIC ADMINISTRATION OPTIONAL PYQS
  {
    id: "mains-pyq-6",
    year: 2025,
    paper: "Paper 1",
    subject: "Public Administration",
    topic: "Administrative Thought",
    marks: 15,
    directive: "Critically examine",
    tags: ["Paper 1", "2025", "Public Admin", "15 Marks"],
    questionText:
      "Herbert Simon's concept of 'Bounded Rationality' dismantled the illusion of the Classical Economic Man. Critically examine its validity in the age of Big Data and AI-driven algorithmic governance.",
    introduction:
      "In 'Administrative Behavior' (1947), Herbert Simon contested the Classical omniscience of 'Economic Man' who maximizes utility, asserting that human administrators operate under 'Bounded Rationality' and therefore 'satisfice'. While Big Data expands computational horizons, algorithmic governance introduces novel bounds of opacity, algorithmic bias, and ethical dilemmas.",
    diagramTitle: "Bounded Rationality vs Algorithmic Decision Paradigm",
    diagramNodes: [
      { id: "s1", title: "Simon's 3 Bounds", points: ["Cognitive limits", "Incomplete info", "Time constraints"] },
      { id: "s2", title: "AI/Big Data Shift", points: ["Superhuman speed", "Pattern synthesis", "Predictive analytics"] },
      { id: "s3", title: "New Algorithmic Bounds", points: ["Black-box opacity", "Historical bias", "Value vs Fact conflict"] },
    ],
    bodySections: [
      {
        title: "1. Core Premises of Simon's Satisficing Model",
        points: [
          "Fact vs Value Dichotomy: Simon noted that value premises cannot be mathematically calculated; they remain subject to moral and political contestation.",
          "Aspiration-Level Adaptation: Bureaucrats select the first alternative meeting minimum acceptable benchmarks.",
        ],
        thinkers: ["Herbert Simon", "Charles Lindblom (Muddling Through)", "Yehezkel Dror (Optimal Model)"],
      },
      {
        title: "2. The AI Disruption: Does Total Rationality Return?",
        points: [
          "Mitigation of Classical Constraints: Machine learning tools process petabytes of real-time administrative logs in milliseconds.",
          "The New Bounds: Predictive policing and automated welfare distribution suffer from data poisoning, exclusionary algorithmic errors, and lack of discretionary empathy.",
        ],
        examples: "Exclusion errors in automated ration cards (PDS) and predictive policing trials in urban centers.",
      },
    ],
    criticalAnalysis: [
      "AI automates 'programmed decisions' brilliantly, but 'non-programmed decisions' involving equity, justice, and human dignity remain inherently bounded and human-centric.",
    ],
    wayForward: [
      "Adopt 'Human-in-the-Loop' governance models.",
      "Institutionalize Algorithmic Impact Assessments under 2nd ARC principles of administrative ethics and transparency.",
    ],
    conclusion:
      "Rather than rendering Simon obsolete, algorithmic governance vindicates his fundamental insight: bounded rationality cannot be engineered away because administration is fundamentally an exercise in value-laden human stewardship.",
    relevantCommitteesAndArticles: ["2nd ARC 4th Report", "NITI Aayog National Strategy for AI"],
  },
];

