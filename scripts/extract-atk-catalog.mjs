import { readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const SENSORS = new Map([
  "PAW3950Ultra", "PAW3950DM", "PAW3950", "PAW3955Master", "PAW3395Ultra", "PAW3395", "PAW3395SE",
  "PAW3315", "PAW3311", "PAW3320", "CORE26K",
].map((name) => [name.toLowerCase(), name]));

const FEATURE_FLAGS = new Map([
  ["DpiRgb", ["noDpiRGB", false]],
  ["FarDistance", ["noFarDistance", false]],
  ["BottomButton", ["noBottomButton", false]],
  ["AthleticsMax", ["noAthleticsMax", false]],
  ["SensorAngle", ["noSensorAngle", false]],
  ["XyDpi", ["noXyDpi", false]],
  ["DpiToggle", ["supportDpiToggle", true]],
]);

const FLAGS = [
  "identifyByCidMid", "is54H20", "isNearlink", "middleDpiButton", "noAthleticsMax", "noBottomButton", "noDpiRGB",
  "noFarDistance", "noSensorAngle", "noShowPower", "noXyDpi", "noZeroKeyDebounce", "supportDpiToggle", "upgradeTogether",
];

function matchClose(text, open) {
  const pairs = { "{": "}", "[": "]", "(": ")" };
  const stack = [];
  for (let i = open; i < text.length; i++) {
    const c = text[i];
    if (c === '"' || c === "'" || c === "`") {
      for (i++; i < text.length && text[i] !== c; i++) if (text[i] === "\\") i++;
    } else if (c in pairs) {
      stack.push(pairs[c]);
    } else if (c === "}" || c === "]" || c === ")") {
      if (stack.pop() !== c) throw new Error(`unbalanced at ${i}`);
      if (stack.length === 0) return i;
    }
  }
  throw new Error("unterminated object");
}

function topLevel(body) {
  const fields = new Map();
  let i = 0;
  while (i < body.length) {
    while (body[i] === "," || body[i] === " ") i++;
    if (i >= body.length) break;
    if (body.startsWith("...", i)) {
      let depth = 0;
      for (; i < body.length; i++) {
        if ("{[(".includes(body[i])) depth++;
        else if ("}])".includes(body[i])) depth--;
        else if (body[i] === "," && depth === 0) break;
      }
      continue;
    }
    const key = /^(?:"([^"]+)"|\[[\w$]+\.([A-Za-z_$][\w$]*)\]|([A-Za-z_$][\w$]*))\s*:/.exec(body.slice(i));
    if (!key) {
      for (let depth = 0; i < body.length; i++) {
        if ("{[(".includes(body[i])) depth++;
        else if ("}])".includes(body[i])) depth--;
        else if (body[i] === "," && depth === 0) break;
      }
      continue;
    }
    i += key[0].length;
    const start = i;
    let depth = 0;
    for (; i < body.length; i++) {
      const c = body[i];
      if (c === '"' || c === "'" || c === "`") {
        for (i++; i < body.length && body[i] !== c; i++) if (body[i] === "\\") i++;
      } else if ("{[(".includes(c)) depth++;
      else if ("}])".includes(c)) depth--;
      else if (c === "," && depth === 0) break;
    }
    fields.set(key[1] ?? key[2] ?? key[3], body.slice(start, i).trim());
  }
  return fields;
}

function featuresOf(custom) {
  const present = new Set(FLAGS.filter((flag) => custom.get(flag) === "!0"));
  const block = custom.get("deviceFeatures");
  if (block?.startsWith("{")) {
    for (const [name, value] of topLevel(block.slice(1, -1))) {
      const flag = FEATURE_FLAGS.get(name);
      if (flag && value === (flag[1] ? "!0" : "!1")) present.add(flag[0]);
    }
  }
  return Object.fromEntries(FLAGS.filter((flag) => present.has(flag)).map((flag) => [flag, true]));
}

const str = (value) => (value && /^"((?:[^"\\]|\\.)*)"$/.exec(value) ? JSON.parse(value) : null);

