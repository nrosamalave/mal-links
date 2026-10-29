// Spring: a fresh morning. Blue sky with fat drifting clouds and a soft sun, green hills dotted with flowers, a
// cherry tree in full blossom, a farm windmill turning. Now and then a shower drifts over and leaves a rainbow behind the
// name; butterflies and birds; a hot-air balloon drifting over; a bunny that hops out onto the meadow to nibble; petals
// blow down in front of the page and some settle on the cards. On the page: sprigs of blossom on the corners of the
// cards and a few flowers on the name, two bees buzzing between them, and now and then a ladybug crawling on a card.
import { $, P, art, dither, every, inked, layer, pick, rnd, scene, screen, seeded, shade, sky, steps, still, tick, trim } from "./kit.js";

const PETAL = [["pp.", "ppd"], [".p.", "pdp"], ["p..", ".pd"], ["pp", "dp"]];
const PETALS = [["#ffc4dc", "#f08ab5"], ["#ffe3ef", "#f4a6c8"], ["#ffb0d0", "#e0709e"]].map(([p, d]) => PETAL.map((rows) => art(rows, { p, d })));
const BUTTERFLY = (c, d) => [["#.#", "#d#", ".d."], ["...", "#d#", "#d#"]].map((rows) => art(rows, { "#": c, d }));
const BUTTERFLIES = [BUTTERFLY("#ffd84d", "#3a2a10"), BUTTERFLY("#7fd8ff", "#1a2a40"), BUTTERFLY("#ffffff", "#3a3a4a")];
const BIRD = [["#...#", ".#.#.", "..#.."], [".....", "#####", "..#.."]].map((rows) => art(rows, { "#": "#2a3a5c" }));
const BLOSSOM = ["#fff0f6", "#ffc4dc", "#f08ab5", "#c45a8a"];
const BALLOON = layer(15, 23, (b) => {  // stripes round the envelope, lit from the upper left; ropes down to a wicker basket
  const STRIPES = [["#ff9a9a", "#ff5a5a", "#c03a4a"], ["#fff0a0", "#ffd84d", "#d0a030"], ["#a0dcff", "#4aa8ff", "#2a70c0"], ["#ffc4e0", "#ff7eb6", "#c04a88"]];
  for (let y = 0; y <= 16; y++) {
    const hw = y <= 8 ? 7 * Math.sqrt(1 - ((8 - y) / 8.4) ** 2) : 7 * (1 - ((y - 8) / 9.5) ** 1.4);
    for (let x = -7; x <= 7; x++) {
      if (Math.abs(x) > hw + 0.3) continue;
      const u = x / Math.max(1, hw), stripe = STRIPES[Math.max(0, Math.min(4, Math.floor((u + 1) * 2.5))) % 4];
      b.fillStyle = stripe[u < -0.4 && y < 10 ? 0 : u > 0.5 || y > 13 ? 2 : 1];
      b.fillRect(x + 7, y, 1, 1);
    }
  }
  b.fillStyle = "#5a4a4a";
  for (let y = 17; y < 20; y++) { b.fillRect(5, y, 1, 1); b.fillRect(9, y, 1, 1); }
  b.fillStyle = "#8a5a2a"; b.fillRect(5, 20, 5, 3);
  b.fillStyle = "#c08a4a"; b.fillRect(5, 20, 5, 1);
});
const BN = { w: "#efe6d8", W: "#ffffff", p: "#ffb0c0", e: "#efe6d8", k: "#2a1a1a", n: "#ff8aa0" };
const BUNNY = {  // facing right
  sit: art(["....pe..", "....pe..", "...wwww.", ".wwwwkwn", "wwwwwww.", "Wwwwww..", ".ww.ww.."], BN),
  twitch: art(["...pe...", "....pe..", "...wwww.", ".wwwwkwn", "wwwwwww.", "Wwwwww..", ".ww.ww.."], BN),
  hop: art([".....pe.", "....pe..", "..wwwww.", "wwwwwkwn", "Wwwwwww.", ".www....", "w....ww."], BN),
};
const BEE = [[".w.w.", "ykyky", ".yky."], ["..w..", "ykyky", ".yky."]].map((rows) => art(rows, { w: "#ffffffc0", y: "#ffd23f", k: "#2a1a10" }));
const LB = { k: "#1a1014", r: "#e8303a", R: "#ff8a7a", g: "#dfe6f2" };
const LADYBUG = {  // seen from above, crawling right, legs going
  crawl: [["..k.k..", ".rrrr..", "rRrkrk.", "rkrrrkk", "rrrkrk.", ".rrrr..", ".k.k..."], [".k.k...", ".rrrr..", "rRrkrk.", "rkrrrkk", "rrrkrk.", ".rrrr..", "..k.k.."]].map((rows) => art(rows, LB)),
  fly: art(["g.....g", ".gg.gg.", "..rrr..", ".rRrkkk", "..rrr..", ".gg.gg.", "g.....g"], LB),
};

