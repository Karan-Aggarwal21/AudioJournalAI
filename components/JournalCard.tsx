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
    <article className="journal-card" id={`entry-${entry.id}`}>
      <div className="journal-card-header">
        <div className="journal-card-date">
          <span className="journal-card-day">{formattedDate}</span>
          <span className="journal-card-time">{formattedTime}</span>
        </div>
        <div className="journal-card-badges">
          <span className={`journal-card-sentiment ${sentimentClass}`}>
            {entry.sentiment}
          </span>
          <span className="journal-card-emotion" title={entry.emotion}>
            {getEmotionEmoji(entry.emotion)} {entry.emotion}
          </span>
        </div>
      </div>

      <div className="journal-card-rule" />

      <p className="journal-card-text">{entry.text}</p>

      {entry.keywords.length > 0 && (
        <div className="journal-card-keywords">
          {entry.keywords.map((kw) => (
            <span key={kw} className="journal-card-keyword">
              {kw}
            </span>
          ))}
        </div>
      )}

      {entry.topics.length > 0 && (
        <div className="journal-card-topics">
          {entry.topics.map((t) => (
            <span key={t} className="journal-card-topic">
              📌 {t}
            </span>
          ))}
        </div>
      )}

      {onDelete && (
        <button
          className="journal-card-delete"
          onClick={() => onDelete(entry.id)}
          aria-label="Delete entry"
        >
          ×
        </button>
      )}
    </article>
  );
}
