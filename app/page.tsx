"use client";

/**
 * MindMirror AI — Main Journal Page
 * Privacy-first, offline voice journaling app.
 * Client component — initializes RunAnywhere SDK in useEffect.
 */

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
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
  const navigateRef = useRef<(index: number) => void>(() => {});
  const scrollToPage = useCallback((index: number) => navigateRef.current(index), []);

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
          {/* Glassmorphism Floating Cards */}
          <div className="floating-card card-left">
            <h3 className="floating-card-title">Today&apos;s Reflection</h3>
            <p className="floating-card-text" style={{ display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
              {entriesSorted.length > 0 ? entriesSorted[0].text : "No reflections recorded today. Tap the microphone to start."}
            </p>
          </div>
          
          <div className="floating-card card-right">
            <h3 className="floating-card-title">AI Insight</h3>
            <p className="floating-card-text">
              {entriesSorted.length > 0 
                ? `Your mood today appears to be ${entriesSorted[0].emotion}.` 
                : "Start journaling to see your mood."}
            </p>
          </div>

          {/* Central Hero Content */}
          <div className="cover-hero">
            <h1 className="cover-title-script">MindMirror</h1>
            <p className="cover-subtitle-clean">A Personal Reflection Journal</p>
          </div>

          {/* Glowing Mic & Waveform */}
          <div className="cover-interactive">
             <div className="cover-waveform-glow">
              {[...Array(12)].map((_, i) => (
                <div key={`L-${i}`} className="glowing-wave-bar" style={{ animationDelay: `${i * 0.1}s`, height: `${Math.random() * 12 + 4}px` }} />
              ))}
            </div>
            
            <div className="glowing-mic-container" onClick={() => scrollToPage(1)}>
              <div className="mic-glow-orb" />
              <svg viewBox="0 0 24 24" fill="currentColor" className="glowing-mic-icon">
                <path d="M12 14a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v5a3 3 0 0 0 3 3zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.92V21h2v-3.08A7 7 0 0 0 19 11h-2z"/>
              </svg>
            </div>

            <div className="cover-waveform-glow">
              {[...Array(12)].map((_, i) => (
                <div key={`R-${i}`} className="glowing-wave-bar" style={{ animationDelay: `${(11 - i) * 0.1}s`, height: `${Math.random() * 12 + 4}px` }} />
              ))}
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="cover-cta-row">
            <button className="gold-btn gold-btn-filled" onClick={() => scrollToPage(1)}>
              Start Recording
            </button>
            <button className="gold-btn gold-btn-outline" onClick={() => scrollToPage(3)}>
              View Insights
            </button>
          </div>

          {/* Constellation Lines & Accents */}
          <div className="constellation-layer">
            <svg className="constellation-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path d="M 0,60 Q 20,40 40,70 T 100,20" className="constellation-path" />
              <circle cx="20" cy="50" r="0.5" className="constellation-node" />
              <circle cx="40" cy="70" r="0.8" className="constellation-node" />
              <circle cx="80" cy="35" r="0.6" className="constellation-node" />
            </svg>
            <svg className="constellation-svg constellation-svg-bottom" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path d="M 10,80 Q 30,95 60,80 T 100,50" className="constellation-path" />
              <circle cx="30" cy="95" r="0.7" className="constellation-node" />
              <circle cx="60" cy="80" r="0.5" className="constellation-node" />
            </svg>
          </div>

          {/* Floating Icons */}
          <div className="floating-icon icon-book">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
            </svg>
          </div>
          <div className="floating-icon icon-gear">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </div>
          <div className="floating-icon icon-sparkle">◆</div>
        </div>
      ),
    },
    {
      id: "record",
      label: "Write",
      nebulaPage: true,
      content: (
        <div className="page-record-nebula">
          <div className="glass-card-main">
            <h2 className="nebula-title">Today&rsquo;s Entry</h2>
            <p className="nebula-description">
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
            
            <div className="sprout-icon-container">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="sprout-icon-svg">
                <path d="M12 22v-9" />
                <path d="M12 13C8 13 5 10 5 6c0 0 4 0 7 7Z" />
                <path d="M12 13c4 0 7-3 7-7 0 0-4 0-7 7Z" />
              </svg>
            </div>
          </div>

          <div className="nebula-latest-entry-container">
            <p className="nebula-latest-label">LATEST ENTRY</p>
            {entriesSorted.length > 0 ? (
               <div className="glass-card-latest">
                 <div className="latest-meta">
                   <p className="latest-date">{new Date(entriesSorted[0].timestamp).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
                   <p className="latest-time">{new Date(entriesSorted[0].timestamp).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</p>
                 </div>
                 <div className="latest-emotion">
                    <span className="emotion-pill">
                      {entriesSorted[0].emotion?.toUpperCase() || "NEUTRAL"} {entriesSorted[0].emotion === "joy" ? "😁" : entriesSorted[0].emotion === "sadness" ? "😢" : entriesSorted[0].emotion === "anger" ? "😠" : "😐"} {entriesSorted[0].emotion || "neutral"}
                    </span>
                 </div>
               </div>
            ) : (
               <div className="glass-card-latest empty-latest">
                 <p className="latest-meta">No previous entries found.</p>
               </div>
            )}
          </div>
        </div>
      ),
    },
    {
      id: "entries",
      label: "Entries",
      nebulaPage: true,
      content: (
        <div className="page-entries-nebula">
          <div className="glass-board-nebula">
            <div className="entries-header-nebula">
              <div className="entries-header-text">
                <h2 className="solidified-light-title">Journal Entries</h2>
                <p className="glowing-numbers-text">
                  {entries.length === 0
                    ? "Your journal is empty. Start by recording your first entry."
                    : `${entries.length} ${entries.length === 1 ? "entry" : "entries"} recorded`}
                </p>
              </div>
              <div className="sprout-hologram">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 22v-9" />
                  <path d="M12 13C8 13 5 10 5 6c0 0 4 0 7 7Z" />
                  <path d="M12 13c4 0 7-3 7-7 0 0-4 0-7 7Z" />
                </svg>
              </div>
            </div>
            
            <div className="entries-list-shard-container">
              {entriesSorted.map((entry) => (
                <JournalCard
                  key={entry.id}
                  entry={entry}
                  onDelete={handleDeleteEntry}
                />
              ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "insights",
      label: "Insights",
      wide: true,
      nebulaPage: true,
      content: (
        <div className="page-insights-nebula">
          <div className="glass-board-nebula">
            <div className="insights-header-glass">
              <div className="insights-header-text">
                <h2 className="solidified-light-title">Insights & Graphs</h2>
                <p className="glowing-numbers-text">{insight.period}</p>
              </div>
              
              <div className="light-vine-structure">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2v1c0 6.8-3.4 17-8 17Z" />
                  <path d="M11 20A7 7 0 0 0 12.2 6.1C6.5 5 5 4.48 3 2v1c0 6.8 3.4 17 8 17Z" />
                  <path d="M12 22V10" />
                  <path d="M12 10l3-3" />
                  <path d="M12 10L9 7" />
                </svg>
              </div>
            </div>

            {entriesSorted.length > 0 && (
              <div className="constellation-summary-container">
                <p className="constellation-summary-text">
                  {insight.insightText}
                </p>
              </div>
            )}

            <div className="graphs-shard-container">
              <Graph entries={entriesSorted} />
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "about",
      label: "About Us",
      nebulaPage: true,
      content: (
        <div className="page-about-nebula">
          <div className="glass-board-nebula">
            <div className="entries-header-nebula" style={{ borderBottom: '1px solid rgba(255, 200, 100, 0.2)', marginBottom: '16px' }}>
              <div className="entries-header-text">
                <h2 className="solidified-light-title">About Us</h2>
                <p className="glowing-numbers-text">Our Mission & Philosophy</p>
              </div>
              <div className="sprout-hologram">
                 <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M12 22v-9" />
                    <path d="M12 13C8 13 5 10 5 6c0 0 4 0 7 7Z" />
                    <path d="M12 13c4 0 7-3 7-7 0 0-4 0-7 7Z" />
                  </svg>
              </div>
            </div>

            <div className="about-shard-content" style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
              <div className="about-section-nebula">
                <p className="shard-text">
                  MINDMIRROR is designed a a mirror for your mind, helping you capture daily thoughts and track your emotional journey. We believe in the power of conscious reflection.
                </p>
              </div>

              <div className="about-section-nebula">
                <h3 className="shard-heading">
                  <span className="hologram-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <circle cx="12" cy="12" r="10" />
                      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
                    </svg>
                  </span>
                  Our Mission
                </h3>
                <p className="shard-text">
                  To provide a secure, private, and intuitive platform for deep self-reflection, empowering users to discover their unique thought patterns and personal growth.
                </p>
              </div>

              <div className="about-section-nebula">
                <h3 className="shard-heading">
                  <span className="hologram-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M12 2v20" />
                      <path d="M2 12h20" />
                      <path d="m4.93 4.93 14.14 14.14" />
                      <path d="m19.07 4.93-14.14 14.14" />
                    </svg>
                  </span>
                  Our Philosophy
                </h3>
                <p className="shard-text">
                  Combining the archival feel of physical journaling with the insightful potential of compassionate AI analysis, to synthesize your words into actionable life patterns, always with user privacy at its core.
                </p>
              </div>

              <div className="about-footer-nebula" style={{ borderTop: '1px solid rgba(255, 200, 100, 0.15)', paddingTop: '24px' }}>
                <p className="shard-text text-center">
                  <strong className="glowing-strong">Questions or Feedback?</strong> Email us at: <br/><strong className="glowing-accent">karanwork2106@gmail.com</strong>
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return <BookLayout pages={pages} onNavigateRef={(fn) => { navigateRef.current = fn; }} />;
}