let g, W = 0, H = 0, S = null;
const behind = steps(), over = steps();

function build(spot) {
  const r = seeded(320);
  const { cx, ground } = spot;
  const hump = (x, c, w, h) => h * Math.exp(-(((x - c) / w) ** 2));
  const tx = Math.round(Math.max(12, W * 0.08)), wx = Math.round(W - Math.max(18, W * 0.1));  // the cherry tree, the windmill
  const far = (x) => Math.round(ground - 8 - 4 * Math.sin(x * 0.035 + 2) - 2 * Math.sin(x * 0.09));
  const ridge = (x) => Math.round(ground - 2.5 * Math.sin(x * 0.04 + 0.3) - 1.5 * Math.sin(x * 0.11 + 1) - hump(x, tx, 22, 5) - hump(x, wx, 18, 4));
  const sun = { x: Math.round(Math.max(22, W * 0.16)), y: Math.round(Math.max(16, spot.name * 0.45)), R: Math.round(Math.min(12, W * 0.06)) };
  const icons = $(".socials").getBoundingClientRect();
  S = { ground, ridge, cx, sun, rainbow: 0, icons: [icons.left / P, icons.right / P] };

  S.back = layer(W, H, (b) => {
    sky(b, W, H, ["#1f3f7a", "#27508f", "#3062a3", "#3c75b5", "#5089c4", "#6aa0d2", "#8bb9e0", "#b3d3ec", "#d9eaf4"], ground);
    const glow = b.createRadialGradient(sun.x, sun.y, sun.R, sun.x, sun.y, sun.R * 6);
    glow.addColorStop(0, "rgba(255, 250, 220, 0.5)"); glow.addColorStop(1, "rgba(255, 250, 220, 0)");
    b.fillStyle = glow; b.fillRect(0, 0, W, ground);
    for (let y = -sun.R; y <= sun.R; y++) for (let x = -sun.R; x <= sun.R; x++) {
      const d = Math.hypot(x, y) / sun.R;
      if (d > 1) continue;
      b.fillStyle = d < 0.7 || dither(x, y, (0.85 - d) / 0.15) ? "#fffbe6" : "#ffe9a8";
      b.fillRect(sun.x + x, sun.y + y, 1, 1);
    }
  });
  S.arc = { x: cx, y: ground + 6, R: Math.round(Math.min(W * 0.42, 120)) };

  S.clouds = Array.from({ length: Math.max(3, Math.round(W / 60)) }, (_, i) => ({ img: cloud(r, 18 + r() * 22, 7 + r() * 5), x: r() * (W + 80) - 40, y: 6 + (i % 3) * ground * 0.16 + r() * 10, v: 1.5 + r() * 2.5 }));

  S.front = layer(W, H, (f) => {
    for (let x = 0; x < W; x++) {  // far hills, misty blue-green
      const y = far(x);
      f.fillStyle = "#7fb8a0"; f.fillRect(x, y, 1, 1);
      f.fillStyle = "#5e9a86"; f.fillRect(x, y + 1, 1, ground + 8 - y);
    }
    for (let x = 0; x < W; x += Math.round(6 + r() * 10)) {  // trees on the far hills
      const y = far(x), s = 2 + Math.floor(r() * 2);
      f.fillStyle = "#4c8670";
      for (let dy = -s; dy <= s; dy++) f.fillRect(x - Math.round(Math.sqrt(s * s - dy * dy)), y - s + dy - 1, Math.round(Math.sqrt(s * s - dy * dy)) * 2 + 1, 1);
    }
    for (let x = 0; x < W; x++) {  // the green hill and the meadow below it
      const y = ridge(x);
      for (let yy = y; yy < H; yy++) {
        const k = (yy - y) / Math.max(1, H - y), band = Math.sin(yy * 0.2 + 2.5 * Math.sin(x * 0.011) + Math.sin(x * 0.037));
        f.fillStyle = yy - y < 1 ? "#b6ec7a" : yy - y < 3 ? "#7fcf52" : band > 0.9 ? "#3f8c3a" : dither(x, yy, k * 1.3) ? "#1f5a32" : "#2f7a3c";
        f.fillRect(x, yy, 1, 1);
      }
      if (r() < 0.4) { f.fillStyle = "#9ddf66"; f.fillRect(x, y - 1, 1, 1); }  // tufts of grass on the skyline
    }
    for (let i = 0, n = Math.round((W * (H - ground)) / 70); i < n; i++) {  // wildflowers, bigger up close
      const x = Math.floor(r() * W), y = Math.round(ridge(x) + 2 + r() ** 0.8 * (H - ground)), big = y > ground + 30 && r() < 0.5;
      f.fillStyle = pick(["#ffd84d", "#ff8fc0", "#ffffff", "#b58cff", "#ff6a6a"]);
      if (big) { f.fillRect(x - 1, y, 3, 1); f.fillRect(x, y - 1, 1, 3); f.fillStyle = "#ffe98a"; }
      f.fillRect(x, y, 1, 1);
    }
    blossomTree(f, tx, ridge(tx) + 1, Math.max(40, Math.min(66, W * 0.25)), r);
    if (W > 300) blossomTree(f, Math.round(cx + Math.min(W * 0.36, 200)), far(Math.round(cx + Math.min(W * 0.36, 200))) + 2, 18, r);
    S.mill = windmill(f, wx, ridge(wx) + 1);
    if (W > 420) for (const x of [cx - 260, cx + 260]) blossomTree(f, x, Math.round(ground + (H - ground) * 0.6), 70 + r() * 16, r);
  });
}

