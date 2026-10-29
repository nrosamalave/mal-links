// Summer: a synthwave beach night, the arcade look's home. A big striped retro sun sinking into the sea under a
// magenta sky, its reflection shimmering on the water, palms leaning in from both sides, waves on the sand, a sailboat on
// the horizon, now and then a dolphin leaping. Fireworks over the water, the two biplanes' dogfight, and the RotoBot
// card's neon frame buzzing (in the page's styles).
import { art, dither, every, layer, rgb, rnd, scene, screen, seeded, sky, steps, still, tick } from "./kit.js";

let g, W = 0, H = 0, S = null;
const behind = steps();
const SUN = ["#fff27a", "#ffd24a", "#ffa63d", "#ff7046", "#ff3e8a"];
const DOLPHIN = art(["......h.......", "....hhhhhhh...", "..h##########.", ".#############", "#...b######...", "##............"],
  { h: "#ffb0d4", "#": "#c2589c", b: "#8a3a7a" });  // lit pink by the sunset, so it shows against the dark sea

function build(spot) {
  const r = seeded(621);
  const { cx, ground } = spot, R = Math.round(Math.min(W * 0.3, 72));
  const beach = Math.round(ground + Math.max(40, (H - ground) * 0.5));
  S = { ground, beach, sun: { x: cx, y: ground, R } };

  const colors = ["#12052e", "#1d0739", "#2b0a46", "#3d0c52", "#55105c", "#721662", "#951f63", "#b82b60", "#d83f58", "#ef5c4e", "#ff8448"];
  S.sky = layer(W, ground + 1, (b) => {
    sky(b, W, ground + 1, colors, ground);
    for (let n = Math.round(W / 4), i = 0; i < n; i++) {
      b.fillStyle = r() < 0.3 ? "#ffe9f4" : "#9a5ab0";
      b.fillRect(Math.floor(r() * W), Math.floor(r() ** 1.6 * ground * 0.55), 1, 1);
    }
    const glow = b.createRadialGradient(cx, ground, R * 0.9, cx, ground, R * 2.6);
    glow.addColorStop(0, "rgba(255, 90, 140, 0.45)"); glow.addColorStop(1, "rgba(255, 90, 140, 0)");
    b.fillStyle = glow; b.fillRect(0, 0, W, ground + 1);
  });
  S.back = layer(W, H, (b) => {
    b.drawImage(S.sky, 0, 0);
    for (let y = ground - R; y <= ground; y++) for (let x = cx - R; x <= cx + R; x++) {  // the sun, yellow fading to hot pink
      if (Math.hypot(x - cx, y - ground) > R) continue;
      const k = ((y - (ground - R)) / R) * (SUN.length - 1), i = Math.min(SUN.length - 2, Math.floor(k));
      b.fillStyle = SUN[i + (dither(x, y, k - i) ? 1 : 0)];
      b.fillRect(x, y, 1, 1);
    }
    for (let y = ground + 1; y < H; y++) {  // the sea, then the sand
      const k = (y - ground) / Math.max(1, beach - ground), sand = y >= beach;
      for (let x = 0; x < W; x++) {
        b.fillStyle = sand ? (dither(x, y, (y - beach) / (H - beach)) ? "#1a0820" : "#2c0f30")
          : (y - ground) % Math.max(2, Math.round(2 + k * 7)) === 0 && dither(x * 3, y, 0.6) ? "#4a1868" : dither(x, y, k) ? "#140628" : "#24093e";
        b.fillRect(x, y, 1, 1);
      }
    }
  });

  S.palms = layer(W, H, (p) => {  // at the edges, leaning in, their crowns up beside the name
    const crown = Math.round(ground * 0.42), reach = Math.min(46, W * 0.2);
    palm(p, -2, beach + 12, beach + 12 - crown, 1, reach, r);
    palm(p, W + 2, beach + 16, beach + 16 - crown - 10, -1, reach * 0.9, r);
    if (W > 420) { palm(p, cx - 250, beach + 40, beach + 40 - crown - 30, 1, reach, r); palm(p, cx + 270, beach + 50, beach + 50 - crown - 20, -1, reach, r); }
  });
}

