# Deploying to Cloudflare Pages

The live site, **twistywrapenterprises.com**, is hosted on **Cloudflare Pages**. GitHub Pages (`.github/workflows/pages.yml`) only publishes a **test copy**. That copy has the enquiry form switched off and is hidden from search engines.

## What runs where

| Piece | Cloudflare service | Lives in |
|---|---|---|
| Website (React build) | Pages, static assets | `frontend/build/` (from `yarn build`) |
| Enquiry endpoint `POST /api/enquiries` | Pages Functions | `frontend/functions/api/` + `frontend/cf/enquiry.js` |
| Enquiry records | D1 (SQLite), binding `DB` | schema in `frontend/migrations/` |
| Enquiry attachments | R2, binding `ATTACHMENTS` | bucket `twisty-enquiry-attachments` |
| Notification email to admin@ | Resend API, secret `RESEND_API_KEY` | `frontend/cf/enquiry.js` |
| Sitemaps + robots.txt | generated at build | `frontend/scripts/sitemap.mjs` (`postbuild`) |
| Headers / caching | `_headers` | `frontend/public/_headers` |

All configuration is in `frontend/wrangler.toml`. The only secret is `RESEND_API_KEY`, which is stored encrypted in Cloudflare and never committed.

`backend/` (FastAPI + MongoDB) is the original Emergent backend. It is **not deployed**. The Pages Function replaces it, and the folder is kept for reference only.

---

## One-time setup

Run these commands from `frontend/`. Wrangler runs through `npx`, so nothing extra needs installing.

1. **Log in:** `npx wrangler@4 login`
2. **Create the Pages project:** `npx wrangler@4 pages project create twisty-wraps --production-branch main`
3. **Create the database**
   1. Run `npx wrangler@4 d1 create twisty-enquiries`.
   2. Copy the printed `database_id` into `wrangler.toml`, replacing the `00000000-…` placeholder.
   3. Create the table with `npx wrangler@4 d1 migrations apply twisty-enquiries --remote`.
4. **Create the attachment bucket.** Enable R2 once in the dashboard (it has a free tier), then run `npx wrangler@4 r2 bucket create twisty-enquiry-attachments`.
5. **Set up email through Resend** (https://resend.com)
   1. Add the domain `twistywrapenterprises.com` in Resend.
   2. Add the DNS records Resend shows in **Cloudflare DNS**, copying the exact values from Resend. This account uses a DKIM TXT record at `resend._domainkey` and two CNAME records, `send` and `rsend`. Set both CNAMEs to **DNS only**.
      These records sit on subdomains, so **the root MX and SPF records and the GoDaddy mailbox are not affected**. Don't add a second root SPF record or a new DMARC record.
   3. Once the domain shows *Verified*, create an API key with *Sending access* limited to this domain.
   4. Store the key as a secret with `npx wrangler@4 pages secret put RESEND_API_KEY --project-name twisty-wraps`, then paste the key when prompted.
6. **Deploy:** in PowerShell, run `$env:CI="false"; yarn build; yarn cf:deploy --branch main`. Without `--branch main`, a deploy from any other git branch only creates a preview.
7. **Add the custom domain.** Go to Dashboard → Workers & Pages → twisty-wraps → Custom domains, then add `twistywrapenterprises.com` and `www.twistywrapenterprises.com`.
8. **Check it's working**
   - Open `https://twistywrapenterprises.com/api`. It should show `"database": true, "attachments": true, "email": "configured"`.
   - Send a test enquiry and confirm it arrives in admin@.
9. **Tell search engines.** Submit `https://twistywrapenterprises.com/sitemap.xml` in Google Search Console and Bing Webmaster Tools.

### Moving the domain's DNS to Cloudflare (keep email working!)

The domain is registered at GoDaddy (nameservers `ns63/ns64.domaincontrol.com`), and the **admin@ mailbox is GoDaddy email**. When you add the site to Cloudflare and switch nameservers, check that Cloudflare imported these records **before** switching. Add any that are missing:

| Type | Name | Value | Note |
|---|---|---|---|
| MX | `@` | `smtp.secureserver.net` (priority 0) | GoDaddy mail, **required** |
| MX | `@` | `mailstore1.secureserver.net` (priority 10) | GoDaddy mail, **required** |
| TXT | `@` | `v=spf1 include:secureserver.net -all` | keep exactly as is |
| TXT | `_dmarc` | `v=DMARC1; p=quarantine; ...` | keep exactly as is |
| SRV | `_autodiscover._tcp` | `autodiscover.secureserver.net` | GoDaddy mail client setup |
| CNAME | `email`, etc. | as listed in GoDaddy DNS | copy any GoDaddy email records and set them to **DNS only** |

The current `A` records for `@` (`15.197.148.33`, `3.33.130.190`) point at GoDaddy's parking/website service. The Pages custom domain (step 7) replaces them, so delete them when Cloudflare asks.

---

## Everyday deploys

```powershell
cd frontend
$env:CI = "false"     # CRA treats lint warnings as errors when CI=true
yarn build            # also writes sitemap.xml, sitemap-pages.xml, sitemap-products.xml, robots.txt
yarn cf:deploy --branch main   # uploads build/ + functions/ to Cloudflare Pages (production)
```

**Optional: build from Git instead.** In the Pages project, connect the GitHub repo with these settings:
- root directory `frontend`
- build command `yarn build`
- output `build`
- environment variable `CI=false`

Node 22 is picked up from `frontend/.node-version`.

## Local testing (Cloudflare runtime on your PC)

```powershell
cd frontend
$env:CI = "false"; yarn build
npx wrangler@4 d1 migrations apply twisty-enquiries --local   # first time only
yarn cf:dev -- --port 8788                                   # http://127.0.0.1:8788
```

Local D1/R2 data is kept in `frontend/.wrangler/`, which is gitignored. To send real email locally, create `frontend/.dev.vars` (also gitignored) containing `RESEND_API_KEY=re_...`. Without it, enquiries are still saved and the email step is skipped with status `not_configured`.

## Reading enquiries

Each enquiry is emailed to admin@ with any attachment included, and Reply goes straight to the customer. To see the stored records:

```powershell
npx wrangler@4 d1 execute twisty-enquiries --remote --command "SELECT reference, created_at, company, email, product, email_status FROM enquiries ORDER BY id DESC LIMIT 20"
```

`email_status` is one of `sent`, `failed` or `not_configured`. A password-protected admin page is still on the backlog (`memory/PRD.md`).

## Before go-live

- **Analytics:** the site has none. Emergent's script and PostHog were removed from `frontend/public/index.html`. Cloudflare Web Analytics is a free, cookie-free option if visitor numbers are needed.
- **Spam:** the form has a honeypot field and only accepts posts from the site's own origin. If spam still gets through, add Cloudflare Turnstile.
