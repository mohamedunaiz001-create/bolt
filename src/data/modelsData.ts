import { LaptopSpecs, ModelOption, ModelRecommendation, ActiveModelConfig, TrainingConfig } from "../types";

export const AVAILABLE_MODELS: ModelOption[] = [
  // Cloud Models
  {
    id: "gemini-3.8-flash",
    name: "Gemini 3.8 Flash (Cloud)",
    type: "cloud",
    provider: "Google DeepMind",
    parameterSize: "Cloud Hosted",
    minRamGb: 2,
    minVramGb: 0,
    recommendedQuant: "Native Cloud FP16",
    description: "Google's ultra-fast flagship multimodal model with 1M token context window. Ideal for full syllabus search, instant Mains evaluations, and zero-setup mentor chat.",
    strengths: ["Instant speed (<400ms)", "1 Million token context", "Zero local hardware load", "Always updated"],
    ollamaCommand: "N/A (Managed Cloud API)",
    contextWindow: "1,048,576 tokens",
  },
  {
    id: "gemini-3.1-pro-preview",
    name: "Gemini 3.1 Pro (Cloud)",
    type: "cloud",
    provider: "Google DeepMind",
    parameterSize: "Cloud Deep Reasoning",
    minRamGb: 2,
    minVramGb: 0,
    recommendedQuant: "Native Cloud FP16",
    description: "Deep reasoning model specialized for intricate UPSC Mains answer cross-examination, multidimensional analysis, and 2nd ARC committee synthesis.",
    strengths: ["Deep multidimensional analysis", "High-precision rubric scoring", "Complex comparative thinker synthesis"],
    ollamaCommand: "N/A (Managed Cloud API)",
    contextWindow: "2,097,152 tokens",
  },
  {
    id: "gemini-3.1-flash-lite",
    name: "Gemini 3.1 Flash Lite (Cloud)",
    type: "cloud",
    provider: "Google DeepMind",
    parameterSize: "Cloud Low Latency",
    minRamGb: 2,
    minVramGb: 0,
    recommendedQuant: "Native Cloud FP16",
    description: "Ultra lightweight cloud engine designed for rapid Prelims MCQ fact-checking and quick doubt resolution with near-zero latency.",
    strengths: ["Ultra-low latency", "Quick Prelims facts", "Cost & compute efficient"],
    ollamaCommand: "N/A (Managed Cloud API)",
    contextWindow: "1,048,576 tokens",
  },

  // Local Models (Ollama / Local Inference)
  {
    id: "llama3.1:8b-instruct-q4_K_M",
    name: "Meta Llama 3.1 8B Instruct (Local)",
    type: "local",
    provider: "Meta AI",
    parameterSize: "8.0 Billion",
    minRamGb: 12,
    minVramGb: 6,
    recommendedQuant: "Q4_K_M (4.7 GB)",
    description: "The gold standard open-weight model for local UPSC preparation. Superb comprehension of Indian polity, administrative theories, and structured essay writing.",
    strengths: ["100% Offline & Private", "Exceptional structured writing", "Strong 8k context retention", "Native Ollama support"],
    ollamaCommand: "ollama run llama3.1:8b",
    contextWindow: "8,192 tokens (Local)",
    huggingFaceModelId: "meta-llama/Meta-Llama-3.1-8B-Instruct",
    ollamaModelTag: "llama3.1:8b-instruct-q4_K_M",
  },
  {
    id: "llama3.2:3b",
    name: "Meta Llama 3.2 3B Instruct (Local)",
    type: "local",
    provider: "Meta AI",
    parameterSize: "3.2 Billion",
    minRamGb: 6,
    minVramGb: 2,
    recommendedQuant: "Q4_K_M (2.0 GB)",
    description: "Ultra-compact local powerhouse designed specifically for standard laptops and ultrabooks. Runs blisteringly fast on 8GB RAM with tiny memory footprint.",
    strengths: ["Runs on standard 8GB laptops", "Blazing fast inference", "Low battery drain", "Great for quick Q&A"],
    ollamaCommand: "ollama run llama3.2:3b",
    contextWindow: "8,192 tokens (Local)",
    huggingFaceModelId: "meta-llama/Llama-3.2-3B-Instruct",
    ollamaModelTag: "llama3.2:3b",
  },
  {
    id: "mistral:7b-instruct-v0.3-q4_K_M",
    name: "Mistral 7B Instruct v0.3 (Local)",
    type: "local",
    provider: "Mistral AI",
    parameterSize: "7.2 Billion",
    minRamGb: 10,
    minVramGb: 5,
    recommendedQuant: "Q4_K_M (4.3 GB)",
    description: "Renowned for dense logic, precise argumentation, and crisp synthesis. Highly rated for UPSC GS Paper 2 governance topics and ethical dilemmas.",
    strengths: ["Sharp logical reasoning", "Crisp concise summaries", "Sliding window attention"],
    ollamaCommand: "ollama run mistral:7b",
    contextWindow: "32,768 tokens (Local)",
    huggingFaceModelId: "mistralai/Mistral-7B-Instruct-v0.3",
    ollamaModelTag: "mistral:7b-instruct-v0.3-q4_K_M",
  },
  {
    id: "qwen2.5:7b-instruct",
    name: "Qwen 2.5 7B Instruct (Local)",
    type: "local",
    provider: "Alibaba Cloud",
    parameterSize: "7.6 Billion",
    minRamGb: 12,
    minVramGb: 6,
    recommendedQuant: "Q4_K_M (4.7 GB)",
    description: "Top-ranked open model on academic benchmarks. Excellent knowledge of constitutional frameworks, statutory provisions, and structured bullet lists.",
    strengths: ["High academic benchmark scores", "Strong factual accuracy", "Superior formatting & lists"],
    ollamaCommand: "ollama run qwen2.5:7b",
    contextWindow: "32,768 tokens (Local)",
    huggingFaceModelId: "Qwen/Qwen2.5-7B-Instruct",
    ollamaModelTag: "qwen2.5:7b-instruct",
  },
  {
    id: "gemma2:2b",
    name: "Google Gemma 2 2B (Local)",
    type: "local",
    provider: "Google",
    parameterSize: "2.6 Billion",
    minRamGb: 4,
    minVramGb: 2,
    recommendedQuant: "Q4_K_M (1.6 GB)",
    description: "Google's ultra-lightweight open architecture. Fits comfortably even on low-spec budget laptops with 4GB to 8GB RAM without slowing down the operating system.",
    strengths: ["Featherweight (1.6 GB)", "Fits budget laptops", "Zero thermal throttling"],
    ollamaCommand: "ollama run gemma2:2b",
    contextWindow: "8,192 tokens (Local)",
    huggingFaceModelId: "google/gemma-2-2b-it",
    ollamaModelTag: "gemma2:2b",
  },
  {
    id: "gemma2:9b-q4_K_M",
    name: "Google Gemma 2 9B (Local)",
    type: "local",
    provider: "Google",
    parameterSize: "9.2 Billion",
    minRamGb: 16,
    minVramGb: 8,
    recommendedQuant: "Q4_K_M (5.8 GB)",
    description: "A class-leading open model that rivals many 20B+ models in comprehension. Ideal for Mac M2/M3 with 16GB+ RAM or desktop NVIDIA GPUs.",
    strengths: ["Rivals larger models", "High nuance in Public Admin", "Great thinker comparisons"],
    ollamaCommand: "ollama run gemma2:9b",
    contextWindow: "8,192 tokens (Local)",
    huggingFaceModelId: "google/gemma-2-9b-it",
    ollamaModelTag: "gemma2:9b-q4_K_M",
  },
  {
    id: "phi3.5:3.8b-mini-instruct",
    name: "Microsoft Phi 3.5 Mini 3.8B (Local)",
    type: "local",
    provider: "Microsoft",
    parameterSize: "3.8 Billion",
    minRamGb: 6,
    minVramGb: 3,
    recommendedQuant: "Q4_K_M (2.3 GB)",
    description: "Trained heavily on synthetic textbooks and high-reasoning curricula. Delivers outsized analytical capability relative to its modest footprint.",
    strengths: ["High reasoning density", "Textbook synthetic grounding", "Fast response latency"],
    ollamaCommand: "ollama run phi3.5:3.8b",
    contextWindow: "128,000 tokens (Local)",
    huggingFaceModelId: "microsoft/Phi-3.5-mini-instruct",
    ollamaModelTag: "phi3.5:3.8b",
  },
];