function cloud(r, w, h) {  // a fat cumulus: round tops lit white, a flatter shaded bottom
  w = Math.round(w); h = Math.round(h);
  const n = Math.round(w / 6) + 2, puffs = Array.from({ length: n }, (_, i) => ({ x: (w * (i + 0.5)) / n, y: h * (0.45 + r() * 0.2), r: h * (0.35 + r() * 0.3) }));
  return layer(w + 4, h + 2, (c) => {
    for (let y = 0; y <= h; y++) for (let x = 0; x < w + 4; x++) {
      let inside = null;
      for (const p of puffs) if (Math.hypot(x - 2 - p.x, (y - p.y) * 1.15) < p.r) { inside = p; break; }
      if (!inside || y > h - 1) continue;
      const lit = (x - 2 - inside.x) * -0.4 + (y - inside.y) * -1;
      c.fillStyle = y > h * 0.75 ? "#b7cce6" : lit > inside.r * 0.3 ? "#ffffff" : lit > -inside.r * 0.2 || dither(x, y, 0.5) ? "#eef4fb" : "#cddcef";
      c.fillRect(x, y, 1, 1);
    }
  });
}

function blossomTree(f, x, base, h, r) {  // a dark twisting trunk and a cloud of pink blossom
  f.fillStyle = "#3a2228";
  const tw = h > 30 ? 3 : 1, C = { x: x + (r() - 0.5) * 4, y: base - h * 0.62 }, rx = h * 0.46, ry = h * 0.32;
  for (let y = base; y > C.y; y--) f.fillRect(Math.round(x + Math.sin((base - y) * 0.15) * 1.5 - tw / 2), y, tw, 1);
  if (h > 30) for (const d of [-1, 1]) for (let i = 0; i < h * 0.32; i++) f.fillRect(Math.round(x + d * i * 0.8), Math.round(base - h * 0.4 - i * 0.55), 2, 1);
  const clumps = [{ x: C.x, y: C.y, r: ry * 0.8 }, ...Array.from({ length: Math.round(h / 3) }, () => {
    const a = r() * Math.PI * 2, d = 0.4 + r() * 0.55;
    return { x: C.x + Math.cos(a) * rx * d, y: C.y + Math.sin(a) * ry * d, r: h * (0.09 + r() * 0.08) };
  })];
  for (let py = Math.floor(C.y - ry * 1.5); py <= C.y + ry * 1.5; py++) for (let px = Math.floor(C.x - rx * 1.3); px <= C.x + rx * 1.3; px++) {
    let best = null, depth = 0;
    for (const b of clumps) { const d = b.r - Math.hypot(px - b.x, py - b.y); if (d > depth) { depth = d; best = b; } }
    if (!best || (depth < 1 && r() < 0.45)) continue;
    const light = -0.45 * ((px - C.x) / rx) - 0.6 * ((py - C.y) / ry) - 0.35 * ((py - best.y) / best.r) + (r() - 0.5) * 0.5;  // the sun's up and to the left
    f.fillStyle = BLOSSOM[light > 0.6 ? 0 : light > 0.05 ? 1 : light > -0.45 ? 2 : 3];
    f.fillRect(px, py, 1, 1);
  }
  for (let i = 0; i < h * 0.6; i++) {  // fallen petals around its foot
    f.fillStyle = r() < 0.5 ? "#ffc4dc" : "#f4a6c8";
    f.fillRect(Math.round(x + (r() - 0.5) * h * 1.1), Math.round(base + r() * 5), 1, 1);
  }
}

