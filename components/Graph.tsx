"use client";

/**
 * Graph component — mood and emotion charts using Recharts.
 * Clean, interactive, styled for the leather book theme.
 */

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from "recharts";
import type { JournalEntry } from "@/utils/storage";
import { getMoodChartData, getEmotionChartData, getEmotionRadarData, getActivityHeatmapData } from "@/utils/analytics";

interface GraphProps {
  readonly entries: JournalEntry[];
}

// Custom tooltip for the mood chart
function MoodTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; payload: { emotion: string } }>; label?: string }) {
  if (active && payload && payload.length) {
    return (
      <div className="chart-tooltip" style={{
        background: 'var(--leather-dark)',
        color: 'var(--paper-cream)',
        padding: '12px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
        border: '1px solid var(--leather-accent)'
      }}>
        <p className="chart-tooltip-date" style={{ margin: '0 0 4px', fontSize: '12px', opacity: 0.8 }}>{label}</p>
        <p className="chart-tooltip-mood" style={{ margin: '0 0 4px', fontWeight: 'bold' }}>
          Mood Score: <span style={{ color: 'var(--leather-accent)' }}>{payload[0].value}%</span>
        </p>
        <p className="chart-tooltip-emotion" style={{ margin: 0, textTransform: 'capitalize' }}>
          Primary feeling: {payload[0].payload.emotion}
        </p>
      </div>
    );
  }
  return null;
}

// Custom tooltip for the emotion bar chart
function EmotionTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: { emotion: string; count: number } }> }) {
  if (active && payload && payload.length) {
    return (
      <div className="chart-tooltip" style={{
        background: 'var(--leather-dark)',
        color: 'var(--paper-cream)',
        padding: '12px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
        border: '1px solid var(--leather-accent)'
      }}>
        <p className="chart-tooltip-emotion" style={{ margin: 0 }}>
          {payload[0].payload.emotion}: <strong style={{ color: 'var(--leather-accent)' }}>{payload[0].payload.count}</strong> entries
        </p>
      </div>
    );
  }
  return null;
}

// Custom tooltip for the emotion radar
function RadarTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: { emotion: string; value: number } }> }) {
  if (active && payload && payload.length) {
    return (
      <div className="chart-tooltip" style={{
        background: 'var(--leather-dark)',
        color: 'var(--paper-cream)',
        padding: '12px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
        border: '1px solid var(--leather-accent)'
      }}>
        <p style={{ margin: 0 }}>
          {payload[0].payload.emotion}: <strong style={{ color: 'var(--leather-accent)' }}>{payload[0].payload.value}%</strong>
        </p>
      </div>
    );
  }
  return null;
}

export default function Graph({ entries }: GraphProps) {
  const moodData = getMoodChartData(entries);
  const emotionData = getEmotionChartData(entries);
  const emotionRadarData = getEmotionRadarData(entries);
  const heatmapData = getActivityHeatmapData(entries);

  if (entries.length === 0) {
    return (
      <div className="graph-empty">
        <div className="graph-empty-icon">📊</div>
        <p>Your mood charts will appear here once you start journaling.</p>
        <p className="graph-empty-hint">Record your first entry to begin tracking!</p>
      </div>
    );
  }

  return (
    <div className="graph-container graph-bento">
      {/* Mood Over Time */}
      <div className="graph-section graph-card">
        <h3 className="graph-title">Mood Over Time</h3>
        <p className="graph-subtitle">
          How your overall sentiment has changed
        </p>
        <div className="graph-chart">
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={moodData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
              <defs>
                <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5A2B" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#8B5A2B" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="4 4"
                stroke="rgba(139, 90, 43, 0.2)"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12, fill: "#8B5A2B", fontWeight: 500 }}
                tickLine={false}
                tickMargin={12}
                axisLine={{ stroke: "rgba(139, 90, 43, 0.4)", strokeWidth: 2 }}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 12, fill: "#8B5A2B", fontWeight: 500 }}
                tickLine={false}
                tickMargin={12}
                axisLine={false}
                tickFormatter={(v: number) => `${v}%`}
              />
              <Tooltip content={<MoodTooltip />} cursor={{ stroke: 'rgba(139, 90, 43, 0.4)', strokeWidth: 2, strokeDasharray: '4 4' }} />
              <ReferenceLine y={50} stroke="rgba(139, 90, 43, 0.3)" strokeDasharray="3 3" />
              <Area
                type="monotone"
                dataKey="mood"
                stroke="#8B5A2B"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorMood)"
                activeDot={{ fill: "#F5E6D3", stroke: "#8B5A2B", strokeWidth: 3, r: 6 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Emotion Frequency */}
      <div className="graph-section graph-card">
        <h3 className="graph-title">Emotion Frequency</h3>
        <p className="graph-subtitle">
          Your most commonly experienced feelings
        </p>
        <div className="graph-chart">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={emotionData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
              <CartesianGrid
                strokeDasharray="4 4"
                stroke="rgba(139, 90, 43, 0.2)"
                vertical={false}
              />
              <XAxis
                dataKey="emotion"
                tick={{ fontSize: 12, fill: "#8B5A2B", fontWeight: 500 }}
                tickLine={false}
                tickMargin={12}
                axisLine={{ stroke: "rgba(139, 90, 43, 0.4)", strokeWidth: 2 }}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "#8B5A2B", fontWeight: 500 }}
                tickLine={false}
                tickMargin={12}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<EmotionTooltip />} cursor={{ fill: 'rgba(139, 90, 43, 0.05)' }} />
              <Bar 
                dataKey="count" 
                radius={[6, 6, 0, 0]} 
                maxBarSize={60}
                activeBar={{ stroke: '#8B5A2B', strokeWidth: 2 }}
              >
                {emotionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} fillOpacity={0.85} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Emotion Radar */}
      <div className="graph-section graph-card">
        <h3 className="graph-title">Emotion Balance Radar</h3>
        <p className="graph-subtitle">
          A quick view of how your emotions are distributed
        </p>
        <div className="graph-chart">
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={emotionRadarData} outerRadius="70%">
              <PolarGrid stroke="rgba(139, 90, 43, 0.2)" />
              <PolarAngleAxis
                dataKey="emotion"
                tick={{ fontSize: 11, fill: "#8B5A2B", fontWeight: 500 }}
              />
              <PolarRadiusAxis
                angle={30}
                domain={[0, 100]}
                tick={{ fontSize: 10, fill: "#8B5A2B" }}
                tickFormatter={(v: number) => `${v}%`}
              />
              <Radar
                name="Emotions"
                dataKey="value"
                stroke="#8B5A2B"
                fill="#8B5A2B"
                fillOpacity={0.25}
                strokeWidth={2}
              />
              <Tooltip content={<RadarTooltip />} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Activity Heatmap */}
      <div className="graph-section graph-card">
        <h3 className="graph-title">Journaling Heatmap</h3>
        <p className="graph-subtitle">
          Recent activity density over the last 4 weeks
        </p>
        <div className="heatmap-grid">
          {heatmapData.map((day) => (
            <div
              key={day.date}
              className={`heatmap-cell heatmap-level-${day.level}`}
              title={`${day.label}: ${day.count} ${day.count === 1 ? "entry" : "entries"}`}
            />
          ))}
        </div>
        <div className="heatmap-legend">
          <span className="heatmap-legend-label">Less</span>
          <div className="heatmap-legend-scale">
            {[0, 1, 2, 3, 4].map((level) => (
              <span key={level} className={`heatmap-cell heatmap-level-${level}`} />
            ))}
          </div>
          <span className="heatmap-legend-label">More</span>
        </div>
      </div>
    </div>
  );
}
