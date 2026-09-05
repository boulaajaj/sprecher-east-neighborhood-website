# Graph Report - sprecher-east-neighborhood-website  (2026-09-05)

## Corpus Check
- Large corpus: 306 files · ~647,003 words. Semantic extraction will be expensive (many Claude tokens). Consider running on a subfolder.

## Summary
- 1640 nodes · 3437 edges · 148 communities (91 shown, 48 thin omitted)
- Extraction: 86% EXTRACTED · 14% INFERRED · 0% AMBIGUOUS · INFERRED: 475 edges (avg confidence: 0.84)
- Token cost: 29,032,938 input · 57,127 output (semantic pass via 40 Claude Code subagents; input includes prompt-cache reads)

## Community Hubs (Navigation)
- shadcn UI & Form Fields
- Seed Data Pipeline
- Theme Providers & Archive Pages
- Header, Footer & Admin Shell
- Generated Payload Types
- Agent Roles: Backend & Ops
- Agent Roles: Frontend & Design
- Agent Roles: CMS & Content
- TypeScript Config
- Cards, Heroes & Date Formatting
- Agent Roles: Events & SEO
- Detail Pages & Structured Data
- Frontend Pattern Library
- Root Layout & URL Utilities
- VPS & Deploy Memory
- Payload Config & Sitemaps
- Sprint Backlogs
- RBAC Access Control
- Brand Voice Guidelines
- Sprint 2 Retrospective
- Legal & Compliance Agent
- Legacy Sanity Handoff
- Content Marketing Workflow
- Link Fields & Block Configs
- Media & Accessibility Agent
- Asana-GitHub Workflow
- Payload CMS Patterns
- UI/UX Design Standards
- FAQ, Resources & OpenGraph
- Rich Text & Content Blocks
- Next.js/Tailwind & Visual QA
- Custom Collections & Revalidation
- I-39/90/94 Corridor Logo
- Hero Renderers & CMS Link
- Section Backdrop Photos
- Dev Dependencies
- Posts Collection & Previews
- Media Components
- VPS Deploy & Secrets
- shadcn components.json
- Next Session Plan
- East Madison Neighborhood Map
- Users & Role Helpers
- PR Labels & CI Jobs
- Neighborhood Map (assets copy)
- Better Auth to Payload Migration
- npm Scripts
- CMS Page Route & Metadata
- Block Renderers
- Pages Collection & Block Configs
- Development Principles
- Redirects & Cached Documents
- Database Migrations
- Security Guidelines
- Hero & Aerial Photos
- City Meeting Tracker Proposal
- Legacy File Structure Memory
- Website Template Decision
- Wildflower Banner Photos
- Runtime Dependencies
- Legacy Better Auth Memory
- Project Progress Log
- Search & SEO Plugins
- Component Reuse Rules
- Events Page & Timezone
- package.json Metadata
- Git Workflow Rules
- Lint & Audit CI
- Prairie Sunset Photo (assets)
- Corridor Study Logo (public)
- Payload REST Route
- Prairie Wildflowers Banner
- Pickleball Courts Photo (assets)
- DDD Component Layers (legacy)
- Asana to GitHub Migration
- Image & Performance Rules
- Contact Form Migration Tasks
- Sweet Alyssum Banner Photo
- Blazing Star Banner (public)
- CTA Volunteers Backdrop
- Prairie Trail Sunset (public)
- Aerial Neighborhood Photo
- Payload Route Conventions
- ESLint Config
- Next Config & Redirects
- Sunset Prairie Path Photo
- Pickleball Courts Photo (public)
- Public Safety Night Photo
- Theme Types
- Squarespace Icon Font
- Daisy Field Banner (assets)
- Tree Canopy Photo (assets)
- Daisy Field Banner (public)
- Version Route
- Environment Types
- class-variance-authority
- cross-env
- Install Gotchas
- eslint-config-next
- eslint-config-prettier
- @eslint/eslintrc
- @eslint/js
- graphql
- Husky Pre-commit
- lint-staged
- lucide-react
- next
- next-sitemap
- payload
- @payloadcms/admin-bar
- @payloadcms/db-sqlite
- @payloadcms/live-preview-react
- @payloadcms/next
- @payloadcms/plugin-form-builder
- @payloadcms/plugin-nested-docs
- @payloadcms/plugin-redirects
- @payloadcms/plugin-search
- @payloadcms/plugin-seo
- @payloadcms/richtext-lexical
- @payloadcms/ui
- prism-react-renderer
- @radix-ui/react-checkbox
- @radix-ui/react-select
- react-dom
- react-hook-form
- sharp
- tailwind-merge
- postcss
- prettier
- prettier-plugin-tailwindcss
- @tailwindcss/postcss
- @tailwindcss/typography
- @types/node
- @types/react
- typescript-eslint
- PostCSS Config (js)
- Tree Canopy Photo (public)
- Tailwind Config
- Write Tool Gotcha

## God Nodes (most connected - your core abstractions)
1. `cn()` - 62 edges
2. `CMS Engineer Agent (cms-eng)` - 50 edges
3. `Frontend Engineer Agent (frontend-eng)` - 36 edges
4. `QA Reviewer Agent (qa-reviewer)` - 32 edges
5. `Frontend Design Patterns - Implementation Library` - 32 edges
6. `Backend Engineer Agent (backend-eng)` - 28 edges
7. `Content Lead Agent (content-lead)` - 28 edges
8. `Sprecher East Neighborhood Website` - 27 edges
9. `Operations Lead Agent (ops-lead)` - 27 edges
10. `Payload CMS v3 Website Template` - 26 edges

## Surprising Connections (you probably didn't know these)
- `Cover Pages Map Marker Pin (dark, 2x) — 48x64 RGBA PNG icon of a dark charcoal teardrop-shaped map/location pin with a white circular center dot; retina (2x) raster asset intended as a location marker on cover/hero pages. Unreferenced by any current src/ code — legacy asset carried over from the earlier RawBackUp / Next.js+Sanity rebuild (commits ec0acc1, 1e71c58); current UI uses the lucide-react MapPin icon for the same purpose.` --semantically_similar_to--> `EventCard()`  [INFERRED] [semantically similar]
  public/images/cover-pages-map-marker-pin-dark-2x.png → src/components/EventCard/index.tsx
- `Cover Pages Map Marker Pin (dark, 2x) — 48x64 RGBA PNG icon of a dark charcoal teardrop-shaped map/location pin with a white circular center dot; retina (2x) raster asset intended as a location marker on cover/hero pages. Unreferenced by any current src/ code — legacy asset carried over from the earlier RawBackUp / Next.js+Sanity rebuild (commits ec0acc1, 1e71c58); current UI uses the lucide-react MapPin icon for the same purpose.` --semantically_similar_to--> `Footer()`  [INFERRED] [semantically similar]
  public/images/cover-pages-map-marker-pin-dark-2x.png → src/Footer/Component.tsx