export function extractEntries(text) {
  const found = [];
  for (let at = text.indexOf("{vendorId:"); at !== -1; at = text.indexOf("{vendorId:", at + 1)) {
    let end;
    try { end = matchClose(text, at); } catch { continue; }
    const fields = topLevel(text.slice(at + 1, end));
    const custom = fields.get("custom");
    if (!custom?.startsWith("{") || fields.get("receiver") === "!0") continue;
    const c = topLevel(custom.slice(1, -1));
    const sensorRef = /\.(\w+)$/.exec(c.get("sensor") ?? "");
    if (!sensorRef || !c.has("mouseCidMid")) continue;
    const cidMid = str(c.get("mouseCidMid"));
    if (cidMid === null) console.warn(`CID/MID of ${str(c.get("name")) ?? str(c.get("title"))} is computed, left null`);
    const sensor = SENSORS.get(sensorRef[1].toLowerCase());
    if (!sensor) throw new Error(`unknown sensor ${sensorRef[1]} (add it to AtkCatalogSensor and the codec first)`);
    const name = str(c.get("name")) ?? str(c.get("title"));
    if (!name) continue;
    found.push({
      vendorId: Number(fields.get("vendorId")),
      productId: Number(fields.get("productId")),
      brand: /^VXE\b/i.test(name) ? "VXE" : "ATK",
      model: name,
      sensor,
      cidMid,
      firmwareMark: str(c.get("firmwareMark")),
      usagePage: Number(fields.get("usagePage")),
      usage: Number(fields.get("usage")),
      features: featuresOf(c),
    });
  }
  return found;
}

export function dedupe(entries) {
  const byKey = new Map();
  const conflicts = [];
  const variants = [];
  for (const entry of entries) {
    const key = `${entry.vendorId}:${entry.productId}:${entry.model}`;
    const prior = byKey.get(key);
    if (!prior) byKey.set(key, entry);
    else if (prior.cidMid !== entry.cidMid) variants.push(entry);
    else if (JSON.stringify(prior) !== JSON.stringify(entry)) conflicts.push([prior, entry]);
  }
  const sorted = [...byKey.values()].map((entry, order) => ({ entry, order }))
    .sort((a, b) => a.entry.vendorId - b.entry.vendorId || a.entry.productId - b.entry.productId || a.order - b.order)
    .map(({ entry }) => entry);
  return { entries: sorted, conflicts, variants };
}

const hex = (n) => `0x${n.toString(16).padStart(4, "0")}`;

function render(entries) {
  return entries.map((e) => {
    const features = Object.keys(e.features);
    return [
      "  {",
      `    vendorId: ${hex(e.vendorId)},`,
      `    productId: ${hex(e.productId)},`,
      `    brand: ${JSON.stringify(e.brand)},`,
      `    model: ${JSON.stringify(e.model)},`,
      `    sensor: ${JSON.stringify(e.sensor)},`,
      `    cidMid: ${JSON.stringify(e.cidMid)},`,
      `    firmwareMark: ${e.firmwareMark === null ? "null" : JSON.stringify(e.firmwareMark)},`,
      `    usagePage: ${e.usagePage},`,
      `    usage: ${e.usage},`,
      `    features: ${features.length ? `{ ${features.map((f) => `${f}: true`).join(", ")} }` : "{  }"},`,
      "  },",
    ].join("\n");
  }).join("\n");
}

const ENTRY = new RegExp(
  String.raw`\{\n\s+vendorId: (0x[0-9a-f]+),\n\s+productId: (0x[0-9a-f]+),\n\s+brand: "(\w+)",\n\s+model: ("(?:[^"\\]|\\.)*"),`
  + String.raw`\n\s+sensor: "(\w+)",\n\s+cidMid: ("[^"\n]*"|null),\n\s+firmwareMark: ("[^"\n]*"|null),\n\s+usagePage: (\d+),\n\s+usage: (\d+),`
  + String.raw`\n\s+features: \{([^}\n]*)\},`,
  "g",
);

export function parseExisting(text) {
  return [...text.matchAll(ENTRY)].map((m) => ({
    vendorId: Number(m[1]),
    productId: Number(m[2]),
    brand: m[3],
    model: JSON.parse(m[4]),
    sensor: m[5],
    cidMid: JSON.parse(m[6]),
    firmwareMark: JSON.parse(m[7]),
    usagePage: Number(m[8]),
    usage: Number(m[9]),
    features: Object.fromEntries([...m[10].matchAll(/(\w+): true/g)].map((f) => [f[1], true])),
  }));
}