function windmill(f, x, base) {  // a farm windmill: a lattice tower; its wheel and tail turn in the frame
  f.fillStyle = "#5a6474";
  const h = 24;
  for (let y = 0; y < h; y++) { const spread = Math.round(4 * (1 - y / h)); f.fillRect(x - spread - 1, base - y, 1, 1); f.fillRect(x + spread + 1, base - y, 1, 1); }
  for (let y = 4; y < h; y += 5) { const spread = Math.round(4 * (1 - y / h)); f.fillRect(x - spread, base - y, spread * 2 + 1, 1); }
  return { x, y: base - h - 1, R: 7 };
}

function drawMill(t) {
  const { x, y, R } = S.mill, turn = t / 900;
  g.fillStyle = "#3e4656"; g.fillRect(x, y - 1, 9, 1); g.fillRect(x + 7, y - 3, 3, 4);  // the tail vane
  g.fillStyle = "#cfd7e2";
  for (let i = 0; i < 12; i++) {
    const a = turn + (i / 12) * Math.PI * 2;
    for (let d = 2; d <= R; d++) g.fillRect(Math.round(x + Math.cos(a) * d), Math.round(y + Math.sin(a) * d), 1, 1);
  }
  g.fillStyle = "#e8584a"; g.fillRect(x - 1, y - 1, 3, 3);
}

function shower() {  // a grey cloud drifts over trailing rain; the rainbow comes out after it
  const dir = Math.random() < 0.5 ? 1 : -1, img = cloud(seeded(Math.floor(Math.random() * 1e6)), 40, 12), speed = rnd(16, 22), y = rnd(8, S.ground * 0.3);
  const c = img.getContext("2d");
  c.globalCompositeOperation = "source-atop"; c.fillStyle = "rgba(80, 92, 116, 0.5)"; c.fillRect(0, 0, img.width, img.height);
  const drops = [];
  let t0 = null, last = null;
  return (t) => {
    t0 ??= t;
    const dt = Math.min(50, t - (last ?? t)) / 1000, x = (dir > 0 ? -50 : W + 10) + dir * speed * ((t - t0) / 1000);
    last = t;
    g.drawImage(img, Math.round(x), Math.round(y));
    const going = dir > 0 ? x < W + 10 : x > -50;
    if (going) for (let k = 0; k < 2; k++) drops.push({ x: x + rnd(4, 40), y: y + 10, v: rnd(70, 95) });
    g.fillStyle = "rgba(200, 220, 245, 0.55)";
    for (const d of drops) { d.y += d.v * dt; d.x -= dir * 4 * dt; g.fillRect(Math.round(d.x), Math.round(d.y), 1, 2); }
    for (let i = drops.length - 1; i >= 0; i--) if (drops[i].y > S.ridge(Math.round(drops[i].x))) drops.splice(i, 1);
    if (!going && !drops.length) { S.rainbowAt = t; return false; }
    return true;
  };
}

