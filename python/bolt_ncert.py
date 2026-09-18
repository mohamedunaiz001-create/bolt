#!/usr/bin/env python3
"""
BOLT - NCERT Foundation Curriculum & Assessment Engine (Class 6 to 12)
Comprehensive mapping of UPSC NCERT textbooks across Polity, History,
Geography, Economy, and Science with high-yield crux and foundation quizzes.
"""

import sys
import json
import argparse
from typing import Dict, List, Any


NCERT_SUBJECTS = ["Polity", "History", "Geography", "Economy", "Science"]
NCERT_CLASSES = [6, 7, 8, 9, 10, 11, 12]

NCERT_CHAPTERS: List[Dict[str, Any]] = [
    # -------------------------------------------------------------
    # POLITY NCERTS
    # -------------------------------------------------------------
    {
        "id": "ncert-polity-11-c1",
        "subject": "Polity",
        "classNum": 11,
        "bookTitle": "Indian Constitution at Work (Class 11)",
        "chapterNumber": 1,
        "chapterTitle": "Constitution: Why and How?",
        "upscWeightage": "Very High",
        "keyConcepts": [
            "Coordination & Assurance",
            "Specification of Decision-Making Powers",
            "Limitations on State Power",
            "Aspirations & Goals of Society",
            "Fundamental Identity of a People",
        ],
        "highYieldCrux": (
            "A Constitution is not merely a legal rulebook; it provides minimal coordination among diverse citizens, "
            "demarcates who exercises legitimate power, places enforceable boundaries (Fundamental Rights) on authority, "
            "and enables the state to realize social justice (Directive Principles)."
        ),
        "mindmapPoints": [
            "Function 1: Set of basic rules allowing minimal coordination.",
            "Function 2: Specifies who has the power to make decisions in society.",
            "Function 3: Sets limits on what a government can impose on citizens.",
            "Function 4: Enables government to fulfill aspirations and create conditions for a just society.",
        ],
        "quizQuestions": [
            {
                "id": "ncert-q-p11-1",
                "questionNumber": 1,
                "questionText": (
                    "According to NCERT Class 11 'Indian Constitution at Work', which of the following is considered the FIRST function of a Constitution?"
                ),
                "options": [
                    {"key": "A", "text": "To specify which branch of government holds absolute supremacy."},
                    {"key": "B", "text": "To provide a set of basic rules that allow for minimal coordination amongst members of a society."},
                    {"key": "C", "text": "To ensure that all economic resources are distributed equally across citizens."},
                    {"key": "D", "text": "To mandate direct democratic referendums for constitutional amendments."},
                ],
                "correctOption": "B",
                "explanation": (
                    "Chapter 1 explicitly articulates Function 1: 'The first function of a constitution is to provide a set of basic rules "
                    "that allow for minimal coordination amongst members of a society.' Without common rules, life would be insecure and anarchic."
                ),
            },
            {
                "id": "ncert-q-p11-2",
                "questionNumber": 2,
                "questionText": (
                    "Consider the following statements regarding the Constituent Assembly of India as highlighted in NCERT:\n\n"
                    "1. The Constituent Assembly was directly elected by all adult citizens of India on the basis of universal adult franchise in 1946.\n"
                    "2. The members were elected by indirect election by the members of the Provincial Legislative Assemblies established under the Government of India Act 1935.\n"
                    "3. The Objectives Resolution, introduced by Jawaharlal Nehru in 1946, defined the ideological aspirations of the Constitution.\n\n"
                    "Which of the statements given above is/are correct?"
                ),
                "options": [
                    {"key": "A", "text": "1 and 3 only"},
                    {"key": "B", "text": "2 and 3 only"},
                    {"key": "C", "text": "2 only"},
                    {"key": "D", "text": "1, 2 and 3"},
                ],
                "correctOption": "B",
                "explanation": (
                    "Statements 2 and 3 are correct. The Assembly was NOT elected through universal adult franchise; members were indirectly "
                    "elected by Provincial Legislative Assemblies under the Cabinet Mission Plan. Nehru introduced the historic Objectives Resolution on Dec 13, 1946."
                ),
            }
        ],
    },
    {
        "id": "ncert-polity-11-c2",
        "subject": "Polity",
        "classNum": 11,
        "bookTitle": "Indian Constitution at Work (Class 11)",
        "chapterNumber": 2,
        "chapterTitle": "Rights in the Indian Constitution",
        "upscWeightage": "Very High",
        "keyConcepts": [
            "Bill of Rights & Constitutional Morality",
            "Writs (Habeas Corpus, Mandamus, Quo Warranto, Prohibition, Certiorari)",
            "Directive Principles vs. Fundamental Rights",
            "Preventive Detention Protections (Article 22)",
        ],
        "highYieldCrux": (
            "The Constitution guarantees enforceable Fundamental Rights under Part III. Dr. Ambedkar described Article 32 (Right to Constitutional Remedies) "
            "as the 'Heart and Soul of the Constitution'. Fundamental Rights protect citizens against state encroachment, while DPSPs guide the state toward welfare."
        ),
        "mindmapPoints": [
            "Article 14-18: Right to Equality",
            "Article 19-22: Right to Freedom",
            "Article 23-24: Right against Exploitation",
            "Article 25-28: Freedom of Religion",
            "Article 29-30: Cultural and Educational Rights",
            "Article 32: Right to Constitutional Remedies (5 Prerogative Writs)",
        ],
        "quizQuestions": [
            {
                "id": "ncert-q-p11-2-1",
                "questionNumber": 1,
                "questionText": (
                    "With reference to the writ of 'Quo-Warranto' in Indian constitutional law, consider the following statements:\n\n"
                    "1. It is issued by the court to inquire into the legality of a claim of a person to a public office.\n"
                    "2. It cannot be sought by any interested person unless their personal legal right has been directly violated.\n\n"
                    "Which of the statements given above is/are correct?"
                ),
                "options": [
                    {"key": "A", "text": "1 only"},
                    {"key": "B", "text": "2 only"},
                    {"key": "C", "text": "Both 1 and 2"},
                    {"key": "D", "text": "Neither 1 nor 2"},
                ],
                "correctOption": "A",
                "explanation": (
                    "Statement 1 is correct: Quo-Warranto literally means 'By what authority?'. It prevents illegal usurpation of a public office. "
                    "Statement 2 is incorrect because, unlike other writs, Quo-Warranto does not require locus standi—any member of the public can petition the court."
                ),
            }
        ],
    },

    # -------------------------------------------------------------
    # HISTORY NCERTS
    # -------------------------------------------------------------
    {
        "id": "ncert-hist-6-c1",
        "subject": "History",
        "classNum": 6,
        "bookTitle": "Our Pasts - I (Class 6)",
        "chapterNumber": 3,
        "chapterTitle": "From Gathering to Growing Food & Harappan Civilization",
        "upscWeightage": "High",
        "keyConcepts": [
            "Mehrgarh Early Domestication (Neolithic)",
            "Citadel vs Lower Town Layout",
            "Great Bath at Mohenjodaro & Drainage Engineering",
            "Harappan Seals (Steatite) & Craft Specialization at Chanhudaro",
            "Dockyard at Lothal",
        ],
        "highYieldCrux": (
            "The Indus Valley Civilization (Bronze Age) pioneered grid town planning, burnt brick construction, and covered underground drainage systems. "
            "Mehrgarh in Baluchistan demonstrates continuous transition from hunter-gatherers to wheat/barley agriculture and cattle rearing from c. 7000 BCE."
        ),
        "mindmapPoints": [
            "Citadel (Western, smaller, elevated, public architecture)",
            "Lower Town (Eastern, larger, residential grid layout)",
            "Mohenjodaro: Great Bath, Granary, Bronze Dancing Girl",
            "Lothal: Tidal Dockyard, Bead-making factory",
            "Kalibangan: Ploughed field, Fire altars",
            "Dholavira: Tripartite layout, giant stone reservoirs, Signboard",
        ],
        "quizQuestions": [
            {
                "id": "ncert-q-h6-1",
                "questionNumber": 1,
                "questionText": (
                    "Which of the following Harappan sites is renowned for having a unique tripartite settlement division (Citadel, Middle Town, and Lower Town) "
                    "and sophisticated rainwater harvesting rock-cut reservoirs?"
                ),
                "options": [
                    {"key": "A", "text": "Kalibangan"},
                    {"key": "B", "text": "Dholavira"},
                    {"key": "C", "text": "Banawali"},
                    {"key": "D", "text": "Rakhigarhi"},
                ],
                "correctOption": "B",
                "explanation": (
                    "Dholavira in the Rann of Kutch (Gujarat) is distinct among Harappan settlements for its three-part division protected by massive stone walls, "
                    "and its interconnected series of 16 monumental water reservoirs."
                ),
            }
        ],
    },
    {
        "id": "ncert-hist-12-c1",
        "subject": "History",
        "classNum": 12,
        "bookTitle": "Themes in Indian History - Part I (Class 12)",
        "chapterNumber": 2,
        "chapterTitle": "Kings, Farmers and Towns: Early States and Economies (c. 600 BCE - 600 CE)",
        "upscWeightage": "Very High",
        "keyConcepts": [
            "James Prinsep Decipherment of Brahmi & Kharosthi (1838)",
            "Sixteen Mahajanapadas & Rise of Magadha",
            "Ashokan Edicts & Dhamma",
            "Mauryan Administration (Megasthenes & Arthashastra)",
            "Kushana Coinage & Divine Kingship",
        ],
        "highYieldCrux": (
            "600 BCE was an era of second urbanization in the Gangetic plains, emergence of coins (Punch-marked coins), iron tool expansion, and growth of 16 Mahajanapadas. "
            "Magadha triumphed due to fertile alluvium, iron deposits at Rajgir, elephant reserves, and strategic water transport along the Ganga and Son."
        ),
        "mindmapPoints": [
            "Mahajanapadas: Monarchies (Rajyas) and Ganas/Sanghas (Oligarchies)",
            "Ashokan Edicts: Major Rock Edicts, Pillar Edicts, Minor Edicts written in Prakrit, Greek, and Aramaic",
            "Inscriptions: Brahmi read left to right; Kharosthi read right to left",
            "Gupta Epigraphy: Prayag Prashasti (Allahabad Pillar) composed by Harishena in Sanskrit",
        ],
        "quizQuestions": [
            {
                "id": "ncert-q-h12-1",
                "questionNumber": 1,
                "questionText": (
                    "With reference to early Indian inscriptions, who among the following deciphered the Brahmi and Kharosthi scripts in 1838, "
                    "identifying the title 'Piyadassi' with Emperor Ashoka?"
                ),
                "options": [
                    {"key": "A", "text": "Alexander Cunningham"},
                    {"key": "B", "text": "Sir William Jones"},
                    {"key": "C", "text": "James Prinsep"},
                    {"key": "D", "text": "John Marshall"},
                ],
                "correctOption": "C",
                "explanation": (
                    "James Prinsep, an officer in the mint of the East India Company, deciphered Brahmi and Kharosthi in 1838, unlocking thousands of years of ancient Indian historical records."
                ),
            }
        ],
    },

    # -------------------------------------------------------------
    # GEOGRAPHY NCERTS
    # -------------------------------------------------------------
    {
        "id": "ncert-geo-11-c1",
        "subject": "Geography",
        "classNum": 11,
        "bookTitle": "Fundamentals of Physical Geography (Class 11)",
        "chapterNumber": 3,
        "chapterTitle": "Interior of the Earth & Plate Tectonics",
        "upscWeightage": "Very High",
        "keyConcepts": [
            "Direct vs Indirect Sources of Earth's Interior",
            "P-waves (Longitudinal/Compressional) vs S-waves (Transverse)",
            "Shadow Zones (P-wave 105°-145°, S-wave beyond 105°)",
            "Continental Drift (Wegener) & Seafloor Spreading (Harry Hess)",
            "Divergent, Convergent, and Transform Plate Boundaries",
        ],
        "highYieldCrux": (
            "Seismic wave propagation proves the Earth's layered interior. S-waves cannot travel through liquids, revealing the outer core's molten state. "
            "Plate tectonics explains global earthquake and volcanism patterns along converging (destructive), diverging (constructive), and transform boundaries."
        ),
        "mindmapPoints": [
            "Crust (Continental: SIAL, Oceanic: SIMA)",
            "Mantle (Asthenosphere is weak plastic zone 100-400 km driving plates)",
            "Outer Core (Liquid iron-nickel generating geomagnetic geodynamo)",
            "Inner Core (Solid crystalline iron-nickel under extreme lithostatic pressure)",
        ],
        "quizQuestions": [
            {
                "id": "ncert-q-g11-1",
                "questionNumber": 1,
                "questionText": (
                    "Consider the following statements regarding seismic body waves traveling through the Earth's interior:\n\n"
                    "1. P-waves are similar to sound waves and can travel through gaseous, liquid, and solid materials.\n"
                    "2. S-waves travel only through solid materials.\n"
                    "3. The shadow zone of S-waves is significantly smaller than the shadow zone of P-waves.\n\n"
                    "Which of the statements given above is/are correct?"
                ),
                "options": [
                    {"key": "A", "text": "1 and 2 only"},
                    {"key": "B", "text": "2 and 3 only"},
                    {"key": "C", "text": "1 and 3 only"},
                    {"key": "D", "text": "1, 2 and 3"},
                ],
                "correctOption": "A",
                "explanation": (
                    "Statements 1 and 2 are correct. P-waves compress and dilate matter and traverse solids, liquids, and gases. "
                    "S-waves are transverse shear waves that cannot transmit through liquids. Statement 3 is incorrect because the shadow zone "
                    "of S-waves covers the entire region beyond 105° (more than 40% of the Earth's surface), making it much larger than the P-wave shadow zone (105°-145°)."
                ),
            }
        ],
    },

    # -------------------------------------------------------------
    # ECONOMY NCERTS
    # -------------------------------------------------------------
    {
        "id": "ncert-econ-11-c1",
        "subject": "Economy",
        "classNum": 11,
        "bookTitle": "Indian Economic Development (Class 11)",
        "chapterNumber": 1,
        "chapterTitle": "Indian Economy on the Eve of Independence & Structural Changes",
        "upscWeightage": "High",
        "keyConcepts": [
            "Colonial De-industrialization & Ruin of Handicrafts",
            "Drain of Wealth Theory (Dadabhai Naoroji & R.C. Dutt)",
            "Commercialization of Agriculture & Recurrent Famines",
            "Demographic Transition (1921 Year of Great Divide)",
        ],
        "highYieldCrux": (
            "Colonial policies transformed India into a supplier of raw materials (cotton, jute, indigo) and a consumer of British machine-manufactured goods. "
            "1921 is known as the 'Year of the Great Divide' as India transitioned from high fluctuating mortality to steady population growth."
        ),
        "mindmapPoints": [
            "Agriculture: Zamindari system in Bengal Presidency led to rack-renting and absolute stagnation.",
            "Handicrafts: Loss of royal patronage and asymmetric discriminatory tariff policies.",
            "Railways: Introduced in 1853, primarily designed for colonial troop movement and raw material extraction from the hinterland.",
            "1921: Year of Great Divide in Indian demography.",
        ],
        "quizQuestions": [
            {
                "id": "ncert-q-e11-1",
                "questionNumber": 1,
                "questionText": (
                    "Why is the year 1921 regarded as the 'Year of the Great Divide' in the demographic history of India in NCERT Economic studies?"
                ),
                "options": [
                    {"key": "A", "text": "Because India conducted its first synchronous census in 1921."},
                    {"key": "B", "text": "Because prior to 1921, India was in the first stage of demographic transition with fluctuating high death rates; after 1921, population entered continuous growth."},
                    {"key": "C", "text": "Because life expectancy exceeded 60 years for the first time."},
                    {"key": "D", "text": "Because the rural-to-urban migration surpassed 50%."},
                ],
                "correctOption": "B",
                "explanation": (
                    "Prior to 1921, India experienced alternating spikes in population due to severe famines and epidemics (1918 Spanish Flu). "
                    "After 1921, mortality gradually declined while birth rates remained high, leading to sustained demographic expansion."
                ),
            }
        ],
    },

    # -------------------------------------------------------------
    # SCIENCE & ENVIRONMENT NCERTS
    # -------------------------------------------------------------
    {
        "id": "ncert-sci-12-c1",
        "subject": "Science",
        "classNum": 12,
        "bookTitle": "Biology (Class 12) - Ecology & Environment Unit",
        "chapterNumber": 14,
        "chapterTitle": "Ecosystem: Trophic Levels, Ecological Pyramids & Nutrient Cycling",
        "upscWeightage": "Very High",
        "keyConcepts": [
            "Lindeman's 10% Trophic Transfer Law",
            "Inverted Ecological Pyramids (Biomass pyramid in marine ecosystems)",
            "Gaseous vs Sedimentary Nutrient Cycles (Carbon vs Phosphorus)",
            "Primary vs Secondary Ecological Succession (Pioneer Species, Climax Community)",
        ],
        "highYieldCrux": (
            "Energy flow in an ecosystem is always unidirectional and dissipates as metabolic heat, meaning the Pyramid of Energy is NEVER inverted. "
            "However, the Pyramid of Biomass in sea/aquatic ecosystems is inverted because phytoplankton have high reproductive turnover but small standing biomass."
        ),
        "mindmapPoints": [
            "Pyramid of Energy: Always upright without exception.",
            "Pyramid of Biomass: Upright on land (forests/grasslands), inverted in open oceans.",
            "Pyramid of Numbers: Can be upright (grassland) or inverted (single oak tree supporting thousands of insects).",
            "Nutrient Cycles: Carbon/Nitrogen are gaseous (atmosphere reservoir); Phosphorus/Sulfur are sedimentary (lithosphere rock reservoir).",
        ],
        "quizQuestions": [
            {
                "id": "ncert-q-s12-1",
                "questionNumber": 1,
                "questionText": (
                    "Which of the following ecological pyramids can NEVER be inverted in any ecosystem under natural conditions?"
                ),
                "options": [
                    {"key": "A", "text": "Pyramid of numbers in a tree ecosystem"},
                    {"key": "B", "text": "Pyramid of biomass in an aquatic lake ecosystem"},
                    {"key": "C", "text": "Pyramid of energy"},
                    {"key": "D", "text": "Pyramid of biomass in an ocean ecosystem"},
                ],
                "correctOption": "C",
                "explanation": (
                    "The pyramid of energy is always upright because according to the Second Law of Thermodynamics and Lindeman's 10% law, "
                    "energy is irreversibly lost as heat at each successive trophic transfer."
                ),
            }
        ],
    },
]