export const DEFAULT_LAPTOP_SPECS: LaptopSpecs = {
  deviceType: "mac_apple_silicon",
  totalRamGb: 16,
  vramGb: 0, // Unified memory on Mac
  cpuCores: 8,
  storageFreeGb: 45,
};

export const DEFAULT_ACTIVE_MODEL_CONFIG: ActiveModelConfig = {
  selectedModelId: "gemini-3.8-flash",
  modelType: "cloud",
  localEndpoint: "http://localhost:11434",
  temperature: 0.7,
  contextWindowTokens: 32768,
  activeAdapter: "bolt-upsc-pubadmin-adapter-v1",
  huggingFaceModelId: "meta-llama/Meta-Llama-3.1-8B-Instruct",
  ollamaModelTag: "llama3.1:8b-instruct-q4_K_M",
  evaluatorPersona: "strict_upsc",
  reasoningDeliberation: "balanced",
  maxOutputTokens: 4096,
  strict2ndArcCitation: true,
  crossPaperSynthesis: true,
};

export const DEFAULT_TRAINING_CONFIG: TrainingConfig = {
  baseModelId: "llama3.1:8b-instruct-q4_K_M",
  huggingFaceModelId: "meta-llama/Meta-Llama-3.1-8B-Instruct",
  ollamaModelTag: "llama3.1:8b-instruct-q4_K_M",
  datasetName: "UPSC Public Administration Mains & 2nd ARC (1,450 QA pairs)",
  epochs: 3,
  learningRate: "2e-4",
  loraRank: 16,
  loraAlpha: 32,
  batchSize: 2,
  quantization: "4bit",
  targetModules: "q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj, down_proj",
};

