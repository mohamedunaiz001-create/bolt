export interface ReasoningPhase {
  phase: string;
  title: string;
  detail: string;
  iconName?: "brain" | "book-open" | "landmark" | "target" | "arrow-right";
}

export interface ParsedThoughtResult {
  cleanedText: string;
  thoughtProcess: string;
  reasoningPhases: ReasoningPhase[];
  durationEstimateSeconds: number;
}

/**
 * Extracts <thought> or <thinking> tags from raw LLM output,
 * or synthesizes a context-aware 5-phase reasoning chain if none exists.
 */
export function extractOrGenerateThoughtProcess(
  rawText: string,
  userQuery?: string,
  optionalSubject = "Public Administration"
): ParsedThoughtResult {
  const thoughtMatch = rawText.match(/<(?:thought|thinking)>([\s\S]*?)<\/(?:thought|thinking)>/i);

  let cleanedText = rawText;
  let rawThought = "";

  if (thoughtMatch) {
    rawThought = thoughtMatch[1].trim();
    cleanedText = rawText.replace(/<(?:thought|thinking)>[\s\S]*?<\/(?:thought|thinking)>/gi, "").trim();
  }

  // Parse structured phases from rawThought or generate from query & answer
  const reasoningPhases = rawThought
    ? parsePhasesFromRawThought(rawThought)
    : generateContextualPhases(userQuery || "", cleanedText, optionalSubject);

  const finalThought = rawThought || formatPhasesIntoThoughtText(reasoningPhases);

  return {
    cleanedText,
    thoughtProcess: finalThought,
    reasoningPhases,
    durationEstimateSeconds: Math.max(1.8, Math.min(4.2, +(rawText.length / 450).toFixed(1))),
  };
}

function parsePhasesFromRawThought(raw: string): ReasoningPhase[] {
  const lines = raw.split("\n").map((l) => l.trim()).filter(Boolean);
  const phases: ReasoningPhase[] = [];

  let currentTitle = "";
  let currentDetail: string[] = [];

  for (const line of lines) {
    const headerMatch = line.match(/^(?:(?:\d+\.|\-|\*)\s*)?(?:(?:Step|Phase)\s*\d+:?\s*)?([A-Za-z\s&–—\(\)]+):(.*)$/i);
    if (headerMatch) {
      if (currentTitle) {
        phases.push({
          phase: `Phase ${phases.length + 1}`,
          title: currentTitle,
          detail: currentDetail.join(" ").trim(),
        });
      }
      currentTitle = headerMatch[1].trim();
      currentDetail = headerMatch[2] ? [headerMatch[2].trim()] : [];
    } else if (currentTitle) {
      currentDetail.push(line.replace(/^[-*•]\s*/, ""));
    } else {
      currentDetail.push(line);
    }
  }

  if (currentTitle) {
    phases.push({
      phase: `Phase ${phases.length + 1}`,
      title: currentTitle,
      detail: currentDetail.join(" ").trim(),
    });
  }

  if (phases.length >= 3) {
    return phases;
  }

  // Fallback if parsing failed to extract multiple clean steps
  return [
    {
      phase: "Phase 1",
      title: "Problem Formulation & Cognitive Stance",
      detail: raw.slice(0, 200) + (raw.length > 200 ? "..." : ""),
      iconName: "brain",
    },
    {
      phase: "Phase 2",
      title: "Theoretical & Epistemological Deconstruction",
      detail: "Mapped core query against foundational syllabus concepts, thinker literature, and comparative paradigms.",
      iconName: "book-open",
    },
    {
      phase: "Phase 3",
      title: "Constitutional & Indian Governance Evidence",
      detail: "Anchored theoretical concepts into Indian administrative reality using Constitutional Articles and 2nd ARC reports.",
      iconName: "landmark",
    },
    {
      phase: "Phase 4",
      title: "UPSC CSE Scoring Architecture",
      detail: "Structured answer according to UPSC marking rubrics, keyword density, and examiner expectations.",
      iconName: "target",
    },
    {
      phase: "Phase 5",
      title: "Pedagogical Delivery & Next Steps",
      detail: "Framed response with empathetic tone, active reflection, and concrete interactive in-app next steps.",
      iconName: "arrow-right",
    },
  ];
}

