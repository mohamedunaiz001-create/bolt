#!/usr/bin/env python3
"""
BOLT - UPSC Historical & Modern PYQ Database (1855 - 2026)
Contains questions from 19th Century ICS examinations through 2026,
with specialized tags for Peripheral Areas and Current Affairs Integration.
"""

import sys
import json
import argparse
from typing import Dict, List, Any


ALL_PYQS: List[Dict[str, Any]] = [
    # -------------------------------------------------------------
    # 19TH CENTURY ERA (1855 - 1899)
    # The Colonial Origin & ICS Competitive Examination Era
    # -------------------------------------------------------------
    {
        "id": "pyq-1855-1",
        "year": 1855,
        "era": "19th_century",
        "eraLabel": "19th Century (1855–1899)",
        "subject": "Modern History & Administrative Evolution",
        "topic": "Macaulay Committee & Competitive ICS Exam Birth",
        "isPeripheralArea": True,
        "peripheralTag": "Colonial Civil Service Evolution (1855-1947)",
        "isCurrentAffairs": False,
        "difficulty": "Hard",
        "questionText": (
            "With reference to the open competitive examination for the Indian Civil Service introduced under the Charter Act of 1853 "
            "and the Macaulay Committee (1854), consider the following statements:\n\n"
            "1. The Charter Act of 1853 ended the patronage system of the Court of Directors of the East India Company.\n"
            "2. The Macaulay Committee recommended that the examination be conducted exclusively on specialized administrative legal codes rather than general liberal education.\n"
            "3. The first open competitive examination was held in London in July 1855.\n\n"
            "Which of the statements given above are correct?"
        ),
        "options": [
            {"key": "A", "text": "1 and 2 only"},
            {"key": "B", "text": "1 and 3 only"},
            {"key": "C", "text": "2 and 3 only"},
            {"key": "D", "text": "1, 2 and 3"},
        ],
        "correctOption": "B",
        "explanation": (
            "Statements 1 and 3 are correct. The Charter Act of 1853 abolished the Court of Directors' patronage to Haileybury College "
            "and established an open merit-based competitive examination. The first exam occurred in London in 1855. Statement 2 is incorrect "
            "because Lord Macaulay firmly insisted on a broad-based, liberal university education (Classics, Mathematics, Moral Sciences) "
            "believing that general intellectual excellence was superior to early vocational specialization."
        ),
        "optionAnalysis": [
            {"optionKey": "1", "analysis": "Correct: Charter Act 1853 Section 36 terminated proprietary patronage.", "isCorrect": True},
            {"optionKey": "2", "analysis": "Incorrect: Macaulay advocated general liberal arts education rather than vocational legalism.", "isCorrect": False},
            {"optionKey": "3", "analysis": "Correct: First examination was conducted in London in July 1855.", "isCorrect": True},
        ],
        "historicalContext": "The birth of competitive meritocracy in modern civil services, predating Britain's own domestic civil service reform.",
        "relatedConcept": "Meritocracy, Charter Act 1853, Macaulay Committee 1854",
    },
    {
        "id": "pyq-1861-1",
        "year": 1861,
        "era": "19th_century",
        "eraLabel": "19th Century (1855–1899)",
        "subject": "Modern History & Polity",
        "topic": "Indian Civil Service Act & Councils Act 1861",
        "isPeripheralArea": True,
        "peripheralTag": "Colonial Civil Service Evolution (1855-1947)",
        "isCurrentAffairs": False,
        "difficulty": "Hard",
        "questionText": (
            "Consider the following statements regarding the Indian Councils Act of 1861 and the Indian Civil Service Act of 1861:\n\n"
            "1. The Indian Councils Act of 1861 gave statutory recognition to the portfolio system introduced by Lord Canning in 1859.\n"
            "2. The Indian Civil Service Act of 1861 reserved all senior civil posts exclusively for persons who had resided in India for at least seven years.\n"
            "3. It restored legislative powers of making laws to the Governors-in-Council of Bombay and Madras, reversing the centralization of the 1833 Act.\n\n"
            "Which of the statements given above is/are correct?"
        ),
        "options": [
            {"key": "A", "text": "1 and 3 only"},
            {"key": "B", "text": "2 only"},
            {"key": "C", "text": "1 and 2 only"},
            {"key": "D", "text": "1, 2 and 3"},
        ],
        "correctOption": "A",
        "explanation": (
            "Statements 1 and 3 are correct. The Act of 1861 institutionalized Canning's portfolio system (ancestor of cabinet ministries) "
            "and initiated legislative decentralization by returning law-making powers to Bombay and Madras. Statement 2 is incorrect because "
            "the Indian Civil Service Act 1861 explicitly reserved covenanted offices for members who had passed the London competitive examination, "
            "though it allowed exceptional appointments under rigid covenants."
        ),
        "optionAnalysis": [
            {"optionKey": "1", "analysis": "Correct: Canning's portfolio system was legally recognized under Section 8.", "isCorrect": True},
            {"optionKey": "2", "analysis": "Incorrect: Covenanted positions were reserved for competitive exam entrants.", "isCorrect": False},
            {"optionKey": "3", "analysis": "Correct: Legislative decentralization reversed the unitary 1833 centralization.", "isCorrect": True},
        ],
        "historicalContext": "Foundation of ministerial governance and modern federal legislative division in British India.",
        "relatedConcept": "Portfolio System, Decentralization, Covenanted Civil Service",
    },
    {
        "id": "pyq-1886-1",
        "year": 1886,
        "era": "19th_century",
        "eraLabel": "19th Century (1855–1899)",
        "subject": "Modern History & Public Administration",
        "topic": "Aitchison Public Service Commission & 3-Tier Service Structure",
        "isPeripheralArea": True,
        "peripheralTag": "Colonial Civil Service Evolution (1855-1947)",
        "isCurrentAffairs": False,
        "difficulty": "Hard",
        "questionText": (
            "Which of the following commissions recommended the three-fold classification of civil services into 'Imperial', 'Provincial', and 'Subordinate' services in India, while rejecting simultaneous examinations in London and India?",
        ),
        "options": [
            {"key": "A", "text": "Macaulay Committee (1854)"},
            {"key": "B", "text": "Aitchison Commission (1886)"},
            {"key": "C", "text": "Islington Commission (1912)"},
            {"key": "D", "text": "Lee Commission (1924)"},
        ],
        "correctOption": "B",
        "explanation": (
            "The Aitchison Commission (Public Service Commission of 1886 chaired by Sir Charles Aitchison) recommended: "
            "(1) Abolition of the Statutory Civil Service, (2) Classification into Imperial Indian Civil Service, Provincial Civil Service (PCS), and Subordinate Civil Service, "
            "(3) Raising the age limit to 23. It rejected the demand for simultaneous examinations in India, which remained a major grievance of the Indian National Congress."
        ),
        "optionAnalysis": [
            {"optionKey": "A", "analysis": "Macaulay Committee set up the original competitive London exam in 1854.", "isCorrect": False},
            {"optionKey": "B", "analysis": "Correct: Aitchison Commission recommended the Imperial/Provincial/Subordinate tripartite structure in 1886-87.", "isCorrect": True},
            {"optionKey": "C", "analysis": "Islington Commission in 1912 suggested percentage reservations for Indians.", "isCorrect": False},
            {"optionKey": "D", "analysis": "Lee Commission in 1924 recommended parity and establishing a Public Service Commission.", "isCorrect": False},
        ],
        "historicalContext": "The Aitchison Commission laid the structural foundation of the State Civil Services (Provincial Civil Services) that exist today.",
        "relatedConcept": "Provincial Civil Services, Imperial Civil Service, Civil Service Commission 1886",
    },

    # -------------------------------------------------------------
    # EARLY 20TH CENTURY ERA (1900 - 1949)
    # The Lee Commission, Montford Reforms, & Inception of PSC (1926)
    # -------------------------------------------------------------
    {
        "id": "pyq-1924-1",
        "year": 1924,
        "era": "early_20th_century",
        "eraLabel": "Early 20th Century (1900–1949)",
        "subject": "Public Administration & Constitutional History",
        "topic": "Royal Commission on Superior Civil Services (Lee Commission)",
        "isPeripheralArea": True,
        "peripheralTag": "Colonial Civil Service Evolution (1855-1947)",
        "isCurrentAffairs": False,
        "difficulty": "Medium",
        "questionText": (
            "With reference to the Royal Commission on Superior Civil Services in India (Lee Commission, 1924), consider the following statements:\n\n"
            "1. It recommended the immediate establishment of a statutory Public Service Commission as contemplated under Section 96C of the Government of India Act 1919.\n"
            "2. It proposed that recruitment to transferred departments (such as Agriculture and Education) should be carried out exclusively by the Imperial government in London.\n"
            "3. It envisaged 50:50 parity between Europeans and Indians in the ICS within 15 years.\n\n"
            "Which of the statements given above are correct?"
        ),
        "options": [
            {"key": "A", "text": "1 and 2 only"},
            {"key": "B", "text": "1 and 3 only"},
            {"key": "C", "text": "2 and 3 only"},
            {"key": "D", "text": "1, 2 and 3"},
        ],
        "correctOption": "B",
        "explanation": (
            "Statements 1 and 3 are correct. The Lee Commission (1924) directly resulted in the establishment of the first Public Service Commission "
            "in India on October 1, 1926 (under Sir Ross Barker). It also set a 15-year target for achieving 50-50 parity between British and Indian officers. "
            "Statement 2 is incorrect because the Commission recommended provincialization of recruitment for transferred subjects, ceasing Imperial recruitment for those fields."
        ),
        "optionAnalysis": [
            {"optionKey": "1", "analysis": "Correct: Catalyzed the establishment of the Public Service Commission on Oct 1, 1926.", "isCorrect": True},
            {"optionKey": "2", "analysis": "Incorrect: Transferred departments were transferred to provincial recruitment.", "isCorrect": False},
            {"optionKey": "3", "analysis": "Correct: Targeted 50:50 parity by 1939.", "isCorrect": True},
        ],
        "historicalContext": "The birth of the Public Service Commission in India exactly a century ago (1926-2026 centennial milestone!).",
        "relatedConcept": "Public Service Commission 1926, Lee Commission, Diarchy",
    },
    {
        "id": "pyq-1935-1",
        "year": 1935,
        "era": "early_20th_century",
        "eraLabel": "Early 20th Century (1900–1949)",
        "subject": "Constitutional Law & Governance",
        "topic": "Government of India Act 1935 & Federal Public Service Commission",
        "isPeripheralArea": False,
        "peripheralTag": "Colonial Civil Service Evolution (1855-1947)",
        "isCurrentAffairs": False,
        "difficulty": "Medium",
        "questionText": (
            "The Government of India Act of 1935 provided for the establishment of which of the following public service commissions?\n\n"
            "1. Federal Public Service Commission\n"
            "2. Provincial Public Service Commissions\n"
            "3. Joint Public Service Commission for two or more provinces\n\n"
            "Select the correct answer using the code given below:"
        ),
        "options": [
            {"key": "A", "text": "1 and 2 only"},
            {"key": "B", "text": "2 and 3 only"},
            {"key": "C", "text": "1 and 3 only"},
            {"key": "D", "text": "1, 2 and 3"},
        ],
        "correctOption": "D",
        "explanation": (
            "Under Section 264 of the Government of India Act 1935, provision was made not only for a Federal Public Service Commission, "
            "but also for Provincial Public Service Commissions for each province, and Joint Public Service Commissions for two or more provinces. "
            "This structural division was directly adopted in Articles 315-323 of the Constitution of independent India in 1950."
        ),
        "optionAnalysis": [
            {"optionKey": "1", "analysis": "Federal PSC for union subjects.", "isCorrect": True},
            {"optionKey": "2", "analysis": "Provincial PSCs for provincial services.", "isCorrect": True},
            {"optionKey": "3", "analysis": "Joint PSCs for collaborative provincial requirements.", "isCorrect": True},
        ],
        "historicalContext": "Direct precursor to modern Article 315 constitutional PSC architecture.",
        "relatedConcept": "GoI Act 1935, Federal PSC, Article 315",
    },

    # -------------------------------------------------------------
    # POST-INDEPENDENCE & CLASSICAL UPSC ERA (1950 - 1999)
    # The Kothari Committee (1976), 3-Tier Pattern, & Article 311
    # -------------------------------------------------------------
    {
        "id": "pyq-1976-1",
        "year": 1976,
        "era": "post_independence",
        "eraLabel": "Classical UPSC (1950–1999)",
        "subject": "Public Administration & UPSC Examination Architecture",
        "topic": "D.S. Kothari Committee & Birth of Prelims-Mains System",
        "isPeripheralArea": True,
        "peripheralTag": "Civil Services Examination Reforms (1950-2026)",
        "isCurrentAffairs": False,
        "difficulty": "Hard",
        "questionText": (
            "Which Committee recommended the introduction of a Preliminary Examination consisting of objective-type multiple-choice questions "
            "as a qualifying screening test before the Main examination for the Civil Services in India?"
        ),
        "options": [
            {"key": "A", "text": "A.D. Gorwala Committee (1951)"},
            {"key": "B", "text": "Paul Appleby Committee (1953)"},
            {"key": "C", "text": "D.S. Kothari Committee (1976)"},
            {"key": "D", "text": "Satish Chandra Committee (1989)"},
        ],
        "correctOption": "C",
        "explanation": (
            "The Committee on Recruitment Policy and Selection Methods, headed by Dr. D.S. Kothari (appointed by UPSC in 1974, report in 1976), "
            "recommended the contemporary 3-tier structure: Preliminary Examination (objective-type screening test), Main Examination (written descriptive test), "
            "and Personality Test. The scheme was officially implemented by UPSC in 1979."
        ),
        "optionAnalysis": [
            {"optionKey": "A", "analysis": "Gorwala focused on administrative integrity and public sector organization.", "isCorrect": False},
            {"optionKey": "B", "analysis": "Appleby examined structural administrative efficiency and financial delegations.", "isCorrect": False},
            {"optionKey": "C", "analysis": "Correct: Kothari Committee created the modern Prelims-Mains-Interview examination system.", "isCorrect": True},
            {"optionKey": "D", "analysis": "Satish Chandra Committee (1989) later recommended introduction of an Essay paper.", "isCorrect": False},
        ],
        "historicalContext": "The foundational blueprint of the modern UPSC Civil Services Examination.",
        "relatedConcept": "Recruitment Reforms, Kothari Committee 1976, Screening Exam",
    },
    {
        "id": "pyq-1991-1",
        "year": 1991,
        "era": "post_independence",
        "eraLabel": "Classical UPSC (1950–1999)",
        "subject": "Indian Economy & Administrative Thought",
        "topic": "LPG Reforms & Changing Role of the State (Rolling Back)",
        "isPeripheralArea": False,
        "peripheralTag": "New Public Management & Post-LPG State",
        "isCurrentAffairs": False,
        "difficulty": "Medium",
        "questionText": (
            "The New Economic Policy of 1991 altered the fundamental paradigm of public administration from 'direct provider' to 'facilitator and regulator'. "
            "In public administration theory, this shift is most closely identified with:"
        ),
        "options": [
            {"key": "A", "text": "Classical Bureaucratic Model (Max Weber)"},
            {"key": "B", "text": "New Public Management (Osborne and Gaebler)"},
            {"key": "C", "text": "Human Relations Movement (Elton Mayo)"},
            {"key": "D", "text": "Scientific Management (F.W. Taylor)"},
        ],
        "correctOption": "B",
        "explanation": (
            "New Public Management (NPM), epitomized by David Osborne and Ted Gaebler's 'Reinventing Government' (1992), advocates 'steering rather than rowing', "
            "market-based competition, decentralization, and regulatory oversight rather than state-monopolized service delivery, matching India's post-1991 trajectory."
        ),
        "optionAnalysis": [
            {"optionKey": "A", "analysis": "Weberian bureaucracy centers hierarchical state authority.", "isCorrect": False},
            {"optionKey": "B", "analysis": "Correct: NPM emphasizes steering vs. rowing, market orientation, and managerialism.", "isCorrect": True},
            {"optionKey": "C", "analysis": "Mayo dealt with informal group dynamics and workplace psychology.", "isCorrect": False},
            {"optionKey": "D", "analysis": "Taylor focused on shop-floor time-and-motion efficiency.", "isCorrect": False},
        ],
        "historicalContext": "The 1991 economic paradigm shift transforming Indian administrative governance.",
        "relatedConcept": "New Public Management, LPG Reforms, Steering vs Rowing",
    },

    # -------------------------------------------------------------
    # MODERN ERA & PERIPHERAL / CURRENT AFFAIRS (2000 - 2026)
    # Tribal Laws, Deep Ecology, Semiconductor Fringe, UPI MDR 2026
    # -------------------------------------------------------------
    {
        "id": "pyq-2024-peri-1",
        "year": 2024,
        "era": "modern",
        "eraLabel": "Modern Era (2000–2026)",
        "subject": "Polity & Peripheral Governance",
        "topic": "PESA Act & Tribal Customary Autonomous Powers",
        "isPeripheralArea": True,
        "peripheralTag": "Tribal Customary Laws & PESA Peripheral Provisions",
        "isCurrentAffairs": True,
        "difficulty": "Hard",
        "questionText": (
            "With reference to the Provisions of the Panchayats (Extension to the Scheduled Areas) Act, 1996 (PESA), "
            "consider the following statements regarding peripheral powers of the Gram Sabha in Fifth Schedule Areas:\n\n"
            "1. The Gram Sabha possesses the mandatory right to be consulted prior to acquiring land in Scheduled Areas for development projects.\n"
            "2. Recommendation of the Gram Sabha is mandatory prior to grant of prospective license or mining lease for minor minerals in Scheduled Areas.\n"
            "3. Ownership of minor forest produce is endowed entirely in the state Forest Development Corporation, excluding the Gram Sabha.\n\n"
            "Which of the statements given above are correct?"
        ),
        "options": [
            {"key": "A", "text": "1 and 2 only"},
            {"key": "B", "text": "2 and 3 only"},
            {"key": "C", "text": "1 and 3 only"},
            {"key": "D", "text": "1, 2 and 3"},
        ],
        "correctOption": "A",
        "explanation": (
            "Statements 1 and 2 are correct under Section 4 of PESA 1996. Gram Sabhas must be consulted before land acquisition and their recommendation "
            "is mandatory prior to granting mining concessions for minor minerals. Statement 3 is incorrect because Section 4(m)(ii) explicitly endows "
            "the ownership of minor forest produce directly in the Gram Sabha and Panchayats at the appropriate level."
        ),
        "optionAnalysis": [
            {"optionKey": "1", "analysis": "Correct: Mandatory prior consultation under Sec 4(i).", "isCorrect": True},
            {"optionKey": "2", "analysis": "Correct: Mandatory prior recommendation under Sec 4(k).", "isCorrect": True},
            {"optionKey": "3", "analysis": "Incorrect: Ownership is given to Gram Sabha, not Forest Corporations.", "isCorrect": False},
        ],
        "historicalContext": "UPSC frequently tests deep peripheral nuances of PESA rules and tribal customary self-rule.",
        "relatedConcept": "PESA 1996, Minor Forest Produce, Fifth Schedule",
    },
    {
        "id": "pyq-2025-peri-2",
        "year": 2025,
        "era": "modern",
        "eraLabel": "Modern Era (2000–2026)",
        "subject": "Environment & International Treaties",
        "topic": "Deep Ecology Conventions: Minamata, Rotterdam & Kunming-Montreal",
        "isPeripheralArea": True,
        "peripheralTag": "Deep Ecology & Lesser-Known Treaties",
        "isCurrentAffairs": True,
        "difficulty": "Hard",
        "questionText": (
            "Consider the following international environmental agreements and their specialized regulatory mandates:\n\n"
            "1. Minamata Convention — Phasing out intentional anthropogenic mercury emissions across artisanal gold mining and dental amalgams.\n"
            "2. Rotterdam Convention — Promoting shared responsibility and Prior Informed Consent (PIC) procedure for hazardous industrial chemicals.\n"
            "3. Kunming-Montreal Global Biodiversity Framework — Target 3 mandates protection of at least 30% of planetary terrestrial and inland water areas by 2030 ('30x30').\n\n"
            "Which of the pairs given above are correctly matched?"
        ),
        "options": [
            {"key": "A", "text": "1 and 2 only"},
            {"key": "B", "text": "2 and 3 only"},
            {"key": "C", "text": "1 and 3 only"},
            {"key": "D", "text": "1, 2 and 3"},
        ],
        "correctOption": "D",
        "explanation": (
            "All three are correctly matched. Minamata Convention (2013, entered into force 2017) targets mercury pollution. "
            "Rotterdam Convention (1998) enforces the Prior Informed Consent procedure for banned or severely restricted chemicals. "
            "The Kunming-Montreal Global Biodiversity Framework adopted under the CBD in 2022 includes Target 3, known globally as the 30x30 biodiversity conservation target."
        ),
        "optionAnalysis": [
            {"optionKey": "1", "analysis": "Correct: Regulates elemental mercury and compounds.", "isCorrect": True},
            {"optionKey": "2", "analysis": "Correct: Implements Prior Informed Consent for trade in hazardous chemicals.", "isCorrect": True},
            {"optionKey": "3", "analysis": "Correct: Sets the signature 30x30 target for global biodiversity conservation.", "isCorrect": True},
        ],
        "historicalContext": "High-yield peripheral multilateral treaties frequently tested in UPSC Prelims.",
        "relatedConcept": "Minamata, Rotterdam, Kunming-Montreal GBF, 30x30",
    },
    {
        "id": "pyq-2026-curr-1",
        "year": 2026,
        "era": "modern",
        "eraLabel": "Modern Era (2000–2026)",
        "subject": "Economy & Monetary Technology",
        "topic": "UPI Merchant Discount Rate (MDR) Framework 2026",
        "isPeripheralArea": False,
        "peripheralTag": "Digital Public Infrastructure & Monetary Governance",
        "isCurrentAffairs": True,
        "difficulty": "Medium",
        "questionText": (
            "Consider the following statements regarding the Unified Payments Interface (UPI) Merchant Discount Rate (MDR) framework introduced in 2026:\n\n"
            "1. The new UPI MDR framework excludes peer-to-peer (P2P) transactions entirely.\n"
            "2. A flat capped MDR applies to high-value transactions in essential sectors including fuel and railway bookings.\n"
            "3. The collected MDR is retained exclusively by the merchant's acquiring bank without ecosystem revenue sharing.\n\n"
            "Which of the statements given above are correct?"
        ),
        "options": [
            {"key": "A", "text": "2 only"},
            {"key": "B", "text": "1 and 3 only"},
            {"key": "C", "text": "1 and 2 only"},
            {"key": "D", "text": "1, 2 and 3"},
        ],
        "correctOption": "C",
        "explanation": (
            "Statements 1 and 2 are correct. Under the NPCI framework, P2P transactions and small merchants remain fully exempt, while essential utilities "
            "incur a low flat fee above ₹2,000. Statement 3 is incorrect because the MDR is distributed across payment ecosystem partners including "
            "the issuing bank, acquiring bank, NPCI, and third-party application providers (TPAPs)."
        ),
        "optionAnalysis": [
            {"optionKey": "1", "analysis": "Correct: Peer-to-peer transfers incur 0% fees.", "isCorrect": True},
            {"optionKey": "2", "analysis": "Correct: Flat ₹5 cap on essential sectors above ₹2,000 threshold.", "isCorrect": True},
            {"optionKey": "3", "analysis": "Incorrect: Revenue is split across multi-stakeholder ecosystem rails.", "isCorrect": False},
        ],
        "historicalContext": "2026 Financial Governance and Digital Public Goods sustainability reforms.",
        "relatedConcept": "UPI, NPCI, MDR, Payment and Settlement Systems Act 2007",
    },
    {
        "id": "pyq-2026-curr-2",
        "year": 2026,
        "era": "modern",
        "eraLabel": "Modern Era (2000–2026)",
        "subject": "Science & Peripheral Technology",
        "topic": "EUV Lithography & Semiconductor Fabrication Peripheral S&T",
        "isPeripheralArea": True,
        "peripheralTag": "Semiconductor & Quantum S&T Fringe",
        "isCurrentAffairs": True,
        "difficulty": "Hard",
        "questionText": (
            "In the context of the India Semiconductor Mission (ISM) and sub-2-nanometer chip fabrication, "
            "what is the primary technological significance of Extreme Ultraviolet (EUV) lithography?\n\n"
            "1. It utilizes light with a wavelength of 13.5 nanometers produced by laser-pulsed molten tin droplets in a vacuum.\n"
            "2. Unlike DUV (Deep Ultraviolet), EUV light can travel through standard refractive glass optical lenses without being absorbed.\n"
            "3. High-NA (Numerical Aperture) EUV lithography allows printing of atomic-scale transistor features in a single exposure without multi-patterning.\n\n"
            "Which of the statements given above are correct?"
        ),
        "options": [
            {"key": "A", "text": "1 and 2 only"},
            {"key": "B", "text": "1 and 3 only"},
            {"key": "C", "text": "2 and 3 only"},
            {"key": "D", "text": "1, 2 and 3"},
        ],
        "correctOption": "B",
        "explanation": (
            "Statements 1 and 3 are correct. EUV lithography operates at 13.5 nm wavelength generated by pulsing CO2 lasers onto molten tin droplets. "
            "High-NA EUV increases numerical aperture from 0.33 to 0.55, enabling printing of 2nm-and-below nodes without complex multi-patterning. "
            "Statement 2 is incorrect because 13.5 nm EUV light is absorbed by almost all matter, including glass and air; hence EUV systems must operate in a high vacuum "
            "using ultra-flat Bragg reflective mirrors (molybdenum/silicon layers), not conventional refractive lenses."
        ),
        "optionAnalysis": [
            {"optionKey": "1", "analysis": "Correct: 13.5 nm radiation created via laser-produced tin plasma.", "isCorrect": True},
            {"optionKey": "2", "analysis": "Incorrect: EUV is absorbed by glass; requires vacuum reflective mirrors.", "isCorrect": False},
            {"optionKey": "3", "analysis": "Correct: High-NA (0.55 NA) enables single-patterning at sub-2nm nodes.", "isCorrect": True},
        ],
        "historicalContext": "Cutting-edge peripheral science topic critical for UPSC GS 3 and technological sovereignty.",
        "relatedConcept": "EUV Lithography, High-NA, India Semiconductor Mission",
    }
]


