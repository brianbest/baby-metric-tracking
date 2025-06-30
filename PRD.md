Baby Metrics Tracker – Product Requirements Document (v0.2)

0. One-Sentence Summary

A zero-friction, multi-caregiver dashboard that turns everyday baby events into actionable insights and shared peace of mind — built solely for private family use (no public release).

1. Problem Statement

New parents are quickly overwhelmed by ad-hoc spreadsheets, paper logs, and siloed mobile apps when attempting to answer seemingly simple questions:

“How much has the baby eaten today?”

“When did she last nap?”

“Are night-wakings getting better or worse?”

Without a single source of truth that synchronises across devices and caregivers, patterns are missed, stress increases, and paediatric recommendations are harder to follow.

2. Goals & Non-Goals

Goals

Collaborative Logging – multiple caregivers add and view entries in real time.

Actionable Insights – roll-ups, streaks, and alerts surface trends without manual maths.

Instant Onboarding – first entry in under 60 s, no account required in Phase 1.

Data Ownership – easy export (JSON/CSV) at any time; no vendor lock-in.

Bilingual Support – full Simplified Chinese & English localisation available from Phase 1.

Non-Goals (v1)

Growth mechanics (referrals, sharing milestones to social).

Predictive/AI recommendations beyond simple rule-based alerts.

Tracking of medical data beyond the three core metrics (temperature, medicine doses, etc.).

3. Success Metrics

| KPI                                        | Target (post-launch)         | How Measured               |
| ------------------------------------------ | ---------------------------- | -------------------------- |
| Time-to-First-Entry                        | ≤ 45 s median                | UX testing instrumentation |
| Entries per Baby per Day                   | ≥ 5                          | prod DB                    |
| D7 Retention                               | ≥ 40 %                       | product analytics          |
| Error Rate (failed saves, merge conflicts) | < 0.5 %                      | backend logs               |
| SUS Score                                  | ≥ 80/100 in caregiver survey | usability study            |

4. Personas

| Persona                            | Context                                           | Key Needs                                 |
| ---------------------------------- | ------------------------------------------------- | ----------------------------------------- |
| Primary Parent (on parental leave) | Logs most feeds/diapers, wants pattern visibility | One-handed entry, night-mode UI           |
| Partner                            | Different shifts, picks up late-night feeds       | Quick catch-up view, notifications        |
| Grandparent / Nanny                | Less tech-savvy, occasional caregiver             | Simplified logging, language localisation |
| Paediatrician (indirect)           | Needs accurate history                            | Exportable PDF/CSV summaries              |

5. User Stories (excerpt)

- As a caregiver, I can tap one icon to start a nap timer so I don’t fumble with forms while holding the baby.
- As a parent, I receive a push reminder if no feed is logged for 3 h during waking hours.
- As a paediatrician, I can receive a 7-day CSV of feeds and diapers to import into my EHR.

6. Data Model & Key Features

### 6.1 Core Entities

- **Baby** (id, name, birth-date, preferred units)
- **User** (id, auth provider, role)
- **Entry** (id, baby_id, type, payload_json, created_at, created_by)

### 6.2 Metric-Specific Schemas

| Type    | Required Fields                 | Optional                                         | Notes                                |
| ------- | ------------------------------- | ------------------------------------------------ | ------------------------------------ |
| Feeding | timestamp, volume, unit, source | location, side (L/R), bottle_type, formula_brand | volume optional if breastfeeding     |
| Diaper  | timestamp, type                 | notes                                            | colour selector for dirty type       |
| Sleep   | start_ts, end_ts                | quality (1-5)                                    | duration auto-calc, in-progress flag |

### 6.3 UX Features

- **Quick-Add Widgets**: pre-sets (“+60 ml bottle”, “Start nap”) and **Repeat Last** buttons that clone the most recent entry for rapid re-logging.
- **Daily Dashboard**: coloured stacked bars for 24 h timeline; toggle ml/oz.
- **Data Export**: JSON / CSV / printable PDF.

7. Phase Plan & Exit Criteria

| Phase            | Scope Highlights                                                     | Exit Criteria                                                                                                                                  |
| ---------------- | -------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| P1 – Browser POC | SPA with LocalStorage, Chart.js graphs, service-worker offline cache | Family trial: wife + two in-laws log a full week with zero data loss; informal UX score ≥4/5; wife sign-off required                           |
| P2 – Cloud MVP   | Auth, Postgres, real-time WebSocket, basic alerts                    | Same 3-5 caregivers log for 30 consecutive days; avg ≥5 entries/day; backend error rate <1 %; wife sign-off required                           |
| P3 – Mobile      | React Native, push notifications, biometric login                    | Side-loaded builds on family devices (no App Store/Play release); caregivers rate mobile app ≥4.5/5 in internal survey; wife sign-off required |

8. Non-Functional Requirements

- **Performance**: P95 interaction latency <150 ms on last-gen mid-range Android.
- **Accessibility**: WCAG 2.2 AA incl. colour-blind safe palette.
- **Security & Privacy**: AES-256 at rest (cloud), HTTPS/TLS 1.3, regular pentest.
- **Internationalisation**: Full Simplified Chinese and English UI across all screens, notifications, and exports; RTL layout support, metric/imperial toggle, locale-aware dates.

9. Analytics & Instrumentation

- Client events sent to Segment (free tier).
- Funnel: open app → first entry → 7-day active streak.
- Crash reporting via Sentry; performance via Web Vitals.

10. Risks & Mitigations
    Risk | Impact | Mitigation
    --- | --- | ---
    Data loss in offline mode | High | IndexedDB queue with retry & versioned schema migrations
    Caregiver fatigue (churn) | Med | Smart defaults, reminders, gamified streaks
    Regulatory (COPPA) | Low | Do not collect PII about the child beyond name; parent consent flow

11. Key Design Decisions

- **Feeding Details**: Capture method specifics (bottle type, formula brand, nursing side) in v1. Provide Quick-Add 'Repeat Last Feed' to speed entry.
- **Sleep Granularity**: One-minute resolution is sufficient for insights; backend stores seconds for future precision.
- **Export Formats**: CSV and printable PDF summaries will be supported initially; FHIR deferred until clinical demand emerges.
- **Dark-Mode First**: Default UI theme will be dark with optional light mode.
