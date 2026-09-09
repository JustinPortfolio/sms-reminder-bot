/**
 * Pure scheduling logic: given an appointment and the current time, which
 * reminder stages (if any) are due to be sent right now?
 *
 * Kept separate from the Twilio-sending code so it can be unit tested
 * without mocking time-dependent network calls.
 */

export type ReminderStageId = "24h" | "2h";

export interface ReminderStage {
  id: ReminderStageId;
  hoursBefore: number;
}

export const REMINDER_STAGES: ReminderStage[] = [
  { id: "24h", hoursBefore: 24 },
  { id: "2h", hoursBefore: 2 },
];

export interface Appointment {
  id: string;
  startsAt: Date;
  status: "scheduled" | "confirmed" | "cancelled";
  remindersSent: ReminderStageId[];
}

const HOUR_MS = 60 * 60 * 1000;

/**
 * A stage is due when the appointment is within `hoursBefore` hours of
 * starting, hasn't already started, hasn't had that reminder sent yet, and
 * the appointment isn't cancelled. Order in REMINDER_STAGES is preserved.
 */
export function getDueReminderStages(appointment: Appointment, now: Date): ReminderStageId[] {
  if (appointment.status === "cancelled") return [];
  if (appointment.startsAt.getTime() <= now.getTime()) return [];

  const hoursUntilStart = (appointment.startsAt.getTime() - now.getTime()) / HOUR_MS;

  return REMINDER_STAGES.filter(
    (stage) => hoursUntilStart <= stage.hoursBefore && !appointment.remindersSent.includes(stage.id)
  ).map((stage) => stage.id);
}

