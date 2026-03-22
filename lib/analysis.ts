/**
 * Transformers.js NLP analysis engine.
 * Uses multilingual BERT for Sentiment and XLM-RoBERTa for Emotion.
 * Completely offline, running in browser via WebAssembly.
 */

import { pipeline, env, type PipelineType } from "@xenova/transformers";
import { getEmotionScores } from "@/utils/emotionMapper";

// Prefer local models for offline usage
env.allowLocalModels = true;
env.allowRemoteModels = false;
env.localModelPath = "/models";

const SENTIMENT_MODEL_ID = "Xenova/bert-base-multilingual-uncased-sentiment";
const EMOTION_MODEL_ID = "Xenova/xlm-roberta-large-xnli";

export type Sentiment = "positive" | "neutral" | "negative";
export type Emotion =
  | "joy"
  | "gratitude"
  | "calm"
  | "stress"
  | "anxiety"
  | "sadness"
  | "anger"
  | "fear"
  | "surprise"
  | "neutral";

export interface AnalysisResult {
  sentiment: Sentiment;
  sentimentScore: number; // -1 to 1
  emotion: Emotion;
  emotionConfidence: number; // 0 to 1
  keywords: string[];
  topics: string[];
}

// Pipelines
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let sentimentPipeline: any = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let emotionPipeline: any = null;

let isInitializing = false;
let nlpUnavailable = false;
let sentimentUnavailable = false;
let emotionUnavailable = false;

const hasLocalFiles = async (modelId: string, files: string[]): Promise<boolean> => {
  if (typeof window === "undefined") return true;
  const base = `${env.localModelPath}/${modelId}`;
  const checks = await Promise.all(
    files.map(async (file) => {
      try {
        const res = await fetch(`${base}/${file}`, { method: "HEAD" });
        return res.ok;
      } catch {
        return false;
      }
    })
  );
  return checks.every(Boolean);
};

const hasAnyLocalFile = async (modelId: string, files: string[]): Promise<boolean> => {
  if (typeof window === "undefined") return true;
  const base = `${env.localModelPath}/${modelId}`;
  const checks = await Promise.all(
    files.map(async (file) => {
      try {
        const res = await fetch(`${base}/${file}`, { method: "HEAD" });
        return res.ok;
      } catch {
        return false;
      }
    })
  );
  return checks.some(Boolean);
};

/**
 * Initialize NLP models. Should be called when the app loads.
 */
