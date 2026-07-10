# Youth Career Launchpad Assistant — Build Plan

A responsive, stateless SaaS-style web app that helps South African youth prepare for employment using AI. No accounts, no database — all generated content lives only in the current browser session.

## Design system

- Palette applied as semantic tokens in `src/styles.css` (converted to `oklch`):
  - background `#F8F5F0`, sidebar `#EFE6D8`, primary `#B08968`, secondary `#DDB892`, foreground `#4A3F35`, card `#FFFFFF`, border `#E7DED2`, success `#6A994E`, warning `#D4A373`.
- Typography: pair a warm serif display (Fraunces) with a clean sans body (Inter), loaded via `<link>` in `__root.tsx`.
- Soft shadows, generous rounded corners (`--radius: 1rem`), subtle Framer Motion transitions on cards and page changes.
- Modern outline icons via `lucide-react`.

## App shell

- `src/routes/__root.tsx` — wraps content in `SidebarProvider`, sets real title/description/OG metadata, mounts a shared header + footer disclaimer.
- Collapsible left sidebar (`AppSidebar`) with active-route highlighting, using shadcn Sidebar.
- Top navbar: logo + title, search input, notifications button.
- Footer on every page: "AI suggestions should be reviewed before use. Built for responsible workplace productivity."
- Fully responsive (sidebar collapses to icon rail on tablet, offcanvas hamburger on mobile).

## Routes

```text
src/routes/
  __root.tsx          shared shell (sidebar + header + footer)
  index.tsx           Dashboard
  email.tsx           Smart Email Generator
  planner.tsx         AI Task Planner
  chat.tsx            AI Career Chatbot
  responsible-ai.tsx  Responsible AI page
  settings.tsx        Settings (theme toggle, session reset)
  api/chat.ts         Streaming chat endpoint (AI SDK)
```

Each route sets its own `head()` with unique title/description/OG.

## Session state (no database)

- Zustand store in `src/lib/session-store.ts` (in-memory, non-persistent) tracking:
  - counters: emails generated, plans created, chats sent
  - recent activity list (last ~10 items)
  - current email draft, current plan, current chat thread
- Cleared automatically on refresh — matches the "stateless" requirement.

## AI integration (Lovable AI Gateway)

- Enable Lovable AI (`LOVABLE_API_KEY`) and add the shared provider at `src/lib/ai-gateway.server.ts`.
- Default model: `openai/gpt-5.5`.
- Three server surfaces:
  - `src/lib/email.functions.ts` — `generateEmail` server function (one-shot, structured text output).
  - `src/lib/planner.functions.ts` — `generatePlan` server function returning structured task list (Zod schema → `Output.object`).
  - `src/routes/api/chat.ts` — streaming chat route using `streamText` + AI SDK `useChat` on the client.
- Each feature UI shows the constructed prompt in a collapsible "Prompt preview" panel before generation, per spec.

## Feature 1 — Smart Email Generator (`/email`)

- Form: Job Title, Company, Context, Audience (select), Tone (select), Additional Notes.
- Quick templates row: Cover Letter, Recruiter Follow-up, Thank You, Internship Application, Job Application, Networking.
- "Prompt preview" accordion showing composed system+user prompt.
- Generate → loading state ("Generating your email…") → editable `Textarea` with Edit / Copy / Regenerate / Download (.txt) actions.
- Empty state: "Generate your first professional email."

## Feature 2 — AI Task Planner (`/planner`)

- Form: Career Goal (select of the 5 goals), Deadline (date), Available Hours/Day, Priority.
- Prompt preview + Generate.
- Output rendered as editable task cards: name, deadline, priority badge, estimated duration, completion checkbox, notes.
- Actions: Edit, Copy (markdown), Download (.md), Regenerate.
- Suggested use cases displayed as clickable presets.

## Feature 3 — AI Career Chatbot (`/chat`)

- Built with AI Elements (`conversation`, `message`, `prompt-input`, `shimmer`) installed via `bunx ai-elements@latest add …`.
- Streaming via `useChat` + `DefaultChatTransport({ api: "/api/chat" })`.
- Suggested prompts row (clickable chips) matching the spec examples.
- Typing shimmer, message timestamps, Clear Chat button.
- Assistant messages rendered as markdown; no background bubble on assistant, warm primary bubble on user.
- System prompt scoped to South African career guidance with responsible-AI guardrails.

## Dashboard (`/`)

- Welcome hero: "Welcome to Youth Career Launchpad Assistant — Your AI Career Companion."
- 4 stat cards from session store (Emails, Plans, Chats, Tools Available = 3).
- 3 quick-action buttons linking to the feature routes.
- Recent Activity list from session store with empty-state copy.

## Responsible AI (`/responsible-ai`)

- Static content page covering: AI can make mistakes, review outputs, don't submit confidential info, AI supports but doesn't replace judgement.

## Settings (`/settings`)

- Theme toggle (light default), Reset session button (clears Zustand store), app info.

## Technical details

- Stack: TanStack Start + React 19 + Tailwind v4 + shadcn + AI SDK + AI Elements + Framer Motion + Zustand.
- No auth, no Supabase, no persistence — everything session-only.
- `LOVABLE_API_KEY` provisioned via `ai_gateway--create`; never exposed to the client.
- Server functions live in `src/lib/*.functions.ts`; streaming chat lives in `src/routes/api/chat.ts`.
- Error handling: friendly toasts for 429/402/network errors from the gateway.
- Loading: skeletons for stat cards, shimmer for chat, spinner buttons for generate actions.

## Out of scope (per spec)

- No login, registration, profiles, roles, databases, or persistent history.
- No user data collection beyond in-memory session state.
