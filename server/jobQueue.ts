/**
 * BOLT Durable Background Job Queue
 * 
 * Provides:
 * - Asynchronous, durable job runner for compute-intensive tasks:
 *   - Document indexing & RAG embeddings
 *   - Current affairs RSS scraping & synthesis
 *   - Daily Prelims MCQ generation & validation
 *   - Model fine-tuning & adapter training
 *   - AI benchmarking & evaluation
 * - Persistent disk state in data/job_queue_store.json
 * - Status polling, error recovery, automatic retries, and telemetry
 */

import fs from "fs";
import path from "path";

export type JobType =
  | "document_indexing"
  | "embeddings_generation"
  | "current_affairs_sync"
  | "mcq_generation"
  | "model_training"
  | "benchmark_run"
  | "disaster_recovery_test";

export type JobStatus = "queued" | "running" | "completed" | "failed" | "cancelled";

export interface BackgroundJob {
  id: string;
  type: JobType;
  status: JobStatus;
  progressPct: number; // 0 to 100
  title: string;
  params: Record<string, any>;
  result?: Record<string, any>;
  error?: string;
  createdAt: string;
  startedAt?: string;
  finishedAt?: string;
  durationMs?: number;
  retryCount: number;
  maxRetries: number;
}

const JOBS_STORE_PATH = path.join(process.cwd(), "data", "job_queue_store.json");

function ensureJobsDir() {
  const dir = path.dirname(JOBS_STORE_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function loadJobs(): BackgroundJob[] {
  try {
    ensureJobsDir();
    if (fs.existsSync(JOBS_STORE_PATH)) {
      const data = fs.readFileSync(JOBS_STORE_PATH, "utf-8");
      return JSON.parse(data);
    }
  } catch (e) {
    console.warn("[JobQueue] Failed to read jobs from disk, resetting queue:", e);
  }
  return [];
}

function saveJobs(jobs: BackgroundJob[]) {
  try {
    ensureJobsDir();
    fs.writeFileSync(JOBS_STORE_PATH, JSON.stringify(jobs.slice(0, 100), null, 2), "utf-8");
  } catch (e) {
    console.warn("[JobQueue] Failed to write jobs to disk:", e);
  }
}

class BoltJobQueueManager {
  private jobs: BackgroundJob[] = [];
  private isProcessing: boolean = false;
  private workerHandlers: Map<JobType, (job: BackgroundJob) => Promise<any>> = new Map();

  constructor() {
    this.jobs = loadJobs();
    // Clean up stale "running" jobs from previous server reboot
    let modified = false;
    for (const j of this.jobs) {
      if (j.status === "running") {
        j.status = "queued";
        j.retryCount = (j.retryCount || 0) + 1;
        modified = true;
      }
    }
    if (modified) saveJobs(this.jobs);
  }

  registerWorker(type: JobType, handler: (job: BackgroundJob) => Promise<any>) {
    this.workerHandlers.set(type, handler);
  }

  enqueue(type: JobType, title: string, params: Record<string, any> = {}, maxRetries: number = 2): BackgroundJob {
    const job: BackgroundJob = {
      id: `job-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      type,
      status: "queued",
      progressPct: 0,
      title,
      params,
      createdAt: new Date().toISOString(),
      retryCount: 0,
      maxRetries,
    };

    this.jobs.unshift(job);
    saveJobs(this.jobs);
    this.scheduleNext();
    return job;
  }

  getJob(id: string): BackgroundJob | null {
    return this.jobs.find((j) => j.id === id) || null;
  }

  listJobs(filter?: { type?: JobType; status?: JobStatus; limit?: number }): BackgroundJob[] {
    let result = [...this.jobs];
    if (filter?.type) {
      result = result.filter((j) => j.type === filter.type);
    }
    if (filter?.status) {
      result = result.filter((j) => j.status === filter.status);
    }
    const limit = filter?.limit || 30;
    return result.slice(0, limit);
  }

  updateProgress(jobId: string, progressPct: number, partialResult?: Record<string, any>) {
    const job = this.jobs.find((j) => j.id === jobId);
    if (job) {
      job.progressPct = Math.min(100, Math.max(0, Math.round(progressPct)));
      if (partialResult) {
        job.result = { ...job.result, ...partialResult };
      }
      saveJobs(this.jobs);
    }
  }

  async retryJob(jobId: string): Promise<BackgroundJob | null> {
    const job = this.jobs.find((j) => j.id === jobId);
    if (!job || job.status === "running") return null;

    job.status = "queued";
    job.progressPct = 0;
    job.error = undefined;
    job.retryCount += 1;
    saveJobs(this.jobs);
    this.scheduleNext();
    return job;
  }

  private scheduleNext() {
    if (this.isProcessing) return;
    setTimeout(() => this.processQueue(), 50);
  }

  private async processQueue() {
    if (this.isProcessing) return;
    const nextJob = this.jobs.find((j) => j.status === "queued");
    if (!nextJob) return;

    this.isProcessing = true;
    nextJob.status = "running";
    nextJob.startedAt = new Date().toISOString();
    saveJobs(this.jobs);

    const startTime = Date.now();
    try {
      const handler = this.workerHandlers.get(nextJob.type);
      if (!handler) {
        throw new Error(`No worker registered for job type: ${nextJob.type}`);
      }

      const result = await handler(nextJob);
      nextJob.status = "completed";
      nextJob.progressPct = 100;
      nextJob.result = result || {};
      nextJob.finishedAt = new Date().toISOString();
      nextJob.durationMs = Date.now() - startTime;
    } catch (err: any) {
      console.error(`[JobQueue] Job ${nextJob.id} (${nextJob.type}) failed:`, err);
      if (nextJob.retryCount < nextJob.maxRetries) {
        nextJob.status = "queued";
        nextJob.retryCount += 1;
        nextJob.error = `Retrying (${nextJob.retryCount}/${nextJob.maxRetries}): ${err.message || String(err)}`;
      } else {
        nextJob.status = "failed";
        nextJob.error = err.message || String(err);
        nextJob.finishedAt = new Date().toISOString();
        nextJob.durationMs = Date.now() - startTime;
      }
    } finally {
      saveJobs(this.jobs);
      this.isProcessing = false;
      // Continue next job if available
      this.scheduleNext();
    }
  }
}

export const jobQueue = new BoltJobQueueManager();
