"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';

function makeWsUrl(room: string) {
  if (typeof window === 'undefined') return '';
  const proto = window.location.protocol === 'https:' ? 'wss' : 'ws';
  return `${proto}://${window.location.host}/api/ws?room=${encodeURIComponent(room)}`;
}

type Message =
  | { type: 'move'; from: string; to: string; promotion?: string }
  | { type: 'reset' }
  | { type: 'chat'; text: string }
  | { type: 'sync'; fen: string };

export default function LiveGame({ initialRoom }: { initialRoom?: string }) {
  const [room, setRoom] = useState(initialRoom || '');
  const [connected, setConnected] = useState(false);
  const [color, setColor] = useState<'white' | 'black'>('white');
  const [status, setStatus] = useState<string>('');
  const [chatInput, setChatInput] = useState('');
  const [chat, setChat] = useState<string[]>([]);

  const chessRef = useRef(new Chess());
  const [fen, setFen] = useState(chessRef.current.fen());
  const wsRef = useRef<WebSocket | null>(null);

  const canMove = useMemo(() => {
    const turn = chessRef.current.turn() === 'w' ? 'white' : 'black';
    return turn === color;
  }, [fen, color]);

  function connect() {
    if (!room) return;
    const url = makeWsUrl(room);
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.addEventListener('open', () => {
      setConnected(true);
      ws.send(JSON.stringify({ type: 'sync', fen: chessRef.current.fen() } as Message));
      setStatus('Connected');
    });

    ws.addEventListener('close', () => {
      setConnected(false);
      setStatus('Disconnected');
    });

    ws.addEventListener('message', (ev) => {
      try {
        const msg = JSON.parse(ev.data) as Message;
        if (msg.type === 'move') {
          const res = chessRef.current.move({ from: msg.from, to: msg.to, promotion: msg.promotion as any });
          if (res) setFen(chessRef.current.fen());
        } else if (msg.type === 'reset') {
          chessRef.current.reset();
          setFen(chessRef.current.fen());
        } else if (msg.type === 'chat') {
          setChat((c) => [...c, msg.text]);
        } else if (msg.type === 'sync') {
          // take opponent's fen if our game is fresh
          if (chessRef.current.history().length === 0) {
            try { chessRef.current.load(msg.fen); setFen(chessRef.current.fen()); } catch {}
          }
        }
        updateStatus();
      } catch {}
    });
  }

  function updateStatus() {
    const game = chessRef.current;
    if (game.isCheckmate()) setStatus('Checkmate');
    else if (game.isDraw()) setStatus('Draw');
    else if (game.isCheck()) setStatus('Check');
    else setStatus(`${game.turn() === 'w' ? 'White' : 'Black'} to move`);
  }

  function onDrop(from: string, to: string) {
    const game = chessRef.current;
    if (!canMove) return false;
    const move = game.move({ from, to, promotion: 'q' });
    if (move == null) return false;
    setFen(game.fen());
    updateStatus();
    wsRef.current?.send(JSON.stringify({ type: 'move', from, to, promotion: 'q' } satisfies Message));
    return true;
  }

  function resetGame() {
    chessRef.current.reset();
    setFen(chessRef.current.fen());
    wsRef.current?.send(JSON.stringify({ type: 'reset' } satisfies Message));
    updateStatus();
  }

  useEffect(() => { updateStatus(); }, []);

  return (
    <div className="grid cols-2">
      <div className="card">
        <div className="row" style={{ marginBottom: 12 }}>
          <input className="input" placeholder="Room code"
            value={room} onChange={(e) => setRoom(e.target.value)} />
          <select className="input" value={color} onChange={(e) => setColor(e.target.value as any)}>
            <option value="white">White</option>
            <option value="black">Black</option>
          </select>
          <button className="btn" onClick={connect} disabled={connected || !room}>Connect</button>
          <button className="btn secondary" onClick={resetGame}>Reset</button>
        </div>
        <div className="muted" style={{marginBottom: 8}}>{connected ? 'Connected' : 'Not connected'} ? {status}</div>
        <div style={{ maxWidth: 520 }}>
          <Chessboard position={fen} boardOrientation={color}
            onPieceDrop={(s, t) => onDrop(s, t)} arePiecesDraggable={canMove} />
        </div>
      </div>

      <div className="card">
        <h3 className="section-title">Room Chat</h3>
        <div style={{height: 360, overflow: 'auto', border: '1px solid var(--border)', borderRadius: 8, padding: 8, marginBottom: 8}}>
          {chat.map((c, i) => (
            <div key={i} className="muted">{c}</div>
          ))}
        </div>
        <div className="row">
          <input className="input" placeholder="Message" value={chatInput} onChange={(e) => setChatInput(e.target.value)} />
          <button className="btn" onClick={() => {
            const text = chatInput.trim();
            if (!text) return;
            setChatInput('');
            setChat((c) => [...c, `You: ${text}`]);
            wsRef.current?.send(JSON.stringify({ type: 'chat', text } satisfies Message));
          }}>Send</button>
        </div>
        <p className="muted" style={{marginTop: 8}}>Share the room code to play together in real time.</p>
      </div>
    </div>
  );
}
