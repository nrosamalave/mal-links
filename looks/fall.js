// Fall: a harvest sunset, football weather. The sun going down behind the hill at the icons with long rays and lit
// streaks of cloud, the far hills with a little stadium's lights on, a red barn and silo, maples in full color, round
// hay bales, plowed fields. Leaves drift down in front of the page and some settle on the cards until a gust takes them,
// and now and then a little whirlwind of them spins across; geese go over in a V, a football spirals across the sky,
// crows drop onto the hay bales to peck about, now and then a blimp with MAL on its side. A squirrel runs along the
// cards, sits up to nibble an acorn and dashes off.
import { art, dither, every, layer, pick, rnd, scene, screen, seeded, sky, steps, still, tick, trim } from "./kit.js";

const LEAF = [  // a maple leaf tumbling: face on, turning, edge on, upside down
  ["o.o.o", "ooooo", ".odo.", "oodoo", "..d.."],
  ["..o..", ".ooo.", "oodoo", ".odo.", "..d.."],
  [".....", "...oo", ".ooo.", "od...", "....."],
  ["..d..", "oodoo", ".odo.", "ooooo", "o.o.o"],
];
const LEAVES = [["#d8432a", "#86210f"], ["#f07a28", "#9a4012"], ["#f2b63a", "#a06a14"], ["#b0602a", "#5e3414"]]
  .map(([o, d]) => LEAF.map((rows) => art(rows, { o, d })));
const GOOSE = [["#...#", ".#.#.", "..#.."], ["..#..", ".###.", "#...#"]].map((rows) => art(rows, { "#": "#2a0f1c" }));
const BLIMP = [0, 1].map((blink) => layer(31, 11, (b) => {  // nose left, MAL on the side, a light on the tail
  for (let y = 0; y < 11; y++) for (let x = 0; x < 28; x++) {
    const nx = (x - 13.5) / 13.5, ny = (y - 4.8) / 4.6;
    if (nx * nx + ny * ny > 1) continue;
    b.fillStyle = ny < -0.45 ? "#f1ecf7" : ny < 0.25 || (ny < 0.5 && dither(x, y, 0.5)) ? "#c9c1d8" : "#8a7f9c";
    b.fillRect(x, y, 1, 1);
  }
  b.fillStyle = "#6f6484";
  b.fillRect(24, 0, 4, 2); b.fillRect(26, 0, 3, 1); b.fillRect(24, 9, 4, 2); b.fillRect(26, 10, 3, 1); b.fillRect(27, 4, 2, 2);  // fins
  b.fillStyle = "#3a2f46"; b.fillRect(11, 9, 6, 2);  // the gondola
  b.fillStyle = "#d8432a";
  const MAL = ["#...#.##..#..", "##.##.#..##..", "#.#.#.####.#.", "#...#.#..##..", "#...#.#..####"];
  MAL.forEach((row, y) => [...row].forEach((ch, x) => ch === "#" && b.fillRect(6 + x, 2 + y, 1, 1)));
  b.fillStyle = blink ? "#ff5a4a" : "#5a1f2a"; b.fillRect(30, 5, 1, 1);
}));
const FOOTBALL = [1, 2, 3, -1].map((lace) => layer(11, 6, (b) => {  // spiraling: the laces come round every four frames
  for (let y = 0; y < 6; y++) for (let x = 0; x < 11; x++) {
    const nx = (x - 5) / 5.4, ny = (y - 2.5) / 2.9;
    if (nx * nx + ny * ny > 1) continue;
    b.fillStyle = ny < -0.4 ? "#c47a40" : ny < 0.4 ? "#8a4a22" : "#5e2e14";
    b.fillRect(x, y, 1, 1);
  }
  if (lace >= 0) for (let x = 3; x <= 7; x++) { b.fillStyle = x % 2 ? "#fff4dc" : "#d8c4a0"; b.fillRect(x, lace, 1, 1); }
}));
const SQ = { t: "#b0582a", T: "#f0a860", b: "#c8683a", h: "#c8683a", k: "#7a3a1c", e: "#1a0a08", n: "#3a1a0c", a: "#6a3a1a", A: "#d8963a", l: "#e8c49a" };
const SQUIRREL = {  // facing right
  run: [["..TTT.......", ".TtttT......", "TtTttT......", "T..ttt...k..", "....tt..hhhe", "....tbbbbhhn", "...bbbbbbl..", "..bb....bb.."],
    ["............", "..TTT.......", ".TtttT...k..", "TtT.ttT.hhhe", "T....tbbbhhn", "....bbbbbl..", "....bbbbb...", ".....b.b...."]].map((rows) => art(rows, SQ)),
  sit: art([".TTT........", "TtttT.......", "TtTttT......", "Tt.tttT..k..", "T...ttt.hhh.", ".....tthhheh", ".....ttbhhhn", "....ttbbbaA.", "....tbbblAa.", "....tbbbll..", "....bbb.bb.."], SQ),
  nibble: art([".TTT........", "TtttT.......", "TtTttT......", "Tt.tttT..k..", "T...ttt.hhh.", ".....tthhheh", ".....ttbhhhA", "....ttbbbbAa", "....tbbblll.", "....tbbbll..", "....bbb.bb.."], SQ),
};
const CROW = {  // perched facing right, and two wingbeats
  perch: art(["..kk..", ".kkkkb", "kkkk..", ".kkk..", "..k.k."], { k: "#1a0a14", b: "#4a3020" }),
  peck: art(["......", ".kk...", "kkkk..", ".kkkk.", "..k.kb"], { k: "#1a0a14", b: "#4a3020" }),
  fly: [["#...#", ".#.#.", "..#.."], [".....", "#####", "..#.."]].map((rows) => art(rows, { "#": "#1a0a14" })),
};
const pal = { red: ["#ffa448", "#d2502a", "#9a3020", "#5e1a14"], orange: ["#ffbb55", "#e8742a", "#a8441c", "#62240e"],
  gold: ["#ffd76a", "#e6a632", "#a0661a", "#5a3410"] };

