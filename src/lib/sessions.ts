import { Session, ShoppingPlan, ChatMessage } from './types';

// In-memory session store
const sessions = new Map<string, Session>();

export function getSession(id: string): Session | undefined {
  return sessions.get(id);
}

export function createSession(id: string): Session {
  const session: Session = {
    id,
    messages: [],
    createdAt: new Date().toISOString(),
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