export async function initNLPModels(): Promise<void> {
  if (nlpUnavailable) return;
  if (sentimentPipeline && emotionPipeline) return;
  if (isInitializing) {
    // Wait for initialization if already in progress
    while (isInitializing) {
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    return;
  }

  isInitializing = true;
  try {
    console.info("[RunAnywhere:NLP] Initializing transformers.js pipelines...");

    const [hasSentimentFiles, hasEmotionFiles] = await Promise.all([
      sentimentUnavailable
        ? Promise.resolve(false)
        : Promise.all([
            hasLocalFiles(SENTIMENT_MODEL_ID, [
              "config.json",
              "tokenizer.json",
              "tokenizer_config.json",
              "special_tokens_map.json",
            ]),
            hasAnyLocalFile(SENTIMENT_MODEL_ID, ["model.onnx", "model_quantized.onnx"]),
          ]).then(([baseOk, hasModel]) => baseOk && hasModel),
      emotionUnavailable
        ? Promise.resolve(false)
        : Promise.all([
            hasLocalFiles(EMOTION_MODEL_ID, [
              "config.json",
              "tokenizer.json",
              "tokenizer_config.json",
              "special_tokens_map.json",
            ]),
            hasAnyLocalFile(EMOTION_MODEL_ID, ["model.onnx", "model_quantized.onnx"]),
          ]).then(([baseOk, hasModel]) => baseOk && hasModel),
    ]);

    const sentimentPromise = hasSentimentFiles
      ? pipeline("text-classification" as PipelineType, SENTIMENT_MODEL_ID)
      : Promise.resolve(null);
    const emotionPromise = hasEmotionFiles
      ? pipeline("zero-shot-classification" as PipelineType, EMOTION_MODEL_ID)
      : Promise.resolve(null);

    const [sentimentResult, emotionResult] = await Promise.allSettled([
      sentimentPromise,
      emotionPromise,
    ]);

    if (sentimentResult.status === "fulfilled" && sentimentResult.value) {
      sentimentPipeline = sentimentResult.value;
    } else {
      console.warn("[RunAnywhere:NLP] Sentiment model unavailable. Using fallback.");
      sentimentUnavailable = true;
    }

    if (emotionResult.status === "fulfilled" && emotionResult.value) {
      emotionPipeline = emotionResult.value;
    } else {
      console.warn("[RunAnywhere:NLP] Emotion model unavailable. Using fallback.");
      emotionUnavailable = true;
    }

    if (sentimentPipeline || emotionPipeline) {
      console.info("[RunAnywhere:NLP] NLP pipelines ready!");
    } else {
      console.warn("[RunAnywhere:NLP] No NLP models loaded. Falling back to rule-based analysis.");
      nlpUnavailable = true;
    }
  } catch (err) {
    console.error("[RunAnywhere:NLP] Failed to initialize NLP models:", err);
    nlpUnavailable = true;
  } finally {
    isInitializing = false;
  }
}

// Topic categories mapped simply via TF-IDF (keyword-based fallback since text-classification doesn't do topic extraction out-of-the-box without a zero-shot model)
const TOPIC_MAP: Record<string, string[]> = {
  work: ["work", "job", "office", "meeting", "boss", "colleague", "project", "deadline", "career", "promotion"],
  health: ["health", "exercise", "gym", "doctor", "sick", "pain", "medication", "sleep", "diet", "wellness"],
  relationships: ["family", "friend", "partner", "relationship", "love", "argument", "together", "alone", "social"],
  studies: ["study", "exam", "school", "university", "class", "homework", "grade", "learn", "course", "assignment"],
  finance: ["money", "budget", "salary", "expense", "debt", "savings", "investment", "bill", "financial"],
  hobbies: ["music", "reading", "game", "travel", "cooking", "art", "movie", "sport", "hobby", "creative"],
  selfcare: ["meditation", "therapy", "journal", "reflect", "growth", "self-care", "boundaries", "rest"],
};

// Map go_emotions 28 classes to our 10 broad categories
const GO_EMOTIONS_MAP: Record<string, Emotion> = {
  admiration: "joy", amusement: "joy", anger: "anger", annoyance: "anger", approval: "joy", 
  caring: "joy", confusion: "surprise", curiosity: "surprise", desire: "joy", disappointment: "sadness", 
  disapproval: "anger", disgust: "anger", embarrassment: "fear", excitement: "joy", fear: "fear", 
  gratitude: "gratitude", grief: "sadness", joy: "joy", love: "joy", nervousness: "anxiety", 
  optimism: "joy", pride: "joy", realization: "surprise", relief: "calm", remorse: "sadness", 
  sadness: "sadness", surprise: "surprise", neutral: "neutral"
};

/**
 * Analyze journal text using local transformer models.
 */
export async function analyzeText(text: string): Promise<AnalysisResult> {
  const words = text.toLowerCase().replace(/[^\w\s]/g, "").split(/\s+/);
  const wordSet = new Set(words);

  // Initialize models if not already loaded (lazy load fallback)
  if (!sentimentPipeline || !emotionPipeline) {
    await initNLPModels();
  }

  // --- Sentiment Analysis (Multilingual BERT) ---
  let sentiment: Sentiment = "neutral";
  let sentimentScore = 0;
  
  if (text.trim().length > 0 && sentimentPipeline) {
      try {
        const sentResult = await sentimentPipeline(text);
        if (sentResult && sentResult.length > 0) {
          const label = String(sentResult[0].label || "");
          const score = typeof sentResult[0].score === "number" ? sentResult[0].score : 0;
          const starMatch = label.match(/(\d)/);
          const stars = starMatch ? Number(starMatch[1]) : 3;

          if (stars <= 2) {
            sentiment = "negative";
          } else if (stars === 3) {
            sentiment = "neutral";
          } else {
            sentiment = "positive";
          }

          // Map 1-5 stars to -1..1 with confidence weighting
          const baseScore = (stars - 3) / 2;
          sentimentScore = Math.max(-1, Math.min(1, baseScore * (score || 1)));

          // If confidence is low, fall back to neutral
          if (score < 0.55) {
            sentiment = "neutral";
            sentimentScore = 0;
          }
        }
      } catch (err) {
          console.warn("Sentiment analysis failed, falling back to neutral", err);
      }
  } else if (text.trim().length > 0) {
    const normalized = text.toLowerCase();
    const negationPatterns = ["not ", "never ", "no "];
    const positiveTerms = ["good", "happy", "fine", "great", "ok", "okay", "well", "better", "love"];

    const hasNegatedPositive = positiveTerms.some((term) =>
      negationPatterns.some((neg) => normalized.includes(`${neg}${term}`))
    );

    if (hasNegatedPositive) {
      sentiment = "negative";
      sentimentScore = -0.5;
    }
  }

  // --- Emotion Detection (XLM-RoBERTa Zero-Shot) ---
  let emotion: Emotion = "neutral";
  let emotionConfidence = 0;

  if (text.trim().length > 0 && emotionPipeline) {
      try {
        const candidateLabels = ["joy", "gratitude", "calm", "stress", "anxiety", "sadness", "anger", "fear", "surprise", "neutral"];
        const emResult = await emotionPipeline(text, candidateLabels);
        
        if (emResult && emResult.labels && emResult.labels.length > 0) {
            emotion = emResult.labels[0] as Emotion;
            emotionConfidence = emResult.scores[0];
        }
      } catch (err) {
          console.warn("Emotion analysis failed, falling back to neutral", err);
      }
  } else if (text.trim().length > 0) {
    const scores = getEmotionScores(text);
    if (scores.length > 0) {
      emotion = scores[0].emotion;
      emotionConfidence = Math.min(0.75, scores[0].score);
    }
  }

  // --- Keyword Extraction (simple TF-based) ---
  const stopWords = new Set([
    "the", "a", "an", "is", "are", "was", "were", "be", "been", "being",
    "have", "has", "had", "do", "does", "did", "will", "would", "could",
    "should", "may", "might", "shall", "can", "to", "of", "in", "for",
    "on", "with", "at", "by", "from", "it", "this", "that", "and", "or",
    "but", "not", "so", "if", "my", "me", "i", "we", "you", "he", "she",
    "they", "them", "its", "our", "your", "just", "about", "very", "really",
    "much", "also", "than", "then", "when", "what", "how", "all", "some",
    "there", "here", "up", "out", "no", "yes", "like", "get", "got", "go",
    "went", "going", "thing", "things", "way", "day", "today", "feel",
    "felt", "feeling", "think", "thought", "know", "knew", "make", "made",
  ]);

  const wordFreq: Record<string, number> = {};
  for (const word of words) {
    if (word.length > 2 && !stopWords.has(word)) {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    }
  }

  const keywords = Object.entries(wordFreq)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([word]) => word);

  // --- Topic Detection ---
  const topicScores: Record<string, number> = {};
  for (const [topic, topicWords] of Object.entries(TOPIC_MAP)) {
    const matches = topicWords.filter((tw) => wordSet.has(tw));
    if (matches.length > 0) {
      topicScores[topic] = matches.length;
    }
  }

  const topics = Object.entries(topicScores)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([topic]) => topic);

  return {
    sentiment,
    sentimentScore,
    emotion,
    emotionConfidence,
    keywords,
    topics,
  };
}
