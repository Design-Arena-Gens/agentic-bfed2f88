export const runtime = 'edge';

// In-memory rooms per Edge instance (sufficient for demo/live rooms)
const rooms: Map<string, Set<WebSocket>> = new Map();

function broadcast(room: string, data: string, except?: WebSocket) {
  const set = rooms.get(room);
  if (!set) return;
  for (const ws of set) {
    if (ws !== except && ws.readyState === ws.OPEN) {
      try { ws.send(data); } catch {}
    }
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const room = searchParams.get('room') || 'lobby';

  // @ts-ignore - WebSocketPair is available in Edge runtime
  const { 0: client, 1: server } = new (globalThis as any).WebSocketPair();

  server.accept();
  let set = rooms.get(room);
  if (!set) { set = new Set(); rooms.set(room, set); }
  set.add(server);

  server.addEventListener('message', (event: MessageEvent) => {
    const text = typeof event.data === 'string' ? event.data : '';
    broadcast(room, text, server);
  });

  server.addEventListener('close', () => {
    const s = rooms.get(room);
    if (s) { s.delete(server); if (s.size === 0) rooms.delete(room); }
  });

  return new Response(null as any, { status: 101, webSocket: client });
}
