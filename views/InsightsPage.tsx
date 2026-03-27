"use client";

/**
 * InsightsPage — Mood graphs, emotion charts, and weekly insights.
 */

import Graph from "@/components/Graph";
import type { JournalEntry } from "@/utils/storage";
import type { WeeklyInsight } from "@/utils/analytics";

interface InsightsPageProps {
  readonly entriesSorted: JournalEntry[];
  readonly insight: WeeklyInsight;
}

export default function InsightsPage({ entriesSorted, insight }: InsightsPageProps) {
  return (
    <div className="page-insights-nebula">
      <div className="glass-board-nebula">
        <div className="insights-header-glass">
          <div className="insights-header-text">
            <h2 className="solidified-light-title">Insights &amp; Graphs</h2>
            <p className="glowing-numbers-text">{insight.period}</p>
          </div>
          
          <div className="light-vine-structure">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v2" />
              <path d="m4.93 4.93 1.41 1.41" />
              <path d="M2 12h2" />
              <path d="m4.93 19.07 1.41-1.41" />
              <path d="M12 20v2" />
              <path d="m17.66 17.66 1.41 1.41" />
              <path d="M20 12h2" />
              <path d="m17.66 6.34 1.41-1.41" />
              <path d="M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10z" />
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
  );
}
