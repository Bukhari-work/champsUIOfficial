export interface FeePeriod {
  opensAt?: string;
  closesAt?: string;
}

export type FeeState = "standard" | "scheduled" | "current" | "ended";

// No timing metadata means no claim about availability. Past-event prices are
// historical information, never an offer currently available to the reader.
export function getFeeState(
  rate: FeePeriod,
  now = Date.now(),
  archived = false,
): FeeState {
  if (archived || (!rate.opensAt && !rate.closesAt)) return "standard";
  const opens = rate.opensAt ? Date.parse(rate.opensAt) : -Infinity;
  const closes = rate.closesAt ? Date.parse(rate.closesAt) : Infinity;
  if (Number.isNaN(opens) || Number.isNaN(closes) || opens >= closes)
    return "standard";
  if (now >= closes) return "ended";
  if (now < opens) return "scheduled";
  return "current";
}
