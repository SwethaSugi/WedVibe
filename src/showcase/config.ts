import templates from "./templates.json";

// The showcase site's public address, used for share links and social previews. Set
// SHOWCASE_URL in the Cloudflare Pages project settings (e.g. https://designs.wedvibe.in);
// otherwise the default *.pages.dev address is used.
export const SHOWCASE_URL = (process.env.SHOWCASE_URL || "https://wedvibe.pages.dev").replace(/\/+$/, "");

export interface ShowcaseTemplate {
  slug: string;
  name: string;
  category: string;
  description: string | null;
  componentKey: string;
  previewImage: string | null;
}

/** Active templates, newest first (exported from the admin data by `npm run showcase:export`). */
export const SHOWCASE_TEMPLATES: ShowcaseTemplate[] = templates;