function frame(t, dt) {
  g.drawImage(S.back, 0, 0);
  const since = (t - (S.rainbowAt ?? -1e9)) / 1000, bow = Math.max(0, Math.min(1, since / 2.5, (14 - since) / 3));
  if (bow > 0) {  // the rainbow, faint and wide, behind the name
    const { x, y, R } = S.arc;
    ["#ff5a5a", "#ff9a3a", "#ffe04a", "#6ad86a", "#4aa8ff", "#6a6aff", "#b06aff"].forEach((c, i) => {
      g.globalAlpha = 0.32 * bow;
      g.strokeStyle = c; g.lineWidth = 2;
      g.beginPath(); g.arc(x, y, R - i * 2, Math.PI, 0); g.stroke();
    });
    g.globalAlpha = 1;
  }
  for (const c of S.clouds) {
    c.x += c.v * dt;
    if (c.x > W + 10) c.x = -c.img.width - 10;
    g.drawImage(c.img, Math.round(c.x), Math.round(c.y));
  }
  behind.run(t);
  g.drawImage(S.front, 0, 0);
  drawMill(t);
  over.run(t);
}

function birds() {
  const dir = Math.random() < 0.5 ? 1 : -1, n = 2 + Math.floor(Math.random() * 3), y = rnd(10, S.ground * 0.6), speed = rnd(26, 36);
  const flock = Array.from({ length: n }, (_, i) => ({ dx: -i * rnd(8, 14), dy: rnd(-6, 6), phase: Math.random() * 300 }));
  let t0 = null;
  return (t) => {
    t0 ??= t;
    const lead = (dir > 0 ? -8 : W + 8) + dir * speed * ((t - t0) / 1000);
    for (const b of flock) g.drawImage(BIRD[Math.floor((t + b.phase) / 160) % 2], Math.round(lead + dir * b.dx), Math.round(y + b.dy + 2 * Math.sin((t + b.phase) / 400)));
    return dir > 0 ? lead - 60 < W : lead + 60 > 0;
  };
}

function butterfly() {  // flutters along low over the meadow beside the page
  const left = Math.random() < 0.5, img = pick(BUTTERFLIES);
  const x0 = left ? rnd(2, Math.max(6, S.cx - 112)) : rnd(Math.min(W - 6, S.cx + 112), W - 2), y0 = S.ridge(Math.round(x0)) + rnd(-14, 8), life = rnd(8, 14);
  let t0 = null;
  return (t) => {
    t0 ??= t;
    const e = (t - t0) / 1000;
    const x = x0 + 10 * Math.sin(e * 0.7) + 4 * Math.sin(e * 2.3), y = y0 + 6 * Math.sin(e * 1.1) + 2 * Math.sin(e * 5);
    g.globalAlpha = Math.min(1, e, life - e);
    g.drawImage(img[Math.floor(t / 110) % 2], Math.round(x), Math.round(y));
    g.globalAlpha = 1;
    return e < life;
  };
}

function balloon() {  // drifts slowly across high up, rising a little, its burner flaring now and then
  const dir = Math.random() < 0.5 ? 1 : -1, speed = rnd(3.5, 5), y0 = rnd(S.ground * 0.12, S.ground * 0.3);
  let t0 = null;
  return (t) => {
    t0 ??= t;
    const e = (t - t0) / 1000, x = Math.round((dir > 0 ? -16 : W + 1) + dir * speed * e), y = Math.round(y0 - 0.25 * e + 2 * Math.sin(e / 2.3));
    g.drawImage(BALLOON, x, y);
    if (Math.sin(e * 0.9) > 0.8) { g.fillStyle = Math.floor(t / 90) % 2 ? "#ffd84d" : "#ff9a3a"; g.fillRect(x + 6, y + 17, 3, 2); }
    return dir > 0 ? x < W + 1 : x > -16;
  };
}

