/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 *
 * Small helpers for the documentation pages: the page shell and styles, tables, and SVG diagrams
 * (sequence diagrams and boxes with arrows). No libraries and no network: the pages open from disk.
 */

export const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// ---------------------------------------------------------------- page shell

const CSS = `
:root{--bg:#F5F6F8;--surface:#fff;--ink:#1B1F27;--muted:#566070;--line:#DADDE4;--accent:#B3301F;--soft:#F5F6F8;
--c-ink:#1B1F27;--c-blue:#2F4B7C;--c-green:#1F6B4B;--c-red:#B3301F;--c-grey:#566070;--c-amber:#8F4A00;--c-violet:#5B3AA8}
@media(prefers-color-scheme:dark){:root{--bg:#14171C;--surface:#1D2128;--ink:#EEF0F4;--muted:#A7B0BE;--line:#343A45;--accent:#F5A99B;--soft:#232830;
--c-ink:#3A4150;--c-blue:#3B5A93;--c-green:#2A7F5A;--c-red:#8A2A1C;--c-grey:#4A5260;--c-amber:#9A5A12;--c-violet:#6A4BBB}}
*{box-sizing:border-box}
html{scroll-behavior:smooth}
body{margin:0;background:var(--bg);color:var(--ink);font:15px/1.6 system-ui,-apple-system,"Segoe UI",sans-serif}
a{color:inherit}
.layout{display:grid;grid-template-columns:240px minmax(0,1fr);gap:40px;max-width:1500px;margin:0 auto;padding:32px 24px 80px}
nav.toc{position:sticky;top:24px;align-self:start;max-height:calc(100vh - 48px);overflow:auto;font-size:14px}
nav.toc b{display:block;margin:0 0 10px;font-size:13px;color:var(--muted);letter-spacing:.04em;text-transform:uppercase}
nav.toc a{display:block;padding:5px 10px;border-radius:8px;text-decoration:none;color:var(--muted)}
nav.toc a:hover{background:var(--surface);color:var(--ink)}
nav.toc .other{margin-top:16px;padding-top:12px;border-top:1px solid var(--line)}
main{min-width:0}
h1{font-size:34px;line-height:1.1;margin:0 0 8px;letter-spacing:-.02em}
h2{font-size:24px;margin:48px 0 6px;letter-spacing:-.01em;scroll-margin-top:16px}
h3{font-size:17px;margin:28px 0 6px}
p.lead{color:var(--muted);max-width:80ch;margin:0 0 8px}
p,li{max-width:92ch}
ul,ol{padding-left:22px}
code{font:13px ui-monospace,Menlo,Consolas,monospace;background:var(--soft);border:1px solid var(--line);border-radius:6px;padding:1px 5px}
pre{background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:14px 16px;overflow:auto;font:13px/1.5 ui-monospace,Menlo,Consolas,monospace;margin:12px 0}
pre code{background:none;border:0;padding:0}
table{width:100%;border-collapse:collapse;background:var(--surface);border:1px solid var(--line);border-radius:12px;overflow:hidden;margin:12px 0;font-size:14px}
th,td{text-align:left;padding:9px 12px;border-bottom:1px solid var(--line);vertical-align:top}
th{font-size:12.5px;color:var(--muted);background:var(--soft);letter-spacing:.02em}
tr:last-child td{border-bottom:0}
.scroll{overflow-x:auto;background:var(--surface);border:1px solid var(--line);border-radius:14px;padding:10px;margin:14px 0}
.scroll svg{display:block;height:auto}
figure{margin:0}
figcaption{font-size:13px;color:var(--muted);margin:6px 4px 0}
.note{background:var(--surface);border:1px solid var(--line);border-left:4px solid var(--accent);border-radius:10px;padding:10px 14px;margin:14px 0}
.cols{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:14px;margin:12px 0}
.card{background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:12px 16px}
.card h3{margin:0 0 4px;font-size:16px}
.tag{display:inline-block;font:600 11.5px system-ui;padding:2px 8px;border-radius:999px;background:var(--soft);border:1px solid var(--line);color:var(--muted)}
.legend{display:flex;flex-wrap:wrap;gap:6px 22px;list-style:none;padding:0;margin:8px 0}
.legend li{display:flex;align-items:center;gap:8px;color:var(--muted);max-width:none}
.sw{width:14px;height:14px;border-radius:4px;display:inline-block}
/* svg */
svg text{font-family:system-ui,-apple-system,"Segoe UI",sans-serif}
.bx rect{fill:var(--surface);stroke:var(--line)}
.bx .hd{stroke:none}
.bx .t{fill:var(--ink);font:700 14px system-ui}
.bx .s{fill:var(--muted);font:12px system-ui}
.bx.ink .hd{fill:var(--c-ink)}.bx.blue .hd{fill:var(--c-blue)}.bx.green .hd{fill:var(--c-green)}.bx.red .hd{fill:var(--c-red)}
.bx.grey .hd{fill:var(--c-grey)}.bx.amber .hd{fill:var(--c-amber)}.bx.violet .hd{fill:var(--c-violet)}
.bx .ht{fill:#fff;font:700 13.5px system-ui}
.ar{fill:none;stroke:var(--muted);stroke-width:1.6}
.ar.red{stroke:var(--accent)}.ar.dash{stroke-dasharray:6 5}
.al{fill:var(--muted);font:600 11.5px system-ui;paint-order:stroke;stroke:var(--surface);stroke-width:5px}
#arrowhead path,#arrowred path{fill:var(--muted)}#arrowred path{fill:var(--accent)}
.sq-actor rect{fill:var(--c-ink);stroke:none}.sq-actor text{fill:#fff;font:700 13px system-ui}
.sq-life{stroke:var(--line);stroke-width:1.5;stroke-dasharray:4 4}
.sq-msg{stroke:var(--ink);stroke-width:1.5;fill:none}.sq-msg.back{stroke-dasharray:6 4;stroke:var(--muted)}
.sq-t{fill:var(--ink);font:12.5px system-ui}
.sq-n rect{fill:#FFF6D8;stroke:#E2C56A}.sq-n text{fill:#4A3B00;font:11.5px system-ui}
@media(prefers-color-scheme:dark){.sq-n rect{fill:#3A3320;stroke:#6B5A22}.sq-n text{fill:#F2E4B0}}
/* entity diagram */
.er-card .er-body{fill:var(--surface);stroke:var(--line)}
.er-card .er-head{fill:var(--c-ink)}.er-card.runtime .er-head{fill:var(--c-blue)}.er-card.live .er-head{fill:var(--c-green)}.er-card.write .er-head{fill:var(--c-grey)}
.er-card .er-zebra{fill:var(--soft)}
.er-title{fill:#fff;font:700 16px system-ui}.er-sql{fill:#fff;opacity:.78;font:11px system-ui}
.er-chip{fill:#fff;opacity:.85;font:600 11px system-ui;letter-spacing:.04em;text-transform:uppercase}
.er-fn{fill:var(--ink);font:13px ui-monospace,Menlo,Consolas,monospace}.er-fn.sub{fill:var(--muted)}.er-fn.pk{font-weight:700}
.er-ft{fill:var(--muted);font:11.5px system-ui}
.er-fn.ref,.er-ft.ref{fill:var(--accent);font-weight:600}
.er-edge{fill:none;stroke:var(--accent);stroke-width:1.6}.er-edge.dash{stroke-dasharray:6 5}
.er-elabel{fill:var(--accent);font:600 11.5px system-ui;paint-order:stroke;stroke:var(--surface);stroke-width:5px}
#er-arrow path{fill:var(--accent)}
@media(max-width:700px){table{display:block;overflow-x:auto}pre{max-width:calc(100vw - 48px)}}
@media(max-width:1000px){.layout{grid-template-columns:1fr}nav.toc{position:static;max-height:none;display:flex;flex-wrap:wrap;gap:4px 12px}nav.toc b{width:100%}h1{font-size:28px}}
`;

