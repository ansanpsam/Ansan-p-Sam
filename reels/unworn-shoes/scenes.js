// Six beats: the shoes that never ran. Objects, rooms, light only.
export default (kit) => {
  const { O, THREE, room, cam, drift, prog, ease, lerp, clay, box, rbox, sphere, glow, spill, motes } = kit;
  const ACC = '#FF7A45';

  // A running shoe in profile, toe pointing +x, about 0.64 long. Origin at the sole's centre on the floor.
  const shoe = (g, { color = '#f4f2ee' } = {}) => {
    const s = new THREE.Group(); g.add(s);
    const up = clay(color, { roughness: 0.55 });
    // dark outsole and a thick light-grey midsole
    rbox(s, 0.66, 0.035, 0.25, 0.015, clay('#3b3f47', { roughness: 0.9 }), 0, 0.018, 0);
    rbox(s, 0.64, 0.07, 0.245, 0.03, clay('#d6d2c8', { roughness: 0.7 }), 0, 0.07, 0);
    // upper: body, rounded toe, raised heel collar
    rbox(s, 0.44, 0.16, 0.22, 0.07, up, -0.06, 0.18, 0);
    const toe = sphere(s, 0.11, up, 0.17, 0.14, 0); if (toe) toe.scale.set(1.35, 0.62, 0.98);
    rbox(s, 0.16, 0.13, 0.215, 0.05, up, -0.22, 0.26, 0);
    // orange side stripe and heel tab
    const st = box(s, 0.3, 0.035, 0.226, clay(ACC, { roughness: 0.5 }), -0.03, 0.15, 0); if (st) st.rotation.z = 0.22;
    rbox(s, 0.05, 0.12, 0.1, 0.02, clay(ACC), -0.3, 0.29, 0);
    // tongue and grey laces so they read on white
    const tongue = rbox(s, 0.16, 0.05, 0.12, 0.02, up, -0.05, 0.265, 0); if (tongue) tongue.rotation.z = 0.35;
    const lace = clay('#8a8f99', { roughness: 0.6 });
    const laces = [0, 1, 2, 3].map((i) => box(s, 0.02, 0.016, 0.15, lace, -0.12 + i * 0.065, 0.268 - i * 0.022, 0));
    return Object.assign(s, { laces });
  };
  const pair = (g, x, y, z, opts) => {
    const a = shoe(g, opts); a.position.set(x - 0.05, y, z - 0.16);
    const b = shoe(g, opts); b.position.set(x + 0.05, y, z + 0.16);
    return [a, b];
  };
  // An open orange shoebox. Origin at its base centre.
  const shoebox = (g, w = 0.86, h = 0.3, d = 0.62) => {
    const b = new THREE.Group(); g.add(b);
    const c = clay('#e0602f', { roughness: 0.75 });
    box(b, w, 0.02, d, c, 0, 0.01, 0);
    box(b, w, h, 0.02, c, 0, h / 2, -d / 2); box(b, w, h, 0.02, c, 0, h / 2, d / 2);
    box(b, 0.02, h, d, c, -w / 2, h / 2, 0); box(b, 0.02, h, d, c, w / 2, h / 2, 0);
    return b;
  };
  // Every beat sets bloom, so out-of-order frames stay deterministic.
  const B = (s) => { kit.bloom.strength = s; };

  return {
    // Hook: the lid pops off in the first half second and the shoes are revealed in tissue.
    b1: {
      build(g) {
        room(g, 'sand', { keyPower: 55, fillPower: 1.1, angle: 0.5, keyX: -1.4, keyZ: 3 });
        const table = O.table(g, { color: '#5a3d2a' });
        const y = table.top;
        shoebox(g).position.set(0, y, 0);
        const tissue = clay('#f6f1e6', { roughness: 0.95 });
        box(g, 0.8, 0.02, 0.58, tissue, 0, y + 0.03, 0);
        const fl1 = box(g, 0.36, 0.01, 0.5, tissue, -0.42, y + 0.27, 0); if (fl1) fl1.rotation.z = 0.9;
        const fl2 = box(g, 0.36, 0.01, 0.5, tissue, 0.42, y + 0.27, 0); if (fl2) fl2.rotation.z = -0.9;
        const shoes = pair(g, 0, y + 0.04, 0);
        const lid = new THREE.Group(); g.add(lid);
        rbox(lid, 0.9, 0.08, 0.66, 0.01, clay('#ea6a38'), 0, 0, 0);
        return { lid, y, shoes };
      },
      update({ lid, y }, t) {
        B(0.3);
        // The lid starts already lifted, so frame 0 shows the white shoes peeking out.
        const pop = lerp(0.6, 1, prog(t, 0, 0.3, ease.out)), slide = prog(t, 0.28, 1.0, ease.inOut);
        lid.position.set(lerp(0, 1.3, slide), y + 0.34 + pop * 0.3 - slide * 0.2, lerp(0, 0.3, slide));
        lid.rotation.z = -pop * 0.3 + slide * 0.1;
        const push = prog(t, 0, 2.4, ease.out), d = drift(t, 0.012);
        cam(d.x + 0.2, lerp(3.9, 3.5, push) + d.y, lerp(3.1, 2.7, push), 0, 0.75, -0.05, 32);
      },
    },
    // Sunday night: the pair placed by the door, the clock past eleven.
    b2: {
      build(g) {
        const r = room(g, 'night', { keyPower: 70, fillPower: 2.2, keyX: 1.4, keyY: 4, keyZ: 2, angle: 0.5, wallZ: -2 });
        const wz = r.wall.position.z;
        const door = O.door(g, { color: '#46566c', gap: 0.04 }); door.position.set(-0.7, 0, wz + 0.02);
        const clock = O.clock(g, { r: 0.26 }); clock.position.set(0.9, 1.3, wz + 0.06);
        const pool = spill(g, 1.4, 1.4, '#ffd9a8', 0.35); pool.rotation.x = -Math.PI / 2; pool.position.set(0.2, 0.012, wz + 0.8);
        const shoes = pair(g, 0.2, 0, wz + 0.8);
        return { clock, shoes, wz };
      },
      update({ clock, shoes, wz }, t, k) {
        B(0.35);
        clock.set(23.15 + k * 0.3);
        // The second shoe is set down in the first half second.
        const place = prog(t, 0, 0.45, ease.drop);
        shoes[1].position.y = (1 - place) * 0.45;
        const d = drift(t, 0.012);
        cam(d.x + lerp(0.5, 0.3, k), lerp(2.0, 1.9, k) + d.y, wz + lerp(6.6, 6.0, k), 0.25, 0.08, wz, 30);
      },
    },
    // Monday, Tuesday, and the box slides under the bed into the dark.
    b3: {
      build(g) {
        room(g, 'night', { keyPower: 32, fillPower: 2.4, keyX: 1.6, keyY: 3.5, keyZ: 3, angle: 0.55, wallZ: -2.2, floorColor: '#5b4636' });
        // A bed on legs, long side to the camera, with a dark gap underneath.
        const frame = clay('#3a2c24');
        const bx = -1.0;
        rbox(g, 3, 0.16, 1.9, 0.03, frame, bx, 0.44, -1);
        rbox(g, 2.9, 0.26, 1.85, 0.1, clay('#7f93a8', { roughness: 0.95 }), bx, 0.65, -1);
        rbox(g, 3.1, 0.12, 0.05, 0.02, clay('#71859a'), bx, 0.42, -0.03);
        for (const [x, z] of [[-1.4, -0.12], [1.4, -0.12], [-1.4, -1.88], [1.4, -1.88]]) box(g, 0.07, 0.36, 0.07, frame, bx + x, 0.18, z);
        const shade = spill(g, 3.2, 2, '#020306', 0.85); shade.rotation.x = -Math.PI / 2; shade.position.set(bx, 0.006, -1);
        const boxG = new THREE.Group(); g.add(boxG);
        rbox(boxG, 0.62, 0.22, 0.44, 0.01, clay('#e0602f'), 0, 0.11, 0);
        return { boxG };
      },
      update({ boxG }, t) {
        B(0.3);
        const go = prog(t, kit.at('Tuesday'), kit.atEnd('bed') + 0.15, ease.inOut);
        boxG.position.set(lerp(0.2, 0.05, go), 0, lerp(0.35, -0.9, go));
        boxG.rotation.y = 0.35 - go * 0.35;
        // A small nudge in the first half second so the opening frame moves.
        boxG.position.x += (1 - prog(t, 0, 0.5, ease.out)) * 0.18;
        const dr = drift(t, 0.012);
        cam(dr.x + 0.4, 1.0 + dr.y, lerp(3.6, 3.2, prog(t, 0, 3, ease.inOut)), 0.1, 0.0, -0.6, 32);
      },
    },
    // The door: a line of morning light under it, slow push.
    b4: {
      build(g) {
        const r = room(g, 'ink', { keyPower: 45, fillPower: 2.4, keyX: 0.8, keyY: 3.5, keyZ: 3, angle: 0.5, wallZ: -2, floorColor: '#4a3c33' });
        const wz = r.wall.position.z;
        O.door(g, { color: '#566a82', gap: 0.07 }).position.set(0, 0, wz + 0.02);
        const line = spill(g, 2.2, 0.7, '#ffcf8f', 0.8); line.rotation.x = -Math.PI / 2; line.position.set(0, 0.012, wz + 0.4);
        box(g, 1.58, 0.06, 0.02, glow('#ffd59c', 2), 0, 0.035, wz - 0.01);
        const dust = motes(g, { box: [2, 1.5, 1.2], n: 24 });
        return { line, dust, wz };
      },
      update({ line, dust, wz }, t) {
        B(0.45);
        dust.set(t);
        line.set(0.55 + 0.45 * prog(t, kit.at('door'), kit.at('door') + 0.4, ease.out));
        const d = drift(t, 0.012);
        const push = prog(t, 0, Math.max(1, kit.atEnd('was')), ease.inOut);
        cam(d.x + 0.15, lerp(1.0, 0.9, push) + d.y, wz + lerp(6.8, 6.2, push), 0, 0.15, wz, 32);
      },
    },
    // The door opens, warm morning comes in and reaches the shoes.
    b5: {
      build(g) {
        const r = room(g, 'ink', { keyPower: 15, fillPower: 1.6, keyX: 0, keyY: 2.4, keyZ: -1.2, angle: 0.7, wallZ: -2, floorColor: '#5b4636' });
        const wz = r.wall.position.z;
        const outside = spill(g, 1.6, 3, '#ffcf96', 0.7); outside.position.set(0, 1.5, wz + 0.005);
        const door = O.door(g, { color: '#566a82' }); door.position.set(0, 0, wz + 0.02);
        const pool = spill(g, 1.5, 2.2, '#ffc988', 0.55); pool.rotation.x = -Math.PI / 2; pool.position.set(0, 0.012, wz + 1.2);
        pair(g, 0, 0, wz + 1.0);
        return { r, door, pool, wz };
      },
      update({ r, door, pool, wz }, t, k) {
        B(0.25);
        const open = prog(t, 0.05, 1.1, ease.inOut);
        door.open(open);
        pool.set(open);
        r.key.intensity = 15 + open * 45;
        r.fill.intensity = 1.6 + open * 0.3;
        const d = drift(t, 0.012);
        cam(d.x + 0.35, lerp(2.6, 2.4, k) + d.y, wz + lerp(6.2, 5.6, k), 0, -0.25, wz + 0.8, 32);
      },
    },
    // Send line: close on the white shoes in the doorway light, one lace comes loose.
    b6: {
      build(g) {
        room(g, 'sand', { keyPower: 40, fillPower: 1.1, keyX: 0.6, keyY: 2.5, keyZ: -1.6, angle: 0.6, wallZ: -2.5, floorColor: '#6a4c36' });
        const pool = spill(g, 1.6, 1.6, '#ffc988', 0.35); pool.rotation.x = -Math.PI / 2; pool.position.set(0, 0.01, 0);
        const shoes = pair(g, 0, 0, 0);
        return { shoes };
      },
      update({ shoes }, t, k) {
        B(0.2);
        const loose = prog(t, kit.at('white'), kit.at('white') + 0.45, ease.out);
        const lace = shoes[1].laces[0]; if (lace) { lace.rotation.x = loose * 0.9; lace.position.z = loose * 0.12; lace.position.y = 0.268 - loose * 0.12; }
        const swing = prog(t, 0, 0.6, ease.out), d = drift(t, 0.01);
        cam(d.x + lerp(1.5, 1.2, swing) - k * 0.5, 1.3 + d.y, lerp(2.6, 2.4, k), 0.12, -0.05, 0.05, 32);
      },
    },
  };
};
