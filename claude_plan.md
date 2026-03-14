# AIMy - AI Retail Store Assistant (Hackathon Plan)
> **Note**: When exiting plan mode, save a copy to `claude_plan.md` in the project root.

## Context

**Problem**: Customers in retail stores waste 3-5 minutes waiting for an employee to answer simple questions like "where is X" or "what do I need for Y." Employees waste time running to answer basic questions instead of doing higher-value work.

**Solution**: An AI-powered kiosk (iPad/screen) that customers walk up to, describe what they need, and get a curated shopping plan with product recommendations + store navigation delivered via QR code.

**Hackathon fit**: Theme is "AI Runs the Shop" - our AI autonomously runs the customer service function. Autonomy is 40% of judging, which our multi-tool agent pipeline directly targets.

**Store choice**: Mock pet store ("Paws & Claws Pet Emporium") - relatable, interesting product relationships (fish -> tank -> filter -> food -> conditioner), great for showing autonomous cross-selling and compatibility decisions.

**Assistant persona**: "AIMy" - the AI assistant customers interact with on the kiosk. ("Hi, I'm AIMy! What can I help you find today?")

---

## Tech Stack

- **Next.js 14+ (App Router)** + TypeScript + Tailwind CSS (one project = frontend + API)
- **Claude Sonnet** via `@anthropic-ai/sdk` (fast responses for live demo, cheaper on credits)
- **`react-qr-code`** for reliable QR fallback + **`@gradio/client`** for artistic QR via HuggingFace
- **Web Speech API** (browser-native) for voice input + **SpeechSynthesis API** for voice output
- **In-memory session store** (no database needed)
- **Streaming responses** for real-time "thinking" effect in demo

```bash
pnpm create next-app@latest petgenius --yes --turbopack
pnpm add @anthropic-ai/sdk react-qr-code @gradio/client
```

---

## Architecture

### AI Agent: Single Agent with 5 Tools

One Claude agent with rich tool definitions (NOT multi-agent - too complex for 4 hours). Autonomy comes from WHAT the agent decides, not how many agents exist.

**Agentic loop** in `/api/chat/route.ts`:
1. Customer sends message
2. Claude responds with text (clarifying questions) or tool calls
3. If tool calls -> execute locally, send results back to Claude, loop
4. When Claude has enough info -> calls `generate_shopping_plan` tool
5. Plan is stored in session, QR code generated linking to plan page

**5 Tools**:
| Tool | Purpose | Autonomy Impact |
|------|---------|-----------------|
| `search_inventory` | Search products by keyword, category, pet type, price | Finds relevant products |
| `get_product_details` | Deep info on a specific product | Enables informed recommendations |
| `check_compatibility` | Check if products work together / with specific pets | **Key differentiator** - AI catches issues humans miss |
| `plan_store_route` | Optimal walking path through aisles | Autonomous route optimization |
| `generate_shopping_plan` | Create the final curated plan | The deliverable |

**System prompt emphasis**: The AI must MAKE DECISIONS, not list options. "I recommend X because..." not "here are 5 options." Proactively add items the customer didn't ask for. Flag incompatibilities.

### Pages

1. **`/` - Kiosk Interface**: Full-screen voice-first chat UI (mic button + text fallback), large text, streaming responses with text-to-speech, QR code reveal when plan is ready
2. **`/plan/[sessionId]` - Shopping Plan**: Mobile-first page with product cards, store map with route, pro tips, total cost
3. **`/admin` (stretch)**: Business metrics dashboard

### Voice Integration (CORE)

- **Input**: Browser Web Speech API (`webkitSpeechRecognition`) - ~20 lines. Mic button on kiosk, speech transcribed to text, sent to API like any typed message. Continuous listening mode with visual "listening" indicator.
- **Output**: Browser SpeechSynthesis API - AI responses read aloud automatically. Use a warm, friendly voice. Queue responses so streaming text is spoken as it arrives.
- **Fallback**: Text input always available alongside mic. If speech API unavailable (some browsers), degrade gracefully to text-only.
- **Demo impact**: Customer walks up, presses mic, SPEAKS their request, AI responds with voice + text. This is the "wow" moment.

### Artistic QR Integration (CORE)

- **Primary**: Call HuggingFace `Oysiyl/AI-QR-code-generator` via `@gradio/client` with the plan URL + a pet-themed prompt ("cute pet store with paw prints")
- **Fallback**: `react-qr-code` standard QR rendered immediately while artistic QR generates in background. If artistic QR succeeds within 30s, swap it in. If not, keep standard QR.
- **API route**: `/api/qr/route.ts` - server-side call to HuggingFace, returns the generated image
- **Risk mitigation**: Always show a working QR within 1 second (standard). Artistic is an enhancement, not a blocker.

