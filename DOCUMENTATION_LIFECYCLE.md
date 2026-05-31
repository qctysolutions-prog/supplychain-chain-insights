# Documentation Files Lifecycle Guide

This guide explains how the various `.md` documentation files in your project are created, updated, and managed.

---

## 📁 Documentation Files Overview

Your project contains several types of documentation files:

### 1. **Manual Update Summaries** (Created during news updates)
- `NEWS_UPDATE_SUMMARY.md` - Summary of test news update (Jan 10-16)
- `UPDATE_SUMMARY_JAN19_2026.md` - Summary of Jan 19-21 update from GitHub

**How they're created:**
- Generated manually by me (Manus AI) after each news update
- Document what articles were added/removed
- Include date ranges, category counts, and verification status

**Lifecycle:**
- Created once per update
- NOT automatically updated
- Should be archived or renamed for each new update
- ARE committed to Git (visible in repo history)

**Recommendation:** 
```bash
# Archive old summaries in a subdirectory
mkdir -p docs/update-history
mv UPDATE_SUMMARY_*.md docs/update-history/
```

---

### 2. **Bug Fix Reports** (Created when issues are resolved)
- `BUG_FIX_REPORT.md` - Documents the category naming mismatch fix

**How they're created:**
- Generated when a bug is identified and fixed
- Include root cause analysis, solution, and verification

**Lifecycle:**
- Created once per bug fix
- NOT automatically updated
- Serve as historical record
- ARE committed to Git

**Recommendation:**
```bash
# Archive bug reports
mkdir -p docs/bug-fixes
mv BUG_FIX_REPORT*.md docs/bug-fixes/
```

---

### 3. **Configuration Guides** (Reference documentation)
- `AUTOMATED_NEWS_SCHEDULE_GUIDE.md` - How to set up automated updates
- `SCHEDULE_CONFIRMATION.md` - Confirmation of schedule setup
- `CATEGORY_MAINTENANCE.md` - Category naming conventions
- `DEPLOYMENT.md` - Deployment instructions

**How they're created:**
- Generated as reference documentation
- Created when features are implemented or configured

**Lifecycle:**
- Created once, updated as needed
- Should be kept up-to-date with current configuration
- ARE committed to Git
- Serve as ongoing reference

**Recommendation:**
Keep these files and update them when configuration changes.

---

### 4. **Project Management Files**
- `todo.md` - Task tracking
- `ideas.md` - Design concepts and feature ideas
- `deploy_instructions.md` - Deployment steps

**How they're created:**
- `todo.md` - Updated continuously as features are added/completed
- `ideas.md` - Created during project initialization
- `deploy_instructions.md` - Created for deployment guidance

**Lifecycle:**
- Actively maintained throughout project
- Updated with each new feature or task
- ARE committed to Git

---

## 🔄 How Updates Work

### Current Behavior

**When news updates run (automated or manual):**
1. ✅ Database gets updated (articles added/removed)
2. ✅ Changes are committed to Git
3. ❌ Documentation files are NOT automatically updated
4. ❌ Old summaries are NOT archived automatically

**What gets committed to Git:**
- All `.md` files in the root directory
- Code changes
- Database migration files
- Configuration files

**What does NOT happen automatically:**
- Old update summaries are not archived
- New update summaries are not generated
- Documentation is not refreshed

---

## 🎯 Recommended Workflow

### For Each News Update

**Option 1: Manual Documentation (Current)**
1. Run news update (automated or manual)
2. Request: "Create an update summary for this news refresh"
3. Archive old summaries: `mv UPDATE_SUMMARY_*.md docs/update-history/`
4. Commit new summary to Git

**Option 2: Automated Documentation (Recommended)**
I can create a script that automatically:
- Generates update summaries with timestamp
- Archives old summaries to `docs/update-history/`
- Updates a master `CHANGELOG.md` with all changes
- Commits everything to Git

### For Bug Fixes
1. Fix the bug
2. Request: "Document this bug fix"
3. Archive report: `mv BUG_FIX_REPORT*.md docs/bug-fixes/`
4. Commit to Git

### For Configuration Changes
1. Update the configuration
2. Update relevant `.md` file (e.g., `DEPLOYMENT.md`)
3. Commit to Git

---

## 📂 Suggested Directory Structure

```
mobility-supply-chain-brief/
├── docs/
│   ├── update-history/
│   │   ├── UPDATE_SUMMARY_JAN10_2026.md
│   │   ├── UPDATE_SUMMARY_JAN19_2026.md
│   │   └── NEWS_UPDATE_SUMMARY.md
│   ├── bug-fixes/
│   │   └── BUG_FIX_REPORT_CATEGORY_NAMING.md
│   └── guides/
│       ├── AUTOMATED_NEWS_SCHEDULE_GUIDE.md
│       ├── CATEGORY_MAINTENANCE.md
│       └── DEPLOYMENT.md
├── CHANGELOG.md (master log of all changes)
├── README.md (project overview)
└── todo.md (active task tracking)
```

---

## 🔧 Automation Options

### Option A: Simple Archiving Script
Create `archive_docs.sh`:
```bash
#!/bin/bash
mkdir -p docs/update-history docs/bug-fixes
mv UPDATE_SUMMARY_*.md docs/update-history/ 2>/dev/null
mv BUG_FIX_REPORT*.md docs/bug-fixes/ 2>/dev/null
echo "Documentation archived"
```

### Option B: Full Automation
I can create a comprehensive update script that:
1. Fetches fresh news articles
2. Updates database
3. Generates timestamped update summary
4. Archives old summaries
5. Updates CHANGELOG.md
6. Commits everything to Git
7. Pushes to GitHub

---

## 🚀 Implementation

Would you like me to:

1. **Reorganize existing docs** - Move current files into organized structure
2. **Create archiving script** - Simple bash script to archive old summaries
3. **Build full automation** - Complete update + documentation pipeline
4. **Just document current state** - Keep as-is with this guide

Let me know which approach you prefer!

---

## Current Status

**Files in Git:** All `.md` files are tracked and committed
**Auto-updates:** Database only, docs are manual
**Archiving:** Not implemented, files accumulate in root
**Changelog:** Not maintained

**Recommendation:** Implement Option B (full automation) for the scheduled news updates to ensure documentation stays current and organized.
