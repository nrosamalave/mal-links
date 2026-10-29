// Winter: a snowy night under the northern lights. Green and violet curtains ripple behind the name, stars twinkle, a
// thin moon; snow-capped mountains, a pine forest, a log cabin with lit windows and smoke from its chimney, a snowman.
// Snow falls behind the page and in front of it, and now and then a shooting star. On the page: snow piled on the name
// and on top of the cards and icons, glinting, and icicles under the buttons that now and then let a drop of meltwater go.
import { $, across, dither, every, gloss, inked, layer, rnd, scene, screen, seeded, shade, sky, steps, still, tick, trim } from "./kit.js";

let g, W = 0, H = 0, S = null;
const behind = steps();
const SNOW = "#eef6ff", SHADE = "#9fbbe0";

function build(spot) {
  const r = seeded(1221);
  const { cx, ground } = spot;
  const hump = (x, c, w, h) => h * Math.exp(-(((x - c) / w) ** 2));
  const kx = Math.round(Math.max(16, W * 0.1)), mx = Math.round(W - Math.max(14, W * 0.07));  // the cabin, the snowman
  const ridge = (x) => Math.round(ground - 2 * Math.sin(x * 0.045 + 0.6) - 1.5 * Math.sin(x * 0.12 + 2) - hump(x, kx, 22, 4));
  S = { ground, ridge, windows: [], flakes: [], twinkle: [] };

  S.back = layer(W, H, (b) => {
    sky(b, W, H, ["#050a1e", "#071028", "#0a1734", "#0e1f42", "#132850", "#1a335e", "#22406c", "#2d4f7a"], ground);
    for (let n = Math.round((W * ground) / 140), i = 0; i < n; i++) {
      const x = Math.floor(r() * W), y = Math.floor(r() * (ground - 20));
      if (r() < 0.12) S.twinkle.push({ x, y, phase: r() * 6, speed: 0.6 + r() * 1.6 });
      else { b.fillStyle = r() < 0.25 ? "#dfe8ff" : "#5d6f9c"; b.fillRect(x, y, 1, 1); }
    }
    const moon = { x: Math.round(W - Math.max(26, W * 0.16)), y: Math.round(Math.max(14, spot.name * 0.4)), R: Math.round(Math.min(9, W * 0.05)) };
    const halo = b.createRadialGradient(moon.x, moon.y, moon.R, moon.x, moon.y, moon.R * 4);
    halo.addColorStop(0, "rgba(200, 220, 255, 0.18)"); halo.addColorStop(1, "rgba(200, 220, 255, 0)");
    b.fillStyle = halo; b.fillRect(0, 0, W, ground);
    for (let y = -moon.R; y <= moon.R; y++) for (let x = -moon.R; x <= moon.R; x++) {  // a crescent, lit from the right
      if (Math.hypot(x, y) > moon.R || Math.hypot(x + moon.R * 0.55, y - moon.R * 0.2) < moon.R * 0.9) continue;
      b.fillStyle = x > moon.R * 0.4 ? "#ffffff" : "#e2ebff";
      b.fillRect(moon.x + x, moon.y + y, 1, 1);
    }
  });

  S.mountains = layer(W, ground + 2, (m) => {  // jagged peaks, snow on top, moonlit from the right
    const peaks = [];
    for (let x = -20; x < W + 40; x += 18 + r() * 26) peaks.push({ x, h: 14 + r() * 24 + (Math.abs(x - cx) < 40 ? -6 : 0) });
    const top = (x) => {
      let y = Infinity;
      for (const p of peaks) y = Math.min(y, ground - p.h + Math.abs(x - p.x) * (0.9 + (p.x % 3) * 0.15));
      return Math.round(y + 2 * Math.sin(x * 0.7));
    };
    for (let x = 0; x < W; x++) {
      const y0 = top(x), slopeRight = top(x + 1) > y0;
      for (let y = y0; y <= ground + 1; y++) {
        const depth = y - y0, snow = depth < 6 + 3 * Math.sin(x * 0.3) && y < ground - 6;
        m.fillStyle = snow ? (slopeRight ? "#d3e0f2" : "#8094b8") : dither(x, y, (y - y0) / 40) ? "#16233f" : slopeRight ? "#2c3c5e" : "#1f2c4a";
        m.fillRect(x, y, 1, 1);
      }
    }
  });

  S.front = layer(W, H, (f) => {
    for (let x = 0; x < W; x++) {  // the snowy hill and the field below, darker the nearer it gets
      const y = ridge(x);
      for (let yy = y; yy < H; yy++) {
        const k = (yy - y) / Math.max(1, H - y), drift = Math.sin(yy * 0.32 + 3 * Math.sin(x * 0.017)) + 0.6 * Math.sin(x * 0.009 - yy * 0.05);
        f.fillStyle = yy - y < 2 ? "#dfeaff" : k < 0.06 ? "#9db4d8" : drift > 1.25 ? "#4c6690" : dither(x, yy, k * 1.2) ? "#22345a" : "#344b75";
        f.fillRect(x, yy, 1, 1);
      }
    }
    for (let i = 0, n = Math.round((W * (H - ground)) / 120); i < n; i++) {  // glints in the snow
      const x = Math.floor(r() * W);
      f.fillStyle = r() < 0.5 ? "#c8dcff" : "#7f9ccc";
      f.fillRect(x, Math.round(ridge(x) + 4 + r() * (H - ground)), 1, 1);
    }
    for (let x = 3; x < W; x += Math.round(5 + r() * 9)) {  // the forest along the hill, clear of the cabin and the snowman
      if (Math.abs(x - kx) < 18 || Math.abs(x - mx) < 10) continue;
      pine(f, x, ridge(x) + 1, 9 + r() * 12, r);
    }
    cabin(f, kx, ridge(kx) + 1);
    snowman(f, mx, ridge(mx) + 15);
    if (W > 420) for (let x = 20; x < W; x += 30 + r() * 50) {
      if (Math.abs(x - cx) < 130) continue;
      pine(f, x, Math.round(ground + 40 + r() * (H - ground - 60)), 22 + r() * 22, r);
    }
  });
}