let g, W = 0, H = 0, S = null;
const behind = steps(), over = steps();

function build(spot) {
  const r = seeded(921);
  const { cx, ground } = spot, R = Math.round(Math.min(W * 0.17, 40));
  const sun = { x: cx, y: ground + 2, R };
  const hump = (x, c, w, h) => h * Math.exp(-(((x - c) / w) ** 2));
  const bx = Math.round(W - Math.max(26, W * 0.13)), tx = Math.round(Math.max(10, W * 0.06)), sx = Math.round(W > 300 ? cx - 140 : Math.max(W * 0.24, cx - R - 22));  // the stadium clear of the name on wide screens
  const far = (x) => Math.round(ground - 7 - 3 * Math.sin(x * 0.04 + 0.8) - 2 * Math.sin(x * 0.11));
  const ridge = (x) => Math.round(ground - 2 * Math.sin(x * 0.05 + 1.3) - 1.5 * Math.sin(x * 0.13 + 0.4) - hump(x, bx, 24, 5) - hump(x, tx, 20, 4));
  S = { sun, ground, ridge, lamps: [], windows: [], bales: [] };

  S.back = layer(W, H, (b) => {
    sky(b, W, H, ["#1e0f2c", "#2b1238", "#3e163c", "#57193d", "#74223c", "#952f37", "#b74431", "#d6612b", "#ec8a2f", "#f7b347"], ground);
    for (let n = Math.round(W / 9), i = 0; i < n; i++) {  // the first stars, high up
      b.fillStyle = r() < 0.3 ? "#e8c8d8" : "#8a5a7a";
      b.fillRect(Math.floor(r() * W), Math.floor(r() * ground * 0.3), 1, 1);
    }
    const glow = b.createRadialGradient(sun.x, sun.y, R * 0.8, sun.x, sun.y, R * 3.6);
    glow.addColorStop(0, "rgba(255, 214, 120, 0.55)");
    glow.addColorStop(0.35, "rgba(255, 150, 70, 0.22)");
    glow.addColorStop(1, "rgba(255, 120, 60, 0)");
    b.fillStyle = glow;
    b.fillRect(0, 0, W, ground + 4);
    for (let y = sun.y - R; y <= sun.y; y++) for (let x = sun.x - R; x <= sun.x + R; x++) {  // the sun, banded with thin cloud
      const d = Math.hypot(x - sun.x, y - sun.y) / R;
      if (d > 1) continue;
      let c = d < 0.5 || (d < 0.62 && dither(x, y, (0.62 - d) / 0.12)) ? "#fff4c4" : d < 0.82 || (d < 0.9 && dither(x, y, (0.9 - d) / 0.08)) ? "#ffd66e" : "#ffb347";
      const band = (sun.y - y) % 9;
      if (band === 3 || (band === 4 && dither(x, y, 0.5))) c = "#f39a48";
      b.fillStyle = c;
      b.fillRect(x, y, 1, 1);
    }
  });

  const cw = W + 320;
  const clouds = (n, top, bottom, lit) => layer(cw, ground, (c) => {  // long thin streaks, lit from below by the sun
    const puffs = [];
    for (let k = 0; k < n; k++) {
      const x0 = r() * cw, y0 = top + r() * (bottom - top), len = 30 + r() * 70;
      for (let i = 0; i < len; i += 3) puffs.push([x0 + i, y0 + Math.sin(i / 11) * 1.2, 4 + r() * 9 * Math.sin((i / len) * Math.PI + 0.2), 1 + r() * 1.6]);
    }
    for (const [fill, dy] of [[lit, 1], ["#4e1d40", 0]]) {
      c.fillStyle = fill;
      for (const [x, y, rx, ry] of puffs) for (const shift of [0, -cw, cw]) { c.beginPath(); c.ellipse(x + shift, y + dy, Math.max(1, rx), ry, 0, 0, Math.PI * 2); c.fill(); }
    }
  });
  S.clouds = [{ img: clouds(4, 6, ground * 0.45, "#a8466a"), speed: 1.2 }, { img: clouds(4, ground * 0.45, ground * 0.85, "#ff9a5c"), speed: 2.2 }];

  S.front = layer(W, H, (f) => {
    // the far hills, hazy, with a treeline and the stadium
    for (let x = 0; x < W; x++) {
      const y = far(x), bump = r() < 0.5 ? 1 + Math.floor(r() * 2) : 0;
      f.fillStyle = "#6a2a44"; f.fillRect(x, y - bump, 1, ground + 8 - y + bump);
      f.fillStyle = "#8a3a4c"; f.fillRect(x, y - bump, 1, 1);
    }
    const sy = far(sx);
    f.fillStyle = "#4a1c38";
    for (let i = 0; i < 6; i++) f.fillRect(sx - 12 + i, sy - 5 + i, 25 - i * 2, 1);  // the bleachers, both sides
    f.fillRect(sx - 12, sy - 5, 25, 1);
    for (const lx of [sx - 14, sx + 14]) {
      f.fillStyle = "#3a1630"; f.fillRect(lx, sy - 16, 1, 16);
      S.lamps.push({ x: lx - 2, y: sy - 18 });
    }
    S.field = { x: sx, y: sy - 3 };
    // the hill, rim-lit where the sun is behind it
    for (let x = 0; x < W; x++) {
      const y = ridge(x), near = Math.max(0, 1 - Math.abs(x - sun.x) / (R * 2.2));
      for (let yy = y; yy < H; yy++) {
        const k = (yy - y) / Math.max(1, H - y), rowGap = Math.round(2 + (yy - y) * 0.07), furrow = (yy - y) % rowGap === 0;
        f.fillStyle = furrow ? (k < 0.15 ? "#52243a" : "#3a1a22") : k < 0.08 ? "#3c1a2c" : dither(x, yy, k * 1.4) ? "#1e0d12" : "#2c141c";
        f.fillRect(x, yy, 1, 1);
      }
      f.fillStyle = near > 0.5 ? "#ffb45a" : near > 0 ? "#e0703a" : "#8a3438";
      f.fillRect(x, y, 1, 1);
      if (r() < 0.35) f.fillRect(x, y - 1, 1, 1);  // grass on the skyline
    }
    for (let i = 0, n = Math.round((W * (H - ground)) / 160); i < n; i++) {  // fallen leaves in the field, more up close
      const x = Math.floor(r() * W), y = Math.round(ridge(x) + 3 + r() ** 0.7 * (H - ground));
      f.fillStyle = pick([pal.red[1], pal.orange[1], pal.gold[1], "#7a3418"]);
      f.fillRect(x, y, 1 + (y > ground + (H - ground) * 0.5 && r() < 0.5 ? 1 : 0), 1);
    }
    // a treeline along the hill, kept clear of the sun and the barn
    for (let x = 4; x < W; x += Math.round(9 + r() * 16)) {
      if (Math.abs(x - sun.x) < R + 8 || Math.abs(x - bx) < 20 || Math.abs(x - tx) < 22) continue;
      maple(f, x, ridge(x) + 1, 12 + r() * 10, r, pick([pal.red, pal.orange, pal.gold]));
    }
    maple(f, tx, ridge(tx) + 1, Math.max(40, Math.min(70, W * 0.26)), r, pal.red);
    barn(f, bx, ridge(bx) + 1);
    for (const x of [6, 18, W - 26, W - 12]) bale(f, x, ridge(x) + 7 + Math.round(r() * 4));  // hay bales beside the page
    if (W > 420) for (const x of [cx - 250, cx + 250]) maple(f, x, Math.round(ground + (H - ground) * 0.55), 70 + r() * 20, r, pick([pal.orange, pal.gold]));
  });

  S.haze = layer(W, 24, (h) => {  // the warm haze on the horizon
    const s = h.createLinearGradient(0, 0, 0, 24);
    s.addColorStop(0, "rgba(255, 170, 110, 0)"); s.addColorStop(0.75, "rgba(255, 170, 110, 0.16)"); s.addColorStop(1, "rgba(255, 170, 110, 0)");
    h.fillStyle = s; h.fillRect(0, 0, W, 24);
  });
}

