import React, { useState, useEffect } from "react";
import {
  BookOpen,
  GraduationCap,
  Award,
  CheckCircle2,
  AlertCircle,
  Play,
  RotateCcw,
  Sparkles,
  ChevronRight,
  Filter,
  Layers,
  Compass,
  Check,
  X,
  Flame,
  Clock,
} from "lucide-react";
import { NcertChapter, NcertQuizQuestion } from "../types";

const FALLBACK_NCERT_CHAPTERS: NcertChapter[] = [
  {
    id: "ncert-polity-11-c1",
    subject: "Polity",
    classNum: 11,
    bookTitle: "Indian Constitution at Work (Class 11)",
    chapterNumber: 1,
    chapterTitle: "Constitution: Why and How?",
    upscWeightage: "Very High",
    keyConcepts: [
      "Coordination & Assurance",
      "Specification of Decision-Making Powers",
      "Limitations on State Power (Fundamental Rights)",
      "Aspirations & Goals of Society (DPSPs)",
      "Constituent Assembly Composition (Indirect Election 1946)",
    ],
    highYieldCrux:
      "A Constitution is not merely a legal rulebook; it provides minimal coordination among diverse citizens, specifies legitimate power authority, places enforceable boundaries on state power, and enables the state to realize social justice. The Constituent Assembly was indirectly elected by Provincial Assemblies under the Cabinet Mission Plan.",
    mindmapPoints: [
      "Function 1: Set of basic rules allowing minimal coordination.",
      "Function 2: Specifies who has the power to make decisions in society.",
      "Function 3: Sets limits on what a government can impose on citizens.",
      "Function 4: Enables government to fulfill aspirations and create conditions for a just society.",
    ],
    quizQuestions: [
      {
        id: "ncert-q-p11-1",
        questionNumber: 1,
        questionText:
          "According to NCERT Class 11 'Indian Constitution at Work', which of the following is considered the FIRST function of a Constitution?",
        options: [
          { key: "A", text: "To specify which branch of government holds absolute supremacy." },
          { key: "B", text: "To provide a set of basic rules that allow for minimal coordination amongst members of a society." },
          { key: "C", text: "To ensure that all economic resources are distributed equally across citizens." },
          { key: "D", text: "To mandate direct democratic referendums for constitutional amendments." },
        ],
        correctOption: "B",
        explanation:
          "Chapter 1 explicitly articulates Function 1: 'The first function of a constitution is to provide a set of basic rules that allow for minimal coordination amongst members of a society.' Without common rules, life would be insecure and anarchic.",
      },
      {
        id: "ncert-q-p11-2",
        questionNumber: 2,
        questionText:
          "Consider the following statements regarding the Constituent Assembly of India as highlighted in NCERT:\n\n1. The Constituent Assembly was directly elected by all adult citizens of India on the basis of universal adult franchise in 1946.\n2. The members were elected by indirect election by the members of the Provincial Legislative Assemblies established under the Government of India Act 1935.\n3. The Objectives Resolution, introduced by Jawaharlal Nehru in 1946, defined the ideological aspirations of the Constitution.\n\nWhich of the statements given above is/are correct?",
        options: [
          { key: "A", text: "1 and 3 only" },
          { key: "B", text: "2 and 3 only" },
          { key: "C", text: "2 only" },
          { key: "D", text: "1, 2 and 3" },
        ],
        correctOption: "B",
        explanation:
          "Statements 2 and 3 are correct. The Assembly was NOT elected through universal adult franchise; members were indirectly elected by Provincial Legislative Assemblies under the Cabinet Mission Plan. Nehru introduced the historic Objectives Resolution on Dec 13, 1946.",
      },
    ],
  },
  {
    id: "ncert-polity-11-c2",
    subject: "Polity",
    classNum: 11,
    bookTitle: "Indian Constitution at Work (Class 11)",
    chapterNumber: 2,
    chapterTitle: "Rights in the Indian Constitution",
    upscWeightage: "Very High",
    keyConcepts: [
      "Bill of Rights & Constitutional Morality",
      "Writs (Habeas Corpus, Mandamus, Quo Warranto, Prohibition, Certiorari)",
      "Directive Principles vs. Fundamental Rights",
      "Preventive Detention Protections (Article 22)",
    ],
    highYieldCrux:
      "The Constitution guarantees enforceable Fundamental Rights under Part III. Dr. Ambedkar described Article 32 (Right to Constitutional Remedies) as the 'Heart and Soul of the Constitution'. Fundamental Rights protect citizens against state encroachment, while DPSPs guide the state toward welfare.",
    mindmapPoints: [
      "Article 14-18: Right to Equality",
      "Article 19-22: Right to Freedom",
      "Article 23-24: Right against Exploitation",
      "Article 25-28: Freedom of Religion",
      "Article 29-30: Cultural and Educational Rights",
      "Article 32: Right to Constitutional Remedies (5 Prerogative Writs)",
    ],
    quizQuestions: [
      {
        id: "ncert-q-p11-2-1",
        questionNumber: 1,
        questionText:
          "With reference to the writ of 'Quo-Warranto' in Indian constitutional law, consider the following statements:\n\n1. It is issued by the court to inquire into the legality of a claim of a person to a public office.\n2. It cannot be sought by any interested person unless their personal legal right has been directly violated.\n\nWhich of the statements given above is/are correct?",
        options: [
          { key: "A", text: "1 only" },
          { key: "B", text: "2 only" },
          { key: "C", text: "Both 1 and 2" },
          { key: "D", text: "Neither 1 nor 2" },
        ],
        correctOption: "A",
        explanation:
          "Statement 1 is correct: Quo-Warranto literally means 'By what authority?'. It prevents illegal usurpation of a public office. Statement 2 is incorrect because, unlike other writs, Quo-Warranto does not require locus standi—any member of the public can petition the court.",
      },
    ],
  },
  {
    id: "ncert-hist-6-c1",
    subject: "History",
    classNum: 6,
    bookTitle: "Our Pasts - I (Class 6)",
    chapterNumber: 3,
    chapterTitle: "Harappan Civilization & Bronze Age Urbanism",
    upscWeightage: "High",
    keyConcepts: [
      "Mehrgarh Early Domestication (Neolithic)",
      "Citadel vs Lower Town Layout",
      "Great Bath at Mohenjodaro & Drainage Engineering",
      "Harappan Seals (Steatite) & Craft Specialization at Chanhudaro",
      "Dockyard at Lothal & Dholavira Tripartite City",
    ],
    highYieldCrux:
      "The Indus Valley Civilization (Bronze Age) pioneered grid town planning, burnt brick construction, and covered underground drainage systems. Dholavira features an exceptional tripartite layout and rainwater harvesting rock-cut reservoirs.",
    mindmapPoints: [
      "Citadel: Elevated, administrative & ritual buildings",
      "Lower Town: Residential grid layout, baked brick houses",
      "Lothal: Tidal dockyard on Bhogava river",
      "Dholavira: Tripartite layout with 16 stone water reservoirs",
    ],
    quizQuestions: [
      {
        id: "ncert-q-h6-1",
        questionNumber: 1,
        questionText:
          "Which of the following Harappan sites is renowned for having a unique tripartite settlement division (Citadel, Middle Town, and Lower Town) and sophisticated rainwater harvesting rock-cut reservoirs?",
        options: [
          { key: "A", text: "Kalibangan" },
          { key: "B", text: "Dholavira" },
          { key: "C", text: "Banawali" },
          { key: "D", text: "Rakhigarhi" },
        ],
        correctOption: "B",
        explanation:
          "Dholavira in the Rann of Kutch (Gujarat) is distinct among Harappan settlements for its three-part division protected by massive stone walls, and its interconnected series of 16 monumental water reservoirs.",
      },
    ],
  },
  {
    id: "ncert-geo-11-c1",
    subject: "Geography",
    classNum: 11,
    bookTitle: "Fundamentals of Physical Geography (Class 11)",
    chapterNumber: 3,
    chapterTitle: "Interior of the Earth & Seismic Waves",
    upscWeightage: "Very High",
    keyConcepts: [
      "P-waves (Longitudinal) vs S-waves (Transverse)",
      "Shadow Zones (P-wave 105°-145°, S-wave beyond 105°)",
      "Asthenosphere (Upper Mantle Plastic Zone)",
      "Liquid Outer Core & Geodynamo Magnetic Field",
    ],
    highYieldCrux:
      "Seismic wave propagation proves the Earth's layered interior. S-waves cannot travel through liquids, revealing the outer core's molten state. The S-wave shadow zone spans the entire zone beyond 105°, covering over 40% of the Earth's surface.",
    mindmapPoints: [
      "P-waves: Compressional, travel through solid, liquid, gas",
      "S-waves: Shear waves, travel only through solids",
      "Shadow Zone: S-wave > 105°; P-wave 105° to 145°",
      "Asthenosphere: Low velocity zone (100-400 km) driving plate tectonics",
    ],
    quizQuestions: [
      {
        id: "ncert-q-g11-1",
        questionNumber: 1,
        questionText:
          "Consider the following statements regarding seismic body waves traveling through the Earth's interior:\n\n1. P-waves are similar to sound waves and can travel through gaseous, liquid, and solid materials.\n2. S-waves travel only through solid materials.\n3. The shadow zone of S-waves is significantly smaller than the shadow zone of P-waves.\n\nWhich of the statements given above is/are correct?",
        options: [
          { key: "A", text: "1 and 2 only" },
          { key: "B", text: "2 and 3 only" },
          { key: "C", text: "1 and 3 only" },
          { key: "D", text: "1, 2 and 3" },
        ],
        correctOption: "A",
        explanation:
          "Statements 1 and 2 are correct. P-waves compress and dilate matter and traverse solids, liquids, and gases. S-waves are transverse shear waves that cannot transmit through liquids. Statement 3 is incorrect because the shadow zone of S-waves covers the entire region beyond 105° (more than 40% of Earth's surface), making it much larger than the P-wave shadow zone (105°-145°).",
      },
    ],
  },
  {
    id: "ncert-econ-11-c1",
    subject: "Economy",
    classNum: 11,
    bookTitle: "Indian Economic Development (Class 11)",
    chapterNumber: 1,
    chapterTitle: "Indian Economy on the Eve of Independence & Demographic Divide",
    upscWeightage: "High",
    keyConcepts: [
      "Colonial De-industrialization & Tariff Inversion",
      "Drain of Wealth (Dadabhai Naoroji)",
      "1921: Year of the Great Divide",
      "Commercialization of Agriculture & Food Insecurity",
    ],
    highYieldCrux:
      "Colonial policies transformed India into a supplier of raw materials and importer of finished industrial goods. 1921 is known as the 'Year of the Great Divide' as India transitioned from high fluctuating mortality to steady population growth.",
    mindmapPoints: [
      "1921: Demographic transition point from Stage 1 to Stage 2",
      "Handicrafts ruin: Asymmetric tariff discrimination & loss of princely patronage",
      "Zamindari: Exploitative intermediary rent extraction in Bengal Presidency",
    ],
    quizQuestions: [
      {
        id: "ncert-q-e11-1",
        questionNumber: 1,
        questionText:
          "Why is the year 1921 regarded as the 'Year of the Great Divide' in the demographic history of India in NCERT Economic studies?",
        options: [
          { key: "A", text: "Because India conducted its first synchronous census in 1921." },
          { key: "B", text: "Because prior to 1921, India was in the first stage of demographic transition with fluctuating high death rates; after 1921, population entered continuous growth." },
          { key: "C", text: "Because life expectancy exceeded 60 years for the first time." },
          { key: "D", text: "Because rural-to-urban migration surpassed 50%." },
        ],
        correctOption: "B",
        explanation:
          "Prior to 1921, India experienced alternating spikes in population due to severe famines and epidemics (1918 Spanish Flu). After 1921, mortality gradually declined while birth rates remained high, leading to sustained demographic expansion.",
      },
    ],
  },
  {
    id: "ncert-sci-12-c1",
    subject: "Science",
    classNum: 12,
    bookTitle: "Biology (Class 12) - Ecology & Environment",
    chapterNumber: 14,
    chapterTitle: "Ecosystem: Trophic Levels, Ecological Pyramids & Nutrient Cycling",
    upscWeightage: "Very High",
    keyConcepts: [
      "Lindeman's 10% Trophic Transfer Law",
      "Inverted Biomass Pyramid in Marine Ecosystems",
      "Pyramid of Energy (Always Upright)",
      "Gaseous vs Sedimentary Nutrient Cycles",
    ],
    highYieldCrux:
      "Energy flow in an ecosystem is always unidirectional and dissipates as metabolic heat, meaning the Pyramid of Energy is NEVER inverted. However, the Pyramid of Biomass in sea/aquatic ecosystems is inverted because phytoplankton have high reproductive turnover but small standing biomass.",
    mindmapPoints: [
      "Pyramid of Energy: Always upright without exception",
      "Pyramid of Biomass: Upright on land, inverted in open marine waters",
      "Nutrient Cycles: Carbon/Nitrogen are gaseous; Phosphorus/Sulfur are sedimentary",
    ],
    quizQuestions: [
      {
        id: "ncert-q-s12-1",
        questionNumber: 1,
        questionText:
          "Which of the following ecological pyramids can NEVER be inverted in any ecosystem under natural conditions?",
        options: [
          { key: "A", text: "Pyramid of numbers in a tree ecosystem" },
          { key: "B", text: "Pyramid of biomass in an aquatic lake ecosystem" },
          { key: "C", text: "Pyramid of energy" },
          { key: "D", text: "Pyramid of biomass in an ocean ecosystem" },
        ],
        correctOption: "C",
        explanation:
          "The pyramid of energy is always upright because according to the Second Law of Thermodynamics and Lindeman's 10% law, energy is irreversibly lost as heat at each successive trophic transfer.",
      },
    ],
  },
];

