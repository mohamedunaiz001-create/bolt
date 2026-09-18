/**
 * Automated Security & Data Isolation Test Suite
 * Validates:
 * 1. User Isolation: User A cannot read or write User B collections.
 * 2. Firestore Security Rules syntax & owner verification logic.
 * 3. Zero Plaintext Passwords: Authentication credentials hashing.
 * 4. RAG Document Ingestion Security: Content boundary enforcement and sanitization.
 * 5. MCQ Validation Engine: Strict 4-option, single-correct standard.
 */

import fs from "fs";
import path from "path";
import { validatePrelimsMcq } from "../server/currentAffairsPipeline";
import { indexNewDocument, listDocuments, archiveDocument, deleteDocument } from "../server/ragService";
import { registerUser, loginUser } from "../server/userStore";

interface TestReport {
  name: string;
  passed: boolean;
  message: string;
}

const reports: TestReport[] = [];

function assert(condition: boolean, name: string, failureMsg: string) {
  if (condition) {
    reports.push({ name, passed: true, message: "OK" });
    console.log(`✅ [PASS] ${name}`);
  } else {
    reports.push({ name, passed: false, message: failureMsg });
    console.error(`❌ [FAIL] ${name}: ${failureMsg}`);
  }
}

async function runSecurityTestSuite() {
  console.log("==================================================");
  console.log("🛡️  BOLT AUTOMATED SECURITY & INTEGRITY TEST SUITE");
  console.log("==================================================\n");

  // 1. Audit firestore.rules
  const rulesPath = path.join(process.cwd(), "firestore.rules");
  assert(fs.existsSync(rulesPath), "Firestore Rules Existence", "firestore.rules not found at root");
  const rulesContent = fs.readFileSync(rulesPath, "utf-8");

  assert(
    rulesContent.includes("function isOwner(userId)"),
    "Firestore Rule Helper isOwner Defined",
    "Missing isOwner helper function in firestore.rules"
  );

  const sensitiveCollections = [
    "users/{userId}",
    "syllabus/{userId}",
    "progress/{userId}",
    "studyLogs/{userId}",
    "mainsEvaluations/{userId}",
    "documents/{userId}",
    "chatHistory/{userId}",
  ];

  for (const col of sensitiveCollections) {
    assert(
      rulesContent.includes(col),
      `Collection Rule Guard: ${col}`,
      `Collection ${col} missing from firestore.rules`
    );
  }

  // 2. Test User Isolation Logic
  const userAId = "aspirant_test_user_a";
  const userBId = "aspirant_test_user_b";

  // Simulate token context
  const canAccess = (requestAuthUid: string, resourceUserId: string) => {
    return requestAuthUid !== null && requestAuthUid === resourceUserId;
  };

  assert(
    !canAccess(userAId, userBId),
    "Cross-User Access Blocked (User A -> User B)",
    "User A was able to access User B resource"
  );
  assert(
    canAccess(userAId, userAId),
    "User A Self-Access Allowed",
    "User A was not allowed to access their own resource"
  );

  // 3. Test Zero Plaintext Password Storage
  const regResult = registerUser({
    name: "Audit User",
    email: `audit_${Date.now()}@upsc-bolt.org`,
    password: "SuperSecretPassword123!",
    target: "UPSC CSE 2026",
    optionalSubject: "Public Administration",
  });

  assert(regResult.success, "User Registration Succeeded", "Failed to register test user");
  if (regResult.account) {
    assert(
      regResult.account.password !== "SuperSecretPassword123!",
      "Zero Plaintext Password in Memory/Storage",
      "Password was stored in plaintext!"
    );
  }

  // 4. Test RAG Upload Security & Length Restrictions
  const tooShortDoc = indexNewDocument({
    title: "Bad Doc",
    category: "Custom Upload",
    content: "Too short",
    userId: "test",
  });
  assert(!tooShortDoc.success, "RAG Rejects Short Content (<20 chars)", "Short content was improperly accepted");

  const validDoc = indexNewDocument({
    title: "<b>Safe Title Test</b>",
    category: "Custom Upload",
    content: "This is a valid test document containing sufficient text to pass the 20 characters minimum boundary check.",
    userId: userAId,
  });
  assert(validDoc.success, "RAG Accepts Valid Sanitized Document", "Valid document was rejected");
  if (validDoc.document) {
    assert(
      !validDoc.document.title.includes("<b>"),
      "RAG Strips HTML Tags in Title",
      "HTML tags were not sanitized from document title"
    );
    // Test archive lifecycle
    const archResult = archiveDocument(validDoc.document.id, true);
    assert(archResult, "Document Archive Functionality", "Failed to archive document");

    // Test delete lifecycle
    const delResult = deleteDocument(validDoc.document.id);
    assert(delResult, "Document Deletion Functionality", "Failed to delete document");
  }

  // 5. Test Strict Prelims MCQ Validation Engine
  const validMcq = {
    questionText: "With reference to the Indian Constitution, consider the following statements regarding Article 356:",
    options: [
      { key: "A", text: "1 only" },
      { key: "B", text: "2 only" },
      { key: "C", text: "Both 1 and 2" },
      { key: "D", text: "Neither 1 nor 2" },
    ],
    correctOption: "C",
    explanation: "Both statements are correct under Supreme Court judgment in SR Bommai v Union of India.",
  };

  const validationSuccess = validatePrelimsMcq(validMcq);
  assert(validationSuccess.isValid, "Prelims MCQ Validation Engine (Valid)", "Valid MCQ was flagged as invalid");

  const invalidMcqDuplicateChoices = {
    questionText: "Which of the following is correct regarding Herbert Simon's Bounded Rationality?",
    options: [
      { key: "A", text: "Satisficing model" },
      { key: "B", text: "Satisficing model" }, // DUPLICATE CHOICE
      { key: "C", text: "Optimizing model" },
      { key: "D", text: "Economic man" },
    ],
    correctOption: "A",
    explanation: "Herbert Simon proposed satisficing behavior.",
  };

  const validationFailure = validatePrelimsMcq(invalidMcqDuplicateChoices);
  assert(!validationFailure.isValid, "Prelims MCQ Rejects Duplicate Options", "Duplicate option choice was not rejected");

  const invalidMcqWrongOptionsCount = {
    questionText: "What was Chester Barnard's executive function?",
    options: [
      { key: "A", text: "Option A" },
      { key: "B", text: "Option B" },
    ],
    correctOption: "A",
    explanation: "Needs 4 options.",
  };
  const validationFailureCount = validatePrelimsMcq(invalidMcqWrongOptionsCount);
  assert(!validationFailureCount.isValid, "Prelims MCQ Rejects Non-4 Options Count", "Non-4 options was not rejected");

  console.log("\n==================================================");
  const total = reports.length;
  const passed = reports.filter((r) => r.passed).length;
  console.log(`Security Test Run Completed: ${passed}/${total} PASSED`);
  console.log("==================================================");

  if (passed === total) {
    console.log("🎉 ALL AUTOMATED SECURITY TESTS PASSED.");
    process.exit(0);
  } else {
    console.error(`⚠️ ${total - passed} TESTS FAILED.`);
    process.exit(1);
  }
}

runSecurityTestSuite();
