import { LaptopSpecs, ModelOption, ModelRecommendation, ActiveModelConfig, TrainingConfig, AIProviderType } from "../types";

export interface ProviderMeta {
  id: AIProviderType;
  name: string;
  badge: string;
  description: string;
  defaultModel: string;
  apiKeyRequired: boolean;
  apiKeyPlaceholder: string;
  defaultBaseUrl?: string;
  docsUrl?: string;
  models: { id: string; name: string; description: string; context: string; badge?: string }[];
}

export const PROVIDER_METAS: ProviderMeta[] = [
  {
    id: "gemini",
    name: "Google Gemini",
    badge: "Native / Recommended",
    description: "Ultra-low latency, multimodal comprehension with up to 2M token context. Default cloud engine with automatic multi-model failover.",
    defaultModel: "gemini-3.1-flash-lite",
    apiKeyRequired: false,
    apiKeyPlaceholder: "AIzaSy... (Optional override; uses server key if left empty)",
    models: [
      {
        id: "gemini-3.1-flash-lite",
        name: "Gemini 3.1 Flash Lite",
        description: "Ultra-fast, high-availability model with instant response times and resilient performance for Bolt chat and rapid guidance.",
        context: "1,048,576 tokens",
        badge: "Fastest & Stable",
      },
      {
        id: "gemini-3.8-flash",
        name: "Gemini 3.8 Flash",
        description: "High-capability model for in-depth UPSC syllabus synthesis and full answer evaluations.",
        context: "1,048,576 tokens",
        badge: "Advanced",
      },
      {
        id: "gemini-3.6-flash",
        name: "Gemini 3.6 Flash",
        description: "High-stability workhorse model with resilient failover. Ideal for rapid Prelims MCQs and uninterrupted Bolt AI chat.",
        context: "1,048,576 tokens",
        badge: "Stable",
      },
      {
        id: "gemini-3.1-pro-preview",
        name: "Gemini 3.1 Pro",
        description: "Deep deliberation model specialized for intricate UPSC Mains answer cross-examination and 2nd ARC committee synthesis.",
        context: "2,097,152 tokens",
        badge: "Deep Reasoning",
      },
      {
        id: "gemini-3.1-flash-lite",
        name: "Gemini 3.1 Flash Lite",
        description: "Featherweight cloud engine for rapid Prelims factual checks with near-zero latency.",
        context: "1,048,576 tokens",
        badge: "Lightweight",
      },
    ],
  },
  {
    id: "openai",
    name: "OpenAI",
    badge: "BYO API Key",
    description: "Industry-standard intelligence models with state-of-the-art reasoning and UPSC question analysis.",
    defaultModel: "gpt-4o",
    apiKeyRequired: true,
    apiKeyPlaceholder: "sk-proj-... or sk-...",
    defaultBaseUrl: "https://api.openai.com/v1",
    models: [
      {
        id: "gpt-4o",
        name: "GPT-4o Flagship",
        description: "High-intelligence flagship model with deep cross-disciplinary reasoning for GS Paper 1-4 and Public Admin.",
        context: "128,000 tokens",
        badge: "Flagship",
      },
      {
        id: "gpt-4o-mini",
        name: "GPT-4o Mini",
        description: "Fast, cost-efficient model for rapid syllabus inquiries, flashcards, and Prelims practice.",
        context: "128,000 tokens",
        badge: "Fast",
      },
      {
        id: "o3-mini",
        name: "o3-mini (Reasoning)",
        description: "Specialized deliberate reasoning model for complex policy evaluation and thinker debates.",
        context: "200,000 tokens",
        badge: "Reasoning",
      },
      {
        id: "o1",
        name: "o1 Full Deliberation",
        description: "Deep multi-step reasoning model that systematically analyzes policy trade-offs and constitutional ethics.",
        context: "200,000 tokens",
        badge: "Deep Think",
      },
    ],
  },
  {
    id: "anthropic",
    name: "Anthropic Claude",
    badge: "BYO API Key",
    description: "Acclaimed for nuanced academic writing, exceptional safety, and structured analytical essays.",
    defaultModel: "claude-3-7-sonnet-20250219",
    apiKeyRequired: true,
    apiKeyPlaceholder: "sk-ant-api03-...",
    defaultBaseUrl: "https://api.anthropic.com/v1",
    models: [
      {
        id: "claude-3-7-sonnet-20250219",
        name: "Claude 3.7 Sonnet",
        description: "Hybrid reasoning flagship model. Premier choice for structured UPSC Mains answer drafting and critical analysis.",
        context: "200,000 tokens",
        badge: "Hybrid Thinking",
      },
      {
        id: "claude-3-5-sonnet-20241022",
        name: "Claude 3.5 Sonnet",
        description: "Renowned benchmark for eloquent prose, public policy articulation, and comparative administration.",
        context: "200,000 tokens",
        badge: "Topper Prose",
      },
      {
        id: "claude-3-5-haiku-20241022",
        name: "Claude 3.5 Haiku",
        description: "High-velocity compact model for quick concept checks and Prelims explanation drills.",
        context: "200,000 tokens",
        badge: "High Speed",
      },
    ],
  },
  {
    id: "groq",
    name: "Groq LPU",
    badge: "BYO API Key",
    description: "Ultra-fast LPU inference engine with blistering token generation speeds (300+ tokens/sec).",
    defaultModel: "llama-3.3-70b-versatile",
    apiKeyRequired: true,
    apiKeyPlaceholder: "gsk_...",
    defaultBaseUrl: "https://api.groq.com/openai/v1",
    models: [
      {
        id: "llama-3.3-70b-versatile",
        name: "Llama 3.3 70B Versatile",
        description: "Full 70B open weights running at near-instantaneous speed. Exceptional reasoning and syllabus coverage.",
        context: "128,000 tokens",
        badge: "300+ tok/s",
      },
      {
        id: "llama-3.1-8b-instant",
        name: "Llama 3.1 8B Instant",
        description: "Sub-100ms first-token latency for instant doubt clearing and syllabus lookup.",
        context: "128,000 tokens",
        badge: "Sub-100ms",
      },
      {
        id: "deepseek-r1-distill-llama-70b",
        name: "DeepSeek R1 Distill 70B",
        description: "Deep reasoning distilled into Llama 70B architecture. Provides chain-of-thought analysis for complex Mains questions.",
        context: "128,000 tokens",
        badge: "Reasoning",
      },
    ],
  },
  {
    id: "openrouter",
    name: "OpenRouter",
    badge: "BYO API Key",
    description: "Unified gateway providing access to hundreds of open and proprietary models via a single API key.",
    defaultModel: "google/gemini-2.5-flash",
    apiKeyRequired: true,
    apiKeyPlaceholder: "sk-or-v1-...",
    defaultBaseUrl: "https://openrouter.ai/api/v1",
    models: [
      {
        id: "google/gemini-2.5-flash",
        name: "Gemini 2.5 Flash (via OpenRouter)",
        description: "Fast multimodal reasoning via unified OpenRouter balance.",
        context: "1,000,000 tokens",
        badge: "Popular",
      },
      {
        id: "anthropic/claude-3.5-sonnet",
        name: "Claude 3.5 Sonnet (via OpenRouter)",
        description: "Claude Sonnet without requiring a separate Anthropic billing account.",
        context: "200,000 tokens",
        badge: "Top Rated",
      },
      {
        id: "meta-llama/llama-3.3-70b-instruct",
        name: "Llama 3.3 70B Instruct (via OpenRouter)",
        description: "Meta's flagship open-weight model with high instruction adherence.",
        context: "131,072 tokens",
        badge: "Open Weights",
      },
      {
        id: "deepseek/deepseek-r1",
        name: "DeepSeek R1 (via OpenRouter)",
        description: "Frontier open-weights reasoning model with explicit deliberation traces.",
        context: "163,840 tokens",
        badge: "Frontier CoT",
      },
    ],
  },
  {
    id: "deepseek",
    name: "DeepSeek",
    badge: "BYO API Key / Reasoning",
    description: "Direct DeepSeek API. Outstanding mathematical reasoning, coding, and cost-efficient analytical performance.",
    defaultModel: "deepseek-chat",
    apiKeyRequired: true,
    apiKeyPlaceholder: "sk-...",
    defaultBaseUrl: "https://api.deepseek.com",
    models: [
      {
        id: "deepseek-chat",
        name: "DeepSeek-V3",
        description: "Flagship 671B MoE model with exceptional reasoning, broad knowledge synthesis, and fast response times.",
        context: "64,000 tokens",
        badge: "Flagship MoE",
      },
      {
        id: "deepseek-reasoner",
        name: "DeepSeek-R1 (Reasoning)",
        description: "Frontier chain-of-thought reasoning model with transparent deliberation for complex UPSC Mains questions.",
        context: "64,000 tokens",
        badge: "Deep Deliberation",
      },
    ],
  },
  {
    id: "mistral",
    name: "Mistral AI",
    badge: "BYO API Key",
    description: "Leading European frontier AI lab with premier models excelling in structured logic, multilinguality, and succinct synthesis.",
    defaultModel: "mistral-large-latest",
    apiKeyRequired: true,
    apiKeyPlaceholder: "Enter Mistral API key...",
    defaultBaseUrl: "https://api.mistral.ai/v1",
    models: [
      {
        id: "mistral-large-latest",
        name: "Mistral Large",
        description: "Flagship high-capacity model with top-tier reasoning capabilities for GS Paper 1-4 and public policy analysis.",
        context: "128,000 tokens",
        badge: "Top Benchmark",
      },
      {
        id: "mistral-small-latest",
        name: "Mistral Small",
        description: "Cost-efficient, low-latency model optimized for rapid concept drills, MCQ generation, and revision.",
        context: "32,000 tokens",
        badge: "Low Latency",
      },
      {
        id: "codestral-latest",
        name: "Codestral",
        description: "Specialized model for precise logical deduction, structured tabular formatting, and analytical evaluation.",
        context: "32,000 tokens",
        badge: "Structured Logic",
      },
      {
        id: "pixtral-large-latest",
        name: "Pixtral Large",
        description: "Multimodal frontier model capable of dissecting diagrams, maps, flowcharts, and handwritten notes.",
        context: "128,000 tokens",
        badge: "Multimodal",
      },
    ],
  },
  {
    id: "together",
    name: "Together AI",
    badge: "BYO API Key / Cloud",
    description: "Fast cloud inference platform hosting Llama 3.3, Qwen 2.5, DeepSeek R1, and Mixtral with high concurrency.",
    defaultModel: "meta-llama/Llama-3.3-70B-Instruct-Turbo",
    apiKeyRequired: true,
    apiKeyPlaceholder: "Enter Together AI API key...",
    defaultBaseUrl: "https://api.together.xyz/v1",
    models: [
      {
        id: "meta-llama/Llama-3.3-70B-Instruct-Turbo",
        name: "Llama 3.3 70B Turbo",
        description: "Meta's most capable open-weights model hosted with lightning-fast inference on Together's GPU cluster.",
        context: "128,000 tokens",
        badge: "High Speed",
      },
      {
        id: "deepseek-ai/DeepSeek-R1",
        name: "DeepSeek-R1 (Together)",
        description: "Full DeepSeek-R1 reasoning engine with unconstrained chain-of-thought analysis for complex policy essays.",
        context: "163,840 tokens",
        badge: "Deep Reasoning",
      },
      {
        id: "Qwen/Qwen2.5-72B-Instruct-Turbo",
        name: "Qwen 2.5 72B Turbo",
        description: "World-class multilingual model with deep historical knowledge, economics insight, and balanced essay synthesis.",
        context: "32,768 tokens",
        badge: "Broad Knowledge",
      },
      {
        id: "mistralai/Mixtral-8x22B-Instruct-v0.1",
        name: "Mixtral 8x22B Instruct",
        description: "Huge mixture-of-experts model balancing mathematical precision with graceful academic prose.",
        context: "65,536 tokens",
        badge: "MoE Giant",
      },
    ],
  },
  {
    id: "perplexity",
    name: "Perplexity AI",
    badge: "BYO API Key / Grounded",
    description: "Search-grounded models with real-time web citations, ideal for UPSC Current Affairs and contemporary news synthesis.",
    defaultModel: "sonar-pro",
    apiKeyRequired: true,
    apiKeyPlaceholder: "pplx-...",
    defaultBaseUrl: "https://api.perplexity.ai",
    models: [
      {
        id: "sonar-pro",
        name: "Sonar Pro (Search Grounded)",
        description: "State-of-the-art search-augmented model that grounds responses in fresh online news and verified government portals.",
        context: "127,072 tokens",
        badge: "Web Grounded",
      },
      {
        id: "sonar",
        name: "Sonar Lightweight",
        description: "Fast search-augmented model for quick factual checks, government scheme verification, and prelims data.",
        context: "127,072 tokens",
        badge: "Fast News",
      },
      {
        id: "sonar-reasoning",
        name: "Sonar Reasoning",
        description: "Combines real-time web searching with explicit multi-step reasoning for intricate UPSC issues.",
        context: "127,072 tokens",
        badge: "Search + CoT",
      },
    ],
  },
  {
    id: "xai",
    name: "xAI (Grok)",
    badge: "BYO API Key",
    description: "Frontier models from xAI engineered for truth-seeking, critical counter-arguments, and deep analytical perspective.",
    defaultModel: "grok-2-latest",
    apiKeyRequired: true,
    apiKeyPlaceholder: "xai-...",
    defaultBaseUrl: "https://api.x.ai/v1",
    models: [
      {
        id: "grok-2-latest",
        name: "Grok-2",
        description: "Frontier reasoning model with incisive analytical clarity, superb for counter-perspective debates in GS Papers.",
        context: "128,000 tokens",
        badge: "Flagship",
      },
      {
        id: "grok-2-vision-latest",
        name: "Grok-2 Vision",
        description: "Multimodal Grok engine equipped to parse complex tables, economic surveys, and infographic charts.",
        context: "128,000 tokens",
        badge: "Multimodal",
      },
      {
        id: "grok-beta",
        name: "Grok Beta",
        description: "Rapid iteration reasoning model for agile inquiries and fast-paced answer structuring.",
        context: "128,000 tokens",
        badge: "Agile",
      },
    ],
  },
  {
    id: "cohere",
    name: "Cohere",
    badge: "BYO API Key / Enterprise",
    description: "Enterprise-grade RAG and command models specialized in multi-document synthesis and grounded factual answers.",
    defaultModel: "command-r-plus-08-2024",
    apiKeyRequired: true,
    apiKeyPlaceholder: "Enter Cohere API key...",
    defaultBaseUrl: "https://api.cohere.com/v2",
    models: [
      {
        id: "command-r-plus-08-2024",
        name: "Command R+",
        description: "Optimized for highly grounded retrieval-augmented generation and synthesis of lengthy administrative committee reports.",
        context: "128,000 tokens",
        badge: "Complex RAG",
      },
      {
        id: "command-r-08-2024",
        name: "Command R",
        description: "Balanced high-speed model for document question answering, syllabus extraction, and study guide generation.",
        context: "128,000 tokens",
        badge: "Fast RAG",
      },
      {
        id: "command-light",
        name: "Command Light",
        description: "Fast and lightweight command model for rapid question breakdown and keyword clustering.",
        context: "4,096 tokens",
        badge: "Lightweight",
      },
    ],
  },
  {
    id: "nvidia",
    name: "NVIDIA NIM",
    badge: "BYO API Key / Enterprise",
    description: "NVIDIA Inference Microservices (NIM) powered by TensorRT-LLM for blistering inference speed, Nemotron reasoning, and open weights.",
    defaultModel: "meta/llama-3.3-70b-instruct",
    apiKeyRequired: true,
    apiKeyPlaceholder: "nvapi-...",
    defaultBaseUrl: "https://integrate.api.nvidia.com/v1",
    docsUrl: "https://build.nvidia.com",
    models: [
      {
        id: "meta/llama-3.3-70b-instruct",
        name: "Meta Llama 3.3 70B (NIM)",
        description: "Flagship 70B open model accelerated on NVIDIA TensorRT-LLM. Unmatched speed and deep analytical rigor across GS Papers.",
        context: "128,000 tokens",
        badge: "TensorRT Fast",
      },
      {
        id: "nvidia/llama-3.1-nemotron-70b-instruct",
        name: "NVIDIA Nemotron 70B",
        description: "NVIDIA-aligned frontier open model optimized for thoroughness, high factual alignment, and articulate Mains evaluation.",
        context: "128,000 tokens",
        badge: "NVIDIA Tuned",
      },
      {
        id: "deepseek-ai/deepseek-r1",
        name: "DeepSeek R1 (NIM)",
        description: "Frontier chain-of-thought deliberation model hosted on high-throughput NVIDIA GPU clusters.",
        context: "128,000 tokens",
        badge: "Reasoning",
      },
      {
        id: "mistralai/mistral-large-2-instruct",
        name: "Mistral Large 2 (NIM)",
        description: "Leading European reasoning model running on NVIDIA NIM with 128k context for deep policy and administrative synthesis.",
        context: "128,000 tokens",
        badge: "128k Context",
      },
      {
        id: "meta/llama-3.1-8b-instruct",
        name: "Meta Llama 3.1 8B (NIM)",
        description: "Ultra-low-latency compact model with sub-50ms first-token generation for rapid Prelims drills and fact lookups.",
        context: "128,000 tokens",
        badge: "Sub-50ms",
      },
    ],
  },
  {
    id: "local",
    name: "Ollama / Local Daemon",
    badge: "Offline / Private",
    description: "100% private, runs entirely on your machine. Zero cloud dependency, zero subscription fees.",
    defaultModel: "llama3.1:8b-instruct-q4_K_M",
    apiKeyRequired: false,
    apiKeyPlaceholder: "Not required for local daemon",
    defaultBaseUrl: "http://localhost:11434",
    models: [
      {
        id: "llama3.1:8b-instruct-q4_K_M",
        name: "Llama 3.1 8B Instruct (Local)",
        description: "The gold standard open-weight model for local UPSC preparation. Superb comprehension of Indian polity and administration.",
        context: "8,192 tokens",
        badge: "Recommended",
      },
      {
        id: "llama3.2:3b",
        name: "Llama 3.2 3B Instruct (Local)",
        description: "Ultra-compact model designed for standard laptops with 8GB RAM. Low battery drain.",
        context: "8,192 tokens",
        badge: "Low RAM",
      },
      {
        id: "mistral:7b-instruct-v0.3-q4_K_M",
        name: "Mistral 7B Instruct v0.3 (Local)",
        description: "Renowned for dense logic, precise argumentation, and crisp synthesis in GS Paper 2.",
        context: "32,768 tokens",
        badge: "Dense Logic",
      },
      {
        id: "gemma2:9b-q4_K_M",
        name: "Google Gemma 2 9B (Local)",
        description: "Rivals 20B+ models in comprehension. Ideal for Mac M2/M3 with 16GB+ RAM or NVIDIA GPUs.",
        context: "8,192 tokens",
        badge: "High Nuance",
      },
      {
        id: "phi3.5:3.8b-mini-instruct",
        name: "Microsoft Phi 3.5 Mini 3.8B (Local)",
        description: "Trained heavily on synthetic textbooks and high-reasoning curricula. Large context window.",
        context: "128,000 tokens",
        badge: "Reasoning",
      },
    ],
  },
  {
    id: "custom",
    name: "Custom OpenAI-Compatible",
    badge: "Self-Hosted / Third-Party",
    description: "Connect any OpenAI-compatible server (vLLM, LM Studio, Together AI, Mistral, Perplexity, etc.).",
    defaultModel: "custom-model",
    apiKeyRequired: false,
    apiKeyPlaceholder: "Bearer token (if required by your endpoint)",
    defaultBaseUrl: "http://localhost:1234/v1",
    models: [
      {
        id: "custom-model",
        name: "Custom Endpoint Model",
        description: "Target any custom model hosted on your internal server, vLLM instance, or third-party inference provider.",
        context: "Configurable",
        badge: "Custom",
      },
    ],
  },
];

