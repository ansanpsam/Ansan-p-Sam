// The bag by the door. One scene per beat.
export default (kit) => {
  const { O, room, cam, drift, prog, ease, lerp, clamp, clay, metal, glow, box, rbox, cyl, torus, sphere, spill, motes, panel, sign, THREE } = kit;

  // A packed duffel bag. Origin at its base, long axis along x. About 1.1 wide and 0.6 tall.
  const BAG = '#2f6f78', TRIM = '#ff8a3d';
  const bag = (g, o = {}) => {
    const b = new THREE.Group(); g.add(b);
    const body = clay(o.color ?? BAG, { roughness: 0.85 });
    const trim = clay(TRIM, { roughness: 0.7 });
    const main = cyl(b, 0.29, 0.29, 0.98, body, 0, 0.29, 0, 48); main.rotation.z = Math.PI / 2; main.scale.set(1, 1, 0.92);
    for (const s of [-1, 1]) {
      const cap = cyl(b, 0.3, 0.3, 0.05, trim, s * 0.5, 0.29, 0, 48); cap.rotation.z = Math.PI / 2; cap.scale.set(1, 1, 0.92);
    }
    rbox(b, 0.98, 0.07, 0.05, 0.02, trim, 0, 0.29, 0.255);             // side stripe
    box(b, 0.9, 0.018, 0.03, metal('#2a2a2a'), 0, 0.58, 0);             // zip
    const pull = rbox(b, 0.05, 0.02, 0.09, 0.01, metal('#d9d4c8'), 0.32, 0.59, 0.05);
    for (const z of [-0.07, 0.07]) torus(b, 0.17, 0.028, clay('#1d4048'), 0, 0.52, z); // handles
    b.pull = pull; b.body = main;
    return b;
  };

  // A room with a real doorway, so the door can open onto light. Wall face at z = wz.
  const doorway = (g, o = {}) => {
    const r = room(g, o.look ?? 'clay', { keyPower: o.keyPower ?? 120, fillPower: o.fillPower ?? 0.7, wallZ: -9, keyX: 1.2, keyZ: 5, angle: 0.55 });
    const wz = -2, wc = clay(o.wall ?? '#7a4a36', { roughness: 0.95 });
    box(g, 6, 8, 0.2, wc, -3.93, 4, wz - 0.1);
    box(g, 6, 8, 0.2, wc, 3.93, 4, wz - 0.1);
    box(g, 1.86, 5, 0.2, wc, 0, 3.17 + 2.5, wz - 0.1);
    const door = O.door(g, { color: '#5a3b2a', gap: 0.04 }); door.position.set(0, 0, wz);
    // Morning outside: a bright backdrop behind the doorway.
    const outside = panel(g, 1.8, 3.2, (x, w, h) => {
      const gr = x.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#f3c48a'); gr.addColorStop(0.6, '#e8a46a'); gr.addColorStop(1, '#c97a4a');
      x.fillStyle = gr; x.fillRect(0, 0, w, h);
    }, { power: 0.62 });
    outside.position.set(0, 1.6, wz - 0.35);
    const pool = spill(g, 2.2, 3.4, '#ffcf8f', 0.55); pool.rotation.x = -Math.PI / 2; pool.position.set(0.1, 0.012, wz + 1.6);
    const sun = new THREE.SpotLight('#ffcf94', 0, 0, 0.5, 0.6, 1.4); sun.position.set(0, 2.6, wz - 1.5); sun.target.position.set(0.3, 0, wz + 2); sun.castShadow = true; g.add(sun, sun.target);
    return { r, door, pool, sun, wz };
  };

  return {
    // Hook: the bag slumps down by a closed door, a line of light under it.
    b1: {
      build(g) {
        const r = room(g, 'night', { keyPower: 170, fillPower: 1.0, keyX: 1.5, keyZ: 4, angle: 0.5, wallZ: -2 });
        const door = O.door(g, { color: '#4a3326', gap: 0.06 }); door.position.set(-0.55, 0, -1.98);
        const under = spill(g, 1.6, 0.25, '#ffcf8f', 0.85); under.position.set(-0.55, 0.05, -1.88);
        const pool = spill(g, 1.8, 0.9, '#ffcf8f', 0.35); pool.rotation.x = -Math.PI / 2; pool.position.set(-0.55, 0.01, -1.45);
        const b = bag(g); b.position.set(0.02, 0, -1.2); b.rotation.y = -0.2;
        const dust = motes(g, { box: [2.4, 1.2, 1], n: 26 }); dust.set(0);
        return { b, dust };
      },
      update({ b, dust }, t, k) {
        dust.set(t);
        const fall = prog(t, 0, 0.55, ease.drop);
        b.position.y = (1 - fall) * 0.65;
        const squash = 1 - 0.12 * Math.max(0, Math.sin(clamp((t - 0.42) / 0.3) * Math.PI));
        b.scale.set(1 + (1 - squash) * 0.6, squash, 1);
        // A slow sag on "ready": it has been waiting.
        const sag = prog(t, kit.at('ready'), kit.at('ready') + 0.6, ease.out);
        b.rotation.z = sag * 0.05;
        const push = prog(t, 0, 2.6, ease.out), d = drift(t, 0.02);
        cam(0.1 + d.x, lerp(1.9, 1.4, push) + d.y, lerp(6.8, 4.9, push), -0.1, 0.12, -1.4, 32);
      },
    },

    // Its contents pop out one by one: shoes, towel, bottle.
    b2: {
      build(g) {
        room(g, 'sand', { keyPower: 150, fillPower: 0.85, keyX: -1.6, keyZ: 3.5, angle: 0.5, wallZ: -3 });
        const b = bag(g); b.position.set(0, 0, 0);
        const white = clay('#f2efe8', { roughness: 0.6 });
        const shoe = new THREE.Group(); g.add(shoe);
        for (const x of [-0.13, 0.13]) {
          rbox(shoe, 0.2, 0.06, 0.46, 0.03, white, x, 0, 0);
          rbox(shoe, 0.18, 0.13, 0.36, 0.06, clay('#3a3f4a', { roughness: 0.6 }), x, 0.09, -0.04);
          box(shoe, 0.185, 0.03, 0.2, clay(TRIM), x, 0.1, 0.02);
        }
        const towel = new THREE.Group(); g.add(towel);
        rbox(towel, 0.5, 0.07, 0.32, 0.03, clay('#cdb48e'), 0, 0, 0);
        rbox(towel, 0.5, 0.07, 0.32, 0.03, clay('#8fb3a7'), 0, 0.075, 0);
        const bottle = new THREE.Group(); g.add(bottle);
        cyl(bottle, 0.075, 0.075, 0.34, clay('#a9c4d1', { roughness: 0.3 }), 0, 0, 0);
        cyl(bottle, 0.05, 0.05, 0.07, clay('#1d4048'), 0, 0.2, 0);
        return { b, items: [[shoe, 'shoes', -0.45], [towel, 'towel', 0.0], [bottle, 'bottle', 0.45]] };
      },
      update({ b, items }, t, k) {
        for (const [o, word, x] of items) {
          const at = kit.at(word);
          const up = prog(t, at - 0.15, at + 0.35, ease.back);
          o.visible = t >= at - 0.15;
          o.position.set(x * up, 0.4 + up * 0.62 + Math.sin(t * 2 + x * 4) * 0.02, 0.05);
          o.rotation.y = (1 - up) * 1.4 + t * 0.25;
          o.scale.setScalar(0.4 + up * 0.6);
        }
        // "part": the bag gives a proud little bounce.
        const bump = prog(t, kit.at('part') - 0.05, kit.at('part') + 0.35, ease.out);
        b.scale.y = 1 + Math.sin(bump * Math.PI) * 0.08;
        b.pull.position.x = lerp(0.32, -0.32, prog(t, 0, 0.5, ease.out));
        const d = drift(t, 0.02);
        cam(lerp(-0.5, 0.4, k) + d.x, 2.0 + d.y, 4.8 - k * 0.2, 0, 0.22, 0, 32);
      },
    },

    // Days pass over the bag: the clock spins, the light flips, it never moves.
    b3: {
      build(g) {
        const r = room(g, 'night', { keyPower: 160, fillPower: 1.0, keyX: -1.4, keyZ: 4, angle: 0.55, wallZ: -1.6 });
        const clock = O.clock(g, { r: 0.42 }); clock.position.set(0, 1.8, -1.53);
        const b = bag(g); b.position.set(0, 0, -0.9);
        const note = sign(g, 'TOMORROW', { w: 1.2, h: 0.32, size: 0.55, color: '#1b1b1b', bg: '#ffd84d', power: 0.9 });
        note.position.set(0, 1.12, -1.55);
        const win = spill(g, 1.4, 1.8, '#9fc3ff', 0.4); win.position.set(-1.1, 1.6, -1.56);
        return { r, clock, b, note, win };
      },
      update({ r, clock, note, win }, t, k) {
        clock.set(7 + t * 7);
        const day = 0.5 + 0.5 * Math.cos(t * 3.2);
        r.key.intensity = 90 + day * 110;
        r.fill.intensity = 0.75 + day * 0.4;
        win.set(0.3 + day * 0.7);
        const at = kit.at('tomorrow');
        const pop = prog(t, at - 0.1, at + 0.3, ease.back);
        note.visible = t >= at - 0.1;
        note.scale.setScalar(Math.max(pop, 0.001));
        note.rotation.z = (1 - pop) * 0.5 - 0.05;
        const d = drift(t, 0.02);
        cam(lerp(0.8, -0.4, k) + d.x, 1.0 + d.y, 6.2 - k * 0.2, 0, 0.42, -1.2, 34);
      },
    },

    // The calendar keeps flipping to the same page: MONDAY.
    b4: {
      build(g) {
        room(g, 'paper', { keyPower: 55, fillPower: 0.5, wallColor: '#d3cbbd', keyX: 1.6, keyZ: 4, angle: 0.5, wallZ: -1 });
        const page = (x, w, h) => {
          x.fillStyle = '#fbf8f2'; x.fillRect(0, 0, w, h);
          x.fillStyle = '#d9453a'; x.fillRect(0, 0, w, h * 0.22);
          x.fillStyle = '#fff'; x.textAlign = 'center'; x.textBaseline = 'middle';
          x.font = `800 ${h * 0.11}px Inter`; x.fillText('THIS WEEK', w / 2, h * 0.11);
          x.fillStyle = '#1e1e1e'; x.font = `900 ${h * 0.2}px Inter`; x.fillText('MONDAY', w / 2, h * 0.58);
          x.strokeStyle = '#d6d0c4'; x.lineWidth = h * 0.006; x.strokeRect(0, 0, w, h);
        };
        const back = rbox(g, 1.5, 1.85, 0.06, 0.02, clay('#3b3b40'), 0, 1.62, -0.96);
        const pages = [];
        for (let i = 0; i < 5; i++) {
          const pivot = new THREE.Group(); pivot.position.set(0, 2.45, -0.92 + i * 0.006); g.add(pivot);
          const p = panel(pivot, 1.36, 1.6, page, { lit: true }); p.position.set(0, -0.8, 0);
          pages.push(pivot);
        }
        box(g, 1.5, 0.08, 0.1, metal('#9a968e'), 0, 2.47, -0.88);
        void back;
        return { pages };
      },
      update({ pages }, t, k) {
        // Pages flip from the start, and the last one lands on "Monday".
        const end = kit.at('monday');
        pages.forEach((p, i) => {
          const order = pages.length - 1 - i;           // top page flips first
          if (order === pages.length - 1) { p.rotation.x = 0; return; }
          const st = (order / (pages.length - 1)) * end;
          const f = prog(t, st, st + 0.32, ease.in);
          p.rotation.x = f * 2.6;
          p.visible = f < 0.98;
        });
        const d = drift(t, 0.015);
        cam(lerp(-0.5, 0.2, k) + d.x, 1.2 + d.y, 7.1 - k * 0.5, 0, 1.2, -0.9, 32);
      },
    },

    // The door swings open on "step" and morning light floods across the bag.
    b5: {
      build(g) {
        const s = doorway(g, { look: 'clay', keyPower: 70, fillPower: 0.55 });
        const b = bag(g); b.position.set(0.5, 0, -0.95); b.rotation.y = -0.2;
        const dust = motes(g, { box: [1.6, 2.6, 2], n: 34, power: 0.35 });
        return { ...s, b, dust };
      },
      update({ r, door, pool, sun, b, dust }, t, k, d) {
        dust.set(t);
        const at = kit.at('step');
        const open = prog(t, at - 0.2, at + 0.9, ease.inOut);
        door.open(open);
        pool.set(open);
        sun.intensity = open * 115;
        r.fill.intensity = 0.55 + open * 0.35;
        b.position.y = Math.max(0, Math.sin(prog(t, at + 0.5, at + 0.9, ease.out) * Math.PI)) * 0.08;
        const dr = drift(t, 0.02);
        cam(lerp(1.35, 1.05, k) + dr.x, 3.5 + dr.y, lerp(5.6, 5.9, prog(t, at, d, ease.inOut)), 0.2, 0.22, -1.4, 34);
      },
    },

    // Wide: doorway glowing, the bag in the light, TODAY on the mat.
    b6: {
      build(g) {
        const s = doorway(g, { look: 'clay', keyPower: 80, fillPower: 0.85 });
        s.door.open(1); s.pool.set(1); s.sun.intensity = 115;
        const b = bag(g); b.position.set(0.5, 0, -0.95); b.rotation.y = -0.2;
        const mat = sign(g, 'TODAY', { w: 1.4, h: 0.6, size: 0.55, color: '#3a1f12', bg: '#c98f55', power: 0.42 });
        mat.rotation.x = -Math.PI / 2; mat.position.set(-0.25, 0.015, -0.25);
        const dust = motes(g, { box: [1.6, 2.6, 2], n: 34, power: 0.35 });
        return { ...s, b, mat, dust };
      },
      update({ sun, b, dust, mat }, t, k) {
        dust.set(t);
        sun.intensity = 115 + Math.sin(t * 1.3) * 8;
        // The bag nudges toward the door on "door".
        const go = prog(t, kit.at('door') - 0.1, kit.at('door') + 0.6, ease.out);
        b.position.z = -0.95 - go * 0.2;
        b.rotation.y = -0.2 + go * 0.2;
        mat.scale.setScalar(1);
        const dr = drift(t, 0.02);
        cam(0.5 + dr.x, lerp(3.0, 4.2, k) + dr.y, lerp(7.0, 8.0, k), 0.1, 0.16, -1.4, 34);
      },
    },
  };
};
