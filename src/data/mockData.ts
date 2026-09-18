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

// SAMPLE EVALUATION FOR MANISHA
export const sampleEvaluation: MainsAnswerEvaluation = {
  id: "eval-01",
  questionId: "mains-pyq-1",
  questionText:
    "Evaluate the impact of globalization on Indian youths with reference to social, political, economic and cultural spheres.",
  subject: "Indian Society (GS 1)",
  submittedDate: "Sep 15, 2026",
  score: 11,
  maxMarks: 15,
  criteria: {
    questionDemand: 8,
    content: 8,
    structure: 7,
    analysis: 6,
    examples: 8,
    conclusion: 8,
  },
  whatWentWell: [
    "Clear understanding of the core concept and prompt directive.",
    "Good inclusion of real-world administrative context and illustrative examples.",
    "Logical paragraph division with distinct introduction and forward-looking conclusion.",
  ],
  needsImprovement: [
    "Question directive was only partially addressed; needs more comparative depth.",
    "Add comparative administrative perspective between urban and rural cohorts.",
    "Use one relevant committee or NITI Aayog policy reference.",
    "Add a clean 4-quadrant conceptual flowchart to save writing time.",
  ],
  missingDimensions: [
    "Institutional dimension: Role of state oversight bodies and skill regulators.",
    "Accountability dimension: Social audit of welfare initiatives for gig workers.",
    "Citizen-centric dimension: Grassroots mental health grievance redressal.",
  ],
  boltFeedback:
    "Your answers consistently reflect solid clarity and smooth syntax. However, in this 15-marker, you spent too many words on generic narrative points in the economic sphere without providing statutory backing (e.g. Code on Social Security 2020). By integrating concise policy citations and an exam-hall flowchart, your score in this paper will reliably hit the 12.5–13/15 topper bracket.",
  studentAnswerText: `Globalization, especially after the 1991 reforms, has opened immense opportunities for Indian youth. In the social sphere, we see a rise in nuclear families and independent living in metro cities. In the economic realm, youth are entering the gig economy and tech startups. However, job insecurity is a key challenge. Culturally, youth adopt western food and fashion but also celebrate traditional festivals like Diwali with global flair. Politically, digital media has empowered youth to raise questions. In conclusion, we need policies to support skilling and mental wellbeing.`,
};

