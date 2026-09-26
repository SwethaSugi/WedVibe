// Every mobile number is stored as "+<countrycode><number>" (e.g. "+919876543210") so the
// same person is found whether they type "98765 43210", "09876543210" or "+91-98765-43210".
// Returns null for input that isn't a plausible mobile number.
export function normalizeMobile(input: string): string | null {
  const trimmed = input.trim();
  const hasPlus = trimmed.startsWith("+");
  let digits = trimmed.replace(/\D/g, "");

  if (!hasPlus) {
    if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1);
    if (digits.length === 10) return `+91${digits}`;
    if (digits.length === 12 && digits.startsWith("91")) return `+${digits}`;
    return null;
  }

  return digits.length >= 10 && digits.length <= 15 ? `+${digits}` : null;
}
