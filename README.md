# Sangama Traders Website (fresh fruits and vegetables)

Next.js (App Router) + TypeScript, Neon Postgres, Cloudinary, Tailwind, Zod. Built to deploy on Vercel.

## 1. How the pieces connect

Vercel runs the code. Neon and Cloudinary are separate online services that the code talks to over the internet. You connect them by copying their keys into **environment variables**.

```
Visitor's browser ──► Vercel (Next.js: pages + API routes)
                         │            │
                         │            └──► Neon Postgres   (DATABASE_URL)
                         │
Admin's browser ─────────┴──► asks Vercel for a signature (uses CLOUDINARY_API_SECRET)
Admin's browser ─────────────► uploads the file straight to Cloudinary (the file never touches Vercel)
```

Nothing else is needed: no server to rent, no extra backend. Next.js already contains the "backend" (API routes and server code), so this is **one project with a frontend part and a backend part in separate folders**:

| Folder | What it is |
| --- | --- |
| `src/app`, `src/components` | Frontend: public pages, admin screens, forms |
| `src/app/api` | Backend entry points (login, products, uploads, enquiries) |
| `src/server` | Backend logic: database, login/session, Cloudinary, email, rate limiting |
| `src/config` | **Your content and theme**: `site.ts` and `theme.ts` |
| `drizzle` | Database migrations (SQL) |
| `scripts` | Helper scripts: create admin password hash, add a sample product |

## 2. Change the hero, logo and categories

- **Hero video:** replace `public/hero/hero.mp4` (MP4, no audio, under 4 MB) and `public/hero/poster.jpg` (its first frame). The hero text sits on top of the video, which plays once. When it ends, a blurred slideshow takes over. Phones and slow connections skip the video.
- **Slideshow:** replace `public/hero/slides/slide-1.jpg` to `slide-6.jpg` (landscape, 1600 px wide or more, under 300 KB each). Slide 1 is a frame from the video: replace it with your aerial ship photo. Slides 2 to 6 are placeholders cut from the produce photo.
- **"Why choose us" photos:** `public/images/why-reliability.jpg`, `why-quality.jpg`, `why-delivery.jpg` (portrait, about 800 x 960). Their titles and text are in `src/config/site.ts`.
- **Logo:** `public/brand/logo.png` (header) and `public/brand/logo-mark.png` (footer).
- **Hero text, stats, about text, contact details, markets, product list:** all in `src/config/site.ts`.
- **Colours and fonts:** `src/config/theme.ts` (navy "ink", orange "brand", teal/blue/violet "deep" for gradient bands). Headings use the self-hosted Barlow Condensed font.
- **Categories:** only Fruits and Vegetables. To add another later, edit the one list in `src/lib/categories.ts`, then run `npm run db:generate` and `npm run db:migrate`.
- **Upgrading an existing database:** `npm run db:migrate` now also applies `0001_fruits_vegetables_categories`. It turns old "produce" products into "fruits". If any machinery or fabrication products exist, it stops with a message; delete them in `/admin` first.

## 3. Fill in your details first

Open **`src/config/site.ts`** and replace everything marked `[TO FILL]`: company name, tagline, about text, contact details, markets. Add your logo file to `public/` and set `logoSrc`.

Colours and fonts live in **`src/config/theme.ts`** (currently navy and blue, system fonts, light mode only).

## 4. Create the accounts

### Neon (database)
1. Create a project at https://neon.tech.
2. Click **Connect**, turn **Connection pooling ON**, and copy the connection string. Its host contains `-pooler`. This is `DATABASE_URL`.

### Cloudinary (images and PDFs)
1. Create an account at https://cloudinary.com.
2. On the dashboard copy **Cloud name**, **API Key**, **API Secret**.
3. In **Settings > Security**, enable **PDF and ZIP files delivery**. It is off by default on new accounts, and without it your PDF documents will not open for visitors.

### Resend (enquiry emails, optional)
1. Create an account at https://resend.com and create an API key.
2. While testing, use `onboarding@resend.dev` as the sender. It can only send to the email address you signed up with.
3. For real use, verify your domain in Resend, then use an address like `enquiries@your-domain.com` as `ENQUIRY_FROM_EMAIL`.
4. If you leave `RESEND_API_KEY` empty, enquiries are still saved and shown in `/admin`. Only the email is skipped.

## 5. Run it on your computer

Needs Node.js 20.9 or newer.

```bash
npm install
cp .env.example .env.local        # then fill in the values
```

Create the admin password hash and paste the output line into `.env.local`:

```bash
npm run hash-password -- "choose a long password"
```

Create a session secret (32+ characters) for `SESSION_SECRET`:

```bash
openssl rand -base64 48
```

Create the tables, add one sample product, and start:

```bash
npm run db:migrate
npm run db:seed
npm run dev
```

Open http://localhost:3000 and http://localhost:3000/admin.