export const AVAILABLE_MODELS: ModelOption[] = [
  // Cloud Models
  {
    id: "gemini-3.6-flash",
    name: "Gemini 3.6 Flash (Cloud)",
    type: "cloud",
    provider: "Google DeepMind",
    parameterSize: "Cloud Low Latency",
    minRamGb: 2,
    minVramGb: 0,
    recommendedQuant: "Native Cloud FP16",
    description: "High-stability, low-latency cloud engine with resilient multi-model failover. Ideal for fast Prelims MCQs and uninterrupted Bolt AI chat.",
    strengths: ["Ultra-reliable availability", "Sub-second response time", "Automatic multi-model failover", "Zero local hardware load"],
    ollamaCommand: "N/A (Managed Cloud API)",
    contextWindow: "1,048,576 tokens",
  },
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
  {
    id: "meta/llama-3.3-70b-instruct",
    name: "Meta Llama 3.3 70B (NVIDIA NIM)",
    type: "cloud",
    provider: "NVIDIA NIM",
    parameterSize: "70.0 Billion",
    minRamGb: 2,
    minVramGb: 0,
    recommendedQuant: "NVIDIA Cloud FP8/FP16",
    description: "Enterprise-grade 70B open model accelerated by NVIDIA TensorRT-LLM on NVIDIA NIM. Sub-second first-token latency with deep UPSC reasoning.",
    strengths: ["TensorRT-LLM acceleration", "Top benchmark accuracy", "128k context window", "BYO NVIDIA API Key"],
    ollamaCommand: "N/A (NVIDIA NIM Cloud API)",
    contextWindow: "128,000 tokens",
  },
  {
    id: "nvidia/llama-3.1-nemotron-70b-instruct",
    name: "NVIDIA Llama 3.1 Nemotron 70B (NIM)",
    type: "cloud",
    provider: "NVIDIA",
    parameterSize: "70.0 Billion",
    minRamGb: 2,
    minVramGb: 0,
    recommendedQuant: "NVIDIA Cloud FP8",
    description: "NVIDIA's customized open model tuned specifically for high-accuracy reasoning, mathematical logic, and nuanced answer synthesis.",
    strengths: ["Fine-tuned by NVIDIA", "Superior instruction following", "Deep critical analysis", "Comprehensive Mains feedback"],
    ollamaCommand: "N/A (NVIDIA NIM Cloud API)",
    contextWindow: "128,000 tokens",
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
  selectedModelId: "gemini-3.1-flash-lite",
  modelType: "cloud",
  provider: "gemini",
  apiKey: "",
  baseUrl: "",
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
