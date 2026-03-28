# Academy Plus — Implementation Summary

## What Was Built

A new "Academy Plus" section within Re³ Academy that hosts structured multi-week learning programs. Currently admin-only (gated to `nitesh4learning@gmail.com`).

## Files Created (6 new files)

```
app/academy/plus/
├── page.js                    # Server component — hub page
├── PlusHub.js                 # Client component — lists all programs, admin-gated
├── lib/
│   └── program-loader.js      # Reads program.json from content/programs/
└── [programId]/
    ├── page.js                # Server component — individual program page
    └── ProgramShell.js        # Client component — full program viewer with
                               #   expandable weeks, resources, career tips,
                               #   SnapSense angles, certifications

content/programs/
└── agentic-ai-mastery/
    └── program.json           # 12-week personal roadmap data
```

## Files Modified (1 file)

```
app/academy/AcademyHub.js      # Added Academy Plus flash card (admin-only)
```

## Architecture Decisions

1. **Portable by design** — All program data lives in `program.json`, components only read from props. You can extract the `plus/` directory and drop it into any Next.js 14 app.

2. **Mirrors existing patterns** — `program-loader.js` follows the same pattern as `course-loader.js`. Uses the same GIM design tokens, FadeIn, and ProgressBar components.

3. **Admin-only at two levels**:
   - The flash card on AcademyHub only renders when `isAdmin` is true
   - PlusHub and ProgramShell both check `user.email === ADMIN_EMAIL`

4. **Content/code separation** — Program content is pure JSON in `content/programs/`. Adding a new program = adding a new folder with `program.json`. No code changes needed.

## How to Deploy

```bash
# From the re3-live repo root
git add app/academy/plus/ content/programs/ app/academy/AcademyHub.js
git commit -m "feat: add Academy Plus — admin-only structured learning programs"
git push
# Vercel auto-deploys
```

## How to Add a New Program

1. Create `content/programs/{program-id}/program.json`
2. Follow the schema in `agentic-ai-mastery/program.json`
3. Push to GitHub — it auto-appears in the Plus hub

## Program JSON Schema

```json
{
  "id": "string",
  "title": "string",
  "subtitle": "string",
  "description": "string",
  "icon": "emoji",
  "status": "active | draft",
  "visibility": "admin | public",
  "totalWeeks": 12,
  "hoursPerWeek": "10+",
  "phases": [{
    "id": "string",
    "title": "string",
    "weeks": "Weeks X–Y",
    "color": "#hex",
    "accent": "#hex",
    "goal": "string",
    "modules": [{
      "week": 1,
      "title": "string",
      "status": "current | upcoming | completed",
      "estimatedHours": 10,
      "learn": ["string"],
      "build": { "title", "description", "stack", "deliverable" },
      "resources": [{ "title", "url", "type", "priority" }],
      "careerAngle": "string",
      "snapSenseAngle": "string"
    }]
  }],
  "certifications": [{ "name", "provider", "effort", "priority", "note", "week" }]
}
```
