"use client";

/**
 * MindMirror AI — Main Journal Page
 * Privacy-first, offline voice journaling app.
 * Client component — initializes RunAnywhere SDK in useEffect.
 */

import { useState, useEffect, useCallback, useMemo } from "react";
import BookLayout from "@/components/BookLayout";
import MicButton from "@/components/MicButton";
import JournalCard from "@/components/JournalCard";
import Graph from "@/components/Graph";
import { getAllEntries, deleteEntry, type JournalEntry } from "@/utils/storage";
import { generateWeeklyInsight } from "@/utils/analytics";
import { initRunAnywhere, initSTTModel, initVADModel, getRunAnywhereState } from "@/lib/runanywhere";
import { initNLPModels } from "@/lib/analysis";

export default function Home() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [modelsReady, setModelsReady] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // Load persisted entries on mount
  useEffect(() => {
    async function loadEntries() {
      try {
        const stored = await getAllEntries();
        setEntries(stored.sort((a, b) => b.timestamp - a.timestamp));
      } catch (err) {
        console.error("Failed to load entries:", err);
      }
    }
    loadEntries();
  }, []);

  // Initialize RunAnywhere SDK (client-side only)
  useEffect(() => {
    async function initModels() {
      try {
        setIsInitializing(true);
        await initRunAnywhere();
        await Promise.all([initSTTModel(), initVADModel(), initNLPModels()]);
        setModelsReady(true);
      } catch (err) {
        const state = getRunAnywhereState();
        setInitError(
          state.error || (err instanceof Error ? err.message : "Failed to initialize AI models")
        );
        console.error("Model init failed:", err);
      } finally {
        setIsInitializing(false);
      }
    }
    initModels();
  }, []);

  const handleNewEntry = useCallback((entry: JournalEntry) => {
    setEntries((prev) => [entry, ...prev]);
  }, []);

  const handleUpdateEntry = useCallback((updated: JournalEntry) => {
    setEntries((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
  }, []);

  const handleDeleteEntry = useCallback(async (id: string) => {
    await deleteEntry(id);
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const entriesSorted = useMemo(
    () => [...entries].sort((a, b) => b.timestamp - a.timestamp),
    [entries]
  );

  const insight = generateWeeklyInsight(entriesSorted);

  // Book pages
  const pages = [
    {
      id: "cover",
      label: "Cover",
      fullBleed: true,
      content: (
        <div className="page-cover">
          <div className="cover-ornament top-ornament">✦ ✦ ✦</div>
          <div className="cover-content">
            <h1 className="cover-title">MindMirror</h1>
            <div className="cover-divider" />
            <p className="cover-subtitle">A Personal Reflection Journal</p>
            <p className="cover-tagline">Speak Freely • Reflect Deeply • Grow Mindfully</p>
          </div>
          <div className="cover-ornament bottom-ornament">
            <span className="cover-date">
              {new Date().toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
              })}
            </span>
          </div>
          <div className="cover-seal">🔒 Privacy-First • Runs Offline</div>
        </div>
      ),
    },
    {
      id: "record",
      label: "Write",
      content: (
        <div className="page-record">
          <h2 className="page-title">Today&rsquo;s Entry</h2>
          <p className="page-description">
            Tap the microphone and speak about your day. Your words will be
            transcribed and analyzed — all on your device.
          </p>

          {initError && (
            <div className="init-error">
              <p>⚠️ AI models could not be loaded:</p>
              <p className="init-error-detail">{initError}</p>
              <p className="init-error-hint">
                Try refreshing. Models need to download on first use.
              </p>
            </div>
          )}

          <MicButton onNewEntry={handleNewEntry} onUpdateEntry={handleUpdateEntry} modelsReady={modelsReady} />

          {isInitializing && !modelsReady && (
            <div className="init-loading">
              <div className="init-spinner" />
              <p>Loading AI models for the first time…</p>
              <p className="init-loading-hint">This may take a moment. Models are cached for offline use.</p>
            </div>
          )}

          {entriesSorted.length > 0 && (
            <div className="recent-entry">
              <h3 className="recent-title">Latest Entry</h3>
              <JournalCard entry={entriesSorted[0]} />
            </div>
          )}
        </div>
      ),
    },
    {
      id: "entries",
      label: "Entries",
      content: (
        <div className="page-entries">
          <h2 className="page-title">Journal Entries</h2>
          <p className="page-description">
            {entries.length === 0
              ? "Your journal is empty. Start by recording your first entry."
              : `${entries.length} ${entries.length === 1 ? "entry" : "entries"} recorded`}
          </p>
          <div className="entries-list">
            {entriesSorted.map((entry) => (
              <JournalCard
                key={entry.id}
                entry={entry}
                onDelete={handleDeleteEntry}
              />
            ))}
          </div>
        </div>
      ),
    },
    {
      id: "insights",
      label: "Insights",
      wide: true,
      content: (
        <div className="page-insights">
          <h2 className="page-title">Insights & Graphs</h2>
          <p className="page-description">{insight.period}</p>

          {entriesSorted.length > 0 && (
            <div className="insight-summary">
              <p className="insight-text">{insight.insightText}</p>
            </div>
          )}

          <Graph entries={entriesSorted} />
        </div>
      ),
    },
  ];

  return <BookLayout pages={pages} />;
}
