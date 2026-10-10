# Showcase site (template demos for social media)

A static site built from this same project: a homepage with every live design and one page per
design (e.g. `/silk-scroll`) that opens like a real invitation with sample names and photos.
No prices, ordering, login or database. Hosted free on **Cloudflare Pages**.

- Pages: `src/app/page.showcase.tsx`, `src/app/[slug]/page.showcase.tsx`, `src/app/layout.showcase.tsx`
- Template list: `src/showcase/templates.json` (exported from the admin data)
- Share images: `public/og/<slug>.png`
- Build: `npm run build:showcase` → static files in `out/`

## Put it online (one time, about 5 minutes)

1. Sign up / log in at **dash.cloudflare.com** (free).
2. **Workers & Pages → Create → Pages → Connect to Git** → connect GitHub and pick
   **SwethaSugi/WedVibe**.
3. Settings:
   - **Project name:** `wedvibe` (this becomes `wedvibe.pages.dev`)
   - **Production branch:** `main`
   - **Framework preset:** None
   - **Build command:** `npm run build:showcase`
   - **Build output directory:** `out`
   - **Environment variables:**
     - `NODE_VERSION` = `22`
     - `SHOWCASE_URL` = `https://wedvibe.pages.dev` (your site's address; used for share
       previews. Update it if the name differs or when you add your own domain.)
4. **Save and Deploy.** The first build takes a few minutes.

Every push to GitHub rebuilds it automatically.

## When you add, rename or hide templates

The showcase uses the template list saved in the project, so after changing templates in the
admin panel (on your computer):

```bash
npm run showcase:export
```

Then commit and push; Cloudflare rebuilds the showcase with the new list and share images.

## Own domain later

Cloudflare Pages → your project → **Custom domains** → e.g. `designs.wedvibe.in`, then set
`SHOWCASE_URL` to it and redeploy.
