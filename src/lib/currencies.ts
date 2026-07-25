export const PLAN_CURRENCIES = [
  "SAR",
  "AED",
  "KWD",
  "QAR",
  "OMR",
  "BHD",
  "GBP",
  "USD",
  "CAD",
  "AUD",
  "NZD",
  "PKR",
  "BDT",
  "ZAR",
] as const;

export type PlanCurrency = (typeof PLAN_CURRENCIES)[number];

/** Approximate multipliers from a GBP base amount */
export const GBP_FX: Record<PlanCurrency, number> = {
  GBP: 1,
  USD: 1.27,
  CAD: 1.72,
  AUD: 1.92,
  NZD: 2.08,
  PKR: 355,
  BDT: 155,
  SAR: 4.76,
  ZAR: 23.5,
  AED: 4.7,
  KWD: 0.39,
  QAR: 4.65,
  OMR: 0.49,
  BHD: 0.48,
};