function maple(f, x, base, h, r, [rim, lit, mid, dark]) {  // trunk and branches, a lumpy crown of leaf clumps lit toward the sun
  const lx = Math.sign(S.sun.x - x) || 1, len = Math.hypot(1, 0.4), L = [lx / len, 0.4 / len];
  const C = { x, y: base - h * 0.66 }, rx = h * 0.4, ry = h * 0.33;
  f.fillStyle = "#26100c";
  const tw = h > 30 ? 3 : 1;
  f.fillRect(Math.round(x - tw / 2), Math.round(C.y), tw, Math.round(base - C.y));
  if (h > 30) {
    for (const [dx, dy] of [[-1, -0.9], [1, -1], [-0.6, -1.2]]) {  // limbs reaching into the crown
      const y0 = base - h * (0.3 + r() * 0.15);
      for (let i = 0; i < h * 0.3; i++) f.fillRect(Math.round(x + dx * i * 0.7), Math.round(y0 + dy * i * 0.7), 2, 1);
    }
    f.fillRect(x - 3, base, 7, 1);
  }
  const clumps = [{ x: C.x, y: C.y, r: Math.min(rx, ry) * 0.75 }, ...Array.from({ length: Math.round(h / 3) }, () => {
    const a = r() * Math.PI * 2, d = 0.45 + r() * 0.5;
    return { x: C.x + Math.cos(a) * rx * d, y: C.y + Math.sin(a) * ry * d, r: h * (0.09 + r() * 0.09) };
  })];
  const x0 = Math.floor(C.x - rx * 1.3), x1 = Math.ceil(C.x + rx * 1.3), y0 = Math.floor(C.y - ry * 1.4), y1 = Math.ceil(C.y + ry * 1.4);
  for (let py = y0; py <= y1; py++) for (let px = x0; px <= x1; px++) {
    let best = null, depth = 0;
    for (const b of clumps) { const d = b.r - Math.hypot(px - b.x, py - b.y); if (d > depth) { depth = d; best = b; } }
    if (!best || (depth < 1 && r() < 0.4)) continue;  // a ragged edge
    const whole = ((px - C.x) / rx) * L[0] + ((py - C.y) / ry) * L[1], clump = ((px - best.x) / best.r) * L[0] + ((py - best.y) / best.r) * L[1];
    const light = 0.55 * whole + 0.45 * clump + (r() - 0.5) * 0.45;  // the noise breaks it into leaves
    f.fillStyle = light > 0.55 && depth < 2.5 ? rim : light > 0.12 ? lit : light > -0.32 ? mid : dark;
    f.fillRect(px, py, 1, 1);
  }
}