export const page = ({ title, lead, sections, other }) => {
  const toc = sections.map((s) => `<a href="#${s.id}">${esc(s.title)}</a>`).join('');
  const body = sections.map((s) => `<section id="${s.id}"><h2>${esc(s.title)}</h2>${s.html}</section>`).join('\n');
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title><style>${CSS}</style></head>
<body><div class="layout">
<nav class="toc" aria-label="Contents"><b>${esc(title)}</b>${toc}<div class="other"><b>See also</b>${other}</div></nav>
<main><h1>${esc(title)}</h1><p class="lead">${lead}</p>
${body}
</main></div></body></html>
`;
};

// ---------------------------------------------------------------- tables and text

export const table = (head, rows) =>
  `<table><thead><tr>${head.map((h) => `<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${rows
    .map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`)
    .join('')}</tbody></table>`;
export const code = (text) => `<pre><code>${esc(text)}</code></pre>`;
export const c = (s) => `<code>${esc(s)}</code>`;
export const fig = (svg, caption, minWidth) =>
  `<figure><div class="scroll"><div style="min-width:${minWidth ?? 0}px">${svg}</div></div>${caption ? `<figcaption>${caption}</figcaption>` : ''}</figure>`;

// ---------------------------------------------------------------- svg: boxes and arrows

const DEFS = `<defs>
<marker id="arrowhead" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z"/></marker>
<marker id="arrowred" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z"/></marker>
</defs>`;

/** A canvas. Add shapes with the returned `add`, read the finished markup with `end()`. */
export const canvas = (w, h) => {
  let body = '';
  return {
    add: (s) => (body += s),
    end: () => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" role="img">${DEFS}${body}</svg>`,
  };
};

