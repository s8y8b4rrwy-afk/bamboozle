# Online Multiplayer Implementation Plan for Bamboozle

## Goal
Take Bamboozle online with a backend service to handle rooms, codes, player/audience state, and real-time communication.

## Technology Stack
- **Backend:** Node.js + Express + Socket.IO
- **Frontend:** Connects to backend via Socket.IO (WebSockets)

## Steps

### 1. Backend Setup
- Create a new folder `server/` for backend code.
- Initialize Node.js project (`npm init -y`).
- Install dependencies: `express`, `socket.io`.
- Implement server logic:
  - Room creation and management (with codes)
  - Player and audience join/leave
  - Game state management per room
  - Real-time events for game actions (ready, start, submit lie, vote, etc.)

### 2. Frontend Integration
- Replace `BroadcastChannel` logic with Socket.IO client.
- Connect to backend server using room code.
- Emit and listen for game events (join, ready, start, etc.)
- Update UI based on real-time state from backend.

### 3. Game Flow Changes
- On host/player/audience join: emit join event to backend.
- On game actions (ready, start, submit, vote): emit corresponding events.
- Backend updates state and broadcasts to all clients in the room.

### 4. Deployment
- Deploy backend to a cloud service (Heroku, Vercel, Render, etc.).
- Update frontend to use deployed backend URL.

## Next Steps
- Scaffold backend server code in `server/`.
- Update frontend game service to use Socket.IO.
- Test with multiple devices/browsers.

---
*This plan provides a simple, scalable way to take Bamboozle online with real-time multiplayer support.*
