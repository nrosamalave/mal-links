// What every look shares. Three see-through layers, none of which ever takes a tap:
//   #scene  the picture behind the page, in big pixels (each one 2 x 2 on screen), laid out from where the name and
//           the social icons sit;
//   #skyfx, #front  full-sharpness layers fixed to the screen, one behind the page and one in front of it (weather);
//   #trim   a layer inside the page over the name and the cards, for things that sit on them (drips, snow, leaves).
//           It scrolls with the page in one piece; everything on it is measured from its own corner.
export const P = 2;
export const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
export const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
export const $ = (q) => document.querySelector(q);
export const rnd = (a, b) => a + Math.random() * (b - a);
export const pick = (list) => list[Math.floor(Math.random() * list.length)];
export const dither = (x, y, f) => BAYER[(y & 3) * 4 + (x & 3)] / 16 < f;  // true for a share f of the pixels, evenly spread
export const rgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));

export const seeded = (seed) => () => {  // the same hills and trees every time the screen changes size
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
export const layer = (w, h, draw) => {
  const c = Object.assign(document.createElement("canvas"), { width: w, height: h });
  draw(c.getContext("2d"));
  return c;
};
export const art = (rows, colors) => layer(rows[0].length, rows.length, (x) => rows.forEach((row, y) => [...row].forEach((ch, i) => {
  if (colors[ch]) { x.fillStyle = colors[ch]; x.fillRect(i, y, 1, 1); }
})));
export const line = (x0, y0, x1, y1, dot) => {
  const n = Math.max(1, Math.round(Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0))));
  for (let i = 0; i <= n; i++) dot(Math.round(x0 + ((x1 - x0) * i) / n), Math.round(y0 + ((y1 - y0) * i) / n));
};

// A sky in bands of color from the top down to y = bottom, each band edge mixed with an ordered dither
export function sky(x, W, H, colors, bottom) {
  const C = colors.map(rgb), img = x.createImageData(W, H), d = img.data;
  for (let y = 0; y < H; y++) {
    const k = Math.min(1, Math.max(0, y / bottom)) * (C.length - 1), i = Math.min(C.length - 2, Math.floor(k)), f = k - i;
    for (let px = 0; px < W; px++) {
      const c = C[i + (dither(px, y, f) ? 1 : 0)], o = (y * W + px) * 4;
      d[o] = c[0]; d[o + 1] = c[1]; d[o + 2] = c[2]; d[o + 3] = 255;
    }
  }
  x.putImageData(img, 0, 0);
}

// One animation loop for every layer; nothing runs for reduced motion or while the page is hidden.
const ticks = [];
let last = 0;
export function tick(fn) {
  if (still) return;
  if (!ticks.length) requestAnimationFrame(function loop(t) {
    const dt = Math.min(0.05, (t - (last || t)) / 1000);
    last = t;
    for (const f of ticks) f(t, dt);
    requestAnimationFrame(loop);
  });
  ticks.push(fn);
}
// Now and then, a little randomly: every min to max seconds, the first after `first`
export function every(fn, min, max, first) {
  if (still) return;
  const go = () => { if (!document.hidden) fn(); setTimeout(go, rnd(min, max) * 1000); };
  setTimeout(go, first * 1000);
}
// Things passing through (a flock, a gust): each draws itself every frame and says whether it's still going
export const steps = () => {
  let list = [];
  return { add: (s) => list.push(s), run: (...a) => { list = list.filter((s) => s(...a)); }, get size() { return list.length; } };
};

// The picture behind the page. Sized to the tallest the screen gets (lvh), so it holds still when a phone's toolbar
// slides away; laid out again only when the size really changes. build(g, W, H, spot) lays it out and returns the
// function that draws a frame. spot: cx (the middle), name (the name's middle) and ground (the horizon, at the icons).
export function scene(build) {
  const cv = $("#scene"), g = cv.getContext("2d");
  let W = 0, H = 0, draw = () => {};
  function fit() {
    W = Math.ceil(cv.clientWidth / P); H = Math.ceil(cv.clientHeight / P);
    if (!W || !H) return;  // not on screen yet
    cv.width = W; cv.height = H;
    g.imageSmoothingEnabled = false;
    const top = (el) => el.getBoundingClientRect().top + scrollY, name = $("h1"), icons = $(".socials");
    draw = build(g, W, H, {
      cx: Math.round(W / 2),
      name: Math.round((top(name) + name.offsetHeight * 0.35) / P),
      ground: Math.min(H - 30, Math.round((top(icons) + icons.offsetHeight * 0.55) / P)),
    });
    draw(performance.now(), 0);
  }
  let resizing;
  addEventListener("resize", () => {
    clearTimeout(resizing);
    resizing = setTimeout(() => { if (Math.ceil(cv.clientWidth / P) !== W || Math.ceil(cv.clientHeight / P) !== H) fit(); }, 150);
  });
  fit();
  document.fonts?.ready.then(fit);
  tick((t, dt) => draw(t, dt));
}

