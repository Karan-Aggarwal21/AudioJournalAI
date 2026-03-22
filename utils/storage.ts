/**
 * IndexedDB storage utility for journal entries.
 * Uses the `idb` library for clean async operations.
 * All data stays local — no backend.
 */

import { openDB, type IDBPDatabase } from "idb";
import type { Sentiment, Emotion } from "@/lib/analysis";

export interface JournalEntry {
  id: string;
  text: string;
  timestamp: number;
  sentiment: Sentiment;
  sentimentScore: number;
  emotion: Emotion;
  emotionConfidence: number;
  keywords: string[];
  topics: string[];
}

const DB_NAME = "mindmirror-journal";
const DB_VERSION = 1;
const STORE_NAME = "entries";

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDB(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
          store.createIndex("timestamp", "timestamp");
          store.createIndex("sentiment", "sentiment");
          store.createIndex("emotion", "emotion");
        }
      },
    });
  }
  return dbPromise;
}

/**
 * Generate a unique ID for a journal entry.
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Save a new journal entry.
 */
export async function saveEntry(
  entry: Omit<JournalEntry, "id">
): Promise<JournalEntry> {
  const db = await getDB();
  const fullEntry: JournalEntry = { id: generateId(), ...entry };
  await db.put(STORE_NAME, fullEntry);
  return fullEntry;
}

/**
 * Update an existing journal entry.
 */
export async function updateEntry(
  id: string,
  updates: Partial<Omit<JournalEntry, "id" | "timestamp">>
): Promise<JournalEntry> {
  const db = await getDB();
  const existing = await db.get(STORE_NAME, id);
  if (!existing) throw new Error("Entry not found");
  
  const updated = { ...existing, ...updates };
  await db.put(STORE_NAME, updated);
  return updated;
}

/**
 * Get all journal entries, sorted by timestamp (newest first).
 */
export async function getAllEntries(): Promise<JournalEntry[]> {
  const db = await getDB();
  const entries = await db.getAll(STORE_NAME);
  return entries.sort((a, b) => b.timestamp - a.timestamp);
}

/**
 * Get entries within a date range.
 */
export async function getEntriesByDateRange(
  start: number,
  end: number
): Promise<JournalEntry[]> {
  const db = await getDB();
  const entries = await db.getAll(STORE_NAME);
  return entries
    .filter((e) => e.timestamp >= start && e.timestamp <= end)
    .sort((a, b) => b.timestamp - a.timestamp);
}

/**
 * Delete a journal entry by ID.
 */
export async function deleteEntry(id: string): Promise<void> {
  const db = await getDB();
  await db.delete(STORE_NAME, id);
}

/**
 * Get total entry count.
 */
export async function getEntryCount(): Promise<number> {
  const db = await getDB();
  return db.count(STORE_NAME);
}
