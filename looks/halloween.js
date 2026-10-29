// Halloween: a haunted hill under a full moon, in big pixels (each one 2 x 2 on screen). Lightning (now
// and then the flash shows a skull in the moon), bats, a swarm out of the house, a ghost rising off the hill, a witch
// crossing the moon, a spider on its thread, red eyes in the dark, flickering windows and jack-o'-lanterns, fog.
import { $, BAYER, art, every, inked, layer, line, pick, rnd, scene, seeded, sky, still, trim,
  across as acrossOn, gloss as glossOn, shade } from "./kit.js";

{
  const INK = "#040104", EYE = "#ff2238";
  let g, W = 0, H = 0, S = null, behind = [], over = [], eyes = [], flash = 0, skull = 0;

  const BAT = [
    ["#.........#", "##.......##", ".##.#.#.##.", "..##e#e##..", "....###...."],
    ["....#.#....", "...#e#e#...", ".#########.", "###.###.###", "#....#....#"],
  ].map((rows) => art(rows, { "#": INK, e: EYE }));
  const GHOST_TOP = [".....####.....", "...########...", "..##########..", ".############.", ".###oo##oo###.", "###ooo##ooo###", "###ooo##ooo###",
    "####o####o####", "######oo######", "#####oooo#####", "#####oooo#####", "######oo######", "##############", "##############"];
  const GHOST = [["##.###.###.###", "#...#...#...#."], ["###.###.###.##", ".#...#...#...#"]]
    .map((tail) => art([...GHOST_TOP, ...tail], { "#": "#e4ecf7", o: "#120614" }));
  const WITCH_TOP = ["..............#...........", ".............##...........", ".............###..........", "............####..........",
    "..........#########.......", "...........#####..........", "..........########........", "..........#######........."];
  const WITCH_LOW = [".################.#.......", "#################.#.......", "##########################", "#######.......##..........",
    ".####..........##........."];
  const WITCH = [["........#########.........", "......#############......."], [".........########.........", ".......############......."]]
    .map((cape) => art([...WITCH_TOP, ...cape, ...WITCH_LOW], { "#": INK }));
  const SPIDER = [
    ["#.......#", ".#.###.#.", "#.#####.#", ".##r#r##.", "#.#####.#", ".#.###.#.", "#.......#"],
    [".#.....#.", "#..###..#", ".#######.", "#.#r#r#.#", ".#######.", "#..###..#", ".#.....#."],
  ].map((rows) => art(rows, { "#": INK, r: EYE }));
  const PUMPKIN = ["....g....", ".oodgdoo.", "offoooffo", "oofooofoo", "oooodoooo", "offfffffo", ".ofofofo.", "..ooooo.."];
  const PUMPKIN_BODY = art(PUMPKIN, { o: "#e2601a", d: "#9c3c0c", g: "#3f6a22" });
  const PUMPKIN_FACE = PUMPKIN.flatMap((row, y) => [...row].flatMap((ch, x) => (ch === "f" ? [[x, y]] : [])));

  function build(spot) {
    const r = seeded(1031);
    const R = Math.round(Math.min(W * 0.24, 58));
    const moon = { x: spot.cx, y: spot.name, R }, gy = spot.ground;  // the moon behind the name, the hill line at the icons
    const hx = Math.round(W * 0.82), tx = Math.round(W * 0.12);
    const hump = (x, c, w, h) => h * Math.exp(-(((x - c) / w) ** 2));
    const ridge = (x) => Math.round(gy - 3 * Math.sin(x * 0.05 + 1.3) - 2 * Math.sin(x * 0.13 + 0.4) - hump(x, hx, 26, 9) - hump(x, tx, 20, 5));
    S = { moon, gy, ridge, windows: [], pumpkins: [], lurk: [], figure: null };

    S.back = layer(W, H, (b) => {
      // the sky, banded and dithered: black up top, blood red down at the hill
      sky(b, W, H, ["#0a0512", "#100717", "#17081a", "#20091b", "#2d0a1c", "#3d0c1d", "#52101f", "#6a1621"], gy);
      for (let n = Math.round((W * gy) / 600), i = 0; i < n; i++) {
        const x = Math.floor(r() * W), y = Math.floor(r() * (gy - 16));
        if (Math.hypot(x - moon.x, y - moon.y) < R * 1.4) continue;
        b.fillStyle = r() < 0.2 ? "#d8cfe6" : "#6e6284";
        b.fillRect(x, y, 1, 1);
      }
      const halo = b.createRadialGradient(moon.x, moon.y, R * 0.9, moon.x, moon.y, R * 3.2);
      halo.addColorStop(0, "rgba(255, 150, 100, 0.42)");
      halo.addColorStop(0.25, "rgba(220, 60, 50, 0.22)");
      halo.addColorStop(1, "rgba(120, 10, 30, 0)");
      b.fillStyle = halo;
      b.fillRect(0, 0, W, H);
      // the moon: shaded to the lower right, dark seas, craters lit on one side
      const spots = (n, size) => Array.from({ length: n }, () => {
        const a = r() * Math.PI * 2, dist = Math.sqrt(r()) * 0.75 * R;
        return { x: moon.x + Math.cos(a) * dist, y: moon.y + Math.sin(a) * dist, s: size() };
      });
      const seas = spots(5, () => R * (0.16 + r() * 0.18)), craters = spots(10, () => 1.2 + r() * R * 0.09);
      for (let y = moon.y - R; y <= moon.y + R; y++) for (let x = moon.x - R; x <= moon.x + R; x++) {
        const dx = x - moon.x, dy = y - moon.y, dist = Math.hypot(dx, dy);
        if (dist > R) continue;
        const dark = (dx * 0.55 + dy * 0.85) / R - 0.25 > (BAYER[(y & 3) * 4 + (x & 3)] / 16) * 1.4;
        let c = dark ? "#d8cba6" : "#efe6ca";
        if (seas.some((m) => Math.hypot(x - m.x, y - m.y) < m.s)) c = dark ? "#c6b78f" : "#dccfa9";
        const k = craters.find((m) => Math.hypot(x - m.x, y - m.y) < m.s);
        if (k) c = x - k.x + y - k.y > k.s * 0.5 ? "#f7f0dc" : "#bcac83";
        if (dist > R - 1) c = "#d9c39e";
        b.fillStyle = c;
        b.fillRect(x, y, 1, 1);
      }
    });

    S.front = layer(W, H, (f) => {
      // far graves on the hill, the hill, grass along its top
      f.fillStyle = INK;
      for (let x = Math.round(W * 0.24); x < W * 0.7; x += Math.round(8 + r() * 14)) {
        const y = ridge(x);
        if (r() < 0.5) { f.fillRect(x, y - 7, 1, 7); f.fillRect(x - 2, y - 5, 5, 1); } else { f.fillRect(x - 2, y - 5, 5, 5); f.fillRect(x - 1, y - 6, 3, 1); }
      }
      for (let x = 0; x < W; x++) {
        const y = ridge(x);
        f.fillStyle = INK; f.fillRect(x, y, 1, H - y);
        if (r() < 0.4) f.fillRect(x, y - 1, 1, 1);
        if (r() < 0.08) f.fillRect(x, y - 2, 1, 1);
        f.fillStyle = "#24121d"; f.fillRect(x, y + 1, 1, 1);
      }
      // the graveyard below, bigger the nearer it gets
      for (let y = gy + 16; y < H - 4; y += Math.round(14 + (y - gy) * 0.1)) {
        const s = 1 + ((y - gy) / Math.max(1, H - gy)) * 1.5;
        for (let x = r() * 24; x < W + 10; x += (16 + r() * 40) * s) {
          const gy2 = y + Math.round((r() - 0.5) * 6 * s), pumpkin = r() < 0.06, skip = r() < 0.15;
          if (skip) continue;
          grave(f, Math.round(x), gy2, s, r);
          if (pumpkin && Math.abs(x - W / 2) > 120) S.pumpkins.push({ x: Math.round(x + 4 * s), y: gy2 - 8 });  // only beside the page, never under it
        }
      }
      tree(f, tx, ridge(tx) + 1, r);
      house(f, hx, ridge(hx) + 1);
      S.pumpkins.push({ x: tx + 6, y: ridge(tx + 6) - 7 }, { x: hx + 19, y: ridge(hx + 23) - 7 });
      for (const p of S.pumpkins) f.drawImage(PUMPKIN_BODY, p.x, p.y);
      S.lurk.push([tx - 7, ridge(tx - 7) + 5], [Math.round(W * 0.93), ridge(Math.round(W * 0.93)) + 6]);
    });

    S.webs = layer(W, H, (w) => {  // cobwebs in the two top corners
      const size = Math.round(Math.min(54, W * 0.22)), spokes = [0, 0.22, 0.45, 0.7, 0.95, 1.2, 1.4, Math.PI / 2];
      w.strokeStyle = "rgba(205, 196, 220, 0.3)";
      w.lineWidth = 1;
      for (const sx of [1, -1]) {
        const cx = sx > 0 ? 0 : W, at = (a, d) => [cx + sx * Math.cos(a) * d, Math.sin(a) * d];
        for (const a of spokes) { w.beginPath(); w.moveTo(cx, 0); w.lineTo(...at(a, size)); w.stroke(); }
        for (let ring = 1; ring <= 4; ring++) {
          const d = (size * ring) / 4.4;
          w.beginPath();
          w.moveTo(...at(spokes[0], d));
          for (let i = 1; i < spokes.length; i++) w.quadraticCurveTo(...at((spokes[i - 1] + spokes[i]) / 2, d * 0.8), ...at(spokes[i], d));
          w.stroke();
        }
      }
    });

    const cw = W + 260, ch = Math.round(R * 0.9);
    S.clouds = layer(cw, ch, (c) => {  // thin dark wisps drifting across the top of the moon, lit along their tops
      const puffs = [];
      for (let k = 0; k < 3; k++) {
        const x0 = r() * cw, y0 = 5 + r() * (ch - 10), len = 30 + r() * 50;
        for (let i = 0; i < len; i += 4) puffs.push([x0 + i, y0 + Math.sin(i / 9) * 1.5, 5 + r() * 6, 1.5 + r() * 1.5]);
      }
      for (const [fill, dy] of [["#4a2a3a", -1], ["#0d0610", 0]]) {
        c.fillStyle = fill;
        for (const [x, y, rx, ry] of puffs) for (const shift of [0, -cw, cw]) { c.beginPath(); c.ellipse(x + shift, y + dy, rx, ry, 0, 0, Math.PI * 2); c.fill(); }
      }
    });
    S.cloudY = moon.y - Math.round(R * 1.05);

    const fw = W + 200;
    const fog = (alpha) => layer(fw, 36, (x) => {
      for (let i = 0; i < fw / 5; i++) {
        const ex = r() * fw, ey = 12 + r() * 16, rx = 12 + r() * 30, ry = 3 + r() * 6;
        x.fillStyle = `rgba(176, 164, 196, ${alpha * (0.4 + r() * 0.6)})`;
        for (const shift of [0, -fw, fw]) { x.beginPath(); x.ellipse(ex + shift, ey, rx, ry, 0, 0, Math.PI * 2); x.fill(); }
      }
    });
    S.fog = [{ img: fog(0.07), y: gy - 22, speed: 3 }, { img: fog(0.06), y: Math.round(gy + (H - gy) * 0.45), speed: -2 }, { img: fog(0.09), y: H - 30, speed: 2.4 }];

    S.vig = layer(W, H, (v) => {
      const dark = v.createRadialGradient(W / 2, H * 0.42, Math.min(W, H) * 0.3, W / 2, H * 0.45, Math.max(W, H) * 0.78);
      dark.addColorStop(0, "rgba(0, 0, 0, 0)");
      dark.addColorStop(1, "rgba(0, 0, 0, 0.72)");
      v.fillStyle = dark;
      v.fillRect(0, 0, W, H);
    });
  }

  function grave(f, x, y, s, r) {
    const w = Math.round(6 * s) | 1, h = Math.round(9 * s), lean = (r() - 0.5) * 2.4 * s, kind = r(), half = Math.floor(w / 2);
    f.fillStyle = "rgba(0, 0, 0, 0.6)";
    f.fillRect(x - w, y, w * 2 + 2, Math.max(1, Math.round(s)));
    for (let i = 0; i < h; i++) {
      const row = y - i, off = Math.round((lean * i) / h), down = h - 1 - i;
      let left = x - half + off, width = w;
      if (kind < 0.55) {  // a slab with a round top
        const cut = down < half ? Math.round(half - Math.sqrt(half * half - (half - down) ** 2)) : 0;
        left += cut; width -= cut * 2;
      } else if (kind < 0.85) {  // a cross
        const bar = down >= Math.round(h * 0.22) && down < Math.round(h * 0.22 + Math.max(2, s * 1.5));
        if (!bar) { const t = Math.max(1, Math.round(w / 3)); left = x - Math.floor(t / 2) + off; width = t; }
      } else {  // an obelisk
        const narrow = Math.round((i / h) * half);
        left += narrow; width -= narrow * 2;
      }
      if (width < 1) continue;
      f.fillStyle = "#1b131f"; f.fillRect(left, row, width, 1);
      f.fillStyle = "#3a2d44"; f.fillRect(left, row, 1, 1);
      f.fillStyle = "#110b14"; f.fillRect(left + width - 1, row, 1, 1);
    }
  }

  function tree(f, x, y, r) {  // dead, gnarled, reaching for the moon
    const h = Math.round(Math.max(46, Math.min(86, W * 0.3)));
    let peak = { x, y };
    f.fillStyle = INK;
    const limb = (px, py, ang, len, wid, depth) => {
      for (let i = 0; i < len; i++) {
        ang = Math.max(-Math.PI + 0.2, Math.min(-0.2, ang + (r() - 0.5) * 0.3));
        px += Math.cos(ang); py += Math.sin(ang);
        const w = Math.max(1, Math.round(wid * (1 - (i / len) * 0.45)));
        f.fillRect(Math.round(px - w / 2), Math.round(py - w / 2), w, w);
        if (py < peak.y) peak = { x: Math.round(px), y: Math.round(py) };
      }
      if (depth === 0) return;
      const n = 2 + (r() < 0.35 ? 1 : 0);
      for (let k = 0; k < n; k++) limb(px, py, ang + (k - (n - 1) / 2) * 0.75 + (r() - 0.5) * 0.4, len * (0.55 + r() * 0.2), wid * 0.62, depth - 1);
    };
    limb(x, y, -Math.PI / 2 + 0.12, h * 0.42, W > 300 ? 7 : 5, 5);
    f.fillRect(x - 6, y - 1, 13, 2); f.fillRect(x - 9, y, 4, 1); f.fillRect(x + 6, y, 5, 1);  // roots
    S.treeTop = peak;
    S.lurk.push([x - 3, Math.round(y - h * 0.2)]);  // eyes in the trunk
  }

  function house(f, cx, base) {  // the haunted house on the hill: gables, a crooked chimney, a tower with a spire
    const x0 = cx - 22, y0 = base - 46, R = (x, y, w, h) => f.fillRect(x0 + x, y0 + y, w, h);
    f.fillStyle = INK;
    R(4, 22, 29, 25);
    for (let y = 9; y <= 22; y++) { const half = Math.round((y - 9) * 1.35) + 1; R(18 - half, y, half * 2 + 1, 1); }
    R(9, 5, 4, 10); R(10, 3, 4, 3);
    R(31, 13, 10, 34);
    for (let y = 0; y <= 13; y++) { const half = Math.round(y * 0.42); R(36 - half, y, half * 2 + 1, 1); }
    R(36, -4, 1, 4); R(35, -3, 3, 1);
    S.windows = [
      { x: x0 + 8, y: y0 + 26, w: 4, h: 5, on: true }, { x: x0 + 24, y: y0 + 26, w: 4, h: 5, on: false },
      { x: x0 + 8, y: y0 + 35, w: 4, h: 5, on: false }, { x: x0 + 24, y: y0 + 35, w: 4, h: 5, on: true },
      { x: x0 + 34, y: y0 + 19, w: 4, h: 6, on: true, flicker: true }, { x: x0 + 17, y: y0 + 14, w: 3, h: 3, on: true },
    ];
    S.roost = { x: x0 + 36, y: y0 + 4 };
    S.lurk.push([x0 + 16, y0 + 40]);  // eyes in the doorway
  }

  function lights(t) {  // lit windows (the tower one sputters; now and then someone stands in one) and jack-o'-lanterns
    S.windows.forEach((w, i) => {
      const on = w.on && !(w.flicker && Math.sin(t / 47) * Math.sin(t / 113 + 1) > 0.55);
      if (on) { g.fillStyle = "rgba(255, 160, 60, 0.14)"; g.fillRect(w.x - 2, w.y - 2, w.w + 4, w.h + 4); }
      g.fillStyle = on ? "#ffad40" : "#1c0a10";
      g.fillRect(w.x, w.y, w.w, w.h);
      g.fillStyle = INK;
      if (on && S.figure && S.figure.i === i && t < S.figure.until) {
        g.fillRect(w.x + Math.floor(w.w / 2) - 1, w.y + 1, 2, 2);
        g.fillRect(w.x, w.y + 3, w.w, w.h - 3);
      }
      g.fillRect(w.x + Math.floor(w.w / 2), w.y, 1, w.h);
      g.fillRect(w.x, w.y + Math.floor(w.h / 2), w.w, 1);
    });
    S.pumpkins.forEach((p, i) => {
      const k = 0.7 + 0.3 * Math.sin(t / 70 + i * 2) * Math.sin(t / 31 + i);
      const glow = g.createRadialGradient(p.x + 4.5, p.y + 4, 1, p.x + 4.5, p.y + 4, 14);
      glow.addColorStop(0, `rgba(255, 150, 40, ${0.32 * k})`);
      glow.addColorStop(1, "rgba(255, 120, 20, 0)");
      g.fillStyle = glow;
      g.fillRect(p.x - 10, p.y - 10, 30, 28);
      g.fillStyle = k > 0.82 ? "#ffe066" : "#ffb22e";
      for (const [x, y] of PUMPKIN_FACE) g.fillRect(p.x + x, p.y + y, 1, 1);
    });
  }

  function drawEyes(t) {
    eyes = eyes.filter((e) => t - e.t0 < e.life);
    for (const e of eyes) {
      const age = t - e.t0;
      if (age > e.blink && age < e.blink + 140) continue;
      g.globalAlpha = Math.max(0, Math.min(1, age / 350, (e.life - age) / 300));
      g.fillStyle = "rgba(255, 30, 50, 0.25)"; g.fillRect(e.x - 1, e.y - 1, 9, 3);
      g.fillStyle = EYE; g.fillRect(e.x, e.y, 2, 1); g.fillRect(e.x + 5, e.y, 2, 1);
    }
    g.globalAlpha = 1;
  }

  function drawSkull(a) {
    const { x, y, R } = S.moon;
    g.globalAlpha = 0.7 * a;
    g.fillStyle = "#4a1420";
    for (const sx of [-1, 1]) { g.beginPath(); g.ellipse(x + sx * R * 0.34, y - R * 0.2, R * 0.2, R * 0.25, sx * 0.2, 0, Math.PI * 2); g.fill(); }
    g.beginPath(); g.moveTo(x, y + R * 0.05); g.lineTo(x - R * 0.09, y + R * 0.25); g.lineTo(x + R * 0.09, y + R * 0.25); g.closePath(); g.fill();
    for (let i = -4; i <= 4; i++) g.fillRect(Math.round(x + i * R * 0.1 - R * 0.035), Math.round(y + R * 0.42), Math.max(1, Math.round(R * 0.07)), Math.round(R * 0.16));
    g.globalAlpha = 1;
  }

  // Two strikes a fraction of a second apart, the sky lit a little between; at most two flashes a strike, seconds apart.
  function lightning() {
    const end = Math.random() < 0.35 && S.treeTop ? S.treeTop : (() => { const x = Math.round(rnd(0.28, 0.72) * W); return { x, y: S.ridge(x) }; })();
    const pts = [[Math.round(end.x + rnd(-0.2, 0.2) * W), 0]];
    while (pts[pts.length - 1][1] < end.y - 4) {
      const [x, y] = pts[pts.length - 1];
      const ny = Math.min(end.y, y + rnd(3, 8));
      pts.push([Math.round(x + (end.x - x) / Math.max(1, (end.y - y) / 6) + rnd(-4, 4)), Math.round(ny)]);
    }
    pts.push([end.x, end.y]);
    const forks = [0, 1].filter(() => Math.random() < 0.7).map(() => {
      const [x, y] = pts[Math.floor(rnd(0.2, 0.7) * pts.length)], d = Math.random() < 0.5 ? -1 : 1, fork = [[x, y]];
      for (let k = 0; k < 3; k++) { const [px, py] = fork[fork.length - 1]; fork.push([Math.round(px + d * rnd(3, 7)), Math.round(py + rnd(3, 7))]); }
      return fork;
    });
    const bolt = (paths, a) => {
      for (const [color, size, alpha] of [["#a58cff", 3, 0.35], ["#f6f3ff", 1, 1]]) {
        g.globalAlpha = alpha * a;
        g.fillStyle = color;
        for (const path of paths) for (let i = 1; i < path.length; i++) line(...path[i - 1], ...path[i], (x, y) => g.fillRect(x - (size >> 1), y - (size >> 1), size, size));
      }
      g.globalAlpha = 1;
    };
    const withSkull = Math.random() < 0.4;
    let t0 = null;
    return (t) => {
      t0 ??= t;
      const e = t - t0;
      flash = e < 110 ? 0.34 : e < 190 ? 0.06 : e < 300 ? 0.24 : Math.max(0, 0.24 * (1 - (e - 300) / 260));
      skull = withSkull ? Math.max(0, Math.min(1, 1 - (e - 700) / 500)) : 0;
      if (e < 110 || (e > 190 && e < 300)) bolt([pts, ...forks], 1);
      else if (e < 460) bolt([pts], 0.25);
      if (e < 1300) return true;
      flash = 0; skull = 0;
      return false;
    };
  }

  function flock(bats) {
    let t0 = null, last = null;
    return (t) => {
      t0 ??= t;
      const s = Math.min(50, t - (last ?? t)) / 1000, e = t - t0;
      last = t;
      let going = false;
      for (const b of bats) {
        if (e < b.wait) { going = true; continue; }
        b.vy *= 1 - 0.5 * s;  // a swarm climbs out, then levels off
        b.x += b.vx * s;
        b.y += (b.vy + 16 * Math.sin(t / 240 + b.phase)) * s;  // the flutter
        const k = b.big ? 2 : 1;
        g.drawImage(BAT[Math.floor(t / b.rate + b.phase) % 2], Math.round(b.x), Math.round(b.y), 11 * k, 5 * k);
        if (b.x > -30 && b.x < W + 30 && b.y > -20) going = true;
      }
      return going;
    };
  }
  const bat = (o) => ({ phase: Math.random() * 6, rate: rnd(75, 120), big: Math.random() < 0.22, ...o });
  function bats() {  // a few across the sky
    const dir = Math.random() < 0.5 ? 1 : -1, y = rnd(Math.max(6, S.moon.y - S.moon.R - 6), S.gy - 24);
    return flock(Array.from({ length: 2 + Math.floor(Math.random() * 4) }, (_, i) =>
      bat({ x: dir > 0 ? -24 : W + 2, y: y + rnd(-14, 14), vx: dir * rnd(40, 64), vy: 0, wait: i * rnd(150, 450) })));
  }
  function swarm() {  // a cloud of them pouring out of the house
    const { x, y } = S.roost, dir = x > W / 2 ? -1 : 1;
    return flock(Array.from({ length: 14 + Math.floor(Math.random() * 10) }, (_, i) =>
      bat({ x: x + rnd(-3, 3), y: y + rnd(-2, 2), vx: dir * rnd(25, 75) + rnd(-15, 15), vy: -rnd(20, 50), wait: i * rnd(50, 110) })));
  }

  function ghost() {  // rises off the hill to one side of the name, wavering, and fades into the sky
    const left = Math.random() < 0.5, x = (left ? rnd(0.06, 0.3) : rnd(0.66, 0.92)) * W, y0 = S.ridge(Math.round(x)) + 18;
    const drift = (left ? 1 : -1) * rnd(3, 7), life = rnd(7000, 10000);
    let t0 = null;
    return (t) => {
      t0 ??= t;
      const e = t - t0, gx = x + (drift * e) / 1000 + 6 * Math.sin(e / 700), gy = y0 - (15 * e) / 1000 + 2 * Math.sin(e / 400);
      const a = Math.max(0, Math.min(1, e / 1200, (life - e) / 1500)) * (0.62 + 0.12 * Math.sin(e / 300));
      const glow = g.createRadialGradient(gx, gy, 2, gx, gy, 28);
      glow.addColorStop(0, `rgba(190, 225, 255, ${0.22 * a})`);
      glow.addColorStop(1, "rgba(190, 225, 255, 0)");
      g.fillStyle = glow;
      g.fillRect(gx - 28, gy - 28, 56, 56);
      g.globalAlpha = a;
      g.drawImage(GHOST[Math.floor(e / 220) % 2], Math.round(gx - 14), Math.round(gy - 16), 28, 32);
      g.globalAlpha = 1;
      return e < life;
    };
  }

  function witch() {  // across the face of the moon
    const dir = Math.random() < 0.7 ? 1 : -1, { y: my, R } = S.moon, speed = Math.max(26, W * 0.13), y0 = my - R * 0.15 + rnd(-R * 0.25, R * 0.25);
    let t0 = null;
    return (t) => {
      t0 ??= t;
      const e = (t - t0) / 1000, x = dir > 0 ? -30 + speed * e : W + 30 - speed * e;
      const y = y0 - 8 * Math.sin((x / W) * Math.PI) + 2 * Math.sin(e * 3);
      g.save();
      g.translate(Math.round(x), Math.round(y));
      if (dir < 0) g.scale(-1, 1);
      g.drawImage(WITCH[Math.floor(e * 6) % 2], -13, -7);
      g.restore();
      return dir > 0 ? x < W + 30 : x > -30;
    };
  }

  function spider() {  // drops from a top corner on its thread, hangs there swaying, climbs back up
    const x = Math.round((Math.random() < 0.5 ? rnd(0.06, 0.18) : rnd(0.82, 0.94)) * W), low = rnd(26, 46);
    let t0 = null;
    return (t) => {
      t0 ??= t;
      const e = (t - t0) / 1000;
      const y = Math.round(e < 2.5 ? low * (1 - (1 - e / 2.5) ** 3) : e < 6.5 ? low + 1.5 * Math.sin((e - 2.5) * 3) : low * Math.max(0, 1 - (e - 6.5) / 3));
      g.fillStyle = "rgba(200, 190, 215, 0.45)";
      g.fillRect(x, 0, 1, y);
      g.drawImage(SPIDER[Math.floor(t / (e < 2.5 || e > 6.5 ? 110 : 420)) % 2], x - 4, y);
      return e < 9.5;
    };
  }

  function frame(t) {
    g.drawImage(S.back, 0, 0);
    if (skull > 0) drawSkull(skull);
    const cw = S.clouds.width, off = (t * 0.004) % cw;
    g.globalAlpha = 0.85;
    g.drawImage(S.clouds, Math.round(off - cw), S.cloudY);
    g.drawImage(S.clouds, Math.round(off), S.cloudY);
    g.globalAlpha = 1;
    behind = behind.filter((step) => step(t));
    g.drawImage(S.front, 0, 0);
    lights(t);
    drawEyes(t);
    over = over.filter((step) => step(t));
    for (const f of S.fog) {
      const fw = f.img.width, x = -((((t * f.speed) / 1000) % fw) + fw) % fw;
      g.drawImage(f.img, Math.round(x), f.y);
      g.drawImage(f.img, Math.round(x + fw), f.y);
    }
    g.drawImage(S.webs, 0, 0);
    g.drawImage(S.vig, 0, 0);
    if (flash > 0) { g.globalAlpha = flash; g.fillStyle = "#e6e0ff"; g.fillRect(0, 0, W, H); g.globalAlpha = 1; }
  }

  scene((ctx, w, h, spot) => { g = ctx; W = w; H = h; build(spot); return frame; });
  every(() => behind.push(lightning()), 8, 14, 2.2);
  every(() => over.push(bats()), 3.5, 7, 1.2);
  every(() => over.push(swarm()), 24, 36, 6.5);
  every(() => behind.push(ghost()), 15, 24, 3.5);
  every(() => over.push(witch()), 28, 42, 10);
  every(() => over.push(spider()), 30, 48, 15);
  every(() => {
    if (eyes.length >= 4) return;
    const [x, y] = Math.random() < 0.5 ? S.lurk[Math.floor(Math.random() * S.lurk.length)] : [rnd(4, W - 8), rnd(S.gy + 6, H - 6)];
    eyes.push({ x: Math.round(x), y: Math.round(y), t0: performance.now(), life: rnd(1800, 3800), blink: rnd(500, 1400) });
  }, 1.2, 2.8, 0.6);
  every(() => { S.figure = { i: Math.random() < 0.5 ? 0 : 3, until: performance.now() + 2600 }; }, 14, 26, 7);
}

