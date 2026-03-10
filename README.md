# StrangerTalk (Android) — Anonymous Chat + Voice Calls

This repository contains a practical starter blueprint to build an Android app where strangers can:

1. get matched randomly,
2. chat in text,
3. start a voice call.

## 1) MVP features

- Anonymous sign-in (no phone/email required for first version)
- Random matching queue
- 1:1 text chat
- 1:1 voice call (WebRTC)
- Basic report/block controls
- Optional gender/language filters (later)

## 2) Suggested tech stack

### Android app
- **Kotlin** + **Jetpack Compose**
- **Firebase Auth (anonymous)** for identity
- **Cloud Firestore** for chat + room metadata
- **WebRTC Android SDK** for voice calls
- **Hilt** for dependency injection

### Backend
- **Node.js + Express + Socket.IO** for real-time matching + signaling
- **Redis** for match queue and presence (recommended)
- **STUN/TURN** (e.g., coturn) for reliable media relay

## 3) High-level architecture

```text
Android Client A ----\
                      \---- Signaling Server (Socket.IO) ---- Match Queue (Redis)
Android Client B ----/

Android Client A <==== WebRTC Audio (P2P or TURN relay) ====> Android Client B

Chat messages --> Firestore (or your own websocket backend)
```

## 4) Data model (Firestore example)

- `users/{uid}`
  - `status`: `online|offline|in_call`
  - `createdAt`
  - `blockedUsers[]`

- `rooms/{roomId}`
  - `userA`, `userB`
  - `state`: `matching|chatting|calling|ended`
  - `createdAt`, `endedAt`

- `rooms/{roomId}/messages/{messageId}`
  - `senderId`
  - `text`
  - `sentAt`

## 5) Matchmaking flow

1. User taps **Find Stranger**.
2. App sends `find_match` to signaling server.
3. Server places user in waiting queue.
4. If another user available, server pops both and emits `match_found` with `roomId`.
5. Both users join that room and can text or start voice call.

## 6) Voice calling flow (WebRTC)

1. Caller sends `start_call`.
2. Caller creates SDP offer and sends via signaling server.
3. Callee receives offer, creates answer, returns answer.
4. Both exchange ICE candidates.
5. Audio starts when peer connection is established.

## 7) Safety essentials (very important)

- Add **report** button in chat/call UI.
- Add **block user** action and enforce in matching.
- Add rate limiting to prevent spam.
- Keep no personally identifying data for anonymous mode.
- Publish clear community rules + moderation policy.

## 8) Local startup

### Start signaling server

```bash
cd backend/signaling-server
npm install
npm run dev
```

Server runs on `http://localhost:3000`.

### Android side (next step)

Create Android project in Android Studio and wire these modules:
- `auth`: anonymous login
- `match`: socket matchmaking
- `chat`: room messages
- `call`: WebRTC audio call

## 9) Suggested milestones

- **Milestone 1**: Anonymous auth + matchmaking only
- **Milestone 2**: Text chat
- **Milestone 3**: Voice calls with WebRTC + TURN
- **Milestone 4**: Reporting, blocking, abuse controls
- **Milestone 5**: Profile preferences + quality improvements

---

If you want, the next step is I can generate:
1) a full Android Studio project structure (Compose), and
2) complete Kotlin code for matchmaking + chat + WebRTC integration.
