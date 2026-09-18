/**
 * BOLT Unified Server Configuration Layer
 */

import dotenv from "dotenv";

dotenv.config();

export const SERVER_CONFIG = {
  port: parseInt(process.env.PORT || "3000", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  geminiApiKey: process.env.GEMINI_API_KEY || "",
  localAiEndpoint: process.env.LOCAL_AI_ENDPOINT || "http://127.0.0.1:11434",
  localAiModel: process.env.LOCAL_AI_MODEL || "meta-llama/Meta-Llama-3-8B-Instruct",
  vectorDbPath: process.env.VECTOR_DB_PATH || "./data/vectors",
  caIngestionIntervalMs: 6 * 60 * 60 * 1000, // 6 hours
  maxArticlesPerFeed: 15,
};

export const TRAINING_CONFIG = {
  defaultBaseModel: "meta-llama/Meta-Llama-3-8B-Instruct",
  supportedBaseModels: [
    "meta-llama/Meta-Llama-3-8B-Instruct",
    "meta-llama/Meta-Llama-3-70B-Instruct",
    "mistralai/Mistral-7B-Instruct-v0.3",
    "Qwen/Qwen2.5-7B-Instruct",
  ],
  defaultHyperparameters: {
    loraRank: 16,
    loraAlpha: 32,
    learningRate: 0.0002,
    epochs: 3,
    batchSize: 4,
    quantization: "4bit_nf4",
  },
  checkpointIntervalSteps: 100,
  minBenchmarkScoreToActivate: 80, // Minimum % required to activate
};