function barn(f, cx, base) {  // a red barn with a gambrel roof, a lit hayloft, and a silo
  const x0 = cx - 9, R = (x, y, w, h, c) => { f.fillStyle = c; f.fillRect(x0 + x, base + y, w, h); };
  R(0, -11, 19, 11, "#7a2418");
  R(0, -11, 1, 11, "#e0703a");  // the sun catches its edge
  [21, 19, 17, 13, 9, 5].forEach((w, i) => R(9 - (w >> 1), -12 - i, w, 1, "#3a1418"));
  [21, 19, 17, 13, 9, 5].forEach((w, i) => R(9 - (w >> 1), -12 - i, 1, 1, "#ffa14a"));
  R(6, -7, 7, 7, "#4e140e");
  f.fillStyle = "#c8b8a4";
  for (let i = 0; i < 7; i++) { f.fillRect(x0 + 6 + i, base - 7 + i, 1, 1); f.fillRect(x0 + 12 - i, base - 7 + i, 1, 1); }
  R(6, -8, 7, 1, "#c8b8a4");
  S.windows.push({ x: x0 + 8, y: base - 15, w: 3, h: 2 });
  R(21, -20, 6, 20, "#5a4652");
  R(21, -20, 1, 20, "#e08a5a");
  for (let y = -17; y < 0; y += 4) R(21, y, 6, 1, "#463642");
  [4, 6, 6].forEach((w, i) => R(24 - (w >> 1), -21 - (2 - i), w, 1, i ? "#6a5462" : "#e08a5a"));
}

