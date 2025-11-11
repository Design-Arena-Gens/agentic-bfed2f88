import dynamic from 'next/dynamic';

const AnalysisDashboard = dynamic(() => import('@/components/AnalysisDashboard'), { ssr: false });

export default function AnalysisPage() {
  return (
    <div>
      <h1>Analysis</h1>
      <p className="muted">Insights from your puzzles and daily games.</p>
      <AnalysisDashboard />
    </div>
  );
}
