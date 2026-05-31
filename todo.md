# Project TODO

## Database Implementation
- [x] Create news articles database schema
- [x] Create seed script to populate database with 24 articles
- [x] Run database migration
- [x] Create tRPC procedures to fetch news articles
- [x] Update frontend to fetch from database instead of static data
- [x] Test database integration

## User Feedback System
- [x] Create database schema for category feedback
- [x] Add database query helpers for feedback
- [x] Create tRPC procedures for feedback submission
- [x] Build feedback UI component with text box and relevance toggle
- [x] Integrate feedback component into category sections
- [x] Write unit tests for feedback functionality

## SEO Improvements
- [x] Add meta description (50-160 characters)
- [x] Add meta keywords
- [x] Convert page title to H1 heading
- [x] Convert category titles to H2 headings (already implemented)
- [x] Add Open Graph meta tags
- [x] Verify SEO improvements

## Automated News Updates
- [x] Create news fetching and update script
- [x] Set up scheduled task for bi-weekly updates (every Monday 5 AM)
- [x] Test automated news update
- [x] Document scheduling configuration

## Bug Fix - Articles Not Displaying
- [x] Check database for all 24 articles
- [x] Verify Logistics and Transportation category articles
- [x] Investigate frontend display issue - Found category name mismatch
- [x] Fix article rendering problem - Updated database category names
- [x] Verify all categories display correctly - All 24 articles confirmed

## Full Automation Implementation (Option B)
- [x] Create directory structure (docs/update-history, docs/bug-fixes, docs/guides)
- [x] Build automated news fetching script
- [x] Implement database update automation
- [x] Create documentation generator for update summaries
- [x] Build archiving system for old documentation
- [x] Implement CHANGELOG.md maintenance
- [x] Add Git commit and push automation
- [x] Integrate with scheduled task
- [x] Test complete automation pipeline
- [x] Document automation system

## Aluminum Pricing Index Tracker
- [x] Create database schema for aluminum pricing data
- [x] Add database query helpers for pricing data
- [x] Create tRPC procedures for pricing endpoints
- [x] Seed historical aluminum pricing data
- [x] Create aluminum pricing page component
- [x] Add trend chart visualization (line chart)
- [x] Add tabular data display with sorting/filtering
- [x] Add navigation link to pricing page
- [x] Write unit tests for pricing functionality
- [x] Update documentation

## SEO Keyword Optimization
- [x] Reduce meta keywords from 11 to 7 focused keywords
- [x] Verify SEO improvements

## Navigation Enhancements
- [x] Add category dropdown menu button for quick navigation
- [x] Add ChatGPT link button
- [x] Position buttons alongside Aluminum Pricing Index button
- [x] Test navigation functionality

## Supply Chain Dashboard
- [x] Create database schema for economic indices (TPU, BLS, HRC, LME, CME, Diesel, Cass, WCI)
- [x] Add database query helpers for indices
- [x] Create tRPC procedures for dashboard data
- [x] Seed historical index data (12 months Mar 2025 - Feb 2026)
- [x] Create dashboard page component
- [x] Add index visualizations (trend charts, MoM/YoY changes)
- [x] Add navigation button to header
- [x] Write unit tests for dashboard functionality (12 tests, all passing)
- [x] Update documentation

## Bug Fixes & Dashboard Enhancements (Feb 12, 2026)

- [x] Fix mobile bug: Jump to Category dropdown not displaying category list
- [x] Convert Supply Chain Dashboard button to dropdown with 4 analysis areas
- [x] Restructure dashboard into 4 detailed sections:
  - [x] Tariff/Policy Risk (TPU + US Trade TPU with trend + 3-month change)
  - [x] Landed-cost (BLS Import Price Index with detailed display)
  - [x] Materials (HRC + LME Aluminum + CME Copper with MoM/YoY)
  - [x] Logistics (Diesel + Cass + WCI with surcharge analysis)
- [x] Fix chart scaling issues - use dual-axis or separate charts for different scales
- [x] Add data source links for all indices

## Route Fix (Feb 12, 2026)

- [x] Fix /dashboard route 404 error by adding redirect to /dashboard/tariff-policy

## Bug Fix - Nested Anchor Tags (Feb 12, 2026)

- [x] Fix nested <a> tag error in all dashboard pages (TariffPolicy, LandedCost, Materials, Logistics)

- [x] Fix nested <a> tag error on Home page

## Button Styling Updates (Feb 12, 2026)

- [x] Change all navigation buttons to consistent dark color scheme (slate-700)
- [x] Make all buttons same size on mobile devices (w-full on mobile, w-auto on desktop)

## Bug Fix - Aluminum Pricing Duplication (Feb 12, 2026)

- [x] Investigate duplicate aluminum pricing records starting from 2026-02-10
- [x] Fix data insertion logic to prevent duplicates on app refresh (implemented upsert pattern)
- [x] Clean up existing duplicate records in database

## Chatbot Feature (Feb 12, 2026)

- [x] Create chatbot component for top right corner
- [x] Implement backend tRPC endpoint for chat with LLM integration
- [x] Add chatbot to all pages with knowledge about 6 supply chain categories
- [x] Style chatbot with floating button and expandable chat window

## Chatbot Upgrade - Advanced Model & Search (Feb 12, 2026)

- [x] Upgrade to state-of-the-art open source LLM model (DeepSeek-V3)
- [x] Add web search capability for real-time information (tool-based)
- [x] Integrate website news article search functionality
- [x] Update system prompt to include current date context

