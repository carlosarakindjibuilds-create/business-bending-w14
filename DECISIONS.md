# Architecture Decisions

## Week 14 — Pricing: The Number That Tells the Truth

### Context

The product needs buyer-facing pricing and a transparent revenue model without disturbing the existing Week 13 voice-capture experience or collecting real merchant data in a prototype.

### Decisions

1. Keep the existing capture experience and its handlers at `/`; add `/pricing` and `/about` as separate routes.
2. Use `react-router-dom` and configure Vercel to rewrite SPA paths to `/index.html`.
3. Calculate pricing projections locally from strictly bounded controls. Defaults must match the published month-six example.
4. Store only scenario assumptions and sanitized names in `localStorage`; include no personal data. Clearly mark every built-in example as `SIMULATED DATA`.
5. Escape no user strings into HTML: render sanitized scenario names as React text. Apply strict lengths and numeric ranges before calculation or persistence.
6. Treat ERP bridges, WhatsApp recovery, model SLAs, and retention claims as offer descriptions, not live integrations delivered in this milestone. Do not add API credentials or external data services.
7. Retain the Week 13 capture UI and its recording/recovery functionality unchanged, adding navigation without obstructing its primary controls.

### Verification

The packet defines the mechanical test plan. Build and scenario boundary checks will be recorded here after implementation.
