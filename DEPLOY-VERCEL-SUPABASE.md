# Deploy Vercel + Supabase

## 1. Vercel
- Importeer de GitHub repo in Vercel.
- Framework: Next.js.
- Build command: `npm run build`
- Output: standaard Next.js

## 2. Environment variables
Zet minimaal deze variabelen in Vercel:

```env
DATABASE_URL=
NEXT_PUBLIC_APP_URL=https://jouwdomein.nl
NEXT_PUBLIC_STUN_URLS=stun:stun.l.google.com:19302
NEXT_PUBLIC_TURN_URLS=
TURN_USERNAME=
TURN_CREDENTIAL=
NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY=
WEB_PUSH_PRIVATE_KEY=
WEB_PUSH_SUBJECT=mailto:you@example.com
EMAIL_FROM=Vonk <noreply@jouwdomein.nl>
RESEND_API_KEY=
```

## 3. Supabase
- Gebruik een aparte production database.
- Run lokaal eerst `npx prisma db push` tegen de production DB of gebruik migrations.
- Zet connection pooling aan als je opschaalt.

## 4. Video/live
- Voor productie is TURN nodig.
- Voor echte schaal: verplaats signaling van polling/in-memory naar een echte realtime laag.

## 5. Push
- Genereer VAPID keys.
- Zet de public key in `NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY`.
- Zet private key alleen server-side.

## 6. E-mail
- Batch 12 legt de queue en env-structuur klaar.
- Koppel in de volgende batch een provider zoals Resend of Postmark.
