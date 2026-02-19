const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const cors = require('cors');
const ttsService = require('./ttsService');
const adminRoutes = require('./adminRoutes');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(cors());

// Admin routes - only for local development/management
if (process.env.NODE_ENV !== 'production') {
  app.use('/api/admin', adminRoutes);
}

// Serve Static Audio Files from Cache
// Route: /audio/:roomCode/:filename
app.use('/audio', express.static('/tmp/bamboozle_audio_cache', {
  setHeaders: (res) => {
    res.set('Access-Control-Allow-Origin', '*');
  }
}));

app.get('/', (req, res) => {
  res.send('Bamboozle server is running');
});

// Get server version
app.get('/api/version', (req, res) => {
  const packageJson = require('./package.json');
  res.json({ version: packageJson.version });
});

// Trigger TTS manually (fallback/test endpoint)
app.post('/api/tts', async (req, res) => {
  try {
    const { text, language, roomCode } = req.body;
    const result = await ttsService.getAudio(text, language || 'en', roomCode || 'test');
    res.json({ url: result.url, isHit: result.isHit });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

// Room management and game state
const rooms = {}; // { roomCode: { players: [], audience: [], state: {}, hostSocketId, pendingHostReconnect: boolean } }
const roomTimeouts = {}; // For empty room cleanup
const hostTimeouts = {}; // For host disconnection grace period
const playerTimeouts = {}; // For player disconnection tracking { `${roomCode}:${playerId}`: timeoutId }
const socketToPlayer = {}; // Map socket.id -> { roomCode, playerId }

function generateRoomCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('checkRoom', ({ roomCode }, callback) => {
    console.log(`[Server] checkRoom: ${roomCode} - Exists: ${!!rooms[roomCode]}`);
    if (callback) {
      callback({ exists: !!rooms[roomCode] });
    }
  });

  socket.on('createRoom', ({ hostId }, callback) => {
    const roomCode = generateRoomCode();

    // Clear any pending deletion for this room code (unlikely collision but safe)
    if (roomTimeouts[roomCode]) {
      clearTimeout(roomTimeouts[roomCode]);
      delete roomTimeouts[roomCode];
    }

    rooms[roomCode] = {
      hostSocketId: socket.id,
      hostId: hostId, // Track the host's player ID for reconnection
      pendingHostReconnect: false,
      players: {},
      audience: {},
      state: {
        roomCode,
        players: {},
        audience: {},
        phase: 'LOBBY',
        currentRound: 0,
        totalRounds: 3,
        emotes: []
      }
    };
    socket.join(roomCode);
    socket.data.roomCode = roomCode; // Track room for disconnect logic
    socket.data.isHost = true;
    callback(roomCode);
    console.log(`Room created: ${roomCode} with hostId: ${hostId}`);
  });

  socket.on('joinRoom', ({ roomCode, role, name, id }, callback) => {
    if (!rooms[roomCode]) {
      if (callback) callback({ error: 'Room not found' });
      return;
    }

    // Cancel room cleanup if room was pending deletion
    if (roomTimeouts[roomCode]) {
      clearTimeout(roomTimeouts[roomCode]);
      delete roomTimeouts[roomCode];
      console.log(`Room ${roomCode} deletion cancelled (user joined)`);
    }

    // Check if this is the original host reclaiming their room
    const isOriginalHost = rooms[roomCode].hostId === id;
    let becameHost = false;

    // Allow host to reclaim only if:
    // 1. They are the original host AND
    // 2. Room is pending reconnect (host actually disconnected)
    if (isOriginalHost && rooms[roomCode].pendingHostReconnect) {
      // Original host is reclaiming their room!
      if (hostTimeouts[roomCode]) {
        clearTimeout(hostTimeouts[roomCode]);
        delete hostTimeouts[roomCode];
      }
      rooms[roomCode].hostSocketId = socket.id;
      rooms[roomCode].pendingHostReconnect = false;
      socket.data.isHost = true;
      becameHost = true;
      console.log(`Original host ${id} reclaimed room ${roomCode}!`);

      // Notify other players that host has reconnected
      socket.to(roomCode).emit('hostReconnected');
    }

    // Cancel player timeout if player is reconnecting
    const playerKey = `${roomCode}:${id}`;
    if (playerTimeouts[playerKey]) {
      clearTimeout(playerTimeouts[playerKey]);
      delete playerTimeouts[playerKey];
      console.log(`Player ${id} reconnected to ${roomCode}. Kick cancelled.`);
    }

    socket.join(roomCode);
    socket.data.roomCode = roomCode; // Track room for disconnect logic

    // Track this socket -> player mapping for disconnect handling
    if (id) {
      socketToPlayer[socket.id] = { roomCode, playerId: id };
    }

    if (callback) callback({ success: true, state: rooms[roomCode].state, becameHost });
    console.log(`User ${name || 'Anonymous'} joined room ${roomCode} as ${role}${becameHost ? ' (reclaimed host)' : ''}`);
  });

  socket.on('gameStateUpdate', ({ roomCode, gameState }) => {
    if (rooms[roomCode]) {
      rooms[roomCode].state = gameState;
      // Broadcast to everyone in the room EXCEPT the sender (host)
      socket.to(roomCode).emit('gameStateUpdate', gameState);
    }
  });

  // Relay generic events from Host to All
  socket.on('hostEvent', ({ roomCode, event }) => {
    socket.to(roomCode).emit('hostEvent', event);
  });

  // --- TTS LOGIC ---
  socket.on('requestNarrator', async ({ roomCode, text, language, requestId }) => {
    try {
      console.log(`[TTS Req] Room: ${roomCode}, Text: "${text}", ReqId: ${requestId}`);
      // Only accept from Host (simple check via rooms map)
      if (!rooms[roomCode]) return; // Invalid room

      // Generate (or get from cache)
      const result = await ttsService.getAudio(text, language || 'en', roomCode);

      // Use GCS URL directly
      const audioUrl = result.url;

      // Broadcast to everyone ONLY if in Online Mode, otherwise only to Host (the sender)
      const isOnlineMode = rooms[roomCode].state && rooms[roomCode].state.isOnlineMode;

      if (isOnlineMode) {
        io.in(roomCode).emit('playAudio', {
          audioUrl,
          text,
          requestId,
          isHit: result.isHit,
          hash: null
        });
      } else {
        // Only back to host (sender)
        socket.emit('playAudio', {
          audioUrl,
          text,
          requestId,
          isHit: result.isHit,
          hash: null
        });
      }

    } catch (e) {
      console.error('Narrator Error:', e);
    }
  });

  socket.on('requestState', ({ roomCode }, callback) => {
    if (rooms[roomCode]) {
      if (callback) callback(rooms[roomCode].state);
    } else {
      if (callback) callback(null);
    }
  });

  // Relay events from players to host
  socket.on('playerEvent', ({ roomCode, event }) => {
    console.log('[Server] playerEvent in ' + roomCode + ': ' + event.type);
    socket.to(roomCode).emit('playerEvent', event);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);

    const roomCode = socket.data.roomCode;
    if (roomCode && rooms[roomCode]) {
      // Check if host disconnected
      if (rooms[roomCode].hostSocketId === socket.id) {
        console.log(`Host disconnected from ${roomCode}. Starting 60s grace period.`);
        rooms[roomCode].pendingHostReconnect = true;

        // Notify players that host disconnected (they can wait for reconnection)
        io.to(roomCode).emit('hostDisconnected');

        // Start 60 second grace period for host to reconnect
        hostTimeouts[roomCode] = setTimeout(() => {
          console.log(`Host did not reconnect to ${roomCode} within 60s. Closing room.`);
          io.to(roomCode).emit('roomClosed');

          // Clean up all player timeouts for this room
          Object.keys(playerTimeouts).forEach(key => {
            if (key.startsWith(`${roomCode}:`)) {
              clearTimeout(playerTimeouts[key]);
              delete playerTimeouts[key];
            }
          });

          delete rooms[roomCode];
          delete hostTimeouts[roomCode];
        }, 60000);

        return;
      }

      // Check if a tracked player disconnected
      const playerInfo = socketToPlayer[socket.id];
      if (playerInfo && playerInfo.roomCode === roomCode && playerInfo.playerId) {
        const playerId = playerInfo.playerId;
        const playerKey = `${roomCode}:${playerId}`;

        console.log(`Player ${playerId} disconnected from ${roomCode}. Starting 60s kick timer.`);

        // Notify the room about player disconnection
        io.to(roomCode).emit('playerDisconnected', { playerId });

        // Start 60 second timer to kick player
        playerTimeouts[playerKey] = setTimeout(() => {
          console.log(`Player ${playerId} did not reconnect to ${roomCode} within 60s. Kicking.`);
          io.to(roomCode).emit('playerKicked', { playerId });
          delete playerTimeouts[playerKey];
        }, 60000);

        delete socketToPlayer[socket.id];
        return;
      }

      // Clean up socket mapping
      delete socketToPlayer[socket.id];

      // Check if room is empty of human players
      const roomSockets = io.sockets.adapter.rooms.get(roomCode);
      const numClients = roomSockets ? roomSockets.size : 0;

      console.log(`User left ${roomCode}. Remaining connections: ${numClients}`);

      if (numClients === 0 && rooms[roomCode]) {
        console.log(`Room ${roomCode} empty. Starting 60s grace period.`);
        roomTimeouts[roomCode] = setTimeout(() => {
          console.log(`Closing room ${roomCode} due to inactivity.`);

          // Clean up all player timeouts for this room
          Object.keys(playerTimeouts).forEach(key => {
            if (key.startsWith(`${roomCode}:`)) {
              clearTimeout(playerTimeouts[key]);
              delete playerTimeouts[key];
            }
          });

          // TTS Cleanup
          ttsService.cleanupRoom(roomCode);

          delete rooms[roomCode];
          delete roomTimeouts[roomCode];
        }, 60000);
      }
    }
  });
});