function palm(p, x, base, h, lean, reach, r) {  // a curved ringed trunk and a crown of drooping, feathered fronds, in silhouette
  const at = (k) => ({ x: x + lean * reach * 0.55 * k ** 2, y: base - h * k });
  for (let i = 0; i <= h; i++) {
    const { x: px, y: py } = at(i / h), w = Math.max(2, Math.round(6 - (i / h) * 3));
    p.fillStyle = i % 5 === 0 ? "#0c0216" : "#180626";
    p.fillRect(Math.round(px - w / 2), Math.round(py), w, 1);
    p.fillStyle = "#6a1e5e"; p.fillRect(Math.round(px + (lean > 0 ? w / 2 - 1 : -w / 2)), Math.round(py), 1, 1);  // the sunset on its edge
  }
  const top = at(1);
  p.fillStyle = "#14041f";
  for (let f = 0; f < 9; f++) {
    const side = f % 2 ? 1 : -1, len = reach * (0.55 + r() * 0.45) * (side === lean ? 1 : 0.7);
    let px = top.x, py = top.y, ang = -Math.PI / 2 + side * (0.25 + (f >> 1) * 0.42) + (r() - 0.5) * 0.15;
    for (let i = 0; i < len; i++) {
      ang += side * 0.05;  // drooping as it goes
      px += Math.cos(ang); py += Math.sin(ang);
      p.fillRect(Math.round(px), Math.round(py), 1, 1);
      const leaf = Math.round(4.5 * Math.sin((i / len) * Math.PI));
      for (const s of [1, -1]) for (let k = 1; k <= leaf; k++)  // leaflets both sides, swept back and down
        p.fillRect(Math.round(px - Math.cos(ang) * k * 0.5 - s * Math.sin(ang) * k * 0.7), Math.round(py - Math.sin(ang) * k * 0.5 + s * Math.cos(ang) * k * 0.7 + k * 0.5), 1, 1);
    }
  }
  p.fillRect(Math.round(top.x) - 2, Math.round(top.y) - 1, 5, 4);
  p.fillStyle = "#3a0e3a"; p.fillRect(Math.round(top.x) - 1, Math.round(top.y) + 2, 2, 2);  // coconuts
}

function sailboat() {  // a little sail crossing the horizon
  const dir = Math.random() < 0.5 ? 1 : -1, speed = rnd(3, 5);
  let t0 = null;
  return (t) => {
    t0 ??= t;
    const x = Math.round((dir > 0 ? -8 : W + 8) + dir * speed * ((t - t0) / 1000)), y = S.ground;
    g.fillStyle = "#1a0628";
    g.fillRect(x - 3, y - 1, 7, 1); g.fillRect(x - 2, y, 5, 1);
    for (let i = 0; i < 6; i++) g.fillRect(x, y - 2 - i, Math.max(1, 3 - (i >> 1)), 1);
    return dir > 0 ? x < W + 8 : x > -8;
  };
}