// Halloween drips that look like the real thing: glossy paint runs off the bottom of the Join Discord and Get RotoBot
// buttons and green slime off the top of the RotoBot card. Each run swells into a bead; some let a drop go, which
// falls, splats where it lands and leaves a puddle that soaks away, and the run pulls back and fills again. Now and
// then a drop of blood forms on a drip of the name and falls onto the tombstones. Drawn on one see-through canvas laid
// over the name and the two cards inside the page, so it scrolls with them in one piece; it never takes a tap.
{
  let g, T;  // the trim layer (kit.trim)
  const local = (r) => T.local(r), box = (q) => T.box(q);
  const PAINT = {
    blue: { base: "#5865f2", light: "#a3abff", dark: "#28319a" },
    orange: { base: "#ff7a1a", light: "#ffbd7a", dark: "#9c3d08" },
    slime: { base: "#74d63f", light: "#d2ff9c", dark: "#2f7414" },
    blood: { base: "#d01029", light: "#ff7383", dark: "#6a0412" },
  };
  // Where each liquid runs off: the edge (left, right, y), how many runs, how long they get, where their drops land.
  const SURFACES = [
    { q: ".ticket .go", paint: PAINT.blue, edge: (r) => [r.left + 1, r.right - 1, r.bottom - 3], n: 7, len: [7, 24], floor: () => box(".rb").top + 2 },
    { q: ".btn", paint: PAINT.orange, edge: (r) => [r.left + 1, r.right - 1, r.bottom - 4], n: 6, len: [6, 17], floor: () => box(".rb").bottom - 8 },
    { q: ".rb", paint: PAINT.slime, edge: (r) => [r.left + 6, r.right - 6, r.top + 5], n: 8, len: [5, 16], floor: () => box(".code").top },
  ];
  for (const s of SURFACES) {
    s.phase = rnd(0, 6);
    s.list = Array.from({ length: s.n }, (_, i) => {
      const max = rnd(...s.len);
      return { at: (i + 0.5 + rnd(-0.3, 0.3)) / s.n, w: rnd(4.5, 8.5), max, len: rnd(0.25, 1) * max, speed: rnd(1.2, 3.4), drips: Math.random() < 0.45, wob: rnd(0, 6) };
    });
  }
  let W = 0, H = 0, drops = [], bits = [], puddles = [], beads = [], tips = [];

  function fit(layer) {  // on every reflow
    T = layer; g = T.g; W = T.W; H = T.H;
    findTips();
  }
  const across = (p, x0, x1) => acrossOn(g, p, x0, x1), shadow = (on) => shade(g, on), gloss = (x, y, r) => glossOn(g, x, y, r);

  function lip(p, x0, x1, y, t, phase) {  // the pool along the edge, slowly rippling, that the runs hang from
    g.beginPath();
    g.moveTo(x0, y - 1);
    g.lineTo(x1, y - 1);
    for (let x = x1; x > x0 - 3; x -= 3) g.lineTo(Math.max(x0, x), y + 3 + 1.3 * Math.sin(x * 0.11 + phase + t / 1100) + 0.7 * Math.sin(x * 0.29 + phase));
    g.closePath();
    const s = g.createLinearGradient(0, y - 1, 0, y + 5);
    s.addColorStop(0, p.light); s.addColorStop(0.3, p.base); s.addColorStop(1, p.dark);
    shadow(true); g.fillStyle = s; g.fill(); shadow(false);
  }

  function run(p, x, y0, w, len, swell) {  // thin at the root, a narrowing neck, a heavy bead that swells as it fills
    const r = w * (0.5 + 0.22 * swell), neck = Math.max(1, w * (0.36 - 0.16 * swell ** 3)), yb = y0 + Math.max(len, r * 1.2);
    const mid = y0 + (yb - y0) * 0.45, half = Math.max(w / 2, r) + 1;
    g.beginPath();
    g.moveTo(x - w / 2 - 3, y0 - 1);
    g.bezierCurveTo(x - w / 2, y0 + 0.5, x - neck, mid, x - r * 0.8, yb - r * 0.6);
    g.arc(x, yb, r, Math.PI + 0.6435, -0.6435, true);
    g.bezierCurveTo(x + neck, mid, x + w / 2, y0 + 0.5, x + w / 2 + 3, y0 - 1);
    g.closePath();
    shadow(true); g.fillStyle = across(p, x - half, x + half); g.fill(); shadow(false);
    if (yb - y0 > r * 2.4) {
      g.strokeStyle = "rgba(255, 255, 255, 0.3)";
      g.lineWidth = 1;
      g.beginPath(); g.moveTo(x - neck * 0.35, y0 + 2); g.quadraticCurveTo(x - neck * 0.3, mid, x - r * 0.45, yb - r * 0.75); g.stroke();
    }
    gloss(x, yb, r);
  }

  const fall = (p, x, y, r, floor) => drops.push({ p, x, y, r, vy: 15, floor });  // page coordinates, so scrolling can't drag them
  function splat(d) {
    for (let i = 0, n = 4 + Math.floor(Math.random() * 3); i < n; i++)
      bits.push({ p: d.p, x: d.x, y: d.floor, vx: rnd(-70, 70), vy: -rnd(50, 130), r: d.r * rnd(0.22, 0.42), age: 0, life: rnd(260, 460) });
    puddles.push({ p: d.p, x: d.x, y: d.floor, w: d.r * rnd(2.4, 3.4), age: 0, life: rnd(1400, 2200) });
  }

  // Blood on the name: find where its drips end by drawing the name in its font and looking for the lowest points.
  function findTips() {
    tips = [];
    const ink = inked($("h1"));
    if (!ink) return;
    const low = ink.bottoms;
    for (let col = 3; col < low.length - 3; col++) {
      const y = low[col];
      if (y < ink.base + ink.size * 0.06 || low.slice(col - 3, col + 4).some((v, i) => v > y || (v === y && i < 3))) continue;
      tips.push({ x: ink.left - T.x + col + 0.5, y: ink.top - T.y + y });
    }
  }
  const floorUnder = (x) => {  // the top of the tombstone under it, or the hill between them
    for (const a of document.querySelectorAll(".socials a")) {
      const r = local(a.getBoundingClientRect());
      if (x >= r.left + 2 && x <= r.right - 2) return r.top + 3;
    }
    return box(".socials").bottom + 24;
  };

  function frame(layer, t, dt) {

    puddles = puddles.filter((u) => (u.age += dt * 1000) < u.life);
    for (const u of puddles) {
      const k = Math.min(1, u.age / 120), x = u.x, y = u.y;
      g.globalAlpha = Math.min(1, (u.life - u.age) / (u.life * 0.4));
      g.beginPath(); g.ellipse(x, y, u.w * k, u.w * 0.26 * k + 0.5, 0, 0, Math.PI * 2);
      g.fillStyle = across(u.p, x - u.w, x + u.w); g.fill();
      g.fillStyle = "rgba(255, 255, 255, 0.35)";
      g.beginPath(); g.ellipse(x - u.w * 0.3, y - u.w * 0.08, u.w * 0.28 * k, 0.6, 0, 0, Math.PI * 2); g.fill();
      g.globalAlpha = 1;
    }

    for (const s of SURFACES) {
      const [x0, x1, y] = s.edge(box(s.q));
      lip(s.paint, x0, x1, y, t, s.phase);
      for (const u of s.list) {
        const x = x0 + (x1 - x0) * u.at;
        if (!still) {
          if (u.len < u.max) u.len = Math.min(u.max, u.len + u.speed * dt);
          else if (u.drips) {
            fall(s.paint, x, y + 3 + u.len, u.w * 0.62, s.floor());
            u.len = u.max * rnd(0.3, 0.5); u.max = rnd(...s.len); u.speed = rnd(1.2, 3.4);
          }
        }
        run(s.paint, x, y + 3, u.w, u.len + (still ? 0 : 0.6 * Math.sin(t / 700 + u.wob)), Math.min(1, u.len / u.max));
      }
    }

    beads = beads.filter((b) => {
      b.age += dt * 1000;
      const r = b.max * Math.min(1, b.age / b.grow), x = b.x, y = b.y;
      if (b.age > b.grow + 200) { fall(PAINT.blood, b.x, b.y + r, r, floorUnder(b.x)); return false; }
      g.beginPath();
      g.moveTo(x - r * 0.45, y - 0.5); g.lineTo(x + r * 0.45, y - 0.5);
      g.arc(x, y + r * 0.9, r, -0.9, Math.PI + 0.9);
      g.closePath();
      g.fillStyle = across(PAINT.blood, x - r, x + r); g.fill();
      gloss(x, y + r * 0.9, r);
      return true;
    });

    for (const d of drops) {
      d.vy += 1500 * dt; d.y += d.vy * dt;
      if (d.y + d.r >= d.floor) { splat(d); d.gone = true; continue; }
      const k = Math.min(0.5, d.vy / 1100), rx = d.r * (1 - k * 0.3), ry = d.r * (1 + k), x = d.x, y = d.y;
      g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
      shadow(true); g.fillStyle = across(d.p, x - rx, x + rx); g.fill(); shadow(false);
      gloss(x, y, Math.min(rx, ry));
    }
    drops = drops.filter((d) => !d.gone && d.y < H + 40);

    bits = bits.filter((b) => (b.age += dt * 1000) < b.life);
    for (const b of bits) {
      b.vy += 900 * dt; b.x += b.vx * dt; b.y += b.vy * dt;
      g.globalAlpha = 1 - b.age / b.life;
      g.fillStyle = b.p.base;
      g.beginPath(); g.arc(b.x, b.y, b.r, 0, Math.PI * 2); g.fill();
      g.globalAlpha = 1;
    }
  }

  trim(".rb", { fit, frame });
  every(() => {
    if (!tips.length) return;
    const t = pick(tips);
    beads.push({ x: t.x, y: t.y, age: 0, grow: rnd(700, 1300), max: rnd(1.8, 2.8) });
  }, 1.6, 3.4, 1.2);
}
