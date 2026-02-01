const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 3001;

app.get('/', (req, res) => {
  res.send('Bamboozle server is running');
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

// Room management and game state
const rooms = {}; // { roomCode: { players: [], audience: [], state: {} } }

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

  socket.on('createRoom', (callback) => {
    const roomCode = generateRoomCode();
    rooms[roomCode] = { 
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
    callback(roomCode);
    console.log(`Room created: ${roomCode}`);
  });

  socket.on('joinRoom', ({ roomCode, role, name, id }, callback) => {
    if (!rooms[roomCode]) {
      if (callback) callback({ error: 'Room not found' });
      return;
    }
    socket.join(roomCode);
    const user = { id: id || socket.id, name: name || 'Anonymous' };
    
    // We don't necessarily need to store players/audience separately here 
    // if the GameState is managed by the Host and synced.
    // But it's good for tracking connections.
    
    if (callback) callback({ success: true, state: rooms[roomCode].state });
    console.log(`User ${user.name} joined room ${roomCode} as ${role}`);
  });

  socket.on('gameStateUpdate', ({ roomCode, gameState }) => {
    if (rooms[roomCode]) {
      rooms[roomCode].state = gameState;
      // Broadcast to everyone in the room EXCEPT the sender (host)
      socket.to(roomCode).emit('gameStateUpdate', gameState);
    }
  });

  // Relay events from players to host
  socket.on('playerEvent', ({ roomCode, event }) => {
    console.log('[Server] playerEvent in ' + roomCode + ': ' + event.type);
    socket.to(roomCode).emit('playerEvent', event);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});