function dolphin() {  // leaps out of the sea beside the page, arcs over, dives back in with a splash
  const side = Math.random() < 0.5, dir = side ? 1 : -1;
  const span = rnd(18, 26), x0 = side ? rnd(2, Math.max(4, S.sun.x - 70 - span)) : rnd(Math.min(W - span - 4, S.sun.x + 70), W - span - 2);
  const y0 = S.ground + rnd(7, 16), high = rnd(9, 14), time = rnd(1.0, 1.3), drops = [];
  const rings = [], splash = (x) => {
    rings.push({ x, age: 0 });
    for (let i = 0; i < 10; i++) drops.push({ x, y: y0, vx: rnd(-16, 16), vy: -rnd(20, 38), age: 0 });
  };
  let t0 = null, last = null, out = false, back = false;
  return (t) => {
    t0 ??= t;
    const e = (t - t0) / 1000, k = e / time, dt = Math.min(50, t - (last ?? t)) / 1000;
    last = t;
    if (!out) { out = true; splash(dir > 0 ? x0 : x0 + span); }
    if (k <= 1) {
      const x = dir > 0 ? x0 + span * k : x0 + span * (1 - k), y = y0 - 4 * high * k * (1 - k);
      g.save();
      g.translate(Math.round(x), Math.round(y));
      g.rotate(-dir * Math.atan(4 * high * (1 - 2 * k) / span));
      if (dir < 0) g.scale(-1, 1);
      g.drawImage(DOLPHIN, -7, -3);
      g.restore();
    } else if (!back) { back = true; splash(dir > 0 ? x0 + span : x0); }
    for (const d of drops) { d.age += dt; d.vy += 70 * dt; d.x += d.vx * dt; d.y += d.vy * dt; }
    g.fillStyle = "#ffe0ee";
    for (const d of drops) if (d.y <= y0 + 1) g.fillRect(Math.round(d.x), Math.round(d.y), 1, 1);
    for (const r of rings) {  // the ring spreading on the water where it went in and came out
      r.age += dt;
      const w = Math.round(3 + r.age * 14);
      g.globalAlpha = Math.max(0, 0.8 - r.age);
      g.fillStyle = "#ff9ccc"; g.fillRect(Math.round(r.x - w), y0 + 1, w * 2, 1);
      g.globalAlpha = 1;
    }
    return k < 1 || drops.some((d) => d.y <= y0 + 1) || rings.some((r) => r.age < 0.8);
  };
}

function frame(t) {
  const { sun, ground, beach } = S;
  g.drawImage(S.back, 0, 0);
  const top = ground - sun.R;
  for (let k = 0; k < 7; k++) {  // the slits across the bottom of the sun, sliding down and widening
    const y = Math.round(top + sun.R * 0.42 + ((k * 8 + t / 220) % 56)), h = Math.max(1, Math.round((y - top) / sun.R * 4 - 0.6));
    if (y + h > ground) continue;
    g.drawImage(S.sky, sun.x - sun.R, y, sun.R * 2 + 1, h, sun.x - sun.R, y, sun.R * 2 + 1, h);
  }
  behind.run(t);
  for (let y = ground + 1; y < beach; y += 2) {  // the sun's reflection, shimmering, narrowing with distance
    const k = (y - ground) / (beach - ground), half = sun.R * (0.85 - k * 0.55) * (0.6 + 0.4 * Math.sin(t / 300 + y * 1.7));
    const c = rgb(SUN[Math.min(SUN.length - 1, Math.floor(k * SUN.length))]);
    g.fillStyle = `rgba(${c}, ${0.75 - k * 0.5})`;
    const off = Math.round(Math.sin(t / 500 + y) * 3);
    g.fillRect(Math.round(sun.x - half + off), y, Math.round(half * 0.7), 1);
    g.fillRect(Math.round(sun.x + half * 0.2 + off), y, Math.round(half * 0.8), 1);
  }
  const wash = Math.sin(t / 1400);  // waves washing up the sand
  g.fillStyle = "rgba(255, 170, 220, 0.5)";
  for (let x = 0; x < W; x++) g.fillRect(x, Math.round(beach + 1 + wash * 2 + Math.sin(x * 0.15 + t / 700) * 1.2), 1, 1);
  if (S.dolphin && !S.dolphin(t)) S.dolphin = null;
  g.drawImage(S.palms, 0, 0);
}

scene((ctx, w, h, spot) => { g = ctx; W = w; H = h; build(spot); return frame; });
every(() => behind.add(sailboat()), 40, 70, 3);
every(() => S.dolphin = dolphin(), 7, 13, 2);

