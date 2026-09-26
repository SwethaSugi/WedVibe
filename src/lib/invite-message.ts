// The message couples send to guests with their invitation link (Copy Link / WhatsApp share).
// Lines for details the couple hasn't filled in are left out.
export interface InviteMessageDetails {
  groomName: string;
  brideName: string;
  weddingDate?: string;
  weddingTime?: string;
  venueName?: string;
  venueAddress?: string;
}

export function buildInviteMessage(d: InviteMessageDetails, url: string): string {
  const couple = `${d.groomName} & ${d.brideName}`;
  const date = d.weddingDate
    ? new Date(d.weddingDate).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
    : "";
  const venue = [d.venueName, d.venueAddress].filter((v) => v && v.trim()).join(", ");

  const details = [date && `📅 ${date}`, d.weddingTime && `⏰ ${d.weddingTime}`, venue && `📍 ${venue}`].filter(Boolean);

  return [
    "🌸 With joy in our hearts 🌸",
    "",
    "Together with our families, we humbly and warmly invite you to celebrate our wedding.",
    "",
    `✨ ${couple} ✨`,
    ...(details.length ? ["", ...details] : []),
    "",
    "Your presence and blessings would mean the world to us as we begin this beautiful new chapter of our lives together. 🙏",
    "",
    "Please view our wedding invitation for all the details:",
    url,
    "",
    "With love and warm regards,",
    `${couple} ❤️`,
  ].join("\n");
}