- `Section Backdrop Placeholder Photos` --semantically_similar_to--> `Section Backdrop Photo Guide`  [INFERRED] [semantically similar]
  .claude/agents/media-mgr.md → public/images/backdrops/about-street.jpg
- `Button Tiers (primary, secondary, ghost)` --conceptually_related_to--> `Button()`  [INFERRED]
  .claude/rules/skill-ui-ux-design.md → src/components/ui/button.tsx
- `loadLocalImage()` --references--> `Sunlit Wildflower Buds Banner Photo`  [AMBIGUOUS]
  src/endpoints/seed/index.ts → public/images/452236518_18443909287044029_3867824997287597586_n.jpg

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **All agents participate in the sprint retrospective** — _claude_agents_backend_eng_agent, _claude_agents_cms_eng_agent, _claude_agents_content_lead_agent, _claude_agents_events_mgr_agent, _claude_agents_frontend_eng_agent, _claude_agents_legal_compliance_agent, _claude_agents_media_mgr_agent, _claude_agents_ops_lead_agent, _claude_agents_qa_reviewer_agent, _claude_agents_seo_specialist_agent, _claude_agents_ui_designer_agent, _claude_agents_ux_designer_agent, _claude_agents_ops_lead_sprint_retrospective, _claude_agents_ops_lead_retro_file [EXTRACTED 1.00]
- **Payload CMS plugin suite configured in payload.config.ts** — claude_payload_cms, claude_payload_config, claude_plugin_form_builder, claude_plugin_seo, claude_plugin_search, claude_plugin_redirects, claude_plugin_nested_docs, claude_payload_oauth2_plugin [EXTRACTED 1.00]
- **Four parallel review agents form the /simplify workflow** — _claude_commands_simplify_command, _claude_commands_simplify_code_reuse_review, _claude_commands_simplify_code_quality_review, _claude_commands_simplify_efficiency_review, _claude_commands_simplify_visual_design_review [EXTRACTED 1.00]
- **Role-based access control helper set (src/access)** — src_access_roles_isadmin, src_access_roles_isadminoreditor, src_access_roles_isadminorself, src_access_roles_isadminfieldaccess, src_access_roles_isadminoreditorboolean, src_access_authenticatedorpublished_authenticatedorpublished, src_access_anyone_anyone, _claude_rules_security_rbac [EXTRACTED 1.00]
- **Four-layer dependency security guardrails** — _claude_rules_security_package_vetting, _claude_rules_security_pre_commit_audit_hook, _github_workflows_lint_dependency_audit_job, _github_dependabot, _claude_rules_security_dependency_security_guardrails [EXTRACTED 1.00]
- **Visual QA and design review loop for frontend changes** — _claude_rules_development_visual_qa_mandatory, _claude_rules_skill_nextjs_tailwind_six_viewport_testing, _claude_rules_skill_nextjs_tailwind_playwright_mcp, _claude_rules_skill_visual_design_review_visual_design_review_skill, _claude_rules_git_workflow_simplify_skill, _claude_rules_skill_frontend_patterns, _claude_rules_git_workflow_pre_pr_checklist [INFERRED 0.85]
- **DDD / Fractal Component Layers (ui → features → sections → layout)** — docs_memory_memory_ui_primitives, docs_memory_memory_features_events, docs_memory_memory_features_posts, docs_memory_memory_sections, docs_memory_memory_layout_nav, docs_memory_memory_layout_footer, docs_memory_memory_layout_usermenu [EXTRACTED 1.00]
- **Sprint 2 Migration Decision Set** — docs_memory_next_session_plan_decision_auth_migration, docs_memory_next_session_plan_decision_template_rebuild, docs_memory_next_session_plan_decision_same_repo, docs_memory_next_session_plan_decision_single_database, docs_memory_next_session_plan_decision_cms_driven_content, docs_memory_next_session_plan_decision_sprint_retro [EXTRACTED 1.00]
- **VPS Deploy Flow (GitHub Actions → SSH → PM2 → Caddy)** — docs_memory_memory_ci_cd_pipeline, docs_memory_vps_github_secrets, docs_memory_vps_ssh_deploy_key, docs_memory_vps_hostinger_server, docs_memory_vps_deploy_path, docs_memory_vps_pm2_process, docs_memory_vps_caddy_reverse_proxy [INFERRED 0.95]
- **Native Prairie Wildflower Banner Scene** — assets_images_451962546_18443909296044029_4679884066375857301_n, assets_images_451962546_18443909296044029_4679884066375857301_n_prairie_blazing_star, assets_images_451962546_18443909296044029_4679884066375857301_n_rattlesnake_master, assets_images_451962546_18443909296044029_4679884066375857301_n_native_prairie_planting [INFERRED 0.85]
- **East Madison Neighborhood Associations** — assets_images_east_madison_nas_sprecher_east, assets_images_east_madison_nas_north_star, assets_images_east_madison_nas_heritage_heights_community, assets_images_east_madison_nas_rolling_meadows, assets_images_east_madison_nas_eastmorland_community, assets_images_east_madison_nas_richmond_hill_homeowners, assets_images_east_madison_nas_lake_edge, assets_images_east_madison_nas_elvehjem, assets_images_east_madison_nas_east_buckeye, assets_images_east_madison_nas_glendale [EXTRACTED 1.00]
- **Far East Side Cluster Around Sprecher East** — assets_images_east_madison_nas_sprecher_east, assets_images_east_madison_nas_north_star, assets_images_east_madison_nas_richmond_hill_homeowners, assets_images_east_madison_nas_door_creek [INFERRED 0.85]
- **I-39/90/94 Corridor Study visual identity** — assets_images_i39_corridor_study_logo, assets_images_i39_corridor_study_logo_i39_90_94_corridor_study, assets_images_i39_corridor_study_logo_interstate_39_90_94, assets_images_i39_corridor_study_logo_commerce_safety_tourism, assets_images_i39_corridor_study_logo_wisdot [EXTRACTED 1.00]
- **I-39/90/94 Corridor Study branding elements** — assets_images_screenshot_2024_07_28_214758_i39_90_94_corridor_study, assets_images_screenshot_2024_07_28_214758_wisconsin_department_of_transportation, assets_images_screenshot_2024_07_28_214758_interstate_39_90_94, assets_images_screenshot_2024_07_28_214758_commerce_safety_tourism [EXTRACTED 1.00]
- **Community Recreation Scene (pickleball at a neighborhood park)** — assets_images_image_pickleball, assets_images_image_outdoor_park_courts, assets_images_image_community_gathering, assets_images_image_suburban_neighborhood_setting [EXTRACTED 1.00]
- **Residential Greenspace Scene (trail, meadow, homes, sky)** — assets_images_image__8__prairie_trail_sunset_photo, assets_images_image__8__mowed_grass_trail, assets_images_image__8__prairie_meadow, assets_images_image__8__suburban_homes, assets_images_image__8__sunset_sky [INFERRED 0.85]
- **Neighborhood Landscape Composition (homes, park, wetland) in the aerial hero photo** — assets_images_photo_aerial_neighborhood, assets_images_photo_suburban_residential_development, assets_images_photo_neighborhood_park_playground, assets_images_photo_wetland_pond_greenspace [INFERRED 0.85]
- **Facebook-Sourced Neighborhood Banner Photo** — public_images_292437847_10217816468723814_3133225540081752947_n, public_images_292437847_10217816468723814_3133225540081752947_n_banner_aspect_ratio, public_images_292437847_10217816468723814_3133225540081752947_n_facebook_cdn_filename, public_images_292437847_10217816468723814_3133225540081752947_n_neighborhood_garden_photo [INFERRED 0.75]
- **Instagram/Facebook-exported neighborhood photos in public/images** — public_images_452236518_18443909287044029_3867824997287597586_n, public_images_451962546_18443909296044029_4679884066375857301_n, public_images_441519955_18435399844044029_8893742456448624265_n [INFERRED 0.85]
- **East Madison Neighborhood Associations (map coverage set)** — public_images_east_madison_nas_sprecher_east, public_images_east_madison_nas_north_star, public_images_east_madison_nas_elvehjem, public_images_east_madison_nas_heritage_heights_community, public_images_east_madison_nas_rolling_meadows, public_images_east_madison_nas_eastmorland_community, public_images_east_madison_nas_lake_edge, public_images_east_madison_nas_glendale, public_images_east_madison_nas_east_buckeye, public_images_east_madison_nas_richmond_hill_homeowners [EXTRACTED 1.00]
- **I-39/90/94 Corridor Study Focus Areas** — public_images_i39_corridor_study_logo_i39_90_94_corridor_study, public_images_i39_corridor_study_logo_commerce, public_images_i39_corridor_study_logo_safety, public_images_i39_corridor_study_logo_tourism [EXTRACTED 1.00]
- **I-39/90/94 Corridor Study emblem composition (public/images copy)** — public_images_screenshot_2024_07_28_214758_image, public_images_screenshot_2024_07_28_214758_i39_90_94_corridor_study, public_images_screenshot_2024_07_28_214758_wisconsin_department_of_transportation, public_images_screenshot_2024_07_28_214758_interstate_39_90_94, public_images_screenshot_2024_07_28_214758_commerce_safety_tourism, public_images_screenshot_2024_07_28_214758_hexagonal_badge_design [EXTRACTED 1.00]
- **Section Backdrop Placeholder Photo Workflow** — public_images_backdrops_about_street_image, _claude_rules_skill_frontend_patterns_section_backdrop_photo_guide, _claude_rules_skill_frontend_patterns_faded_photo_backdrop, _claude_agents_media_mgr_section_backdrop_photos [INFERRED 0.85]
- **Get Involved CTA Backdrop Photo Spec** — public_images_backdrops_cta_volunteers, public_images_backdrops_cta_volunteers_volunteering, public_images_backdrops_cta_volunteers_get_involved_cta_backdrop, public_images_backdrops_cta_volunteers_placeholder_stock_photo [INFERRED 0.75]
- **Section Backdrop Placeholder Photo System** — public_images_backdrops_events_market, _claude_rules_skill_frontend_patterns_section_backdrop_photo_guide, _claude_rules_skill_frontend_patterns_faded_photo_backdrop, _claude_agents_media_mgr_placeholder_backdrops, _claude_rules_skill_frontend_patterns_unsplash [INFERRED 0.85]
- **Hero Backdrop Placeholder Lifecycle (stock placeholder -> real neighborhood photo)** — public_images_backdrops_hero_neighborhood, public_images_backdrops_hero_neighborhood_placeholder_backdrop, public_images_backdrops_hero_neighborhood_hero_backdrop_usage, public_images_backdrops_hero_neighborhood_brief_mismatch, assets_images_photo_aerial_neighborhood [INFERRED 0.75]
- **Section Backdrop Placeholder Photo Set** — public_images_backdrops_hero_neighborhood, public_images_backdrops_parks_greenspace, public_images_backdrops_community_gathering, public_images_backdrops_housing_homes, public_images_backdrops_events_market, public_images_backdrops_cta_volunteers, public_images_backdrops_resources_library [INFERRED 0.95]
- **Prairie-edge suburban sunset composition** — public_images_image_8_photo, public_images_image_8_mowed_prairie_trail, public_images_image_8_suburban_homes, public_images_image_8_golden_hour_sunset [EXTRACTED 1.00]
- **Local Recreation Scene (neighbors, park courts, suburban setting)** — public_images_image_pickleball_courts_community_photo, public_images_image_community_pickleball_gathering, public_images_image_neighborhood_park_courts, public_images_image_suburban_residential_setting [INFERRED 0.85]
- **Sprecher East greenspace-meets-housing scene** — public_images_image__8__sunset_prairie_path_photo, public_images_image__8__prairie_greenway_trail, public_images_image__8__suburban_residential_homes, public_images_image__8__golden_hour_neighborhood_backdrop [INFERRED 0.75]
- **Aerial Neighborhood Composition (homes, park, wetland)** — public_images_photo, public_images_photo_sprecher_east_neighborhood, public_images_photo_neighborhood_park, public_images_photo_wetland_pond [EXTRACTED 1.00]
- **Public Safety image visual narrative (sign + lighting + topic)** — public_images_public_safety, public_images_public_safety_playground_warning_sign, public_images_public_safety_night_street_lighting, public_images_public_safety_public_safety_topic [INFERRED 0.75]
- **Seed hero media pipeline (load file -> create Media doc -> wire into home hero)** — src_endpoints_seed_index_loadlocalimage, src_endpoints_seed_index_seed, src_endpoints_seed_image_hero_1_imagehero1, src_endpoints_seed_image_hero1_abstract_dark_hero_backdrop, src_endpoints_seed_home_home [INFERRED 0.85]
- **Payload template remote seed image fallback set** — src_endpoints_seed_image_post1, src_endpoints_seed_image_post2, src_endpoints_seed_image_post3, src_endpoints_seed_index_seed [INFERRED 0.85]
- **Payload Website Template placeholder seed images (post1, post2, post3, hero1)** — src_endpoints_seed_image_post1, src_endpoints_seed_image_post2, src_endpoints_seed_image_post3 [INFERRED 0.85]
- **Post 2 seeding flow: load/fallback image, create Media doc, attach as hero of WisDOT corridor post** — src_endpoints_seed_index_seed, src_endpoints_seed_index_loadlocalimage, src_endpoints_seed_index_fetchfilebyurl, src_endpoints_seed_image_post2, src_endpoints_seed_image_2_image2, src_endpoints_seed_post_2_post2 [INFERRED 0.85]
- **Seed About-page map media pipeline (local map PNG or remote image-post3 fallback -> image3 Media doc -> About page mapImage)** — src_endpoints_seed_index_loadlocalimage, src_endpoints_seed_index_fetchfilebyurl, src_endpoints_seed_index_seed, src_endpoints_seed_image_3_image3, src_endpoints_seed_image_post3, src_endpoints_seed_about_page_aboutpage [INFERRED 0.85]

