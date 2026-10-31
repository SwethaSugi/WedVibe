// The kinds of events a template is made for. Shown as the main filter on the Templates page;
// each template has one (Template.occasion), set by the admin. Existing designs are "wedding".

export const OCCASIONS = [
  { key: "wedding", label: "Wedding", hint: "Wedding, engagement, reception", icon: "💍" },
  { key: "baby-family", label: "Baby & Family", hint: "Valaikappu, naming, birthday", icon: "👶" },
  { key: "house-business", label: "House & Business", hint: "Housewarming, shop opening", icon: "🏡" },
  { key: "traditional", label: "Traditional & Religious", hint: "Pooja, festival, temple functions", icon: "🪔" },
] as const;

export type OccasionKey = (typeof OCCASIONS)[number]["key"];

export const OCCASION_KEYS = OCCASIONS.map((o) => o.key) as [OccasionKey, ...OccasionKey[]];

export function isOccasion(value: unknown): value is OccasionKey {
  return typeof value === "string" && (OCCASION_KEYS as string[]).includes(value);
}

export function occasionLabel(key: string) {
  return OCCASIONS.find((o) => o.key === key)?.label ?? "Wedding";
}
