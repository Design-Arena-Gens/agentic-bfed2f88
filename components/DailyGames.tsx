"use client";

import { useEffect, useMemo, useState } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';

type SavedGame = {
  id: string;
  createdAt: string;
  fen: string;
  history: string[];
  name: string;
};

function loadGames(): SavedGame[] {
  try { return JSON.parse(localStorage.getItem('dailyGames') || '[]'); } catch { return []; }
}
function saveGames(games: SavedGame[]) {
  localStorage.setItem('dailyGames', JSON.stringify(games));
}

export default function DailyGames() {
  const [games, setGames] = useState<SavedGame[]>([]);
  const [selected, setSelected] = useState<string | null>(null);

  const current = useMemo(() => games.find((g) => g.id === selected) || null, [games, selected]);
  const [fen, setFen] = useState<string>('start');
  const [status, setStatus] = useState<string>('');

  useEffect(() => { setGames(loadGames()); }, []);
  useEffect(() => { if (current) setFen(current.fen); }, [current?.id]);

  function createGame() {
    const id = Math.random().toString(36).slice(2, 9);
    const g: SavedGame = { id, createdAt: new Date().toISOString(), fen: new Chess().fen(), history: [], name: `Game ${id}` };
    const updated = [g, ...games];
    setGames(updated); saveGames(updated); setSelected(id);
  }

  function onDrop(from: string, to: string) {
    if (!current) return false;
    const game = new Chess(current.fen);
    const move = game.move({ from, to, promotion: 'q' });
    if (!move) return false;
    const newFen = game.fen();
    const updated = games.map((g) => g.id === current.id ? { ...g, fen: newFen, history: [...g.history, move.san] } : g);
    setGames(updated); saveGames(updated); setFen(newFen);
    updateStatus(game);
    return true;
  }

  function updateStatus(game: Chess) {
    if (game.isCheckmate()) setStatus('Checkmate');
    else if (game.isDraw()) setStatus('Draw');
    else if (game.isCheck()) setStatus('Check');
    else setStatus(`${game.turn() === 'w' ? 'White' : 'Black'} to move`);
  }

  function exportGame(g: SavedGame) {
    const data = btoa(JSON.stringify(g));
    navigator.clipboard.writeText(data);
    alert('Game copied. Share this code with your opponent for correspondence play.');
  }

  function importGame() {
    const code = prompt('Paste game code:');
    if (!code) return;
    try {
      const g = JSON.parse(atob(code)) as SavedGame;
      const exists = games.some((x) => x.id === g.id);
      const updated = exists ? games.map((x) => (x.id === g.id ? g : x)) : [g, ...games];
      setGames(updated); saveGames(updated); setSelected(g.id);
    } catch {
      alert('Invalid game code');
    }
  }

  return (
    <div className="grid cols-2">
      <div className="card">
        <div className="row" style={{ marginBottom: 12 }}>
          <button className="btn" onClick={createGame}>New Game</button>
          <button className="btn secondary" onClick={importGame}>Import</button>
          {current && <button className="btn secondary" onClick={() => exportGame(current)}>Share</button>}
        </div>
        {current ? (
          <>
            <div style={{ maxWidth: 520 }}>
              <Chessboard position={fen} onPieceDrop={(s, t) => onDrop(s, t)} />
            </div>
            <p className="muted" style={{ marginTop: 8 }}>{status}</p>
          </>
        ) : (
          <p className="muted">Select or create a game to begin.</p>
        )}
      </div>

      <div className="card">
        <h3 className="section-title">Your Games</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {games.map((g) => (
            <button key={g.id} className="btn secondary" onClick={() => setSelected(g.id)} style={{ justifyContent: 'space-between', display: 'flex' }}>
              <span>{g.name}</span>
              <span className="muted">{new Date(g.createdAt).toLocaleString()}</span>
            </button>
          ))}
          {games.length === 0 && <p className="muted">No saved games yet.</p>}
        </div>
      </div>
    </div>
  );
}