## Communities (148 total, 48 thin omitted)

### Community 0 - "shadcn UI & Form Fields"
Cohesion: 0.05
Nodes (64): Form Components must use shadcn/ui primitives, ChangePasswordForm(), AccountPage(), metadata, LoginForm(), LoginPage(), metadata, Checkbox() (+56 more)

### Community 1 - "Seed Data Pipeline"
Cohesion: 0.07
Nodes (60): eventCategoryMap, seed(), textToLexical(), maxDuration, POST(), AboutArgs, aboutPage(), associationPage() (+52 more)

### Community 2 - "Theme Providers & Archive Pages"
Cohesion: 0.06
Nodes (35): PageClient(), Props, PageClient(), dynamic, Args, PageClient(), revalidate, revalidate (+27 more)

### Community 3 - "Header, Footer & Admin Shell"
Cohesion: 0.06
Nodes (28): Cover Pages Map Marker Pin (dark, 2x) — 48x64 RGBA PNG icon of a dark charcoal teardrop-shaped map/location pin with a white circular center dot; retina (2x) raster asset intended as a location marker on cover/hero pages. Unreferenced by any current src/ code — legacy asset carried over from the earlier RawBackUp / Next.js+Sanity rebuild (commits ec0acc1, 1e71c58); current UI uses the lucide-react MapPin icon for the same purpose., importMap, Args, Args, Args, BeforeDashboard(), SeedButton(), BeforeLogin() (+20 more)

