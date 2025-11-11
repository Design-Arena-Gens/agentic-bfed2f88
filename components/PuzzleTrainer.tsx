"use client";

import { useMemo, useRef, useState } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';

type Puzzle = { id: string; fen: string; best: string[]; title: string };

const PUZZLES: Puzzle[] = [
  { id: 'p1', title: 'Mate in 1', fen: '8/8/8/8/8/6k1/5pp1/6KQ w - - 0 1', best: ['Qxg2#'] },
  { id: 'p2', title: 'Fork tactic', fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/3P4/5N2/PPP1PPPP/RNBQKB1R w KQkq - 2 3', best: ['d5'] },
  { id: 'p3', title: 'Back rank', fen: '3r2k1/5ppp/8/8/8/8/5PPP/3R2K1 w - - 0 1', best: ['Rxd8#'] },
];

function sanToMove(san: string, game: Chess) {
  const legal = game.moves({ verbose: true }) as any[];
  const found = legal.find((m) => m.san.replace('+', '').replace('#', '') === san.replace('+', '').replace('#', ''));
  if (!found) return null;
  return { from: found.from, to: found.to, promotion: found.promotion };
}

export default function PuzzleTrainer() {
  const [idx, setIdx] = useState(0);
  const [result, setResult] = useState<string | null>(null);
  const gameRef = useRef(new Chess(PUZZLES[0].fen));
  const [fen, setFen] = useState(PUZZLES[0].fen);
  const [streak, setStreak] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const puzzle = PUZZLES[idx];

  function loadPuzzle(i: number) {
    const p = PUZZLES[i];
    gameRef.current = new Chess(p.fen);
    setFen(p.fen);
    setResult(null);
  }

  function onDrop(from: string, to: string) {
    if (result) return false;
    const g = gameRef.current;
    const move = g.move({ from, to, promotion: 'q' });
    if (!move) return false;
    setFen(g.fen());
    setAttempts((a) => a + 1);
    const isBest = puzzle.best.some((san) => sanToMove(san, new Chess(puzzle.fen))?.from === from && sanToMove(san, new Chess(puzzle.fen))?.to === to);
    if (isBest) {
      setResult('Correct');
      setStreak((s) => s + 1);
      const stats = JSON.parse(localStorage.getItem('puzzleStats') || '{}');
      const today = new Date().toISOString().slice(0, 10);
      stats[today] = stats[today] || { correct: 0, wrong: 0 };
      stats[today].correct += 1;
      localStorage.setItem('puzzleStats', JSON.stringify(stats));
    } else {
      setResult('Try again');
      setStreak(0);
      const stats = JSON.parse(localStorage.getItem('puzzleStats') || '{}');
      const today = new Date().toISOString().slice(0, 10);
      stats[today] = stats[today] || { correct: 0, wrong: 0 };
      stats[today].wrong += 1;
      localStorage.setItem('puzzleStats', JSON.stringify(stats));
    }
    return true;
  }

  const boardOrientation = useMemo(() => (new Chess(puzzle.fen).turn() === 'w' ? 'white' as const : 'black' as const), [puzzle.fen]);

  return (
    <div className="grid cols-2">
      <div className="card">
        <h3 className="section-title">{puzzle.title}</h3>
        <div style={{ maxWidth: 520 }}>
          <Chessboard position={fen} onPieceDrop={(s, t) => onDrop(s, t)} boardOrientation={boardOrientation} />
        </div>
        <div className="row" style={{ marginTop: 12 }}>
          <button className="btn secondary" onClick={() => { loadPuzzle(idx); }}>Reset</button>
          <button className="btn" onClick={() => { const ni = (idx + 1) % PUZZLES.length; setIdx(ni); loadPuzzle(ni); }}>Next</button>
        </div>
        <p className="muted" style={{ marginTop: 8 }}>{result ?? 'Find the best move'}</p>
      </div>

      <div className="card">
        <h3 className="section-title">Stats</h3>
        <p>Streak: <b>{streak}</b></p>
        <p>Attempts: <b>{attempts}</b></p>
        <p className="muted">More puzzles coming soon.</p>
      </div>
    </div>
  );
}
