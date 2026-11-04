// Cold tea. One scene per beat. build(g) makes objects once; update(refs, t, k, d) poses them for time t.
export default (kit) => {
  const { O, room, cam, drift, prog, ease, lerp, clamp, clay, rbox, steam, spill, motes, sign } = kit;

  // A social feed: cards sliding up. off is how far it has scrolled, in screen heights.
  const feed = (x, w, h, off, dim = 1) => {
    x.fillStyle = '#0d0f14'; x.fillRect(0, 0, w, h);
    const ch = h * 0.34, gap = h * 0.03, cols = ['#e0679a', '#58a6ff', '#f2b84b', '#6fd39a', '#b48cff'];
    const shift = (off * h) % (ch + gap), first = Math.floor((off * h) / (ch + gap));
    for (let i = -1; i < 5; i++) {
      const y = i * (ch + gap) - shift + gap, c = cols[((first + i) % 5 + 5) % 5];
      x.globalAlpha = dim;
      x.fillStyle = c; x.fillRect(w * 0.06, y, w * 0.88, ch * 0.72);
      x.fillStyle = '#e8e8ee'; x.fillRect(w * 0.06, y + ch * 0.78, w * 0.6, ch * 0.06);
      x.fillStyle = '#6b6e78'; x.fillRect(w * 0.06, y + ch * 0.88, w * 0.4, ch * 0.05);
    }
    x.globalAlpha = 1;
  };
  // Scroll that speeds up: position is the integral of a rising speed, so it stays a pure function of t.
  const scrolled = (t, v0, accel) => v0 * t + 0.5 * accel * t * t;
  const tea = (mug) => mug.children[1];

  return {
    b1: {
      build(g) {
        room(g, 'ink', { keyPower: 46, fillPower: 0.9, angle: 0.4, keyX: -0.8, keyZ: 2.6 });
        const table = O.table(g, { color: '#3a281c' });
        const mug = O.mug(g); mug.position.set(0, table.top, -0.55);
        const so = { x: 0, y: table.top + 0.32, z: -0.55, height: 0.7, power: 0.22, n: 14 };
        const st = steam(g, so);
        const phone = O.phone(g, { power: 0.9 }); phone.rotation.x = -Math.PI / 2 + 0.02; phone.position.set(0, table.top + 0.04, 0.42);
        return { phone, st, so };
      },
      update({ phone, st, so }, t, k, d) {
        phone.screen.paint((x, w, h) => feed(x, w, h, scrolled(t, 0.25, 0.1)));
        // Buzz from frame 0 so the opening moves.
        const buzz = Math.floor(t * 1.6) % 2 === 0 ? 1 - ((t * 1.6) % 1) : 0;
        phone.position.x = Math.sin(t * 95) * 0.02 * buzz;
        phone.rotation.z = Math.sin(t * 71) * 0.03 * buzz;
        so.power = lerp(0.22, 0.05, prog(t, kit.at('cold'), d, ease.out));
        st.set(t);
        const push = prog(t, 0, 2.2, ease.out), dr = drift(t, 0.012);
        cam(dr.x, lerp(4.6, 3.9, push) + dr.y, lerp(1.9, 1.45, push), 0, 1.02, -0.02, 30);
      },
    },
    b2: {
      build(g) {
        const r = room(g, 'sand', { keyPower: 70, fillPower: 0.8, keyX: 2.4, keyY: 5, keyZ: 3, angle: 0.5, wallZ: -2.2 });
        const table = O.table(g, { color: '#8a5a3a' });
        const mug = O.mug(g, { color: '#e7d6bf' }); mug.position.set(0, table.top, 0); mug.rotation.y = -0.5;
        const st = steam(g, { x: 0, y: table.top + 0.32, z: 0, height: 1.0, power: 0.26, n: 16 });
        const cube = rbox(g, 0.07, 0.07, 0.07, 0.008, clay('#fbf7ef', { roughness: 0.8 }));
        const ring = kit.torus(g, 0.05, 0.006, clay('#c99a6a', { roughness: 0.2 }), 0, table.top + 0.305, 0); ring.rotation.x = Math.PI / 2;
        const sun = spill(g, 2.6, 1.8, '#ffd29a', 0.55); sun.position.set(0.5, 1.9, r.wall.position.z + 0.05);
        const dust = motes(g, { box: [2.4, 2.4, 1.6], n: 26 });
        return { st, cube, ring, table, dust };
      },
      update({ st, cube, ring, table, dust }, t, k, d) {
        st.set(t + 3); dust.set(t);
        const land = kit.at('sugar') + 0.25;
        const fall = prog(t, land - 0.45, land, ease.in);
        cube.position.set(0.02, lerp(2.3, table.top + 0.28, fall), 0);
        cube.rotation.set(t * 2, t * 1.4, 0);
        cube.visible = fall < 1;
        const sp = prog(t, land, land + 0.6, ease.out);
        ring.scale.setScalar(1 + sp * 1.7); ring.visible = sp > 0 && sp < 1;
        const dr = drift(t, 0.015);
        cam(lerp(0.35, -0.1, k) + dr.x, 1.42 + dr.y, lerp(2.0, 2.4, k), 0, 1.02, 0, 30);
      },
    },
    b3: {
      build(g) {
        const r = room(g, 'night', { keyPower: 6, fillPower: 0.35, wallZ: -2.6 });
        const table = O.table(g, { color: '#2a1e16' });
        const phone = O.phone(g, { power: 1.0 }); phone.position.set(0, table.top + 0.8, 0.1); phone.rotation.x = -0.12;
        const glowSpot = spill(g, 1.6, 1.0, '#8fb4ff', 0.35); glowSpot.rotation.x = -Math.PI / 2; glowSpot.position.set(0, table.top + 0.065, 0.4);
        const mug = O.mug(g, { color: '#cfc6b8' }); mug.position.set(-0.62, table.top, -0.25);
        return { phone, r };
      },
      update({ phone, r }, t, k, d) {
        const off = scrolled(t, 0.35, 0.5 + prog(t, kit.at('scroll'), d) * 1.2);
        phone.screen.paint((x, w, h) => feed(x, w, h, off));
        r.fill.intensity = 0.3 + 0.08 * Math.sin(t * 6);
        // Fast push in from frame 0.
        const push = prog(t, 0, 1.4, ease.out), dr = drift(t, 0.01);
        cam(dr.x + lerp(0.5, 0.05, push), 1.85 + dr.y, lerp(4.4, 3.2, push) - k * 0.25, 0, 1.78, 0.1, 30);
      },
    },
    b4: {
      build(g) {
        const r = room(g, 'clay', { keyPower: 60, fillPower: 0.7, keyX: -2, keyY: 4, keyZ: 2.5, angle: 0.45, wallZ: -2 });
        const table = O.table(g, { color: '#6b4630' });
        const mug = O.mug(g, { color: '#e9e2d5' }); mug.position.set(0, table.top, 0); mug.rotation.y = 0.6;
        const so = { x: 0, y: table.top + 0.32, z: 0, height: 0.8, power: 0.18, n: 10 };
        const st = steam(g, so);
        return { r, so, st, mug };
      },
      update({ r, so, st, mug }, t, k, d) {
        const go = prog(t, kit.at('go') - 0.6, kit.at('go') + 0.4, ease.inOut);
        so.power = lerp(0.18, 0.0, prog(t, 0, kit.at('go') + 0.2, ease.in));
        st.set(t);
        r.key.color.set('#ffc890').lerp(new kit.THREE.Color('#8fb0d8'), go);
        r.fill.intensity = lerp(0.7, 0.55, go);
        tea(mug).material.color.set('#7a4a22').lerp(new kit.THREE.Color('#5d4a3c'), go);
        const dr = drift(t, 0.01);
        cam(dr.x, 1.5 + dr.y, lerp(1.6, 1.3, k), 0, 1.12, 0, 28);
      },
    },
    b5: {
      build(g) {
        const r = room(g, 'night', { keyPower: 10, fillPower: 0.4, keyX: 1.5, keyZ: 3, angle: 0.5, wallZ: -2.4 });
        const table = O.table(g, { color: '#3e2a1d' });
        const mug = O.mug(g); mug.position.set(-0.45, table.top, -0.15);
        const so = { x: -0.45, y: table.top + 0.32, z: -0.15, height: 0.8, power: 0, n: 14 };
        const st = steam(g, so);
        const hinge = new kit.THREE.Group(); hinge.position.set(0.4, table.top + 0.005, 0.25); g.add(hinge);
        const phone = O.phone(g, { power: 1.0 }); g.remove(phone); hinge.add(phone);
        phone.rotation.x = -Math.PI / 2; phone.position.set(0, 0.04, 0);
        return { r, so, st, hinge, phone, mug };
      },
      update({ r, so, st, hinge, phone, mug }, t, k, d) {
        const flipAt = kit.at('face');
        const flip = prog(t, flipAt - 0.35, flipAt + 0.15, ease.inOut);
        // Rotate around the phone's long axis so it lands screen down.
        hinge.rotation.z = flip * Math.PI;
        hinge.position.y = 1.01 + Math.sin(flip * Math.PI) * 0.35;
        phone.screen.paint((x, w, h) => feed(x, w, h, 0.3 * t, 1 - flip));
        const warm = prog(t, kit.at('warm') - 0.8, kit.at('warm') + 0.3, ease.out);
        const lit = prog(t, flipAt, kit.at('warm'), ease.inOut);
        r.key.intensity = lerp(10, 70, lit);
        r.key.color.set('#ffb877');
        r.fill.intensity = lerp(0.4, 0.75, lit);
        so.power = 0.24 * warm;
        st.set(t);
        void mug;
        const dr = drift(t, 0.015);
        cam(dr.x, lerp(3.0, 2.6, k) + dr.y, lerp(2.6, 2.3, k), -0.02, 1.05, 0.05, 30);
      },
    },
    b6: {
      build(g) {
        const r = room(g, 'sand', { keyPower: 80, fillPower: 0.6, keyX: 0.3, keyY: 6, keyZ: 2, angle: 0.32, wallZ: -2.4 });
        const table = O.table(g, { color: '#7a4e33' });
        const mug = O.mug(g, { color: '#e7d6bf' }); mug.position.set(0, table.top, 0.1); mug.rotation.y = -0.4;
        const st = steam(g, { x: 0, y: table.top + 0.32, z: 0.1, height: 1.0, power: 0.22, n: 16 });
        const pool = spill(g, 1.8, 1.8, '#ffcf8f', 0.4); pool.rotation.x = -Math.PI / 2; pool.position.set(0, table.top + 0.065, 0.1);
        const words = sign(g, 'DRINK IT HOT', { w: 1.6, h: 0.3, color: '#5a3a25', lit: true });
        words.position.set(0, 2.05, r.wall.position.z + 0.04);
        const dust = motes(g, { box: [3, 2.6, 1.6], n: 24 });
        return { st, dust, words };
      },
      update({ st, dust, words }, t, k, d) {
        st.set(t + 5); dust.set(t);
        words.material.opacity = prog(t, kit.at('moments') - 0.3, kit.at('moments') + 0.5, ease.out);
        // Slow pull back for the quiet ending.
        const dr = drift(t, 0.02);
        cam(dr.x, lerp(1.55, 1.75, k) + dr.y, lerp(2.4, 4.4, prog(t, 0, d, ease.inOut)), 0, lerp(1.2, 1.4, k), 0, 30);
        void clamp;
      },
    },
  };
};
