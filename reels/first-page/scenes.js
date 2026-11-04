// The first page. One scene per beat. build(g) makes objects once; update(refs, t, k, d) poses them for time t.
export default (kit) => {
  const { O, room, cam, drift, prog, ease, lerp, clamp, clay, rbox, box, panel, motes, spill, rng, THREE } = kit;

  const CREAM = '#f3ead8', INK = '#1f2a44', COVER = '#2f4a6b';

  // Ruled paper. ink 0..1 reveals the neat first-page writing; scrib 0..1 adds messy lines; wobble 0..1 draws one shaky line.
  const paper = (x, w, h, o = {}) => {
    x.fillStyle = CREAM; x.fillRect(0, 0, w, h);
    x.strokeStyle = 'rgba(70,110,160,0.28)'; x.lineWidth = w * 0.004;
    for (let i = 0; i < 18; i++) { const y = h * (0.14 + i * 0.047); x.beginPath(); x.moveTo(w * 0.06, y); x.lineTo(w * 0.96, y); x.stroke(); }
    x.strokeStyle = 'rgba(200,70,70,0.35)'; x.beginPath(); x.moveTo(w * 0.14, 0); x.lineTo(w * 0.14, h); x.stroke();
    if (o.ink) {
      x.fillStyle = INK; x.font = `700 ${w * 0.1}px Inter`; x.textBaseline = 'alphabetic';
      x.save(); x.beginPath(); x.rect(0, 0, w * (0.1 + o.ink * 0.9), h); x.clip();
      x.fillText('Big plans', w * 0.18, h * 0.12);
      x.restore();
      x.strokeStyle = INK; x.lineWidth = w * 0.008; x.lineCap = 'round';
      for (let i = 0; i < 6; i++) {
        const a = clamp(o.ink * 7 - i - 0.6, 0, 1); if (a <= 0) continue;
        const y = h * (0.2 + i * 0.094) - h * 0.012, len = [0.7, 0.55, 0.66, 0.48, 0.6, 0.38][i];
        x.beginPath(); x.moveTo(w * 0.18, y); x.lineTo(w * (0.18 + len * a), y); x.stroke();
      }
    }
    if (o.scrib) {
      const r = rng(7); x.strokeStyle = INK; x.lineWidth = w * 0.007; x.lineCap = 'round';
      for (let i = 0; i < 14; i++) {
        const a = clamp(o.scrib * 15 - i, 0, 1); const y = h * (0.15 + i * 0.054); const len = 0.4 + r() * 0.42;
        if (a <= 0) continue;
        x.beginPath(); x.moveTo(w * 0.17, y);
        for (let s = 0; s <= 24 * a; s++) x.lineTo(w * (0.17 + len * a * s / (24 * a || 1)), y + Math.sin(s * 1.9 + i) * h * 0.006);
        x.stroke();
        if (i % 4 === 1 && a >= 1) { x.strokeStyle = '#b8322a'; x.beginPath(); x.moveTo(w * 0.16, y - h * 0.004); x.lineTo(w * (0.2 + len * 0.6), y + h * 0.002); x.stroke(); x.strokeStyle = INK; }
      }
    }
    if (o.ring) {
      x.strokeStyle = `rgba(120,72,30,${0.45 * o.ring})`; x.lineWidth = w * 0.03;
      x.beginPath(); x.arc(w * 0.78, h * 0.8, w * 0.13, 0, Math.PI * 2); x.stroke();
    }
    if (o.wobble) {
      x.strokeStyle = INK; x.lineWidth = w * 0.01; x.lineCap = 'round'; x.beginPath();
      const n = Math.floor(40 * o.wobble);
      for (let s = 0; s <= n; s++) { const px = w * (0.18 + 0.7 * s / 40), py = h * 0.24 + Math.sin(s * 0.9) * h * 0.012 + Math.sin(s * 2.7) * h * 0.005; s ? x.lineTo(px, py) : x.moveTo(px, py); }
      x.stroke();
    }
  };

  // An open spiral-free notebook lying flat: cover, two pages. Returns { group, left, right }.
  const notebook = (g, o = {}) => {
    const nb = new THREE.Group(); g.add(nb);
    rbox(nb, 1.52, 0.03, 1.02, 0.01, clay(o.cover ?? COVER), 0, 0.015, 0);
    box(nb, 1.44, 0.03, 0.96, clay('#e9dfca'), 0, 0.04, 0);
    const left = panel(nb, 0.7, 0.94, (x, w, h) => paper(x, w, h, o.leftPaint ?? {}), { px: 700, lit: true });
    left.rotation.x = -Math.PI / 2; left.position.set(-0.36, 0.057, 0);
    const right = panel(nb, 0.7, 0.94, (x, w, h) => paper(x, w, h, o.rightPaint ?? {}), { px: 700, lit: true });
    right.rotation.x = -Math.PI / 2; right.position.set(0.36, 0.057, 0);
    return { nb, left, right };
  };

  const pen = (g) => {
    const p = new THREE.Group(); g.add(p);
    const body = kit.cyl(p, 0.022, 0.022, 0.62, clay('#141414'), 0, 0, 0); body.rotation.z = Math.PI / 2;
    const tip = kit.cyl(p, 0.022, 0.003, 0.07, kit.metal('#c9c2b0'), 0.345, 0, 0); tip.rotation.z = -Math.PI / 2;
    return p;
  };

  return {
    // Hook: notebook drops and opens on its one neat page; pen rolls in. Motion from frame 0.
    b1: {
      build(g) {
        room(g, 'sand', { keyPower: 60, fillPower: 0.9, keyX: -1.2, keyZ: 3 });
        const table = O.table(g, { color: '#6b4a32' });
        const book = notebook(g, { rightPaint: {} });
        book.nb.position.set(0, table.top, 0.1);
        const p = pen(g);
        return { table, book, p };
      },
      update({ table, book, p }, t, k, d) {
        const drop = prog(t, 0, 0.45, ease.drop);
        book.nb.position.y = table.top + (1 - drop) * 0.9;
        book.nb.rotation.z = (1 - drop) * 0.25;
        const tw = kit.at('perfect'), te = kit.atEnd('page') + 0.6;
        const ink = prog(t, tw, te, ease.inOut);
        book.left.paint((x, w, h) => paper(x, w, h, { ink }));
        const roll = prog(t, 0.3, 1.3, ease.out);
        p.position.set(lerp(1.6, 0.98, roll), table.top + 0.022, 0.25);
        p.rotation.x = roll * 6; p.rotation.y = 0.35;
        // On "never", the light drops a touch: the notebook gets left behind.
        const dim = prog(t, kit.at('never'), d, ease.out);
        const dr = drift(t, 0.01);
        cam(dr.x, lerp(3.4, 3.0, k) + dr.y, lerp(2.6, 2.1, k) + dim * 0.4, 0, table.top, 0.12, 32);
      },
    },
    // The fear: low grazing angle, blank pages fan past.
    b2: {
      build(g) {
        room(g, 'paper', { keyPower: 45, fillPower: 0.8, keyX: 1.5, keyZ: 2.2, angle: 0.5 });
        const table = O.table(g, { color: '#5a3e2b' });
        const base = notebook(g, { leftPaint: { ink: 1 } }); base.nb.position.set(0, table.top, 0);
        // Leaves that flip over the spine from right to left.
        const leaves = [];
        for (let i = 0; i < 6; i++) {
          const hinge = new THREE.Group(); hinge.position.set(0, table.top + 0.06 + i * 0.002, 0); g.add(hinge);
          const leaf = panel(hinge, 0.7, 0.94, (x, w, h) => paper(x, w, h, {}), { px: 400, lit: true });
          leaf.rotation.x = -Math.PI / 2; leaf.position.set(0.36, 0, 0);
          leaves.push(hinge);
        }
        return { leaves, table };
      },
      update({ leaves, table }, t, k, d) {
        const start = 0.05, end = Math.max(kit.atEnd('worse') + 0.2, d * 0.7);
        leaves.forEach((h, i) => {
          const a = prog(t, start + (end - start) * i / 6, start + (end - start) * (i + 1.4) / 6, ease.inOut);
          h.rotation.z = a * Math.PI;
        });
        const dr = drift(t, 0.012);
        cam(lerp(1.4, 1.0, k) + dr.x, table.top + 0.75 + dr.y, 1.8 - k * 0.2, 0.1, table.top + 0.1, 0, 34);
      },
    },
    // Shelf at dusk: notebook stands among old books, dust in a beam.
    b3: {
      build(g) {
        const r = room(g, 'night', { keyPower: 110, fillPower: 1.2, keyX: -2, keyY: 3.5, keyZ: 2, angle: 0.35, wallZ: -1.2 });
        const wz = r.wall.position.z;
        const shelf = box(g, 2.6, 0.06, 0.4, clay('#5b3f2a'), 0, 1.6, wz + 0.22);
        const colors = ['#7c4a3a', '#55624a', '#7a6a3f', '#3f5e6b', '#6b3e52', '#4b5a3a'];
        const books = [];
        let xs = -1.1;
        for (let i = 0; i < 9; i++) {
          const isNb = i === 4;
          const w = isNb ? 0.06 : 0.07 + (i % 3) * 0.025, h = isNb ? 0.62 : 0.48 + ((i * 37) % 5) * 0.04;
          const b = box(g, w, h, isNb ? 0.44 : 0.32, clay(isNb ? COVER : colors[i % colors.length]), xs + w / 2, 1.63 + h / 2, wz + 0.22);
          if (isNb) books.nb = b;
          books.push(b); xs += w + 0.025;
        }
        const s = spill(g, 1.4, 1.1, '#ffd9a8', 0.55); s.position.set(-0.75 + 0.6, 1.95, wz + 0.02);
        const dust = motes(g, { box: [2.4, 1.6, 1], n: 40 });
        dust.position && dust.position.set(0, 1.9, wz + 0.8);
        return { books, s, dust, wz };
      },
      update({ books, s, dust, wz }, t, k, d) {
        dust.set(t);
        // Fast push-in at the start, then a slow settle on the one tall blue spine.
        const push = prog(t, 0, 1.2, ease.out);
        const nbx = books.nb.position.x;
        s.set(0.55 + 0.25 * prog(t, kit.at('waiting'), d, ease.out));
        const dr = drift(t, 0.015);
        cam(lerp(nbx + 0.6, nbx + 0.15, push) + dr.x, 1.95 + dr.y, lerp(wz + 4.2, wz + 2.6, push) - k * 0.15, nbx, 1.92, wz, 30);
      },
    },
    // Turn: top-down, the spread fills with mess, a mug ring lands on "coffee".
    b4: {
      build(g) {
        room(g, 'clay', { keyPower: 70, fillPower: 1.0, keyX: 0.8, keyZ: 2.4 });
        const table = O.table(g, { color: '#7a5638' });
        const book = notebook(g, {}); book.nb.position.set(0, table.top, 0);
        const mug = O.mug(g, { color: '#e9e2d4' });
        return { table, book, mug };
      },
      update({ table, book, mug }, t, k, d) {
        const m = kit.at('messy');
        const scribL = prog(t, 0.05, m + 0.5, ease.out);
        const scribR = prog(t, m, kit.atEnd('crossed') + 0.4, ease.out);
        const cf = kit.at('coffee');
        // Mug comes down, lifts away, leaves the ring.
        const down = prog(t, cf - 0.35, cf, ease.drop), up = prog(t, cf + 0.3, cf + 0.8, ease.inOut);
        mug.position.set(0.64, table.top + 0.06 + (1 - down) * 0.9 + up * 1.4, 0.3);
        mug.visible = up < 1;
        const ring = prog(t, cf + 0.25, cf + 0.6, ease.out);
        book.left.paint((x, w, h) => paper(x, w, h, { ink: 1, scrib: scribL }));
        book.right.paint((x, w, h) => paper(x, w, h, { scrib: scribR, ring }));
        const dr = drift(t, 0.01);
        cam(dr.x, table.top + lerp(2.4, 2.0, k), 0.35 + dr.y, 0, table.top, 0.02, 34);
      },
    },
    // Page two: a page turns, one wobbly line, the lamp warms up on "starts".
    b5: {
      build(g) {
        const r = room(g, 'night', { keyPower: 40, fillPower: 0.7, keyX: -1.2, keyZ: 2.5 });
        const table = O.table(g, { color: '#5e4230' });
        const book = notebook(g, { leftPaint: { ink: 1 } }); book.nb.position.set(0, table.top, 0);
        const hinge = new THREE.Group(); hinge.position.set(0, table.top + 0.062, 0); g.add(hinge);
        const leaf = panel(hinge, 0.7, 0.94, (x, w, h) => paper(x, w, h, { ink: 1 }), { px: 500, lit: true });
        leaf.rotation.x = -Math.PI / 2; leaf.position.set(0.36, 0, 0);
        const p = O.pendant(g, 2.6, { power: 30, color: '#ffc27a', shadow: true });
        const pn = pen(g);
        return { r, book, hinge, p, pn, table };
      },
      update({ r, book, hinge, p, pn, table }, t, k, d) {
        // The old first page flips over to the left in the first half second.
        hinge.rotation.z = prog(t, 0, 0.55, ease.inOut) * Math.PI;
        const w0 = kit.at('ugly') - 0.3, w1 = kit.at('starts') + 0.2;
        const wob = prog(t, w0, w1, ease.inOut);
        book.right.paint((x, w, h) => paper(x, w, h, { wobble: wob }));
        // Pen tip follows the line.
        pn.position.set(0.36 - 0.245 + 0.49 * wob, table.top + 0.16, -0.24 + 0.03 * Math.sin(wob * 30));
        pn.rotation.set(0, 0.6, -0.6);
        pn.visible = t > w0 - 0.2;
        const lit = prog(t, kit.at('starts'), Math.min(d, kit.at('starts') + 1.2), ease.out);
        p.bulb.set(0.25 + 0.75 * lit);
        r.key.intensity = 40 + lit * 60;
        const dr = drift(t, 0.012);
        cam(0.1 + dr.x, table.top + 1.9 + dr.y, 1.25 - k * 0.15, 0.15, table.top, -0.05, 34);
      },
    },
    // Send line: a drawer slides open, full of notebooks on their sides, warm from above.
    b6: {
      build(g) {
        const r = room(g, 'sand', { keyPower: 75, fillPower: 1.0, keyX: 0.5, keyY: 4, keyZ: 2 });
        const wood = clay('#6b4a32');
        // Cabinet body.
        box(g, 1.9, 1.0, 1.1, wood, 0, 0.5, -0.4);
        const drawer = new THREE.Group(); g.add(drawer);
        box(drawer, 1.7, 0.04, 0.95, clay('#5a3c28'), 0, 0.62, 0);
        box(drawer, 1.7, 0.32, 0.04, wood, 0, 0.76, 0.47);
        box(drawer, 0.04, 0.3, 0.95, wood, -0.83, 0.77, 0); box(drawer, 0.04, 0.3, 0.95, wood, 0.83, 0.77, 0);
        box(drawer, 0.3, 0.04, 0.05, kit.metal('#c9b48a'), 0, 0.78, 0.51);
        const cols = ['#2f4a6b', '#7c4a3a', '#55624a', '#7a6a3f', '#6b3e52', '#3f5e6b', '#8a5a2b', '#4b5a3a', '#5c4a7a', '#2f6b5e'];
        for (let i = 0; i < 10; i++) {
          box(drawer, 0.13, 0.27, 0.8, clay(cols[i]), -0.72 + i * 0.16, 0.775, -0.02);
          box(drawer, 0.11, 0.275, 0.78, clay('#efe6d2'), -0.72 + i * 0.16, 0.776, -0.02);
        }
        return { r, drawer };
      },
      update({ r, drawer }, t, k, d) {
        const open = prog(t, 0, 0.9, ease.out);
        drawer.position.z = -0.4 + open * 0.75;
        r.key.intensity = 60 + 30 * prog(t, kit.at('first'), d, ease.out);
        const dr = drift(t, 0.012);
        cam(dr.x, lerp(2.2, 2.6, k) + dr.y, lerp(2.6, 2.3, k), 0, 0.72, 0.2, 32);
      },
    },
  };
};