function pine(f, x, base, h, r) {  // tiers of branches, snow along the top of each, the right side catching the moon
  f.fillStyle = "#2a1a14"; f.fillRect(x, base - 2, 1, 3);
  const tiers = h > 20 ? 4 : 3;
  for (let i = 0; i < tiers; i++) {
    const tb = base - 2 - i * (h / (tiers + 0.6)), th = h / (tiers - 0.6), wide = (h * 0.42) * (1 - i * 0.18);
    for (let y = 0; y < th; y++) {
      const half = Math.round((wide * y) / th), row = Math.round(tb - th + y);
      for (let dx = -half; dx <= half; dx++) {
        const edge = y < 2 || Math.abs(dx) >= half - (r() < 0.5 ? 0 : 1);
        f.fillStyle = edge && y < th * 0.6 && r() < 0.8 ? (dx > 0 ? SNOW : SHADE) : dx > half * 0.3 ? "#1d4740" : "#0f2a2a";
        f.fillRect(x + dx, row, 1, 1);
      }
    }
  }
}

function cabin(f, cx, base) {  // logs, a deep snowy roof, two warm windows, a stone chimney
  const x0 = cx - 11, R = (x, y, w, h, c) => { f.fillStyle = c; f.fillRect(x0 + x, base + y, w, h); };
  R(0, -12, 22, 12, "#4a2c1e");
  for (let y = -11; y < 0; y += 3) R(0, y, 22, 1, "#33190f");
  R(17, -22, 4, 10, "#5c5a68"); R(17, -22, 4, 1, SNOW); R(17, -19, 4, 1, "#47454f");
  for (let i = 0; i < 7; i++) {  // the roof, thick with snow, hanging over the eaves
    R(-2 + i * 2, -13 - i, 26 - i * 4, 1, SNOW);
    R(-2 + i * 2, -13 - i, 2, 1, SHADE);
  }
  R(-3, -12, 28, 2, SNOW); R(-3, -11, 28, 1, SHADE);
  for (const ix of [2, 6, 11, 15, 20]) R(ix, -10, 1, 2 + (ix % 3), "#cfe6ff");  // icicles on the eaves
  R(9, -6, 4, 6, "#2a160c");
  S.windows.push({ x: x0 + 3, y: base - 8, w: 4, h: 3 }, { x: x0 + 15, y: base - 8, w: 4, h: 3 });
  S.chimney = { x: x0 + 19, y: base - 23 };
  R(-4, 0, 30, 1, "#b8cbe6");
}

