/**
 * BOLT AI & UPSC Domain Benchmarking Runner
 * Executes the expanded 64-question multi-domain benchmark and outputs
 * structured telemetry, pass rates, latency metrics, and hallucination resistance.
 */

import { executeBoltBenchmarkSuite } from "../server/boltBenchmarkSuite";

async function run() {
  console.log("===================================================================");
  console.log("⚡ BOLT PRODUCTION AI BENCHMARK & UPSC EVALUATION SUITE (64 TESTS)");
  console.log("===================================================================\n");

  const summary = await executeBoltBenchmarkSuite();

  console.log(`Overall Pass Rate:             ${summary.passedTests} / ${summary.totalTests} (${Math.round((summary.passedTests / summary.totalTests) * 100)}%)`);
  console.log(`Overall Composite Score:       ${summary.overallScorePct}%`);
  console.log(`Hallucination Resistance Rate: ${summary.hallucinationResistanceRatePct}% (${summary.adversarialTrapsScore.resisted}/${summary.adversarialTrapsScore.tested} adversarial traps rejected)`);
  console.log(`Average Query Latency:         ${summary.averageLatencyMs}ms`);
  console.log(`Release Status:                ${summary.status}\n`);

  console.log("--- CATEGORY BREAKDOWN ---");
  for (const [cat, stats] of Object.entries(summary.categoryBreakdown)) {
    const bar = "█".repeat(Math.round(stats.score / 10)) + "░".repeat(10 - Math.round(stats.score / 10));
    console.log(` ${cat.padEnd(25)} [${bar}] ${stats.score}% (${stats.passed}/${stats.total} passed)`);
  }

  console.log("\n--- ADVERSARIAL TRAP AUDIT (HALLUCINATION PREVENTION) ---");
  const traps = summary.results.filter((r) => r.category === "Hallucination Resistance");
  for (const t of traps) {
    console.log(` • [${t.passed ? "✓ BLOCKED" : "✗ LEAKED"}] "${t.prompt.slice(0, 55)}..." -> ${t.actual.slice(0, 65)}`);
  }

  console.log("\n===================================================================");
  console.log("⚡ BENCHMARK COMPLETE");
  console.log("===================================================================");
  process.exit(summary.status === "PRODUCTION_READY" ? 0 : 1);
}

run().catch((e) => {
  console.error("Benchmark runner failed:", e);
  process.exit(1);
});