// Fireworks over the water and, now and then, the two little biplanes dogfighting across the top, firing tracers until
// one takes a hit and limps off smoking. Sharp, on the layer behind the page.
if (!still) {
  const F = screen("#skyfx"), g = F.g;
  let W = F.W, H = F.H;

  const snap = (v) => Math.round(v / 2) * 2;  // sparks move in 2 px steps, like the pixels
  const pick = (list) => list[Math.floor(Math.random() * list.length)];
  const sprite = (w, h, draw) => {
    const c = Object.assign(document.createElement("canvas"), { width: w, height: h });
    draw(c.getContext("2d"));
    return c;
  };

  // The stream's trade-plane biplane without its wheels, 44 x 17 pixels, nose to the left, two propeller frames
  const PARTS = [
    [5, 8, 4, 7, "nose"], [9, 8, 20, 6, "body"], [29, 9, 6, 4, "body"], [35, 10, 5, 2, "body"],
    [9, 11, 27, 1, "wing"], [8, 3, 20, 2, "wing"], [9, 14, 18, 2, "wing"], [11, 5, 1, 3, "ink"], [24, 5, 1, 3, "ink"],
    [29, 4, 3, 2, "nose"], [29, 6, 3, 2, "skin"], [37, 3, 3, 7, "wing"], [35, 12, 7, 1, "wing"], [3, 10, 2, 3, "metal"],
  ];
  const plane = (C) => [0, 1].map((flap) => sprite(44, 17, (s) => {
    const parts = [...PARTS, flap ? [2, 8, 1, 7, "metal"] : [2, 3, 1, 13, "metal"], [32, 7, 3 + flap, 1, "scarf"], [35 + flap, 6 + flap, 2, 1, "scarf"]];
    s.fillStyle = C.ink;
    for (const [x, y, w, h] of parts) s.fillRect(x - 1, y - 1, w + 2, h + 2);  // one ink outline round the lot
    for (const [x, y, w, h, c] of parts) { s.fillStyle = C[c]; s.fillRect(x, y, w, h); }
    s.fillStyle = C.ink; s.fillRect(29, 6, 3, 1);  // goggles
  }));
  const base = { ink: "#0b0620", metal: "#d9d9e8", scarf: "#fff8e7" };
  const PINK = plane({ ...base, body: "#ff3ea5", wing: "#ffd23f", nose: "#22e1ff", skin: "#a8693e" });
  const TEAL = plane({ ...base, body: "#22e1ff", wing: "#ff8a1f", nose: "#39ff7a", skin: "#e0ac7e" });
  const PW = 44, PH = 17;

  let fx = [];  // everything in the sky: each step draws itself and says whether it's still going
  const add = (step) => fx.push(step);
  tick((t, dt) => {
    W = F.W; H = F.H;
    g.clearRect(0, 0, W, H);
    fx = fx.filter((step) => step(t, dt * 1000));
  });

  // A firework: a rocket climbs a little way and bursts into a ring of pixel sparks that drift, droop and fade, a
  // few of them crackling.
  const COLORS = ["#ffd23f", "#ff3ea5", "#22e1ff", "#39ff7a", "#ff8a1f", "#b18cff"];
  function firework() {
    const x = W * (0.1 + Math.random() * 0.8), y = 30 + Math.random() * Math.min(110, H * 0.12);  // high up, behind the name, not over the small print
    const rise = 70 + Math.random() * 80, up = 600 + Math.random() * 250, life = 1500;
    const c1 = pick(COLORS), c2 = Math.random() < 0.5 ? pick(COLORS) : c1, ring = Math.random() < 0.5;
    const n = 30 + Math.floor(Math.random() * 16), speed = 80 + Math.random() * 60;
    let t0 = null, sparks = null;
    return (t, dt) => {
      t0 ??= t;
      const e = t - t0;
      if (e < up) {  // the rocket: a hot white dot slowing as it climbs, embers behind it
        const ry = y + rise * (1 - e / up) ** 2;
        for (let i = 4; i >= 0; i--) {
          g.globalAlpha = 1 - i / 5;
          g.fillStyle = i ? "#ff8a1f" : "#fff8e7";
          g.fillRect(snap(x), snap(ry + i * 5), 2, 2);
        }
        g.globalAlpha = 1;
        return true;
      }
      sparks ??= Array.from({ length: n }, (_, i) => {
        const a = (i / n) * Math.PI * 2 + Math.random() * 0.25, v = speed * (ring ? 0.85 + Math.random() * 0.25 : 0.3 + Math.random() * 0.8);  // a ring, or a full ball
        return { x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, c: i % 2 ? c1 : c2, crackle: Math.random() < 0.3 };
      });
      const b = e - up, s = dt / 1000, fade = Math.min(1, 1.6 * (1 - b / life));
      if (b > life) return false;
      if (b < 300) {  // a soft flash of light around the burst
        const r = 30 + b / 4, glow = g.createRadialGradient(x, y, 0, x, y, r);
        glow.addColorStop(0, c1);
        glow.addColorStop(1, "transparent");
        g.globalAlpha = 0.22 * (1 - b / 300);
        g.fillStyle = glow;
        g.fillRect(x - r, y - r, r * 2, r * 2);
      }
      for (const p of sparks) {
        p.vx *= 1 - 1.7 * s; p.vy = p.vy * (1 - 1.7 * s) + 55 * s;  // air slows them, then they droop
        p.x += p.vx * s; p.y += p.vy * s;
        if (p.crackle && b > 500 && Math.random() < 0.4) continue;
        const size = b < 450 ? 4 : 2;
        g.globalAlpha = fade * 0.35;
        g.fillStyle = p.c;
        g.fillRect(snap(p.x - p.vx * 0.06), snap(p.y - p.vy * 0.06), 2, 2);  // a short tail
        g.globalAlpha = fade;
        g.fillStyle = b < 120 ? "#ffffff" : p.c;
        g.fillRect(snap(p.x) - size / 2, snap(p.y) - size / 2, size, size);
      }
      g.globalAlpha = 1;
      return true;
    };
  }

  // Taking turns: a chase (the one behind fires at the one in front), then a head-on pass (both fire).
  let fights = 0;
  function dogfight() {
    const headOn = fights++ % 2 === 1;
    const speed = Math.max(130, Math.min(220, W * 0.32)) * (headOn ? 0.75 : 1);
    const lane = 30 + Math.random() * 22, d = Math.random() < 0.5 ? 1 : -1;
    const P = (frames, dir, y, back, phase) => ({ frames, dir, y0: y, back, phase, x: 0, y, hit: false, fall: 0, next: 0, shots: 0 });
    const planes = headOn ? [P(PINK, d, lane, 0, 0), P(TEAL, -d, lane + 22, 0, 2)]
      : [P(TEAL, d, lane + 6, 0, 0), P(PINK, d, lane, -110, -0.9)];
    const [a, b] = planes;
    const victim = headOn ? planes[Math.round(Math.random())] : a;
    const shooters = headOn ? [[a, b], [b, a]] : [[b, a]];
    let bullets = [], puffs = [], sparks = [], pow = null, t0 = null, smokeAt = 0;

    function hit(x, y) {
      victim.hit = true;
      pow = { x, y, t: 0 };
      for (let i = 0; i < 12; i++) {
        const ang = Math.random() * Math.PI * 2, v = 40 + Math.random() * 110;
        sparks.push({ x, y, vx: Math.cos(ang) * v, vy: Math.sin(ang) * v, life: 280 + Math.random() * 220, c: ["#ffffff", "#ffd23f", "#ff8a1f", "#ff3ea5"][i % 4] });
      }
    }

    return (t, dt) => {
      t0 ??= t;
      const e = (t - t0) / 1000, s = dt / 1000;
      for (const p of planes) {
        p.x = (p.dir > 0 ? -PW : W + PW) + p.dir * (speed * e + p.back);
        if (p.hit) p.fall += dt * 0.02;
        p.y = p.y0 + 7 * Math.sin(e * 2.2 + p.phase) + p.fall + (p.hit ? 1.5 * Math.sin(t / 50) : 0);
      }

      // Guns: bursts of four. Shots at the plane that's going to get hit stay true once it's close enough; every
      // other shot is a near miss.
      const progress = a.dir > 0 ? a.x / W : 1 - a.x / W;
      const close = headOn ? Math.abs(a.x - b.x) < W * 0.5 : progress > 0.5;
      for (const [p, target] of shooters) {
        const gap = (target.x - p.x) * p.dir;
        if (victim.hit || p.x < 10 || p.x > W - 10 || gap < 40 || t < p.next) continue;
        p.shots++;
        p.next = t + (p.shots % 4 ? 110 : 650);
        const nx = p.x + p.dir * 20, ny = p.y + 2, vx = p.dir * (speed + 460);
        const armed = target === victim && close;
        const aimY = target.y + (armed ? 0 : (Math.random() < 0.5 ? -1 : 1) * (18 + Math.random() * 10));
        const when = Math.abs(target.x - nx) / Math.abs(vx - target.dir * speed);
        bullets.push({ x: nx, y: ny, vx, vy: (aimY - ny) / Math.max(when, 0.15), armed });
      }
      for (const u of bullets) {
        u.x += u.vx * s; u.y += u.vy * s;
        if (u.armed && !victim.hit && Math.abs(u.x - victim.x) < 15 && Math.abs(u.y - victim.y) < 7) { u.gone = true; hit(u.x, u.y); }
      }
      bullets = bullets.filter((u) => !u.gone && u.x > -20 && u.x < W + 20);

      if (victim.hit && t > smokeAt) {  // smoke from the tail while it limps off
        smokeAt = t + 60;
        puffs.push({ x: victim.x - victim.dir * 19, y: victim.y - 3, age: 0 });
      }
      for (const f of puffs) { f.age += dt; f.y -= s * 8; }
      puffs = puffs.filter((f) => f.age < 800);
      for (const k of sparks) { k.x += k.vx * s; k.y += k.vy * s; k.vy += 260 * s; k.life -= dt; }
      sparks = sparks.filter((k) => k.life > 0);

      for (const f of puffs) {
        const q = f.age / 800, size = snap(4 + 6 * q);
        g.globalAlpha = 0.7 * (1 - q);
        g.fillStyle = q < 0.25 ? "#d9d9e8" : "#5b4a8f";
        g.fillRect(snap(f.x) - size / 2, snap(f.y) - size / 2, size, size);
      }
      g.globalAlpha = 1;
      for (const p of planes) {
        g.save();
        g.translate(Math.round(p.x), Math.round(p.y));
        if (p.dir > 0) g.scale(-1, 1);  // drawn nose-left; flip it to fly right
        g.drawImage(p.frames[Math.floor(t / 60) % 2], -PW / 2, -PH / 2);
        g.restore();
      }
      for (const u of bullets) {  // tracers: a yellow streak with a white tip
        g.fillStyle = "#ffd23f"; g.fillRect(Math.round(u.x) - (u.vx > 0 ? 5 : 0), Math.round(u.y), 5, 1);
        g.fillStyle = "#ffffff"; g.fillRect(Math.round(u.x) + (u.vx > 0 ? 0 : -1), Math.round(u.y), 1, 1);
      }
      for (const k of sparks) { g.fillStyle = k.c; g.fillRect(snap(k.x), snap(k.y), 2, 2); }
      if (pow && pow.t < 650) {
        pow.t += dt;
        const size = pow.t < 100 ? 6 + pow.t / 25 : 10;
        g.globalAlpha = pow.t > 450 ? (650 - pow.t) / 200 : 1;
        g.font = `400 ${Math.round(size)}px "Press Start 2P", monospace`;
        g.textAlign = "center";
        const px = Math.round(pow.x), py = Math.round(pow.y) - 10;
        g.fillStyle = "#0b0620"; g.fillText("POW!", px + 2, py + 2);
        g.fillStyle = "#ff3ea5"; g.fillText("POW!", px + 1, py + 1);
        g.fillStyle = "#ffd23f"; g.fillText("POW!", px, py);
        g.globalAlpha = 1;
      }

      const gone = planes.every((p) => (p.dir > 0 ? p.x > W + PW : p.x < -PW));
      return !(gone && !bullets.length && !puffs.length && !sparks.length);
    };
  }

  const later = (fn, min, max) => setTimeout(fn, min + Math.random() * (max - min));
  function fireworks() {
    if (!document.hidden) {
      add(firework());
      if (Math.random() < 0.3) later(() => add(firework()), 250, 600);  // sometimes two go up together
    }
    later(fireworks, 2200, 5000);
  }
  function planes() { if (!document.hidden) add(dogfight()); later(planes, 18000, 30000); }
  later(fireworks, 600, 1200);
  later(planes, 2500, 3500);
}