function snowman(f, x, base) {  // three snowballs, coal eyes, a carrot nose, stick arms, a red scarf, a top hat
  const ball = (cy, rad) => {
    for (let y = -rad; y <= rad; y++) for (let dx = -rad; dx <= rad; dx++) {
      if (Math.hypot(dx, y) > rad + 0.3) continue;
      f.fillStyle = dx + y > rad * 0.5 || dx < -rad * 0.5 ? SHADE : SNOW;
      f.fillRect(x + dx, cy + y, 1, 1);
    }
  };
  ball(base - 5, 5); ball(base - 13, 4); ball(base - 19, 3);
  f.fillStyle = "#1a1a24"; f.fillRect(x - 1, base - 20, 1, 1); f.fillRect(x + 1, base - 20, 1, 1); f.fillRect(x, base - 14, 1, 1); f.fillRect(x, base - 11, 1, 1);
  f.fillRect(x - 3, base - 23, 7, 1); f.fillRect(x - 2, base - 27, 5, 4);
  f.fillStyle = "#ff8a2a"; f.fillRect(x + 1, base - 19, 2, 1);
  f.fillStyle = "#d8283a"; f.fillRect(x - 3, base - 16, 7, 1); f.fillRect(x + 2, base - 15, 1, 3);
  f.fillStyle = "#3a2216";
  for (let i = 0; i < 5; i++) { f.fillRect(x - 5 - i, base - 13 - Math.round(i * 0.7), 1, 1); f.fillRect(x + 5 + i, base - 13 - Math.round(i * 0.9), 1, 1); }
  f.fillStyle = "rgba(10, 20, 50, 0.35)"; f.fillRect(x - 6, base, 13, 1);
}

function aurora(t) {  // two rippling curtains, bright along the bottom edge and fading up into the sky
  const { ground } = S;
  g.save();
  g.globalCompositeOperation = "lighter";
  for (const [base, len, rgb, amp, k] of [[ground * 0.62, ground * 0.42, "70, 255, 160", 1, 0], [ground * 0.38, ground * 0.3, "150, 110, 255", 0.7, 2.1]]) {
    for (let x = 0; x < W; x += 1) {
      const y = base + amp * (9 * Math.sin(x * 0.028 + t / 5200 + k) + 5 * Math.sin(x * 0.071 - t / 3700 + k));
      const glow = Math.max(0, 0.35 + 0.65 * Math.sin(x * 0.045 + t / 2400 + k) * Math.sin(x * 0.013 - t / 6100)) * (0.7 + 0.3 * Math.sin(x * 0.55 + t / 900 + k));  // rays
      if (glow < 0.04) continue;
      const s = g.createLinearGradient(0, y - len, 0, y + 3);
      s.addColorStop(0, `rgba(${rgb}, 0)`); s.addColorStop(0.75, `rgba(${rgb}, ${0.22 * glow})`); s.addColorStop(1, `rgba(${rgb}, ${0.55 * glow})`);
      g.fillStyle = s;
      g.fillRect(x, y - len, 1, len + 3);
    }
  }
  g.restore();
}

function shootingStar() {
  const dir = Math.random() < 0.5 ? 1 : -1, x0 = rnd(0.15, 0.85) * W, y0 = rnd(4, S.ground * 0.35), speed = rnd(120, 170);
  let t0 = null;
  return (t) => {
    t0 ??= t;
    const e = (t - t0) / 1000, life = 0.9;
    for (let i = 0; i < 12; i++) {
      const k = Math.max(0, e - i * 0.012);
      g.globalAlpha = Math.max(0, (1 - i / 12) * (1 - e / life));
      g.fillStyle = i ? "#bcd4ff" : "#ffffff";
      g.fillRect(Math.round(x0 + dir * speed * k), Math.round(y0 + speed * 0.45 * k), 1, 1);
    }
    g.globalAlpha = 1;
    return e < life;
  };
}

