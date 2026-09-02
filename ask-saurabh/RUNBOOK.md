# Ask Saurabh — deployment runbook

Operational steps for running the "Ask Saurabh" Worker locally and shipping it to
Cloudflare. For architecture and config reference, see [`README.md`](./README.md).

```
browser widget ──POST──▶ Cloudflare Worker ──▶ Gemini API
(assets/js/ask-saurabh.js)   (src/worker.js)   generateContent, grounded in knowledge.js
        ▲───────────────── SSE stream ────────────────┘
```

- **Local:** `wrangler dev` runs the Worker on `http://localhost:8787`; the key
  comes from `.dev.vars`.
- **Cloud:** `wrangler deploy` publishes to
  `https://ask-saurabh.<subdomain>.workers.dev`; the key is a Wrangler secret.

---

## 0. Prerequisites (one time)

| Need | How |
|---|---|
| Node 18+ | `node -v` |
| Deps installed | `cd ask-saurabh && npm install` |
| Cloudflare account (free) | <https://dash.cloudflare.com/sign-up> |
| Gemini API key (free, no card) | <https://aistudio.google.com/apikey> — starts with `AIza…` |
| Logged in to Cloudflare | `npx wrangler login` (opens a browser; one time per machine) |

Check what account Wrangler is using at any point:

```bash
npx wrangler whoami
```

---

## 1. Local runbook

### 1.1 First-time setup

```bash
cd ask-saurabh
npm install

# Create the local secrets file (git-ignored — never commit it)
printf 'GEMINI_API_KEY=AIza-your-key-here\n' > .dev.vars
```

`.dev.vars` is already in `.gitignore`. It is read automatically by `wrangler dev`
— no other wiring needed.

### 1.2 Run it

Use **two terminals**.

**Terminal A — the Worker:**

```bash
cd ask-saurabh
npm run dev          # = wrangler dev
```

Wait for:

```
⎔ Starting local server...
[wrangler:inf] Ready on http://localhost:8787
```

If the port is taken, Wrangler picks another (e.g. `8788`) and prints it — note
the actual URL. Pin the port with `npm run dev -- --port 8787` if you want it
stable.

**Terminal B — the website** (must be served over HTTP, not opened as a file):

```bash
cd ..                       # repo root
python3 -m http.server 8000
```

### 1.3 Point the widget at local

Edit `index.html` (near the bottom, ~line 765):

```html
<script>
    // window.ASK_SAURABH_ENDPOINT = 'https://ask-saurabh.portfolio-rag.workers.dev';
    window.ASK_SAURABH_ENDPOINT = 'http://localhost:8787';   // local dev
</script>
```

Open **`http://localhost:8000`** (not `file:///…/index.html`). Click **Ask
Saurabh**, send a question, expect a streamed answer.

> ⚠️ Revert this line before committing — production must point at the
> `workers.dev` URL. The widget hides itself if the endpoint still contains
> `YOUR-WORKER`, but it will happily ship `localhost` if you leave it.

### 1.4 Smoke-test the Worker directly

```bash
curl -i -X POST http://localhost:8787 \
  -H 'Origin: http://localhost:8000' \
  -H 'Content-Type: application/json' \
  -d '{"messages":[{"role":"user","content":"What does Saurabh do?"}]}'
```

Expect `HTTP/1.1 200`, header `access-control-allow-origin: http://localhost:8000`,
and a body of `event: delta` / `data: {...}` lines ending in `event: done`.

---

## 2. Cloudflare runbook

### 2.1 First deploy

```bash
cd ask-saurabh
npx wrangler login                 # if not already logged in
npx wrangler secret put GEMINI_API_KEY
#   paste the AIza… key at the prompt (input is hidden)

npm run deploy                     # = wrangler deploy
```

`deploy` prints the live URL:

```
Published ask-saurabh
  https://ask-saurabh.<your-subdomain>.workers.dev
```

### 2.2 Wire the site to production

Set `index.html` back to the real URL:

```html
<script>
    window.ASK_SAURABH_ENDPOINT = 'https://ask-saurabh.<your-subdomain>.workers.dev';
</script>
```

Make sure that origin is in the allowlist in `wrangler.toml`:

```toml
[vars]
ALLOWED_ORIGINS = "https://nsaurabh777.github.io"
```

If you changed `ALLOWED_ORIGINS`, `npm run deploy` again (it's a var, baked in at
deploy time). Then commit + push `index.html` — GitHub Pages serves the update.

### 2.3 Verify production

