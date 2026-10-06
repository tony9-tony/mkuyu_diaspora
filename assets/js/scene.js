/* ==========================================================================
   Cinematic neighbourhood: an original, procedurally drawn isometric view of
   houses at golden hour. Roads with moving cars, swaying trees, lit windows,
   street lamps, drifting cloud shadows and birds, under a slow camera move.
   Pure SVG + CSS: no photo, nothing to download. Every house is different but
   the picture is the same on every visit (seeded random numbers).
   ========================================================================== */

const TW = 120, TH = 60;          // one ground tile on screen
const N = 20;                     // tiles per side of the ground
const BLOCK = 5;                  // a road every 5th row and column
const CX = 0, CY = (N * TH) / 2;  // screen position of the middle of the ground

const iso = (gx, gy, z = 0) => [((gx - gy) * TW) / 2 + CX, ((gx + gy) * TH) / 2 - z];
const pt = (p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`;
const poly = (points, fill, extra = "") => `<polygon points="${points.map(pt).join(" ")}" fill="${fill}" ${extra}/>`;

function rng(seed) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

function shade(hex, k) {
  const n = parseInt(hex.slice(1), 16);
  const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => Math.max(0, Math.min(255, Math.round(v * k))));
  return `rgb(${c[0]},${c[1]},${c[2]})`;
}

const GRASS = ["#587a43", "#4f7040", "#5f8247", "#4b6a3b"];
const ROOFS = ["#b4553a", "#9a4630", "#c26a46", "#3f434b", "#2f6f6a", "#c9a36b", "#8a5a3c"];
const WALLS = ["#efe0c4", "#e6d3b0", "#f3e8d2", "#dcc7a2", "#f0dcc0"];
const LEAVES = ["#2f5d34", "#3d7240", "#4b8548", "#2a5230"];

export function buildScene() {
  const rand = rng(20261006);
  const pick = (list) => list[Math.floor(rand() * list.length)];
  const ground = [], objects = [], cars = [], lamps = [];
  let windowCount = 0, treeCount = 0;

  const isRoadX = (j) => j % BLOCK === BLOCK - 1;  // a road running along i
  const isRoadY = (i) => i % BLOCK === BLOCK - 1;  // a road running along j

  for (let i = 0; i < N; i += 1) {
    for (let j = 0; j < N; j += 1) {
      const c = iso(i + 0.5, j + 0.5);
      if (Math.abs(c[0]) > 900 || c[1] < 120 || c[1] > 1090) continue; // outside anything the camera can see
      const nn = iso(i, j), ee = iso(i + 1, j), ss = iso(i + 1, j + 1), ww = iso(i, j + 1);
      const road = isRoadX(j) || isRoadY(i);
      if (road) {
        ground.push(poly([nn, ee, ss, ww], (i + j) % 2 ? "#3b3b41" : "#36363c"));
        if (isRoadX(j) && !isRoadY(i)) ground.push(`<line x1="${iso(i, j + 0.5)[0].toFixed(1)}" y1="${iso(i, j + 0.5)[1].toFixed(1)}" x2="${iso(i + 1, j + 0.5)[0].toFixed(1)}" y2="${iso(i + 1, j + 0.5)[1].toFixed(1)}" stroke="#e5cf92" stroke-width="2" stroke-dasharray="14 18" opacity=".75"/>`);
        if (isRoadY(i) && !isRoadX(j)) ground.push(`<line x1="${iso(i + 0.5, j)[0].toFixed(1)}" y1="${iso(i + 0.5, j)[1].toFixed(1)}" x2="${iso(i + 0.5, j + 1)[0].toFixed(1)}" y2="${iso(i + 0.5, j + 1)[1].toFixed(1)}" stroke="#e5cf92" stroke-width="2" stroke-dasharray="14 18" opacity=".75"/>`);
        if (isRoadX(j) && isRoadY(i)) lamps.push(iso(i + 0.5, j + 0.5, 34));
        continue;
      }
      ground.push(poly([nn, ee, ss, ww], pick(GRASS)));
      const roll = rand();
      if (roll < 0.62) {
        objects.push({ order: i + j + 0.5, svg: house(i, j) });
      } else if (roll < 0.9) {
        const trees = 1 + Math.floor(rand() * 3);
        for (let t = 0; t < trees; t += 1) objects.push({ order: i + j + 0.2 + t * 0.1, svg: tree(i + 0.25 + rand() * 0.5, j + 0.25 + rand() * 0.5) });
      } else {
        ground.push(poly([iso(i + 0.18, j + 0.18), iso(i + 0.82, j + 0.18), iso(i + 0.82, j + 0.82), iso(i + 0.18, j + 0.82)], "#d9d2c0"));
        ground.push(poly([iso(i + 0.24, j + 0.24), iso(i + 0.76, j + 0.24), iso(i + 0.76, j + 0.76), iso(i + 0.24, j + 0.76)], "#3fb4c4"));
        ground.push(poly([iso(i + 0.3, j + 0.3), iso(i + 0.7, j + 0.3), iso(i + 0.7, j + 0.7), iso(i + 0.3, j + 0.7)], "#79d6e0", 'opacity=".55"'));
      }
    }
  }

  function tree(gx, gy) {
    const base = iso(gx, gy);
    const r = 13 + rand() * 11, lift = r * 1.5;
    const leaf = pick(LEAVES);
    treeCount += 1;
    const sway = treeCount % 3 === 0 ? ` class="sway" style="animation-delay:-${(rand() * 6).toFixed(2)}s"` : "";
    return `<g${sway}><ellipse cx="${(base[0] - r * 0.5).toFixed(1)}" cy="${(base[1] + 3).toFixed(1)}" rx="${(r * 1.05).toFixed(1)}" ry="${(r * 0.5).toFixed(1)}" fill="#0b1a10" opacity=".28"/>
      <rect x="${(base[0] - 2).toFixed(1)}" y="${(base[1] - lift * 0.5).toFixed(1)}" width="4" height="${(lift * 0.55).toFixed(1)}" fill="#5a4330"/>
      <ellipse cx="${base[0].toFixed(1)}" cy="${(base[1] - lift).toFixed(1)}" rx="${r.toFixed(1)}" ry="${(r * 0.92).toFixed(1)}" fill="${leaf}"/>
      <ellipse cx="${(base[0] + r * 0.28).toFixed(1)}" cy="${(base[1] - lift - r * 0.22).toFixed(1)}" rx="${(r * 0.62).toFixed(1)}" ry="${(r * 0.55).toFixed(1)}" fill="${shade(leaf, 1.32)}"/></g>`;
  }

  function house(i, j) {
    const m = 0.14 + rand() * 0.1;
    const u0 = i + m, u1 = i + 1 - m, v0 = j + m, v1 = j + 1 - m;
    const h = 22 + rand() * 30, modern = rand() < 0.3, rh = modern ? 0 : 12 + rand() * 16;
    const wall = pick(WALLS), roof = pick(ROOFS);
    const P = (u, v, z) => iso(u, v, z);
    let s = "";
    // cast shadow on the lawn, away from the low sun
    s += poly([P(u0, v0, 0), P(u1, v0, 0), P(u1, v1, 0), P(u0, v1, 0)].map((p) => [p[0] - h * 0.9, p[1] + h * 0.3]), "#08140c", 'opacity=".26"');
    // walls: left side in shade, right side catching the sun
    s += poly([P(u0, v1, 0), P(u1, v1, 0), P(u1, v1, h), P(u0, v1, h)], shade(wall, 0.72));
    s += poly([P(u1, v1, 0), P(u1, v0, 0), P(u1, v0, h), P(u1, v1, h)], shade(wall, 1.0));
    // lit windows
    const win = (edgeA, edgeB, t0, t1) => {
      const a = [edgeA[0] + (edgeB[0] - edgeA[0]) * t0, edgeA[1] + (edgeB[1] - edgeA[1]) * t0];
      const b = [edgeA[0] + (edgeB[0] - edgeA[0]) * t1, edgeA[1] + (edgeB[1] - edgeA[1]) * t1];
      const z0 = h * 0.3, z1 = h * 0.7;
      windowCount += 1;
      const flick = windowCount % 3 === 0 ? ` class="win" style="animation-delay:-${(rand() * 5).toFixed(2)}s"` : ' opacity=".9"';
      return `<polygon points="${[[a[0], a[1] - z0], [b[0], b[1] - z0], [b[0], b[1] - z1], [a[0], a[1] - z1]].map(pt).join(" ")}" fill="#ffd488"${flick}/>`;
    };
    s += win(P(u0, v1, 0), P(u1, v1, 0), 0.2, 0.42) + win(P(u0, v1, 0), P(u1, v1, 0), 0.58, 0.8);
    s += win(P(u1, v1, 0), P(u1, v0, 0), 0.2, 0.42) + win(P(u1, v1, 0), P(u1, v0, 0), 0.58, 0.8);
    if (modern) {
      s += poly([P(u0, v0, h), P(u1, v0, h), P(u1, v1, h), P(u0, v1, h)], shade(wall, 1.08));
      s += poly([P(u0 + 0.12, v0 + 0.12, h), P(u0 + 0.45, v0 + 0.12, h), P(u0 + 0.45, v0 + 0.45, h), P(u0 + 0.12, v0 + 0.45, h)], "#7fb8c4", 'opacity=".55"'); // roof terrace / solar glass
    } else {
      const A = P((u0 + u1) / 2, (v0 + v1) / 2, h + rh);
      const n = P(u0, v0, h), e = P(u1, v0, h), so = P(u1, v1, h), w = P(u0, v1, h);
      s += `<polygon points="${[n, w, A].map(pt).join(" ")}" fill="${shade(roof, 0.7)}"/><polygon points="${[n, e, A].map(pt).join(" ")}" fill="${shade(roof, 0.98)}"/>`;
      s += `<polygon points="${[w, so, A].map(pt).join(" ")}" fill="${shade(roof, 0.8)}"/><polygon points="${[so, e, A].map(pt).join(" ")}" fill="${shade(roof, 1.2)}"/>`;
    }
    return `<g>${s}</g>`;
  }

  // traffic on the roads: each car follows a lane for ever
  const roadsX = [], roadsY = [];
  for (let k = BLOCK - 1; k < N; k += BLOCK) { roadsX.push(k); roadsY.push(k); }
  const car = (path, angle, color, dur, delay) => `<g><g transform="rotate(${angle})"><rect x="-8" y="-3.2" width="16" height="6.4" rx="2" fill="${color}"/><rect x="-2" y="-2.4" width="7" height="4.8" rx="1.4" fill="#1b1d22" opacity=".6"/><circle cx="8.4" cy="-1.6" r="1.6" fill="#fff6c4"/><circle cx="8.4" cy="1.6" r="1.6" fill="#fff6c4"/><ellipse cx="14" cy="0" rx="9" ry="3.4" fill="#ffe9a3" opacity=".22"/></g><animateMotion dur="${dur}s" begin="-${delay}s" repeatCount="indefinite" path="${path}"/></g>`;
  const CARCOL = ["#d94f4f", "#f1f1ee", "#3f78c4", "#e0b43a", "#2b2e35", "#8fb6a1"];
  roadsX.forEach((j, idx) => {
    for (let k = 0; k < 2; k += 1) {
      const a = iso(-1, j + 0.32 + k * 0.36), b = iso(N + 1, j + 0.32 + k * 0.36);
      const fwd = k === 0;
      const p = fwd ? `M${pt(a)} L${pt(b)}` : `M${pt(b)} L${pt(a)}`;
      cars.push(car(p, fwd ? 26.6 : 206.6, pick(CARCOL), 22 + rand() * 14, rand() * 30 + idx));
    }
  });
  roadsY.forEach((i, idx) => {
    for (let k = 0; k < 2; k += 1) {
      const a = iso(i + 0.32 + k * 0.36, -1), b = iso(i + 0.32 + k * 0.36, N + 1);
      const fwd = k === 0;
      const p = fwd ? `M${pt(a)} L${pt(b)}` : `M${pt(b)} L${pt(a)}`;
      cars.push(car(p, fwd ? 153.4 : -26.6, pick(CARCOL), 24 + rand() * 14, rand() * 30 + idx));
    }
  });

  objects.sort((a, b) => a.order - b.order);
  const lampSvg = lamps.map((p, n) => `<circle class="lamp" cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="16" fill="url(#dhLamp)" style="animation-delay:-${(n * 0.7).toFixed(2)}s"/><circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="2.4" fill="#fff0c0"/>`).join("");

  const cloud = (y, w, h, dur, delay) => `<g class="cloud" style="animation-duration:${dur}s;animation-delay:-${delay}s"><ellipse cx="-1300" cy="${y}" rx="${w}" ry="${h}"/><ellipse cx="-1180" cy="${y + 30}" rx="${w * 0.6}" ry="${h * 0.7}"/></g>`;
  const bird = (y, dur, delay) => `<g class="bird" style="animation-duration:${dur}s;animation-delay:-${delay}s"><path d="M-8 0 Q-4 -6 0 0 Q4 -6 8 0" fill="none" stroke="#1a1410" stroke-width="1.6" stroke-linecap="round"><animate attributeName="d" dur=".7s" repeatCount="indefinite" values="M-8 0 Q-4 -6 0 0 Q4 -6 8 0;M-8 -3 Q-4 2 0 0 Q4 2 8 -3;M-8 0 Q-4 -6 0 0 Q4 -6 8 0"/></path></g>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-700 250 1400 700" preserveAspectRatio="xMidYMid slice" overflow="visible" role="presentation" focusable="false">
    <defs>
      <radialGradient id="dhLamp"><stop offset="0" stop-color="#ffd98a" stop-opacity=".85"/><stop offset="1" stop-color="#ffd98a" stop-opacity="0"/></radialGradient>
      <linearGradient id="dhHaze" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffbf7a" stop-opacity=".62"/><stop offset=".45" stop-color="#ffbf7a" stop-opacity=".12"/><stop offset="1" stop-color="#ffbf7a" stop-opacity="0"/></linearGradient>
      <radialGradient id="dhSun" cx=".82" cy=".05" r=".7"><stop offset="0" stop-color="#fff0c8" stop-opacity=".95"/><stop offset=".35" stop-color="#ffc58a" stop-opacity=".35"/><stop offset="1" stop-color="#ffc58a" stop-opacity="0"/></radialGradient>
    </defs>
    <rect x="-2600" y="-1200" width="5200" height="3600" fill="#4d6c3d"/>
    <g>${ground.join("")}</g>
    <g>${objects.map((o) => o.svg).join("")}</g>
    <g>${cars.join("")}</g>
    <g>${lampSvg}</g>
    <g class="clouds" fill="#06130b">${cloud(520, 330, 90, 70, 10)}${cloud(760, 260, 70, 90, 55)}${cloud(380, 300, 80, 110, 80)}</g>
    <rect x="-1500" y="-300" width="3000" height="1600" fill="url(#dhHaze)" style="pointer-events:none"/>
    <rect x="-1500" y="-300" width="3000" height="1600" fill="url(#dhSun)" style="mix-blend-mode:screen;pointer-events:none"/>
    <g>${bird(330, 34, 4)}${bird(360, 38, 9)}${bird(305, 42, 17)}</g>
  </svg>`;
}

export function initScene(host) {
  if (!host || host.dataset.ready) return;
  host.dataset.ready = "1";
  host.innerHTML = buildScene();
}
