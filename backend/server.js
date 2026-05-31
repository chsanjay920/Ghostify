require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [process.env.CLIENT_ORIGIN || 'http://localhost:4200'],
    methods: ['GET', 'POST']
  }
});

app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:4200' }));
app.get('/status', (req, res) => {
  res.json({ status: 'ok' });

});

// Health check endpoint - returns runtime status and basic metrics
app.get('/health', (req, res) => {
  try {
    const memory = process.memoryUsage();
    const roomsCount = rooms.size;
    const participants = Array.from(rooms.values()).reduce((acc, r) => acc + (r.participants ? r.participants.length : 0), 0);

    res.json({
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      rooms: roomsCount,
      participants,
      memory
    });
  } catch (err) {
    res.status(500).json({ status: 'error', error: String(err) });
  }
});


const rooms = new Map();

function generateRoomCode() {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i += 1) {
    code += letters.charAt(Math.floor(Math.random() * letters.length));
  }

  if (rooms.has(code)) {
    return generateRoomCode();
  }

  return code;
}

function buildRoomPayload(room) {
  return {
    code: room.code,
    name: room.name,
    participants: room.participants.map((participant) => ({
      userName: participant.userName
    })),
    messages: room.messages
  };
}

function sendRoomUpdate(room) {
  const payload = buildRoomPayload(room);
  io.to(room.code).emit('room-data', payload);
}

function removeFromRoom(socket) {
  const roomCode = socket.data.roomCode;
  const userName = socket.data.userName;
  if (!roomCode || !rooms.has(roomCode)) {
    return;
  }

  const room = rooms.get(roomCode);
  room.participants = room.participants.filter((p) => p.socketId !== socket.id);
  socket.leave(roomCode);

  if (room.participants.length === 0) {
    rooms.delete(roomCode);
    return;
  }

  const leaveMessage = {
    sender: 'System',
    text: `${userName || 'A user'} left the room.`,
    time: new Date().toISOString()
  };
  room.messages.push(leaveMessage);
  sendRoomUpdate(room);
}

io.on('connection', (socket) => {
  socket.on('create-room', (payload, callback) => {
    const userName = String(payload.userName || '').trim();
    const roomName = String(payload.roomName || 'Simple Chat').trim() || 'Simple Chat';

    if (!userName) {
      return callback({ error: 'Your name is required.' });
    }

    const code = generateRoomCode();
    const room = {
      code,
      name: roomName,
      participants: [
        {
          socketId: socket.id,
          userName
        }
      ],
      messages: [
        {
          sender: 'System',
          text: `${userName} created the room.`,
          time: new Date().toISOString()
        }
      ]
    };

    rooms.set(code, room);
    socket.data.roomCode = code;
    socket.data.userName = userName;
    socket.join(code);

    const response = buildRoomPayload(room);
    callback({ room: response });
    sendRoomUpdate(room);
  });

  socket.on('join-room', (payload, callback) => {
    const userName = String(payload.userName || '').trim();
    const roomCode = String(payload.roomCode || '').trim().toUpperCase();

    if (!userName) {
      return callback({ error: 'Your name is required.' });
    }

    if (!roomCode || !rooms.has(roomCode)) {
      return callback({ error: 'Room not found.' });
    }

    const room = rooms.get(roomCode);
    room.participants.push({ socketId: socket.id, userName });
    socket.data.roomCode = roomCode;
    socket.data.userName = userName;
    socket.join(roomCode);

    const joinMessage = {
      sender: 'System',
      text: `${userName} joined the room.`,
      time: new Date().toISOString()
    };
    room.messages.push(joinMessage);

    const response = buildRoomPayload(room);
    callback({ room: response });
    sendRoomUpdate(room);
  });

  socket.on('send-message', (payload, callback) => {
    const roomCode = String(payload.roomCode || '').trim().toUpperCase();
    const text = String(payload.text || '').trim();
    const userName = socket.data.userName;

    if (!roomCode || !rooms.has(roomCode)) {
      return callback && callback({ error: 'Room not found.' });
    }

    if (!text) {
      return callback && callback({ error: 'Message cannot be empty.' });
    }

    const room = rooms.get(roomCode);
    const message = {
      sender: userName || 'Guest',
      text,
      time: new Date().toISOString()
    };

    room.messages.push(message);
    io.to(roomCode).emit('new-message', message);
    sendRoomUpdate(room);
    callback && callback({ ok: true });
  });

  socket.on('leave-room', (payload, callback) => {
    removeFromRoom(socket);
    callback && callback({ ok: true });
  });

  socket.on('disconnect', () => {
    removeFromRoom(socket);
  });
});

if (!process.env.VERCEL) {
  const port = process.env.PORT || 3000;
  server.listen(port, () => {
    console.log(`Chat backend listening on http://localhost:${port}`);
  });
}

module.exports = app;