### Mock Data

- **~50 products** across categories (food, toys, habitat, health, grooming, accessories)
- **8 aisles** in a grid layout with entrance + checkout
- **Compatibility rules** (e.g., "10-gallon tank too small for 3 goldfish", "this filter needs 20+ gallon tank")
- Products need enough variety for Claude to make meaningful choices (3 fish foods at different price points)

### File Structure
```
/src
  /app
    page.tsx                      # Kiosk chat interface (voice + text)
    /plan/[sessionId]/page.tsx    # Shopping plan (QR target)
    /api/chat/route.ts            # Main AI conversation endpoint
    /api/plan/[sessionId]/route.ts # GET plan data
    /api/qr/route.ts              # Artistic QR generation endpoint
  /components
    ChatMessage.tsx, ChatInput.tsx, QRCodeDisplay.tsx,
    ProductCard.tsx, StoreMap.tsx
  /lib
    /data/products.ts, store-map.ts, compatibility.ts
    /tools/definitions.ts, executor.ts
    sessions.ts, claude.ts, types.ts
    voice.ts                      # Web Speech API helpers
```

---

## 4-Hour Sprint Plan (Merged Approach)

**Strategy**: Hard-code the happy path first for safety, then layer in real AI, voice, and artistic QR. At any point you have a working demo.

### Team Roles
- **Person A (Full-Stack/AI)**: Next.js setup, API routes, Claude integration, agentic loop
- **Person B (Frontend)**: Kiosk UI, plan page, store map SVG, voice, animations
- **Person C (Data/QR/Demo)**: Mock data, tool functions, QR integration, demo script

### Phase 1: Skeleton (0:00 - 1:30) - Get one hardcoded path working end-to-end

**Goal**: "I need fish food for my goldfish" works from kiosk to plan page, even if responses are hardcoded.

| A (Full-Stack/AI) | B (Frontend) | C (Data/QR/Demo) |
|---|---|---|
| create-next-app, install deps, create `/api/chat` with **hardcoded** AIMy responses for the fish-food flow (no Claude yet). Create `/api/plan/[id]` to serve plan data. Session storage (in-memory Map). | Kiosk page: "Hi, I'm AIMy!" header, chat bubbles, text input, send button, Tailwind styling. Connect to `/api/chat`. Show standard QR when plan is ready. | Write ALL mock data: 50 products, store map, compatibility rules. Build `/plan/[id]` page: product cards, aisle directions, store map, total cost. Mobile-friendly. |

**Checkpoint at 1:30**: Type "I need fish food for my goldfish" on kiosk -> get hardcoded AIMy responses -> see plan page with products + directions -> scan standard QR on phone -> plan loads. **The demo works even if nothing else gets done.**

### Phase 2: Real AI + Voice + Artistic QR (1:30 - 2:30) - Layer in the real intelligence

**Goal**: Swap hardcoded responses for Claude agent with tools. Add voice. Start artistic QR.