/**
 * Intelligent hardware recommendation engine:
 * Evaluates the candidate's laptop / workstation specs (RAM, GPU, VRAM, Architecture)
 * and outputs the mathematically optimal local or cloud model.
 */
export function calculateHardwareRecommendation(specs: LaptopSpecs): ModelRecommendation {
  const { deviceType, totalRamGb, vramGb, cpuCores } = specs;

  // 1. MAC APPLE SILICON (Unified Memory architecture)
  if (deviceType === "mac_apple_silicon") {
    // macOS leaves ~70-75% of unified RAM available for GPU/LLM inference
    const usableUnifiedRam = totalRamGb * 0.72;

    if (totalRamGb >= 24) {
      return {
        recommendedModelId: "gemma2:9b-q4_K_M",
        fitLevel: "perfect",
        headline: "Optimal Fit: Google Gemma 2 9B (Local)",
        reason: `Your Mac has ${totalRamGb} GB Unified Memory. You have ~${usableUnifiedRam.toFixed(1)} GB available buffer, which easily accommodates Gemma 2 9B with full Metal acceleration and zero swapping.`,
        expectedTokensPerSec: 36,
        memoryBudget: {
          modelWeightsGb: 5.8,
          kvCacheGb: 1.2,
          osOverheadGb: 4.5,
          totalRequiredGb: 11.5,
        },
        alternativeModelId: "llama3.1:8b-instruct-q4_K_M",
      };
    } else if (totalRamGb >= 16) {
      return {
        recommendedModelId: "llama3.1:8b-instruct-q4_K_M",
        fitLevel: "perfect",
        headline: "Recommended for your 16GB Mac: Meta Llama 3.1 8B Q4",
        reason: `With 16GB Unified RAM, Llama 3.1 8B (4-bit Q4_K_M) takes ~4.7 GB, allowing buttery-smooth Metal acceleration, full 8k context for UPSC Mains, and ~32 tok/sec throughput while leaving ample RAM for your browser.`,
        expectedTokensPerSec: 32,
        memoryBudget: {
          modelWeightsGb: 4.7,
          kvCacheGb: 0.9,
          osOverheadGb: 4.0,
          totalRequiredGb: 9.6,
        },
        alternativeModelId: "mistral:7b-instruct-v0.3-q4_K_M",
      };
    } else {
      // 8GB Mac
      return {
        recommendedModelId: "llama3.2:3b",
        fitLevel: "good",
        headline: "Recommended for 8GB Mac: Meta Llama 3.2 3B",
        reason: `On an 8GB Mac, 8B models can cause memory pressure. Llama 3.2 3B takes just ~2.0 GB VRAM, ensuring swift ~40+ tok/sec performance with zero memory compression overhead.`,
        expectedTokensPerSec: 42,
        memoryBudget: {
          modelWeightsGb: 2.0,
          kvCacheGb: 0.5,
          osOverheadGb: 3.5,
          totalRequiredGb: 6.0,
        },
        alternativeModelId: "gemma2:2b",
      };
    }
  }

  // 2. WINDOWS / LINUX WITH NVIDIA DEDICATED GPU (CUDA)
  if (deviceType === "windows_nvidia_gpu") {
    if (vramGb >= 12) {
      return {
        recommendedModelId: "llama3.1:8b-instruct-q4_K_M",
        fitLevel: "perfect",
        headline: "Optimal Fit: Meta Llama 3.1 8B (100% CUDA VRAM Offload)",
        reason: `Your NVIDIA GPU has ${vramGb} GB VRAM. The entire 8B quantized model (4.7 GB) and full KV cache fit 100% into high-speed VRAM, yielding maximum tokens-per-second speed.`,
        expectedTokensPerSec: 65,
        memoryBudget: {
          modelWeightsGb: 4.7,
          kvCacheGb: 1.0,
          osOverheadGb: 1.2,
          totalRequiredGb: 6.9,
        },
        alternativeModelId: "qwen2.5:7b-instruct",
      };
    } else if (vramGb >= 8) {
      return {
        recommendedModelId: "llama3.1:8b-instruct-q4_K_M",
        fitLevel: "good",
        headline: "Optimal Fit: Meta Llama 3.1 8B (Full 8GB GPU Offload)",
        reason: `Your 8GB NVIDIA VRAM fits the 4.7 GB Llama 3.1 8B model comfortably, running at ~48 tokens/second with native Tensor Core acceleration.`,
        expectedTokensPerSec: 48,
        memoryBudget: {
          modelWeightsGb: 4.7,
          kvCacheGb: 0.8,
          osOverheadGb: 1.0,
          totalRequiredGb: 6.5,
        },
        alternativeModelId: "mistral:7b-instruct-v0.3-q4_K_M",
      };
    } else if (vramGb >= 4) {
      return {
        recommendedModelId: "llama3.2:3b",
        fitLevel: "perfect",
        headline: "Recommended for 4-6GB GPU: Meta Llama 3.2 3B",
        reason: `Fits entirely into your ${vramGb} GB VRAM (2.0 GB weights), giving you lightning-fast inference without touching slower system RAM.`,
        expectedTokensPerSec: 55,
        memoryBudget: {
          modelWeightsGb: 2.0,
          kvCacheGb: 0.6,
          osOverheadGb: 0.8,
          totalRequiredGb: 3.4,
        },
        alternativeModelId: "phi3.5:3.8b-mini-instruct",
      };
    }
  }

  // 3. CPU ONLY (Intel / AMD CPU with Integrated Graphics)
  if (totalRamGb >= 16) {
    return {
      recommendedModelId: "llama3.1:8b-instruct-q4_K_M",
      fitLevel: "good",
      headline: "Recommended: Meta Llama 3.1 8B (CPU Threaded Mode)",
      reason: `With ${totalRamGb} GB system RAM and ${cpuCores} CPU cores, Ollama will utilize multi-threaded AVX2/AVX-512 instructions. Runs at ~15-20 tok/sec with full academic depth.`,
      expectedTokensPerSec: 18,
      memoryBudget: {
        modelWeightsGb: 4.7,
        kvCacheGb: 0.8,
        osOverheadGb: 5.0,
        totalRequiredGb: 10.5,
      },
      alternativeModelId: "llama3.2:3b",
    };
  } else if (totalRamGb >= 8) {
    return {
      recommendedModelId: "llama3.2:3b",
      fitLevel: "perfect",
      headline: "Recommended for 8GB RAM: Meta Llama 3.2 3B or Gemma 2 2B",
      reason: `On an 8GB laptop without a dedicated GPU, Llama 3.2 3B uses only 2.0 GB RAM, keeping your system fast and responsive while providing immediate UPSC assistance.`,
      expectedTokensPerSec: 22,
      memoryBudget: {
        modelWeightsGb: 2.0,
        kvCacheGb: 0.4,
        osOverheadGb: 3.8,
        totalRequiredGb: 6.2,
      },
      alternativeModelId: "gemma2:2b",
    };
  }

  // 4. Low RAM / Chromebook / Tablet fallback
  return {
    recommendedModelId: "gemini-3.8-flash",
    fitLevel: "tight",
    headline: "Recommended: Gemini 3.8 Flash (Cloud)",
    reason: `Your device has ${totalRamGb} GB RAM. Running heavy local models might cause system lag. We recommend Gemini 3.8 Flash which runs in the cloud with zero RAM consumption.`,
    expectedTokensPerSec: 85,
    memoryBudget: {
      modelWeightsGb: 0,
      kvCacheGb: 0,
      osOverheadGb: 1.5,
      totalRequiredGb: 1.5,
    },
    alternativeModelId: "gemma2:2b",
  };
}

