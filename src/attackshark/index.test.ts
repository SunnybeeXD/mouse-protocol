import assert from "node:assert/strict";
import test from "node:test";

import {
  ATTACKSHARK_BUTTON_FUNCTIONS,
  buildAttackSharkButtonReport,
  buildAttackSharkDpiReport,
  buildAttackSharkDualPollingReport,
  buildAttackSharkLightingReport,
  buildAttackSharkMacroReport,
  buildAttackSharkPollingReport,
  buildAttackSharkPollingReportForHz,
  buildAttackSharkWakeupReport,
  decodeAttackSharkButtonReport,
  decodeAttackSharkDpiReport,
  encodeAttackSharkDpiPair,
  parseAttackSharkMacroReply,
} from "./index.ts";

const hex = (data: Uint8Array): string => Buffer.from(data).toString("hex");

const LIGHT = {
  lightMode: 3,
  breathingSpeed: 3,
  brightness: 168,
  red: 12,
  green: 34,
  blue: 255,
  closeTime: 60,
  direction: 8,
};

const ACTIONS = [
  { usageId: 4, direction: 0 as const, timeMs: 10 },
  { usageId: 4, direction: 1 as const, timeMs: 50 },
  { usageId: 5, direction: 0 as const, timeMs: 2000 },
  { usageId: 5, direction: 1 as const, timeMs: 10 },
];

test("lighting frames match the vendor configurator output for each model variant", () => {
  assert.equal(hex(buildAttackSharkLightingReport(LIGHT, "raw")), "050f010303a80c22ff3c08021f00000259000000");
  assert.equal(hex(buildAttackSharkLightingReport(LIGHT, "scaled")), "050f010303a80c22ff060401e5000002e4000000");
  assert.equal(hex(buildAttackSharkLightingReport(LIGHT, "packed")), "050f013003a80c22ff7804028400000323000000");
});

test("lighting rejects values that do not fit a byte", () => {
  assert.throws(() => buildAttackSharkLightingReport({ ...LIGHT, red: 256 }), RangeError);
});

test("wake-up frame carries the mode and its complement", () => {
  assert.equal(hex(buildAttackSharkWakeupReport(0)), "070800ff00ff0000");
  assert.equal(hex(buildAttackSharkWakeupReport(1)), "070801fe00ff0000");
  assert.equal(hex(buildAttackSharkWakeupReport(2)), "070802fd00ff0000");
});

test("polling frames carry the rate code and its complement", () => {
  assert.equal(hex(buildAttackSharkPollingReport(1)), "06090101fe00000000000000000000");
  assert.equal(hex(buildAttackSharkPollingReport(8)), "06090108f700000000000000000000");
  assert.equal(hex(buildAttackSharkPollingReportForHz(500)), "06090102fd00000000000000000000");
  assert.equal(hex(buildAttackSharkDualPollingReport(2, 8)), "060901827d00000000000000000000");
  assert.equal(hex(buildAttackSharkDualPollingReport(4)), "06090144bb00000000000000000000");
  assert.throws(() => buildAttackSharkPollingReportForHz(333), RangeError);
  assert.throws(() => buildAttackSharkDualPollingReport(16, 1), RangeError);
});

test("button frame matches the vendor output and round-trips", () => {
  const actions = [
    ATTACKSHARK_BUTTON_FUNCTIONS.FUN_CLICK,
    ATTACKSHARK_BUTTON_FUNCTIONS.FUN_MENU,
    ATTACKSHARK_BUTTON_FUNCTIONS.FUN_SCROLLING,
    ATTACKSHARK_BUTTON_FUNCTIONS.FUN_Forward,
    ATTACKSHARK_BUTTON_FUNCTIONS.FUN_Backward,
    ATTACKSHARK_BUTTON_FUNCTIONS.FUN_DPI_CYCLE,
    ATTACKSHARK_BUTTON_FUNCTIONS.FUN_COPY,
    ATTACKSHARK_BUTTON_FUNCTIONS.FUN_EASY_AIM,
  ];
  const frame = buildAttackSharkButtonReport(actions);
  assert.equal(
    hex(frame),
    "083b010200000300000400000600000500000d0000110106100003004c00000000000000000000000000000000000000000000000000000000000000000000",
  );
  assert.deepEqual(buildAttackSharkButtonReport([
    "FUN_CLICK", "FUN_MENU", "FUN_SCROLLING", "FUN_Forward", "FUN_Backward", "FUN_DPI_CYCLE", "FUN_COPY", "FUN_EASY_AIM",
  ]), frame);
  const decoded = decodeAttackSharkButtonReport(frame);
  assert.deepEqual(decoded?.slice(0, 8), actions);
  assert.throws(() => buildAttackSharkButtonReport(new Array(20).fill("FUN_OFF")), RangeError);
});

