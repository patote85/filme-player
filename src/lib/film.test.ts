import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { atAsk, atTime, canResume, clock, replyHref, ASK_AT, RUNTIME } from "./film.ts";

describe("clock", () => {
  it("formats whole minutes from the runtime", () => {
    assert.equal(clock(0), "0:00");
    assert.equal(clock(RUNTIME), "2:48");
    assert.equal(clock(61), "1:01");
  });

  it("treats a bad number as the start", () => {
    assert.equal(clock(Number.NaN), "0:00");
    assert.equal(clock(-4), "0:00");
  });
});

describe("canResume", () => {
  it("keeps a position after the open and before the last eight seconds", () => {
    assert.equal(canResume(3), false);
    assert.equal(canResume(3.01), true);
    assert.equal(canResume(RUNTIME - 8), false);
    assert.equal(canResume(RUNTIME - 8.01), true);
    assert.equal(canResume(RUNTIME), false);
  });
});

describe("atTime", () => {
  const cues: [{ t: number; line: string }, ...{ t: number; line: string }[]] = [
    { t: 0, line: "abre" },
    { t: 10, line: "meio" },
  ];

  it("holds the previous cue until 80ms before the next", () => {
    assert.equal(atTime(cues, 0).line, "abre");
    assert.equal(atTime(cues, 9.91).line, "abre");
    assert.equal(atTime(cues, 9.92).line, "meio");
  });
});

describe("replyHref", () => {
  it("stays on the page until a number is set", () => {
    assert.equal(replyHref("Quero, pra sempre"), "#");
  });
});
describe("atAsk", () => {
  it("opens her question right after the last line at 2:38", () => {
    assert.equal(clock(ASK_AT), "2:38");
    assert.equal(atAsk(ASK_AT - 0.01), false);
    assert.equal(atAsk(ASK_AT), true);
    assert.equal(atAsk(Number.NaN), false);
  });
});
