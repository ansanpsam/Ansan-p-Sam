// Clear one square: six beats, one scene each. Objects, light and type only.
// t = seconds into beat, k = t/d, d = beat length. Key moments tied to words with kit.at().
export default (kit) => {
  const { O, room, cam, drift, prog, ease, lerp, clay, metal, box, rbox, cyl, sphere, spill, motes, rng } = kit;

  const PAPER = ['#e9e4d8', '#dcd6c6', '#f1ede3'];
  const MUGS = ['#b6533a', '#3f5e6b', '#d9cfb8', '#55624a'];

  // The clutter, built the same way in every beat so the desk feels like one place.
  // Returns pieces with a home position so a beat can slide them away.
  const clutter = (g, top, seed = 7, keepClear = false) => {
    const r = rng(seed), items = [];
    const put = (m, x, z, ry = 0) => { m.position.set(x, m.position.y + top, z); m.rotation.y = ry; items.push({ m, x, z, y: m.position.y }); return m; };
    // laptop, half buried
    const lap = new kit.THREE.Group(); g.add(lap);
    box(lap, 1.0, 0.04, 0.68, metal('#8b8f96'), 0, 0.02, 0);
    put(lap, 0.55, -0.35, -0.25);
    // paper stacks
    for (let i = 0; i < 9; i++) {
      const p = box(g, 0.62, 0.012, 0.86, clay(PAPER[i % 3]), 0, 0.006 + (i % 3) * 0.013, 0);
      put(p, -1.3 + r() * 2.6, -0.6 + r() * 1.2, r() * 1.2 - 0.6);
    }
    // books
    for (let i = 0; i < 3; i++) { const b = O.book(g, { color: ['#7c4a3a', '#3f5e6b', '#7a6a3f'][i] }); b.position.y = i * 0.12; put(b, -1.15, 0.45, 0.2 * i); }
    // mugs
    [[-0.4, 0.55], [1.25, 0.4], [0.15, -0.65]].forEach(([x, z], i) => { const m = O.mug(g, { color: MUGS[i] }); put(m, x, z); });
    // charger blocks
    [[0.95, 0.65], [-0.75, -0.55]].forEach(([x, z]) => put(rbox(g, 0.14, 0.06, 0.22, 0.02, clay('#eeeae2')), x, z));
    // a cable snaking over everything
    const y = top + 0.05;
    const cable = O.cable(g, [[-1.6, y, 0.8], [-0.9, y + 0.04, 0.2], [-0.2, y + 0.06, 0.3], [0.4, y + 0.05, -0.1], [1.1, y, 0.5], [1.6, y, 0.1]], { color: '#222428' });
    cable.show(1);
    if (keepClear) items.forEach((it) => { if (Math.abs(it.x) < 0.45 && Math.abs(it.z - 0.15) < 0.45) it.m.visible = false; });
    return { items, cable };
  };

  // Desk lamp built from primitives. Head faces down; returns the bulb glow material and a spot.
  const lamp = (g, x, z, top) => {
    const L = new kit.THREE.Group(); L.position.set(x, top, z); g.add(L);
    const black = clay('#1d1e21', { roughness: 0.5 });
    cyl(L, 0.18, 0.2, 0.04, black, 0, 0.02, 0);
    const arm = cyl(L, 0.018, 0.018, 0.9, black, 0, 0.47, 0); arm.rotation.z = 0.25;
    const head = cyl(L, 0.06, 0.16, 0.2, black, 0.2, 0.92, 0); head.rotation.z = -0.9;
    const bulbMat = kit.glow('#ffd59a', 0);
    sphere(L, 0.05, bulbMat, 0.27, 0.86, 0);
    const spot = new kit.THREE.SpotLight('#ffcf8f', 0, 6, 0.6, 0.6, 1.4);
    spot.position.set(x + 0.27, top + 0.86, z); spot.castShadow = true;
    spot.target.position.set(x + 0.75, top, z); g.add(spot); g.add(spot.target);
    return { bulbMat, spot };
  };

  return {
    // HOOK: overhead push-in on the buried desk; a paper stack topples in the first half second.
    b1: {
      build(g) {
        room(g, 'ink', { keyPower: 70, fillPower: 0.9, angle: 0.5, keyX: -1.2, keyZ: 2.4 });
        const table = O.table(g, { color: '#5a3d2a' });
        const c = clutter(g, table.top);
        const fall = [0, 1, 2].map((i) => box(g, 0.6, 0.012, 0.84, clay(PAPER[i]), 0.1, 0, 0.2));
        const dust = motes(g, { box: [3.5, 2.5, 2], n: 24 });
        return { table, fall, dust, c };
      },
      update({ table, fall, dust }, t, k) {
        dust.set(t);
        fall.forEach((p, i) => {
          const a = prog(t, 0.05 + i * 0.08, 0.45 + i * 0.08, ease.drop);
          p.position.set(0.1 + a * (0.35 + i * 0.1), table.top + 0.35 - a * (0.33 - i * 0.013), 0.2 + a * 0.1);
          p.rotation.y = a * (0.5 + i * 0.4); p.rotation.z = (1 - a) * 0.4;
        });
        const push = prog(t, 0, 1.6, ease.out), d = drift(t, 0.015);
        cam(d.x, lerp(6.2, 4.6, push) + d.y, lerp(2.6, 1.7, push) - k * 0.15, 0, table.top - 0.05, 0.05, 32);
      },
    },

    // "buried under yesterday's mugs and cables": low glide along the clutter; cable tightens on "cables".
    b2: {
      build(g) {
        room(g, 'night', { keyPower: 110, fillPower: 1.0, keyX: 1.8, keyZ: 3.5, angle: 0.55, wallZ: -2.2 });
        const table = O.table(g, { color: '#5a3d2a' });
        const c = clutter(g, table.top, 11);
        const s = spill(g, 2.6, 1.4, '#ffd9a8', 0.45); s.position.set(0.4, 1.9, -2.15);
        return { table, c };
      },
      update({ table, c }, t, k) {
        const hit = prog(t, kit.at('cables') - 0.1, kit.at('cables') + 0.4, ease.back);
        c.cable.position.y = 0.04 * (1 - hit);
        const d = drift(t, 0.012);
        cam(lerp(-1.4, 1.0, k) + d.x, table.top + 0.55 + d.y, 2.3, lerp(-0.7, 0.8, k), table.top + 0.05, -0.1, 28);
      },
    },

    // "Clear one square": top-down, clutter slides outward, notebook drops on "notebook".
    b3: {
      build(g) {
        room(g, 'sand', { keyPower: 60, fillPower: 1.2, angle: 0.6, keyX: -0.6, keyZ: 2 });
        const table = O.table(g, { color: '#6b4a32' });
        const c = clutter(g, table.top, 23);
        const nb = rbox(g, 0.5, 0.03, 0.7, 0.01, clay('#2f4a3f'));
        const page = box(g, 0.46, 0.005, 0.66, clay('#f3efe6'), 0, 0, 0);
        return { table, c, nb, page };
      },
      update({ table, c, nb, page }, t, k, d) {
        const clear = prog(t, kit.at('Clear'), kit.at('notebook') - 0.1, ease.inOut);
        c.items.forEach((it) => {
          const dx = it.x, dz = it.z - 0.15, dist = Math.hypot(dx, dz) || 0.01;
          const need = Math.max(0, 0.75 - dist);
          it.m.position.x = it.x + (dx / dist) * need * clear * 1.4;
          it.m.position.z = it.z + (dz / dist) * need * clear * 1.4;
        });
        c.cable.position.x = clear * 0.5;
        const drop = prog(t, kit.at('notebook') - 0.15, kit.at('notebook') + 0.25, ease.drop);
        nb.visible = page.visible = t > kit.at('notebook') - 0.15;
        nb.position.set(0, table.top + 0.015 + (1 - drop) * 1.2, 0.15);
        page.position.set(0, table.top + 0.034 + (1 - drop) * 1.2, 0.15);
        const dr = drift(t, 0.01);
        cam(dr.x, 4.4 - k * 0.3 + dr.y, 0.25 + dr.y * 0.2, 0, table.top, 0.12, 32);
        void d;
      },
    },

    // "Put the one thing... nothing else": lamp clicks on at "Put", room falls to shadow.
    b4: {
      build(g) {
        const r = room(g, 'ink', { keyPower: 80, fillPower: 0.9, angle: 0.5, keyX: -1, keyZ: 2.5 });
        const table = O.table(g, { color: '#5a3d2a' });
        const c = clutter(g, table.top, 23, true);
        const nb = rbox(g, 0.5, 0.03, 0.7, 0.01, clay('#2f4a3f'), 0, table.top + 0.015, 0.15);
        box(g, 0.46, 0.005, 0.66, clay('#f3efe6'), 0, table.top + 0.034, 0.15);
        const pen = cyl(g, 0.012, 0.012, 0.42, clay('#1b1b1b'), 0.12, table.top + 0.05, 0.15); pen.rotation.x = Math.PI / 2;
        const L = lamp(g, -0.75, 0.15, table.top);
        const pool = spill(g, 1.2, 1.2, '#ffcf8f', 0.7); pool.rotation.x = -Math.PI / 2; pool.position.set(0, table.top + 0.04, 0.15);
        return { r, L, pool, table, nb, c };
      },
      update({ r, L, pool, table }, t, k) {
        const on = prog(t, kit.at('Put'), kit.at('Put') + 0.25, ease.out);
        const dim = prog(t, kit.at('Put') + 0.1, kit.at('else'), ease.inOut);
        L.bulbMat.emissiveIntensity = on * 3;
        L.spot.intensity = on * 14;
        pool.set(on);
        r.key.intensity = lerp(80, 18, dim);
        r.fill.intensity = lerp(0.9, 0.25, dim);
        const d = drift(t, 0.012);
        cam(0.9 + d.x - k * 0.3, table.top + 1.5 + d.y, 1.9 - k * 0.25, 0, table.top + 0.05, 0.12, 30);
      },
    },

    // "The mess can wait": wide, clutter in the dark, pen rolls into the light on "anyway".
    b5: {
      build(g) {
        const r = room(g, 'night', { keyPower: 30, fillPower: 0.35, keyX: 2, keyZ: 3, wallZ: -2.4 });
        const table = O.table(g, { color: '#4a3324' });
        const c = clutter(g, table.top, 23, true);
        rbox(g, 0.5, 0.03, 0.7, 0.01, clay('#2f4a3f'), 0, table.top + 0.015, 0.15);
        box(g, 0.46, 0.005, 0.66, clay('#f3efe6'), 0, table.top + 0.034, 0.15);
        const pen = cyl(g, 0.012, 0.012, 0.42, clay('#c9a14a'), 0, table.top + 0.05, 0.15); pen.rotation.x = Math.PI / 2;
        const L = lamp(g, -0.75, 0.15, table.top); L.bulbMat.emissiveIntensity = 3; L.spot.intensity = 16;
        const pool = spill(g, 1.3, 1.3, '#ffcf8f', 0.75); pool.rotation.x = -Math.PI / 2; pool.position.set(0, table.top + 0.04, 0.15);
        const steam = kit.steam(g, { x: 1.25, y: table.top + 0.32, z: 0.4, height: 0.5, power: 0.25 });
        return { table, pen, steam, r, c };
      },
      update({ table, pen, steam }, t, k) {
        steam.set(t);
        const roll = prog(t, kit.at('anyway') - 0.3, kit.at('anyway') + 0.3, ease.out);
        pen.position.x = lerp(0.9, 0.12, roll);
        pen.rotation.y = 0; pen.rotation.z = roll * 6;
        const d = drift(t, 0.02);
        cam(lerp(-0.6, 0.2, k) + d.x, 2.4 + d.y, 4.2 - k * 0.3, 0, table.top - 0.1, 0, 30);
      },
    },

    // Send line: slow pull back, the lit square small in the dark room.
    b6: {
      build(g) {
        room(g, 'ink', { keyPower: 22, fillPower: 0.45, angle: 0.4, keyX: -1.5, keyZ: 2 });
        const table = O.table(g, { color: '#4a3324' });
        const c = clutter(g, table.top, 23, true);
        rbox(g, 0.5, 0.03, 0.7, 0.01, clay('#2f4a3f'), 0, table.top + 0.015, 0.15);
        box(g, 0.46, 0.005, 0.66, clay('#f3efe6'), 0, table.top + 0.034, 0.15);
        const L = lamp(g, -0.75, 0.15, table.top); L.bulbMat.emissiveIntensity = 3; L.spot.intensity = 16;
        const pool = spill(g, 1.4, 1.4, '#ffcf8f', 0.8); pool.rotation.x = -Math.PI / 2; pool.position.set(0, table.top + 0.04, 0.15);
        const chair = O.chair(g); chair.position.set(0, 0, 1.3); chair.rotation.y = Math.PI;
        return { table, c };
      },
      update({ table }, t, k) {
        const back = prog(t, 0, Math.max(2, kit.at('seen') + 0.4), ease.inOut), d = drift(t, 0.015);
        cam(d.x, lerp(2.0, 3.6, back) + d.y, lerp(1.6, 6.8, back), 0, table.top - lerp(0, 0.3, back), 0.1, 30);
        void k;
      },
    },
  };
};
