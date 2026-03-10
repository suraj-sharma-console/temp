import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";

const app = express();
app.use(cors());
app.get("/health", (_, res) => res.json({ ok: true }));

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

const waitingQueue = [];
const activeRooms = new Map();

function tryMatch() {
  while (waitingQueue.length >= 2) {
    const a = waitingQueue.shift();
    const b = waitingQueue.shift();
    if (!a || !b) return;

    const roomId = `room_${a.userId}_${b.userId}_${Date.now()}`;
    activeRooms.set(roomId, [a.socketId, b.socketId]);

    io.to(a.socketId).emit("match_found", { roomId, peerId: b.userId });
    io.to(b.socketId).emit("match_found", { roomId, peerId: a.userId });
  }
}

io.on("connection", (socket) => {
  socket.on("find_match", ({ userId }) => {
    const alreadyQueued = waitingQueue.some((u) => u.socketId === socket.id);
    if (!alreadyQueued) {
      waitingQueue.push({ socketId: socket.id, userId });
      tryMatch();
    }
  });

  socket.on("join_room", ({ roomId }) => {
    socket.join(roomId);
  });

  // WebRTC signaling pass-through
  socket.on("webrtc_offer", ({ roomId, offer }) => {
    socket.to(roomId).emit("webrtc_offer", { offer });
  });

  socket.on("webrtc_answer", ({ roomId, answer }) => {
    socket.to(roomId).emit("webrtc_answer", { answer });
  });

  socket.on("webrtc_ice_candidate", ({ roomId, candidate }) => {
    socket.to(roomId).emit("webrtc_ice_candidate", { candidate });
  });

  socket.on("leave_room", ({ roomId }) => {
    socket.leave(roomId);
    socket.to(roomId).emit("peer_left");
    activeRooms.delete(roomId);
  });

  socket.on("disconnect", () => {
    const idx = waitingQueue.findIndex((u) => u.socketId === socket.id);
    if (idx !== -1) waitingQueue.splice(idx, 1);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Signaling server running on http://localhost:${PORT}`);
});
