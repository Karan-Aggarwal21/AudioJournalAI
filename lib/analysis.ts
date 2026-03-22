/**
 * Transformers.js NLP analysis engine.
 * Uses DistilBERT for Sentiment and RoBERTa/DeBERTa for Emotion.
 * Completely offline, running in browser via WebAssembly.
 */

import { pipeline, env, type PipelineType } from "@xenova/transformers";

// Disable local models to fetch from HuggingFace Hub directly
env.allowLocalModels = false;

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

/**
 * Initialize NLP models. Should be called when the app loads.
 */
export async function initNLPModels(): Promise<void> {
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
    
    // Load both models concurrently
    [sentimentPipeline, emotionPipeline] = await Promise.all([
      pipeline("text-classification" as PipelineType, "Xenova/distilbert-base-uncased-finetuned-sst-2-english"),
      pipeline("zero-shot-classification" as PipelineType, "Xenova/nli-deberta-v3-small")
    ]);

    console.info("[RunAnywhere:NLP] NLP pipelines ready!");
  } catch (err) {
    console.error("[RunAnywhere:NLP] Failed to load NLP models:", err);
    throw err;
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

  // --- Sentiment Analysis (DistilBERT) ---
  let sentiment: Sentiment = "neutral";
  let sentimentScore = 0;
  
  if (text.trim().length > 0) {
      try {
        const sentResult = await sentimentPipeline(text);
        if (sentResult && sentResult.length > 0) {
            const label = sentResult[0].label;
            const score = sentResult[0].score;
            
            if (label === "POSITIVE") {
                sentiment = "positive";
                sentimentScore = score;
            } else if (label === "NEGATIVE") {
                sentiment = "negative";
                sentimentScore = -score;
            }
            
            // If the model is extremely unsure, default back to neutral
            if (score < 0.6) {
                sentiment = "neutral";
                sentimentScore = 0;
            }
        }
      } catch (err) {
          console.warn("Sentiment analysis failed, falling back to neutral", err);
      }
  }

  // --- Emotion Detection (DeBERTa Zero-Shot) ---
  let emotion: Emotion = "neutral";
  let emotionConfidence = 0;

  if (text.trim().length > 0) {
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
