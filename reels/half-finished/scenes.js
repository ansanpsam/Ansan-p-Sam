// The folder called final. One scene per beat. Every frame is a pure function of t.
// UNVERIFIED: written without a render pass (see report). Framing targets: screen between y 250 and 1200.
export default (kit) => {
  const { O, room, cam, drift, prog, ease, lerp, clamp, clay, metal, glow, rbox, cyl, sphere, panel, spill, motes, THREE } = kit;

  const AMBER = '#ffb547';

  // ---------- screen painters (canvas) ----------
  const bg = (x, w, h, top = '#1b2433', bot = '#0d121b') => {
    const gr = x.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, top); gr.addColorStop(1, bot);
    x.fillStyle = gr; x.fillRect(0, 0, w, h);
  };
  const folder = (x, cx, cy, s, name, o = {}) => {
    const fw = s, fh = s * 0.74;
    x.save(); x.translate(cx + (o.dx || 0), cy); x.rotate(o.rot || 0);
    x.fillStyle = o.tab || '#d98a1f';
    x.beginPath(); x.roundRect(-fw / 2, -fh / 2 - s * 0.1, fw * 0.42, s * 0.16, s * 0.04); x.fill();
    x.fillStyle = o.color || AMBER;
    x.beginPath(); x.roundRect(-fw / 2, -fh / 2, fw, fh, s * 0.06); x.fill();
    x.restore();
    if (name !== undefined) {
      x.fillStyle = o.text || '#f4efe6'; x.textAlign = 'center'; x.textBaseline = 'top';
      x.font = `700 ${s * (o.size || 0.24)}px Inter`;
      x.fillText(name, cx, cy + fh / 2 + s * 0.08);
      if (o.caret) { const tw = x.measureText(name).width; x.fillRect(cx + tw / 2 + s * 0.02, cy + fh / 2 + s * 0.08, s * 0.025, s * 0.26); }
    }
  };
  const arrow = (x, px, py, s) => {
    x.fillStyle = '#ffffff'; x.strokeStyle = '#000'; x.lineWidth = s * 0.08;
    x.beginPath(); x.moveTo(px, py); x.lineTo(px, py + s); x.lineTo(px + s * 0.28, py + s * 0.74); x.lineTo(px + s * 0.5, py + s * 1.1);
    x.lineTo(px + s * 0.62, py + s * 1.04); x.lineTo(px + s * 0.42, py + s * 0.68); x.lineTo(px + s * 0.76, py + s * 0.68); x.closePath(); x.stroke(); x.fill();
  };
  // A document page: grey text bars. cut < 1 stops the last line partway with a caret.
  const page = (x, w, h, o = {}) => {
    bg(x, w, h, '#2a2f38', '#1d2129');
    const px = w * 0.12, pw = w * 0.76, py = h * 0.08, ph = h * 0.86;
    x.fillStyle = '#f3efe7'; x.fillRect(px, py, pw, ph);
    x.fillStyle = '#20232a'; x.textAlign = 'left'; x.textBaseline = 'top';
    x.font = `800 ${h * 0.085}px Inter`; x.fillText(o.title || 'PLAN', px + pw * 0.08, py + ph * 0.06);
    const lines = o.lines ?? 6, lens = [0.92, 0.84, 0.95, 0.7, 0.88, 0.8, 0.9];
    for (let i = 0; i < lines; i++) {
      const last = i === lines - 1, L = lens[i % lens.length] * (last && o.cut ? o.cut : 1);
      const ly = py + ph * (0.26 + i * 0.1);
      x.fillStyle = o.hi === i ? AMBER : '#9aa0a8';
      x.fillRect(px + pw * 0.08, ly, pw * 0.84 * L, h * 0.03);
      if (last && o.caret) { x.fillStyle = '#20232a'; x.fillRect(px + pw * 0.08 + pw * 0.84 * L + w * 0.01, ly - h * 0.012, w * 0.012, h * 0.054); }
    }
    if (o.bar !== undefined) {
      const bx = px + pw * 0.08, by = py + ph * 0.9, bw = pw * 0.84;
      x.fillStyle = '#d9d3c8'; x.fillRect(bx, by, bw, h * 0.03);
      x.fillStyle = AMBER; x.fillRect(bx, by, bw * o.bar, h * 0.03);
    }
  };

  // ---------- the laptop ----------
  // Base 1.5 x 1.0, hinge at the back edge. laptop.open(k): 0 shut, 1 open. laptop.screen.paint(fn).
  const laptop = (g, o = {}) => {
    const L = new THREE.Group(); g.add(L);
    const shell = metal(o.color || '#8d939b', { roughness: 0.45 });
    rbox(L, 1.5, 0.05, 1.0, 0.02, shell, 0, 0.025, 0);
    rbox(L, 1.3, 0.006, 0.5, 0.003, clay('#1d1f23'), 0, 0.052, -0.12);            // keyboard
    rbox(L, 0.5, 0.004, 0.28, 0.003, clay('#7c828a'), 0, 0.052, 0.3);              // trackpad
    const hinge = new THREE.Group(); hinge.position.set(0, 0.05, -0.5); L.add(hinge);
    rbox(hinge, 1.5, 1.0, 0.03, 0.02, shell, 0, 0.5, -0.015);
    const screen = panel(hinge, 1.38, 0.88, null, { px: 700, power: o.power ?? 1.0 });
    screen.position.set(0, 0.5, 0.002);
    L.hinge = hinge; L.screen = screen;
    L.open = (k) => { hinge.rotation.x = lerp(Math.PI / 2 - 0.035, -0.24, clamp(k)); };
    L.open(o.k ?? 1);
    return L;
  };

  // A simple desk lamp; lamp.set(k) dims it.
  const lamp = (g, x, z, top) => {
    const L = new THREE.Group(); L.position.set(x, top, z); g.add(L);
    const m = clay('#2b2e33', { roughness: 0.5 });
    cyl(L, 0.16, 0.18, 0.04, m, 0, 0.02, 0);
    const arm = cyl(L, 0.018, 0.018, 0.9, m, 0.08, 0.47, 0); arm.rotation.z = -0.18;
    const shade = cyl(L, 0.07, 0.2, 0.22, m, 0.2, 0.9, 0.05); shade.rotation.z = 0.5;
    const bulb = sphere(L, 0.06, glow('#ffd29a', 3), 0.24, 0.84, 0.05);
    const light = new THREE.PointLight('#ffc98a', 6, 6, 1.6); light.position.set(0.25, 0.8, 0.1); light.castShadow = true; L.add(light);
    L.set = (k) => { light.intensity = 6 * k; bulb.material.emissiveIntensity = 3 * k; };
    return L;
  };

  return {
    // b1 — hook. Lid flips open in the first half second; FINAL folder; shudder on "nowhere".
    b1: {
      build(g) {
        room(g, 'ink', { keyPower: 60, fillPower: 0.9, angle: 0.4, keyX: -0.9, keyZ: 3 });
        const table = O.table(g, { color: '#2c2019' });
        const lap = laptop(g, { k: 0 }); lap.position.set(0, table.top, 0);
        const glowS = spill(g, 2.2, 1.6, '#8fb2ff', 0.35); glowS.position.set(0, 1.6, -0.62);
        return { lap, glowS };
      },
      update({ lap, glowS }, t, k) {
        const op = prog(t, 0, 0.45, ease.back);
        lap.open(op); glowS.set(op);
        const nw = kit.at('nowhere');
        const shake = t > nw && t < nw + 0.5 ? Math.sin((t - nw) * 60) * (1 - (t - nw) / 0.5) * 0.08 : 0;
        const hover = prog(t, 0.5, 1.4, ease.out);
        lap.screen.paint((x, w, h) => {
          bg(x, w, h);
          folder(x, w / 2, h * 0.42, w * 0.26, 'final', { rot: shake, size: 0.3 });
          arrow(x, lerp(w * 0.85, w * 0.57, hover), lerp(h * 0.85, h * 0.5, hover), h * 0.1);
        });
        const push = prog(t, 0, 2.2, ease.out), d = drift(t, 0.012);
        cam(d.x, lerp(2.15, 1.85, push) + d.y, lerp(5.2, 4.3, push), 0, 1.35, -0.4, 30);
      },
    },
    // b2 — angled close-up of the screen. Plan page, then the cut-off draft on "draft".
    b2: {
      build(g) {
        room(g, 'ink', { keyPower: 50, fillPower: 0.9, angle: 0.4, keyX: 1.2, keyZ: 3 });
        const table = O.table(g, { color: '#2c2019' });
        const lap = laptop(g); lap.position.set(0, table.top, 0);
        const dust = motes(g, { box: [3, 2, 2], n: 24, color: '#bcd0ff' });
        return { lap, dust };
      },
      update({ lap, dust }, t, k) {
        dust.set(t);
        const dr = kit.at('draft');
        const blink = Math.floor(t * 2.2) % 2 === 0;
        lap.screen.paint((x, w, h) => t < dr
          ? page(x, w, h, { title: 'THE PLAN', lines: 6 })
          : page(x, w, h, { title: 'DRAFT', lines: 5, cut: 0.42, caret: blink }));
        const d = drift(t, 0.01);
        cam(lerp(1.05, 0.7, k) + d.x, 1.75 + d.y, lerp(2.9, 2.6, k), 0, 1.5, -0.55, 30);
      },
    },
    // b3 — wide side view with a lamp. Lid shuts on "close"; screen glow dies.
    b3: {
      build(g) {
        const r = room(g, 'night', { keyPower: 70, fillPower: 0.75, keyX: 2, keyZ: 4, angle: 0.5, wallZ: -2.4 });
        const table = O.table(g, { color: '#3e2a1d' });
        const lap = laptop(g); lap.position.set(-0.25, table.top, 0.05); lap.rotation.y = 0.35;
        const lmp = lamp(g, 1.15, -0.45, table.top);
        const mug = O.mug(g); mug.position.set(-1.25, table.top, 0.35);
        const glowS = spill(g, 2, 1.4, '#8fb2ff', 0.4); glowS.position.set(-0.3, 1.6, r.wall.position.z + 0.05);
        return { lap, lmp, glowS, r };
      },
      update({ lap, lmp, glowS, r }, t, k) {
        const c = kit.at('close');
        const shut = prog(t, c - 0.1, c + 0.35, ease.in);
        lap.open(1 - shut);
        lap.screen.paint((x, w, h) => { bg(x, w, h); folder(x, w / 2, h * 0.42, w * 0.26, 'final', { size: 0.3 }); });
        lap.screen.material.emissiveIntensity = 1 - shut;
        glowS.set(1 - shut);
        lmp.set(1);
        r.key.intensity = lerp(70, 40, shut);
        const d = drift(t, 0.02);
        cam(lerp(2.4, 2.0, k) + d.x, 2.3 + d.y, lerp(5.6, 5.0, k), -0.05, 1.3, -0.1, 30);
      },
    },
    // b4 — straight down from above. Lid lifts on "open"; one line goes amber and the bar ticks on "small".
    b4: {
      build(g) {
        room(g, 'night', { keyPower: 80, fillPower: 1.0, keyX: 0, keyY: 6, keyZ: 1.5, angle: 0.5 });
        const table = O.table(g, { color: '#3e2a1d' });
        const lap = laptop(g, { k: 0 }); lap.position.set(0, table.top, 0.1);
        const mug = O.mug(g); mug.position.set(1.15, table.top, -0.3);
        const book = O.book(g, { color: '#3f5e6b' }); book.position.set(-1.1, table.top, 0.3); book.rotation.y = 0.3;
        return { lap };
      },
      update({ lap }, t, k) {
        const o = kit.at('open'), s = kit.at('small');
        const op = prog(t, o - 0.05, o + 0.5, ease.out);
        lap.open(op * 0.62);   // opened partway so the screen reads from above
        const step = prog(t, s, s + 0.45, ease.out);
        lap.screen.paint((x, w, h) => page(x, w, h, { title: 'DRAFT', lines: 5, cut: 0.42, hi: step > 0 ? 4 : -1, bar: 0.06 + step * 0.12 }));
        const d = drift(t, 0.01);
        cam(d.x, lerp(5.6, 4.9, k) + d.y, 0.55, d.x, 1.2, -0.05, 32);
      },
    },
    // b5 — morning. Flat-on screen: "final" deleted, "started again" typed in from the word "started".
    b5: {
      build(g) {
        room(g, 'sand', { keyPower: 70, fillPower: 1.2, keyX: -2, keyZ: 4 });
        const table = O.table(g, { color: '#8a6446' });
        const lap = laptop(g); lap.position.set(0, table.top, 0);
        const plant = O.plant(g); plant.position.set(-1.25, table.top, -0.35); plant.scale.setScalar(0.8);
        const sun = spill(g, 3, 2.2, '#ffe2b0', 0.45); sun.position.set(0.8, 2.2, -4.9);
        return { lap };
      },
      update({ lap }, t, k, d) {
        const del = prog(t, 0.2, Math.max(0.6, kit.at('started') - 0.1));
        const typ = prog(t, kit.at('started'), Math.min(d, kit.atEnd('again') + 0.2));
        const old = 'final'.slice(0, Math.round((1 - del) * 5));
        const fresh = 'started again'.slice(0, Math.round(typ * 13));
        const caret = Math.floor(t * 2.4) % 2 === 0;
        lap.screen.paint((x, w, h) => {
          bg(x, w, h, '#e9e2d6', '#cfc6b6');
          folder(x, w / 2, h * 0.38, w * 0.26, typ > 0 ? fresh : old, { size: 0.24, text: '#2a241d', caret });
        });
        const dr = drift(t, 0.01);
        cam(dr.x, 1.7 + dr.y, lerp(3.4, 3.0, k), 0, 1.45, -0.45, 30);
      },
    },
    // b6 — the screen fills with "final" folders while the camera pulls back.
    b6: {
      build(g) {
        room(g, 'clay', { keyPower: 70, fillPower: 1.0 });
        const table = O.table(g, { color: '#6b4a33' });
        const lap = laptop(g); lap.position.set(0, table.top, 0);
        return { lap };
      },
      update({ lap }, t, k, d) {
        const names = ['final', 'final_2', 'final_FINAL', 'final (1)', 'final_v3', 'FINAL use this', 'final_old', 'final final', 'really_final'];
        const shown = Math.floor(prog(t, 0, Math.max(0.5, kit.at('really')), ease.inOut) * 8) + (t >= kit.at('really') ? 1 : 0);
        lap.screen.paint((x, w, h) => {
          bg(x, w, h);
          for (let i = 0; i < shown; i++) {
            const last = i === 8;
            folder(x, w * (0.2 + (i % 3) * 0.3), h * (0.18 + Math.floor(i / 3) * 0.3), w * 0.12, names[i],
              { size: 0.2, color: last ? '#ff6b3d' : AMBER });
          }
        });
        const back = prog(t, 0, d, ease.inOut), dr = drift(t, 0.015);
        cam(dr.x, lerp(1.65, 2.2, back) + dr.y, lerp(2.4, 5.6, back), 0, lerp(1.5, 1.3, back), -0.45, 30);
      },
    },
  };
};
