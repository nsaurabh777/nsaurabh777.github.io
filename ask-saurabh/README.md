# Ask Saurabh — chat widget backend

A small Cloudflare Worker that powers the "Ask Saurabh" widget on
`nsaurabh777.github.io`. It keeps the Gemini API key server-side and answers
visitor questions using **only** the facts in [`knowledge.js`](./knowledge.js).

```
browser widget ──POST──▶ Cloudflare Worker ──▶ Gemini API (gemini-3.6-flash)
(assets/js/ask-saurabh.js)   (src/worker.js)   generateContent, grounded in knowledge.js
        ▲───────────────── SSE stream ────────────────┘
```

The Worker calls Gemini's non-streaming `generateContent`, then re-chunks the
answer back to the browser as SSE so the widget still fills in progressively.

Both sides are free: Cloudflare Workers (free plan) and the Gemini API free tier
(no credit card; ~20 requests/min for `gemini-3.6-flash`).

## What's here

| File | Purpose |
|---|---|
| `src/worker.js` | The Worker: CORS, per-IP rate limit, input caps, calls Gemini `generateContent`, re-chunks the answer to the browser as SSE |
| `knowledge.js` | The knowledge base — the single source of truth the model may use |
| `wrangler.toml` | Worker config: allowed origins, model, rate-limit binding |
| `package.json` | Dev dep: `wrangler` (the Worker itself has no runtime deps) |

## Deploy (one time, ~5 min)

Prerequisites: Node 18+, a Cloudflare account (free), a Gemini API key
(free, no card — create one at <https://aistudio.google.com/apikey>).

```bash
cd ask-saurabh
npm install

# Log in to Cloudflare (opens a browser)
npx wrangler login

# Store your Gemini key as a secret (not in any file)
npx wrangler secret put GEMINI_API_KEY
#   paste the AIza... key when prompted

# Ship it
npx wrangler deploy
```

`wrangler deploy` prints the Worker URL, e.g.
`https://ask-saurabh.<your-subdomain>.workers.dev`.

## Wire it to the site

Edit `index.html` (bottom of the file) and replace the placeholder:

```html
<script>
    window.ASK_SAURABH_ENDPOINT = 'https://ask-saurabh.<your-subdomain>.workers.dev';
</script>
```

Commit and push. The widget stays hidden until this is a real URL, so the site is
safe to deploy before the Worker exists.

## Local testing

Put your key in a local `.dev.vars` file (git-ignored) first:

```
GEMINI_API_KEY=AIza...
```

```bash
npx wrangler dev            # serves the Worker on http://localhost:8787
```

Then open `index.html` locally (any `localhost`/`127.0.0.1` origin is allowed by
default) with `window.ASK_SAURABH_ENDPOINT = 'http://localhost:8787'`.

## Configuration (`wrangler.toml`)

| Setting | Default | Notes |
|---|---|---|
| `ALLOWED_ORIGINS` | `https://nsaurabh777.github.io` | Comma-separated. `localhost`/`127.0.0.1` always allowed. |
| `MODEL` | `gemini-3.6-flash` | Any Gemini model on the free tier (e.g. `gemini-3.6-flash-lite`). |
| rate limit | 8 requests / 60s per IP | `[[unsafe.bindings]]` → `simple = { limit, period }`. `period` must be 10 or 60. |

Other caps live at the top of `src/worker.js`: `MAX_TURNS` (12), `MAX_CHARS`
(6000 total), `MAX_TOKENS` (1500, covers hidden reasoning + answer).

## Updating what the assistant knows

Edit `knowledge.js`, then `npx wrangler deploy`. That's the whole loop. Keep it
factual — the system prompt forbids the model from going beyond this file.

## Cost

**Free.** The Gemini API free tier covers `gemini-3.6-flash` at roughly 20
requests/min — far above what a portfolio widget sees, and the per-IP rate
limit (8/min) keeps any single visitor from burning through it.
Note: on the free tier Google may use prompts to improve its products; the
knowledge base here is already public portfolio copy, so that's a non-issue.

If you ever outgrow the free tier, either enable billing on the Gemini key or
switch `MODEL` to `gemini-3.6-flash-lite` for higher limits.
