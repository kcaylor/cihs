# CIHS · Intellectual Humility Self-Assessment

A single-page web app that delivers the **Comprehensive Intellectual Humility Scale (CIHS)** — a 22-item self-report measure developed by Krumrei-Mancuso & Rouse — for team strategic-planning exercises.

- 22 statements rated on a 1–5 Likert scale
- Automatic reverse scoring for items 1, 3, 5, 18, 19, 20, 21
- Four subscale averages + overall CIHS score
- Interpretation band (Very High → Rigid) with explanation
- Copy-to-clipboard or print-to-PDF summary teammates can bring back to the group
- Answers persist in the browser's `localStorage` — nothing is sent to a server

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The app is a single client-rendered page in `app/page.tsx` → `app/components/Assessment.tsx`.
The scoring logic lives in `app/lib/cihs.ts`.

## Deploy to Vercel

The app is a standard Next.js App Router project with no server-side dependencies, so deployment is one command:

```bash
npx vercel        # preview deployment
npx vercel --prod # production deployment
```

Or push the repo to GitHub and import it at [vercel.com/new](https://vercel.com/new). The default Next.js framework preset works as-is.

Once deployed, share the Vercel URL with your team. Each teammate fills out their own survey privately, then uses **Copy summary** or **Print / Save PDF** to bring their results to the planning conversation.
