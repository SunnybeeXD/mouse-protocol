import assert from "node:assert/strict";
import test from "node:test";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";

const script = pathToFileURL(resolve(import.meta.dirname, "../../../scripts/extract-atk-catalog.mjs")).href;
const { extractEntries, dedupe, keepRetired, parseExisting } = await import(script);

const BUNDLE = [
  `{vendorId:14139,productId:4142,usagePage:65284,usage:2,custom:{name:"ATK F1 Ultimate",sensor:mt.PAW3950Ultra,skin:u8,mouseCidMid:"2,42",firmwareMark:"f1",noDpiRGB:!0,noBottomButton:!0}}`,
  `{vendorId:14139,productId:4143,usagePage:65284,usage:2,custom:{name:"ATK X1 Ultra",sensor:n.PAW3950Ultra,skin:[...ae],mouseCidMid:"2,43",firmwareMark:"x1",deviceFeatures:{[d.BottomButton]:!1,[d.DpiRgb]:!1,[d.DpiToggle]:!0,[d.FastTrigger]:!0}}}`,
  `{vendorId:14139,productId:4728,usagePage:65284,usage:2,receiver:!0,custom:{name:"Wireless mouse 8k dongle-L",singleRgb:!0,firmwareMark:"dongle"}}`,
  `{vendorId:14139,productId:4738,usagePage:65282,usage:2,custom:{name:"ATK Duckbill ELITE",sensor:mt.PAW3950Ultra,mouseCidMid:\`\${Dt.X},1\`,firmwareMark:"duckbill"}}`,
  `{vendorId:14139,productId:4900,usagePage:65285,usage:1,custom:{name:"Mouse",sensor:u.PAW3955MASTER,mouseCidMid:"1,23",firmwareMark:"x1",isNearlink:!0}}`,
  `{vendorId:14139,productId:4900,usagePage:65285,usage:1,custom:{name:"Mouse",sensor:u.PAW3955MASTER,mouseCidMid:"1,99",firmwareMark:"x1"}}`,
  `{vendorId:14139,productId:4600,usagePage:65376,usage:97,custom:{...dc,title:"ATK RS7"}}`,
].join(",");

test("flags are read from both the plain keys and the deviceFeatures block", () => {
  const byPid = new Map(extractEntries(BUNDLE).map((entry: { productId: number }) => [entry.productId, entry]));
  assert.deepEqual((byPid.get(4142) as { features: object }).features, { noBottomButton: true, noDpiRGB: true });
  assert.deepEqual((byPid.get(4143) as { features: object }).features, { noBottomButton: true, noDpiRGB: true, supportDpiToggle: true });
  assert.equal((byPid.get(4900) as { sensor: string }).sensor, "PAW3955Master");
});

test("receivers, keyboards and entries without a sensor are skipped, a computed CID/MID becomes null", () => {
  const entries = extractEntries(BUNDLE) as Array<{ productId: number; cidMid: string | null }>;
  assert.equal(entries.some((entry) => entry.productId === 4728 || entry.productId === 4600), false);
  assert.equal(entries.find((entry) => entry.productId === 4738)?.cidMid, null);
});

test("a second CID/MID under the same USB id and model name is not listed", () => {
  const { entries, variants } = dedupe(extractEntries(BUNDLE));
  assert.equal(entries.filter((entry: { productId: number }) => entry.productId === 4900).length, 1);
  assert.equal(variants.length, 1);
});

test("an unknown sensor fails loudly instead of dropping the mouse", () => {
  const bundle = `{vendorId:14139,productId:1,usagePage:65284,usage:2,custom:{name:"New",sensor:q.PAW9999,mouseCidMid:"1,1"}}`;
  assert.throws(() => extractEntries(bundle), /unknown sensor PAW9999/);
});

test("entries the hub no longer lists are kept, renamed ids are not duplicated", () => {
  const fresh = extractEntries(BUNDLE.split(",{vendorId:14139,productId:4738")[0]);
  const previous = parseExisting(`  {
    vendorId: 0x373b,
    productId: 0x112e,
    brand: "ATK",
    model: "ATK Y9 Pro",
    sensor: "PAW3395Ultra",
    cidMid: "2,3",
    firmwareMark: "y9",
    usagePage: 65284,
    usage: 2,
    features: { noDpiRGB: true },
  },
  {
    vendorId: 0x373b,
    productId: 0x102e,
    brand: "ATK",
    model: "Old name",
    sensor: "PAW3950Ultra",
    cidMid: "2,42",
    firmwareMark: "f1",
    usagePage: 65284,
    usage: 2,
    features: {  },
  },`);
  assert.equal(previous.length, 2);
  assert.deepEqual(previous[0].features, { noDpiRGB: true });
  const { entries, retired } = keepRetired(fresh, previous);
  assert.deepEqual(retired.map((entry: { model: string }) => entry.model), ["ATK Y9 Pro"]);
  assert.equal(entries.filter((entry: { productId: number }) => entry.productId === 0x102e).length, 1);
  assert.equal(entries.some((entry: { model: string }) => entry.model === "Old name"), false);
});
