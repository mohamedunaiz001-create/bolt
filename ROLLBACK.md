# BOLT UPSC CSE AI Platform — Production Rollback Procedure

This document outlines the standard operating procedures for rolling back deployments, recovering from bad releases, restoring database state, and handling catastrophic service failures.

---

## 1. Fast Rollback via Cloud Run Revisions (< 2 Minutes)

If a new deployment introduces fatal errors or latency spikes:

1. **Navigate to Cloud Run Console** or use the Google Cloud CLI:
   ```bash
   # List recent revisions
   gcloud run revisions list --service=bolt-upsc --region=asia-east1

   # Route 100% of traffic immediately to the previous healthy revision
   gcloud run services update-traffic bolt-upsc \
     --region=asia-east1 \
     --to-revisions=PREVIOUS_HEALTHY_REVISION=100
   ```

2. **Verify immediate rollback health**:
   ```bash
   curl -f https://ais-pre-oosvoco6m64jkrtsqcrdrf-855309920894.asia-east1.run.app/api/health
   ```
   Check that `status` returns `"ok"` and `errorRatePercent` drops below 1%.

---

## 2. Database & Storage Rollback (Disaster Recovery Engine)

The BOLT platform maintains point-in-time snapshots in `/data/backups/` tracked in `manifest.json`.

### Listing Available Snapshots
```bash
# Query the Admin backup API
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  https://ais-pre-oosvoco6m64jkrtsqcrdrf-855309920894.asia-east1.run.app/api/admin/backups
```

### Triggering a Verified Restoration
To test and apply restoration in a verified sandbox:
```bash
curl -X POST -H "Authorization: Bearer $ADMIN_TOKEN" \
  https://ais-pre-oosvoco6m64jkrtsqcrdrf-855309920894.asia-east1.run.app/api/admin/restore-test
```
This executes `runDisasterRecoveryVerification()`, verifying 100% checksum parity across:
- `knowledge_store.json` (Canonical RAG chunks & ARC reports)
- `user_store.json` (User profiles, study logs, streaks)
- `current_affairs_store.json` (Verified UPSC news & daily MCQs)
- `knowledge_graph_store.json` (Thinker taxonomy & syllabus nodes)

---

## 3. Background Job Queue & Worker Drain

If worker jobs crash or become stalled following a bad release:

1. **Watchdog Auto-Drain**: The worker supervisor automatically drains stale jobs after 30 seconds of inactivity and recovers unfinished jobs on startup.
2. **Manual Job Drain**:
   ```bash
   # Clear stalled distributed lock for current affairs synchronization:
   curl -X POST -H "X-Scheduler-Secret: $SCHEDULER_TRIGGER_SECRET" \
     https://ais-pre-oosvoco6m64jkrtsqcrdrf-855309920894.asia-east1.run.app/api/internal/scheduler/current-affairs-sync
   ```

---

## 4. Environment Variables & Secret Reversion

If a regression is caused by an invalid external provider key:

1. **Check Environment Declaration**: Ensure all keys match `.env.example`.
2. **AI Provider Fallback**: If an upstream model is unreachable, the system automatically degrades to `Bolt Academic Rules` without crashing the application.

---

## 5. Post-Rollback Smoke Verification Checklist

After rolling back:
- [ ] Run automated health check: `GET /api/health` -> `status: "ok"`
- [ ] Verify test suite: `npm run test:security` (37/37 passing)
- [ ] Verify acceptance flows: `npm run test:acceptance` (16/16 passing)
- [ ] Verify student isolation: `scripts/verify-security-isolation.ts`
- [ ] Verify admin privileges: `mohamedunaiz001@gmail.com` can access admin endpoints