### Community 4 - "Generated Payload Types"
Cohesion: 0.04
Nodes (48): ArchiveBlockSelect, Auth, CallToActionBlockSelect, CategoriesSelect, Category, CodeBlock, CollectionsWidget, ContentBlockSelect (+40 more)

### Community 5 - "Agent Roles: Backend & Ops"
Cohesion: 0.12
Nodes (41): Backend Engineer Agent (backend-eng), API Route Standards, @payloadcms/email-nodemailer Adapter, Email/SMTP Integration (to build), Framework First Principle, Google OAuth2Plugin Configuration, Backend Security Rules, User Roles (admin / editor / resident) (+33 more)

### Community 6 - "Agent Roles: Frontend & Design"
Cohesion: 0.09
Nodes (39): SOLID Principles (project interpretation), 8th-Grade Reading Level Standard, Frontend Engineer Agent (frontend-eng), Frontend Before-Committing Checklist, Content Cards Must Link to Detail Pages, Payload Data Fetching Patterns, Layout Consistency (shared Container), Server Components by Default (+31 more)

### Community 7 - "Agent Roles: CMS & Content"
Cohesion: 0.14
Nodes (38): Persist Before Side Effects, CMS Engineer Agent (cms-eng), Content Modeling Principles, Draft Preview, Hero System (4 types), Layout Builder (blocks field), Live Preview, On-demand Revalidation (afterChange hooks) (+30 more)

### Community 8 - "TypeScript Config"
Cohesion: 0.06
Nodes (35): DOM, DOM.Iterable, ES2022, next.config.js, next-env.d.ts, next-sitemap.config.cjs, .next/types/**/*.ts, node_modules (+27 more)

### Community 9 - "Cards, Heroes & Date Formatting"
Cohesion: 0.13
Nodes (21): RelatedPostsProps, Card(), EventCard(), EventCardData, SidebarEventData, SidebarEvents(), EventHero(), PostHero() (+13 more)

### Community 10 - "Agent Roles: Events & SEO"
Cohesion: 0.11
Nodes (30): FAQ Collection (planned), Payload REST API (/api/{collection}), Event Announcements Content Type, Events Manager Agent (events-mgr), Calendar Integration, Event Archive, Event Curation Rules, Event Data Model (fields) (+22 more)

### Community 11 - "Detail Pages & Structured Data"
Cohesion: 0.14
Nodes (18): Args, EventPage(), generateMetadata(), queryEventBySlug, queryUpcomingEvents, Args, generateMetadata(), Post() (+10 more)

### Community 12 - "Frontend Pattern Library"
Cohesion: 0.11
Nodes (25): lucide-react icons (never inline SVG), Frontend Design Patterns - Implementation Library, Anchored Hero (text bottom-left), Angled Section Divider, Section Backdrop Photo Guide (public/images/backdrops/), CTA with Background Image, Fade-In on Scroll (useScrollReveal hook), Fade Overlap section transition (+17 more)

### Community 13 - "Root Layout & URL Utilities"
Cohesion: 0.14
Nodes (16): DRY - Search for Shared Abstractions First, Caching Rules (React cache(), revalidatePath/Tag), metadata, poppins, RootLayout(), GET(), getEventsSitemap, robots() (+8 more)

