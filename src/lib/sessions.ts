import { Session, ShoppingPlan, ChatMessage } from './types';

// Persist sessions across Next.js hot-module-reloads in dev mode.
// Without this, different API routes can get separate module evaluations
// and lose access to the shared session state.
const globalStore = globalThis as typeof globalThis & {
  __aimySessions?: Map<string, Session>;
};

if (!globalStore.__aimySessions) {
  globalStore.__aimySessions = new Map<string, Session>();
}

const sessions = globalStore.__aimySessions;

const SESSION_TTL_MS = 60 * 60 * 1000; // 1 hour
const MAX_SESSIONS = 500;

function pruneExpiredSessions(): void {
  const now = Date.now();
  for (const [id, session] of sessions) {
    const age = now - new Date(session.lastAccessedAt || session.createdAt).getTime();
    if (age > SESSION_TTL_MS) {
      sessions.delete(id);
    }
  }
  // If still over limit, remove oldest
  if (sessions.size > MAX_SESSIONS) {
    const sorted = [...sessions.entries()].sort(
      (a, b) =>
        new Date(a[1].lastAccessedAt || a[1].createdAt).getTime() -
        new Date(b[1].lastAccessedAt || b[1].createdAt).getTime()
    );
    const toRemove = sorted.slice(0, sessions.size - MAX_SESSIONS);
    for (const [id] of toRemove) sessions.delete(id);
  }
}

function touchSession(session: Session): void {
  session.lastAccessedAt = new Date().toISOString();
}

export function getSession(id: string): Session | undefined {
  const session = sessions.get(id);
  if (session) touchSession(session);
  return session;
}

export function createSession(id: string): Session {
  pruneExpiredSessions();
  const now = new Date().toISOString();
  const session: Session = {
    id,
    messages: [],
    shoppingList: { items: [] },
    createdAt: now,
    lastAccessedAt: now,
  };
  sessions.set(id, session);
  return session;
}

export function getOrCreateSession(id: string): Session {
  return sessions.get(id) || createSession(id);
}

export function addMessage(sessionId: string, message: ChatMessage): void {
  const session = getOrCreateSession(sessionId);
  session.messages.push(message);
}

export function setPlan(sessionId: string, plan: ShoppingPlan): void {
  const session = getOrCreateSession(sessionId);
  session.plan = plan;
}

export function getPlan(sessionId: string): ShoppingPlan | undefined {
  return sessions.get(sessionId)?.plan;
}

export function clearSession(sessionId: string): void {
  sessions.delete(sessionId);
}

export function getAllSessions(): Session[] {
  return Array.from(sessions.values());
}
