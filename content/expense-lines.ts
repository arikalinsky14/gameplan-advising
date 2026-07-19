export type ExpenseLine = {
  slug: string;                    // stable key for the Expense.category field
  label: string;                   // display label
  hint?: string;                   // one-liner helper text
  athleteSpecific: boolean;        // marks the athlete-specific line items
  deductible: boolean;             // pre-marked; advisor can override on the record
};

// From the outline (Section 9-B). Kept as explicit line items — the goal is
// "nothing gets missed," not brevity. Zero is a perfectly fine answer for any
// line; an unanswered / skipped line is not.
export const EXPENSE_LINES: ExpenseLine[] = [
  // Standard personal expenses
  { slug: "rent",              label: "Rent / housing",                                                                    athleteSpecific: false, deductible: false },
  { slug: "utilities",         label: "Utilities",                    hint: "Electric, water, internet, phone.",           athleteSpecific: false, deductible: false },
  { slug: "groceries",         label: "Groceries / food",                                                                  athleteSpecific: false, deductible: false },
  { slug: "transportation",    label: "Transportation",               hint: "Car payment, gas, rideshare, auto insurance.", athleteSpecific: false, deductible: false },
  { slug: "health",            label: "Health insurance & out-of-pocket medical",                                          athleteSpecific: false, deductible: false },
  { slug: "renters-insurance", label: "Renters / personal property insurance",                                             athleteSpecific: false, deductible: false },
  { slug: "subscriptions",     label: "Subscriptions",                hint: "Streaming, apps, memberships.",                athleteSpecific: false, deductible: false },
  { slug: "clothing",          label: "Clothing & personal care",                                                          athleteSpecific: false, deductible: false },
  { slug: "entertainment",     label: "Entertainment / dining out",                                                        athleteSpecific: false, deductible: false },
  { slug: "student-loan",      label: "Student loan payments",                                                             athleteSpecific: false, deductible: false },

  // Athlete-specific — these should default to deductible so tool C can pick
  // them up, but advisor can override on any single record.
  { slug: "agent-fees",        label: "Agent / marketing rep fees", hint: "Cross-checks against the fee from every contract.", athleteSpecific: true, deductible: true },
  { slug: "private-training",  label: "Personal training / private coaching",                                              athleteSpecific: true, deductible: true },
  { slug: "recovery",          label: "Recovery services",             hint: "Massage, physical therapy, chiropractic.",   athleteSpecific: true, deductible: true },
  { slug: "nutrition",         label: "Nutrition, supplements, meal prep",                                                 athleteSpecific: true, deductible: true },
  { slug: "sports-psych",      label: "Sports psychologist / mental performance",                                          athleteSpecific: true, deductible: true },
  { slug: "equipment",         label: "Specialized equipment / gear",  hint: "Beyond what the team provides.",             athleteSpecific: true, deductible: true },
  { slug: "camps",             label: "Camp, combine, or showcase fees",                                                   athleteSpecific: true, deductible: true },
  { slug: "nil-travel",        label: "Travel for NIL appearances / photo shoots",                                         athleteSpecific: true, deductible: true },
  { slug: "social-media",      label: "Social media management / content production",                                      athleteSpecific: true, deductible: true },
  { slug: "personal-brand",    label: "Personal brand / merch production",                                                 athleteSpecific: true, deductible: true },
  { slug: "family-travel",     label: "Family travel to games (athlete-paid)",                                              athleteSpecific: true, deductible: false },
];

export const EXPENSE_LINE_BY_SLUG = Object.fromEntries(
  EXPENSE_LINES.map((l) => [l.slug, l] as const),
);
