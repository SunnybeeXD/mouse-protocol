export const ATTACKSHARK_DPI_REPORT_ID = 0x04;
export const ATTACKSHARK_LIGHTING_REPORT_ID = 0x05;
export const ATTACKSHARK_POLLING_REPORT_ID = 0x06;
export const ATTACKSHARK_WAKEUP_REPORT_ID = 0x07;
export const ATTACKSHARK_BUTTON_REPORT_ID = 0x08;
export const ATTACKSHARK_MACRO_REPORT_ID = 0x09;
export const ATTACKSHARK_PROFILE_REPORT_ID = 0x0a;
export const ATTACKSHARK_VERSION_REPORT_ID = 0x0b;
export const ATTACKSHARK_READ_REPORT_ID = 0xa0;

export const ATTACKSHARK_DPI_REPORT_LENGTH = 60;
export const ATTACKSHARK_LIGHTING_REPORT_LENGTH = 20;
export const ATTACKSHARK_POLLING_REPORT_LENGTH = 15;
export const ATTACKSHARK_WAKEUP_REPORT_LENGTH = 8;
export const ATTACKSHARK_BUTTON_REPORT_LENGTH = 63;
export const ATTACKSHARK_BUTTON_SLOT_COUNT = 19;
export const ATTACKSHARK_MACRO_LONG_REPORT_LENGTH = 131;
export const ATTACKSHARK_MACRO_SHORT_REPORT_LENGTH = 111;
export const ATTACKSHARK_DPI_STAGE_COUNT = 8;

export type AttackSharkButtonAction = readonly [number, number, number];

export const ATTACKSHARK_BUTTON_FUNCTIONS = {
  FUN_OFF: [1, 0, 0],
  FUN_CLICK: [2, 0, 0],
  FUN_MENU: [3, 0, 0],
  FUN_SCROLLING: [4, 0, 0],
  FUN_Backward: [5, 0, 0],
  FUN_Forward: [6, 0, 0],
  FUN_DBCLICK: [7, 0, 0],
  FUN_FIRE_BUTTON: [8, 0, 0],
  FUN_SCROLL_DOWN: [9, 0, 0],
  FUN_SCROLL_UP: [10, 0, 0],
  FUN_TILT_LEFT: [11, 0, 0],
  FUN_TILT_RIGHT: [12, 0, 0],
  FUN_DPI_CYCLE: [13, 0, 0],
  FUN_DPI_UP: [14, 0, 0],
  FUN_DPI_DOWN: [15, 0, 0],
  FUN_EASY_AIM: [16, 0, 3],
  FUN_SHORTCUT: [17, 0, 0],
  FUN_MACRO: [18, 0, 0],
  FUN_LAUNCH_PROGRAM: [19, 0, 0],
  FUN_WINDOWS: [20, 0, 0],
  FUN_MEDIA_PLAYER: [21, 0, 0],
  FUN_PREVIOUS: [22, 0, 0],
  FUN_NEXT: [23, 0, 0],
  FUN_PLAY_PAUSE: [24, 0, 0],
  FUN_MEDIA_STOP: [25, 0, 0],
  FUN_MUTE: [26, 0, 0],
  FUN_VOLUMEUP: [27, 0, 0],
  FUN_VOLUMEDOWN: [28, 0, 0],
  FUN_CALCULATORL: [29, 0, 0],
  FUN_EMAIL: [30, 0, 0],
  FUN_BROWSER_FORWARD: [32, 0, 0],
  FUN_BROWSER_BACKWARD: [33, 0, 0],
  FUN_BROWSER_STOP: [34, 0, 0],
  FUN_MY_COMPUTER: [35, 0, 0],
  FUN_BROWSER_REFRESH: [36, 0, 0],
  FUN_BROWSER_HOME: [37, 0, 0],
  FUN_BROWSER_SEARCH: [38, 0, 0],
  FUN_PRATE: [40, 0, 0],
  FUN_LED_LOOP: [41, 0, 3],
  FUN_SHOW_POWER: [43, 0, 0],
  FUN_PROFILE_CYCLE: [52, 0, 0],
  FUN_PROFILE_UP: [53, 0, 0],
  FUN_PROFILE_DOWN: [54, 0, 0],
  FUN_MODE_KEY: [60, 0, 0],
  FUN_BROWSER_FAVORITES: [17, 3, 18],
  FUN_CUT: [17, 1, 27],
  FUN_COPY: [17, 1, 6],
  FUN_PASTE: [17, 1, 25],
  FUN_OPEN: [17, 1, 18],
  FUN_NEW: [17, 1, 17],
  FUN_SAVE: [17, 1, 22],
  FUN_PRINT: [17, 1, 19],
  FUN_FIND: [17, 1, 9],
  FUN_REDO: [17, 1, 28],
  FUN_UNDO: [17, 1, 29],
  FUN_ZOOM_IN: [17, 1, 46],
  FUN_ZOOM_OUT: [17, 1, 45],
  FUN_ALL: [17, 1, 4],
  FUN_SWAP_WINDOWS: [17, 4, 43],
  FUN_SHOW_DESKTOP: [17, 8, 7],
  FUN_CLOSE_WINDOWS: [17, 4, 61],
  FUN_RUN: [17, 8, 21],
  FUN_LOCK_PC: [17, 8, 15],
  FUN_SCREEN_CAPTURE: [17, 10, 22],
} as const satisfies Readonly<Record<string, AttackSharkButtonAction>>;

