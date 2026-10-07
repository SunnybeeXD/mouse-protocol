# Attack Shark vendor configurator protocol

Covers the HID report family spoken by the shared szslxd-tech web configurator (the `WebDriver.exe` bridge) for Attack Shark, and the OEM-shared Delux, Inphic and Mambasnake models behind the same platform. The codec lives in `src/attackshark/index.ts`, exported as `@openmouse/protocol/attackshark`.

## Evidence

Every frame builder was ported from the configurator's `index-*.js` bundle and its output is compared byte for byte against the vendor function in `src/attackshark/index.test.ts`. Reply parsing follows the bundle's handlers. The HID transport layer (feature report ids, `0xA0` read requests, lengths) comes from disassembly of `WebDriver.exe`. No frame here was captured from hardware, so no catalog entry should be marked `verified` from this document alone.

## Report ids

| id | Feature | Frame length | Builder |
|---|---|---|---|
| `0x04` | DPI table | 60 (52 used) | `buildAttackSharkDpiReport` |
| `0x05` | Lighting | 20 | `buildAttackSharkLightingReport` |
| `0x06` | Polling rate | 15 | `buildAttackSharkPollingReport`, `buildAttackSharkDualPollingReport` |
| `0x07` | Wake-up mode | 8 | `buildAttackSharkWakeupReport` |
| `0x08` | Button table | 63 | `buildAttackSharkButtonReport` |
| `0x09` | Macro | 131 or 111 | `buildAttackSharkMacroReport` |
| `0x0A` | Whole-profile read | 120 or more | read only |
| `0x0B` | Version read | 8 | read only, reply is `0B 08 ..` with the version in bytes 4 and 5 |
| `0xA0` | Read request | 8 | feature report sent first, then the target id is read back |

Every frame starts with its report id, then a length byte, then a profile id of `1` where one exists.

## Checksums

All checksums are 16-bit big-endian sums.

- DPI, button and macro frames sum bytes `3..` up to the checksum slot.
- Lighting writes that sum at offset 11, two zero bytes at 13 and 14, then a second sum at offset 15 equal to `4 + sum(bytes 0..14)`.

## Polling rate

`06 09 01 <code> <~code>`. Codes are `0x08` 125 Hz, `0x04` 250 Hz, `0x02` 500 Hz, `0x01` 1000 Hz. 8K models send a dual code with the wireless rate in the high nibble and the wired rate in the low nibble. Codes for rates above 1000 Hz were not found in this bundle.

## Lighting

`05 0F profile mode speed brightness R G B closeTime direction`. Three variants exist, selected per model by the bundle: `raw` writes every field as given, `scaled` sends `closeTime / 10` and `direction / 2`, `packed` sends `mode << 4`, `closeTime * 2` and `direction / 2`.

## DPI

Eight stage slots. Each stage is a 16-bit little-endian pair split across offsets `8..15` (low) and `16..23` (high). Three encodings appear: `(dpi - 50) / 50`, `(dpi - 100) / 100`, and the raw value. Offset 24 is the active stage, `25..48` are eight RGB indicator colors, offset 49 is the indicator type. Several models use bespoke encodings with a double flag above a threshold; those are not in the codec yet.

The vendor writes the first indicator color with an index bug (`n++ + d`). It only shows when stage one is not pure red, and the codec writes the intended layout instead.

## Buttons

`08 3B 01` followed by up to 19 three-byte actions `[type, modifier, key]`, then the checksum. `ATTACKSHARK_BUTTON_FUNCTIONS` holds the vendor's function table. Shortcut actions use type `17` with modifier bits and a HID usage as the key.

## Macros

`09 <length> macroId macroType 00 00 00 loopCount name[20] count actions.. checksum`. Actions are `[direction|time, usageId]` pairs. Delays beyond the single-byte range append `[chunks, 03]` and count as two actions. Three layouts exist: 131 bytes with 10 ms units and 200 ms chunks, 131 bytes with 1 ms units and 100 ms chunks, and 111 bytes with the action count at offset 8. A press sets bit 0 of the delay byte, so press delays gain that bit and the vendor's own parser reads them back up to 10 ms longer. The vendor's mouse-move macro path in the 111-byte layout references an undefined constant and is not implemented.

## Model ids

`ATTACKSHARK_MODEL_IDS` lists the model id bytes the bridge reports. It includes OEM brands that share the platform, so do not infer a brand from it.

## Not covered

- Per-model DPI encodings beyond the three above.
- Reply decoding for lighting, report rate, wake-up and button reads.
- Whether `0xFA60` and `0xFA65` map to specific models.
- Driver wiring beyond what is listed below.

## Driver wiring

`src/drivers/attackshark/hid.ts` now builds its polling frame with `buildAttackSharkPollingReport`, and `src/compx/x11-dpi.ts` builds the X11 DPI report with `buildAttackSharkDpiReport`. Both outputs are byte-identical to the previous hand-built frames. The X11 family also gained per-stage DPI indicator colors: `dpiStageColors` on the status and `setDpiStageColor(stage, "#rrggbb")`, written through the same 0x04 report. Lighting, wake-up, button and macro frames are in the codec but not yet exposed by the driver, because the shared UI contract needs per-model button names and slot order that the bundle only provides model by model.
