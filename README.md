# SMS Reminder Bot

A Twilio-based appointment reminder bot: sends staged SMS reminders (24h and 2h before an appointment) and handles inbound replies (confirm / cancel / reschedule / STOP) via webhook.

## How it works

- Outbound (`src/sendReminders.ts`, meant to run on a schedule/cron): checks every appointment against `getDueReminderStages` and sends whichever reminder stage is due, marking it sent so it's never sent twice.
- Inbound (`src/server.ts`): an Express webhook Twilio calls on every inbound SMS. The reply text is parsed into an intent (`src/parseReply.ts`) and the appointment status is updated accordingly, with a TwiML response sent back as the auto-reply.
- Scheduling and reply-parsing are pure functions (`reminderScheduling.ts`, `parseReply.ts`) with no I/O, so they're fully unit tested; the Twilio/Express glue code is not (it needs a live webhook or a real Twilio account to exercise).

## Why STOP handling matters

Any SMS bot needs to honor opt-outs - it's a carrier/compliance requirement, not just good manners. `parseReply` checks for STOP/unsubscribe first, before any other intent, so it always wins even if the rest of the message is noise.

## Tech stack

TypeScript - Node.js - Express - Twilio - Vitest

## Running it

```bash
npm install
cp .env.example .env
npm run dev
npm run send-reminders
```

Fill in TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN / TWILIO_FROM_NUMBER in .env first. Point a Twilio phone number's "A message comes in" webhook at POST /sms/inbound (e.g. via ngrok http 3000 in local dev).

## Testing

```bash
npm run test
```

Covers reply parsing (confirm/cancel/reschedule/stop, punctuation and casing variants) and reminder-stage scheduling (due/not-due, already-sent, cancelled, already-started).

## Status

Demo-data appointment store (`src/appointmentStore.ts`) stands in for a real database - swapping it for Postgres/Supabase is a single-file change since the rest of the app only depends on its small interface.
