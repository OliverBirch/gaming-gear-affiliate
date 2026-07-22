# Pre-launch checklist

## Placeholders to replace

### Retailers
- `elgiganten` — no logo, no real affiliate setup
- `avxperten` — no logo, no real affiliate setup
- `dustinhome` — no logo, no real affiliate setup
- `komplett` — no logo, no real affiliate setup
- `billo` — no logo, no real affiliate setup, placeholder name

### Brand logos (Wikimedia hotlinks)
- `src/data/brands.ts` — Logitech, Razer, Zowie logos link to `upload.wikimedia.org`
- Replace with local images in `public/images/brands/`

### Site logo
- `public/images/logos/PROSETUPS transparent.png` — filename contains spaces, rename for cleaner URLs

## Launch blockers

- [ ] Remove `noindex, nofollow` from `next.config.ts`
- [ ] Verify all affiliate links route through `/api/redirect`
- [ ] Confirm all retailer payouts are real (not placeholder)
- [ ] Test all price comparison sections with real data
- [ ] Remove `upload.wikimedia.org` from `next.config.ts` remotePatterns when brand logos are local

## Content

- [ ] Review all product descriptions for completeness
- [ ] Verify all pro settings data is current
- [ ] Check all Danish copy for typos

## SEO

- [ ] Add actual `<title>` + meta descriptions per page
- [ ] Verify sitemap generation
- [ ] Set canonical URLs
- [ ] Submit to Google Search Console

## Technical

- [ ] Run lighthouse audit
- [ ] Verify mobile responsive
- [ ] Test all product filters and quiz
- [ ] Check affiliate link redirects work in production
