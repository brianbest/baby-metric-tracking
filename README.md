# Baby Metric Tracker

> A zero-friction, multi-caregiver dashboard that turns everyday baby events into actionable insights and shared peace of mind — built solely for private family use.

## 🍼 What It Does

The Baby Metric Tracker helps new parents and caregivers collaboratively track a baby's daily activities without the overwhelm of spreadsheets or siloed apps. Answer questions like:

- "How much has the baby eaten today?"
- "When did she last nap?"
- "Are night-wakings getting better or worse?"

## ✨ Key Features

### Core Metrics
- **Feeding**: Track volume, source (breast/bottle/solid), and timing
- **Diaper Changes**: Log type (wet/dirty/mixed) with optional notes
- **Sleep**: Start/end times with automatic duration calculation

### User Experience
- **Quick-Add Widgets**: Pre-set buttons ("+60 ml bottle", "Start nap")
- **Repeat Last**: Clone recent entries for rapid re-logging
- **Daily Dashboard**: 24-hour timeline with colored stacked bars
- **Dark Mode First**: Night-friendly interface by default
- **Bilingual**: Full English and Simplified Chinese support

### Data Ownership
- Easy export to JSON/CSV/PDF
- No vendor lock-in
- WCAG 2.2 AA accessibility compliant

## 🚀 Development Phases

| Phase | Timeline | Scope | Exit Criteria |
|-------|----------|-------|---------------|
| **P1 - Browser POC** | 2 weeks | LocalStorage SPA, offline-first | Family trial: 1 week logging, zero data loss |
| **P2 - Cloud MVP** | 4 weeks | Auth, Postgres, real-time sync | 30-day trial, ≥5 entries/day, <1% errors |
| **P3 - Mobile App** | 3 weeks | React Native, push notifications | Side-loaded builds, ≥4.5/5 rating |

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **State Management**: Zustand + React Query
- **Backend**: Supabase (Postgres + Auth + Realtime)
- **Mobile**: React Native + Expo
- **Testing**: Vitest + Playwright + Storybook
- **Analytics**: Segment + Sentry

## 🚦 Getting Started

### Prerequisites
- Node.js 18+
- pnpm (recommended) or npm

### Quick Start
```bash
# Clone the repository
git clone https://github.com/brianbest/baby-metric-tracking.git
cd baby-metric-tracking

# Install dependencies
pnpm install

# Start development environment
pnpm dev
```

This will spin up:
- Vite dev server (web app)
- Local Supabase instance
- Storybook (component library)
- Expo dev server (mobile app)

## 📋 Project Structure

```
├── PRD.md              # Product Requirements Document
├── DevPlan.MD          # Phase-by-phase development plan
├── packages/
│   ├── web/           # React web application
│   ├── mobile/        # React Native mobile app
│   └── shared/        # Shared business logic
└── docs/              # Documentation site
```

## 🎯 Success Metrics

- **Time-to-First-Entry**: ≤45s median
- **Daily Entries**: ≥5 per baby
- **7-Day Retention**: ≥40%
- **Error Rate**: <0.5%
- **SUS Score**: ≥80/100

## 📖 Documentation

- [Product Requirements Document](./PRD.md) - Detailed feature specifications
- [Development Plan](./DevPlan.MD) - Technical implementation roadmap

## 🔒 Privacy & Security

- Built for private family use only
- No public release planned
- AES-256 encryption at rest
- HTTPS/TLS 1.3 for all traffic
- COPPA compliant (minimal child PII)

## 📝 License

ISC License - See [LICENSE](./LICENSE) for details.
