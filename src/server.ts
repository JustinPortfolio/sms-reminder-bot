import express from "express";
import { config } from "./config.js";
import { parseReply } from "./parseReply.js";
import { findAppointmentByPhone, updateStatus } from "./appointmentStore.js";

const app = express();
app.use(express.urlencoded({ extended: false }));

function twiml(message: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${message}</Message></Response>`;
}

// Twilio posts inbound SMS here as application/x-www-form-urlencoded
// with `From` (E.164 phone number) and `Body` (message text).
app.post("/sms/inbound", (req, res) => {
  const from = String(req.body.From ?? "");
  const body = String(req.body.Body ?? "");
  const intent = parseReply(body);

  const appointment = findAppointmentByPhone(from);

  res.type("text/xml");

  if (!appointment) {
    res.send(twiml("We couldn't find an upcoming appointment for this number."));
    return;
  }

  switch (intent) {
    case "confirm":
      updateStatus(appointment.id, "confirmed");
      res.send(twiml(`Thanks ${appointment.customerName}, you're confirmed. See you soon!`));
      break;
    case "cancel":
      updateStatus(appointment.id, "cancelled");
      res.send(twiml(`Your appointment has been cancelled. Reply anytime to rebook.`));
      break;
    case "reschedule":
      res.send(twiml(`No problem - give us a call and we'll find a new time that works.`));
      break;
    case "stop":
      // In production this should also write to Twilio's opt-out list /
      // your own suppression list, mirroring the outreach bot's approach.
      res.send(twiml(""));
      break;
    case "unknown":
    default:
      res.send(twiml(`Sorry, I didn't catch that. Reply YES to confirm or CANCEL to cancel.`));
      break;
  }
});

app.get("/health", (_req, res) => res.json({ ok: true }));

if (process.env.NODE_ENV !== "test") {
  app.listen(config.port, () => console.log(`sms-reminder-bot listening on :${config.port}`));
}

export { app };

