import LiveGame from '@/components/LiveGame';

export default function LivePage() {
  return (
    <div>
      <h1>Live Game</h1>
      <p className="muted">Create or join a room to play instantly. Moves and chat sync in real time.</p>
      <LiveGame />
    </div>
  );
}