const SUBJECTS = ["All", "Polity", "History", "Geography", "Economy", "Science"];
const CLASSES = ["All Classes", "Class 6", "Class 7", "Class 8", "Class 9", "Class 10", "Class 11", "Class 12"];

export const NcertFoundationView: React.FC = () => {
  const [chapters, setChapters] = useState<NcertChapter[]>(FALLBACK_NCERT_CHAPTERS);
  const [selectedSubject, setSelectedSubject] = useState<string>("All");
  const [selectedClass, setSelectedClass] = useState<string>("All Classes");
  const [selectedChapter, setSelectedChapter] = useState<NcertChapter>(FALLBACK_NCERT_CHAPTERS[0]);
  const [isQuizActive, setIsQuizActive] = useState<boolean>(false);
  const [userAnswers, setUserAnswers] = useState<Record<string, "A" | "B" | "C" | "D">>({});
  const [completedChapters, setCompletedChapters] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem("bolt_ncert_completed");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Fetch chapters from Python API if available
  useEffect(() => {
    const fetchChapters = async () => {
      try {
        const res = await fetch("/api/python/ncert/chapters");
        if (res.ok) {
          const data = await res.json();
          if (data.chapters && data.chapters.length > 0) {
            setChapters(data.chapters);
            setSelectedChapter(data.chapters[0]);
          }
        }
      } catch (err) {
        console.warn("Using local NCERT foundation data:", err);
      }
    };
    fetchChapters();
  }, []);

  const toggleChapterCompleted = (chapterId: string) => {
    setCompletedChapters((prev) => {
      const updated = { ...prev, [chapterId]: !prev[chapterId] };
      try {
        localStorage.setItem("bolt_ncert_completed", JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const filteredChapters = chapters.filter((c) => {
    const matchSubject =
      selectedSubject === "All" || c.subject.toLowerCase() === selectedSubject.toLowerCase();
    const matchClass =
      selectedClass === "All Classes" ||
      c.classNum === parseInt(selectedClass.replace("Class ", ""), 10);
    return matchSubject && matchClass;
  });

  const handleSelectOption = (qId: string, optKey: "A" | "B" | "C" | "D") => {
    setUserAnswers((prev) => ({ ...prev, [qId]: optKey }));
  };

  const calculateQuizScore = () => {
    let score = 0;
    selectedChapter.quizQuestions.forEach((q) => {
      if (userAnswers[q.id] === q.correctOption) score += 2;
    });
    return score;
  };

  const completedCount = Object.values(completedChapters).filter(Boolean).length;
  const progressPercent = Math.round((completedCount / Math.max(1, chapters.length)) * 100);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-[#151b28] border border-[#232f45] rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold text-xs border border-emerald-500/30 flex items-center space-x-1">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Class 6 to 12 NCERT Foundation</span>
              </span>
              <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-xs border border-blue-500/20">
                UPSC Grounding Engine
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white font-['Outfit']">
              NCERT Foundation Hub & Chapter Quizzes
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Master core concepts from Polity, History, Geography, Economy, and Science textbooks.
              Review high-yield crux, analyze NCERT mindmaps, and attend foundational tests to solidify
              your baseline before tackling advanced UPSC standard references.
            </p>
          </div>

          {/* Reading Progress Card */}
          <div className="p-4 rounded-xl bg-[#101622] border border-[#232f45] min-w-[200px]">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
              <span>Chapters Mastered</span>
              <span className="font-bold text-emerald-400">{progressPercent}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
              <span>{completedCount} of {chapters.length} completed</span>
              <Flame className="w-3.5 h-3.5 text-amber-400" />
            </div>
          </div>
        </div>

        {/* Filters Row */}
        <div className="mt-6 pt-5 border-t border-[#232f45] flex flex-wrap items-center gap-3">
          {/* Subject Filter Pills */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 max-w-full">
            <span className="text-xs font-semibold text-slate-400 mr-1 flex items-center space-x-1">
              <Filter className="w-3 h-3" />
              <span>Subject:</span>
            </span>
            {SUBJECTS.map((subj) => (
              <button
                key={subj}
                onClick={() => setSelectedSubject(subj)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedSubject === subj
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-[#101622] text-slate-300 hover:text-white border border-[#232f45]"
                }`}
              >
                {subj}
              </button>
            ))}
          </div>

          <div className="h-4 w-[1px] bg-slate-700 hidden sm:block" />

          {/* Class Filter Dropdown */}
          <div className="flex items-center space-x-1.5">
            <span className="text-xs font-semibold text-slate-400">Class:</span>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="bg-[#101622] border border-[#232f45] text-white text-xs font-semibold rounded-lg px-2.5 py-1 focus:outline-none focus:border-blue-500"
            >
              {CLASSES.map((cls) => (
                <option key={cls} value={cls}>
                  {cls}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid: Chapter List (Left) and Selected Chapter Detail & Quiz (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Chapters Directory */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Curriculum Chapters ({filteredChapters.length})
            </h2>
            <span className="text-[11px] text-emerald-400">Select chapter</span>
          </div>

          <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1 custom-scrollbar">
            {filteredChapters.map((ch) => {
              const isSelected = selectedChapter.id === ch.id;
              const isDone = !!completedChapters[ch.id];

              return (
                <button
                  key={ch.id}
                  onClick={() => {
                    setSelectedChapter(ch);
                    setIsQuizActive(false);
                    setUserAnswers({});
                  }}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                    isSelected
                      ? "bg-emerald-600/15 border-emerald-500 text-white shadow-md ring-1 ring-emerald-500/30"
                      : "bg-[#151b28] border-[#232f45] text-slate-300 hover:border-slate-700 hover:bg-[#182133]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-slate-800 text-emerald-400 border border-slate-700">
                        Class {ch.classNum} • {ch.subject}
                      </span>
                      {isDone && (
                        <span className="flex items-center space-x-0.5 text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-700/50">
                          <Check className="w-2.5 h-2.5" />
                          <span>Done</span>
                        </span>
                      )}
                    </div>

                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-bold border ${
                        ch.upscWeightage === "Very High"
                          ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                          : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                      }`}
                    >
                      {ch.upscWeightage}
                    </span>
                  </div>

                  <h3 className="text-xs font-bold mt-2 text-white line-clamp-1">
                    {ch.chapterTitle}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">{ch.bookTitle}</p>

                  <div className="mt-2.5 flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-800/60">
                    <span>{ch.keyConcepts.length} core concepts</span>
                    <span className="text-emerald-400 font-semibold flex items-center space-x-0.5">
                      <span>{ch.quizQuestions.length} Quiz MCQs</span>
                      <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Chapter Detail or Interactive Foundation Quiz */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-[#151b28] border border-[#232f45] rounded-2xl p-6 shadow-xl">
            {/* Chapter Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#232f45]">
              <div>
                <div className="flex items-center space-x-2 mb-1.5">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase">
                    Class {selectedChapter.classNum} NCERT
                  </span>
                  <span className="text-xs text-slate-400">{selectedChapter.bookTitle}</span>
                </div>
                <h2 className="text-xl font-bold text-white font-['Outfit']">
                  Chapter {selectedChapter.chapterNumber}: {selectedChapter.chapterTitle}
                </h2>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => toggleChapterCompleted(selectedChapter.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                    completedChapters[selectedChapter.id]
                      ? "bg-emerald-600 text-white"
                      : "bg-[#101622] text-slate-300 hover:text-white border border-[#232f45]"
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>
                    {completedChapters[selectedChapter.id] ? "Completed" : "Mark as Read"}
                  </span>
                </button>

                <button
                  onClick={() => setIsQuizActive(!isQuizActive)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all ${
                    isQuizActive
                      ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md ring-1 ring-emerald-400"
                      : "bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30"
                  }`}
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>
                    {isQuizActive ? "Back to Notes" : `Attend Quiz (${selectedChapter.quizQuestions.length})`}
                  </span>
                </button>
              </div>
            </div>

            {/* Notes & Mindmap Mode */}
            {!isQuizActive && (
              <div className="mt-5 space-y-5 animate-fadeIn">
                {/* High-Yield Crux */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center space-x-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    <span>High-Yield UPSC Crux</span>
                  </h3>
                  <div className="p-4 rounded-xl bg-[#101622] border border-[#232f45] text-sm text-slate-200 leading-relaxed">
                    {selectedChapter.highYieldCrux}
                  </div>
                </div>

                {/* Key Concepts List */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center space-x-1.5">
                    <Layers className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Foundational NCERT Terms & Concepts</span>
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedChapter.keyConcepts.map((concept, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 rounded-lg bg-[#101622] border border-[#232f45] text-xs font-medium text-slate-200"
                      >
                        {concept}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Mindmap Points */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center space-x-1.5">
                    <Compass className="w-3.5 h-3.5 text-amber-400" />
                    <span>Revision Mindmap Bullets</span>
                  </h3>
                  <div className="space-y-2">
                    {selectedChapter.mindmapPoints.map((pt, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-[#101622] border border-[#232f45] text-xs text-slate-300 flex items-start space-x-2"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                        <span>{pt}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Launch Quiz Callout */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 to-teal-950/40 border border-emerald-500/30 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white">Test Foundational Understanding</h4>
                    <p className="text-[11px] text-slate-300 mt-0.5">
                      Attend the {selectedChapter.quizQuestions.length} NCERT-grounded MCQs.
                    </p>
                  </div>
                  <button
                    onClick={() => setIsQuizActive(true)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all"
                  >
                    Start Chapter Quiz
                  </button>
                </div>
              </div>
            )}

            {/* Quiz Attendance Mode */}
            {isQuizActive && (
              <div className="mt-5 space-y-5 animate-fadeIn">
                {/* Score Header */}
                <div className="p-3.5 rounded-xl bg-[#101622] border border-[#232f45] flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Award className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs text-slate-300 font-semibold">
                      Score: {calculateQuizScore()} / {selectedChapter.quizQuestions.length * 2} Marks
                    </span>
                  </div>
                  <button
                    onClick={() => setUserAnswers({})}
                    className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 text-xs hover:bg-slate-700 flex items-center space-x-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset</span>
                  </button>
                </div>

                {/* Quiz Questions */}
                <div className="space-y-5">
                  {selectedChapter.quizQuestions.map((q, qIndex) => {
                    const selected = userAnswers[q.id];
                    const isAnswered = !!selected;
                    const isCorrect = selected === q.correctOption;

                    return (
                      <div
                        key={q.id}
                        className="p-4 rounded-xl bg-[#101622] border border-[#232f45] space-y-3"
                      >
                        <div className="flex items-center space-x-2">
                          <span className="w-6 h-6 rounded bg-emerald-600/20 text-emerald-400 font-bold text-xs flex items-center justify-center">
                            {qIndex + 1}
                          </span>
                          <span className="text-xs text-slate-400 font-medium">NCERT Concept Question</span>
                        </div>

                        <p className="text-xs font-semibold text-slate-100 whitespace-pre-line leading-relaxed">
                          {q.questionText}
                        </p>

                        <div className="space-y-2 pt-1">
                          {q.options.map((opt) => {
                            const isThisSelected = selected === opt.key;
                            const isThisCorrect = q.correctOption === opt.key;

                            let optStyle =
                              "bg-[#151c2a] border-[#232f45] text-slate-200 hover:border-emerald-500/50 hover:bg-[#182133]";

                            if (isAnswered) {
                              if (isThisCorrect) {
                                optStyle =
                                  "bg-emerald-950/60 border-emerald-500 text-emerald-200 ring-1 ring-emerald-500/40";
                              } else if (isThisSelected && !isThisCorrect) {
                                optStyle =
                                  "bg-rose-950/60 border-rose-500 text-rose-200 ring-1 ring-rose-500/40";
                              } else {
                                optStyle =
                                  "bg-[#151c2a]/40 border-[#232f45]/50 text-slate-400 opacity-60";
                              }
                            }

                            return (
                              <button
                                key={opt.key}
                                onClick={() => handleSelectOption(q.id, opt.key)}
                                className={`w-full p-2.5 rounded-lg border text-left text-xs font-medium flex items-start space-x-2.5 transition-all ${optStyle}`}
                              >
                                <span
                                  className={`w-4 h-4 rounded text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5 ${
                                    isAnswered && isThisCorrect
                                      ? "bg-emerald-500 text-white"
                                      : isAnswered && isThisSelected
                                      ? "bg-rose-500 text-white"
                                      : "bg-slate-800 text-slate-300"
                                  }`}
                                >
                                  {opt.key}
                                </span>
                                <span className="flex-1 leading-relaxed">{opt.text}</span>
                                {isAnswered && isThisCorrect && (
                                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                                )}
                                {isAnswered && isThisSelected && !isThisCorrect && (
                                  <X className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                                )}
                              </button>
                            );
                          })}
                        </div>

                        {/* Explanation */}
                        {isAnswered && (
                          <div className="mt-2 p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs space-y-1 animate-fadeIn">
                            <div
                              className={`font-bold flex items-center space-x-1 ${
                                isCorrect ? "text-emerald-400" : "text-rose-400"
                              }`}
                            >
                              {isCorrect ? (
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              ) : (
                                <AlertCircle className="w-3.5 h-3.5" />
                              )}
                              <span>
                                {isCorrect ? "Correct answer!" : `Incorrect. Option ${q.correctOption} is correct`}
                              </span>
                            </div>
                            <p className="text-slate-300 leading-relaxed">{q.explanation}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
