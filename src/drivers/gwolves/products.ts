export interface GWolvesProduct {
  model: string;
  wireless: boolean;
  /**
   * Only `verified: true` entries have been exercised against real hardware
   * by this project. Everything else would be a guess based on "probably
   * the same shared VGN-family protocol as the HTX Ultra" and should not be
   * assumed correct until actually tested — see PROTOCOL-NOTES.md in the
   * HTX Ultra PR for how the verified entries were confirmed (live HID
   * capture while using the official web driver at mouse.fit, cross-checked
   * independently with hidapitester).
   */
  verified: boolean;
  /**
   * Which of G-Wolves' two web-driver protocol classes the model uses, from
   * the "XVI" and "IsNewProtocol" fields of its env-models.json entry:
   * - "vgn": XVI 0, the shared VGN-family report-5 protocol GWolvesHidClient
   *   speaks (HTX Ultra).
   * - "xvi": XVI 1 with IsNewProtocol 0, the 64-byte feature-report protocol
   *   GWolvesXviHidClient speaks (HTX Mini 8K and most older models).
   * - "xvi-new": XVI 1 with IsNewProtocol 1. Same transport as "xvi" but
   *   polling, battery and lift-off move to profile-addressed commands, which
   *   no driver here implements yet.
   */
  protocol: "vgn" | "xvi" | "xvi-new";
  /** Left and right buttons are magnetic switches with trigger point and rapid trigger (HTS Plus Pro). */
  magnetic?: boolean;
  /**
   * Which PixArt sensor a "vgn" model carries, from the "_3950" or "_3955"
   * suffix of its UIFolder in env-models.json. It decides the DPI row layout:
   * 4 byte rows at 0x0C for the 3950, 6 byte rows at 0x1B00 for the 3955.
   */
  sensor?: "3950" | "3955";
  /**
   * The model id (MID in env-models.json) the 0x3854 receiver reports for the
   * mouse behind it. The receiver is shared by every "vgn" model.
   */
  mid?: number;
}

export const GWOLVES_VENDOR_ID = 0x33e4;