## Chatbot Tool Calling Error Fix (Feb 12, 2026)

- [x] Fix "Cannot read properties of undefined (reading 'type')" error by simplifying chatbot (removed tool calling, now uses news context in system prompt)

## Chatbot Bullets Error Fix (Feb 12, 2026)

- [x] Fix "a.bullets.substring is not a function" error in chatbot news context (added type checking)

## Supply Chain Indices Duplication Fix (Feb 12, 2026)

- [x] Fix supply chain indices insertion to use upsert pattern (prevent duplicates on refresh)

## Dashboard Duplicate Data Cleanup (Feb 12, 2026)

- [x] Investigate duplicate 'Feb 26' readings in dashboard charts
- [x] Clean up existing duplicate records in supply_chain_indices table (deleted 9 duplicate records)

## Aluminum Pricing & Forecasting Improvements (Feb 12, 2026)

- [x] Investigate discrepancy between LME Aluminum in two different dashboards (DB stored values in thousands, fixed by multiplying by 1000 in chart)
- [x] Adjust chart scales for LME Aluminum and CME Copper for better visibility (added explicit Y-axis domains)
- [x] Research 12-month forecasting sources (Goldman Sachs, J.P. Morgan, Trading Economics - formal confidence intervals not publicly available)

## Dashboard Redesign - Aluminum Pricing Pattern (Feb 12, 2026)

- [x] Read aluminum pricing index page to understand the layout pattern
- [x] Redesign Tariff/Policy Risk dashboard with separate charts (no dual-axis)
- [x] Redesign Landed-cost dashboard with separate charts
- [x] Redesign Materials dashboard with separate charts for each metal
- [x] Redesign Logistics dashboard with separate charts
- [x] Add 6-12 month forecasting with dotted lines and grey confidence bands (Materials & Tariff/Policy)
- [x] Add additional statistics and insights (volatility, correlations, risk indicators) (Materials & Tariff/Policy)

## Chart Fixes (Feb 12, 2026)

- [x] Fix HRC steel chart line misalignment issue (connected forecast to last historical point)
- [x] Update date format to "MMM 'YY" (e.g., Mar '26) across Materials and Tariff/Policy dashboards

## API Error Fix (Feb 26, 2026)

- [x] Investigate "Unexpected token '<', '<!doctype'... is not valid JSON" error (transient issue during sandbox restart)
- [x] Verified tRPC API is working correctly - all dashboard pages load successfully

## News Date Filtering Issue (Feb 26, 2026)

- [x] Investigate news articles outside 14-day range (should be Feb 12-25, 2026)
- [x] Remove old articles from database (deleted 26 articles before Feb 12, 2026)
- [x] Verified only 3 articles remain, all within 14-day range (Feb 13-16, 2026)

## News Sorting & Limiting (Feb 26, 2026)

- [x] Sort news articles by date (most recent first) within each category
- [x] Limit news display to 8 articles per category (server-side query with ORDER BY date DESC + LIMIT 8)

## Subscription & Access Control System (Mar 10, 2026)

- [x] Add `subscriptions` table to DB schema (email, status: pending/approved/denied)
- [x] Add `email_allowlist` table for admin-managed email allowlist
- [x] Create server-side subscription/allowlist/access tRPC procedures
- [x] Build admin panel: view pending requests, approve/deny, add emails directly (/admin)
- [x] Build subscription request page (public): user enters email + name to request access (/request-access)
- [x] Add AccessGate component to home page and all dashboard routes
- [x] Send owner notification on new subscription request
- [x] Add login-wall for unauthenticated users (redirect to login/request page)
- [x] Write unit tests for subscription procedures (73 tests passing)
- [x] Promote owner account to admin role in database

## Simplified Access System (Mar 10, 2026)

- [x] Remove OAuth/verification code requirement from access request flow
- [x] Redesign AccessGate: show simple email request form inline (no redirect to login)
- [x] Simplify RequestAccess page to email-only form (name + email + optional reason)
- [x] Admin can approve/deny requests and add emails directly to allowlist
- [x] Approved email stored in allowlist - user enters email on next visit to gain access
- [x] No login/OAuth required for content access (email-based access token approach)
- [x] Add Quick Approve button (approve + add to allowlist in one click)
- [x] All 73 tests passing

## CSV Bulk Import for Allowlist (Mar 10, 2026)

- [x] Add server-side bulk import tRPC procedure (validate emails, skip duplicates)
- [x] Build CSV upload UI in admin panel with file picker, drag-and-drop, and preview table
- [x] Add CSV format validation and error reporting per row (invalid email format highlighted in red)
- [x] Show import summary (added, skipped duplicates, invalid rows)
- [x] All 73 existing tests passing (bulk import covered by subscription.test.ts)
## Admin Password Access (Mar 10, 2026)

- [x] Add ADMIN_PASSWORD secret/env variable
- [x] Add server-side tRPC procedure to verify admin password
- [x] Build password login UI at /admin (replaces OAuth check)
- [x] Store admin session in localStorage so user stays logged in
- [x] Add logout button in admin panel

## Admin Link & Dashboard Redesigns (Mar 10, 2026)

- [x] Add discreet Admin link to site footer
- [x] Redesign Landed-cost dashboard: separate charts, MMM 'YY dates, 6-month forecasting with confidence bands, stats cards
- [x] Redesign Logistics dashboard: separate charts, MMM 'YY dates, 6-month forecasting with confidence bands, stats cards
