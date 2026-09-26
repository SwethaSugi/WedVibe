// Marketing-friendly template count: rounds down to a milestone ("20+", "50+") instead of
// showing the exact number, which would look small and change with every new template.
const MILESTONES = [500, 200, 100, 50, 30, 20, 10];

export function designCountLabel(count: number): string | null {
  const milestone = MILESTONES.find((m) => count >= m);
  return milestone ? `${milestone}+` : null;
}