// CURRENT AFFAIRS / NEWS (Matching screenshots 5 & 6)
export const mockNewsArticles: NewsArticle[] = [
  {
    id: "news-1",
    date: "September 16, 2026",
    source: "The Hindu",
    headline: "Merchants Face 0.4% Fee On UPI Payment Above ₹2,000, Pg1",
    page: "Pg1",
    gsTags: ["GS 3: Economy", "GS 2: Governance"],
    prelimsTag: true,
    summary:
      "NPCI introduces 0.4% Merchant Discount Rate on UPI payments exceeding ₹2,000 for merchants, effective October 15, exempting P2P.",
    keyHighlights: [
      "The National Payments Corporation of India (NPCI) introduced a 0.4% Merchant Discount Rate (MDR) on Unified Payments Interface (UPI) payments exceeding ₹2,000 for most merchants.",
      "The new charges are set to take effect from October 15.",
      "Person-to-person (P2P) transactions and person-to-merchant (P2M) transactions up to ₹2,000 will remain exempt from these charges.",
      "Certain sectors like Railways, telecom, insurance, fuel, and agriculture inputs will incur a flat MDR of ₹5 for transactions above ₹2,000.",
      "A dedicated fund will be established using 5% of the total MDR collections to promote UPI usage among small merchants.",
    ],
    infographic: {
      title: "UPI MERCHANT CHARGES",
      mainAnchor: "0.4% MDR on UPI payments above ₹2,000",
      effectiveDate: "EFFECTIVE FROM OCTOBER 15",
      cards: [
        { title: "P2P Payments", subtitle: "Always Exempt", iconType: "users" },
        { title: "P2M up to ₹2,000", subtitle: "Exempt", iconType: "store" },
        { title: "Special Sectors", subtitle: "Railways, Telecom, Insurance, Fuel, Agri Inputs", value: "Flat ₹5 above ₹2,000" },
        { title: "Sharing of MDR", subtitle: "Shared among Banks, App Providers & other partners" },
        { title: "Support for Small Merchants", subtitle: "5% of total MDR collections to promote UPI among small merchants" },
        { title: "High Value Cap", subtitle: "For transactions ₹75,000 and above, MDR capped at ₹300 per transaction" },
        { title: "Small Merchant Exemption", subtitle: "UPI QR merchants receiving up to ₹1 lakh/month (P2PM) are exempt" },
      ],
      themes: ["Digital Economy", "Financial Inclusion", "Governance", "Ease of Doing Business"],
    },
    detailedInsights: [
      "The Merchant Discount Rate (MDR) will be shared among various payment ecosystem partners, including banks and app providers.",
      "For individual transactions of ₹75,000 and above, the MDR will be capped at ₹300 per transaction.",
      "Small merchants receiving up to ₹1 lakh per month via UPI QR codes under the Person-to-Person Merchant (P2PM) classification are exempt from any MDR.",
      "The Finance Ministry has advised banks to ensure that merchants do not pass on these MDR charges to customers.",
      "This new framework aims to make UPI self-sustainable and incentivize its expansion into rural and semi-urban areas.",
      "A reduced MDR of 0.02%, capped at ₹300, applies to payments for mutual funds, securities, and stock brokers to encourage retail participation in formal financial markets.",
      "Data analysis by the Finance Ministry indicates that only about 4% of merchant transactions are expected to be impacted by the introduction of MDR.",
    ],
    keyConceptsInvolved: [
      "National Payments Corporation of India (NPCI): An umbrella organization for operating retail payments and settlement systems in India.",
      "Unified Payments Interface (UPI): An instant real-time payment system developed by NPCI facilitating inter-bank peer-to-peer and person-to-merchant transactions.",
      "Merchant Discount Rate (MDR): A fee paid by a merchant to their bank for accepting payments through digital channels.",
    ],
    upscRelevance: {
      prelimsFact: "NPCI was created by RBI and IBA under the Payment and Settlement Systems Act, 2007.",
      mainsRelevance:
        "Financial sustainability vs digital financial inclusion tradeoffs. Directly relevant to GS 3 Digital Infrastructure & Financial Inclusion.",
      possibleMainsQuestion:
        "\"Sustaining digital public infrastructure requires balancing ecosystem viability with universal financial inclusion.\" In this context, analyze NPCI's calibrated MDR model for UPI.",
    },
    isBookmarked: true,
  },
  {
    id: "news-2",
    date: "September 16, 2026",
    source: "The Hindu",
    headline: "India's 26% Goods Exports Surge Lowers Trade Deficit, Pg1",
    page: "Pg1",
    gsTags: ["GS 3", "Prelims"],
    prelimsTag: true,
    summary:
      "India's trade deficit shrinks to $9.4 billion in August 2026, driven by a robust 26% surge in merchandise exports.",
    keyHighlights: [
      "Merchandise exports reached $38.2 billion in August.",
      "Electronics, engineering goods, and pharmaceuticals led outbound shipments.",
      "Services surplus helped cushion current account pressures.",
    ],
    detailedInsights: [
      "PLI schemes have started demonstrating structural export yields in mobile manufacturing and precision engineering.",
    ],
    keyConceptsInvolved: ["Trade Deficit", "Balance of Payments", "PLI Scheme"],
    upscRelevance: {
      prelimsFact: "Merchandise trade data is compiled by the Ministry of Commerce & Industry.",
      mainsRelevance: "Crucial for GS 3 External Sector and Foreign Trade Policy 2023.",
      possibleMainsQuestion: "Examine the structural drivers behind India's shifting export basket.",
    },
  },
  {
    id: "news-3",
    date: "September 16, 2026",
    source: "The Hindu",
    headline: "Peak Water: A Flow U-Turn, Pg 11",
    page: "Pg 11",
    gsTags: ["GS 3", "GS 1", "Prelims"],
    prelimsTag: true,
    summary:
      "Himalayan glaciers melt faster, pushing region towards 'peak water' by mid-century, threatening India's water security and 20% GDP.",
    keyHighlights: [
      "Third Pole glaciology shows runoff acceleration reaching peak volume within 15-20 years before irreversible deceleration.",
      "Indus, Ganga, and Brahmaputra river basins home to 600 million people face severe seasonal discharge drops.",
    ],
    detailedInsights: [
      "Glacial retreat increases Glacial Lake Outburst Floods (GLOFs) in downstream hydropower zones.",
    ],
    keyConceptsInvolved: ["Peak Water", "GLOF", "Himalayan Cryosphere"],
    upscRelevance: {
      prelimsFact: "The Hindu Kush Himalaya (HKH) region is recognized as the world's 'Third Pole'.",
      mainsRelevance: "Directly relates to GS 1 Physical Geography & GS 3 Climate Change.",
      possibleMainsQuestion: "Discuss the socio-ecological ramifications of 'Peak Water' for South Asian agrarian economies.",
    },
  },
  {
    id: "news-4",
    date: "September 16, 2026",
    source: "The Indian Express",
    headline: "Nepal flash floods wash away dreams of clean, easy hydropower, Pg 11",
    page: "Pg 11",
    gsTags: ["GS 3", "GS 1", "Prelims"],
    prelimsTag: true,
    summary:
      "Recent Nepal flash floods extensively damage 13 hydropower projects, exposing critical vulnerabilities to climate change and sediment loads in the Hindu Kush Himalaya.",
    keyHighlights: [
      "Extreme sedimentation clogged turbine blades across cross-border projects.",
      "Demonstrates high climate vulnerability of run-of-the-river hydropower plants.",
    ],
    detailedInsights: ["Need for integrated transboundary disaster early-warning mechanisms between Nepal and India."],
    keyConceptsInvolved: ["Run-of-the-river", "Sediment Load", "Transboundary Disaster Risk"],
    upscRelevance: {
      prelimsFact: "Sapta Koshi and Gandaki basins are prone to rapid cloudburst-induced debris flows.",
      mainsRelevance: "GS 2 India-Nepal relations & GS 3 Disaster Management.",
      possibleMainsQuestion: "Evaluate the resilience of renewable energy infrastructure in seismically active mountainous belts.",
    },
  },
  {
    id: "news-5",
    date: "September 16, 2026",
    source: "Editorials",
    headline: "AI cooperation, Pg8",
    page: "Pg8",
    gsTags: ["Editorial", "GS 3", "GS 2"],
    prelimsTag: false,
    summary:
      "BRICS Summit addresses AI's geopolitical crossroads, advocating open-source cooperation amidst US-China rivalry and India's balanced approach to technology weaponisation.",
    keyHighlights: [
      "Global South demands equitable access to compute infrastructure and non-aligned foundation models.",
      "India champions 'Digital Public Goods' model for AI dissemination over proprietary monopolies.",
    ],
    detailedInsights: ["New Delhi Declaration pushes for multilateral ethical AI standards at the UN General Assembly."],
    keyConceptsInvolved: ["Global AI Governance", "Digital Sovereignty", "Open Source AI"],
    upscRelevance: {
      prelimsFact: "India is the Lead Chair of the Global Partnership on Artificial Intelligence (GPAI).",
      mainsRelevance: "GS 2 International Relations & GS 3 Science and Technology.",
      possibleMainsQuestion: "Can the Global South develop a non-aligned paradigm for ethical AI governance?",
    },
  },
  {
    id: "news-6",
    date: "September 16, 2026",
    source: "Editorials",
    headline: "Youth Discontent And The Changing Face Of Protest, Pg8",
    page: "Pg8",
    gsTags: ["Editorial", "GS 2", "GS 1", "GS 3"],
    prelimsTag: false,
    summary:
      "Gen Z's new protest forms signal deep youth discontent over institutional failures and governance, challenging democratic stability across India.",
    keyHighlights: [
      "Decentralized digital networks replace traditional student unions.",
      "Focus on competitive exam leakages, unemployment, and administrative opacity.",
    ],
    detailedInsights: ["Demands for swift enactment of statutory Public Examinations (Prevention of Unfair Means) enforcement."],
    keyConceptsInvolved: ["Democratic Governance", "Youth Mobilization", "Civil Society"],
    upscRelevance: {
      prelimsFact: "Public Examinations Act 2024 provides up to 10 years imprisonment for organized cheating.",
      mainsRelevance: "GS 2 Governance, Accountability & Civil Society.",
      possibleMainsQuestion: "Analyze how digital technologies are reconfiguring civil society mobilization in contemporary India.",
    },
  },
];

export const initialModelSettings: ModelSettingsState = {
  providerName: "Gemini AI Studio (Antigravity Engine)",
  modelVersion: "gemini-3.8-flash",
  temperature: 0.7,
  contextSize: "32,768 Tokens",
  mode: "Cloud Live Engine",
  trainingDatasetsCount: 4,
  activeVersion: "v2.4-pubadmin-mains",
};
