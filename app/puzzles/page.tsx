import dynamic from 'next/dynamic';

const PuzzleTrainer = dynamic(() => import('@/components/PuzzleTrainer'), { ssr: false });

export default function PuzzlesPage() {
  return (
    <div>
      <h1>Puzzles</h1>
      <p className="muted">Solve curated tactical positions. Track your streak and accuracy over time.</p>
      <PuzzleTrainer />
    </div>
  );
}