| A (Full-Stack/AI) | B (Frontend) | C (Data/QR/Demo) |
|---|---|---|
| Replace hardcoded responses with real Claude agent. Add 5 tool definitions + agentic while-loop. Wire tools to mock data. Add streaming. | **Add voice input** (Web Speech API mic button). **Add voice output** (SpeechSynthesis reads AIMy's responses). Add quick-reply buttons for follow-up answers. | Implement 5 tool functions (pure TS against mock data). **Start artistic QR** (`@gradio/client` + `/api/qr` endpoint). Wire background swap: standard QR shows instantly, artistic replaces when ready. |

**Checkpoint at 2:30**: Customer speaks or types -> AIMy responds with real AI decisions + voice -> plan generated with real product recommendations -> artistic QR (or standard fallback) -> scan -> see curated plan.

### Phase 3: Expand + Harden (2:30 - 3:00)

**Goal**: Add more scenarios, tune the system prompt, test edge cases.

| A (Full-Stack/AI) | B (Frontend) | C (Data/QR/Demo) |
|---|---|---|
| Tune system prompt for max autonomy ("make decisions, don't list options"). Test Scenario 2 and 3. Fix bugs. Handle edge cases (vague requests, out-of-stock). | "Generating your plan..." loading state. Voice listening indicator. Demo reset button (clear state in <10 seconds). | Test all 3 demo scenarios end-to-end. Generate a **pre-baked backup plan URL** for demo safety. Start demo script. |

**Checkpoint at 3:00**: Multiple scenarios work. System prompt tuned. Backup plan URL ready. Demo reset works.

### Phase 4: Polish + Demo Prep (3:00 - 4:00)

| A (Full-Stack/AI) | B (Frontend) | C (Data/QR/Demo) |
|---|---|---|
| Final system prompt tweaks. Stress test. Pre-warm API. | Visual polish, animations, QR reveal moment, mobile polish on plan page. | **Record backup demo video**. Finalize 2-min pitch. Run full dry-run with team. Prepare pre-typed backup inputs. |

**Checkpoint at 4:00**: Demo-ready. Backup video recorded. Pitch rehearsed. At least 2 scenarios polished.

---

## Demo Strategy

### 3 Scenarios (pick best 1-2 for live demo)

1. **"The Newbie"** (best for autonomy): "I just got a goldfish for my kid. What do I need?"
   - AI proactively recommends 8-10 items (tank, filter, food, conditioner, gravel, thermometer, net, decorations)
   - Makes specific choices with reasoning
   - Flags that goldfish need bigger tanks than people think

2. **"The Specific Ask"** (best for value): "I need food for my betta fish, and I think he might have fin rot"
   - AI recommends specific treatment + food + prevention products
   - Shows expert-level knowledge

3. **"Budget Constraint"** (best for decision-making): "I want a tropical fish tank setup for under $75"
   - AI makes trade-off decisions, cuts non-essentials, explains reasoning

### Demo Flow (2 minutes)
1. Problem statement (15s): "You need help in a store. No employee in sight."
2. Show kiosk (10s): "Walk up and just TALK to AIMy."
3. **Live voice demo** Scenario 1 (60s): Press mic, speak the request out loud. AI responds with voice. Narrate the autonomous decisions. ("Watch - it just added water conditioner because it knows you'll need it...")
4. QR moment (15s): Artistic QR appears. Scan it with your phone.
5. Walk through plan page on phone (15s): Products, route, tips, total cost
6. Close (5s): "12 autonomous decisions in 30 seconds. No human needed. No typing required."

### Demo Tips
- Pre-warm Claude API AND HuggingFace QR Space 30 seconds before presenting
- Have a backup typed version of the request ready in case mic fails in the presentation room
- Have backup demo video recorded in case of API failure
- Pre-load a plan page on phone as fallback
- Test the room's acoustics for speech recognition before going live
- Use Chrome for the demo (best Web Speech API support)

---

## Pitfalls & Mitigations

| Risk | Mitigation |
|------|-----------|
| **Claude hallucinates products** | System prompt: "ONLY recommend products returned by your tools. Never invent products." |
| **API latency during demo** | Use Sonnet (fast), pre-warm API, have backup video |
| **Tool loop goes infinite** | Cap at 10 iterations + 60s timeout |
| **Artistic QR slow/fails** | Standard QR renders instantly as fallback. Artistic loads async in background. Never block on it. |
| **Web Speech API browser compat** | Works in Chrome (which you'll use for demo). Text input always available as fallback. Test early! |
| **SpeechSynthesis sounds robotic** | Pick the best available voice in setup. Alternatively, could use a TTS API but that adds latency. Browser voices are fine for demo. |
| **HuggingFace Space sleeping** | Hit the Space once during setup to wake it up. If it stays down, standard QR still works. |
| **Scope creep** | Dashboard is STRETCH. Core = voice chat + AI agent + plan page + artistic QR. |
| **Team blocked on each other** | Define API contract (request/response shapes) in first 10 min so everyone works independently |
| **Server restart loses sessions** | Don't restart during demo. Optionally persist sessions to disk. |

---

## Stretch Goals (in priority order, if core is solid)

1. **"AI Thinking" panel** showing which tools Claude is calling in real-time (directly proves autonomy to judges)
2. **Budget alternative toggle** on plan page ("Recommended $89 | Budget $62")
3. **Admin dashboard** with "queries handled", "employee time saved", "guided revenue"
4. **Multi-language support** (voice input already handles some languages natively)
5. **Product images** on plan page (use placeholder images or emoji icons per category)

---

## Verification / Testing

1. **End-to-end flow**: Type a request on kiosk -> AI converses -> plan generated -> QR appears -> scan QR on phone -> plan page loads with correct products and route
2. **Autonomy check**: Give a vague request ("I got a new fish") -> verify AI asks minimal clarifying questions AND proactively adds products the customer didn't ask for
3. **Compatibility check**: Request products that have constraints -> verify AI catches and resolves them
4. **Edge cases**: Out-of-stock items, very vague requests, requests outside pet domain
5. **Mobile**: Plan page renders well on phone (the customer's actual experience)
6. **Demo dry-run**: Run through all 3 scenarios at least once before presenting
