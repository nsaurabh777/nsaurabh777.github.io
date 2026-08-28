/* ============================================================
   "Ask Saurabh" — portfolio chat widget
   Talks to the Cloudflare Worker defined in /ask-saurabh.
   Configure the endpoint on window.ASK_SAURABH_ENDPOINT (see index.html).
   ============================================================ */
(() => {
    'use strict';

    const ENDPOINT = (window.ASK_SAURABH_ENDPOINT || '').trim();
    if (!ENDPOINT || ENDPOINT.includes('YOUR-WORKER')) {
        // Not configured yet — stay invisible rather than show a broken button.
        console.info('[Ask Saurabh] widget disabled: set window.ASK_SAURABH_ENDPOINT to your deployed Worker URL.');
        return;
    }

    const SUGGESTIONS = [
        'What does Saurabh do?',
        'Tell me about the Generative AI work at Jet2',
        'What is his experience with MLOps?',
        'What are his strongest skills?',
    ];
    const MAX_TURNS = 10; // user+assistant messages sent to the server

    /** conversation history: [{ role: 'user' | 'assistant', content: string }] */
    const history = [];
    let streaming = false;
    let lastFocused = null;

    /* ---------- build DOM ---------- */
    const launcher = el('button', {
        class: 'as-launcher',
        type: 'button',
        'aria-haspopup': 'dialog',
        'aria-expanded': 'false',
        'aria-label': 'Ask Saurabh — chat about my work',
    });
    launcher.innerHTML =
        '<svg viewBox="0 0 24 24" aria-hidden="true" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 12a8 8 0 0 1-11.5 7.2L4 20l0.9-5A8 8 0 1 1 21 12Z"/></svg><span>Ask&nbsp;Saurabh</span>';

    const panel = el('div', {
        class: 'as-panel',
        role: 'dialog',
        'aria-modal': 'false',
        'aria-labelledby': 'as-title',
        hidden: '',
    });
    panel.innerHTML = `
        <div class="as-head">
            <div>
                <p class="as-title" id="as-title">Ask Saurabh</p>
                <p class="as-sub">AI answers grounded in his portfolio. May be imperfect.</p>
            </div>
            <button class="as-close" type="button" aria-label="Close chat">
                <svg viewBox="0 0 24 24" aria-hidden="true" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 6 12 12M18 6 6 18"/></svg>
            </button>
        </div>
        <div class="as-log" role="log" aria-live="polite"></div>
        <div class="as-suggestions"></div>
        <form class="as-form">
            <textarea class="as-input" rows="1" placeholder="Ask about Saurabh's work…" aria-label="Your question" maxlength="600"></textarea>
            <button class="as-send" type="submit" aria-label="Send question" disabled>
                <svg viewBox="0 0 24 24" aria-hidden="true" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 12h11M13 6l6 6-6 6"/></svg>
            </button>
        </form>`;

    document.body.append(launcher, panel);

    const logEl = panel.querySelector('.as-log');
    const suggestionsEl = panel.querySelector('.as-suggestions');
    const formEl = panel.querySelector('.as-form');
    const inputEl = panel.querySelector('.as-input');
    const sendEl = panel.querySelector('.as-send');
    const closeEl = panel.querySelector('.as-close');

    SUGGESTIONS.forEach((q) => {
        const chip = el('button', { class: 'as-chip', type: 'button' });
        chip.textContent = q;
        chip.addEventListener('click', () => {
            inputEl.value = q;
            syncSend();
            formEl.requestSubmit();
        });
        suggestionsEl.append(chip);
    });

    addMessage(
        'assistant',
        "Hi! I'm an AI assistant for Saurabh's portfolio. Ask me about his experience, projects, or skills.",
    );

    /* ---------- open / close ---------- */
    function openPanel() {
        lastFocused = document.activeElement;
        panel.hidden = false;
        launcher.setAttribute('aria-expanded', 'true');
        document.body.classList.add('as-open');
        requestAnimationFrame(() => panel.classList.add('as-visible'));
        inputEl.focus();
    }
    function closePanel() {
        panel.classList.remove('as-visible');
        launcher.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('as-open');
        const done = () => {
            panel.hidden = true;
            panel.removeEventListener('transitionend', done);
        };
        panel.addEventListener('transitionend', done);
        setTimeout(done, 300);
        if (lastFocused && lastFocused.focus) lastFocused.focus();
        else launcher.focus();
    }
    launcher.addEventListener('click', () => (panel.hidden ? openPanel() : closePanel()));
    closeEl.addEventListener('click', closePanel);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !panel.hidden) closePanel();
    });

    /* ---------- input UX ---------- */
    function syncSend() {
        sendEl.disabled = streaming || inputEl.value.trim().length === 0;
    }
    inputEl.addEventListener('input', () => {
        inputEl.style.height = 'auto';
        inputEl.style.height = Math.min(inputEl.scrollHeight, 120) + 'px';
        syncSend();
    });
    inputEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (!sendEl.disabled) formEl.requestSubmit();
        }
    });

    /* ---------- submit ---------- */
    formEl.addEventListener('submit', async (e) => {
        e.preventDefault();
        const question = inputEl.value.trim();
        if (!question || streaming) return;

        suggestionsEl.classList.add('as-hidden');
        inputEl.value = '';
        inputEl.style.height = 'auto';
        addMessage('user', question);
        history.push({ role: 'user', content: question });

        streaming = true;
        syncSend();
        const bubble = addMessage('assistant', '', { pending: true });
        let answer = '';

        try {
            const res = await fetch(ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: history.slice(-MAX_TURNS) }),
            });

            if (!res.ok || !res.body) {
                let msg = '';
                try {
                    const data = await res.json();
                    if (data && data.error) msg = data.error;
                } catch (_) {}
                if (!msg) {
                    if (res.status === 429) {
                        msg = "This assistant has hit its usage limit for now. Please try again later, or reach Saurabh directly at nsaurabh777.ai@gmail.com.";
                    } else if (res.status === 402 || res.status === 403) {
                        msg = "The assistant is offline right now — its free API quota may be exhausted. Please reach Saurabh directly at nsaurabh777.ai@gmail.com.";
                    } else {
                        msg = "The assistant is unavailable right now. Please try again later, or email nsaurabh777.ai@gmail.com.";
                    }
                }
                throw new Error(msg);
            }

            await readSSE(res.body, (event, data) => {
                if (event === 'delta' && data.text) {
                    answer += data.text;
                    bubble.classList.remove('as-pending');
                    renderInto(bubble, answer);
                    scrollLog();
                } else if (event === 'error') {
                    throw new Error(data.error || 'Something went wrong.');
                }
            });

            if (!answer) {
                renderInto(bubble, "I didn't catch that — could you rephrase?");
            }
            history.push({ role: 'assistant', content: answer || '(no answer)' });
        } catch (err) {
            bubble.classList.remove('as-pending');
            bubble.classList.add('as-error');
            renderInto(bubble, friendlyError(err));
            // drop the failed user turn so retries don't compound
            if (history.length && history[history.length - 1].role === 'user') history.pop();
        } finally {
            streaming = false;
            syncSend();
            inputEl.focus();
        }
    });

    /* ---------- helpers ---------- */
    function friendlyError(err) {
        // A raw fetch() rejection (TypeError) means the request never reached the
        // Worker: it's offline, blocked by CORS (e.g. opening this file directly
        // from disk), or the network is down. Anything else already carries a
        // human-readable message from the server or the SSE error event.
        const networkFail =
            err instanceof TypeError ||
            /failed to fetch|networkerror|load failed|network request failed/i.test(
                err && err.message ? err.message : '',
            );
        if (networkFail) {
            return "I couldn't reach the assistant service. It may be temporarily offline or over its usage limit. Please try again later, or email nsaurabh777.ai@gmail.com.";
        }
        return err && err.message
            ? err.message
            : 'Something went wrong. Please try again.';
    }

    function addMessage(role, text, opts = {}) {
        const wrap = el('div', { class: `as-msg as-${role}` });
        const bubble = el('div', { class: 'as-bubble' + (opts.pending ? ' as-pending' : '') });
        if (opts.pending) {
            bubble.innerHTML = '<span class="as-dots"><i></i><i></i><i></i></span>';
        } else {
            renderInto(bubble, text);
        }
        wrap.append(bubble);
        logEl.append(wrap);
        scrollLog();
        return bubble;
    }

    function renderInto(node, text) {
        node.innerHTML = '';
        const safe = escapeHtml(text);
        const html = linkify(safe).replace(/\n/g, '<br>');
        node.innerHTML = html;
    }

    function scrollLog() {
        logEl.scrollTop = logEl.scrollHeight;
    }

    async function readSSE(stream, onEvent) {
        const reader = stream.getReader();
        const decoder = new TextDecoder();
        let buf = '';
        while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            buf += decoder.decode(value, { stream: true });
            const chunks = buf.split('\n\n');
            buf = chunks.pop() || '';
            for (const chunk of chunks) {
                let event = 'message';
                let dataLine = '';
                for (const line of chunk.split('\n')) {
                    if (line.startsWith('event:')) event = line.slice(6).trim();
                    else if (line.startsWith('data:')) dataLine += line.slice(5).trim();
                }
                if (!dataLine) continue;
                let data = {};
                try {
                    data = JSON.parse(dataLine);
                } catch (_) {
                    continue;
                }
                if (event === 'done') return;
                onEvent(event, data);
            }
        }
    }

    function el(tag, attrs) {
        const node = document.createElement(tag);
        for (const [k, v] of Object.entries(attrs || {})) node.setAttribute(k, v);
        return node;
    }

    function escapeHtml(s) {
        return s
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function linkify(s) {
        return s
            .replace(
                /\b((?:https?:\/\/|www\.)[^\s<]+[^\s<.,;:!?)])/g,
                (m) => {
                    const href = m.startsWith('http') ? m : 'https://' + m;
                    return `<a href="${href}" target="_blank" rel="noopener">${m}</a>`;
                },
            )
            .replace(
                /\b([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})\b/g,
                '<a href="mailto:$1">$1</a>',
            );
    }
})();