export function keepRetired(entries, previous) {
  const listed = new Set(entries.map((e) => `${e.vendorId}:${e.productId}`));
  const retired = previous.filter((e) => !listed.has(`${e.vendorId}:${e.productId}`));
  const merged = [...entries, ...retired].map((entry, order) => ({ entry, order }))
    .sort((a, b) => a.entry.vendorId - b.entry.vendorId || a.entry.productId - b.entry.productId || a.order - b.order)
    .map(({ entry }) => entry);
  return { entries: merged, retired };
}

function files(path) {
  if (!statSync(path).isDirectory()) return [path];
  return readdirSync(path).filter((name) => name.endsWith(".js")).map((name) => join(path, name));
}

function main(argv) {
  const args = argv.slice(2);
  const take = (flag) => {
    const i = args.indexOf(flag);
    if (i === -1) return null;
    return args.splice(i, 2)[1];
  };
  const out = take("--out");
  const version = take("--version");
  const entry = take("--entry");
  if (!out || !version || !entry || args.length === 0) {
    console.error("usage: extract-atk-catalog.mjs <bundle-dir-or-file>... --out <catalog.ts> --version <x.y.z> --entry <index-file.js>");
    process.exit(2);
  }
  const text = args.flatMap(files).map((file) => readFileSync(file, "utf8")).join("\n");
  const extracted = dedupe(extractEntries(text));
  const { conflicts, variants } = extracted;
  const previous = parseExisting(readFileSync(out, "utf8"));
  const { entries, retired } = keepRetired(extracted.entries, previous);
  for (const e of retired) console.warn(`kept, no longer listed by the hub: ${hex(e.vendorId)}:${hex(e.productId)} ${e.model} ${e.cidMid}`);
  if (variants.length) console.warn(`${variants.length} colour variants share a USB id and model name with another entry and are not listed`);
  for (const [a, b] of conflicts) console.warn(`conflict kept first: ${a.vendorId}:${a.productId} ${a.cidMid} ${a.model} vs ${b.model}`);

  const existing = readFileSync(out, "utf8");
  const start = existing.indexOf("export const ATK_MOUSE_DEVICES");
  const open = existing.indexOf("[\n", start) + 2;
  const close = existing.indexOf("\n];\n", open);
  const sharedCidMid = new Map();
  for (const e of entries) sharedCidMid.set(e.cidMid, (sharedCidMid.get(e.cidMid) ?? 0) + 1);
  const sharedPairs = [...sharedCidMid.values()].filter((n) => n > 1).length;
  const byUsb = new Map();
  for (const e of entries) {
    const k = `${e.vendorId}:${e.productId}`;
    byUsb.set(k, [...(byUsb.get(k) ?? []), e]);
  }
  const sharedUsb = [...byUsb.values()].filter((list) => list.length > 1);
  const sharedUsbText = sharedUsb.map((list) => `${list[0].vendorId.toString(16)}:${list[0].productId.toString(16)}`);
  const headEnd = existing.indexOf("export type AtkCatalogSensor");
  const header = [
    `// AUTO-GENERATED from the ATK HUB web bundle (hub.atk.pro v${version},`,
    `// static/${entry}). Do not edit by hand; re-run scripts/extract-atk-catalog.mjs.`,
    "//",
    "// Identity model (matches the vendor app):",
    "//  - Primary key is USB vendorId:productId.",
    `//  - CID/MID (command 0x10) is NOT unique: ${sharedPairs} (cid,mid) pairs are shared by`,
    "//    two or more distinct models.",
    `//  - ${sharedUsb.length} vendorId:productId pairs are ALSO shared and disambiguated only by`,
    `//    CID/MID (${sharedUsbText.join(", ")}).`,
    "//  - Resolve with atkDeviceForHid(), passing the runtime CID/MID when known.",
    "//",
    "// `features` mirrors the vendor filter flags; an absent flag means the vendor",
    "// default (feature present). Semantics are inferred from vendor field names.",
    "",
    "",
  ].join("\n");
  writeFileSync(out, header + existing.slice(headEnd, open) + render(entries) + existing.slice(close));
  console.log(`${entries.length} entries written to ${out}`);
}

if (import.meta.url === `file://${process.argv[1]}`) main(process.argv);