export type AttackSharkButtonFunction = keyof typeof ATTACKSHARK_BUTTON_FUNCTIONS;

export const ATTACKSHARK_POLLING_CODES: ReadonlyMap<number, number> = new Map([
  [125, 0x08],
  [250, 0x04],
  [500, 0x02],
  [1000, 0x01],
]);

export const ATTACKSHARK_MODEL_IDS: ReadonlyMap<number, string> = new Map([
  [1, "X3Pro"], [2, "X8SE"], [4, "G3"], [5, "F3"], [6, "X8Plus"], [7, "X11SE"],
  [8, "X8Pro"], [12, "F7Pro"], [13, "F7"], [14, "G3Pro"], [16, "R1"], [20, "MV6"],
  [36, "V6"], [43, "M800Mini"], [44, "M2"], [48, "M900Pro"], [61, "M900Mini"],
  [65, "IN6"], [66, "In9"], [67, "G15"], [73, "F1"], [77, "X3"], [78, "X3Max"],
  [85, "X11"], [97, "G64"], [98, "V2Ultra"], [101, "V2MC"], [108, "G25"],
  [109, "DVSE4"], [119, "G11"], [133, "X6"], [135, "M740"], [144, "IN9Ultra"],
  [146, "IN6SE"], [147, "IN10"], [153, "INX"], [154, "MC031"], [158, "V2MAX"],
  [177, "X1"], [188, "M3"], [190, "X11Pro"], [195, "Vanguard"], [201, "G9PRO"],
  [203, "V2"], [204, "V2Ultra3955"], [229, "V3Pro"], [234, "V3"],
]);

export const ATTACKSHARK_CONNECTION_METHODS = {
  wired: 0x80,
  wireless: 0x81,
  wired8k: 0x82,
  wired8kAlt: 0x83,
  bluetooth: 0x84,
  wired8kHigh: 0x85,
} as const;

export function attackSharkSum16(bytes: Uint8Array, start: number, end: number = bytes.length): number {
  let sum = 0;
  for (let i = start; i < end; i++) sum = (sum + bytes[i]) & 0xffff;
  return sum;
}

function byte(value: number, name: string): number {
  if (!Number.isInteger(value) || value < 0 || value > 0xff) {
    throw new RangeError(`${name} must be a byte, got ${value}`);
  }
  return value;
}

function putSum16(buffer: Uint8Array, offset: number, sum: number): void {
  buffer[offset] = (sum >> 8) & 0xff;
  buffer[offset + 1] = sum & 0xff;
}

export interface AttackSharkLightingConfig {
  profileId?: number;
  lightMode: number;
  breathingSpeed: number;
  brightness: number;
  red: number;
  green: number;
  blue: number;
  closeTime: number;
  direction: number;
}

export type AttackSharkLightingVariant = "raw" | "scaled" | "packed";