function bunny() {  // hops out from the side onto the meadow, sits to nibble with an ear twitching, turns and hops back
  const [l, r] = S.icons, sides = [-1, 1].filter((s) => (s < 0 ? l : W - r) >= 30), from = sides.length ? pick(sides) : l > W - r ? -1 : 1;
  const room = (from < 0 ? l : W - r) - 14;  // stays clear of the icons
  const n = Math.max(2, Math.round(Math.min(room, rnd(18, 34)) / 7)), x0 = from < 0 ? -9 : W + 1, stay = rnd(3, 5), trip = n * 0.5;
  let t0 = null;
  return (t) => {
    t0 ??= t;
    const e = (t - t0) / 1000;
    let k, face = -from, img = BUNNY.sit, up = 0;
    if (e < trip) k = e;
    else if (e < trip + stay) { k = trip; if (Math.sin(e * 6) > 0.8) img = BUNNY.twitch; }
    else { k = 2 * trip + stay - e; face = from; if (k < 0) return false; }
    const i = Math.floor(k / 0.5), q = Math.min(1, (k - i * 0.5) / 0.36);
    if (e < trip || e > trip + stay) { up = 4 * Math.sin(Math.PI * q); if (q < 1) img = BUNNY.hop; }
    const x = x0 - from * 7 * (i + q), feet = S.ridge(Math.round(x + 4)) + 10;
    g.save();
    g.translate(Math.round(x), Math.round(feet - 7 - up));
    if (face < 0) { g.scale(-1, 1); g.translate(-8, 0); }
    g.drawImage(img, 0, 0);
    g.restore();
    return true;
  };
}

scene((ctx, w, h, spot) => { g = ctx; W = w; H = h; build(spot); return frame; });
every(() => behind.add(birds()), 9, 16, 2);
every(() => over.add(butterfly()), 5, 9, 1);
every(() => behind.add(shower()), 38, 55, 2);
every(() => behind.add(balloon()), 60, 90, 3);
let hopping = false;
every(() => { if (!hopping) { hopping = true; const b = bunny(); over.add((t) => b(t) || (hopping = false)); } }, 14, 24, 5);

// Petals in front of the page, blowing down and across
if (!still) {
  const F = screen("#front");
  const petal = (o) => ({ c: pick(PETALS), s: Math.random() < 0.3 ? 3 : 2, phase: rnd(0, 6), spin: rnd(120, 220), vy: rnd(16, 30), vx: rnd(8, 22), ...o });
  const petals = Array.from({ length: Math.round(Math.min(16, F.W / 26)) }, () => petal({ x: rnd(0, F.W), y: rnd(-F.H, F.H) }));
  tick((t, dt) => {
    const { g: c, W: w, H: h } = F;
    c.clearRect(0, 0, w, h);
    for (const p of petals) {
      p.y += p.vy * dt;
      p.x += p.vx * dt + Math.cos(t / 800 + p.phase) * 18 * dt;
      if (p.y > h + 10 || p.x > w + 20) Object.assign(p, petal({ x: rnd(-60, w), y: -10 }));
      const img = p.c[Math.floor((t + p.phase * 100) / p.spin) % 4];
      c.drawImage(img, Math.round(p.x), Math.round(p.y), img.width * p.s, img.height * p.s);
    }
  });
}

