/**
 * Pure parsing of an inbound SMS body into an intent. Kept deliberately
 * permissive (case-insensitive, trims punctuation) since real people text
 * "Yes!", "y", "CANCEL please", etc., not clean enum values.
 */

export type ReplyIntent = "confirm" | "cancel" | "reschedule" | "stop" | "unknown";

const CONFIRM_WORDS = new Set(["yes", "y", "confirm", "confirmed", "ok", "okay", "sure"]);
const CANCEL_WORDS = new Set(["no", "n", "cancel", "cancelled", "canceled"]);
const RESCHEDULE_WORDS = new Set(["reschedule", "resched", "change", "move"]);
const STOP_WORDS = new Set(["stop", "unsubscribe", "optout", "opt-out"]);

function words(body: string): string[] {
  return body
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map((w) => w.replace(/[^a-z0-9-]/g, ""))
    .filter(Boolean);
}

function containsAny(tokens: string[], set: Set<string>): boolean {
  return tokens.some((t) => set.has(t));
}

// Checked in this priority order because STOP is a legal/compliance
// requirement (must win even if the rest of the message is noise) and
// CONFIRM/CANCEL are more common and more specific than RESCHEDULE.
export function parseReply(body: string): ReplyIntent {
  const tokens = words(body);

  if (containsAny(tokens, STOP_WORDS)) return "stop";
  if (containsAny(tokens, CONFIRM_WORDS)) return "confirm";
  if (containsAny(tokens, CANCEL_WORDS)) return "cancel";
  if (containsAny(tokens, RESCHEDULE_WORDS)) return "reschedule";

  return "unknown";
}