export function buildAttackSharkLightingReport(
  config: AttackSharkLightingConfig,
  variant: AttackSharkLightingVariant = "raw",
): Uint8Array {
  const buffer = new Uint8Array(ATTACKSHARK_LIGHTING_REPORT_LENGTH);
  let mode = config.lightMode;
  let close = config.closeTime;
  let direction = config.direction;
  if (variant === "scaled") {
    close = close / 10;
    direction = direction / 2;
  } else if (variant === "packed") {
    mode = mode << 4;
    close = close * 2;
    direction = direction / 2;
  }
  buffer[0] = ATTACKSHARK_LIGHTING_REPORT_ID;
  buffer[1] = 0x0f;
  buffer[2] = byte(config.profileId ?? 1, "profileId");
  buffer[3] = byte(mode, "lightMode");
  buffer[4] = byte(config.breathingSpeed, "breathingSpeed");
  buffer[5] = byte(config.brightness, "brightness");
  buffer[6] = byte(config.red, "red");
  buffer[7] = byte(config.green, "green");
  buffer[8] = byte(config.blue, "blue");
  buffer[9] = byte(Math.trunc(close), "closeTime");
  buffer[10] = byte(Math.trunc(direction), "direction");
  putSum16(buffer, 11, attackSharkSum16(buffer, 3, 11));
  putSum16(buffer, 15, 4 + attackSharkSum16(buffer, 0, 15));
  return buffer;
}

export function buildAttackSharkPollingReport(code: number): Uint8Array {
  const buffer = new Uint8Array(ATTACKSHARK_POLLING_REPORT_LENGTH);
  buffer[0] = ATTACKSHARK_POLLING_REPORT_ID;
  buffer[1] = 0x09;
  buffer[2] = 0x01;
  buffer[3] = byte(code, "rate");
  buffer[4] = ~buffer[3] & 0xff;
  return buffer;
}

export function buildAttackSharkDualPollingReport(wiredCode: number, wirelessCode: number = wiredCode): Uint8Array {
  const wired = byte(wiredCode, "wiredCode");
  const wireless = byte(wirelessCode, "wirelessCode");
  if (wired > 0x0f || wireless > 0x0f) throw new RangeError("Dual polling codes are 4-bit");
  return buildAttackSharkPollingReport((wireless << 4) | wired);
}

export function buildAttackSharkPollingReportForHz(hz: number): Uint8Array {
  const code = ATTACKSHARK_POLLING_CODES.get(hz);
  if (code === undefined) throw new RangeError(`Unsupported polling rate: ${hz}`);
  return buildAttackSharkPollingReport(code);
}

export function buildAttackSharkWakeupReport(mode: number): Uint8Array {
  const buffer = new Uint8Array(ATTACKSHARK_WAKEUP_REPORT_LENGTH);
  buffer[0] = ATTACKSHARK_WAKEUP_REPORT_ID;
  buffer[1] = 0x08;
  buffer[2] = byte(mode, "mode");
  buffer[3] = ~mode & 0xff;
  buffer[5] = 0xff;
  return buffer;
}

export function buildAttackSharkButtonReport(
  actions: ReadonlyArray<AttackSharkButtonAction | AttackSharkButtonFunction>,
): Uint8Array {
  if (actions.length > ATTACKSHARK_BUTTON_SLOT_COUNT) {
    throw new RangeError(`At most ${ATTACKSHARK_BUTTON_SLOT_COUNT} button slots fit in one report`);
  }
  const buffer = new Uint8Array(ATTACKSHARK_BUTTON_REPORT_LENGTH);
  buffer[0] = ATTACKSHARK_BUTTON_REPORT_ID;
  buffer[1] = 59;
  buffer[2] = 1;
  let offset = 3;
  for (const entry of actions) {
    const triple = typeof entry === "string" ? ATTACKSHARK_BUTTON_FUNCTIONS[entry] : entry;
    buffer[offset++] = byte(triple[0], "button type");
    buffer[offset++] = byte(triple[1], "button modifier");
    buffer[offset++] = byte(triple[2], "button key");
  }
  putSum16(buffer, offset, attackSharkSum16(buffer, 3, offset));
  return buffer;
}

export function decodeAttackSharkButtonReport(data: Uint8Array): AttackSharkButtonAction[] | null {
  if (data.length < ATTACKSHARK_BUTTON_REPORT_LENGTH) return null;
  if (data[0] !== ATTACKSHARK_BUTTON_REPORT_ID || data[1] !== 59) return null;
  const actions: AttackSharkButtonAction[] = [];
  for (let slot = 0; slot < ATTACKSHARK_BUTTON_SLOT_COUNT; slot++) {
    const offset = 3 + slot * 3;
    actions.push([data[offset], data[offset + 1], data[offset + 2]]);
  }
  return actions;
}

export interface AttackSharkMacroAction {
  usageId: number;
  direction: 0 | 1;
  timeMs: number;
}