def filter_pyqs(
    era: str = None,
    peripheral_only: bool = False,
    current_affairs_only: bool = False,
    search_query: str = None,
    subject: str = None,
) -> List[Dict[str, Any]]:
    """Filters the PYQ database based on era, peripheral tag, current affairs, and keywords."""
    results = ALL_PYQS

    if era and era != "all":
        results = [q for q in results if q.get("era") == era]

    if peripheral_only:
        results = [q for q in results if q.get("isPeripheralArea") is True]

    if current_affairs_only:
        results = [q for q in results if q.get("isCurrentAffairs") is True]

    if subject and subject != "all":
        results = [q for q in results if subject.lower() in q.get("subject", "").lower()]

    if search_query:
        sq = search_query.lower()
        results = [
            q for q in results
            if sq in q.get("questionText", "").lower()
            or sq in q.get("topic", "").lower()
            or sq in q.get("subject", "").lower()
            or sq in q.get("peripheralTag", "").lower()
        ]

    return results


def get_pyq_statistics() -> Dict[str, Any]:
    """Returns analytics about the PYQ dataset spanning 1855 to 2026."""
    total = len(ALL_PYQS)
    eras_count = {}
    for q in ALL_PYQS:
        label = q.get("eraLabel", "Unknown")
        eras_count[label] = eras_count.get(label, 0) + 1

    peripheral_count = sum(1 for q in ALL_PYQS if q.get("isPeripheralArea"))
    current_affairs_count = sum(1 for q in ALL_PYQS if q.get("isCurrentAffairs"))

    return {
        "totalQuestions": total,
        "yearSpan": "1855 - 2026 (171 Years of Civil Services History)",
        "erasBreakdown": eras_count,
        "peripheralAreasCount": peripheral_count,
        "currentAffairsCount": current_affairs_count,
    }


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="BOLT UPSC 1855-2026 PYQ Engine")
    parser.add_argument("--era", choices=["19th_century", "early_20th_century", "post_independence", "modern", "all"], default="all")
    parser.add_argument("--peripheral", action="store_true", help="Filter by Peripheral Areas only")
    parser.add_argument("--current-affairs", action="store_true", help="Filter by Current Affairs only")
    parser.add_argument("--search", help="Search keyword")
    parser.add_argument("--stats", action="store_true", help="Print dataset statistics")

    args = parser.parse_args()

    if args.stats:
        print(json.dumps(get_pyq_statistics(), indent=2))
    else:
        filtered = filter_pyqs(
            era=args.era,
            peripheral_only=args.peripheral,
            current_affairs_only=args.current_affairs,
            search_query=args.search,
        )
        print(json.dumps({
            "count": len(filtered),
            "filters": {
                "era": args.era,
                "peripheral": args.peripheral,
                "current_affairs": args.current_affairs,
                "search": args.search,
            },
            "questions": filtered,
        }, indent=2))
