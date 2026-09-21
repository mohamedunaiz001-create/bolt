import { StudySessionLog } from "../types";

export const getInitialStudySessions = (): StudySessionLog[] => {
  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
  const twoDaysAgo = new Date(Date.now() - 86400000 * 2).toISOString().split("T")[0];

  return [
    {
      id: "sess-today-1",
      timestamp: "07:30 AM",
      date: today,
      subject: "Public Administration Optional",
      topic: "Herbert Simon – Bounded Rationality & Decision Making",
      durationMinutes: 90,
      mode: "deep_work",
      notes: "Paper 1 Unit 2: Analyzed administrative behavior, fact-value dichotomy and satisficing model.",
    },
    {
      id: "sess-today-2",
      timestamp: "11:15 AM",
      date: today,
      subject: "Indian Administration",
      topic: "Union Government – Cabinet Secretariat & PMO Relations",
      durationMinutes: 60,
      mode: "pomodoro",
      notes: "Paper 2: Evolution of PMO vs Cabinet Secretariat under ARC recommendations.",
    },
    {
      id: "sess-today-3",
      timestamp: "03:45 PM",
      date: today,
      subject: "GS Paper 1 (Polity)",
      topic: "Constitutional Bodies – Election Commission (Art 324)",
      durationMinutes: 45,
      mode: "mains_sim",
      notes: "Prelims & Mains revision: Appointment committee structure and independence safeguards.",
    },
    {
      id: "sess-yest-1",
      timestamp: "08:00 AM",
      date: yesterday,
      subject: "Public Administration Optional",
      topic: "Max Weber – Ideal Type Bureaucracy & Patrimonialism",
      durationMinutes: 120,
      mode: "deep_work",
    },
    {
      id: "sess-yest-2",
      timestamp: "02:00 PM",
      date: yesterday,
      subject: "GS Paper 2",
      topic: "Separation of Powers & Judicial Review Doctrines",
      durationMinutes: 90,
      mode: "deep_work",
    },
    {
      id: "sess-yest-3",
      timestamp: "06:30 PM",
      date: yesterday,
      subject: "Ethics (GS Paper 4)",
      topic: "Probity in Governance & RTI Case Studies",
      durationMinutes: 90,
      mode: "mains_sim",
    },
    {
      id: "sess-past-1",
      timestamp: "09:00 AM",
      date: twoDaysAgo,
      subject: "Public Administration Optional",
      topic: "Comparative Public Administration – Fred Riggs Prismatic Model",
      durationMinutes: 150,
      mode: "deep_work",
    },
    {
      id: "sess-past-2",
      timestamp: "03:00 PM",
      date: twoDaysAgo,
      subject: "Current Affairs & Editorial",
      topic: "Federal Relations & Finance Commission devolution",
      durationMinutes: 120,
      mode: "pomodoro",
    },
  ];
};