export type AttackSharkMacroLayout = "long10ms" | "long1ms" | "short1ms";

export interface AttackSharkMacroConfig {
  macroId: number;
  macroType?: number;
  loopCount: number;
  actions: readonly AttackSharkMacroAction[];
  layout?: AttackSharkMacroLayout;
}

function macroActionBytes(
  action: AttackSharkMacroAction,
  layout: AttackSharkMacroLayout,
): number[] {
  const usage = byte(action.usageId, "usageId");
  const time = action.timeMs;
  const press = action.direction === 0;
  const encode = (field: number): number[] => [press ? field | 1 : field | 0x80, usage];
  if (layout === "long10ms") {
    if (time > 1270) {
      const rest = Math.trunc((time % 200) / 10);
      const field = press ? rest | 1 : rest | 0x81;
      return [field, usage, byte(Math.trunc(time / 200), "long delay"), 3];
    }
    return encode(Math.trunc(time / 10));
  }
  if (time > 127) {
    const rest = time % 100;
    const field = press ? rest | 1 : rest | 0x81;
    return [field, usage, byte(Math.trunc(time / 100), "long delay"), 3];
  }
  return encode(Math.trunc(time));
}

export function buildAttackSharkMacroReport(config: AttackSharkMacroConfig): Uint8Array {
  const layout = config.layout ?? "long10ms";
  const long = layout !== "short1ms";
  const length = long ? ATTACKSHARK_MACRO_LONG_REPORT_LENGTH : ATTACKSHARK_MACRO_SHORT_REPORT_LENGTH;
  const countOffset = long ? 28 : 8;
  const actionOffset = long ? 29 : 9;
  const buffer = new Uint8Array(length);
  const macroType = config.macroType ?? 0;
  buffer[0] = ATTACKSHARK_MACRO_REPORT_ID;
  buffer[1] = length;
  buffer[2] = byte(config.macroId, "macroId");
  buffer[3] = byte(macroType, "macroType");
  buffer[7] = macroType === 0 ? byte(config.loopCount, "loopCount") : 1;
  let offset = actionOffset;
  let count = 0;
  for (const action of config.actions) {
    const bytes = macroActionBytes(action, layout);
    if (offset + bytes.length > length - 2) throw new RangeError("Macro does not fit in one report");
    for (const value of bytes) buffer[offset++] = value;
    count += bytes.length === 4 ? 2 : 1;
  }
  buffer[countOffset] = byte(count, "action count");
  putSum16(buffer, length - 2, attackSharkSum16(buffer, 3, offset));
  return buffer;
}

export interface AttackSharkParsedMacro {
  macroId: number;
  macroType: number;
  rgb: [number, number, number];
  loopCount: number;
  name: Uint8Array;
  actionCount: number;
  actions: AttackSharkMacroAction[];
}

export function parseAttackSharkMacroReply(data: Uint8Array): AttackSharkParsedMacro | null {
  if (data.length < 31 || data[2] !== ATTACKSHARK_MACRO_REPORT_ID) return null;
  const actionCount = data[30];
  const actions: AttackSharkMacroAction[] = [];
  let offset = 31;
  for (let i = 0; i < actionCount && offset < data.length - 1; i++) {
    const field = data[offset];
    const usageId = data[offset + 1];
    let direction: 0 | 1;
    let timeMs: number;
    if (field & 0x80) {
      direction = 1;
      timeMs = (field & 0x7f) * 10;
    } else if (field & 0x01) {
      direction = 0;
      timeMs = (field & 0x7f) * 10;
    } else {
      direction = 0;
      timeMs = field * 10;
    }
    if (offset + 3 < data.length && data[offset + 3] === 3) {
      timeMs += data[offset + 2] * 200;
      offset += 4;
      i++;
    } else {
      offset += 2;
    }
    actions.push({ usageId, direction, timeMs });
  }
  return {
    macroId: data[4],
    macroType: data[5],
    rgb: [data[6], data[7], data[8]],
    loopCount: data[9],
    name: data.slice(10, 30),
    actionCount,
    actions,
  };
}

export type AttackSharkDpiEncoding = "step50" | "step100" | "raw";

export function encodeAttackSharkDpiPair(dpi: number, encoding: AttackSharkDpiEncoding = "step50"): [number, number] {
  if (dpi === 0) return [0, 0];
  let value: number;
  if (encoding === "step50") value = Math.floor((dpi - 50) / 50);
  else if (encoding === "step100") value = Math.floor((dpi - 100) / 100);
  else value = dpi;
  return [value & 0xff, (value >> 8) & 0xff];
}

