import assert from "node:assert/strict";
import test from "node:test";

import { GWolvesHidClient } from "./hid.ts";
import { GWolvesXviHidClient } from "./xvi-hid.ts";
import { GWOLVES_PRODUCTS } from "./products.ts";
import {
  GWOLVES_COMMAND,
  gwolvesDecodeDpi,
  gwolvesDecodeDpi3955,
  gwolvesEncodeDpi,
  gwolvesEncodeDpi3955,
  gwolvesReportChecksum,
} from "@openmouse/protocol/gwolves";

if (typeof (globalThis as { window?: unknown }).window === "undefined") {
  Object.defineProperty(globalThis, "window", { value: globalThis, configurable: true });
}

// Wired ids and sensors of the XVI 0 models in mouse.fit's env-models.json (AppVer 1.0.0.48).
const VGN_WIRED: Array<[number, string, "3950" | "3955", number]> = [
  [0x5418, "HTS Plus", "3950", 2],
  [0x4718, "Lycan", "3950", 4],
  [0x5618, "HTX Ultra", "3950", 5],
  [0x4719, "Lycan", "3955", 6],
  [0x5619, "HTXU", "3955", 7],
  [0x5419, "HTS Plus", "3955", 8],
  [0x3619, "Fenrir Pro", "3955", 9],
  [0x2719, "HTX Mini", "3955", 10],
  [0x5219, "HTS Plus Pro", "3955", 11],
  [0x4219, "WARG", "3955", 12],
  [0x3519, "Fenrir Asym", "3955", 17],
];

function device(productId: number, vgn = true): HIDDevice & { flash: Uint8Array } {
  const flash = new Uint8Array(0x2000);
  const pair = (address: number, value: number): void => { flash[address] = value; flash[address + 1] = (0x55 - value) & 0xff; };
  pair(0x00, 1);
  pair(0x02, 1);
  pair(0x04, 0);
  pair(0x0a, 1);
  flash.set(gwolvesEncodeDpi(1600), 0x0c);
  flash.set(gwolvesEncodeDpi3955(2400), 0x1b00);
  let listener: ((event: HIDInputReportEvent) => void) | null = null;
  const fake = {
    vendorId: 0x33e4,
    productId,
    productName: "G-Wolves",
    opened: true,
    flash,
    modelId: 0,
    collections: [{
      usagePage: vgn ? 0xff02 : 0xff00, usage: 2, children: [], featureReports: [],
      inputReports: [{ reportId: 8, items: [{ reportCount: 16, reportSize: 8 }] }],
      outputReports: [{ reportId: 8, items: [{ reportCount: 16, reportSize: 8 }] }],
    }],
    addEventListener: (_: string, fn: (event: HIDInputReportEvent) => void) => { listener = fn; },
    removeEventListener: () => { listener = null; },
    async sendReport(_: number, data: BufferSource) {
      const packet = new Uint8Array(data as ArrayBuffer);
      const reply = new Uint8Array(16);
      reply.set(packet.subarray(0, 5));
      const address = (packet[2]! << 8) | packet[3]!;
      if (packet[0] === GWOLVES_COMMAND.read) reply.set(flash.subarray(address, address + packet[4]!), 5);
      if (packet[0] === GWOLVES_COMMAND.write) flash.set(packet.subarray(5, 5 + packet[4]!), address);
      if (packet[0] === GWOLVES_COMMAND.handshake) reply[10] = fake.modelId;
      reply[15] = gwolvesReportChecksum(reply.subarray(0, 15));
      queueMicrotask(() => listener?.({ reportId: 8, data: new DataView(reply.buffer) } as HIDInputReportEvent));
    },
  };
  return fake as unknown as HIDDevice & { flash: Uint8Array; modelId: number };
}

test("every wired model of the XVI 0 generation is in the catalog with its sensor and model id", () => {
  for (const [productId, model, sensor, mid] of VGN_WIRED) {
    const entry = GWOLVES_PRODUCTS.get(productId);
    assert.ok(entry, `0x${productId.toString(16)}`);
    assert.deepEqual([entry.model, entry.protocol, entry.wireless, entry.sensor, entry.mid], [model, "vgn", false, sensor, mid], `0x${productId.toString(16)}`);
    assert.equal(GWolvesHidClient.isSupported(device(productId)), true, `0x${productId.toString(16)} is claimed`);
  }
  assert.equal(GWOLVES_PRODUCTS.get(0x5219)?.magnetic, true);
  assert.equal(new Set(VGN_WIRED.map(([, , , mid]) => mid)).size, VGN_WIRED.length, "model ids are unique");
});