import os

_DATA_PATH = os.path.join(os.path.dirname(__file__), "ncert_data.json")
if os.path.exists(_DATA_PATH):
    try:
        with open(_DATA_PATH, "r", encoding="utf-8") as f:
            _loaded = json.load(f)
            if isinstance(_loaded, list) and len(_loaded) > 0:
                NCERT_CHAPTERS = _loaded
    except Exception as e:
        sys.stderr.write(f"Warning: could not load {_DATA_PATH}: {e}\n")


def get_ncert_chapters(subject: str = None, class_num: int = None) -> List[Dict[str, Any]]:
    """Filters NCERT chapters based on subject and class."""
    results = NCERT_CHAPTERS
    if subject and subject.lower() != "all":
        results = [c for c in results if c["subject"].lower() == subject.lower()]
    if class_num:
        results = [c for c in results if c["classNum"] == class_num]
    return results


def get_ncert_quiz_for_chapter(chapter_id: str) -> List[Dict[str, Any]]:
    """Retrieves all quiz questions associated with a specific chapter."""
    for c in NCERT_CHAPTERS:
        if c["id"] == chapter_id:
            return c.get("quizQuestions", [])
    return []


def get_ncert_summary_stats() -> Dict[str, Any]:
    """Returns overview statistics of the NCERT module."""
    total_chapters = len(NCERT_CHAPTERS)
    total_questions = sum(len(c.get("quizQuestions", [])) for c in NCERT_CHAPTERS)
    subject_counts = {}
    for c in NCERT_CHAPTERS:
        s = c["subject"]
        subject_counts[s] = subject_counts.get(s, 0) + 1

    return {
        "totalChapters": total_chapters,
        "totalQuestions": total_questions,
        "availableSubjects": NCERT_SUBJECTS,
        "availableClasses": NCERT_CLASSES,
        "subjectDistribution": subject_counts,
    }


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="BOLT NCERT Foundation Curriculum & Quiz Engine")
    parser.add_argument("--subject", choices=["Polity", "History", "Geography", "Economy", "Science", "all"], default="all")
    parser.add_argument("--class-num", type=int, choices=[6, 7, 8, 9, 10, 11, 12])
    parser.add_argument("--chapter-id", help="Chapter ID to get questions")
    parser.add_argument("--summary", action="store_true", help="Print summary stats")

    args = parser.parse_args()

    if args.summary:
        print(json.dumps(get_ncert_summary_stats(), indent=2))
    elif args.chapter_id:
        qs = get_ncert_quiz_for_chapter(args.chapter_id)
        print(json.dumps({"chapterId": args.chapter_id, "questions": qs}, indent=2))
    else:
        chapters = get_ncert_chapters(subject=args.subject, class_num=args.class_num)
        print(json.dumps({"count": len(chapters), "chapters": chapters}, indent=2))
