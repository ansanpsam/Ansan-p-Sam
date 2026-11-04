// The folder called final. One scene per beat. Every frame is a pure function of t.
// Framing target: the laptop screen sits between y 250 and 1200, above the caption pill.
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
    const shell = clay(o.color || '#4d525a', { roughness: 0.42, metalness: 0.35 });
    rbox(L, 1.5, 0.05, 1.0, 0.02, shell, 0, 0.025, 0);
    rbox(L, 1.3, 0.006, 0.5, 0.003, clay('#1d1f23'), 0, 0.052, -0.12);            // keyboard
    rbox(L, 0.5, 0.004, 0.28, 0.003, clay('#7c828a'), 0, 0.052, 0.3);              // trackpad
    const hinge = new THREE.Group(); hinge.position.set(0, 0.05, -0.5); L.add(hinge);
    rbox(hinge, 1.5, 1.0, 0.03, 0.02, shell, 0, 0.5, -0.015);
    const screen = panel(hinge, 1.38, 0.88, null, { px: 700, power: o.power ?? 0.85 });
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
    const light = new THREE.PointLight('#ffc98a', 22, 7, 1.4); light.position.set(0.25, 0.8, 0.1); light.castShadow = true; L.add(light);
    L.set = (k) => { light.intensity = 22 * k; bulb.material.emissiveIntensity = 3 * k; };
    return L;
  };

  return {
    // b1, the hook. The lid is already lifting on frame 0 and snaps open; the cursor finds FINAL; it shudders on "nowhere".
    b1: {
      build(g) {
        const r = room(g, 'ink', { keyPower: 55, fillPower: 0.9, angle: 0.4, keyX: -0.9, keyZ: 3 });
        const table = O.table(g, { color: '#2c2019' });
        const lap = laptop(g, { k: 0.3 }); lap.position.set(0, table.top, 0);
        const glowS = spill(g, 3.2, 2.4, '#7f9fe0', 0.3); glowS.position.set(0, 1.9, r.wall.position.z + 0.05);
        return { lap, glowS };
      },
      update({ lap, glowS }, t) {
        kit.bloom.strength = 0.3;
        const op = prog(t, 0, 0.45, ease.back);
        lap.open(lerp(0.3, 1, op)); glowS.set(0.4 + op * 0.6);
        const nw = kit.at('nowhere');
        const shake = t > nw && t < nw + 0.6 ? Math.sin((t - nw) * 55) * (1 - (t - nw) / 0.6) * 0.12 : 0;
        const hover = prog(t, 0.5, 1.4, ease.out);
        lap.screen.paint((x, w, h) => {
          bg(x, w, h);
          folder(x, w / 2, h * 0.36, w * 0.3, 'final', { rot: shake, dx: shake * w * 0.08, size: 0.36 });
          arrow(x, lerp(w * 0.9, w * 0.66, hover), lerp(h * 0.9, h * 0.48, hover), h * 0.1);
        });
        const push = prog(t, 0, 2.4, ease.out), d = drift(t, 0.012);
        cam(d.x, lerp(2.2, 1.85, push) + d.y, lerp(6.6, 5.0, push), 0, lerp(1.2, 1.32, push), -0.4, 30);
      },
    },
    // b2, angled close on the screen. The plan, then the draft that stops mid-sentence on "draft".
    b2: {
      build(g) {
        room(g, 'ink', { keyPower: 45, fillPower: 0.9, angle: 0.4, keyX: 1.2, keyZ: 3 });
        const table = O.table(g, { color: '#2c2019' });
        const lap = laptop(g); lap.position.set(0, table.top, 0);
        const dust = motes(g, { box: [3, 2, 2], n: 24, color: '#bcd0ff' });
        return { lap, dust };
      },
      update({ lap, dust }, t, k) {
        kit.bloom.strength = 0.25;
        dust.set(t);
        const dr = kit.at('draft');
        const blink = Math.floor(t * 2.2) % 2 === 0;
        lap.screen.paint((x, w, h) => t < dr
          ? page(x, w, h, { title: 'THE PLAN', lines: 6 })
          : page(x, w, h, { title: 'DRAFT', lines: 5, cut: 0.42, caret: blink }));
        const d = drift(t, 0.01);
        cam(lerp(1.15, 0.75, k) + d.x, 1.8 + d.y, lerp(3.4, 3.0, k), 0.05, 1.42, -0.55, 30);
      },
    },
    // b3, wide three-quarter view with a desk lamp. The lid shuts on "close"; the blue glow dies, lamplight stays.
    b3: {
      build(g) {
        const r = room(g, 'night', { keyPower: 60, fillPower: 0.8, keyX: 2, keyZ: 4, angle: 0.5, wallZ: -2.4 });
        const table = O.table(g, { color: '#3e2a1d' });
        const lap = laptop(g); lap.position.set(-0.15, table.top, 0.05); lap.rotation.y = 0.3;
        const lmp = lamp(g, 0.85, -0.45, table.top);
        const mug = O.mug(g); mug.position.set(0.95, table.top, 0.2);
        const pool = spill(g, 1.4, 1.0, '#ffcf8f', 0.5); pool.rotation.x = -Math.PI / 2; pool.position.set(0.85, table.top + 0.01, -0.2);
        const glowS = spill(g, 2.4, 1.8, '#7f9fe0', 0.4); glowS.position.set(-0.3, 1.8, r.wall.position.z + 0.05);
        return { lap, lmp, glowS, r };
      },
      update({ lap, lmp, glowS, r }, t, k) {
        kit.bloom.strength = 0.3;
        const c = kit.at('close');
        const shut = prog(t, c - 0.1, c + 0.35, ease.in);
        lap.open(1 - shut);
        lap.screen.paint((x, w, h) => { bg(x, w, h); folder(x, w / 2, h * 0.38, w * 0.3, 'final', { size: 0.36 }); });
        lap.screen.material.emissiveIntensity = 0.85 * (1 - shut);
        glowS.set(1 - shut);
        lmp.set(0.75);
        r.key.intensity = lerp(60, 30, shut);
        const d = drift(t, 0.02);
        cam(lerp(1.9, 1.6, k) + d.x, 2.35 + d.y, lerp(7.4, 6.8, k), 0.3, 1.2, -0.2, 30);
      },
    },
    // b4, high angle at night. The lid lifts on "open"; on "small" one line turns amber and the bar ticks forward.
    b4: {
      build(g) {
        const r = room(g, 'night', { keyPower: 55, fillPower: 0.9, keyX: -1.5, keyY: 4, keyZ: 3, angle: 0.5, wallZ: -2.4 });
        const table = O.table(g, { color: '#3e2a1d' });
        const lap = laptop(g, { k: 0 }); lap.position.set(0, table.top, 0.1);
        const mug = O.mug(g); mug.position.set(0.95, table.top, 0.35);
        const book = O.book(g, { color: '#3f5e6b' }); book.position.set(-1.0, table.top, 0.35); book.rotation.y = 0.3;
        const glowS = spill(g, 2.6, 2, '#ffe6c0', 0.35); glowS.position.set(0, 1.7, r.wall.position.z + 0.05);
        return { lap, glowS };
      },
      update({ lap, glowS }, t, k) {
        kit.bloom.strength = 0.25;
        const o = kit.at('open'), s = kit.at('small');
        const op = prog(t, Math.max(0, o - 0.1), o + 0.5, ease.out);
        lap.open(lerp(0.12, 1, op)); glowS.set(0.2 + op * 0.8);
        const step = prog(t, s, s + 0.45, ease.out);
        lap.screen.paint((x, w, h) => page(x, w, h, { title: 'DRAFT', lines: 5, cut: lerp(0.42, 1, step), hi: step > 0 ? 4 : -1, bar: 0.06 + step * 0.14 }));
        const d = drift(t, 0.01);
        cam(d.x - 0.3 + k * 0.3, lerp(3.9, 3.5, k) + d.y, lerp(4.4, 3.9, k), 0, 1.15, -0.3, 30);
      },
    },
    // b5, morning in a sand room, flat on. "final" is deleted letter by letter, then "started again" types in.
    b5: {
      build(g) {
        room(g, 'sand', { keyPower: 55, fillPower: 1.0, keyX: -2, keyZ: 4 });
        const table = O.table(g, { color: '#8a6446' });
        const lap = laptop(g, { power: 0.75 }); lap.position.set(0, table.top, 0);
        const plant = O.plant(g); plant.position.set(-1.0, table.top, -0.65); plant.scale.setScalar(0.85);
        const mug = O.mug(g); mug.position.set(0.8, table.top, 0.3);
        const sun = spill(g, 3, 2.2, '#ffe2b0', 0.35); sun.position.set(0.8, 2.6, -4.9);
        return { lap };
      },
      update({ lap }, t, k, d) {
        kit.bloom.strength = 0.2;
        const st = kit.at('started');
        const del = prog(t, 0.15, Math.max(0.6, st - 0.2));
        const typ = prog(t, st, Math.min(d, kit.atEnd('again') + 0.1));
        const old = 'final'.slice(0, Math.round((1 - del) * 5));
        const fresh = 'started again'.slice(0, Math.round(typ * 13));
        const caret = Math.floor(t * 2.4) % 2 === 0;
        lap.screen.paint((x, w, h) => {
          bg(x, w, h, '#e9e2d6', '#d4ccbd');
          folder(x, w / 2, h * 0.34, w * 0.3, typ > 0 ? fresh : old, { size: 0.34, text: '#2a241d', caret, color: typ >= 1 ? '#f2a33a' : AMBER });
        });
        const dr = drift(t, 0.01);
        cam(dr.x, 1.75 + dr.y, lerp(5.4, 4.8, k), 0, 1.25, -0.4, 30);
      },
    },
    // b6, the screen fills with "final" folders while the camera pulls back across the room.
    b6: {
      build(g) {
        room(g, 'clay', { keyPower: 60, fillPower: 0.9 });
        const table = O.table(g, { color: '#6b4a33' });
        const lap = laptop(g); lap.position.set(0, table.top, 0);
        return { lap };
      },
      update({ lap }, t, k, d) {
        kit.bloom.strength = 0.25;
        const names = ['final', 'final_2', 'final_FINAL', 'final (1)', 'final_v3', 'FINAL use this', 'final_old', 'final final', 'really_final'];
        const ra = kit.at('really');
        const shown = 3 + Math.floor(prog(t, 0, Math.max(0.5, ra), ease.inOut) * 5) + (t >= ra ? 1 : 0);
        const pop = prog(t, ra, ra + 0.3, ease.back);
        lap.screen.paint((x, w, h) => {
          bg(x, w, h);
          for (let i = 0; i < shown; i++) {
            const last = i === 8;
            folder(x, w * (0.2 + (i % 3) * 0.3), h * (0.17 + Math.floor(i / 3) * 0.3), w * 0.13 * (last ? 0.6 + pop * 0.5 : 1), names[i],
              { size: last ? 0.24 : 0.2, color: last ? '#ff6b3d' : AMBER });
          }
        });
        const back = prog(t, 0, d, ease.inOut), dr = drift(t, 0.015);
        cam(dr.x, lerp(1.75, 2.1, back) + dr.y, lerp(3.9, 6.2, back), 0, lerp(1.32, 1.22, back), -0.45, 30);
      },
    },
  };
};
