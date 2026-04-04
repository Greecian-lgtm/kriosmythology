# KRIOS — Protected Files

Never modify, overwrite, delete, or restructure these files/directories.
Only `index.html` and new asset files (video, frames, images) may be changed.

## Locked Files & Directories

| Path | Reason |
|---|---|
| `links.html` | Manually restored linktree page |
| `links/` | Directory copy of linktree (links/index.html) |
| `answers/` | 39 AEO pages |
| `blog/` | 11 blog posts |
| `tools/` | All quizzes (Real or Fake?, etc.) |
| `investigate.html` | Free case file page |
| `sitemap.xml` | SEO sitemap |
| `.gitignore` | Repo config |

## Kit Email Form

Must remain in `index.html` at all times.

- UID: `a62ecc2651`
- Script src: `https://krios-primary-sources.kit.com/a62ecc2651/index.js`

**After every change to index.html, run:**
```
grep "kit.com" index.html
```

## Rule

Before any file operation: confirm the target is `index.html` or a new asset.
If in doubt — do not touch it.

## CONTENT VOICE STANDARD
All content generated for Krios must follow the Expert Panel Voice Standard.
File: ~/krios-workspace/analytics/panel_final_synthesis.json
Rules wired into: larry_commentary.py, larry_blog.py, larry_quiz.py,
                  larry_aeo.py, larry_slides.py, larry_reddit_scout.py,
                  larry_reply.py, larry_spec.py, larry_core.py

Quick reference — what the 10-expert panel agreed on:
- Cite sources mid-argument: "It is on Book 23 of the Iliad" not "According to Homer"
- Open with the misconception, not the correction
- Identify the overlooked figure others miss
- Never: "it's important to note", "in conclusion", "arguably"
- Correction formula: misconception → source detail → why it matters
- Rhythm: short punchy (2-3w) alternating with explanatory chains (20w+)