export const GWOLVES_PRODUCTS: ReadonlyMap<number, GWolvesProduct> = new Map([
  [0x5618, { model: "HTX Ultra", wireless: false, verified: true, protocol: "vgn", sensor: "3950", mid: 5 }],
  [0x3854, { model: "HTX Ultra", wireless: true, verified: true, protocol: "vgn", sensor: "3950" }],
  // The rest of the XVI 0 generation, from the live env-models.json at
  // https://www.mouse.fit/Config/env-models.json (AppVer 1.0.0.48). Every one of
  // them shares the 0x3854 receiver, so only the wired ids are listed here.
  // Not hardware-tested.
  [0x5418, { model: "HTS Plus", wireless: false, verified: false, protocol: "vgn", sensor: "3950", mid: 2 }],
  [0x4718, { model: "Lycan", wireless: false, verified: false, protocol: "vgn", sensor: "3950", mid: 4 }],
  [0x4719, { model: "Lycan", wireless: false, verified: false, protocol: "vgn", sensor: "3955", mid: 6 }],
  [0x5619, { model: "HTXU", wireless: false, verified: false, protocol: "vgn", sensor: "3955", mid: 7 }],
  [0x5419, { model: "HTS Plus", wireless: false, verified: false, protocol: "vgn", sensor: "3955", mid: 8 }],
  [0x3619, { model: "Fenrir Pro", wireless: false, verified: false, protocol: "vgn", sensor: "3955", mid: 9 }],
  [0x2719, { model: "HTX Mini", wireless: false, verified: false, protocol: "vgn", sensor: "3955", mid: 10 }],
  // ButtonType 1 in env-models.json: magnetic left and right buttons.
  [0x5219, { model: "HTS Plus Pro", wireless: false, verified: false, protocol: "vgn", sensor: "3955", mid: 11, magnetic: true }],
  [0x4219, { model: "WARG", wireless: false, verified: false, protocol: "vgn", sensor: "3955", mid: 12 }],
  [0x3519, { model: "Fenrir Asym", wireless: false, verified: false, protocol: "vgn", sensor: "3955", mid: 17 }],
  // Everything below is XVI 1, transcribed from G-Wolves' own live web-driver
  // config (https://www.mouse.fit/Config/env-models.json), not independently
  // hardware-tested. All but the "xvi-new" ones have "IsNewProtocol": "0". Add
  // further G-Wolves models here as they're captured/verified, but confirm
  // with a real capture before setting verified: true, since a wrong
  // address/encoding on an unverified model could silently write the wrong
  // value rather than fail loudly.
  [0x3808, { model: "HTM Plus", wireless: false, verified: false, protocol: "xvi-new" }],
  [0x3817, { model: "HTM Plus", wireless: true, verified: false, protocol: "xvi-new" }],
  [0x6808, { model: "HSK Pro 2.0", wireless: false, verified: false, protocol: "xvi-new" }],
  [0x6817, { model: "HSK Pro 2.0", wireless: true, verified: false, protocol: "xvi-new" }],
  [0x5608, { model: "HTXU", wireless: false, verified: false, protocol: "xvi-new" }],
  [0x5617, { model: "HTXU", wireless: true, verified: false, protocol: "xvi-new" }],
  [0x3608, { model: "Fenrir Pro", wireless: false, verified: false, protocol: "xvi-new" }],
  [0x3617, { model: "Fenrir Pro", wireless: true, verified: false, protocol: "xvi-new" }],
  [0x3908, { model: "VUK", wireless: false, verified: false, protocol: "xvi" }],
  [0x3917, { model: "VUK", wireless: true, verified: false, protocol: "xvi" }],
  [0x7904, { model: "HT-S2", wireless: false, verified: false, protocol: "xvi" }],
  [0x7913, { model: "HT-S2", wireless: true, verified: false, protocol: "xvi" }],
  [0x3708, { model: "Fenir Max", wireless: false, verified: false, protocol: "xvi" }],
  [0x3717, { model: "Fenir Max", wireless: true, verified: false, protocol: "xvi" }],
  [0x5308, { model: "HTS Ultra", wireless: false, verified: false, protocol: "xvi" }],
  [0x5317, { model: "HTS Ultra", wireless: true, verified: false, protocol: "xvi" }],
  [0x7704, { model: "HTR", wireless: false, verified: false, protocol: "xvi" }],
  [0x7713, { model: "HTR", wireless: true, verified: false, protocol: "xvi" }],
  [0x3508, { model: "Fenrir", wireless: false, verified: false, protocol: "xvi" }],
  [0x3517, { model: "Fenrir", wireless: true, verified: false, protocol: "xvi" }],
  [0x7908, { model: "HT-S2 Pro", wireless: false, verified: false, protocol: "xvi" }],
  [0x7917, { model: "HT-S2 Pro", wireless: true, verified: false, protocol: "xvi" }],
  [0x5808, { model: "HSK Pro", wireless: false, verified: false, protocol: "xvi" }],
  [0x5817, { model: "HSK Pro", wireless: true, verified: false, protocol: "xvi" }],
  [0x5807, { model: "HSK Pro", wireless: true, verified: false, protocol: "xvi" }],
  [0x2708, { model: "HTX Mini", wireless: false, verified: false, protocol: "xvi" }],
  // DPI, polling and lift-off confirmed on this receiver (ticket #0105).
  [0x2717, { model: "HTX Mini", wireless: true, verified: true, protocol: "xvi" }],
  [0x5408, { model: "HTS Plus", wireless: false, verified: false, protocol: "xvi" }],
  [0x5417, { model: "HTS Plus", wireless: true, verified: false, protocol: "xvi" }],
  [0x5407, { model: "HTS Plus", wireless: true, verified: false, protocol: "xvi" }],
  [0x5708, { model: "HTX", wireless: false, verified: false, protocol: "xvi" }],
  [0x5717, { model: "HTX", wireless: true, verified: false, protocol: "xvi" }],
  [0x5707, { model: "HTX", wireless: true, verified: false, protocol: "xvi" }],
  [0x5908, { model: "HSK Plus", wireless: false, verified: false, protocol: "xvi" }],
  [0x5917, { model: "HSK Plus", wireless: true, verified: false, protocol: "xvi" }],
  [0x5907, { model: "HSK Plus", wireless: true, verified: false, protocol: "xvi" }],
  [0x7204, { model: "HSK Lite", wireless: false, verified: false, protocol: "xvi" }],
  [0x7203, { model: "HSK Lite", wireless: true, verified: false, protocol: "xvi" }],
  [0x7708, { model: "HTR Pro", wireless: false, verified: false, protocol: "xvi" }],
  [0x7717, { model: "HTR Pro", wireless: true, verified: false, protocol: "xvi" }],
  [0x5804, { model: "HSK Pro ACE", wireless: false, verified: false, protocol: "xvi" }],
  [0x5803, { model: "HSK Pro ACE", wireless: true, verified: false, protocol: "xvi" }],
  [0x5404, { model: "HTS Plus ACE", wireless: false, verified: false, protocol: "xvi" }],
  [0x5403, { model: "HTS Plus ACE", wireless: true, verified: false, protocol: "xvi" }],
  [0x5704, { model: "HTX ACE", wireless: false, verified: false, protocol: "xvi" }],
  [0x5703, { model: "HTX ACE", wireless: true, verified: false, protocol: "xvi" }],
  [0x5904, { model: "HSK Plus ACE", wireless: false, verified: false, protocol: "xvi" }],
  [0x5903, { model: "HSK Plus ACE", wireless: true, verified: false, protocol: "xvi" }],
  // "TEST HTS Plus" in that config (wired 0x5428, wireless 0x3854) is
  // deliberately skipped: its own name marks it a dev/test entry, and its
  // wireless id collides with the already-verified HTX Ultra's 0x3854.
]);
