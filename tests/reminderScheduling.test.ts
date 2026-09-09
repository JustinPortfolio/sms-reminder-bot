import { describe, it, expect } from "vitest";
import { getDueReminderStages, type Appointment } from "../src/reminderScheduling.js";

function makeAppointment(overrides: Partial<Appointment> = {}): Appointment {
  return {
    id: "apt-1",
    startsAt: new Date(Date.now() + 30 * 60 * 60 * 1000), // 30h from now
    status: "scheduled",
    remindersSent: [],
    ...overrides,
  };
}

describe("getDueReminderStages", () => {
  it("returns nothing when the appointment is more than 24h away", () => {
    const appt = makeAppointment({ startsAt: new Date(Date.now() + 30 * 60 * 60 * 1000) });
    expect(getDueReminderStages(appt, new Date())).toEqual([]);
  });

  it("returns the 24h stage when within 24h but not yet sent", () => {
    const appt = makeAppointment({ startsAt: new Date(Date.now() + 10 * 60 * 60 * 1000) });
    expect(getDueReminderStages(appt, new Date())).toEqual(["24h"]);
  });

  it("returns both stages when within 2h and neither has been sent", () => {
    const appt = makeAppointment({ startsAt: new Date(Date.now() + 1 * 60 * 60 * 1000) });
    expect(getDueReminderStages(appt, new Date())).toEqual(["24h", "2h"]);
  });

  it("does not re-return a stage that was already sent", () => {
    const appt = makeAppointment({
      startsAt: new Date(Date.now() + 1 * 60 * 60 * 1000),
      remindersSent: ["24h"],
    });
    expect(getDueReminderStages(appt, new Date())).toEqual(["2h"]);
  });

  it("returns nothing for a cancelled appointment", () => {
    const appt = makeAppointment({
      startsAt: new Date(Date.now() + 1 * 60 * 60 * 1000),
      status: "cancelled",
    });
    expect(getDueReminderStages(appt, new Date())).toEqual([]);
  });

  it("returns nothing once the appointment has started", () => {
    const appt = makeAppointment({ startsAt: new Date(Date.now() - 60 * 1000) });
    expect(getDueReminderStages(appt, new Date())).toEqual([]);
  });
});

