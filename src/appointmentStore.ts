import type { Appointment, ReminderStageId } from "./reminderScheduling.js";

/**
 * In-memory appointment store, standing in for a real database. The rest of
 * the app (server.ts, sendReminders.ts) only depends on this small
 * interface, so swapping in Postgres/Supabase later is a one-file change.
 */

interface StoredAppointment extends Appointment {
  phoneNumber: string;
  customerName: string;
}

const appointments = new Map<string, StoredAppointment>();

export function seedDemoAppointments(): void {
  appointments.clear();
  const in20Hours = new Date(Date.now() + 20 * 60 * 60 * 1000);
  appointments.set("apt-1", {
    id: "apt-1",
    phoneNumber: "+15550100001",
    customerName: "Jamie",
    startsAt: in20Hours,
    status: "scheduled",
    remindersSent: [],
  });
}

export function getAllAppointments(): StoredAppointment[] {
  return Array.from(appointments.values());
}

export function findAppointmentByPhone(phoneNumber: string): StoredAppointment | undefined {
  return Array.from(appointments.values()).find((a) => a.phoneNumber === phoneNumber);
}

export function markReminderSent(id: string, stage: ReminderStageId): void {
  const appt = appointments.get(id);
  if (!appt) return;
  if (!appt.remindersSent.includes(stage)) {
    appt.remindersSent.push(stage);
  }
}

export function updateStatus(id: string, status: StoredAppointment["status"]): void {
  const appt = appointments.get(id);
  if (!appt) return;
  appt.status = status;
}