function bale(f, x, y) {  // a round hay bale, its rolled end toward us
  for (let py = -4; py <= 4; py++) for (let px = -4; px <= 4; px++) {
    const d = Math.hypot(px, py);
    if (d > 4.3) continue;
    f.fillStyle = px + py > 3 ? "#6e4a18" : Math.abs(d - 2.2) < 0.6 ? "#8e6424" : "#c08c36";
    f.fillRect(x + px, y + py, 1, 1);
  }
  f.fillStyle = "rgba(0, 0, 0, 0.4)"; f.fillRect(x - 4, y + 5, 10, 1);
  S.bales.push({ x, top: y - 4 });
}

function football() {  // a long pass from one side of the sky to the other, spiraling
  const dir = Math.random() < 0.5 ? 1 : -1, time = rnd(2.4, 3.2), y0 = S.ground - rnd(6, 24), y1 = S.ground - rnd(6, 24), high = rnd(S.ground * 0.45, S.ground * 0.7);
  const x0 = dir > 0 ? -12 : W + 12, span = dir * (W + 24);
  let t0 = null;
  return (t) => {
    t0 ??= t;
    const k = (t - t0) / 1000 / time;
    if (k > 1) return false;
    const y = y0 + (y1 - y0) * k - 4 * high * k * (1 - k);
    g.save();
    g.translate(Math.round(x0 + span * k), Math.round(y));
    g.rotate(Math.atan2(y1 - y0 - 4 * high * (1 - 2 * k), Math.abs(span)) * dir);  // nose along the flight
    if (dir < 0) g.scale(-1, 1);
    g.drawImage(FOOTBALL[Math.floor(t / 70) % 4], -5, -3);
    g.restore();
    return true;
  };
}

function crow() {  // flaps down onto a hay bale from its own side, pecks about, turns round, and flies off
  const b = pick(S.bales), from = b.x < W / 2 ? -1 : 1, stay = rnd(4, 7);
  const sky = { x: b.x + from * rnd(45, 75), y: rnd(6, S.ground * 0.5) }, perch = { x: b.x - 3, y: b.top - 5 };
  let t0 = null;
  return (t) => {
    t0 ??= t;
    const e = (t - t0) / 1000;
    let x, y, img, face = -from;
    if (e < 2) {
      const k = e / 2, ease = 1 - (1 - k) ** 2;
      x = sky.x + (perch.x - sky.x) * ease; y = sky.y + (perch.y - sky.y) * k ** 0.7;
      img = k > 0.9 ? CROW.perch : CROW.fly[Math.floor(t / 110) % 2];
    } else if (e < 2 + stay) {
      x = perch.x; y = perch.y;
      img = Math.sin(e * 3.1) * Math.sin(e * 1.3) > 0.35 ? CROW.peck : CROW.perch;
      if (e > 2 + stay * 0.6) face = from;
    } else {
      const k = (e - 2 - stay) / 2;
      if (k > 1) return false;
      x = perch.x + from * k * 90; y = perch.y - k * 70 - 8 * Math.sin(k * Math.PI);
      img = CROW.fly[Math.floor(t / 110) % 2];
    }
    g.save();
    g.translate(Math.round(x), Math.round(y));
    if (face < 0) { g.scale(-1, 1); g.translate(-img.width, 0); }
    g.drawImage(img, 0, 0);
    g.restore();
    return true;
  };
}