function generateContextualPhases(
  query: string,
  answer: string,
  optionalSubject: string
): ReasoningPhase[] {
  const q = query.toLowerCase();
  const a = answer.toLowerCase();

  // 1. Simon / Decision Making
  if (q.includes("simon") || q.includes("bounded rationality") || q.includes("decision") || a.includes("simon")) {
    return [
      {
        phase: "Phase 1",
        title: "Query Formulation & Candidate Stance",
        detail: "Identified student inquiry into Herbert Simon's Bounded Rationality. Recognized common aspirant blocker: conflating Simon's descriptive behavioral model with prescriptive classical efficiency.",
        iconName: "brain",
      },
      {
        phase: "Phase 2",
        title: "Epistemological & Thinker Foundations (Paper 1)",
        detail: "Retrieved Simon's 1947 'Administrative Behavior'. Contrasted 'Economic Man' (global optimization) with 'Administrative Man' (satisficing). Highlighted Simon's critique of classical 'proverbs'.",
        iconName: "book-open",
      },
      {
        phase: "Phase 3",
        title: "Constitutional & Field Governance Reality (Paper 2 & 2nd ARC)",
        detail: "Anchored in Indian field administration: an SDM managing flood relief faces acute cognitive limits, requiring heuristic SOPs. Linked to 2nd ARC 10th Report (Personnel Administration) on decision-support systems.",
        iconName: "landmark",
      },
      {
        phase: "Phase 4",
        title: "UPSC CSE Evaluator Architecture & Paper 1 ↔ Paper 2 Synergy",
        detail: "Synthesized cross-thinker linkages (Chester Barnard's Zone of Indifference, Chris Argyris). Recommended examiner-attracting flowchart: Maximizing vs Satisficing search loops.",
        iconName: "target",
      },
      {
        phase: "Phase 5",
        title: "Pedagogical Guidance & In-App Action",
        detail: "Formulated empathetic guidance acknowledging intellectual difficulty. Recommended immediate testing via Mains Evaluation Room or Concept Knowledge Graph.",
        iconName: "arrow-right",
      },
    ];
  }

  // 2. Weber / Bureaucracy / Authority
  if (q.includes("weber") || q.includes("bureaucracy") || q.includes("authority") || a.includes("weber")) {
    return [
      {
        phase: "Phase 1",
        title: "Query Diagnosis & Clarifying Common Misconceptions",
        detail: "Pinpointed candidate need to examine Max Weber's Ideal-Type Bureaucracy. Noted critical exam pitfall: confusing sociological ideal-type constructs with colloquial pejorative 'red tape'.",
        iconName: "brain",
      },
      {
        phase: "Phase 2",
        title: "Theoretical Classification of Authority (Paper 1)",
        detail: "Unpacked Weber's tripartite typology (Traditional, Charismatic, Legal-Rational). Outlined structural imperatives: jurisdictional competence, graded hierarchy, impersonality ('sine ira et studio').",
        iconName: "book-open",
      },
      {
        phase: "Phase 3",
        title: "Indian Administrative Application & Constitutional Anchors (Paper 2)",
        detail: "Bridged to All India Services under Article 311. Evaluated Weberian permanence vs. modern accountability deficits. Linked to 2nd ARC 4th Report (Ethics) and lateral entry reforms.",
        iconName: "landmark",
      },
      {
        phase: "Phase 4",
        title: "Post-Weberian Critiques & Scoring Edge",
        detail: "Integrated Robert Merton's 'trained incapacity', Michel Crozier's 'vicious circles', and Weber's haunting warning of the 'Iron Cage' (*Stahlhartes Gehäuse*).",
        iconName: "target",
      },
      {
        phase: "Phase 5",
        title: "Collaborative Socratic Prompt & Drill Links",
        detail: "Invited student to practice a 15-mark Mains answer contrasting Weberian neutrality with 'committed bureaucracy', and linked to Prelims Polity practice.",
        iconName: "arrow-right",
      },
    ];
  }

  // 3. Weak areas / Syllabus diagnostics / Strategy
  if (q.includes("weak") || q.includes("syllabus") || q.includes("strategy") || q.includes("plan") || q.includes("score")) {
    return [
      {
        phase: "Phase 1",
        title: "Emotional & Cognitive State Assessment",
        detail: "Recognized syllabus overwhelm and exam anxiety. Selected empathetic coaching posture to reframe low confidence as actionable diagnostic data rather than personal deficit.",
        iconName: "brain",
      },
      {
        phase: "Phase 2",
        title: "Telemetry & Multi-Signal Metric Extraction",
        detail: `Examined candidate's live dashboard telemetry across ${optionalSubject}: cross-referencing MCQ accuracy, Mains evaluation criteria, and revision backlogs.`,
        iconName: "book-open",
      },
      {
        phase: "Phase 3",
        title: "High-Leverage Remediation Prioritization",
        detail: "Isolated Paper 1 Thinkers as the primary leverage point (since mastering Paper 1 theory directly elevates analytical depth in Paper 2 and Ethics GS 4).",
        iconName: "landmark",
      },
      {
        phase: "Phase 4",
        title: "Execution Rhythm & Time-Budget Optimization",
        detail: "Designed balanced daily cadences: 45 min active MCQ retrieval, 75 min deep-thinker consolidation, and 30 min timed answer writing.",
        iconName: "target",
      },
      {
        phase: "Phase 5",
        title: "Frictionless In-App Action Dispatch",
        detail: "Provided one-click deep links to Prelims Practice Simulator and Adaptive Study Timetable to convert strategy into immediate execution.",
        iconName: "arrow-right",
      },
    ];
  }

  // 4. General / Academic Query
  return [
    {
      phase: "Phase 1",
      title: "Query Formulation & Academic Intent",
      detail: `Parsed prompt: "${query.trim().slice(0, 90) || "UPSC Guidance"}". Mapped against ${optionalSubject} Paper 1, Paper 2, and General Studies curricula.`,
      iconName: "brain",
    },
    {
      phase: "Phase 2",
      title: "First-Principles Conceptual Retrieval",
      detail: "Deconstructed foundational theoretical tenets, historical evolution, and core academic definitions to ensure clear conceptual grounding.",
      iconName: "book-open",
    },
    {
      phase: "Phase 3",
      title: "Constitutional & Indian Governance Reality",
      detail: "Integrated relevant Constitutional Articles, statutory frameworks, 2nd ARC recommendations, or contemporary public policy initiatives.",
      iconName: "landmark",
    },
    {
      phase: "Phase 4",
      title: "UPSC CSE Scoring Architecture (Examiner's Lens)",
      detail: "Formulated high-scoring rubric points: multidimensional analysis, keyword density, and diagrammatic mental representations.",
      iconName: "target",
    },
    {
      phase: "Phase 5",
      title: "Pedagogical Delivery & Collaborative Next Steps",
      detail: "Crafted conversational synthesis with clear section demarcations and interactive in-app drill suggestions.",
      iconName: "arrow-right",
    },
  ];
}

function formatPhasesIntoThoughtText(phases: ReasoningPhase[]): string {
  return phases
    .map(
      (p) =>
        `**[${p.phase}: ${p.title}]**\n${p.detail}`
    )
    .join("\n\n");
}
