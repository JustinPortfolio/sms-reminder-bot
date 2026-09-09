import twilio from "twilio";
import { config } from "./config.js";
import { getAllAppointments, markReminderSent, seedDemoAppointments } from "./appointmentStore.js";
import { getDueReminderStages } from "./reminderScheduling.js";

const MESSAGES: Record<string, (customerName: string) => string> = {
  "24h": (name) => `Hi ${name}, this is a reminder about your appointment tomorrow. Reply YES to confirm or CANCEL to cancel.`,
  "2h": (name) => `Hi ${name}, your appointment is in about 2 hours. See you soon! Reply CANCEL if you can no longer make it.`,
};

async function main() {
  // Demo data so this is runnable out of the box; swap for a real DB query.
  seedDemoAppointments();

  const client = twilio(config.twilio.accountSid, config.twilio.authToken);
  const now = new Date();

  for (const appointment of getAllAppointments()) {
    const dueStages = getDueReminderStages(appointment, now);

    for (const stage of dueStages) {
      const body = MESSAGES[stage](appointment.customerName);
      await client.messages.create({
        to: appointment.phoneNumber,
        from: config.twilio.fromNumber,
        body,
      });
      markReminderSent(appointment.id, stage);
      console.log(`Sent ${stage} reminder to ${appointment.phoneNumber} for ${appointment.id}`);
    }
  }
}

main().catch((err) => {
  console.error("sendReminders failed:", err);
  process.exitCode = 1;
});

