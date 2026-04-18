# POWERSHELL-STAPPEN

## 1. Zip uitpakken
```powershell
Expand-Archive -Path .\vonk-build-batch3.zip -DestinationPath .\vonk-build-batch3
```

## 2. Naar projectmap gaan
```powershell
cd .\vonk-build-batch3\vonk-build
```

## 3. Dependencies installeren
```powershell
npm install
```

## 4. Environmentbestand maken
```powershell
Copy-Item .env.example .env -Force
```

## 5. Prisma client genereren
```powershell
npx prisma generate
```

## 6. Database pushen
```powershell
npx prisma db push
```

## 7. Seed draaien
```powershell
npm run db:seed
```

## 8. Development server starten
```powershell
npm run dev
```

## 9. Demo accounts
```text
admin@vonk.local / ChangeMe123!
demo@vonk.local / ChangeMe123!
milan@vonk.local / ChangeMe123!
noor@vonk.local / ChangeMe123!
daan@vonk.local / ChangeMe123!
zoe@vonk.local / ChangeMe123!
ruben@vonk.local / ChangeMe123!
```

## 10. Wat batch 3 toevoegt
- bezoekerspagina met premium gating
- geblokkeerde gebruikers pagina met deblokkeeractie
- meldingenoverzicht voor eigen reports
- settings profiel, voorkeuren, privacy en foto's werkend gemaakt
- media-basis via URL's voor avatar, introvideo en extra profielmedia
- blokkeren en rapporteren vanuit profiel en chat
- discover-filters op stad en geverifieerd
- seeddata met voorbeeldmedia, bezoekers en blockdata

## 11. Belangrijk
- In deze batch zijn media nog URL-gebaseerd. Echte file-upload + opslag/CDN + moderatiepipeline kunnen we als volgende batch toevoegen.
- Na een nieuwe zip of seed altijd opnieuw deze volgorde gebruiken: `npm install`, `prisma generate`, `prisma db push`, `npm run db:seed`, `npm run dev`.


## Batch 7 live video testen
Open twee browsers of één gewone browser + één incognito venster.
Log in met twee verschillende demo-accounts.
Ga in beide naar `/live`.
Klik in beide vensters op `Start queue` en geef camera/microfoon toestemming.
Wacht een paar seconden tot de live match verschijnt.
Test daarna `Like`, `Next`, `Report` en `End`.
Let op: deze batch gebruikt een dev-signalinglaag via polling en een publieke STUN-server. Voor productie is later een echte signaling service en TURN-server nodig.
