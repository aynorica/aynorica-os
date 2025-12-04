# Aynorica OS

**The Operating System for Amir's Second Brain**

Aynorica is a comprehensive knowledge management and AI orchestration system built on Obsidian, designed to implement the CODE/PARA methodology with intelligent automation.

---

## 🚀 Quick Start

### Option 1: Use the Scaffolding CLI (Recommended)

The fastest way to set up Aynorica with your personalized configuration:

```bash
npx create-aynorica
```

This will:

-   Fetch the latest instruction templates from this repository
-   Prompt you for your personal information (name, email, timezone)
-   Generate personalized configuration files in `.github/instructions/`
-   Set up the complete Aynorica environment

**For more details, see [create-aynorica](https://github.com/aynorica/create-aynorica)**

### Option 2: Manual Setup

1. Clone this repository
2. Read the instruction files in `.github/instructions/`
3. Set up your external Obsidian vault (separate from this repo)
4. Configure MCP integrations if needed (Google Calendar, Obsidian)

---

## 📦 What This Repository Actually Is

**Aynorica OS is an AI Agent Configuration System**, not a deployed application.

### Current Components (✅ Exist)

-   **Agent Instructions** (`.github/instructions/`) — 15 modular instruction files (~15,000 words)
-   **Prompt Templates** (`.github/prompts/`) — 25 reusable prompts for various domains
-   **Agent Configs** (`.github/agents/`) — Agent mode definitions
-   **Published Package** — `create-aynorica` CLI for template distribution
-   **Documentation** — Architecture specs, project tracker, handoff reports

### Planned Components (❌ Not Yet Built)

-   **Gateway** (`packages/gateway`) — NestJS entry point (design phase)
-   **Workers** (`packages/workers`) — Background processors (design phase)
-   **Mesh** (`packages/mesh`) — Inter-service communication (design phase)
-   **Infrastructure** — PostgreSQL, Redis, Docker Compose (design phase)

### External Dependencies (Separate Systems)

-   **Vault Layer** — Your Obsidian vault (`/Atlas`, `/Inbox`, `/Archive`)
-   **Skills** — RAG-indexed knowledge in your vault (`Atlas/30 Resources/`)
-   **RAG Server** — Skill search API (if running at `localhost:3001`)
-   **MCP Servers** — Google Calendar, Obsidian integrations

---

## 🧠 What This System Provides

### 1. AI Agent Configuration (✅ Operational)

-   **15 instruction files** defining behavior, personality, protocols
-   **Psychological calibration** tuned to user profile
-   **Modular loading** via `applyTo` patterns
-   **Trade-off oriented** decision frameworks
-   **Anti-dispersal protocols** for focus enforcement

### 2. Prompt Library (✅ Operational)

-   **25+ reusable prompts** for architecture, backend, security, workflows
-   **Domain-organized** (architecture, backend, typescript, mesh, etc.)
-   **Best practices codified** in prompt templates

### 3. Vault Protocols (✅ Documented)

-   **Inbox processing workflows** with strict frontmatter schemas
-   **CODE/PARA methodology** for knowledge organization
-   **Dataview query patterns** for dashboard generation
-   **Status tracking** (🟥 To-Read, 🟧 In Progress, 🟩 Done)
-   **Template system** for consistent file creation

### 4. MCP Integrations (✅ If Configured Externally)

-   **Google Calendar** management via MCP tools
-   **Obsidian vault** operations via MCP plugin

### 5. Future Capabilities (📋 Planned)

-   **Multi-agent orchestration** (gateway + workers)
-   **RAG-powered skill retrieval** (if external server exists)
-   **Automated inbox processing** (when workers are built)
-   **Infrastructure services** (PostgreSQL, Redis)
-   Timezone-aware scheduling (configured during setup)

---

## 📁 Directory Structure

### This Repository (Configuration System)

```
aynorica-os/
├── .github/
│   ├── agents/                # Agent mode definitions (aynorica.agent.md)
│   ├── instructions/          # 15 modular instruction files (~15,000 words)
│   ├── prompts/               # 25 reusable prompt templates
│   └── PROJECT-TRACKER.md     # Published packages & milestones
├── Archive/
│   ├── create-aynorica.md     # Implementation plan (completed)
│   └── Aynorica Logs/         # Session handoff reports
├── Inbox/
│   └── Aynorica/              # Current session logs
└── README.md                  # This file
```

### Your Obsidian Vault (Separate Location)

```
vault/
├── Atlas/
│   ├── 10 Projects/           # Active projects
│   ├── 20 Areas/              # Areas of responsibility
│   └── 30 Resources/          # Skills, MOCs, processed inputs
├── Inbox/
│   ├── Amir/                  # User input stream
│   └── Aynorica/              # Agent memory logs
├── Archive/                   # Cold storage
└── System/Templates/          # Obsidian templates (tpl_*.md)
```

---

## 🛠️ How to Use This Repository

### For AI Agents (GitHub Copilot)

1. Load the agent configuration:

    - Read `.github/agents/aynorica.agent.md`
    - Auto-load instruction files based on `applyTo` patterns
    - Use prompt templates from `.github/prompts/` as needed

2. Key instruction files:
    - `identity.instructions.md` — Core behavior and tone
    - `functions.instructions.md` — 17 primary capabilities
    - `memory.instructions.md` — RAG retrieval protocols
    - `schema.instructions.md` — Vault frontmatter rules

### For Developers

1. **Clone and explore**:

    ```bash
    git clone https://github.com/aynorica/aynorica-os.git
    cd aynorica-os
    ```

2. **Create your own setup**:

    ```bash
    npx create-aynorica
    # Follow prompts to personalize instruction templates
    ```

3. **Modify instructions**:
    - Edit files in `.github/instructions/`
    - Use `applyTo` patterns for contextual loading
    - Commit and push changes

### Future: When Packages Are Built

```bash
# Install dependencies (when package.json exists)
pnpm install

# Build packages (when packages/ exists)
pnpm run build

```

---

## 📝 Configuration

### Personalizing Instructions

Use `create-aynorica` to generate personalized instruction files:

```bash
npx create-aynorica my-aynorica-setup
```

This will prompt for:

-   `{{USER_NAME}}` — Your name
-   `{{USER_EMAIL}}` — Your email
-   `{{TIMEZONE_DESC}}` — Timezone description (e.g., "Istanbul")
-   `{{TIMEZONE_OFFSET}}` — Timezone offset (e.g., "+03:00")

All instruction templates will be personalized and written to `.github/instructions/`.

### Obsidian Vault Setup (Separate)

If using with Obsidian:

-   **Dataview** (enable JavaScript queries)
-   **Templater** (set folder: `System/Templates`)
-   **Kanban**

2. Create vault structure:

    - `/Atlas/10 Projects/`
    - `/Atlas/20 Areas/`
    - `/Atlas/30 Resources/`
    - `/Inbox/Amir/`
    - `/Inbox/Aynorica/`
    - `/Archive/`
    - `/System/Templates/`

3. Copy templates from this repo's documentation to your vault's `System/Templates/`

---

## 🔗 Related Projects

-   ✅ [create-aynorica](https://github.com/aynorica/create-aynorica) — Published npm package (v1.0.0)
-   📋 Obsidian MCP Server — External dependency (if using)
-   📋 Google Workspace MCP — External dependency (if using)
-   📋 RAG Skills Server — External dependency (if using)

---

## 📄 License

MIT

---

## 🤝 Contributing

This is a personal system, but if you're building something similar:

1. Fork the repository
2. Use `create-aynorica` to generate your own configuration
3. Share your architectural insights!

---

## 🧭 Philosophy

Aynorica follows these principles:

1. **Vault-First** — All knowledge lives in Markdown files with YAML frontmatter
2. **RAG as Index** — The database indexes vault files, doesn't replace them
3. **Completion Over Perfection** — Ship imperfect work, iterate fast
4. **Trade-Off Transparency** — Every architectural decision has explicit costs
5. **Externalizing Will** — The system acts as external discipline for focus

---

**Built by Amir Daryabari** | [GitHub](https://github.com/aynorica) | [Website](https://aynorica.dev)
