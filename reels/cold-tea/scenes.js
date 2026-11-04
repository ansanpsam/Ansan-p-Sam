// Cold tea. One scene per beat. build(g) makes objects once; update(refs, t, k, d) poses them for time t.
export default (kit) => {
  const { O, room, cam, drift, prog, ease, lerp, clay, rbox, steam, spill, motes, sign, THREE } = kit;

  // A social feed: cards sliding up. off is how far it has scrolled, in screen heights.
  const feed = (x, w, h, off, dim = 1) => {
    x.fillStyle = '#0d0f14'; x.fillRect(0, 0, w, h);
    const ch = h * 0.34, gap = h * 0.03, cols = ['#d9628f', '#5197e0', '#e0a940', '#5fbf8a', '#a27ee6'];
    const shift = (off * h) % (ch + gap), first = Math.floor((off * h) / (ch + gap));
    x.globalAlpha = dim;
    for (let i = -1; i < 5; i++) {
      const y = i * (ch + gap) - shift + gap, c = cols[((first + i) % 5 + 5) % 5];
      x.fillStyle = c; x.fillRect(w * 0.06, y, w * 0.88, ch * 0.72);
      x.fillStyle = '#d8d8de'; x.fillRect(w * 0.06, y + ch * 0.78, w * 0.6, ch * 0.06);
      x.fillStyle = '#6b6e78'; x.fillRect(w * 0.06, y + ch * 0.88, w * 0.4, ch * 0.05);
    }
    x.globalAlpha = 1;
  };
  // Scroll that speeds up: position is the integral of a rising speed, so it stays a pure function of t.
  const scrolled = (t, v0, accel) => v0 * t + 0.5 * accel * t * t;

  // The story's object: an open mug you can see the tea in. Base at y = 0, 0.34 tall.
  const MUG_TOP = 0.34, TEA_Y = 0.27;
  const mug = (g, o = {}) => {
    const m = new THREE.Group(); g.add(m);
    const mat = clay(o.color ?? '#e9dcc8', { roughness: 0.45, side: THREE.DoubleSide });
    const prof = [[0, 0], [0.135, 0], [0.15, 0.012], [0.168, MUG_TOP], [0.156, MUG_TOP + 0.006], [0.15, MUG_TOP - 0.01], [0.135, 0.03], [0, 0.03]]
      .map(([a, b]) => new THREE.Vector2(a, b));
    const body = new THREE.Mesh(new THREE.LatheGeometry(prof, 48), mat); body.castShadow = true; body.receiveShadow = true; m.add(body);
    const teaMat = clay(o.tea ?? '#6a3510', { roughness: 0.12, metalness: 0.05 });
    const tea = new THREE.Mesh(new THREE.CircleGeometry(0.147, 40), teaMat); tea.rotation.x = -Math.PI / 2; tea.position.y = TEA_Y; m.add(tea);
    const handle = new THREE.Mesh(new THREE.TorusGeometry(0.075, 0.018, 12, 32, Math.PI * 1.1), mat);
    handle.position.set(0.185, 0.17, 0); handle.rotation.z = -Math.PI * 0.55; handle.castShadow = true; m.add(handle);
    m.tea = teaMat;
    return m;
  };
  const HOT = new THREE.Color('#6a3510'), COLD = new THREE.Color('#4a3a2e');

  return {
    // Hook: steaming mug above a buzzing, scrolling phone. Steam thins on "cold".
    b1: {
      build(g) {
        room(g, 'ink', { keyPower: 55, fillPower: 1.0, angle: 0.5, keyX: -0.8, keyY: 5, keyZ: 1.5 });
        const table = O.table(g, { color: '#4a3324' });
        const m = mug(g); m.position.set(-0.05, table.top, -0.62); m.rotation.y = 0.5;
        const so = { x: -0.05, y: table.top + TEA_Y, z: -0.62, height: 0.9, power: 0.35, n: 16 };
        const st = steam(g, so);
        const phone = O.phone(g, { power: 0.85 }); phone.rotation.x = -Math.PI / 2; phone.position.set(0.05, table.top + 0.04, 0.42);
        return { phone, st, so, m, top: table.top };
      },
      update({ phone, st, so, m }, t, k, d) {
        phone.screen.paint((x, w, h) => feed(x, w, h, scrolled(t, 0.25, 0.1)));
        // Buzz from frame 0 so the opening moves.
        const buzz = Math.floor(t * 1.6) % 2 === 0 ? 1 - ((t * 1.6) % 1) : 0;
        phone.position.x = 0.05 + Math.sin(t * 95) * 0.02 * buzz;
        phone.rotation.z = Math.sin(t * 71) * 0.03 * buzz;
        const cold = prog(t, kit.at('cold') - 0.1, d, ease.out);
        so.power = lerp(0.35, 0.04, cold);
        m.tea.color.copy(HOT).lerp(COLD, cold * 0.6);
        st.set(t);
        const push = prog(t, 0, 2.2, ease.out), dr = drift(t, 0.012);
        cam(dr.x, lerp(7.8, 6.9, push) + dr.y, lerp(5.5, 4.85, push), 0, 1.0, 0.6, 30);
      },
    },
    // Warm morning, low angle: the good mug, a sugar cube drops in on "sugar".
    b2: {
      build(g) {
        const r = room(g, 'sand', { keyPower: 60, fillPower: 0.75, keyX: 2.4, keyY: 5, keyZ: 3, angle: 0.5, wallZ: -2.2 });
        const table = O.table(g, { color: '#8a5a3a' });
        const m = mug(g, { color: '#f0e4d0' }); m.position.set(0, table.top, 0); m.rotation.y = -0.4;
        const st = steam(g, { x: 0, y: table.top + TEA_Y, z: 0, height: 1.1, power: 0.42, n: 20 });
        const cube = rbox(g, 0.07, 0.07, 0.07, 0.008, clay('#fbf7ef', { roughness: 0.8 }));
        const ring = kit.torus(g, 0.05, 0.006, clay('#b98a5a', { roughness: 0.2 }), 0, table.top + TEA_Y + 0.004, 0); ring.rotation.x = Math.PI / 2;
        const sun = spill(g, 2.6, 1.8, '#ffd29a', 0.5); sun.position.set(0.5, 1.7, r.wall.position.z + 0.05);
        const dust = motes(g, { box: [2.4, 2.4, 1.6], n: 26 });
        return { st, cube, ring, top: table.top, dust };
      },
      update({ st, cube, ring, top, dust }, t, k) {
        st.set(t + 3); dust.set(t);
        const land = kit.at('sugar') + 0.2;
        const fall = prog(t, land - 0.45, land, ease.in);
        cube.position.set(0.02, lerp(2.4, top + TEA_Y, fall), 0);
        cube.rotation.set(t * 2, t * 1.4, 0);
        cube.visible = fall < 1;
        const sp = prog(t, land, land + 0.7, ease.out);
        ring.scale.setScalar(1 + sp * 1.6); ring.visible = sp > 0 && sp < 1;
        // Slide in from the side so the first frames move.
        const slide = prog(t, 0, 1.2, ease.out), dr = drift(t, 0.015);
        cam(lerp(0.9, 0.3, slide) - k * 0.35 + dr.x, 2.1 + dr.y, lerp(2.3, 2.6, k), 0, 1.12, 0, 30);
      },
    },
    // Dark room: the phone upright, feed scrolling faster and faster, the only light. The tea sits in the dark.
    b3: {
      build(g) {
        const r = room(g, 'night', { keyPower: 5, fillPower: 0.65, wallZ: -2.6 });
        const table = O.table(g, { color: '#2a1e16' });
        const phone = O.phone(g, { power: 1.0 }); phone.position.set(0.15, table.top + 0.78, 0.1); phone.rotation.x = -0.1;
        const glowSpot = spill(g, 1.8, 1.2, '#8fb4ff', 0.4); glowSpot.rotation.x = -Math.PI / 2; glowSpot.position.set(0.15, table.top + 0.01, 0.45);
        const m = mug(g, { color: '#b9b0a4' }); m.position.set(-0.6, table.top, 0.35); m.rotation.y = 0.3;
        m.tea.color.set('#3f3026');
        return { phone, r };
      },
      update({ phone, r }, t, k, d) {
        const off = scrolled(t, 0.35, 0.5 + prog(t, kit.at('scroll'), d) * 1.4);
        phone.screen.paint((x, w, h) => feed(x, w, h, off));
        r.fill.intensity = 0.6 + 0.08 * Math.sin(t * 6);
        // Fast push in from frame 0.
        const push = prog(t, 0, 1.4, ease.out), dr = drift(t, 0.01);
        cam(dr.x + lerp(0.6, 0.05, push), 1.8 + dr.y, lerp(7.4, 6.2, push) - k * 0.3, 0, 1.45, 0, 30);
      },
    },
    // Close on the tea: the last steam goes, the light cools from amber to blue on "go".
    b4: {
      build(g) {
        const r = room(g, 'clay', { keyPower: 45, fillPower: 0.6, keyX: -2, keyY: 4, keyZ: 2.5, angle: 0.45, wallZ: -2 });
        const table = O.table(g, { color: '#6b4630' });
        const m = mug(g, { color: '#d8c8b2' }); m.position.set(0, table.top, 0); m.rotation.y = 0.9;
        const so = { x: 0, y: table.top + TEA_Y, z: 0, height: 0.8, power: 0.3, n: 12 };
        const st = steam(g, so);
        return { r, so, st, m };
      },
      update({ r, so, st, m }, t, k) {
        const go = prog(t, kit.at('go') - 0.6, kit.at('go') + 0.4, ease.inOut);
        so.power = lerp(0.3, 0.0, prog(t, 0, kit.at('go') + 0.2, ease.in));
        st.set(t);
        r.key.color.set('#ffc890').lerp(new THREE.Color('#8fa8c8'), go);
        r.key.intensity = lerp(45, 30, go);
        r.fill.intensity = lerp(0.6, 0.5, go);
        m.tea.color.copy(HOT).lerp(COLD, go);
        const dr = drift(t, 0.008);
        cam(dr.x, 2.35 + dr.y, lerp(2.2, 1.9, k), 0, 1.08, 0.12, 28);
      },
    },
    // The phone flips face down, its glow dies, the room warms and steam comes back on "warm".
    b5: {
      build(g) {
        const r = room(g, 'night', { keyPower: 10, fillPower: 0.5, keyX: 1.5, keyY: 5, keyZ: 3, angle: 0.5, wallZ: -2.4 });
        const table = O.table(g, { color: '#4a3324' });
        const m = mug(g); m.position.set(-0.36, table.top, -0.25); m.rotation.y = 0.5;
        const so = { x: -0.36, y: table.top + TEA_Y, z: -0.25, height: 0.9, power: 0, n: 16 };
        const st = steam(g, so);
        const hinge = new THREE.Group(); hinge.position.set(0.3, table.top + 0.005, 0.2); g.add(hinge);
        const phone = O.phone(g, { power: 1.0 }); g.remove(phone); hinge.add(phone);
        phone.rotation.x = -Math.PI / 2; phone.position.set(0, 0.04, 0);
        const glow = spill(g, 1.4, 1.8, '#8fb4ff', 0.35); glow.rotation.x = -Math.PI / 2; glow.position.set(0.3, table.top + 0.01, 0.2);
        return { r, so, st, hinge, phone, m, glow, top: table.top };
      },
      update({ r, so, st, hinge, phone, m, glow, top }, t, k) {
        const flipAt = kit.at('face');
        const flip = prog(t, flipAt - 0.4, flipAt + 0.1, ease.inOut);
        // Rotate around the phone's long axis so it lands screen down.
        hinge.rotation.z = flip * Math.PI;
        hinge.position.y = top + 0.005 + Math.sin(flip * Math.PI) * 0.3 + flip * 0.075;
        phone.screen.paint((x, w, h) => feed(x, w, h, 0.3 * t, 1 - flip));
        glow.set(1 - flip);
        const lit = prog(t, flipAt, kit.at('warm'), ease.inOut);
        r.key.intensity = lerp(10, 120, lit);
        r.key.color.set('#ffb877');
        r.fill.intensity = lerp(0.6, 0.9, lit);
        so.power = 0.36 * prog(t, kit.at('warm') - 0.9, kit.at('warm') + 0.2, ease.out);
        m.tea.color.copy(COLD).lerp(HOT, lit);
        st.set(t);
        const dr = drift(t, 0.015);
        cam(lerp(0.35, 0.15, k) + dr.x, 3.3 + dr.y, lerp(4.5, 4.2, k), 0.05, 0.9, 0.35, 30);
      },
    },
    // Quiet ending: the mug alone in a pool of warm light, steam curling, DRINK IT HOT on the wall.
    b6: {
      build(g) {
        const r = room(g, 'sand', { keyPower: 55, fillPower: 0.55, keyX: 0.3, keyY: 6, keyZ: 2, angle: 0.32, wallZ: -1.6 });
        const table = O.table(g, { color: '#7a4e33' });
        const m = mug(g, { color: '#efe2cd' }); m.position.set(0, table.top, 0.1); m.rotation.y = -0.4;
        const st = steam(g, { x: 0, y: table.top + TEA_Y, z: 0.1, height: 0.7, power: 0.36, n: 18 });
        const pool = spill(g, 1.6, 1.6, '#ffcf8f', 0.35); pool.rotation.x = -Math.PI / 2; pool.position.set(0, table.top + 0.01, 0.1);
        const words = sign(g, 'DRINK IT HOT', { w: 1.5, h: 0.3, color: '#5a3a25' });
        words.position.set(0, 2.25, r.wall.position.z + 0.04);
        const dust = motes(g, { box: [3, 2.6, 1.6], n: 24 });
        return { st, dust, words };
      },
      update({ st, dust, words }, t, k, d) {
        st.set(t + 5); dust.set(t);
        words.material.transparent = true;
        words.material.opacity = prog(t, kit.at('moments') - 0.3, kit.at('moments') + 0.5, ease.out);
        // Slow pull back for the quiet ending.
        const dr = drift(t, 0.02), back = prog(t, 0, d, ease.inOut);
        cam(dr.x, lerp(1.55, 1.9, back) + dr.y, lerp(2.8, 5.4, back), 0, lerp(1.0, 1.3, back), 0, 30);
      },
    },
  };
};