function geese() {  // a V of geese across the sky, wings beating out of step
  const dir = Math.random() < 0.5 ? 1 : -1, n = 5 + Math.floor(Math.random() * 6), speed = rnd(20, 28), y = rnd(10, S.ground * 0.55);
  const birds = Array.from({ length: n }, (_, i) => ({ back: Math.ceil(i / 2) * 7, side: (i % 2 ? -1 : 1) * Math.ceil(i / 2) * 4, phase: Math.random() * 400 }));
  let t0 = null;
  return (t) => {
    t0 ??= t;
    const lead = (dir > 0 ? -10 : W + 10) + dir * speed * ((t - t0) / 1000);
    for (const b of birds) g.drawImage(GOOSE[Math.floor((t + b.phase) / 190) % 2], Math.round(lead - dir * b.back), Math.round(y + b.side + Math.sin((t + b.phase) / 600)));
    return dir > 0 ? lead - 40 < W : lead + 40 > 0;
  };
}

function blimp() {  // drifts over the stadium and on across the sky
  const dir = Math.random() < 0.5 ? 1 : -1, y = Math.max(6, S.field.y - 30 - rnd(0, 12)), speed = rnd(5, 7);
  let t0 = null;
  return (t) => {
    t0 ??= t;
    const x = (dir > 0 ? -34 : W + 3) + dir * speed * ((t - t0) / 1000);
    g.save();
    g.translate(Math.round(x), Math.round(y + Math.sin(t / 1700)));
    if (dir > 0) { g.scale(-1, 1); g.translate(-31, 0); }
    g.drawImage(BLIMP[Math.floor(t / 700) % 2], 0, 0);
    g.restore();
    return dir > 0 ? x < W + 2 : x > -34;
  };
}

function frame(t) {
  g.drawImage(S.back, 0, 0);
  g.save();  // the sun's rays, slowly breathing
  g.globalCompositeOperation = "lighter";
  for (let k = 0; k < 9; k++) {
    const a = -Math.PI + ((k + 0.5) / 9) * Math.PI, w = 0.07 + 0.02 * Math.sin(k * 2.3), L = W + H;
    g.fillStyle = `rgba(255, 190, 110, ${0.05 + 0.025 * Math.sin(t / 2600 + k * 1.7)})`;
    g.beginPath(); g.moveTo(S.sun.x, S.sun.y);
    g.lineTo(S.sun.x + Math.cos(a - w) * L, S.sun.y + Math.sin(a - w) * L); g.lineTo(S.sun.x + Math.cos(a + w) * L, S.sun.y + Math.sin(a + w) * L);
    g.fill();
  }
  g.restore();
  for (const c of S.clouds) {
    const cw = c.img.width, off = ((t * c.speed) / 1000) % cw;
    g.drawImage(c.img, Math.round(off - cw), 0);
    g.drawImage(c.img, Math.round(off), 0);
  }
  behind.run(t);
  g.drawImage(S.haze, 0, S.ground - 18);
  g.drawImage(S.front, 0, 0);
  g.save();
  g.globalCompositeOperation = "lighter";  // the stadium lights and their glow over the field
  const field = g.createRadialGradient(S.field.x, S.field.y, 0, S.field.x, S.field.y, 20);
  field.addColorStop(0, "rgba(255, 236, 190, 0.22)"); field.addColorStop(1, "rgba(255, 236, 190, 0)");
  g.fillStyle = field; g.fillRect(S.field.x - 20, S.field.y - 20, 40, 40);
  for (const l of S.lamps) {
    const k = 0.9 + 0.1 * Math.sin(t / 90 + l.x), glow = g.createRadialGradient(l.x + 2, l.y + 1, 0, l.x + 2, l.y + 1, 9);
    glow.addColorStop(0, `rgba(255, 240, 200, ${0.45 * k})`); glow.addColorStop(1, "rgba(255, 240, 200, 0)");
    g.fillStyle = glow; g.fillRect(l.x - 8, l.y - 8, 20, 18);
  }
  g.restore();
  for (const l of S.lamps) { g.fillStyle = "#fff6dc"; g.fillRect(l.x, l.y, 5, 2); }
  for (const w of S.windows) { g.fillStyle = Math.sin(t / 400) * Math.sin(t / 170) > 0.8 ? "#ffb04a" : "#ffd27a"; g.fillRect(w.x, w.y, w.w, w.h); }
  over.run(t);
}

scene((ctx, w, h, spot) => { g = ctx; W = w; H = h; build(spot); return frame; });
every(() => behind.add(geese()), 16, 26, 3);
every(() => behind.add(blimp()), 75, 110, 6);
every(() => behind.add(football()), 14, 24, 1.5);
every(() => { if (!over.size) over.add(crow()); }, 9, 16, 4);