### Community 14 - "VPS & Deploy Memory"
Cohesion: 0.14
Nodes (23): Asana [R#-Role] Task Tag Convention, Caddy Reverse Proxy, CI/CD Pipeline (push main → GitHub Actions → SSH deploy → npm ci && build && pm2 reload), Hostinger VPS Hosting (Ubuntu 24.04), Payload CMS LLM Reference (payloadcms.com/llms-full.txt), PM2 Process Manager, Project Memory (docs/memory/MEMORY.md), Strategy Repo (boulaajaj/sprecher-east-strategy, private) (+15 more)

### Community 15 - "Payload Config & Sitemaps"
Cohesion: 0.11
Nodes (13): GET(), getPagesSitemap, GET(), getPostsSitemap, GET, OPTIONS, POST, Users (+5 more)

### Community 16 - "Sprint Backlogs"
Cohesion: 0.16
Nodes (22): admin role (full access), Sprint 2 Task Board (30 tasks, 12 agents) - superseded, Sprint 2.1 Content Infrastructure (tasks 6-10), Sprint 2.1 UX/UI and Layout Fixes (tasks 1-5), Sprint 2.2 Backend and Community (tasks 16-20), Sprint 2.2 Events and Discovery (tasks 11-15), Sprint 2.3 Content, Media and SEO (tasks 21-25), Sprint 3 Backlog - Feature Requirements (+14 more)

### Community 17 - "RBAC Access Control"
Cohesion: 0.20
Nodes (17): Auth and Session Rules, Content Collections Access (Pages, Posts, Events, FAQ, Resources), Plugin Collections Access (Redirects, Forms, Form Submissions), Role-Based Access Control (RBAC), editor role (content CRUD, admin panel), resident role (read published, own profile), Utility Collections Access (Categories, Media, TeamMembers), Collection Conventions (access, drafts, defaultPopulate, afterChange) (+9 more)

### Community 18 - "Brand Voice Guidelines"
Cohesion: 0.16
Nodes (21): Content Quality Rules, Blog Post Structure: Hook > Context > Sprecher East Angle > Action, Content Tone and Voice, Sprecher East Brand Voice Guidelines, Always Disclose AI Assistance, Assertive Heart (firm, respectful advocacy), Prefer 'Sprecher East', never SENA or SE, Non-Negotiable Brand Rules (+13 more)

### Community 19 - "Sprint 2 Retrospective"
Cohesion: 0.12
Nodes (21): Asana REST API via $ASANA_PAT + curl, Gotcha: Payload admin importMap.js auto-generated, MCP Tools Unavailable in Spawned Subagents, SEO Plugin (@payloadcms/plugin-seo), Sprint Retrospective Practice (biweekly, all 12 agents), Decision: Sprint Retro Added to All 12 Agents (biweekly), All 12 Agent Profiles Updated with Payload CMS Knowledge, Biweekly Retro Summary (actions and process changes pending) (+13 more)

### Community 20 - "Legal & Compliance Agent"
Cohesion: 0.18
Nodes (20): Comments and Replies System (to build), Content Moderation Rules, Brand Voice and Tone, Comment Moderation Guidelines, Community Stories Content Type, Content Quality Standards, Never-Say Terminology Rules, Legal & Compliance Agent (legal-compliance) (+12 more)

### Community 21 - "Legacy Sanity Handoff"
Cohesion: 0.17
Nodes (20): BoardMembers Collection, Layered Component Import Rules (ui -> features -> sections -> layout), CodeRabbit Review Configuration, Next.js 15 (App Router, TypeScript), src/components/ (Shared UI), Client/Server Component Split, Contact Form + /api/contact route, src/lib/data.ts Data Layer (JSON fallback or Sanity) (+12 more)

### Community 22 - "Content Marketing Workflow"
Cohesion: 0.16
Nodes (20): Branch Naming agent/<role-tag>/<description>, A-Content (Content and Voice) profile, B-Research (Research and Quality) profile, C-Builder (Code, design, infra, analytics) profile, D-Community (Community and Events) profile, E-Ops (Operations) profile, F-RD (R&D, on-demand) profile, Content Marketing and Community Research (+12 more)

### Community 23 - "Link Fields & Block Configs"
Cohesion: 0.17
Nodes (13): CallToAction, columnFields, Content, appearanceOptions, link(), LinkAppearances, LinkType, linkGroup() (+5 more)

### Community 24 - "Media & Accessibility Agent"
Cohesion: 0.17
Nodes (19): WCAG 2.1 AA Accessibility Standard, Frontend Performance Rules, ADA / WCAG 2.1 AA Compliance, Media Manager Agent (media-mgr), Alt Text Standards, DJI Drone Photo Pipeline (RAW -> Web), Focal Point Support, Gallery/Album Features (future) (+11 more)

### Community 25 - "Asana-GitHub Workflow"
Cohesion: 0.19
Nodes (19): Asana-GitHub Workflow, Ad-Hoc Work Tracking, Asana (project management), Asana MCP Connector (limited), ASANA_PAT env var, Asana REST API via curl + PAT, Asana Free Plan - Manual Linking, One Task = One PR (+11 more)

### Community 26 - "Payload CMS Patterns"
Cohesion: 0.15
Nodes (19): No PII in Source Code, Seed Data Rules, CMS Page Route Pattern ([slug]/page.tsx), Payload CMS v3 Patterns, Two-Step Block Registration, Layout Builder Blocks (archive, content, cta, formBlock, mediaBlock, banner, code, relatedPosts), Draft/Publish Workflow (versions.drafts, _status), CMS Hero Types (highImpact, mediumImpact, lowImpact, none) (+11 more)

### Community 27 - "UI/UX Design Standards"
Cohesion: 0.12
Nodes (19): ARIA Live Feedback Messages (role=alert / role=status), Frontend Anti-Patterns to Flag, Section Background Alternation, Pattern Library Is a Floor, Not a Ceiling, Responsive Layout Recipes (2-col, 3-col grid, 4-col stats), Stat Card (icon + number + label), Visual Debugging Checklist, Poppins via next/font/google (+11 more)

### Community 28 - "FAQ, Resources & OpenGraph"
Cohesion: 0.15
Nodes (14): generateMetadata(), categoryLabels, dynamic, FAQPage(), generateMetadata(), revalidate, categoryLabels, dynamic (+6 more)

### Community 29 - "Rich Text & Content Blocks"
Cohesion: 0.14
Nodes (14): BannerBlock(), Props, Code(), Props, CodeBlock(), CodeBlockProps, Props, CopyButton() (+6 more)

### Community 30 - "Next.js/Tailwind & Visual QA"
Cohesion: 0.21
Nodes (18): Visual QA Is Mandatory for UI Changes, /simplify Skill (4 parallel review agents), Next.js 15 and Tailwind CSS v4 Patterns, Dark Mode via [data-theme='dark'], Design Tokens (globals.css @theme), Playwright MCP (screenshots), SEO plugin generateTitle (src/plugins/index.ts), 6-Viewport Responsive Testing (320-1920px) (+10 more)

### Community 31 - "Custom Collections & Revalidation"
Cohesion: 0.18
Nodes (10): revalidateDelete(), revalidateEvent(), Events, revalidateDelete(), revalidateFAQ(), FAQ, revalidateDelete(), revalidateResource() (+2 more)

### Community 32 - "I-39/90/94 Corridor Logo"
Cohesion: 0.20
Nodes (16): I-39/90/94 Corridor Study Logo (image), Commerce, Safety, Tourism (study goals), I-39/90/94 Corridor Study, Interstate 39/90/94 Corridor, Wisconsin Department of Transportation (WisDOT), Commerce, Safety, Tourism (Study Goals), I-39/90/94 Corridor Study, WisDOT I-39/90/94 Corridor Study Logo Screenshot (+8 more)

### Community 33 - "Hero Renderers & CMS Link"
Cohesion: 0.25
Nodes (10): CMSLink(), CMSLinkType, Media(), RichText(), HighImpactHero(), LowImpactHero(), LowImpactHeroType, MediumImpactHero() (+2 more)

### Community 34 - "Section Backdrop Photos"
Cohesion: 0.25
Nodes (15): Placeholder Backdrop Photos (Media Manager agent), Section Backdrop Placeholder Photos, Faded Photo Backdrop (opacity 0.06), Section Backdrop Photo Guide, Unsplash (stock photo source), Native Wildflower in Sunlit Foliage (photo subject), About Section Backdrop Photo (Red Cabin on Grassy Hill), Community Gathering Backdrop Photo (+7 more)

### Community 35 - "Dev Dependencies"
Cohesion: 0.13
Nodes (15): eslint, eslint-plugin-unused-imports, husky, devDependencies, eslint, eslint-plugin-unused-imports, husky, tailwindcss (+7 more)

### Community 36 - "Posts Collection & Previews"
Cohesion: 0.19
Nodes (9): Banner, Code, populateAuthors(), revalidateDelete(), revalidatePost(), Posts, collectionPrefixMap, generatePreviewPath() (+1 more)

### Community 37 - "Media Components"
Cohesion: 0.26
Nodes (8): ImageMedia(), NOTE: this is used by the browser to determine which image to download at…, Props, VideoMedia(), SidebarPostData, SidebarPosts(), cssVariables, getMediaUrl()

### Community 38 - "VPS Deploy & Secrets"
Cohesion: 0.23
Nodes (14): Configuration Over Code, Deploy on Merge to main, Caddyfile Editing Rules, Infrastructure Security (SSH keys, Caddy TLS, PM2), PAYLOAD_SECRET (JWT signing, 32+ chars), Secrets Management (.env.local, system env vars), Payload Migrations (migrate:create, excluded from CodeRabbit), npx payload migrate before build (+6 more)

### Community 39 - "shadcn components.json"
Cohesion: 0.14
Nodes (13): aliases, components, utils, rsc, $schema, style, tailwind, baseColor (+5 more)

### Community 40 - "Next Session Plan"
Cohesion: 0.18
Nodes (14): Design Tokens (globals.css @theme block), Asana Project "Sprint 2 — Payload CMS Migration", Custom Collections: Events, BoardMembers, FAQ, Google OAuth via payload-oauth2, Header/Footer Globals with Nav Links, Next Session Plan (March 1, 2026), Branch agent/C-Builder/payload-migration, payload-oauth2 GitHub Repo (wilsonle/payload-oauth2) (+6 more)

### Community 41 - "East Madison Neighborhood Map"
Cohesion: 0.26
Nodes (14): East Madison Neighborhood Associations Map, Door Creek (waterway / eastern boundary), East Buckeye (neighborhood association), Eastmorland Community (neighborhood association), Elvehjem (neighborhood association), Glendale (neighborhood association), Heritage Heights Community (neighborhood association), Lake Edge (neighborhood association) (+6 more)

### Community 42 - "Users & Role Helpers"
Cohesion: 0.32
Nodes (10): Users Collection Access Matrix, getRole(), hasAdmin(), hasAdminOrEditor(), isAdminFieldAccess(), isAdminOrEditorBoolean(), isAdminOrSelf(), ROLES (+2 more)

### Community 43 - "PR Labels & CI Jobs"
Cohesion: 0.17
Nodes (13): GitHub Actions weekly grouped updates, PR Auto-Label Rules, PR label: auth, PR label: ci, PR label: config, PR label: documentation, PR label: frontend, PR label: styling (+5 more)

### Community 44 - "Neighborhood Map (assets copy)"
Cohesion: 0.33
Nodes (13): City of Madison Neighborhood Association Map, Door Creek, East Buckeye Neighborhood, Eastmorland Community, Elvehjem Neighborhood, Glendale Neighborhood, Heritage Heights Community, Lake Edge Neighborhood (+5 more)

### Community 45 - "Better Auth to Payload Migration"
Cohesion: 0.33
Nodes (13): Better Auth (removed in Sprint 2), Required Env Vars (PAYLOAD_SECRET, DATABASE_URI, NEXT_PUBLIC_SERVER_URL, OAuth client IDs), overrideAccess: true in Server-side Payload Reads, Payload Native Auth (Users collection auth: true), payload-oauth2 Plugin (Wilson Le), Single SQLite Database (data/payload.db), Sprint 2 — Payload CMS Migration (started March 1, 2026), Decision: Migrate Better Auth → Payload native auth + payload-oauth2 (+5 more)

### Community 46 - "npm Scripts"
Cohesion: 0.15
Nodes (13): scripts, build, dev, format, format:check, generate:importmap, generate:types, lint (+5 more)

### Community 47 - "CMS Page Route & Metadata"
Cohesion: 0.26
Nodes (9): Args, generateMetadata(), Page(), queryPageBySlug, homeStatic, DocWithMeta, generateMeta(), getImageURL() (+1 more)

### Community 48 - "Block Renderers"
Cohesion: 0.19
Nodes (9): ArchiveBlock(), CallToActionBlock(), ContentBlock(), MediaBlock(), Props, blockComponents, ArchiveBlock, ContentBlock (+1 more)

### Community 49 - "Pages Collection & Block Configs"
Cohesion: 0.23
Nodes (7): Archive, FormBlock, MediaBlock, revalidateDelete(), revalidatePage(), Pages, hero

### Community 50 - "Development Principles"
Cohesion: 0.18
Nodes (12): Development Principles, Documentation Is Code, Fail Explicitly, Framework First, Keep Dependencies Lean, Persist Before Side Effects, SOLID Principles (Payload flavored), Validate at Boundaries (+4 more)

### Community 51 - "Redirects & Cached Documents"
Cohesion: 0.26
Nodes (9): PayloadRedirects(), Props, Config, GeneratedTypes, Collection, getCachedDocument(), getDocument(), getCachedRedirects() (+1 more)

### Community 53 - "Security Guidelines"
Cohesion: 0.31
Nodes (10): Git Security Rules, Security Guidelines, CodeQL Code Scanning, Four-Layer Dependency Security Guardrails, Package Vetting Before Install, Secret Scanning + Push Protection, Scoped overrides for transitive vulnerabilities, Dependabot Configuration (+2 more)

### Community 54 - "Hero & Aerial Photos"
Cohesion: 0.31
Nodes (10): Aerial Drone Photo of Suburban Neighborhood at Dusk, Hero Backdrop Photo Usage, Neighborhood Park with Playground and Ballfield, Suburban Residential Development, Wetland Pond and Natural Greenspace, Hero Backdrop Photo: Miniature House with Keys (hero-neighborhood.jpg), Hero Photo Brief vs. Actual Content Mismatch, Hero Section Backdrop Usage (+2 more)

### Community 55 - "City Meeting Tracker Proposal"
Cohesion: 0.40
Nodes (10): Custom Skill Proposal: City Meeting Tracker, Alder District 16 blog (cityofmadison.com/council/district16/blog), city-meeting-tracker skill (recommended), content-reviewer skill (deferred), Skill Decision Matrix, data/events.json schema (pre-CMS), scripts/fetch-meetings.ts (planned), City of Madison Legistar API (webapi.legistar.com) (+2 more)

### Community 56 - "Legacy File Structure Memory"
Cohesion: 0.31
Nodes (10): data/*.json (events, posts, board, site) — source of truth until seeded, Gotcha: defaultSort belongs on collection root, Gotcha: npx payload run fails on Node v24, Legacy Payload Collections (Events, Posts, BoardMembers, Users, Media), lib/data.ts (Payload Local API with JSON fallback), Legacy File Structure (pre-Website-Template scaffold), middleware.ts (protects /profile via session cookie), scripts/seed.ts (imports data/*.json into Payload DB) (+2 more)

### Community 57 - "Website Template Decision"
Cohesion: 0.20
Nodes (10): Gotcha: REST_GET(config) is curried, Layout Builder (8 block types), Lexical Rich Text Editor, Nested Docs Plugin, Payload CMS v3 Website Template, Redirects Plugin, Search Plugin, Decision: All Content CMS-driven via Layout Builder Blocks (8 block types + 4 hero types) (+2 more)

### Community 58 - "Wildflower Banner Photos"
Cohesion: 0.28
Nodes (9): Joe-Pye Weed Wildflower Banner Photo, Joe-Pye Weed (Eutrochium) Native Wildflower, Native Pollinator Planting / Green Space, Neighborhood Nature Photography Asset, Social Media Cover/Banner Crop, Instagram Photo 441519955, Sibling Instagram Photo 451962546 (same media batch), Sunlit Wildflower Buds Banner Photo (+1 more)

### Community 59 - "Runtime Dependencies"
Cohesion: 0.22
Nodes (9): clsx, dependencies, clsx, @radix-ui/react-label, @radix-ui/react-slot, react, @radix-ui/react-label, @radix-ui/react-slot (+1 more)

### Community 60 - "Legacy Better Auth Memory"
Cohesion: 0.25
Nodes (9): layout/Nav.tsx (client component), layout/UserMenu.tsx (auth widget: Sign In or avatar + dropdown), Site Navigation (Home → About → Events → News → Resources → Get Involved → Contact + Sign In), src/lib/auth-client.ts (useSession, signIn, signOut), src/lib/auth.ts (Better Auth server config), Better Auth v1.4.19 Integration (legacy), Dev Server Notes (port 3000/3001 bump, NEXT_PUBLIC_APP_URL must match, taskkill node.exe), /login Page (social buttons + email/password + register toggle) (+1 more)

### Community 61 - "Project Progress Log"
Cohesion: 0.25
Nodes (9): Lucide React Icons, Next.js 15 (App Router, TypeScript), Phase 1 — Static HTML Site, Phase 2 — Payload CMS Website Template Migration, shadcn/ui (Radix UI + Tailwind), Tailwind CSS v4, Main Branch Commit History (Sanity → DDD → CI/CD → Payload + Better Auth), Phase 1 — Static Site (done, replaced) (+1 more)

### Community 62 - "Search & SEO Plugins"
Cohesion: 0.31
Nodes (4): revalidateRedirects(), plugins, beforeSyncWithSearch(), searchFields

### Community 63 - "Component Reuse Rules"
Cohesion: 0.32
Nodes (8): Use the Type System, Reusable Components and Content Quality, Check Existing Components First, Code Hygiene (no dead params, import type), Form UX Rules (clear stale feedback, re-sync on navigation), Reference Links over Custom URLs, @/payload-types generated types, shadcn/ui (Radix + Tailwind primitives)

### Community 64 - "Events Page & Timezone"
Cohesion: 0.36
Nodes (6): SITE_TIMEZONE and Day-Only Date Handling, dynamic, EventsPage(), revalidate, SITE_TIMEZONE, startOfToday()

### Community 65 - "package.json Metadata"
Cohesion: 0.25
Nodes (7): name, overrides, payload, ajv, private, type, version

### Community 66 - "Git Workflow Rules"
Cohesion: 0.38
Nodes (7): Fix Everything You Touch, Git Workflow and Development Lifecycle, Branch Protection on main, Commit Conventions (imperative, Co-Authored-By), Owner Merges, Not the Agent, Post-PR Review Polling (two-phase), Review Comment Resolution

### Community 67 - "Lint & Audit CI"
Cohesion: 0.43
Nodes (7): Pre-PR Checklist (/simplify, tsc, lint), Pre-commit npm audit hook, Lint Workflow, Dependency Audit job (npm audit high, omit dev), ESLint job (code changes only), dorny/paths-filter change detection, Prettier job (always runs)

### Community 68 - "Prairie Sunset Photo (assets)"
Cohesion: 0.43
Nodes (7): Late Autumn Season, Mowed Grass Walking Trail, Neighborhood Greenspace Backdrop Candidate, Restored Prairie Meadow, Prairie Trail at Sunset Neighborhood Photo, Suburban Homes Bordering Greenspace, Dramatic Sunset Sky

### Community 69 - "Corridor Study Logo (public)"
Cohesion: 0.43
Nodes (7): I-39/90/94 Corridor Study Logo, Commerce (Corridor Study Focus Area), I-39/90/94 Corridor Study, Interstate 39/90/94 Corridor, Safety (Corridor Study Focus Area), Tourism (Corridor Study Focus Area), Wisconsin Department of Transportation (WisDOT)

### Community 70 - "Payload REST Route"
Cohesion: 0.29
Nodes (6): DELETE, GET, OPTIONS, PATCH, POST, PUT

### Community 71 - "Prairie Wildflowers Banner"
Cohesion: 0.53
Nodes (6): Prairie Wildflowers Banner Photo (Blazing Star and Rattlesnake Master), Ultra-Wide Banner / Hero Backdrop Crop, Native Prairie Planting (Madison Far East Side), Prairie Blazing Star (Liatris), Rattlesnake Master (Eryngium yuccifolium), Social-Media-Sourced Neighborhood Photo

### Community 72 - "Pickleball Courts Photo (assets)"
Cohesion: 0.60
Nodes (6): Neighborhood Pickleball Courts Photo (image.jpeg), Community Gathering (neighbors socializing outdoors), Outdoor Park Courts (fenced hard courts with nets), Pickleball (neighborhood recreation activity), Site Backdrop / Hero Photo Candidate, Suburban Neighborhood Setting (homes, trees, summer evening)

### Community 73 - "DDD Component Layers (legacy)"
Cohesion: 0.67
Nodes (6): DDD / Fractal Component Architecture, features/events Domain Components (event-card, event-detail-card, event-date-badge, event-list), features/posts Domain Components (post-card, post-feed-item, post-grid, post-feed), layout/Footer.tsx (server component), sections/ Full-width Page Sections (hero, feature-strip, about-preview, events-news, cta-banner), ui/ Atomic Primitives (badge, page-header, empty-state, section-header, container)

### Community 74 - "Asana to GitHub Migration"
Cohesion: 0.40
Nodes (6): Asana to GitHub Migration, GitHub Projects Scrum Board, Issue #94 — Migration tracking issue, Issue #95 — Graphify knowledge graph setup, Issue #96 — CodeCohesion 3D visualization, Issue #97 — Document known holes (API overlay, grid pagination)

### Community 75 - "Image & Performance Rules"
Cohesion: 0.40
Nodes (5): Prefer Props Over Re-Fetching, next/image for all images, Server vs Client Components, Image Treatment Rules, Performance / Core Web Vitals Targets

### Community 76 - "Contact Form Migration Tasks"
Cohesion: 0.50
Nodes (5): api/contact/route.ts Contact Form Handler (logs only), Form Builder Plugin, Carried-over Sprint 1 Tasks ON HOLD (blog post, social launch, strategy review), Contact Form Rebuild with Payload Form Builder Plugin, Post-Migration Tasks (OAuth URLs, contact form, content migration, VPS deploy, favicon, social launch)

### Community 77 - "Sweet Alyssum Banner Photo"
Cohesion: 0.50
Nodes (5): Sweet Alyssum Flower Banner Photo, Wide Banner Crop (~4:1 Aspect Ratio), Facebook-Sourced Photo (CDN Filename Pattern), Neighborhood Garden Photography, Sweet Alyssum (Lobularia maritima)

### Community 78 - "Blazing Star Banner (public)"
Cohesion: 0.50
Nodes (5): Liatris (Blazing Star) prairie wildflower, Instagram/Facebook CDN export filename pattern, Native prairie planting / pollinator habitat, Prairie Wildflower Banner Photo (Blazing Star against blue sky), Wide banner crop format for backdrop use

### Community 79 - "CTA Volunteers Backdrop"
Cohesion: 0.60
Nodes (5): CTA Volunteers Backdrop Photo, Asian Para Games 2018 (Jakarta), Get Involved / CTA Section Backdrop, Placeholder Stock Backdrop (Unsplash), Volunteering / Community Participation

### Community 80 - "Prairie Trail Sunset (public)"
Cohesion: 0.60
Nodes (5): Golden-hour sunset sky, Mowed grass trail through restored prairie, Neighborhood greenspace photo as site backdrop, Prairie Trail at Sunset (image-8.jpeg), Suburban homes bordering greenspace

### Community 81 - "Aerial Neighborhood Photo"
Cohesion: 0.60
Nodes (5): Aerial Neighborhood Photo (photo.jpeg), Homepage Hero Backdrop Image, Neighborhood Park with Playground and Fields, Sprecher East Subdivision (aerial view), Wetland Pond and Greenspace

### Community 82 - "Payload Route Conventions"
Cohesion: 0.50
Nodes (4): Custom Collection Routes (force-static, revalidate 600), payload.config.ts collections/globals registration, Payload CMS v3 (Website Template), Payload CMS Migration (Sprint 2)

### Community 83 - "ESLint Config"
Cohesion: 0.50
Nodes (3): compat, __dirname, __filename

### Community 85 - "Sunset Prairie Path Photo"
Cohesion: 0.67
Nodes (4): Golden-Hour Neighborhood Backdrop Photo, Neighborhood Prairie Greenway Trail, Suburban Residential Homes at Prairie Edge, Sunset Prairie Path Neighborhood Photo (image_(8).jpeg)

### Community 86 - "Pickleball Courts Photo (public)"
Cohesion: 0.83
Nodes (4): Community Pickleball Gathering, Neighborhood Park Sport Courts, Neighborhood Pickleball Courts Community Photo, Suburban Residential Setting

### Community 87 - "Public Safety Night Photo"
Cohesion: 0.83
Nodes (4): public-safety.jpeg — Nighttime suburban street with playground warning sign, Lit Sidewalk and Street at Night, Playground Warning Sign (seesaw pictogram), Public Safety (site topic / content category)

### Community 88 - "Theme Types"
Cohesion: 0.50
Nodes (3): defaultTheme, Theme, themeLocalStorageKey

### Community 89 - "Squarespace Icon Font"
Cohesion: 1.00
Nodes (3): Squarespace UI Icon Font (SVG), IcoMoon Icon Font Generator, Legacy Squarespace UI Webfont Family

### Community 90 - "Daisy Field Banner (assets)"
Cohesion: 0.67
Nodes (3): Daisy Field Banner Photo (wide-crop close-up of white ox-eye daisies in green grass), Social-Media-Sourced Neighborhood Photo, Wide Banner / Hero Backdrop Image Crop

### Community 91 - "Tree Canopy Photo (assets)"
Cohesion: 1.00
Nodes (3): Tree Trunk and Canopy Photo (image-asset.jpeg), Nature / Greenspace Imagery, Section Backdrop / Placeholder Photo

### Community 92 - "Daisy Field Banner (public)"
Cohesion: 0.67
Nodes (3): Daisy Field Banner Photo (white oxeye daisies in sunlit green grass, wide ~3:1 panoramic crop), Site Backdrop / Hero Banner Image, Social-Media-Sourced Neighborhood Photo

## Ambiguous Edges - Review These
- `loadLocalImage()` → `Sunlit Wildflower Buds Banner Photo`  [AMBIGUOUS]
  public/images/452236518_18443909287044029_3867824997287597586_n.jpg · relation: references
- `src/components/ (Shared UI)` → `Layered Component Import Rules (ui -> features -> sections -> layout)`  [AMBIGUOUS]
  .coderabbit.yaml · relation: conceptually_related_to
- `Frontend Before-Committing Checklist` → `Six-Viewport Testing (320/430/768/1024/1280/1920)`  [AMBIGUOUS]
  .claude/agents/frontend-eng.md · relation: conceptually_related_to
- `Native Prairie Planting (Madison Far East Side)` → `Social-Media-Sourced Neighborhood Photo`  [AMBIGUOUS]
  assets/images/451962546_18443909296044029_4679884066375857301_n.jpg · relation: conceptually_related_to
- `Tree Trunk and Canopy Photo (image-asset.jpeg)` → `Section Backdrop / Placeholder Photo`  [AMBIGUOUS]
  assets/images/image-asset.jpeg · relation: rationale_for
- `Outdoor Park Courts (fenced hard courts with nets)` → `Suburban Neighborhood Setting (homes, trees, summer evening)`  [AMBIGUOUS]
  assets/images/image.jpeg · relation: conceptually_related_to
- `Dramatic Sunset Sky` → `Late Autumn Season`  [AMBIGUOUS]
  assets/images/image_(8).jpeg · relation: conceptually_related_to
- `Daisy Field Banner Photo (white oxeye daisies in sunlit green grass, wide ~3:1 panoramic crop)` → `Social-Media-Sourced Neighborhood Photo`  [AMBIGUOUS]
  public/images/441519955_18435399844044029_8893742456448624265_n.jpg · relation: conceptually_related_to
- `East Madison Neighborhood Associations Map` → `Pelitto Creek (waterway, label reading uncertain)`  [AMBIGUOUS]
  public/images/East_Madison_NAs.png · relation: references
- `Events Market Backdrop Photo (events-market.jpg)` → `Events Page (src/app/(frontend)/events/page.tsx)`  [AMBIGUOUS]
  public/images/backdrops/events-market.jpg · relation: references

## Knowledge Gaps
- **324 isolated node(s):** `$schema`, `style`, `rsc`, `tsx`, `config` (+319 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 394 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **48 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `loadLocalImage()` and `Sunlit Wildflower Buds Banner Photo`?**
  _Edge tagged AMBIGUOUS (relation: references) - confidence is low._
- **What is the exact relationship between `src/components/ (Shared UI)` and `Layered Component Import Rules (ui -> features -> sections -> layout)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `Frontend Before-Committing Checklist` and `Six-Viewport Testing (320/430/768/1024/1280/1920)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `Native Prairie Planting (Madison Far East Side)` and `Social-Media-Sourced Neighborhood Photo`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `Tree Trunk and Canopy Photo (image-asset.jpeg)` and `Section Backdrop / Placeholder Photo`?**
  _Edge tagged AMBIGUOUS (relation: rationale_for) - confidence is low._
- **What is the exact relationship between `Outdoor Park Courts (fenced hard courts with nets)` and `Suburban Neighborhood Setting (homes, trees, summer evening)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `Dramatic Sunset Sky` and `Late Autumn Season`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._