export function decodeAttackSharkDpiPair(low: number, high: number, encoding: AttackSharkDpiEncoding = "step50"): number {
  const value = (high << 8) | low;
  if (low === 0 && high === 0 && encoding !== "raw") return 0;
  if (encoding === "step50") return value * 50 + 50;
  if (encoding === "step100") return value * 100 + 100;
  return value;
}

export type AttackSharkRgb = readonly [number, number, number];

export interface AttackSharkDpiConfig {
  stages: readonly number[];
  activeStage: number;
  encoding?: AttackSharkDpiEncoding;
  profileId?: number;
  sensitivityX?: number;
  sensitivityY?: number;
  enabledMask?: number;
  xDoubleFlags?: number;
  yDoubleFlags?: number;
  indicatorColors?: readonly AttackSharkRgb[];
  indicatorType?: number;
}

export const ATTACKSHARK_DPI_INDICATOR_COLORS: readonly AttackSharkRgb[] = [
  [255, 0, 0],
  [0, 255, 0],
  [0, 0, 255],
  [255, 255, 0],
  [0, 255, 255],
  [255, 0, 255],
  [255, 64, 0],
  [255, 255, 255],
];

export function buildAttackSharkDpiReport(config: AttackSharkDpiConfig): Uint8Array {
  const buffer = new Uint8Array(ATTACKSHARK_DPI_REPORT_LENGTH);
  const encoding = config.encoding ?? "step50";
  const colors = config.indicatorColors ?? ATTACKSHARK_DPI_INDICATOR_COLORS;
  buffer[0] = ATTACKSHARK_DPI_REPORT_ID;
  buffer[1] = 56;
  buffer[2] = byte(config.profileId ?? 1, "profileId");
  buffer[3] = byte(config.sensitivityX ?? 0, "sensitivityX");
  buffer[4] = byte(config.sensitivityY ?? 1, "sensitivityY");
  buffer[5] = byte(config.enabledMask ?? 63, "enabledMask");
  buffer[6] = byte(config.xDoubleFlags ?? 0, "xDoubleFlags");
  buffer[7] = byte(config.yDoubleFlags ?? 1, "yDoubleFlags");
  for (let i = 0; i < ATTACKSHARK_DPI_STAGE_COUNT; i++) {
    const [low, high] = encodeAttackSharkDpiPair(config.stages[i] ?? 0, encoding);
    buffer[8 + i] = low;
    buffer[16 + i] = high;
  }
  buffer[24] = byte(config.activeStage, "activeStage");
  for (let i = 0; i < ATTACKSHARK_DPI_STAGE_COUNT; i++) {
    const color = colors[i] ?? [0, 0, 0];
    buffer[25 + i * 3] = byte(color[0], "red");
    buffer[26 + i * 3] = byte(color[1], "green");
    buffer[27 + i * 3] = byte(color[2], "blue");
  }
  buffer[49] = byte(config.indicatorType ?? 2, "indicatorType");
  putSum16(buffer, 50, attackSharkSum16(buffer, 3, 50));
  return buffer;
}

export function decodeAttackSharkDpiReport(
  data: Uint8Array,
  encoding: AttackSharkDpiEncoding = "step50",
): AttackSharkDpiConfig | null {
  if (data.length < 52) return null;
  if (data[0] !== ATTACKSHARK_DPI_REPORT_ID || data[1] !== 56) return null;
  const expected = (data[50] << 8) | data[51];
  if (attackSharkSum16(data, 3, 50) !== expected) return null;
  const stages: number[] = [];
  const indicatorColors: AttackSharkRgb[] = [];
  for (let i = 0; i < ATTACKSHARK_DPI_STAGE_COUNT; i++) {
    stages.push(decodeAttackSharkDpiPair(data[8 + i], data[16 + i], encoding));
    indicatorColors.push([data[25 + i * 3], data[26 + i * 3], data[27 + i * 3]]);
  }
  return {
    stages,
    activeStage: data[24],
    encoding,
    profileId: data[2],
    sensitivityX: data[3],
    sensitivityY: data[4],
    enabledMask: data[5],
    xDoubleFlags: data[6],
    yDoubleFlags: data[7],
    indicatorColors,
    indicatorType: data[49],
  };
}
