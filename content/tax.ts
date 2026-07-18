// Placeholder state income tax rates. Real build pulls from a maintained
// external feed (state DOR data or a licensed tax provider) at calculation
// time. Do not treat these as authoritative.
export const STATE_TAX_RATES: Record<string, { rate: number; filingThreshold: number }> = {
  AL: { rate: 0.05,   filingThreshold: 1_500 },
  AK: { rate: 0.0,    filingThreshold: 0 },
  AZ: { rate: 0.025,  filingThreshold: 13_850 },
  AR: { rate: 0.049,  filingThreshold: 12_684 },
  CA: { rate: 0.093,  filingThreshold: 12_000 },
  CO: { rate: 0.044,  filingThreshold: 13_850 },
  CT: { rate: 0.0699, filingThreshold: 15_000 },
  DC: { rate: 0.0895, filingThreshold: 12_950 },
  FL: { rate: 0.0,    filingThreshold: 0 },
  GA: { rate: 0.0549, filingThreshold: 12_000 },
  HI: { rate: 0.11,   filingThreshold: 2_200 },
  IL: { rate: 0.0495, filingThreshold: 2_775 },
  IN: { rate: 0.0315, filingThreshold: 1_000 },
  KS: { rate: 0.057,  filingThreshold: 5_250 },
  KY: { rate: 0.045,  filingThreshold: 2_770 },
  LA: { rate: 0.0425, filingThreshold: 12_500 },
  MA: { rate: 0.05,   filingThreshold: 8_000 },
  MI: { rate: 0.0425, filingThreshold: 5_400 },
  MS: { rate: 0.05,   filingThreshold: 8_300 },
  NC: { rate: 0.0475, filingThreshold: 12_750 },
  NH: { rate: 0.0,    filingThreshold: 0 },
  NV: { rate: 0.0,    filingThreshold: 0 },
  NY: { rate: 0.0685, filingThreshold: 8_000 },
  OH: { rate: 0.0399, filingThreshold: 26_050 },
  OK: { rate: 0.0475, filingThreshold: 7_350 },
  OR: { rate: 0.099,  filingThreshold: 7_500 },
  PA: { rate: 0.0307, filingThreshold: 33 },
  SC: { rate: 0.064,  filingThreshold: 13_850 },
  SD: { rate: 0.0,    filingThreshold: 0 },
  TN: { rate: 0.0,    filingThreshold: 0 },
  TX: { rate: 0.0,    filingThreshold: 0 },
  UT: { rate: 0.0465, filingThreshold: 13_850 },
  VA: { rate: 0.0575, filingThreshold: 11_950 },
  WA: { rate: 0.0,    filingThreshold: 0 },
  WI: { rate: 0.0765, filingThreshold: 12_760 },
  WV: { rate: 0.0512, filingThreshold: 2_000 },
  WY: { rate: 0.0,    filingThreshold: 0 },
};

export function rateFor(state: string) {
  return STATE_TAX_RATES[state.toUpperCase()] ?? { rate: 0, filingThreshold: 0 };
}