test("the 4K dongles and the HSK Lite belong to the XVI driver", () => {
  for (const productId of [0x5807, 0x5407, 0x5707, 0x5907, 0x7204, 0x7203]) {
    const entry = GWOLVES_PRODUCTS.get(productId);
    assert.equal(entry?.protocol, "xvi", `0x${productId.toString(16)}`);
    assert.equal(entry?.verified, false);
    assert.equal(GWolvesHidClient.isSupported(device(productId)), false);
    assert.equal(GWolvesXviHidClient.isSupported(device(productId, false)), false, "needs the 64 byte feature report, not report 8");
  }
  assert.equal(GWOLVES_PRODUCTS.get(0x7204)?.wireless, false);
  assert.equal(GWOLVES_PRODUCTS.get(0x7203)?.wireless, true);
});

test("3955 DPI rows round-trip, carry a checksum and reject a broken row", () => {
  const row = gwolvesEncodeDpi3955(32_000);
  assert.deepEqual(gwolvesDecodeDpi3955(row), { x: 32_000, y: 32_000 });
  assert.deepEqual(gwolvesDecodeDpi3955(gwolvesEncodeDpi3955(1234, 5678)), { x: 1234, y: 5678 });
  assert.equal((row.reduce((sum, byte) => sum + byte, 0)) & 0xff, 0x55);
  assert.equal(gwolvesDecodeDpi3955(new Uint8Array(6)), null);
  assert.throws(() => gwolvesEncodeDpi3955(40_001));
  assert.throws(() => gwolvesEncodeDpi3955(0));
  assert.equal(gwolvesDecodeDpi(gwolvesEncodeDpi(1600)), 1600);
});

test("a 3950 model keeps the 4 byte rows and the three lift-off steps", async () => {
  const fake = device(0x5418);
  const client = new GWolvesHidClient(fake);
  const status = await client.readStatus();
  assert.equal(status.name, "G-Wolves HTS Plus");
  assert.equal(status.dpi, 1600);
  assert.equal(status.liftOffDistance, "Medium");
  assert.equal(await client.setDpi(3200), 3200);
  assert.equal(gwolvesDecodeDpi(fake.flash.subarray(0x0c, 0x10)), 3200);
  assert.equal(await client.setLiftOffDistance("Low"), "Low");
  assert.equal(client.getDpiOptions().at(-1), 26_000);
});

test("a 3955 model reads and writes its DPI at 0x1B00 and leaves lift-off alone", async () => {
  const fake = device(0x5419);
  const client = new GWolvesHidClient(fake);
  const status = await client.readStatus();
  assert.equal(status.name, "G-Wolves HTS Plus");
  assert.equal(status.dpi, 2400, "the 4 byte row at 0x0C is not read");
  assert.equal(status.liftOffDistance, null);
  assert.equal(await client.setDpi(6400), 6400);
  assert.deepEqual(gwolvesDecodeDpi3955(fake.flash.subarray(0x1b00, 0x1b06)), { x: 6400, y: 6400 });
  assert.equal(gwolvesDecodeDpi(fake.flash.subarray(0x0c, 0x10)), 1600, "the legacy row is untouched");
  await assert.rejects(() => client.setLiftOffDistance("Low"), /five lift-off steps/);
  assert.equal(fake.flash[0x0a], 1, "lift-off was not written");
  assert.equal(client.getDpiOptions().at(-1), 40_000);
});

test("behind the shared receiver the mouse's own model decides the layout", async () => {
  const fake = device(0x3854) as HIDDevice & { flash: Uint8Array; modelId: number };
  fake.modelId = 6;
  const client = new GWolvesHidClient(fake);
  const status = await client.readStatus();
  assert.equal(status.name, "G-Wolves Lycan");
  assert.equal(status.dpi, 2400);
  assert.equal(status.liftOffDistance, null);

  const other = device(0x3854) as HIDDevice & { flash: Uint8Array; modelId: number };
  other.modelId = 5;
  const ultra = await new GWolvesHidClient(other).readStatus();
  assert.equal(ultra.name, "G-Wolves HTX Ultra");
  assert.equal(ultra.dpi, 1600);

  const unknown = device(0x3854) as HIDDevice & { flash: Uint8Array; modelId: number };
  unknown.modelId = 99;
  assert.equal((await new GWolvesHidClient(unknown).readStatus()).name, "G-Wolves HTX Ultra", "an unknown model id keeps the receiver's own entry");
});
