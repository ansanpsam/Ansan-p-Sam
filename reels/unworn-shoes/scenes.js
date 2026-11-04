// Six beats: the shoes that never ran. Objects, rooms, light only.
export default (kit) => {
  const { O, THREE, room, cam, drift, prog, ease, lerp, clay, box, rbox, sphere, spill, motes } = kit;

  // A running shoe in profile, toe pointing +x, about 0.62 long. Origin at the sole's centre on the floor.
  const shoe = (g, { color = '#f3f1ec', accent = '#FF7A45' } = {}) => {
    const s = new THREE.Group(); g.add(s);
    rbox(s, 0.64, 0.06, 0.25, 0.025, clay('#e9e4da', { roughness: 0.8 }), 0, 0.03, 0);
    rbox(s, 0.5, 0.17, 0.23, 0.07, clay(color, { roughness: 0.6 }), -0.04, 0.14, 0);
    const toe = sphere(s, 0.115, clay(color, { roughness: 0.6 }), 0.19, 0.11, 0); if (toe) toe.scale.set(1.15, 0.7, 1);
    rbox(s, 0.17, 0.09, 0.21, 0.035, clay(color), -0.21, 0.25, 0);
    box(s, 0.32, 0.03, 0.235, clay(accent), -0.02, 0.12, 0);
    const laces = [0, 1, 2, 3].map((i) => box(s, 0.022, 0.014, 0.17, clay('#ffffff'), -0.08 + i * 0.07, 0.235 - i * 0.012, 0));
    return Object.assign(s, { laces });
  };
  const pair = (g, x, y, z, opts) => {
    const a = shoe(g, opts); a.position.set(x, y, z - 0.15);
    const b = shoe(g, opts); b.position.set(x + 0.05, y, z + 0.15);
    return [a, b];
  };

  return {
    // Hook: lid pops off the box in the first half second, shoes revealed.
    b1: {
      build(g) {
        room(g, 'sand', { keyPower: 70, fillPower: 0.9, angle: 0.5, keyX: -1.2, keyZ: 3 });
        const table = O.table(g, { color: '#6b4a33' });
        const y = table.top;
        const boxC = clay('#d8572a', { roughness: 0.7 });
        box(g, 0.86, 0.02, 0.62, boxC, 0, y + 0.01, 0);
        box(g, 0.86, 0.3, 0.02, boxC, 0, y + 0.15, -0.31);
        box(g, 0.86, 0.3, 0.02, boxC, 0, y + 0.15, 0.31);
        box(g, 0.02, 0.3, 0.62, boxC, -0.43, y + 0.15, 0);
        box(g, 0.02, 0.3, 0.62, boxC, 0.43, y + 0.15, 0);
        box(g, 0.8, 0.01, 0.58, clay('#f7f3ea'), 0, y + 0.03, 0);
        const shoes = pair(g, -0.03, y + 0.03, 0);
        const lid = new THREE.Group(); g.add(lid);
        rbox(lid, 0.9, 0.08, 0.66, 0.01, clay('#e2643a'), 0, 0, 0);
        return { lid, y, shoes };
      },
      update({ lid, y }, t) {
        const pop = prog(t, 0, 0.35, ease.out), slide = prog(t, 0.3, 1.1, ease.inOut);
        lid.position.set(lerp(0, 1.15, slide), y + 0.34 + pop * 0.28 - slide * 0.3, lerp(0, 0.2, slide));
        lid.rotation.z = -pop * 0.25 + slide * 0.25;
        const push = prog(t, 0, 2.2, ease.out), d = drift(t, 0.012);
        cam(d.x, lerp(3.4, 2.75, push) + d.y, lerp(3.4, 2.5, push), 0, y + 0.1, 0, 32);
      },
    },
    // Sunday night: placed by the door, clock past eleven, slow lens.
    b2: {
      build(g) {
        const r = room(g, 'night', { keyPower: 60, fillPower: 1.2, keyX: 1.2, keyZ: 3, wallZ: -2.2 });
        const door = O.door(g, { color: '#3c4a5c', gap: 0.04 }); door.position.set(-0.4, 0, r.wall.position.z + 0.02);
        const clock = O.clock(g, { r: 0.32 }); clock.position.set(0.95, 2.2, r.wall.position.z + 0.06);
        const shoes = pair(g, 0.3, 0, -1.2);
        return { clock, shoes };
      },
      update({ clock, shoes }, t, k) {
        clock.set(23.1 + k * 0.4);
        const place = prog(t, 0, 0.5, ease.drop);
        shoes[1].position.y = (1 - place) * 0.5;
        const d = drift(t, 0.015);
        cam(d.x + lerp(0.6, 0.3, k), 1.5 + d.y, 3.2 - k * 0.4, 0.3, 0.9, -1.4, 32);
      },
    },
    // Monday, Tuesday, under the bed.
    b3: {
      build(g) {
        room(g, 'clay', { keyPower: 55, fillPower: 1, keyX: -1.5, keyZ: 3.2, wallZ: -3 });
        const bed = O.bed(g, { sheet: '#cfd6dc', pillow: '#eef0f2' }); bed.rotation.y = Math.PI / 2; bed.position.set(-0.9, 0, -1.2);
        const shade = spill(g, 1.6, 1.6, '#05060a', 0.6); shade.rotation.x = -Math.PI / 2; shade.position.set(-0.9, 0.01, -1.2);
        const boxG = new THREE.Group(); g.add(boxG);
        rbox(boxG, 0.86, 0.32, 0.62, 0.01, clay('#d8572a'), 0, 0.16, 0);
        return { boxG };
      },
      update({ boxG }, t, k, d) {
        const go = prog(t, kit.at('Tuesday'), kit.atEnd('bed') + 0.2, ease.inOut);
        boxG.position.set(lerp(0.9, -0.7, go), 0, lerp(0.6, -0.9, go));
        boxG.rotation.y = 0.3 - go * 0.3;
        const dr = drift(t, 0.02);
        cam(dr.x + 0.4, 0.55 + dr.y, 3.6 - k * 0.6, -0.1, 0.35, -0.4, 34);
      },
    },
    // The door: light under it, slow push.
    b4: {
      build(g) {
        const r = room(g, 'ink', { keyPower: 30, fillPower: 1.3, wallZ: -2 });
        const door = O.door(g, { color: '#4a5566', gap: 0.06 }); door.position.set(0, 0, r.wall.position.z + 0.02);
        const line = spill(g, 2.2, 0.5, '#ffd9a8', 0.7); line.rotation.x = -Math.PI / 2; line.position.set(0, 0.012, r.wall.position.z + 0.3);
        const dust = motes(g, { box: [2.5, 3, 1.5], n: 24 });
        return { line, dust };
      },
      update({ line, dust }, t, k) {
        dust.set(t);
        line.set(0.5 + 0.5 * prog(t, kit.at('door'), kit.at('door') + 0.4, ease.out));
        const d = drift(t, 0.015);
        cam(d.x, 1.55 + d.y, lerp(7.2, 5.6, k), 0, 1.55, -2, 32);
      },
    },
    // Door opens, morning floods in and reaches the shoes.
    b5: {
      build(g) {
        const r = room(g, 'paper', { keyPower: 20, fillPower: 0.6, keyX: 0, keyY: 2.2, keyZ: -1.4, wallZ: -2 });
        const outside = spill(g, 1.8, 3, '#ffe2b0', 0.9); outside.position.set(0, 1.55, r.wall.position.z + 0.01);
        const door = O.door(g, { color: '#4a5566' }); door.position.set(0, 0, r.wall.position.z + 0.02);
        const pool = spill(g, 1.8, 2.6, '#ffd29a', 0.8); pool.rotation.x = -Math.PI / 2; pool.position.set(0, 0.012, r.wall.position.z + 1.4);
        const shoes = pair(g, 0, 0, r.wall.position.z + 2.1);
        return { r, door, pool };
      },
      update({ r, door, pool }, t, k) {
        const open = prog(t, 0.1, 1.2, ease.inOut);
        door.open(open);
        pool.set(open);
        r.key.intensity = 20 + open * 110;
        r.fill.intensity = 0.6 + open * 0.5;
        const d = drift(t, 0.02);
        cam(d.x + 0.3, 1.3 + d.y, lerp(3.4, 2.7, k), 0, 0.7, -0.6, 34);
      },
    },
    // Send line: close on the white shoes, one lace loosens.
    b6: {
      build(g) {
        room(g, 'paper', { keyPower: 85, fillPower: 1, keyX: 0.5, keyY: 2, keyZ: -1.5, wallZ: -2.5 });
        const pool = spill(g, 1.6, 1.6, '#ffd29a', 0.7); pool.rotation.x = -Math.PI / 2; pool.position.set(0, 0.01, 0);
        const shoes = pair(g, 0, 0, 0);
        return { shoes };
      },
      update({ shoes }, t, k) {
        const loose = prog(t, kit.at('white'), kit.at('white') + 0.8, ease.out);
        const lace = shoes[1].laces[3]; if (lace) { lace.rotation.x = loose * 0.6; lace.position.z = loose * 0.08; }
        const d = drift(t, 0.01);
        cam(d.x + lerp(0.9, 0.5, k), 0.75 + d.y, lerp(1.6, 1.35, k), 0, 0.12, 0, 32);
      },
    },
  };
};