test("macro frames match the vendor output for every layout", () => {
  assert.equal(
    hex(buildAttackSharkMacroReport({ macroId: 3, loopCount: 7, actions: ACTIONS, layout: "long10ms" })),
    "09830300000000070000000000000000000000000000000000000000050104850401050a0381050000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000133",
  );
  assert.equal(
    hex(buildAttackSharkMacroReport({ macroId: 3, macroType: 1, loopCount: 7, actions: ACTIONS, layout: "long10ms" })),
    "09830301000000010000000000000000000000000000000000000000050104850401050a038105000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000012e",
  );
  assert.equal(
    hex(buildAttackSharkMacroReport({ macroId: 3, loopCount: 7, actions: ACTIONS, layout: "long1ms" })),
    "09830300000000070000000000000000000000000000000000000000050b04b204010514038a05000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000017d",
  );
  assert.equal(
    hex(buildAttackSharkMacroReport({ macroId: 3, loopCount: 7, actions: ACTIONS, layout: "short1ms" })),
    "096f030000000007050b04b204010514038a05000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000017d",
  );
});

test("macro replies parse with the vendor reading, where a press delay always gains its set low bit", () => {
  const frame = buildAttackSharkMacroReport({ macroId: 3, loopCount: 7, actions: ACTIONS, layout: "long10ms" });
  const reply = new Uint8Array(frame.length + 2);
  reply.set(frame, 2);
  reply[0] = 0x80;
  reply[1] = 77;
  const parsed = parseAttackSharkMacroReply(reply);
  assert.ok(parsed);
  assert.equal(parsed.macroId, 3);
  assert.equal(parsed.loopCount, 7);
  assert.equal(parsed.actionCount, 5);
  assert.deepEqual(parsed.actions, [
    { usageId: 4, direction: 0, timeMs: 10 },
    { usageId: 4, direction: 1, timeMs: 50 },
    { usageId: 5, direction: 0, timeMs: 2010 },
    { usageId: 5, direction: 1, timeMs: 10 },
  ]);
});

test("DPI pair encodings match the vendor tables", () => {
  assert.deepEqual(encodeAttackSharkDpiPair(1200), [23, 0]);
  assert.deepEqual(encodeAttackSharkDpiPair(0), [0, 0]);
  assert.deepEqual(encodeAttackSharkDpiPair(26000), [7, 2]);
  assert.deepEqual(encodeAttackSharkDpiPair(1200, "step100"), [11, 0]);
  assert.deepEqual(encodeAttackSharkDpiPair(1200, "raw"), [176, 4]);
});

test("DPI frame matches the vendor output and round-trips", () => {
  const frame = buildAttackSharkDpiReport({ stages: [400, 800, 1200, 1600, 3200, 5000, 0, 0], activeStage: 3 });
  assert.equal(frame.length, 60);
  assert.equal(
    hex(frame),
    "04380100013f0001070f171f3f630000000000000000000003ff000000ff000000ffffff0000ffffff00ffff4000ffffff020e670000000000000000",
  );
  const decoded = decodeAttackSharkDpiReport(frame);
  assert.deepEqual(decoded?.stages, [400, 800, 1200, 1600, 3200, 5000, 0, 0]);
  assert.equal(decoded?.activeStage, 3);
  const corrupted = new Uint8Array(frame);
  corrupted[9] ^= 0xff;
  assert.equal(decodeAttackSharkDpiReport(corrupted), null);
});