// Leaves in front of the page: a few always drifting down, and now and then a gust of them
if (!still) {
  const F = screen("#front"), leaves = [];
  let wind = 0;
  const leaf = (o) => ({ c: pick(LEAVES), s: Math.random() < 0.3 ? 3 : 2, phase: rnd(0, 6), spin: rnd(140, 260), sway: rnd(14, 34), vy: rnd(22, 40), vx: 0, ...o });
  for (let i = 0; i < 7; i++) leaves.push(leaf({ x: rnd(0, innerWidth), y: rnd(-innerHeight, innerHeight) }));
  every(() => {  // a gust: a stream of leaves blows across, and the ones already falling get pushed along
    const dir = Math.random() < 0.5 ? 1 : -1;
    wind = dir * rnd(90, 150);
    for (let i = 0, n = 10 + Math.floor(Math.random() * 8); i < n; i++)
      leaves.push(leaf({ x: dir > 0 ? -rnd(10, 200) : F.W + rnd(10, 200), y: rnd(0, F.H * 0.75), vx: dir * rnd(150, 260), vy: rnd(5, 30), gust: true }));
  }, 11, 18, 5);
  let whirls = [];
  every(() => {  // a little whirlwind: leaves spinning up a funnel as it wanders across the bottom of the screen
    const dir = Math.random() < 0.5 ? 1 : -1;
    whirls.push({ dir, x: dir > 0 ? -50 : F.W + 50, y: F.H * rnd(0.62, 0.88), v: rnd(45, 70),
      bits: Array.from({ length: 22 }, (_, i) => ({ a: rnd(0, 6.3), up: (i / 22) * 110, spin: rnd(3.5, 5.5), c: pick(LEAVES), phase: rnd(0, 6) })) });
  }, 22, 36, 8);
  tick((t, dt) => {
    const { g: c, W: w, H: h } = F;
    c.clearRect(0, 0, w, h);
    for (const wh of whirls) {
      wh.x += wh.dir * wh.v * dt;
      const sway = 10 * Math.sin(t / 700);
      c.strokeStyle = "rgba(255, 214, 160, 0.22)"; c.lineWidth = 1.5;  // the dust swirling round the funnel
      for (let k = 0; k < 5; k++) {
        const up = 8 + k * 22, r = 6 + up * 0.32, a = t / 160 + k * 1.9;
        c.beginPath(); c.ellipse(wh.x + sway * (up / 110), wh.y - up, r, r * 0.22, 0, a, a + 2.2); c.stroke();
      }
      for (const b of wh.bits) {
        b.a += b.spin * dt; b.up = (b.up + 34 * dt) % 110;
        const r = 5 + b.up * 0.32, near = Math.sin(b.a) > 0, size = near ? 12 : 8;
        c.globalAlpha = Math.min(1, (110 - b.up) / 30, b.up / 8);
        c.drawImage(b.c[Math.floor((t + b.phase * 100) / 130) % 4], Math.round(wh.x + Math.cos(b.a) * r + sway * (b.up / 110)), Math.round(wh.y - b.up + Math.sin(b.a) * r * 0.22), size, size);
      }
      c.globalAlpha = 1;
    }
    whirls = whirls.filter((wh) => wh.x > -80 && wh.x < w + 80);
    wind *= 1 - 0.7 * dt;
    for (const l of leaves) {
      l.y += l.vy * dt;
      l.x += (l.vx + wind) * dt + Math.cos(t / 900 + l.phase) * l.sway * dt;
      if (l.gust) l.vx *= 1 - 0.15 * dt;
      else if (l.y > h + 20 || l.x < -40 || l.x > w + 40) Object.assign(l, leaf({ x: rnd(0, w), y: -20 }));
      const size = 5 * l.s;
      c.drawImage(l.c[Math.floor((t + l.phase * 100) / l.spin) % 4], Math.round(l.x), Math.round(l.y), size, size);
    }
    for (let i = leaves.length - 1; i >= 0; i--) if (leaves[i].gust && (leaves[i].x < -60 || leaves[i].x > w + 260 || leaves[i].y > h + 20)) leaves.splice(i, 1);
  });
}

