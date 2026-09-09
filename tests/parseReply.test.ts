import { describe, it, expect } from "vitest";
import { parseReply } from "../src/parseReply.js";

describe("parseReply", () => {
  it("recognizes confirm variants", () => {
    expect(parseReply("Yes")).toBe("confirm");
    expect(parseReply("yes!")).toBe("confirm");
    expect(parseReply("y")).toBe("confirm");
    expect(parseReply("Confirmed, see you then")).toBe("confirm");
  });

  it("recognizes cancel variants", () => {
    expect(parseReply("no")).toBe("cancel");
    expect(parseReply("Cancel please")).toBe("cancel");
    expect(parseReply("CANCELLED")).toBe("cancel");
  });

  it("recognizes reschedule variants", () => {
    expect(parseReply("reschedule")).toBe("reschedule");
    expect(parseReply("can we change the time?")).toBe("reschedule");
  });

  it("recognizes stop/opt-out variants", () => {
    expect(parseReply("STOP")).toBe("stop");
    expect(parseReply("unsubscribe")).toBe("stop");
  });

  it("falls back to unknown for unrelated text", () => {
    expect(parseReply("What time again?")).toBe("unknown");
    expect(parseReply("")).toBe("unknown");
  });

  it("is case-insensitive and trims trailing punctuation", () => {
    expect(parseReply("YES!!!")).toBe("confirm");
    expect(parseReply("  no.  ")).toBe("cancel");
  });
});

