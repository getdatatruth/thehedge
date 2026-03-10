# The Hedge — thehedge.ie

> Where Curious Families Learn

## Stack

- **Framework:** Next.js 16 (App Router)
- **Styling:** Tailwind CSS + CSS variables
- **Animation:** Framer Motion
- **Hosting:** Vercel (Dublin region — `dub1`)
- **Fonts:** Playfair Display · Lora · DM Sans

## Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# From the project root
vercel

# Follow prompts, connect to thehedge.ie domain
```

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project structure

```
the-hedge-web/
├── app/
│   ├── layout.tsx        ← Root layout + fonts
│   ├── globals.css       ← Design system tokens
│   └── page.tsx          ← Landing page
├── components/
│   ├── Nav.tsx
│   ├── Hero.tsx
│   ├── HowItWorks.tsx
│   ├── Features.tsx
│   ├── HomeschoolSection.tsx
│   ├── Testimonials.tsx
│   ├── Pricing.tsx
│   ├── Community.tsx
│   └── Footer.tsx
├── vercel.json           ← Vercel config (Dublin region)
└── .env.example
```

## Design tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--green-deep` | `#2C4A2E` | Primary brand |
| `--green-mid` | `#4A7C4E` | Secondary |
| `--green-light` | `#7BAE7F` | Accents |
| `--green-mist` | `#C8DFC9` | Backgrounds |
| `--cream` | `#F9F5EE` | Page background |
| `--earth` | `#8B6B4A` | Warm accents |
| `--gold` | `#C8962A` | Highlights |

## Adding pages

- `/blog` — content marketing (add to `app/blog/`)
- `/homeschool` — dedicated homeschool landing
- `/activities` — public activity library
- `/app` — post-login dashboard (Phase 2)
