"use client";

/**
 * RecordPage — Voice recording page with MicButton,
 * init status, and latest entry preview.
 */

import MicButton from "@/components/MicButton";
import type { JournalEntry } from "@/utils/storage";

interface RecordPageProps {
  readonly entriesSorted: JournalEntry[];
  readonly initError: string | null;
  readonly isInitializing: boolean;
  readonly modelsReady: boolean;
  readonly onNewEntry: (entry: JournalEntry) => void;
  readonly onUpdateEntry: (entry: JournalEntry) => void;
}

export default function RecordPage({
  entriesSorted,
  initError,
  isInitializing,
  modelsReady,
  onNewEntry,
  onUpdateEntry,
}: RecordPageProps) {
  return (
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

        <MicButton onNewEntry={onNewEntry} onUpdateEntry={onUpdateEntry} modelsReady={modelsReady} />

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
  );
}