let puffs = [], smokeAt = 0, flakes = [];
function frame(t, dt) {
  g.drawImage(S.back, 0, 0);
  for (const s of S.twinkle) {
    const k = 0.5 + 0.5 * Math.sin(t / 1000 * s.speed + s.phase);
    g.fillStyle = k > 0.75 ? "#ffffff" : k > 0.35 ? "#a9bce6" : "#4a5c8a";
    g.fillRect(s.x, s.y, 1, 1);
    if (k > 0.93) { g.fillStyle = "rgba(220, 235, 255, 0.5)"; g.fillRect(s.x - 1, s.y, 3, 1); g.fillRect(s.x, s.y - 1, 1, 3); }
  }
  aurora(t);
  behind.run(t);
  g.drawImage(S.mountains, 0, 0);
  if (S.chimney && t > smokeAt) { smokeAt = t + 380; puffs.push({ x: S.chimney.x, y: S.chimney.y, age: 0 }); }
  for (const p of puffs) { p.age += dt; p.y -= dt * 7; p.x += dt * (3 + p.age * 2); }
  puffs = puffs.filter((p) => p.age < 5);
  for (const p of puffs) {
    const size = Math.round(2 + p.age * 1.2);
    g.globalAlpha = 0.4 * (1 - p.age / 5);
    g.fillStyle = "#8fa0c0";
    g.fillRect(Math.round(p.x - size / 2), Math.round(p.y - size / 2), size, size);
  }
  g.globalAlpha = 1;
  g.drawImage(S.front, 0, 0);
  for (const w of S.windows) {  // warm windows, a fire flickering inside
    const k = 0.85 + 0.15 * Math.sin(t / 120 + w.x) * Math.sin(t / 47);
    g.fillStyle = `rgba(255, 170, 70, ${0.18 * k})`; g.fillRect(w.x - 2, w.y - 2, w.w + 4, w.h + 4);
    g.fillStyle = k > 0.9 ? "#ffd27a" : "#ffb64a"; g.fillRect(w.x, w.y, w.w, w.h);
    g.fillStyle = "#33190f"; g.fillRect(w.x + (w.w >> 1), w.y, 1, w.h);
  }
  if (!flakes.length) flakes = Array.from({ length: Math.round((W * H) / 260) }, () => ({ x: rnd(0, W), y: rnd(0, H), v: rnd(6, 16), phase: rnd(0, 6) }));
  for (const f of flakes) {  // snow behind the page, tiny and far off
    f.y += f.v * dt;
    f.x += Math.sin(t / 1300 + f.phase) * 4 * dt;
    if (f.y > H) { f.y = -2; f.x = rnd(0, W); }
    g.fillStyle = f.v > 12 ? "#eef5ff" : "#a8bde0";
    g.fillRect(Math.round(f.x), Math.round(f.y), 1, 1);
  }
}

scene((ctx, w, h, spot) => { g = ctx; W = w; H = h; flakes = []; build(spot); return frame; });
every(() => behind.add(shootingStar()), 12, 22, 4);

// Big soft flakes in front of the page, drifting
if (!still) {
  const F = screen("#front");
  const flake = (y) => ({ x: rnd(-20, F.W + 20), y, r: rnd(1.2, 2.8), v: rnd(18, 34), sway: rnd(8, 22), phase: rnd(0, 6) });
  const front = Array.from({ length: Math.round(Math.min(40, F.W / 12)) }, () => flake(rnd(-F.H, F.H)));
  tick((t, dt) => {
    const { g: c, W: w, H: h } = F;
    c.clearRect(0, 0, w, h);
    for (const f of front) {
      f.y += f.v * dt;
      f.x += Math.sin(t / 1100 + f.phase) * f.sway * dt;
      if (f.y > h + 6) Object.assign(f, flake(-6));
      c.globalAlpha = 0.55 + f.r * 0.12;
      c.fillStyle = "#f4f9ff";
      c.beginPath(); c.arc(f.x, f.y, f.r, 0, Math.PI * 2); c.fill();
    }
    c.globalAlpha = 1;
  });
}