export const UPSC_TRAINING_DATASETS = [
  {
    id: "pubadmin_mains_arc",
    name: "UPSC Public Administration Mains & 2nd ARC",
    pairsCount: 1450,
    sizeMb: 14.8,
    description: "PYQs 2013-2024, 2nd ARC 15 reports recommendations, thinkers comparison matrix (Simon, Weber, Barnard, Waldo), and 15-marker model answers.",
    tags: ["Paper 1", "Paper 2", "2nd ARC", "Thinkers"],
  },
  {
    id: "gs_comprehensive_qa",
    name: "GS Paper 1 to 4 Comprehensive Mains Rubric",
    pairsCount: 2850,
    sizeMb: 26.2,
    description: "High-scoring model answers for Polity (Art 311, Federalism, PRIs), Economy, Ethics case studies, and modern administrative reforms.",
    tags: ["GS 1", "GS 2", "GS 3", "GS 4", "Ethics"],
  },
  {
    id: "personalized_evaluations",
    name: "Personalized Evaluated Answers & Diagnostic Flags",
    pairsCount: 38,
    sizeMb: 1.2,
    description: "Your own written answers with Bolt's rubric annotations, identified weaknesses, and missed dimensions to tailor the model directly to your style.",
    tags: ["Personalized", "Self-Reflection", "Weak-Area Boost"],
  },
];