// Leaves that settle on the cards: one drifts down onto the top of a card or an icon, rests there a while, then a gust
// lifts it off and away. And now and then the squirrel.
{
  let T = null, landing = [], critter = null;
  const tops = () => [
    ...[...document.querySelectorAll(".socials a")].map((a) => [T.box(a), 0]),
    [T.box(".ticket"), -4], [T.box(".rb"), 0], ...[...document.querySelectorAll(".row")].map((a) => [T.box(a), 0]),
  ].filter(([b]) => b.width > 0);
  const land = (rest) => {
    const [b, lift] = pick(tops()), x = rnd(b.left + 4, b.right - 14), y = b.top + lift - 8;
    return { c: pick(LEAVES), x, y: rest ? y : y - rnd(70, 150), floor: y, phase: rnd(0, 6), rest: rest ? 1e9 : rnd(5000, 12000), face: Math.random() < 0.5 ? 0 : 1, age: 0 };
  };
  const squirrel = () => {  // runs in along the top of a card, sits up to nibble an acorn, then dashes off the other end
    const wide = tops().filter(([b]) => b.width > 150), seen = wide.filter(([b]) => b.top + T.y > 60 && b.top + T.y < innerHeight - 40);  // a card on screen
    const [b, lift] = pick(seen.length ? seen : wide), dir = Math.random() < 0.5 ? 1 : -1, speed = 170, sit = rnd(2.5, 4.5);
    const floor = b.top + lift + 1, start = dir > 0 ? -26 : T.W + 2, stop = b.left + b.width * rnd(0.25, 0.75) - 12, end = dir > 0 ? T.W + 2 : -26;
    const there = Math.abs(stop - start) / speed, gone = there + sit + Math.abs(end - stop) / speed;
    let t0 = null;
    return (c, t) => {
      t0 ??= t;
      const e = (t - t0) / 1000;
      if (e > gone) return false;
      const running = e < there || e > there + sit, x = e < there ? start + dir * speed * e : e < there + sit ? stop : stop + dir * speed * (e - there - sit);
      const img = running ? SQUIRREL.run[Math.floor(t / 70) % 2] : Math.sin((e - there) * 9) > 0.2 && e - there > 0.5 ? SQUIRREL.nibble : SQUIRREL.sit;
      c.save();
      c.translate(Math.round(x), floor - img.height * 2 - (running ? (Math.floor(t / 70) % 2) * 2 : 0));
      if (dir < 0) { c.scale(-1, 1); c.translate(-24, 0); }
      c.drawImage(img, 0, 0, img.width * 2, img.height * 2);
      c.restore();
      return true;
    };
  };
  trim("a.row:last-of-type", {
    fit(layer) {
      T = layer;
      T.g.imageSmoothingEnabled = false;
      if (still) {
        landing = [land(true), land(true), land(true)];
        const rb = T.box(".rb");
        critter = (c) => (c.drawImage(SQUIRREL.sit, Math.round(rb.right - 70), rb.top - 21, 24, 22), true);  // sitting on the RotoBot card
      }
    },
    frame({ g: c }, t, dt) {
      if (critter && !critter(c, t)) critter = null;
      for (const l of landing) {
        l.age += dt * 1000;
        if (l.y < l.floor) {  // drifting down
          l.y = Math.min(l.floor, l.y + 34 * dt);
          l.x += Math.cos(t / 700 + l.phase) * 22 * dt;
          c.drawImage(l.c[Math.floor(t / 200 + l.phase) % 4], Math.round(l.x), Math.round(l.y), 10, 10);
          l.landed = l.age;
          continue;
        }
        const off = l.age - l.landed - l.rest;
        if (off < 0) { c.drawImage(l.c[l.face], Math.round(l.x), Math.round(l.y), 10, 10); continue; }
        l.dir ??= Math.random() < 0.5 ? 1 : -1;  // blown away
        c.globalAlpha = Math.max(0, 1 - off / 1400);
        c.drawImage(l.c[Math.floor(t / 120) % 4], Math.round(l.x + l.dir * off * 0.12), Math.round(l.y - off * 0.03 - 6 * Math.sin(off / 300)), 10, 10);
        c.globalAlpha = 1;
        l.gone = off > 1400;
      }
      landing = landing.filter((l) => !l.gone);
    },
  });
  every(() => { if (T && landing.length < 5) landing.push(land(false)); }, 2.5, 5.5, 1.5);
  every(() => { if (T && !critter) critter = squirrel(); }, 14, 24, 3);
}
