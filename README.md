# LANCERA — CABG Surgery VR Simulation

> **Full-stack CABG surgery simulation** with React + Three.js frontend, Node.js/Express backend, MongoDB, Socket.io vitals streaming, and Claude AI surgical guidance.

---

## Quick Start

### Backend
```bash
cd backend
npm install
node server.js
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

- **Frontend:** http://localhost:5173  
- **Backend API:** http://localhost:5000  
- **Socket.io:** http://localhost:5000

---

## Setup Requirements

### MongoDB
```bash
# Local (default)  
mongod --dbpath ./data

# OR use Atlas URI in backend/.env
MONGO_URI=mongodb+srv://...
```

### Anthropic API Key
Edit `backend/.env`:
```
ANTHROPIC_API_KEY=sk-ant-your-key-here
```
> Without this, ARIA uses built-in clinical fallback text per step (fully functional).

### Optional: Heart 3D Model
Place a cardiac `.glb` model at:
```
frontend/public/models/heart.glb
```
If absent, a **procedural 3D heart** renders automatically with heartbeat animation.

---

## Architecture

```
lancera/
├── backend/
│   ├── server.js              Express + Socket.io server
│   ├── .env                   Environment config
│   ├── models/                MongoDB schemas (User, Session, SurgeryLog)
│   ├── routes/                REST API (auth, surgery, ai, models)
│   ├── middleware/            JWT auth middleware
│   └── sockets/               Real-time vitals streaming
└── frontend/
    ├── src/
    │   ├── store/             Zustand global state
    │   ├── api/               Axios HTTP client
    │   ├── pages/             Login, Dashboard, CompletionModal, SessionHistory
    │   └── components/        TopHUD, StepsTracker, HeartViewer, ARIAPanel, InstrumentsPanel
    └── public/models/         Place heart.glb here
```

---

## Features

| Feature | Details |
|---|---|
| **3D Heart Viewer** | Three.js via @react-three/fiber · GLB model or procedural fallback |
| **ARIA AI Guide** | Claude claude-sonnet-4-20250514 surgical guidance per step · 80-word clinical instructions |
| **Live Vitals** | Socket.io streaming HR, BP, SpO2, Temp every 1.2s |
| **10-Step CABG Protocol** | Pre-op → Anesthesia → Sternotomy → Bypass Setup → Graft Harvest → Clamp → Bypass Grafts → Weaning → Closure → Post-op |
| **Graft Placement** | Click-to-place 4 bypass graft points on heart (LAD, RCA, LCx, Diagonal) |
| **Instruments Panel** | 10 surgical tools with SVG icons, active instrument highlighting |
| **Session Tracking** | MongoDB-persisted sessions with score, steps, grafts, vitals log |
| **Auth** | JWT + bcrypt login/register (student/surgeon/admin roles) |
| **Performance Score** | 0-100% score with animated completion modal |

---

## Default Credentials (Register First)
Create an account at `/login` → Register tab.

---

## Tech Stack
- **Frontend:** React 18 + Vite + TypeScript + Zustand + Axios
- **3D:** Three.js r152 via @react-three/fiber + @react-three/drei
- **Backend:** Node.js + Express + MongoDB/Mongoose
- **Auth:** JWT + bcryptjs
- **AI:** Anthropic Claude API (claude-sonnet-4-20250514)
- **Real-time:** Socket.io
- **Styling:** Tailwind CSS + CSS custom properties
