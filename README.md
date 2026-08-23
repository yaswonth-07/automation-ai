# Agentflow AI — Agentic AI Automation Platform

[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-green.svg)](https://nodejs.org)
[![Next.js](https://img.shields.io/badge/Next.js-15-black.svg)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev)
[![React Flow](https://img.shields.io/badge/React%20Flow-12-purple.svg)](https://reactflow.dev)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.8-orange.svg)](https://socket.io)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**Agentflow AI** is a full-stack AI Operations Automation Platform that transforms natural-language prompts into executable visual workflow graphs. Workflows are rendered on a React Flow drag-and-drop canvas, executed through an autonomous 5-agent chain, integrated with real-world OAuth tools (Gmail, Slack, Discord, Google Sheets), and monitored in real-time with Socket.IO event streaming and encrypted credential storage.

---

## 🌟 Key Features

- 🧠 **AI Prompt-to-Workflow Compilation**:
  - **Tier 1 (Primary)**: OpenRouter API (Claude 3.5 Sonnet).
  - **Tier 2 (Fallback)**: Google Gemini 1.5 Flash.
  - **Tier 3 (Deterministic Rule Engine)**: Built-in rule-based builder guaranteeing runnable workflows even without external API keys.
- 🤖 **5-Agent Autonomous Orchestration Engine**:
  1. **Planner Agent**: Analyzes graph topology, generates topological execution DAG, detects cycles, and calculates confidence score.
  2. **Execution Agent**: Executes individual node steps against OAuth APIs or AI models with context interpolation.
  3. **Validation Agent**: Validates output schemas and checks required data integrity before passing to downstream steps.
  4. **Recovery Agent**: Classifies runtime errors (`MISSING_FIELDS`, `API_FAILURE`, `AUTH_EXPIRED`, `RATE_LIMIT`, `TRANSIENT`) and applies exponential backoff or escalation.
  5. **Monitoring Agent**: Emits granular timeline events via Socket.IO and writes persistent `ExecutionLog` entries to MongoDB.
- 🎨 **Visual Canvas & Drag-and-Drop Palette**:
  - React Flow (`@xyflow/react`) with animated edges during execution.
  - Draggable palette of Triggers, Integrations, AI Reasoning, and Logic gates.
  - Real-time Node Inspector panel to configure parameters, bindings, and variables.
- 🔐 **Secure OAuth Integrations**:
  - Integrations for **Gmail**, **Slack**, **Discord**, and **Google Sheets**.
  - All access/refresh tokens and webhook secrets are encrypted at rest with **AES-256-GCM** authenticated cipher.
  - Fallback sandbox mode for zero-configuration local testing.
- ⚡ **Real-Time Streaming & Lifecycle Controls**:
  - Sub-second event broadcasting over Socket.IO to live timeline.
  - Execution lifecycle controls: **Pause**, **Resume**, and **Cancel**.
  - Operator Notifications Drawer in the AppShell.
- 🛡️ **Zero-Dependency Out-of-the-Box Local Mode**:
  - Automatic in-memory database and queue fallbacks if local MongoDB/Redis instances are not running.

---

## 📐 System Architecture

```
                                  +-----------------------------+
                                  |     Next.js Frontend        |
                                  | (React Flow / Zustand / WS) |
                                  +--------------+--------------+
                                                 |
                                         REST / WebSocket
                                                 |
                                  +--------------v--------------+
                                  |    Express.js Backend API   |
                                  +--------------+--------------+
                                                 |
              +----------------------------------+----------------------------------+
              |                                  |                                  |
    +---------v----------+             +---------v----------+             +---------v----------+
    |   MongoDB Store    |             |  BullMQ / InMemory |             |  Socket.IO Server  |
    | (Users, Workflows, |             |   Execution Queue  |             |  (Live Timelines & |
    |   Executions, Logs)|             |                    |             |    Notifications)  |
    +--------------------+             +---------+----------+             +--------------------+
                                                 |
                                                 v
                               +----------------------------------+
                               |     5-Agent Orchestration Chain   |
                               |                                  |
                               |  1. Planner Agent (DAG Sort)     |
                               |  2. Execution Agent (APIs/AI)    |
                               |  3. Validation Agent (Schema)    |
                               |  4. Recovery Agent (Self-Heal)   |
                               |  5. Monitoring Agent (Telemetry) |
                               +-----------------+----------------+
                                                 |
                   +-----------------------------+-----------------------------+
                   |                             |                             |
         +---------v----------+        +---------v----------+        +---------v----------+
         |  Gmail Integration |        |  Slack & Discord   |        |   Google Sheets    |
         | (Send / Read Mail) |        |    (Webhooks/Bots) |        |   (Append / Read)  |
         +--------------------+        +--------------------+        +--------------------+
```

---

## 🚀 Quick Start Guide (Run Locally)

### 1. Prerequisites
- **Node.js** v18.0.0 or higher (`node -v`)
- **npm** v9.0.0 or higher (`npm -v`)

*(Optional: MongoDB and Redis. If not running, Agentflow AI will automatically initialize in-memory fallbacks seamlessly).*

---

### 2. Installation

Clone or open the project folder in your terminal:

```bash
# Navigate to the project root
cd /path/to/project

# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install

# Return to project root
cd ..
```

---

### 3. Environment Configuration

Create a `.env` file in `server/` (or copy `.env.example`):

```bash
cp .env.example server/.env
```

**Default Development Configuration (`server/.env`):**
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000

# Security (Preconfigured for dev)
JWT_SECRET=agentflow_super_secret_jwt_key_2026_dev_mode
CREDENTIAL_ENCRYPTION_KEY=agentflow_secret_key_32_bytes_len!!

# Database & Queue
MONGO_URI=mongodb://127.0.0.1:27017/agentflow_ai
REDIS_HOST=127.0.0.1
REDIS_PORT=6379

# AI Providers (Optional - Leave blank to use Deterministic Rule Compiler)
OPENROUTER_API_KEY=
GEMINI_API_KEY=
```

---

### 4. Running the Platform

Open **two terminal windows**:

#### Terminal 1 — Start the Backend Server:
```bash
cd server
npm run dev
```
*The backend will start on **`http://localhost:5000`** with real-time Socket.IO enabled.*

#### Terminal 2 — Start the Next.js Frontend:
```bash
cd client
npm run dev
```
*The frontend will start on **`http://localhost:3000`**.*

---

### 5. Accessing the Application

1. Open your browser and navigate to: **`http://localhost:3000`**
2. Click **"Launch Free Operator Console"** or **"Sign In"**.
3. **Register** a new account (e.g. `operator@agentflow.local` / password: `operator123`).
4. You will be redirected to the **Dashboard**.

---

## 🧪 Testing the Multi-Agent Automation Pipeline

### Step 1: AI Prompt-to-Workflow Compilation
1. In the sidebar, click **AI Builder** (`/workflows/builder`).
2. Type a prompt such as:
   > *"When an invoice email is received via Gmail, extract the invoice amount and vendor name with AI, log the row to Google Sheets, and post an alert to Slack #devops-alerts."*
   *(or click one of the pre-built templates).*
3. Click **"Generate Workflow Graph"**.
4. Watch the 5-agent compiler generate the nodes, calculate DAG coordinates, and render the graph in the preview canvas.
5. Click **"Save to Workspace & Open Canvas"**.

### Step 2: Visual Canvas Editing
1. You are now in the visual editor (`/workflows/[id]`).
2. Drag and drop additional nodes from the **Node Palette** on the left.
3. Click any node to open the **Node Inspector** on the right and edit parameters.
4. Click **"Save Graph"**.

### Step 3: Execution & Real-Time Telemetry
1. Click the green **"Execute Agent Chain"** button.
2. You will be redirected to the live **Execution Telemetry** page (`/executions/[id]`).
3. Observe the real-time agent chain stream over WebSocket:
   - 🔵 **Planner Agent**: Computes topological sequence & confidence score.
   - 🟣 **Execution Agent**: Runs each node with parameter interpolation.
   - 🟢 **Validation Agent**: Verifies schema & required output fields.
   - 🟡 **Recovery Agent**: Classifies failure modes and tests self-healing backoff.
   - 🔴 **Monitoring Agent**: Emits audit log events and delivers notifications.
4. Test live lifecycle controls: click **Pause Run**, **Resume Run**, or **Cancel Run**.

---

## 📡 API Catalog

### Health & Authentication
- `GET /api/health` — System heartbeat, DB connection status, and queue telemetry.
- `POST /api/auth/register` — Register a new operator / admin user.
- `POST /api/auth/login` — Authenticate and issue JWT.
- `GET /api/auth/me` — Retrieve current authenticated user profile.

### Workflows
- `GET /api/workflows/dashboard` — Aggregated metrics, success rate, and active runs.
- `GET /api/workflows` — List user workflows (with search, status, and tag filters).
- `POST /api/workflows` — Create a workflow manually.
- `POST /api/workflows/generate` — Generate a visual workflow graph from prompt via AI.
- `GET /api/workflows/:id` — Get single workflow by ID.
- `PUT /api/workflows/:id` — Update workflow nodes, edges, or metadata.
- `POST /api/workflows/:id/duplicate` — Clone an existing workflow.
- `POST /api/workflows/:id/execute` — Trigger an execution run.
- `DELETE /api/workflows/:id` — Delete a workflow.

### Executions
- `GET /api/executions` — List all execution runs.
- `GET /api/executions/:id` — Fetch execution details, status, outputs, and snapshot.
- `GET /api/executions/:id/timeline` — Fetch granular agent timeline logs.
- `POST /api/executions/:id/pause` — Pause an active execution.
- `POST /api/executions/:id/resume` — Resume a paused execution.
- `POST /api/executions/:id/cancel` — Cancel a running execution.

### Integrations & Notifications
- `GET /api/integrations` — List connected third-party integrations.
- `GET /api/integrations/status` — Health check on OAuth token validity.
- `GET /api/integrations/oauth/:provider/start` — Initiate OAuth 2.0 connection.
- `GET /api/integrations/oauth/:provider/callback` — OAuth callback handler.
- `POST /api/integrations` — Store manual API credentials with AES-256-GCM encryption.
- `DELETE /api/integrations/:provider` — Disconnect provider.
- `GET /api/notifications` — Fetch user inbox notifications.
- `PUT /api/notifications/:id/read` — Mark notification as read.
- `POST /api/notifications/read-all` — Mark all notifications as read.

---

## 🛡️ Security Architecture

- **Password Hashing**: Passwords hashed with `bcryptjs` using cost factor 12.
- **Credential Encryption**: OAuth tokens and API secrets encrypted using authenticated **AES-256-GCM** with PBKDF2 salt derivation (`CREDENTIAL_ENCRYPTION_KEY`).
- **HTTP Security**: Protected via `helmet` headers, CORS whitelisting, and `express-rate-limit`.
- **Validation**: All input payloads validated via `express-validator`.
- **Sanitized Logging**: Decrypted tokens are never written to logs or emitted in WebSocket events.

---

## 📁 Repository Structure

```
.
├── client/                      # Next.js Pages Router Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── AppShell/        # Sidebar, Header, NotificationDrawer
│   │   │   ├── MetricGrid/      # Metrics KPI cards
│   │   │   ├── NodePalette/     # Draggable node palette
│   │   │   ├── NodeConfigPanel/ # Right-side inspector
│   │   │   ├── WorkflowCanvas/  # React Flow canvas & custom nodes
│   │   │   ├── PromptInputPanel/# Prompt submission & AI generator
│   │   │   ├── Timeline/        # Live agent timeline
│   │   │   └── ProtectedRoute/  # Route guard
│   │   ├── pages/               # Next.js Pages (dashboard, builder, editor, etc.)
│   │   ├── store/               # Zustand stores (authStore, workflowStore)
│   │   ├── services/            # Axios API & Socket.IO client
│   │   └── styles/              # Tailwind globals & theme
│   ├── package.json
│   └── tailwind.config.js
├── server/                      # Express.js Backend
│   ├── src/
│   │   ├── agents/              # 5-Agent chain (planner, execution, validation, recovery, monitoring)
│   │   ├── config/              # env, db, socket, security (AES-256-GCM)
│   │   ├── controllers/         # Thin HTTP controllers
│   │   ├── integrations/        # Gmail, Slack, Discord, Google Sheets
│   │   ├── middleware/          # authMiddleware, errorHandler, rateLimiter
│   │   ├── models/              # Mongoose schemas (User, Workflow, Execution, etc.)
│   │   ├── queues/              # BullMQ + Redis / In-memory queue
│   │   ├── routes/              # Express API routes
│   │   ├── services/            # Business logic (auth, workflow, ai, execution, integration)
│   │   └── index.js             # Server bootstrap
│   └── package.json
├── .env.example                 # Environment variables reference
├── README.md                    # Project documentation
└── package.json                 # Monorepo root script coordinator
```

---

## 📄 License

## 🚢 Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for the Render Blueprint, environment variable setup, Git push commands, OAuth callback configuration, and post-deployment checks.

This project is licensed under the MIT License.
