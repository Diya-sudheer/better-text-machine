# Better Text Machine

A dependency-free writing assistant for revising rough or AI-assisted drafts into clearer, more personal, better sourced writing.

It helps writers:

- open through a playful local "Peekaboo" name gate
- improve clarity and flow
- add placeholders for personal examples
- reduce generic wording
- suggest stronger transitions
- flag claims that likely need citations
- preserve the user's meaning
- avoid plagiarism through source and disclosure checks
- produce a revision checklist
- import plain text or Markdown files
- extract selectable text from uploaded PDFs in the browser
- use free OCR fallback for scanned PDFs when Tesseract.js loads
- import readable `.docx` files with Mammoth.js
- accept writer suggestions as required revision directions
- apply, ignore, or mark suggestions as needing rewrite
- edit the final draft directly before export
- track source notes beside evidence-heavy claims
- build personal evidence from guided prompts
- save local revision history in the browser
- calculate a trust score from sources, personal detail, unresolved prompts, and checklist progress
- export a true `.docx` file with JSZip, with `.doc` fallback if the library is unavailable
- show a before/after sentence diff
- map claims that need evidence
- identify personalization gaps
- score how well the revision reflects the user's suggestions
- audit risky claims with a "do not invent facts" check
- show a citation-needed heatmap
- open a print view that can be saved as PDF

Open `index.html` in a browser to use it. PDF extraction, DOCX import, and OCR use free CDN libraries, so the browser needs internet access when loading the page.

PDF extraction works best for PDFs with selectable text. Scanned image PDFs use browser OCR, which can be slower and less accurate. Legacy `.doc` files are not supported, but `.docx` files can be imported.

This tool is intentionally not designed to bypass AI detectors. It is meant to support authentic, transparent revision and responsible final authorship.

The Peekaboo gate is a playful local entry screen, not real authentication. Change `allowedGateNames` in `app.js` if you want to use a different name.

## Security notes

- The app uses a browser Content Security Policy to limit scripts, connections, frames, forms, and embedded objects.
- Uploaded files are processed locally in the browser and limited to 25 MB.
- OCR is capped to the first 6 PDF pages to avoid freezing the browser.
- Local revision history and source notes are stored only in browser `localStorage`.
- The Peekaboo gate is not real security or authentication.
- CDN libraries should be pinned and reviewed before production use.
