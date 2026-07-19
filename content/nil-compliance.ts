// State NIL compliance lookup — placeholder rules pending sourcing.
//
// GOVERNANCE: this table is a hand-maintained scaffold. Production must be
// backed by counsel-reviewed content refreshed at least quarterly, and the
// per-state notes below need to be replaced with the real disclosure /
// registration / school-notification rules for that jurisdiction. Post-House
// settlement (2025+) this area is moving fast — do not treat this file as
// authoritative for any real client.

export type NilRule = {
  state: string;
  hasLaw: boolean;
  hasEO: boolean;               // executive order pending / instead of statute
  requiresSchoolDisclosure: boolean;
  requiresStateRegistration: boolean;
  agentLicensingRequired: boolean;
  boostingRestrictions: "strict" | "moderate" | "none";
  keyPoints: string[];
  lastReviewed: string;         // ISO date
  sourceUrl?: string;
};

// Every state gets an entry so the lookup surface is complete. Where the
// content is a placeholder, `keyPoints` says so explicitly so no one ships
// a client-facing page thinking this is real.
const PLACEHOLDER = ["Placeholder — counsel review required before client-facing use."];

export const NIL_RULES: Record<string, NilRule> = {
  AL: { state: "AL", hasLaw: true,  hasEO: false, requiresSchoolDisclosure: true,  requiresStateRegistration: false, agentLicensingRequired: true,  boostingRestrictions: "moderate", keyPoints: PLACEHOLDER, lastReviewed: "2025-01-01" },
  AK: { state: "AK", hasLaw: false, hasEO: false, requiresSchoolDisclosure: false, requiresStateRegistration: false, agentLicensingRequired: false, boostingRestrictions: "none",     keyPoints: ["No state NIL statute — school policy governs."], lastReviewed: "2025-01-01" },
  AZ: { state: "AZ", hasLaw: true,  hasEO: false, requiresSchoolDisclosure: true,  requiresStateRegistration: false, agentLicensingRequired: true,  boostingRestrictions: "moderate", keyPoints: PLACEHOLDER, lastReviewed: "2025-01-01" },
  AR: { state: "AR", hasLaw: true,  hasEO: false, requiresSchoolDisclosure: true,  requiresStateRegistration: false, agentLicensingRequired: true,  boostingRestrictions: "moderate", keyPoints: PLACEHOLDER, lastReviewed: "2025-01-01" },
  CA: { state: "CA", hasLaw: true,  hasEO: false, requiresSchoolDisclosure: false, requiresStateRegistration: false, agentLicensingRequired: false, boostingRestrictions: "none",     keyPoints: ["Fair Pay to Play Act (SB 206) — foundational state law.", "No mandatory school disclosure at the state level.", "Agents are not required to register with the state."], lastReviewed: "2025-01-01" },
  CO: { state: "CO", hasLaw: true,  hasEO: false, requiresSchoolDisclosure: true,  requiresStateRegistration: false, agentLicensingRequired: false, boostingRestrictions: "moderate", keyPoints: PLACEHOLDER, lastReviewed: "2025-01-01" },
  CT: { state: "CT", hasLaw: true,  hasEO: false, requiresSchoolDisclosure: true,  requiresStateRegistration: false, agentLicensingRequired: false, boostingRestrictions: "moderate", keyPoints: PLACEHOLDER, lastReviewed: "2025-01-01" },
  DE: { state: "DE", hasLaw: false, hasEO: false, requiresSchoolDisclosure: false, requiresStateRegistration: false, agentLicensingRequired: false, boostingRestrictions: "none",     keyPoints: PLACEHOLDER, lastReviewed: "2025-01-01" },
  DC: { state: "DC", hasLaw: false, hasEO: false, requiresSchoolDisclosure: false, requiresStateRegistration: false, agentLicensingRequired: false, boostingRestrictions: "none",     keyPoints: PLACEHOLDER, lastReviewed: "2025-01-01" },
  FL: { state: "FL", hasLaw: true,  hasEO: false, requiresSchoolDisclosure: true,  requiresStateRegistration: false, agentLicensingRequired: true,  boostingRestrictions: "strict",   keyPoints: PLACEHOLDER, lastReviewed: "2025-01-01" },
  GA: { state: "GA", hasLaw: true,  hasEO: false, requiresSchoolDisclosure: true,  requiresStateRegistration: false, agentLicensingRequired: true,  boostingRestrictions: "moderate", keyPoints: PLACEHOLDER, lastReviewed: "2025-01-01" },
  HI: { state: "HI", hasLaw: true,  hasEO: false, requiresSchoolDisclosure: true,  requiresStateRegistration: false, agentLicensingRequired: false, boostingRestrictions: "moderate", keyPoints: PLACEHOLDER, lastReviewed: "2025-01-01" },
  ID: { state: "ID", hasLaw: false, hasEO: false, requiresSchoolDisclosure: false, requiresStateRegistration: false, agentLicensingRequired: false, boostingRestrictions: "none",     keyPoints: PLACEHOLDER, lastReviewed: "2025-01-01" },
  IL: { state: "IL", hasLaw: true,  hasEO: false, requiresSchoolDisclosure: true,  requiresStateRegistration: false, agentLicensingRequired: true,  boostingRestrictions: "moderate", keyPoints: PLACEHOLDER, lastReviewed: "2025-01-01" },
  IN: { state: "IN", hasLaw: false, hasEO: false, requiresSchoolDisclosure: false, requiresStateRegistration: false, agentLicensingRequired: false, boostingRestrictions: "none",     keyPoints: PLACEHOLDER, lastReviewed: "2025-01-01" },
  IA: { state: "IA", hasLaw: false, hasEO: false, requiresSchoolDisclosure: false, requiresStateRegistration: false, agentLicensingRequired: false, boostingRestrictions: "none",     keyPoints: PLACEHOLDER, lastReviewed: "2025-01-01" },
  KS: { state: "KS", hasLaw: true,  hasEO: false, requiresSchoolDisclosure: true,  requiresStateRegistration: false, agentLicensingRequired: false, boostingRestrictions: "moderate", keyPoints: PLACEHOLDER, lastReviewed: "2025-01-01" },
  KY: { state: "KY", hasLaw: false, hasEO: true,  requiresSchoolDisclosure: false, requiresStateRegistration: false, agentLicensingRequired: false, boostingRestrictions: "none",     keyPoints: ["Governed by executive order rather than statute."], lastReviewed: "2025-01-01" },
  LA: { state: "LA", hasLaw: true,  hasEO: false, requiresSchoolDisclosure: true,  requiresStateRegistration: false, agentLicensingRequired: true,  boostingRestrictions: "moderate", keyPoints: PLACEHOLDER, lastReviewed: "2025-01-01" },
  ME: { state: "ME", hasLaw: false, hasEO: false, requiresSchoolDisclosure: false, requiresStateRegistration: false, agentLicensingRequired: false, boostingRestrictions: "none",     keyPoints: PLACEHOLDER, lastReviewed: "2025-01-01" },
  MD: { state: "MD", hasLaw: true,  hasEO: false, requiresSchoolDisclosure: true,  requiresStateRegistration: false, agentLicensingRequired: false, boostingRestrictions: "moderate", keyPoints: PLACEHOLDER, lastReviewed: "2025-01-01" },
  MA: { state: "MA", hasLaw: false, hasEO: false, requiresSchoolDisclosure: false, requiresStateRegistration: false, agentLicensingRequired: false, boostingRestrictions: "none",     keyPoints: PLACEHOLDER, lastReviewed: "2025-01-01" },
  MI: { state: "MI", hasLaw: true,  hasEO: false, requiresSchoolDisclosure: true,  requiresStateRegistration: false, agentLicensingRequired: false, boostingRestrictions: "moderate", keyPoints: PLACEHOLDER, lastReviewed: "2025-01-01" },
  MN: { state: "MN", hasLaw: false, hasEO: false, requiresSchoolDisclosure: false, requiresStateRegistration: false, agentLicensingRequired: false, boostingRestrictions: "none",     keyPoints: PLACEHOLDER, lastReviewed: "2025-01-01" },
  MS: { state: "MS", hasLaw: true,  hasEO: false, requiresSchoolDisclosure: true,  requiresStateRegistration: false, agentLicensingRequired: true,  boostingRestrictions: "moderate", keyPoints: PLACEHOLDER, lastReviewed: "2025-01-01" },
  MO: { state: "MO", hasLaw: true,  hasEO: false, requiresSchoolDisclosure: false, requiresStateRegistration: false, agentLicensingRequired: false, boostingRestrictions: "moderate", keyPoints: PLACEHOLDER, lastReviewed: "2025-01-01" },
  MT: { state: "MT", hasLaw: true,  hasEO: false, requiresSchoolDisclosure: true,  requiresStateRegistration: false, agentLicensingRequired: false, boostingRestrictions: "moderate", keyPoints: PLACEHOLDER, lastReviewed: "2025-01-01" },
  NE: { state: "NE", hasLaw: true,  hasEO: false, requiresSchoolDisclosure: true,  requiresStateRegistration: false, agentLicensingRequired: false, boostingRestrictions: "moderate", keyPoints: PLACEHOLDER, lastReviewed: "2025-01-01" },
  NV: { state: "NV", hasLaw: true,  hasEO: false, requiresSchoolDisclosure: true,  requiresStateRegistration: false, agentLicensingRequired: true,  boostingRestrictions: "moderate", keyPoints: PLACEHOLDER, lastReviewed: "2025-01-01" },
  NH: { state: "NH", hasLaw: false, hasEO: false, requiresSchoolDisclosure: false, requiresStateRegistration: false, agentLicensingRequired: false, boostingRestrictions: "none",     keyPoints: PLACEHOLDER, lastReviewed: "2025-01-01" },
  NJ: { state: "NJ", hasLaw: true,  hasEO: false, requiresSchoolDisclosure: true,  requiresStateRegistration: false, agentLicensingRequired: false, boostingRestrictions: "moderate", keyPoints: PLACEHOLDER, lastReviewed: "2025-01-01" },
  NM: { state: "NM", hasLaw: true,  hasEO: false, requiresSchoolDisclosure: true,  requiresStateRegistration: false, agentLicensingRequired: false, boostingRestrictions: "moderate", keyPoints: PLACEHOLDER, lastReviewed: "2025-01-01" },
  NY: { state: "NY", hasLaw: true,  hasEO: false, requiresSchoolDisclosure: true,  requiresStateRegistration: false, agentLicensingRequired: true,  boostingRestrictions: "moderate", keyPoints: PLACEHOLDER, lastReviewed: "2025-01-01" },
  NC: { state: "NC", hasLaw: false, hasEO: true,  requiresSchoolDisclosure: false, requiresStateRegistration: false, agentLicensingRequired: false, boostingRestrictions: "none",     keyPoints: ["Governed by executive order rather than statute."], lastReviewed: "2025-01-01" },
  ND: { state: "ND", hasLaw: false, hasEO: false, requiresSchoolDisclosure: false, requiresStateRegistration: false, agentLicensingRequired: false, boostingRestrictions: "none",     keyPoints: PLACEHOLDER, lastReviewed: "2025-01-01" },
  OH: { state: "OH", hasLaw: false, hasEO: true,  requiresSchoolDisclosure: false, requiresStateRegistration: false, agentLicensingRequired: false, boostingRestrictions: "none",     keyPoints: ["Governed by executive order."], lastReviewed: "2025-01-01" },
  OK: { state: "OK", hasLaw: true,  hasEO: false, requiresSchoolDisclosure: true,  requiresStateRegistration: false, agentLicensingRequired: true,  boostingRestrictions: "moderate", keyPoints: PLACEHOLDER, lastReviewed: "2025-01-01" },
  OR: { state: "OR", hasLaw: true,  hasEO: false, requiresSchoolDisclosure: true,  requiresStateRegistration: false, agentLicensingRequired: false, boostingRestrictions: "moderate", keyPoints: PLACEHOLDER, lastReviewed: "2025-01-01" },
  PA: { state: "PA", hasLaw: true,  hasEO: false, requiresSchoolDisclosure: true,  requiresStateRegistration: false, agentLicensingRequired: true,  boostingRestrictions: "moderate", keyPoints: PLACEHOLDER, lastReviewed: "2025-01-01" },
  RI: { state: "RI", hasLaw: false, hasEO: false, requiresSchoolDisclosure: false, requiresStateRegistration: false, agentLicensingRequired: false, boostingRestrictions: "none",     keyPoints: PLACEHOLDER, lastReviewed: "2025-01-01" },
  SC: { state: "SC", hasLaw: true,  hasEO: false, requiresSchoolDisclosure: true,  requiresStateRegistration: false, agentLicensingRequired: false, boostingRestrictions: "moderate", keyPoints: PLACEHOLDER, lastReviewed: "2025-01-01" },
  SD: { state: "SD", hasLaw: false, hasEO: false, requiresSchoolDisclosure: false, requiresStateRegistration: false, agentLicensingRequired: false, boostingRestrictions: "none",     keyPoints: PLACEHOLDER, lastReviewed: "2025-01-01" },
  TN: { state: "TN", hasLaw: true,  hasEO: false, requiresSchoolDisclosure: true,  requiresStateRegistration: false, agentLicensingRequired: true,  boostingRestrictions: "moderate", keyPoints: PLACEHOLDER, lastReviewed: "2025-01-01" },
  TX: { state: "TX", hasLaw: true,  hasEO: false, requiresSchoolDisclosure: true,  requiresStateRegistration: false, agentLicensingRequired: true,  boostingRestrictions: "moderate", keyPoints: PLACEHOLDER, lastReviewed: "2025-01-01" },
  UT: { state: "UT", hasLaw: false, hasEO: false, requiresSchoolDisclosure: false, requiresStateRegistration: false, agentLicensingRequired: false, boostingRestrictions: "none",     keyPoints: PLACEHOLDER, lastReviewed: "2025-01-01" },
  VT: { state: "VT", hasLaw: false, hasEO: false, requiresSchoolDisclosure: false, requiresStateRegistration: false, agentLicensingRequired: false, boostingRestrictions: "none",     keyPoints: PLACEHOLDER, lastReviewed: "2025-01-01" },
  VA: { state: "VA", hasLaw: true,  hasEO: false, requiresSchoolDisclosure: true,  requiresStateRegistration: false, agentLicensingRequired: false, boostingRestrictions: "moderate", keyPoints: PLACEHOLDER, lastReviewed: "2025-01-01" },
  WA: { state: "WA", hasLaw: false, hasEO: false, requiresSchoolDisclosure: false, requiresStateRegistration: false, agentLicensingRequired: false, boostingRestrictions: "none",     keyPoints: PLACEHOLDER, lastReviewed: "2025-01-01" },
  WV: { state: "WV", hasLaw: false, hasEO: false, requiresSchoolDisclosure: false, requiresStateRegistration: false, agentLicensingRequired: false, boostingRestrictions: "none",     keyPoints: PLACEHOLDER, lastReviewed: "2025-01-01" },
  WI: { state: "WI", hasLaw: false, hasEO: false, requiresSchoolDisclosure: false, requiresStateRegistration: false, agentLicensingRequired: false, boostingRestrictions: "none",     keyPoints: PLACEHOLDER, lastReviewed: "2025-01-01" },
  WY: { state: "WY", hasLaw: false, hasEO: false, requiresSchoolDisclosure: false, requiresStateRegistration: false, agentLicensingRequired: false, boostingRestrictions: "none",     keyPoints: PLACEHOLDER, lastReviewed: "2025-01-01" },
};

export function nilRuleFor(state: string): NilRule | null {
  return NIL_RULES[state.toUpperCase()] ?? null;
}
