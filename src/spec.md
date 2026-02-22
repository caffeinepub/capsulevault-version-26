# Specification

## Summary
**Goal:** Add Google AdSense verification script to the global head section for site verification.

**Planned changes:**
- Add Google AdSense verification script to frontend/index.html inside the <head> section before the closing </head> tag
- Ensure the script includes the correct client ID (ca-pub-7830122739302232) with async and crossorigin attributes
- Prevent duplicate scripts if already present

**User-visible outcome:** The website will have the AdSense verification script loaded on every page, enabling Google AdSense verification for the site.
