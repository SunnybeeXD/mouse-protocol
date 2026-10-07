# szslxd-tech WebDriver bridge

Shared OEM configurator used by several brands (the web bundle has routes for ATTACKSHARK, MAMBASNAKE, delux and inphic models, for example X1, X11Pro, M3, M900Pro, IN9, IN6, INX, G3, F1, V2). The web page cannot touch HID directly. It talks to a local Windows helper, `WebDriver.exe`, which relays to the mouse through `hidapi.dll`.

Evidence: static disassembly of `WebDriverSetup.exe` (Inno Setup 6.1, ships `WebDriver.exe`, `hidapi.dll`, MSVC runtimes, and a bat that registers a `myapp://` handler) and a read of the site's `index-*.js` bundle. Nothing here was captured from live hardware. Observed means read from code. Hypothesis means inferred.

## Web page to helper

Transport is a WebSocket at `ws://localhost:10086`. The exe also contains the log string `WebSocket server started on port 9002`; the bundle only uses 10086. Messages are plain hex strings, two characters per byte, in both directions.

### Page to helper (observed)

| Shape | Use |
|---|---|
| `F0 <conn> <dev> <cmd> <arg>` | read request, for example version check is `F0 <conn> <dev> 0B 00` |
| `<conn> <dev> <payload...>` | write, built by `convertDeviceData` |
| `<conn> <dev> FF <payload...>` | image or bulk write, built by `convertDeviceDataImg` |

The page retries a write up to 3 times at 500 ms intervals until it sees an ack.

### Helper to page (observed)

- `<ver_major> <ver_minor>` (2 bytes): helper version. The page treats anything below 3.0 as legacy and skips read-back.
- `<conn> 01 <dev> <?> <battery_status> <battery_level>` (6 or 7 bytes, `conn` in `0x80..0x85`): device announce, with battery. The 7-byte form has `dev` at index 3, the 6-byte form at index 2. Index 4 (7-byte) or 3 (6-byte) must be `0x40` or `0x41` for the announce to be accepted.
- `<?> <?> 50 00 <?>` (5 bytes): ack, `50 01` is nack and triggers a resend.
- `<?> <?> <dev>` with byte 1 equal to `00` (3 bytes): device unplugged.
- Config replies: `<conn> <dev> <cmd> <len> ...`.

`conn` values: `0x80` wired, `0x81` wireless, `0x82` and `0x83` wired 8K, `0x84` wireless (6-byte form only), `0x85` wired 8K.

## Device ids

The `dev` byte is a model id, not a USB product id. The bundle's table includes: `1` X3Pro, `2` X8SE, `4` G3, `6` X8Plus, `8` X8Pro, `14` G3Pro, `16` R1, `36` V6, `43` M800Mini, `48` M900Pro, `61` M900Mini, `65` IN6, `66` In9, `67` G15, `77` X3, `78` X3Max, `85` X11, `133` X6, `144` IN9Ultra, `146` IN6SE, `147` IN10, `153` INX, `177` X1, `188` M3, `190` X11Pro, `195` Vanguard, `201` G9PRO, `229` V3Pro, `234` V3. Several (`5 13 12 73 98 101 108 109 135 154 158 203 204 20 44 97 119`) exist in the table but are excluded from the read-back path.

## Helper to device (HID)

Static read of the call sites in `WebDriver.exe`.

### Enumeration

`hid_enumerate(0x1D57, 0xFA60)`, `(0x1D57, 0xFA65)` twice, `(0x1D57, 0)` twice, and `(0x045E, 0)` once. Matches are opened with `hid_open_path` (up to three interfaces per pass), set non-blocking, and polled with `hid_read(..., 0x64)` on a worker thread. Usage page and usage filters were not recovered.

### Reports

| Call | Length | Notes |
|---|---|---|
| `hid_send_feature_report` | `0x40` | buffer starts `09 40`, two chunks, 500 ms sleep between |
| `hid_write` | `0x41` | zero-filled buffer, big-endian 16-bit byte sum at offsets `0x3E` and `0x3F`, byte 1 is `0x39` on some paths |
| `hid_write` | `0x0C` | command frame, below |
| `hid_read` | `0x40` | ack for a `0x0C` frame, second call site retries |
| `hid_get_feature_report` | `0x08..0x83` | payload for a `0x0C` frame, length depends on sub-command |
| `hid_send_feature_report` | `0x08` | `0xA0` at offset 4 |

### 12-byte command frame

`04 0C A0 <sub> [arg]`, then `hid_read(0x40)` for an ack, then `hid_get_feature_report` for the payload.

| sub | arg | feature-report length | matches page reply `cmd` |
|---|---|---|---|
| `04` | `38` | `0x38` | `04` DPI |
| `05` | `0F` | `0x0F` | `05` lighting |
| `06` | none | `0x09` | `06` report rate |
| `07` | none | not seen as a frame | `07` wake-up mode (reply `07 08`) |
| `08` | `3B` | `0x3B` | `08` buttons |
| `09` | `6F` | `0x83` | `09` macro |
| `0A` | `80` | `0x80` | `0A` profile (reply length 120 or more, `0A 80`) |
| `0B` | none | `0x08` | `0B` version (reply `0B 08`, version is bytes 4 and 5 big-endian, for example `0x0106`) |
| `0C` | none | `0x0A` | not seen in the bundle |

The sub-command to `cmd` match is a hypothesis: the numbers line up with the bundle's reply handlers but no frame was captured. The arg and length columns are read from stack constants and may be off.

### Macro payload (observed from the page parser)

Reply `cmd 09`: `[4]` macro id, `[5]` type, `[6..8]` RGB, `[9]` loop count, `[10..29]` name (20 bytes), `[30]` action count, `[31..]` actions as pairs `(time/dir, usage id)`. Bit 7 of the first byte of a pair is direction, low 7 bits are time in units of 10 ms. A following `03` pair byte adds a long-delay multiplier of 200 ms.

## Open questions

- Whether `0x41` writes use report id 0.
- Which USB interface and usage page carry the vendor collection.
- Real meaning of the `0x40/0x41` marker in the announce frame and of `0x0C` sub-command `0C`.
- Whether `0xFA60` and `0xFA65` map one to one onto the model ids above.