// A full-sharpness layer fixed to the screen (#skyfx behind the page, #front in front of it); S.W and S.H in CSS px
export function screen(id) {
  const cv = $(id), g = cv.getContext("2d"), S = { g, W: 0, H: 0 };
  cv.style.display = "block";
  const fit = () => {
    if (S.W === cv.clientWidth && S.H === cv.clientHeight) return;
    const d = Math.min(2, devicePixelRatio || 1);
    S.W = cv.clientWidth; S.H = cv.clientHeight;
    cv.width = Math.round(S.W * d); cv.height = Math.round(S.H * d);
    g.setTransform(d, 0, 0, d, 0, 0);
    g.imageSmoothingEnabled = false;
  };
  fit();
  addEventListener("resize", fit);
  return S;
}

// The layer inside the page, from just above the name to just below `to`. look.fit(T) runs on every reflow (fonts, the
// LIVE banner, rotating) and look.frame(T, t, dt) draws a frame; T.box(q) is where an element is on this layer.
export function trim(to, look) {
  const cv = $("#trim"), wrap = cv.parentElement;
  const T = { g: cv.getContext("2d"), W: 0, H: 0, x: 0, y: 0 };
  T.local = (r) => ({ left: r.left - T.x, right: r.right - T.x, top: r.top - T.y, bottom: r.bottom - T.y, width: r.width, height: r.height });
  T.box = (q) => T.local((q.nodeType ? q : $(q)).getBoundingClientRect());
  const corner = () => { const c = cv.getBoundingClientRect(); T.x = c.left; T.y = c.top; };
  function fit() {
    const w = wrap.getBoundingClientRect(), name = $("h1").getBoundingClientRect(), end = $(to).getBoundingClientRect();
    const d = Math.min(2, devicePixelRatio || 1);
    T.W = Math.ceil(w.width); T.H = Math.ceil(end.bottom - name.top + 50);
    Object.assign(cv.style, { display: "block", top: Math.floor(name.top - w.top - 10) + "px", width: T.W + "px", height: T.H + "px" });
    cv.width = Math.round(T.W * d); cv.height = Math.round(T.H * d);
    T.g.setTransform(d, 0, 0, d, 0, 0);
    corner();
    look.fit?.(T);
    if (still) frame(0, 0);
  }
  function frame(t, dt) {
    if (!T.W) return;  // not laid out yet
    corner();
    T.g.clearRect(0, 0, T.W, T.H);
    look.frame(T, t, dt);
  }
  new ResizeObserver(fit).observe(wrap);
  document.fonts?.ready.then(fit);
  tick(frame);
  return T;
}

// Where a line of text's letters sit, found by drawing it in its own font: for each column of the element's text, the
// highest and lowest inked pixel, in screen px (add T.local to get them on the trim). Snow sits on the tops, drips
// hang from the bottoms.
export function inked(el) {
  const cs = getComputedStyle(el), size = parseFloat(cs.fontSize);
  const text = cs.textTransform === "uppercase" ? el.textContent.trim().toUpperCase() : el.textContent.trim();
  const font = `${cs.fontWeight} ${size}px ${cs.fontFamily}`;
  const c = document.createElement("canvas"), x = c.getContext("2d");
  x.font = font;
  const m = x.measureText(text), base = m.fontBoundingBoxAscent;
  if (!base) return null;
  c.width = Math.ceil(m.width + 4); c.height = Math.ceil(base + m.fontBoundingBoxDescent + 4);
  x.font = font;
  x.letterSpacing = cs.letterSpacing === "normal" ? "0px" : cs.letterSpacing;
  x.fillText(text, 0, base);
  const px = x.getImageData(0, 0, c.width, c.height).data, top = [], bottom = [];
  for (let col = 0; col < c.width; col++) {
    let hi = -1, lo = -1;
    for (let row = 0; row < c.height; row++) if (px[(row * c.width + col) * 4 + 3] > 140) { if (hi < 0) hi = row; lo = row; }
    top.push(hi); bottom.push(lo);
  }
  const range = document.createRange();
  range.selectNodeContents(el);
  const r = range.getBoundingClientRect();
  return { left: r.left, top: r.top, base, size, tops: top, bottoms: bottom };
}

// Liquid and ice look round: dark at the sides, a highlight just left of the middle
export function across(g, p, x0, x1) {
  const s = g.createLinearGradient(x0, 0, x1, 0);
  s.addColorStop(0, p.dark); s.addColorStop(0.3, p.base); s.addColorStop(0.42, p.light); s.addColorStop(0.56, p.base); s.addColorStop(1, p.dark);
  return s;
}
export function gloss(g, x, y, r) {  // the shine on a bead, and a soft reflection low on it
  g.fillStyle = "rgba(255, 255, 255, 0.6)";
  g.beginPath(); g.ellipse(x - r * 0.34, y - r * 0.32, r * 0.2, r * 0.34, -0.35, 0, Math.PI * 2); g.fill();
  g.fillStyle = "rgba(255, 255, 255, 0.22)";
  g.beginPath(); g.ellipse(x + r * 0.28, y + r * 0.45, r * 0.26, r * 0.12, 0.3, 0, Math.PI * 2); g.fill();
}
export function shade(g, on) {  // a soft drop shadow under what's drawn next
  g.shadowColor = on ? "rgba(0, 0, 0, 0.45)" : "transparent"; g.shadowBlur = on ? 3 : 0; g.shadowOffsetY = on ? 1.5 : 0;
}