// On the page: snow on the name and on top of everything, icicles under the buttons and the RotoBot card
{
  const ICE = { base: "#bfe3ff", light: "#ffffff", dark: "#5c97d0" };
  let T = null, deco = null, glints = [], icicles = [], drops = [];
  function cap(d, x0, x1, y, depth) {  // a soft lumpy pile of snow along an edge, drooping a little over the ends
    const n = Math.max(2, Math.round((x1 - x0) / 9)), bumps = Array.from({ length: n + 1 }, () => rnd(0.6, 1));
    const height = (x) => {
      const k = (x - x0) / (x1 - x0), i = Math.min(n - 1, Math.floor(k * n)), f = k * n - i;
      return depth * Math.sin(Math.PI * Math.min(1, Math.max(0, k)) ** 0.8) ** 0.35 * (bumps[i] + (bumps[i + 1] - bumps[i]) * (0.5 - Math.cos(f * Math.PI) / 2));
    };
    d.beginPath();
    d.moveTo(x0 - 2, y + 3);
    for (let x = x0 - 2; x <= x1 + 2; x += 1) d.lineTo(x, y - height(Math.min(x1, Math.max(x0, x))) + 1);
    d.lineTo(x1 + 2, y + 3);
    d.quadraticCurveTo(x1 + 3, y + 5, x1, y + 4);
    d.lineTo(x0, y + 4);
    d.quadraticCurveTo(x0 - 3, y + 5, x0 - 2, y + 3);
    d.closePath();
    const s = d.createLinearGradient(0, y - depth, 0, y + 5);
    s.addColorStop(0, "#ffffff"); s.addColorStop(0.55, SNOW); s.addColorStop(1, SHADE);
    shade(d, true); d.fillStyle = s; d.fill(); shade(d, false);
    for (let i = 0, k = Math.round((x1 - x0) / 14); i < k; i++) glints.push({ x: rnd(x0 + 2, x1 - 2), y: y - rnd(0, depth * 0.6), phase: rnd(0, 6), speed: rnd(0.4, 1.1) });
  }
  function hang(d, x0, x1, y, n, len, floor) {  // a frosted lip and icicles hanging off it
    d.fillStyle = SNOW;
    d.beginPath(); d.roundRect(x0, y - 2, x1 - x0, 4, 2); d.fill();
    for (let i = 0; i < n; i++) {
      const x = x0 + ((i + 0.5 + rnd(-0.3, 0.3)) / n) * (x1 - x0), w = rnd(4.5, 8), l = rnd(...len);
      d.beginPath(); d.moveTo(x - w / 2, y); d.quadraticCurveTo(x - w * 0.18, y + l * 0.55, x, y + l); d.quadraticCurveTo(x + w * 0.18, y + l * 0.55, x + w / 2, y); d.closePath();
      shade(d, true); d.fillStyle = across(d, ICE, x - w / 2, x + w / 2); d.fill(); shade(d, false);
      d.strokeStyle = "rgba(60, 110, 170, 0.55)"; d.lineWidth = 0.8; d.stroke();
      d.fillStyle = "rgba(255, 255, 255, 0.85)"; d.fillRect(x - w * 0.2, y + 1, 1.2, l * 0.45);
      icicles.push({ x, y: y + l, floor });
    }
  }
  function letters(d) {  // snow settled on the tops of the letters of the name, deepest where they're flat
    const ink = inked($("h1"));
    if (!ink) return;
    const tops = ink.tops, ox = ink.left - T.x, oy = ink.top - T.y;
    let run = [];
    const flush = () => {
      if (run.length > 2) {
        d.beginPath();
        const [first] = run, last = run[run.length - 1];
        d.moveTo(ox + first[0] - 1, oy + first[1] + 2);
        for (const [col, y, h] of run) d.lineTo(ox + col, oy + y - h);
        d.lineTo(ox + last[0] + 1, oy + last[1] + 2);
        for (let i = run.length - 1; i >= 0; i--) d.lineTo(ox + run[i][0], oy + run[i][1] + 2);
        d.closePath();
        const s = d.createLinearGradient(0, oy + first[1] - 6, 0, oy + first[1] + 3);
        s.addColorStop(0, "#ffffff"); s.addColorStop(1, SHADE);
        d.fillStyle = s; d.fill();
      }
      run = [];
    };
    for (let col = 0; col < tops.length; col++) {
      const y = tops[col], flat = y >= 0 && Math.abs((tops[col - 1] ?? -9) - y) <= 1 && Math.abs((tops[col + 1] ?? -9) - y) <= 1;
      if (y < 0 || (run.length && Math.abs(run[run.length - 1][1] - y) > 2)) flush();
      if (y >= 0) run.push([col, y, flat ? 2.5 + 2 * Math.abs(Math.sin(col * 0.37)) : 1]);
    }
    flush();
  }
  trim("a.row:last-of-type", {
    fit(layer) {
      T = layer; glints = []; icicles = [];
      const dpr = T.g.getTransform().a;
      deco = layer.deco ??= document.createElement("canvas");
      deco.width = Math.round(T.W * dpr); deco.height = Math.round(T.H * dpr);
      const d = deco.getContext("2d");
      d.setTransform(dpr, 0, 0, dpr, 0, 0);
      const b = (q) => T.box(q);
      letters(d);
      for (const a of document.querySelectorAll(".socials a")) { const r = b(a); cap(d, r.left + 1, r.right - 1, r.top, 6); }
      const ticket = b(".ticket"), rb = b(".rb");
      cap(d, ticket.left - 2, ticket.right + 2, ticket.top - 4, 13);
      cap(d, rb.left, rb.right, rb.top, 12);
      if (!$("#live").hidden) { const r = b("#live"); cap(d, r.left, r.right, r.top, 7); }
      for (const a of document.querySelectorAll(".row")) { const r = b(a); cap(d, r.left, r.right, r.top, 8); }
      const go = b(".ticket .go"), btn = b(".btn");
      hang(d, go.left + 2, go.right - 2, go.bottom - 2, 8, [8, 22], rb.top);
      hang(d, btn.left + 2, btn.right - 2, btn.bottom - 3, 7, [6, 15], rb.bottom - 8);
      hang(d, rb.left + 3, rb.right - 3, rb.bottom - 2, 9, [8, 22], b(".label:nth-of-type(2)").top - 2);
    },
    frame({ g: c }, t, dt) {
      if (!deco) return;
      c.drawImage(deco, 0, 0, T.W, T.H);
      for (const s of glints) {  // the snow glinting
        const k = Math.sin(t / 1000 * s.speed + s.phase);
        if (k < 0.82) continue;
        const a = (k - 0.82) / 0.18, size = 1.5 + a * 2;
        c.fillStyle = `rgba(255, 255, 255, ${a})`;
        c.fillRect(s.x - size, s.y - 0.5, size * 2, 1); c.fillRect(s.x - 0.5, s.y - size, 1, size * 2);
      }
      for (const p of drops) {
        p.age += dt;
        const r = Math.min(1.8, 0.4 + p.age * 1.4);
        if (p.age > 1) { p.vy += 1400 * dt; p.y += p.vy * dt; }
        if (p.y >= p.floor) { p.gone = true; continue; }
        c.globalAlpha = 0.9;
        c.beginPath(); c.ellipse(p.x, p.y + r, r * 0.9, r * (1 + Math.min(0.5, p.vy / 900)), 0, 0, Math.PI * 2);
        c.fillStyle = across(c, ICE, p.x - r, p.x + r); c.fill();
        gloss(c, p.x, p.y + r, r);
        c.globalAlpha = 1;
      }
      drops = drops.filter((p) => !p.gone);
    },
  });
  every(() => {  // meltwater: a bead forms on an icicle's tip and falls
    if (!icicles.length || drops.length > 2) return;
    const i = icicles[Math.floor(Math.random() * icicles.length)];
    drops.push({ x: i.x, y: i.y - 1, floor: i.floor, vy: 0, age: 0 });
  }, 1.8, 3.6, 2);
}
