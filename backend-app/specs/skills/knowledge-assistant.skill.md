# Skill: Knowledge Assistant (agentic)

**Spec version:** 0.1.0
**Service:** assistant
**Model:** openai/gpt-5.4 (via EMERGENT_LLM_KEY)

## Purpose

Answer questions about the US Consumer Cards knowledge graph, grounded in the user's
current on-screen context and any files they attached to the conversation.

## Context assembly (in priority order)

1. **Screen context** (`domain_context` from the request): the page + entity the user is
   looking at, e.g. "Permit-to-Design WR202403518 (PTS 2025100440), USCC Technology [L5]".
2. **Attached files** (`file_ids`): extracted text of uploaded documents (PD decks, specs).
   Each file is truncated to 8,000 chars and labeled with its original filename.
3. **Domain graph facts** (`DOMAINS_CONTEXT`): the 13 USCC domains, capabilities, diagram
   counts, API counts, ARB review counts — injected into the system message.
4. **Conversation history**: per `session_id`, carried in Postgres `chat_messages`.

## Behavior contract

- ALWAYS cite which domain or file a fact came from using the format `[source: X]`.
- If the answer depends on an attached file, quote the relevant line before summarizing.
- If context is insufficient, ask ONE clarifying question instead of guessing.
- Keep answers under 200 words unless the user asks for detail.
- Never invent PTS numbers, API counts, or ARB decisions not present in the context.

## Tools (planned, phase 2)

| Tool              | Input            | Output                          |
| ----------------- | ---------------- | ------------------------------- |
| `graph.lookup`    | domain name      | capabilities, counts, statuses  |
| `file.read`       | file_id          | extracted text                  |
| `permit.prefill`  | project id       | draft permit sections           |

Phase 1 ships context assembly + streaming only; tool calls are added when the graph
service exposes a real query API.

## Streaming contract

- SSE events: `delta` (token), `done` (includes `sources: string[]`), `error`.
- HTTP headers: `Cache-Control: no-cache`, `X-Accel-Buffering: no`.