// On the page: sprigs of blossom on card corners, flowers on the name, and petals that land on the cards and blow away;
// two bees going from flower to flower, and now and then a ladybug
{
  let T = null, deco = null, landing = [], blooms = [], bug = null;
  const bees = [0, 1].map((i) => ({ x: 0, y: 0, at: i, next: 0, phase: i * 2.4 }));
  function flower(d, x, y, r, color) {  // five round petals and a yellow middle
    blooms.push({ x, y });
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
      d.beginPath(); d.arc(x + Math.cos(a) * r * 0.62, y + Math.sin(a) * r * 0.62, r * 0.5, 0, Math.PI * 2);
      d.fillStyle = color; d.fill();
    }
    d.fillStyle = "#ffe066"; d.beginPath(); d.arc(x, y, r * 0.28, 0, Math.PI * 2); d.fill();
  }
  function sprig(d, x, y, dir, len) {  // a twig over a corner: leaves and a few blossoms along it
    d.strokeStyle = "#4a2a30"; d.lineWidth = 2.2; d.lineCap = "round";
    d.beginPath(); d.moveTo(x, y); d.quadraticCurveTo(x + dir * len * 0.5, y - 9, x + dir * len, y - 2); d.stroke();
    const at = (k) => [x + dir * len * k, y - 9 * 2 * k * (1 - k) * 0.9 - 2 * k];
    shade(d, true);
    for (const k of [0.3, 0.62, 0.9]) {
      const [px, py] = at(k);
      d.fillStyle = "#5cc45a";
      d.beginPath(); d.ellipse(px + dir * 3, py + 4, 4, 2, dir * 0.6, 0, Math.PI * 2); d.fill();
    }
    for (const [k, r, c] of [[0.15, 5, "#ffc4dc"], [0.45, 6, "#ffe3ef"], [0.75, 5, "#ffb0d0"], [1, 4, "#ffc4dc"]]) flower(d, ...at(k), r, c);
    shade(d, false);
  }
  const tops = () => [
    ...[...document.querySelectorAll(".socials a")].map((a) => [T.box(a), 0]),
    [T.box(".ticket"), -4], [T.box(".rb"), 0], ...[...document.querySelectorAll(".row")].map((a) => [T.box(a), 0]),
  ].filter(([b]) => b.width > 0);
  const land = (rest) => {
    const [b, lift] = pick(tops()), x = rnd(b.left + 4, b.right - 10), y = b.top + lift - 4;
    return { c: pick(PETALS), x, y: rest ? y : y - rnd(60, 130), floor: y, phase: rnd(0, 6), rest: rest ? 1e9 : rnd(5000, 11000), age: 0 };
  };
  function buzz(c, b, t, dt) {  // circling a flower, and now and then landing on it a moment before going to another
    const f = blooms[b.at % blooms.length];
    if (t > b.next) { b.at = Math.floor(Math.random() * blooms.length); b.next = t + rnd(3000, 6000); b.land = Math.random() < 0.45 ? t + 1600 : 0; }
    const sitting = b.land && t > b.land && t < b.land + 1300;
    const tx = sitting ? f.x : f.x + 12 * Math.sin(t / 430 + b.phase) + 4 * Math.sin(t / 170 + b.phase * 2);
    const ty = sitting ? f.y - 5 : f.y - 8 + 7 * Math.sin(t / 610 + b.phase);
    const vx = (tx - b.x) * Math.min(1, dt * 3.5);
    b.x += vx; b.y += (ty - b.y) * Math.min(1, dt * 3.5);
    if (Math.abs(vx) > 0.05) b.face = Math.sign(vx);
    c.save();
    c.translate(Math.round(b.x), Math.round(b.y));
    if (b.face < 0) c.scale(-1, 1);
    c.drawImage(BEE[sitting ? Math.floor(t / 250) % 2 : Math.floor(t / 45) % 2], -7, -4, 15, 9);
    c.restore();
  }
  function ladybug() {  // flies in, crawls a little way along the top of a card, opens up and flies off
    const cards = [T.box(".ticket"), T.box(".rb"), ...[...document.querySelectorAll(".row")].map((a) => T.box(a))];
    const on = cards.filter((b) => b.top + T.y > 60 && b.top + T.y < innerHeight - 40), b = pick(on.length ? on : cards);
    const dir = Math.random() < 0.5 ? 1 : -1, walk = rnd(5, 8), x0 = dir > 0 ? rnd(b.left + 20, b.left + b.width * 0.4) : rnd(b.right - b.width * 0.4, b.right - 20), y0 = b.top + 9;
    let t0 = null;
    return (c, t) => {
      t0 ??= t;
      const e = (t - t0) / 1000;
      let x, y, img = LADYBUG.fly, wob = 0;
      if (e < 1.2) { const k = e / 1.2; x = x0 - dir * 50 * (1 - k); y = y0 - 70 * (1 - k) ** 1.5; wob = 4 * Math.sin(e * 14) * (1 - k); }
      else if (e < 1.2 + walk) { const s = e - 1.2; x = x0 + dir * 9 * s; y = y0 + 1.5 * Math.sin(s * 1.3); img = LADYBUG.crawl[Math.floor(t / 120) % 2]; }
      else { const k = (e - 1.2 - walk) / 1.5; if (k > 1) return false; x = x0 + dir * (9 * walk + 60 * k); y = y0 - 90 * k ** 1.3; wob = 4 * Math.sin(e * 14); }
      c.save();
      c.translate(Math.round(x), Math.round(y + wob));
      if (dir < 0) c.scale(-1, 1);
      c.drawImage(img, -7, -7, 14, 14);
      c.restore();
      return true;
    };
  }
  trim("a.row:last-of-type", {
    fit(layer) {
      T = layer;
      blooms = [];
      T.g.imageSmoothingEnabled = false;
      const dpr = T.g.getTransform().a;
      deco = layer.deco ??= document.createElement("canvas");
      deco.width = Math.round(T.W * dpr); deco.height = Math.round(T.H * dpr);
      const d = deco.getContext("2d");
      d.setTransform(dpr, 0, 0, dpr, 0, 0);
      const ticket = T.box(".ticket"), rb = T.box(".rb");
      sprig(d, ticket.right + 2, ticket.top + 6, -1, 46);
      sprig(d, rb.left - 2, rb.top + 8, 1, 40);
      const ink = inked($("h1"));
      if (ink) {  // flowers perched on three of the name's flat tops
        const flat = [];
        for (let col = 2; col < ink.tops.length - 2; col++) if (ink.tops[col] >= 0 && Math.abs(ink.tops[col - 2] - ink.tops[col]) + Math.abs(ink.tops[col + 2] - ink.tops[col]) === 0) flat.push(col);
        for (const k of [0.08, 0.5, 0.93]) {
          const col = flat[Math.floor(k * (flat.length - 1))];
          if (col !== undefined) flower(d, ink.left - T.x + col, ink.top - T.y + ink.tops[col] - 3, 5.5, pick(["#ffc4dc", "#ffe3ef", "#ffb0d0"]));
        }
      }
      if (still) landing = [land(true), land(true), land(true)];
      for (const b of bees) if (!b.x && blooms.length) { const f = blooms[b.at % blooms.length]; b.x = f.x; b.y = f.y - 5; }
    },
    frame({ g: c }, t, dt) {
      if (deco) c.drawImage(deco, 0, 0, T.W, T.H);
      if (blooms.length) for (const b of bees) buzz(c, b, t, dt);
      if (bug && !bug(c, t)) bug = null;
      for (const l of landing) {
        l.age += dt * 1000;
        if (l.y < l.floor) {
          l.y = Math.min(l.floor, l.y + 30 * dt);
          l.x += Math.cos(t / 600 + l.phase) * 20 * dt;
          c.drawImage(l.c[Math.floor(t / 180 + l.phase) % 4], Math.round(l.x), Math.round(l.y), 6, 4);
          l.landed = l.age;
          continue;
        }
        const off = l.age - l.landed - l.rest;
        if (off < 0) { c.drawImage(l.c[0], Math.round(l.x), Math.round(l.y), 6, 4); continue; }
        l.dir ??= Math.random() < 0.5 ? 1 : -1;
        c.globalAlpha = Math.max(0, 1 - off / 1400);
        c.drawImage(l.c[Math.floor(t / 110) % 4], Math.round(l.x + l.dir * off * 0.1), Math.round(l.y - off * 0.025 - 5 * Math.sin(off / 280)), 6, 4);
        c.globalAlpha = 1;
        l.gone = off > 1400;
      }
      landing = landing.filter((l) => !l.gone);
    },
  });
  every(() => { if (T && landing.length < 6) landing.push(land(false)); }, 2, 4.5, 1.2);
  every(() => { if (T && !bug) bug = ladybug(); }, 14, 24, 4);
}
