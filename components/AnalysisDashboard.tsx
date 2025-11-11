"use client";

import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { useMemo } from 'react';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

function getPuzzleStats() {
  const data = JSON.parse(localStorage.getItem('puzzleStats') || '{}');
  const entries = Object.entries<any>(data).sort((a, b) => a[0].localeCompare(b[0]));
  return entries.map(([date, v]) => ({ date, correct: v.correct || 0, wrong: v.wrong || 0 }));
}

function getDailyStats() {
  const games = JSON.parse(localStorage.getItem('dailyGames') || '[]');
  const byDate: Record<string, number> = {};
  for (const g of games) {
    const d = (g.createdAt || '').slice(0, 10);
    if (!d) continue;
    byDate[d] = (byDate[d] || 0) + 1;
  }
  return Object.entries(byDate).sort((a, b) => a[0].localeCompare(b[0])).map(([date, count]) => ({ date, count }));
}

export default function AnalysisDashboard() {
  const puzzle = useMemo(() => getPuzzleStats(), []);
  const daily = useMemo(() => getDailyStats(), []);

  const puzzleData = {
    labels: puzzle.map((p) => p.date),
    datasets: [
      { label: 'Correct', data: puzzle.map((p) => p.correct), borderColor: '#4f7cff', backgroundColor: 'rgba(79,124,255,0.3)' },
      { label: 'Wrong', data: puzzle.map((p) => p.wrong), borderColor: '#ff5c5c', backgroundColor: 'rgba(255,92,92,0.3)' },
    ],
  };

  const dailyData = {
    labels: daily.map((d) => d.date),
    datasets: [
      { label: 'New Daily Games', data: daily.map((d) => d.count), borderColor: '#4f7cff', backgroundColor: 'rgba(79,124,255,0.3)' },
    ],
  };

  const options = { responsive: true, plugins: { legend: { labels: { color: '#e6e8ef' } }, title: { display: false } }, scales: { x: { ticks: { color: '#9aa3b2' } }, y: { ticks: { color: '#9aa3b2' } } } } as const;

  return (
    <div className="grid cols-2">
      <div className="card">
        <h3 className="section-title">Puzzle Accuracy</h3>
        <Line data={puzzleData} options={options} />
      </div>
      <div className="card">
        <h3 className="section-title">Daily Games Created</h3>
        <Line data={dailyData} options={options} />
      </div>
    </div>
  );
}
