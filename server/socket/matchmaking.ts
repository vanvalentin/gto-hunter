import type { Server, Socket } from 'socket.io';

interface QueueEntry {
  socketId: string;
  userId: string;
  username: string;
  elo: number;
  skinId: string;
}

interface GameRoom {
  roomId: string;
  player1: QueueEntry;
  player2: QueueEntry;
  scenario: HandScenario;
  decisions: Map<string, string>;
  timer?: ReturnType<typeof setTimeout>;
}

interface HandScenario {
  communityCards: { rank: string; suit: string }[];
  heroHand: { rank: string; suit: string }[];
  pot: number;
  oppBet: number;
  optimalDecision: string;
  evTable: Record<string, number>;
}

const SCENARIOS: HandScenario[] = [
  {
    communityCards: [{ rank: 'K', suit: 's' }, { rank: '10', suit: 'h' }, { rank: '4', suit: 'c' }],
    heroHand: [{ rank: 'A', suit: 'h' }, { rank: 'Q', suit: 'h' }],
    pot: 24,
    oppBet: 12,
    optimalDecision: 'call',
    evTable: { call: 2.15, raise: -0.5, fold: -1.2 },
  },
  {
    communityCards: [{ rank: 'A', suit: 'd' }, { rank: '7', suit: 'h' }, { rank: '2', suit: 'c' }],
    heroHand: [{ rank: 'K', suit: 's' }, { rank: 'K', suit: 'd' }],
    pot: 30,
    oppBet: 15,
    optimalDecision: 'raise',
    evTable: { raise: 5.4, call: 1.2, fold: -2.0 },
  },
  {
    communityCards: [{ rank: 'J', suit: 'c' }, { rank: '9', suit: 'h' }, { rank: '3', suit: 's' }],
    heroHand: [{ rank: 'Q', suit: 'c' }, { rank: '10', suit: 'c' }],
    pot: 20,
    oppBet: 10,
    optimalDecision: 'call',
    evTable: { call: 1.8, raise: 0.3, fold: -1.5 },
  },
];

const queue: QueueEntry[] = [];
const activeRooms = new Map<string, GameRoom>();

export function setupMatchmaking(io: Server) {
  io.on('connection', (socket: Socket) => {
    console.log(`[Socket] Connected: ${socket.id}`);

    socket.on('join_queue', (data: { userId: string; username: string; elo: number; skinId: string }) => {
      const existing = queue.findIndex((e) => e.userId === data.userId);
      if (existing !== -1) queue.splice(existing, 1);

      const entry: QueueEntry = { socketId: socket.id, ...data };
      queue.push(entry);
      socket.emit('queue_joined', { position: queue.length });

      tryMatch(io);
    });

    socket.on('submit_decision', ({ roomId, decision }: { roomId: string; decision: string }) => {
      const room = activeRooms.get(roomId);
      if (!room) return;

      const playerId = room.player1.socketId === socket.id ? room.player1.userId : room.player2.userId;
      room.decisions.set(playerId, decision);

      const opponent = room.player1.socketId === socket.id ? room.player2 : room.player1;
      io.to(opponent.socketId).emit('opponent_decided');

      if (room.decisions.size === 2) {
        if (room.timer) clearTimeout(room.timer);
        resolveRound(io, room);
      }
    });

    socket.on('leave_queue', () => {
      const idx = queue.findIndex((e) => e.socketId === socket.id);
      if (idx !== -1) queue.splice(idx, 1);
    });

    socket.on('disconnect', () => {
      const idx = queue.findIndex((e) => e.socketId === socket.id);
      if (idx !== -1) queue.splice(idx, 1);
      console.log(`[Socket] Disconnected: ${socket.id}`);
    });
  });
}

function tryMatch(io: Server) {
  if (queue.length < 2) return;

  queue.sort((a, b) => a.elo - b.elo);

  for (let i = 0; i < queue.length - 1; i++) {
    const a = queue[i];
    const b = queue[i + 1];
    if (Math.abs(a.elo - b.elo) <= 400) {
      queue.splice(i, 2);
      createMatch(io, a, b);
      return;
    }
  }

  if (queue.length >= 2) {
    const [a, b] = queue.splice(0, 2);
    createMatch(io, a, b);
  }
}

function createMatch(io: Server, p1: QueueEntry, p2: QueueEntry) {
  const roomId = `room-${Date.now()}`;
  const scenario = SCENARIOS[Math.floor(Math.random() * SCENARIOS.length)];

  const room: GameRoom = {
    roomId,
    player1: p1,
    player2: p2,
    scenario,
    decisions: new Map(),
  };

  activeRooms.set(roomId, room);

  const matchData = (player: QueueEntry, opponent: QueueEntry) => ({
    roomId,
    opponent: { username: opponent.username, elo: opponent.elo, skinId: opponent.skinId },
  });

  io.to(p1.socketId).emit('match_found', matchData(p1, p2));
  io.to(p2.socketId).emit('match_found', matchData(p2, p1));

  setTimeout(() => {
    io.to(p1.socketId).emit('deal_hand', { scenario });
    io.to(p2.socketId).emit('deal_hand', { scenario });

    room.timer = setTimeout(() => {
      if (!room.decisions.has(p1.userId)) room.decisions.set(p1.userId, 'fold');
      if (!room.decisions.has(p2.userId)) room.decisions.set(p2.userId, 'fold');
      resolveRound(io, room);
    }, 20000);
  }, 3000);
}

function resolveRound(io: Server, room: GameRoom) {
  const { player1, player2, scenario, decisions, roomId } = room;
  const d1 = decisions.get(player1.userId) ?? 'fold';
  const d2 = decisions.get(player2.userId) ?? 'fold';
  const ev1 = scenario.evTable[d1] ?? -2;
  const ev2 = scenario.evTable[d2] ?? -2;
  const p1Won = ev1 > ev2;

  const result = (pDec: string, pEV: number, oDec: string, oEV: number, won: boolean) => ({
    playerDecision: pDec,
    playerEV: pEV,
    opponentDecision: oDec,
    opponentEV: oEV,
    playerWon: won,
    optimalDecision: scenario.optimalDecision,
  });

  io.to(player1.socketId).emit('round_result', result(d1, ev1, d2, ev2, p1Won));
  io.to(player2.socketId).emit('round_result', result(d2, ev2, d1, ev1, !p1Won));

  setTimeout(() => {
    io.to(player1.socketId).emit('game_over', { winner: p1Won ? player1.username : player2.username });
    io.to(player2.socketId).emit('game_over', { winner: p1Won ? player1.username : player2.username });
    activeRooms.delete(roomId);
  }, 5000);
}
