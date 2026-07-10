# Youth Career Launchpad Assistant

A modern, responsive AI-powered web application that helps South African youth, graduates, interns, and job-seeking professionals automate repetitive workplace entry tasks. Built as a stateless SaaS-style experience — no accounts, no database, all generated content stays in your current browser session.

---

## Project Overview

The Youth Career Launchpad Assistant empowers young South Africans entering the workforce by using AI to streamline career preparation. Instead of struggling with blank pages, users get instant, well-structured drafts for professional emails, personalised study/career plans, and interactive career coaching — all through a clean, welcoming, and accessible interface.

The application is intentionally **session-only**: nothing is stored on a server, no personal data is collected, and every generation happens live via the Lovable AI Gateway.

---

## Features Implemented

### 1. Dashboard (`/`)
- Warm welcome hero and quick orientation
- Session summary cards (Emails Generated, Plans Created, AI Conversations, Tools Available)
- Quick-action buttons linking to each AI feature
- Recent Activity feed with friendly empty state

### 2. Smart Email Generator (`/email`)
- Structured form (job title, company, context, audience, tone, notes)
- Quick templates: Cover Letter, Recruiter Follow-up, Thank You, Internship Application, Job Application, Networking
- Collapsible **Prompt Preview** panel showing the exact prompt sent to the AI
- Editable output with Copy, Download (.txt), and Regenerate actions

### 3. AI Task Planner (`/planner`)
- Inputs for career goal, deadline, hours per day, and priority
- Structured output (Zod-validated) rendered as editable task cards
- Copy, Download (.md), and Regenerate actions

### 4. AI Career Chatbot (`/chat`)
- Conversational assistant scoped to South African career guidance
- Suggested prompt chips, typing indicator, and Clear Chat control
- Markdown-rendered assistant replies

### 5. Responsible AI Page (`/responsible-ai`)
- Clear guidance on AI limitations, reviewing outputs, and data privacy

### 6. Settings (`/settings`)
- Theme toggle and session reset (clears in-memory store)

### Cross-cutting
- Fully responsive app shell with collapsible sidebar, top navbar, and footer disclaimer
- Soft shadows, rounded cards, Framer Motion transitions
- Accessible colour contrast and semantic HTML
- Friendly loading states and empty states throughout

---

## Technologies and Tools Used

**Framework & Runtime**
- [TanStack Start](https://tanstack.com/start) v1 (React 19, file-based routing, server functions)
- [Vite 7](https://vitejs.dev/) build tooling
- TypeScript (strict mode)

**UI & Styling**
- [Tailwind CSS v4](https://tailwindcss.com/) with semantic design tokens
- [shadcn/ui](https://ui.shadcn.com/) components
- [Framer Motion](https://www.framer.com/motion/) for animations
- [lucide-react](https://lucide.dev/) outline icons
- Fraunces (display) + Inter (body) typography

**AI**
- [Lovable AI Gateway](https://docs.lovable.dev/features/ai) (default model: `openai/gpt-5.5`)
- [Vercel AI SDK](https://sdk.vercel.ai/) (`ai`, `@ai-sdk/openai-compatible`, `@ai-sdk/react`)
- [Zod](https://zod.dev/) for structured-output validation

**State & Data**
- [Zustand](https://github.com/pmndrs/zustand) — in-memory session store
- [TanStack Query](https://tanstack.com/query) — mutations and cache

**Tooling**
- [Bun](https://bun.sh/) package manager
- ESLint + Prettier

---

## Setup Instructions

### Prerequisites
- [Bun](https://bun.sh/) (or Node.js 20+ with npm)
- A Lovable AI Gateway API key (`LOVABLE_API_KEY`) — automatically provisioned when the project is opened in Lovable

### 1. Install dependencies
```bash
bun install
```

### 2. Configure environment
Create a `.env` file in the project root:
```bash
LOVABLE_API_KEY=your_lovable_ai_gateway_key
```
> When developing inside Lovable, this key is injected automatically — no manual setup needed.

### 3. Run the dev server
```bash
bun run dev
```
The app is available at [http://localhost:8080](http://localhost:8080).

### 4. Build for production
```bash
bun run build
```

### 5. Preview the production build
```bash
bun run start
```

---

## Project Structure

```text
src/
├── components/         # App shell (sidebar, header, footer)
├── lib/                # AI gateway, prompts, server functions, session store
├── routes/             # File-based routes (dashboard, email, planner, chat, ...)
├── styles.css          # Tailwind v4 tokens + design system
├── router.tsx          # Router bootstrap
└── start.ts            # TanStack Start entry
```

---

## Responsible AI

AI suggestions should always be reviewed before use. This app is designed to **support**, not replace, your own judgement. Avoid submitting confidential or personally sensitive information.