/** A titled box: `tone` colours the header, `lines` are listed below it. */
export const box = (x, y, w, title, lines = [], tone = 'ink', minH = 0) => {
  const h = Math.max(minH, 36 + lines.length * 18 + (lines.length ? 8 : 0));
  return {
    h,
    svg: `<g class="bx ${tone}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10"/>` +
      `<path class="hd" d="M${x} ${y + 30} V${y + 10} a10 10 0 0 1 10 -10 H${x + w - 10} a10 10 0 0 1 10 10 V${y + 30} Z"/>` +
      `<text class="ht" x="${x + 12}" y="${y + 20}">${esc(title)}</text>` +
      lines.map((l, i) => `<text class="s" x="${x + 12}" y="${y + 52 + i * 18}">${esc(l)}</text>`).join('') +
      '</g>',
  };
};

export const arrow = (d, label, lx, ly, kind = '') =>
  `<path class="ar ${kind}" d="${d}" marker-end="url(#${kind.includes('red') ? 'arrowred' : 'arrowhead'})"/>` +
  (label ? `<text class="al" x="${lx}" y="${ly}" text-anchor="middle">${esc(label)}</text>` : '');

// ---------------------------------------------------------------- svg: sequence diagrams

/**
 * actors: ['Browser', ...]. steps: { from, to, text, back?, note? } or { note, at } (a note under an actor).
 * Arrows go from the actor index `from` to `to`; `back` draws a dashed return.
 */
export const sequence = (actors, steps, { col = 200 } = {}) => {
  const left = 90, top = 56, row = 46;
  const w = left * 2 + col * (actors.length - 1);
  const rows = steps.length;
  const h = top + rows * row + 40;
  const cv = canvas(w, h);
  const cx = (i) => left + i * col;
  actors.forEach((a, i) => {
    cv.add(`<g class="sq-actor"><rect x="${cx(i) - 70}" y="8" width="140" height="30" rx="8"/><text x="${cx(i)}" y="28" text-anchor="middle">${esc(a)}</text></g>`);
    cv.add(`<line class="sq-life" x1="${cx(i)}" y1="40" x2="${cx(i)}" y2="${h - 16}"/>`);
  });
  steps.forEach((s, k) => {
    const y = top + k * row + 14;
    if (s.note !== undefined && s.from === undefined) {
      const x = cx(s.at ?? 0);
      const tw = Math.min(col * 2 - 20, s.note.length * 6.4 + 20);
      const nx = Math.max(8, Math.min(x - tw / 2, w - tw - 8));
      cv.add(`<g class="sq-n"><rect x="${nx}" y="${y - 12}" width="${tw}" height="26" rx="6"/><text x="${nx + tw / 2}" y="${y + 5}" text-anchor="middle">${esc(s.note)}</text></g>`);
      return;
    }
    const x1 = cx(s.from), x2 = cx(s.to);
    if (s.from === s.to) {
      cv.add(`<path class="sq-msg" d="M${x1} ${y - 8} h46 v18 h-46" marker-end="url(#arrowhead)"/><text class="sq-t" x="${x1 + 54}" y="${y + 5}">${esc(s.text)}</text>`);
      return;
    }
    cv.add(`<path class="sq-msg ${s.back ? 'back' : ''}" d="M${x1} ${y + 8} H${x2}" marker-end="url(#arrowhead)"/>`);
    cv.add(`<text class="sq-t" x="${(x1 + x2) / 2}" y="${y - 2}" text-anchor="middle">${esc(s.text)}</text>`);
  });
  return cv.end();
};
