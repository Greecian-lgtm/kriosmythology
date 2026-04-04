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
