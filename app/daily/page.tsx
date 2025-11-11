import dynamic from 'next/dynamic';

const DailyGames = dynamic(() => import('@/components/DailyGames'), { ssr: false });

export default function DailyPage() {
  return (
    <div>
      <h1>Daily Games</h1>
      <p className="muted">Play correspondence chess saved in your browser. Share via import/export code.</p>
      <DailyGames />
    </div>
  );
}
