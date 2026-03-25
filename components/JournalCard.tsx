"use client";

/**
 * JournalCard — displays a single journal entry as a handwritten note on aged paper.
 */

import type { JournalEntry } from "@/utils/storage";
import { getEmotionEmoji } from "@/utils/emotionMapper";

interface JournalCardProps {
  readonly entry: JournalEntry;
  readonly onDelete?: (id: string) => void;
}

export default function JournalCard({ entry, onDelete }: JournalCardProps) {
  const date = new Date(entry.timestamp);
  const formattedDate = date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const formattedTime = date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const sentimentClass =
    entry.sentiment === "positive"
      ? "sentiment-positive"
      : entry.sentiment === "negative"
        ? "sentiment-negative"
        : "sentiment-neutral";

  return (
    <article className="glass-shard-card" id={`entry-${entry.id}`}>
      <div className="glass-shard-header">
        <div className="glass-shard-date">
          <span className="glass-shard-day">{formattedDate}</span>
          <span className="glass-shard-time">{formattedTime}</span>
        </div>
        <div className="glass-shard-badges">
          <span className="glass-prism-tag glass-prism-sentiment">
            {entry.sentiment?.toUpperCase() || "NEUTRAL"}
          </span>
          <span className="glass-prism-tag glass-prism-emotion" title={entry.emotion}>
            <span className="jewel-emoji">{getEmotionEmoji(entry.emotion)}</span> {entry.emotion || "neutral"}
          </span>
          {onDelete && (
            <button
              className="fractal-delete-btn"
              onClick={() => onDelete(entry.id)}
              aria-label="Delete entry"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                <path d="M17 21v-8H7v8" />
                <path d="M7 3v5h8" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className="swirling-light-text-container">
        <p className="swirling-light-text">{entry.text}</p>
      </div>

      {entry.keywords.length > 0 && (
        <div className="crystallized-tags">
          {entry.keywords.map((kw) => (
            <span key={kw} className="crystallized-tag">
              {kw}
            </span>
          ))}
        </div>
      )}

      {entry.topics.length > 0 && (
        <div className="crystallized-tags topics">
          {entry.topics.map((t) => (
            <span key={t} className="crystallized-tag topic-tag">
              📌 {t}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}
