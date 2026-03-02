# Sprint 3 Backlog — Feature Requirements

Extracted from 30 SUPERSEDED Sprint 2 tasks (archived Mar 2, 2026).
These features are still needed but deferred until after the Payload CMS migration (Sprint 2) is complete.

## Events & Discovery

| Feature                                 | Original Task | Notes                                                                 |
| --------------------------------------- | ------------- | --------------------------------------------------------------------- |
| Category/tag filtering on events page   | #11           | One-click filter by category (Government, Community, Sports, etc.)    |
| Diverse event sourcing                  | #12           | Research citywide, sports, nearby events beyond District 16 meetings  |
| Event archive with browsable navigation | #13           | Past events should be browsable by month/year                         |
| Calendar export (Google Cal, iCal)      | #15           | Add .ics download and "Add to Google Calendar" buttons on event cards |

## User & Subscription System

| Feature                                        | Original Task | Notes                                                                        |
| ---------------------------------------------- | ------------- | ---------------------------------------------------------------------------- |
| Subscription system with tag-based preferences | #14           | Users pick topics (events, news, government) for email notifications         |
| User profile page with subscription management | #19           | Profile page using Payload native auth — manage subscriptions, view activity |

## Commenting & Moderation

| Feature                                   | Original Task | Notes                                             |
| ----------------------------------------- | ------------- | ------------------------------------------------- |
| Commenting and reply system on blog posts | #16           | Payload collection for comments, threaded replies |
| Comment moderation dashboard              | #20           | Admin UI for approving/flagging/deleting comments |

## Email & Notifications

| Feature                        | Original Task | Notes                                                  |
| ------------------------------ | ------------- | ------------------------------------------------------ |
| Email/SMTP notification system | #17           | Use @payloadcms/email-nodemailer + plugin-form-builder |

## Content & Media

| Feature                           | Original Task | Notes                                                          |
| --------------------------------- | ------------- | -------------------------------------------------------------- |
| Write 5+ diverse posts            | #21           | Community stories, local business spotlights, seasonal content |
| Process DJI photos, media library | #22           | Organize drone photos, optimize for web, set focal points      |
| Photo gallery/album component     | #24           | Dedicated gallery page or block for neighborhood photos        |
| Source 20+ neighborhood photos    | #25           | Licensed stock photos + community-submitted photos             |

## Visual Polish

| Feature                             | Original Task | Notes                                                  |
| ----------------------------------- | ------------- | ------------------------------------------------------ |
| Parallax effects, scroll animations | #27           | Add visual richness after core functionality is stable |

## Already Covered by Sprint 2

These features from the old plan are now handled by the Payload Website Template or Sprint 2 migration tasks:

- Nav alignment + auth (#1) — Template Header global
- FAQ page UX (#2) — FAQ CMS collection (Sprint 2 Phase 2)
- Spacing/alignment polish (#3) — Template layout system
- Clickable cards with detail pages (#4) — Template Archive block
- Breadcrumbs (#5) — @payloadcms/plugin-nested-docs
- Blog post detail page (#6) — Template Lexical rendering
- Event detail page (#7) — Sprint 2 Phase 2
- Sidebar: related posts (#8) — Template RelatedPosts block
- FAQ to CMS (#9) — Sprint 2 Phase 2
- Homepage hero/CTA to CMS (#10) — Template layout builder
- Admin user setup (#18) — Template first-visit setup
- SEO metadata (#23) — @payloadcms/plugin-seo
- Privacy policy/terms (#26) — Sprint 2 Phase 4
- QA audit (#28) — Sprint 2 Phase 5
- Update CLAUDE.md (#29) — Completed
- Uptime monitoring (#30) — Sprint 2 Phase 5
