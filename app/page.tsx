import Link from 'next/link';

export default function Home() {
  return (
    <div className="grid">
      <section className="card">
        <h1>Agentic Chess</h1>
        <p className="muted">Play live and daily chess games, solve tactical puzzles, and analyze your performance.</p>
        <div className="row" style={{marginTop: 12}}>
          <Link className="btn" href="/live">Play Live</Link>
          <Link className="btn secondary" href="/daily">Daily Games</Link>
          <Link className="btn secondary" href="/puzzles">Puzzles</Link>
          <Link className="btn secondary" href="/analysis">Analysis</Link>
        </div>
      </section>

      <section className="grid cols-2">
        <div className="card">
          <h2 className="section-title">Live</h2>
          <p className="muted">Create a room and share the code to play in real-time.</p>
        </div>
        <div className="card">
          <h2 className="section-title">Daily</h2>
          <p className="muted">Take your time between moves. Your games are stored in your browser.</p>
        </div>
        <div className="card">
          <h2 className="section-title">Puzzles</h2>
          <p className="muted">Train with hand-curated tactics. Track accuracy and streaks.</p>
        </div>
        <div className="card">
          <h2 className="section-title">Analysis</h2>
          <p className="muted">View trends across your puzzles and games over time.</p>
        </div>
      </section>
    </div>
  );
}
