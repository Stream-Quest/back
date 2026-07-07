// Channels Redis

import { TimeOfDay } from '../../../generated/prisma/enums';

// Usage : `session:${sessionId}:${SESSION_CHANNEL_STARTED}`
export const SESSION_STARTED = 'started';
export const SESSION_ENDED = 'ended';
export const SESSION_CONTEXT_UPDATED = 'context-updated';
export const SESSION_KARMA_CHANGED = 'karma-changed';

// Events WebSocket
// Usage : socket.emit(WS_SESSION_STARTED, payload)
export const WS_SESSION_STARTED = 'session:started';
export const WS_SESSION_ENDED = 'session:ended';
export const WS_SESSION_CONTEXT_UPDATED = 'session:context-updated';
export const WS_SESSION_KARMA_CHANGED = 'session:karma-changed';

export interface SessionStartedInterface {
  sessionId: string;
  startedAt: Date;
}

export interface SessionEndedInterface {
  sessionId: string;
  endedAt: Date;
}

export interface SessionContextUpdatedInterface {
  sessionId: string;
  weatherId?: string | null;
  locationId?: string | null;
  timeOfDay?: TimeOfDay | null;
}

export interface SessionKarmaChangedInterface {
  sessionId: string;
  karmaValue: number;
  reason?: string | null;
  occurredAt: Date;
}

export interface SocketData {
  userId: string;
  type: 'gm' | 'overlay';
}