```bash
curl -i -X POST https://ask-saurabh.<your-subdomain>.workers.dev \
  -H 'Origin: https://nsaurabh777.github.io' \
  -H 'Content-Type: application/json' \
  -d '{"messages":[{"role":"user","content":"What does Saurabh do?"}]}'
```

Expect `200`, `access-control-allow-origin: https://nsaurabh777.github.io`, and
streamed `event: delta` lines. Then load <https://nsaurabh777.github.io> and try
the widget in the browser.

Tail live logs while testing:

```bash
npx wrangler tail
```

### 2.4 Routine redeploys

Any change to `src/worker.js`, `knowledge.js`, or `wrangler.toml` (`[vars]`):

```bash
cd ask-saurabh && npm run deploy
```

Updating what the assistant knows is just: edit `knowledge.js` → `npm run deploy`.
No secret or config changes needed.

### 2.5 Rotate the Gemini key

```bash
npx wrangler secret put GEMINI_API_KEY    # paste the new key
npm run deploy                            # secrets take effect on next deploy
```

Then revoke the old key at <https://aistudio.google.com/apikey>. No code change.

### 2.6 Rollback

```bash
npx wrangler deployments list             # find the last-good version ID
npx wrangler rollback [<version-id>]      # omit ID to roll back one step
```

Secrets and vars are unaffected by a rollback.

---

## 3. Deploy checklist

- [ ] `npm install` run in `ask-saurabh/`
- [ ] `GEMINI_API_KEY` set — `.dev.vars` for local, `wrangler secret put` for cloud
- [ ] `wrangler whoami` shows the right Cloudflare account
- [ ] `ALLOWED_ORIGINS` in `wrangler.toml` includes the site origin
- [ ] `index.html` → `ASK_SAURABH_ENDPOINT` points at the intended Worker (prod URL for commits)
- [ ] `curl` smoke test returns `200` + `event: delta`
- [ ] Browser test on the real page passes
- [ ] Local-only edits to `index.html` reverted before commit

---

## 4. Troubleshooting

Widget shows: **"I couldn't reach the assistant service…"**
→ This is a network/CORS failure — the request never reached the Worker. The
Gemini key is *not* the cause (a key problem produces "reached its usage limit"
or "something went wrong" instead). Work through the table:

| Symptom | Cause | Fix |
|---|---|---|
| Error on local, page URL is `file:///…` | Page origin is `null`; Worker only allows `http://localhost` / `http://127.0.0.1` | Serve over HTTP: `python3 -m http.server 8000`, open `http://localhost:8000` |
| Error on local, `wrangler dev` not running or crashed | Nothing listening on `:8787` → `fetch` throws `TypeError` | Start `npm run dev`; wait for "Ready on http://localhost:8787" |
| `wrangler dev` printed a different port | Endpoint mismatch | Match `ASK_SAURABH_ENDPOINT` to the printed port, or `npm run dev -- --port 8787` |
| Page served over `https://` locally, endpoint is `http://localhost` | Mixed-content block | Serve the page over `http://`, or use `127.0.0.1` consistently |
| Error in production | Site origin not in `ALLOWED_ORIGINS` (403 with no CORS headers → `TypeError`) | Add the origin to `wrangler.toml`, `npm run deploy` |
| Error in production, `curl` to the Worker also fails | Worker not deployed / wrong subdomain in `index.html` | `npm run deploy`, copy the exact printed URL |
| DevTools → Network shows the real reason | — | Read the red text on the failed request: "CORS", "connection refused", "mixed content" |

Widget shows: **"This assistant has reached its usage limit…"**

| Cause | Fix |
|---|---|
| Gemini free-tier rate/quota hit (HTTP 429 / `RESOURCE_EXHAUSTED`) | Wait; or switch `MODEL` to `gemini-3.6-flash-lite` in `wrangler.toml`; or enable billing on the key |
| Per-IP limit in `wrangler.toml` (8 req / 60s) | Expected throttle; raise `simple = { limit, period }` if needed (`period` must be 10 or 60) |

Widget shows: **"Server is not configured yet."**
→ `GEMINI_API_KEY` missing. Local: check `.dev.vars`. Cloud: `npx wrangler secret list`, then `wrangler secret put GEMINI_API_KEY` + `npm run deploy`.

Widget shows: **"Something went wrong answering that."**
→ Gemini returned a non-429 error (bad model id, malformed request). Run
`npx wrangler tail` and reproduce; the logged `Gemini error <status> <body>`
line has the detail. Check `MODEL` in `wrangler.toml` is a valid free-tier model.

Useful commands:

```bash
npx wrangler whoami            # which account
npx wrangler secret list       # which secrets are set (names only)
npx wrangler tail              # live production logs
npx wrangler deployments list  # deploy history for rollback
```
