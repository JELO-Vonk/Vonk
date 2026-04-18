# PROJECT-OVERZICHT

## Deze batch is nu werkend voor:
- auth
- onboarding
- discover
- likes
- matches
- basischat
- settings/visibility
- seed met meerdere demo-profielen

## Nog bewust voorbereid maar niet afgebouwd:
- echte video roulette signaling
- betalingen
- uploadpipeline
- email verificatieflow
- anti-bot infrastructuur
- uitgebreide moderation UI

## Belangrijk
Deze batch is gemaakt om stabiel op de huidige blueprint-build door te bouwen. Eerst deze flow laten draaien en testen, daarna pas video + billing toevoegen.


Batch 2 toegevoegd:
- profieldetailpagina /discover/[profileId]
- chatdetailpagina met echte post-route
- premium gating op ontvangen likes
- basis anti-spam en rate-limits via audit logs