> If `db:migrate` complains about the pooled connection, temporarily use Neon's non-pooled ("direct") connection string for that one command.

## 6. What to test

1. **Database**: after `db:migrate`, the Neon dashboard (Tables) shows `products`, `product_specs`, `product_images`, `product_documents`, `enquiries`, `rate_limits`.
2. **Login**: `/admin` sends you to `/admin/login`. A wrong password shows an error. After 5 wrong tries in 15 minutes it blocks you. The right password opens the product list.
3. **Upload**: New product > drop 2 images. Progress bars fill, alt text appears, you can pick a cover, reorder, and add a PDF.
4. **Save**: "Save as draft" does not appear on the public site. "Publish" appears at once in `/catalogue` and on the home page.
5. **Edit**: change the name or a spec, save, and reload the public product page. The change shows immediately.
6. **Delete**: delete a product. Its files disappear from Cloudinary (Media Library > `products` folder).
7. **Enquiry**: send the contact form and open `/admin/enquiries`. The record is there (and an email arrives if Resend is set up).
8. **SEO**: `/sitemap.xml` lists published products, `/robots.txt` hides `/admin`, and a product page's source contains the Open Graph tags and `application/ld+json` data.

## 7. Deploy to Vercel

1. Put the project in a GitHub repository (`.env.local` is ignored by git, so your keys are not uploaded).
2. On https://vercel.com choose **Add New > Project** and import the repository. The Next.js settings are detected automatically.
3. Before the first deploy, open **Settings > Environment Variables** and add every variable from `.env.example`:

| Variable | Value |
| --- | --- |
| `DATABASE_URL` | Neon pooled connection string |
| `ADMIN_PASSWORD_HASH` | output of `npm run hash-password` |
| `SESSION_SECRET` | random string, 32+ characters |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | from Cloudinary |
| `NEXT_PUBLIC_SITE_URL` | `https://your-domain.com` (no trailing slash) |
| `RESEND_API_KEY`, `ENQUIRY_TO_EMAIL`, `ENQUIRY_FROM_EMAIL` | optional, for email |

4. Make sure the database tables exist (`npm run db:migrate` from your computer, using the same `DATABASE_URL`), then click **Deploy**.
5. Open `https://your-project.vercel.app/admin`, sign in and add products.

**Tip:** Neon branches let you keep a separate database for development and production. Use one branch's connection string locally and the other in Vercel.

### Custom domain
1. In Vercel: **Settings > Domains > Add**, enter your domain.
2. At your domain registrar, add the DNS records Vercel shows (usually an `A` record for the bare domain and a `CNAME` for `www`).
3. When the domain is active, set `NEXT_PUBLIC_SITE_URL` to `https://your-domain.com` and **redeploy** so the sitemap, canonical links and Open Graph URLs use it.
4. If you use Resend, verify the same domain there and update `ENQUIRY_FROM_EMAIL`.

## 8. How it works (short)

- **Public pages** are static (ISR). Saving or deleting a product in the admin calls `revalidatePath`, so Vercel rebuilds the affected pages immediately. An hourly refresh is only a safety net.
- **Public pages ship almost no JavaScript**: only the contact form is interactive. The category filter and mobile menu use plain links and `<details>`.
- **Images** use `next/image` with a Cloudinary loader (`f_auto`, `q_auto`, responsive sizes, lazy loading) and a blur placeholder created when the page is built.
- **Login** is one password, checked against a scrypt hash. The session is a signed, httpOnly cookie valid for 7 days. Middleware blocks every `/admin` page and every `/api/admin` route without a valid cookie, and each handler checks again.
- **Rate limits** (login 5 per 15 minutes, enquiries 8 per hour per IP) are stored in the `rate_limits` table so they work across Vercel's serverless instances. The enquiry form also has a hidden honeypot field.
- **Uploads** are signed by the server and sent directly from the browser to Cloudinary. The signature limits file types and folders, and the server rejects any save that references files outside this site's folders.
- **Deleting** a product (or removing an image or PDF from it) deletes the files from Cloudinary. If Cloudinary fails, the admin sees a warning.

## 9. Good to know

- Drafts are never visible on the public site, not even by direct URL.
- A product's web address (slug) is created from its name when first saved and then stays the same, so links do not break if you rename it.
- Images that were uploaded in the form but never saved (you closed the tab) stay in Cloudinary's `products` folder. You can clean them up in the Media Library.
- Cloudinary's free plan has monthly limits. Check them if you upload many large files.

## Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Start locally |
| `npm run build` / `npm start` | Production build and run |
| `npm run typecheck` | Check TypeScript |
| `npm run db:generate` | Create a new migration after you change `src/server/db/schema.ts` |
| `npm run db:migrate` | Apply migrations to the database |
| `npm run db:seed` | Add one sample product |
| `npm run hash-password -- "password"` | Create `ADMIN_PASSWORD_HASH` |
