// The one that matters. One scene per beat id.
// t: seconds into the beat, k: t/d, d: beat length. All motion is a pure function of t.
export default (kit) => {
  const { THREE, O, room, cam, drift, prog, ease, lerp, clay, glow, rbox, cyl, sphere, spill, motes, rng, sign } = kit;

  // An envelope: a thin body plus a triangular flap on a hinge along its top edge.
  // It stands upright facing the camera; lay it flat with e.rotation.x = -PI/2.
  const envelope = (g, s = 1, color = '#f1ece2', flapColor = '#ddd4c3') => {
    const e = new THREE.Group(); g.add(e);
    rbox(e, 0.9 * s, 0.6 * s, 0.03 * s, 0.01 * s, clay(color));
    const hinge = new THREE.Group(); hinge.position.set(0, 0.3 * s, 0.017 * s); e.add(hinge);
    const sh = new THREE.Shape();
    sh.moveTo(-0.45 * s, 0); sh.lineTo(0.45 * s, 0); sh.lineTo(0, -0.34 * s); sh.closePath();
    const flap = new THREE.Mesh(new THREE.ShapeGeometry(sh), clay(flapColor, { side: THREE.DoubleSide }));
    flap.castShadow = true; hinge.add(flap);
    return { e, hinge };
  };

  // The inbox screen. An endless list: off scrolls it (in rows), hi lights the one row that matters.
  const ROWS = 9, KEY = 4;
  const SUBJECTS = ['Weekly digest', 'Last chance: 40% off', 'Your order shipped', 'Reminder: renew', 'Re: how are you?', 'New login alert', 'Flash sale today', 'Newsletter #48', 'Your receipt'];
  const FROM = ['Updates', 'Store', 'Delivery', 'Account', 'Maya', 'Security', 'Shop', 'Weekly', 'Billing'];
  const inbox = (x, w, h, off, hi, badgeOn) => {
    x.fillStyle = '#e9e7e1'; x.fillRect(0, 0, w, h);
    const rh = h * 0.1, top = h * 0.13;
    const first = Math.floor(off) - 1;
    for (let i = first; i < first + 12; i++) {
      const y = top + (i - off) * rh;
      if (y < top - rh || y > h) continue;
      const j = ((i % ROWS) + ROWS) % ROWS;
      const key = j === KEY;
      if (key && hi > 0) { x.fillStyle = `rgba(255,190,60,${0.3 + 0.6 * hi})`; x.fillRect(0, y, w, rh); }
      x.beginPath(); x.arc(w * 0.09, y + rh * 0.5, rh * 0.2, 0, Math.PI * 2);
      x.fillStyle = key ? '#2f6bff' : '#cfccc4'; x.fill();
      x.textAlign = 'left'; x.textBaseline = 'middle';
      x.fillStyle = key ? '#141418' : '#8f8c85';
      x.font = `${key ? 800 : 500} ${w * 0.062}px Inter`; x.fillText(FROM[j], w * 0.18, y + rh * 0.33);
      x.fillStyle = key ? '#141418' : '#a3a09a';
      x.font = `${key ? 700 : 400} ${w * 0.056}px Inter`; x.fillText(SUBJECTS[j], w * 0.18, y + rh * 0.68);
      x.fillStyle = '#d6d3cc'; x.fillRect(0, y + rh - 2, w, 2);
    }
    x.fillStyle = '#f6f5f1'; x.fillRect(0, 0, w, top);
    x.fillStyle = '#141418'; x.textAlign = 'left'; x.textBaseline = 'middle';
    x.font = `800 ${w * 0.11}px Inter`; x.fillText('Inbox', w * 0.07, top * 0.55);
    x.beginPath(); x.arc(w * 0.8, top * 0.55, w * 0.085, 0, Math.PI * 2);
    x.fillStyle = badgeOn ? '#ff3b30' : '#b52a22'; x.fill();
    x.fillStyle = '#ffffff'; x.textAlign = 'center'; x.font = `800 ${w * 0.065}px Inter`;
    x.fillText('99+', w * 0.8, top * 0.56);
  };

  // A desk lamp from primitives, shade pointing down at the desk.
  const lamp = (g, x, y, z) => {
    const m = clay('#2b2b30', { roughness: 0.5 });
    cyl(g, 0.22, 0.25, 0.05, m, x, y + 0.025, z);
    cyl(g, 0.025, 0.025, 1.2, m, x, y + 0.6, z);
    const shade = cyl(g, 0.1, 0.3, 0.32, m, x + 0.28, y + 1.18, z);
    shade.rotation.z = 0.5;
    const bulb = sphere(g, 0.08, glow('#ffd18a', 2), x + 0.34, y + 1.08, z);
    return { shade, bulb };
  };

  return {
    // HOOK: a buzzing phone, a grey inbox, and one row that lights up amber on "scared".
    b1: {
      build(g) {
        room(g, 'ink', { keyPower: 40, fillPower: 1.0, angle: 0.4, keyX: -0.6, keyZ: 2.6 });
        const table = O.table(g, { color: '#2a2019' });
        const phone = O.phone(g, { power: 0.55 }); phone.rotation.x = -Math.PI / 2; phone.position.set(0, table.top + 0.04, 0.1);
        return { phone, y: table.top + 0.04 };
      },
      update({ phone, y }, t) {
        const scared = kit.at('scared');
        const hi = prog(t, scared - 0.2, scared + 0.3, ease.out);
        phone.screen.paint((x, w, h) => inbox(x, w, h, 0, Math.max(0.12, hi * (0.85 + 0.15 * Math.sin(t * 6))), Math.floor(t * 2.4) % 2 === 0));
        const buzz = Math.floor(t * 1.4) % 2 === 0 ? 1 - ((t * 1.4) % 1) : 0;
        phone.position.x = Math.sin(t * 95) * 0.02 * buzz;
        phone.rotation.z = Math.sin(t * 71) * 0.03 * buzz;
        const push = prog(t, 0, 2.6, ease.out), dr = drift(t, 0.01);
        const dist = lerp(8.6, 6.7, push);
        cam(dr.x, y + dist * 0.95 + dr.y, 0.1 + dist * 0.3, 0, y, 0.33, 30);
      },
    },

    // Envelopes rain onto the desk, then get swept off on "swipe". One amber one stays.
    b2: {
      build(g) {
        room(g, 'paper', { keyPower: 30, fillPower: 0.8, angle: 0.5, keyX: 1.2, keyZ: 3 });
        const table = O.table(g, { color: '#8a6a4c' });
        const R = rng(7), tints = ['#f1ece2', '#e4e0ee', '#dfe9e2', '#f3e6d8'];
        const items = [];
        for (let i = 0; i < 15; i++) {
          const env = envelope(g, 0.7, tints[i % 4]);
          env.e.rotation.x = -Math.PI / 2;
          items.push({ ...env, x: (R() - 0.5) * 1.5, z: (R() - 0.5) * 0.8, ry: (R() - 0.5) * 1.6, delay: i * 0.09, spin: (R() - 0.5) * 2, top: table.top + 0.02 + i * 0.022 });
        }
        const keep = envelope(g, 0.7, '#ffc94d', '#e8ae2c');
        keep.e.rotation.x = -Math.PI / 2;
        return { items, keep, top: table.top };
      },
      update({ items, keep, top }, t) {
        const sw = kit.at('swipe');
        const s = prog(t, sw - 0.1, sw + 0.5, ease.in);
        items.forEach((it, i) => {
          const a = prog(t, it.delay, it.delay + 0.4, ease.drop);
          it.e.visible = t >= it.delay;
          it.e.position.set(it.x + s * (3.4 + (i % 3) * 0.4), it.top + (1 - a) * 2.4, it.z);
          it.e.rotation.z = it.ry + (1 - a) * it.spin + s * 0.8;
        });
        // The amber one lands last, and stays when the rest are swept away.
        const ka = prog(t, 0.6, 1.0, ease.drop);
        keep.e.visible = t >= 0.6;
        keep.e.position.set(-0.1, top + 0.01 + (1 - ka) * 2.4, 0.15);
        keep.e.rotation.z = 0.12 + (1 - ka) * 0.8;
        const dr = drift(t, 0.012);
        cam(dr.x, top + 5.0 + dr.y, 2.0, 0, top, 0.45, 32);
      },
    },

    // Upright phone, list scrolling fast; the bold amber row slides past on "past".
    b3: {
      build(g) {
        const r = room(g, 'sand', { keyPower: 30, fillPower: 0.8, wallZ: -2.2 });
        const phone = O.phone(g, { power: 0.6 }); phone.position.set(0, 1.55, 0);
        const halo = spill(g, 2.6, 2.6, '#ffe1b0', 0.35); halo.position.set(0, 1.6, r.wall.position.z + 0.05);
        return { phone };
      },
      update({ phone }, t, k) {
        const past = kit.at('past');
        // Row KEY+ROWS crosses mid-screen (about 3.6 rows down) at "past".
        const off = KEY + ROWS - 3.6 + (t - past) * 3.2;
        phone.screen.paint((x, w, h) => inbox(x, w, h, off, 0.7, true));
        phone.rotation.y = Math.sin(t * 0.8) * 0.1 - 0.12;
        phone.rotation.x = -0.05;
        const dr = drift(t, 0.012);
        const dist = lerp(5.6, 5.0, k);
        cam(dr.x + 0.2, 1.35 + dr.y, dist, 0, 1.15, 0, 32);
      },
    },

    // One sealed amber envelope under a desk lamp in a dark room.
    b4: {
      build(g) {
        const r = room(g, 'night', { keyPower: 32, fillPower: 0.9, keyX: 0.2, keyY: 3.4, keyZ: 1.6, angle: 0.45, wallZ: -2.4 });
        const table = O.table(g, { color: '#3a281c' });
        const L = lamp(g, -1.0, table.top, -0.45);
        const env = envelope(g, 1, '#ffc94d', '#e8ae2c');
        env.e.rotation.x = -Math.PI / 2; env.e.rotation.z = 0.15;
        env.e.position.set(0.1, table.top + 0.02, 0.15);
        const pool = spill(g, 1.9, 1.4, '#ffcf8a', 0.18); pool.rotation.x = -Math.PI / 2; pool.position.set(0.05, table.top + 0.006, 0.1);
        const dust = motes(g, { box: [3, 2.4, 2], n: 26 });
        return { env, L, dust, top: table.top };
      },
      update({ env, L, dust, top }, t, k) {
        dust.set(t);
        const how = kit.at('how');
        // The flap twitches on "how", as if it almost opened.
        env.hinge.rotation.x = 0.35 * Math.sin(prog(t, how - 0.1, how + 0.6, ease.out) * Math.PI);
        L.bulb.material.emissiveIntensity = 1.4 + 0.2 * Math.sin(t * 3);
        const dr = drift(t, 0.015);
        const dist = lerp(4.4, 3.7, prog(t, 0, 1.4, ease.out) * 0.6 + k * 0.4);
        cam(dr.x + 0.6, top + dist * 0.8 + dr.y, 0.15 + dist * 0.6, 0.3, top - 0.1, 0.55, 30);
      },
    },

    // The envelope lands on a stack of books and presses it down as it gets "heavier"; the room dims.
    b5: {
      build(g) {
        const r = room(g, 'clay', { keyPower: 60, fillPower: 0.85, wallZ: -2.6 });
        const table = O.table(g, { color: '#5a3d2a' });
        const stack = new THREE.Group(); stack.position.set(0, table.top, 0); g.add(stack);
        [0, 1, 2, 3, 4, 5].forEach((i) => { const b = O.book(stack, { color: ['#3f5e6b', '#7c4a3a', '#55624a', '#7a6a3f', '#4b4566', '#6b3a4a'][i] }); b.position.set(0, i * 0.145, 0); b.rotation.y = (i % 2) * 0.14 - 0.07; });
        const env = envelope(g, 0.95, '#ffc94d', '#e8ae2c');
        env.e.rotation.x = -Math.PI / 2;
        return { stack, env, r, top: table.top };
      },
      update({ stack, env, r, top }, t, k, d) {
        const heavy = kit.at('heavier');
        const press = prog(t, kit.at('longer'), heavy + 0.5, ease.inOut);
        const squash = lerp(1, 0.5, press);
        stack.scale.set(1 + (1 - squash) * 0.3, squash, 1 + (1 - squash) * 0.3);
        const land = prog(t, 0, 0.45, ease.drop);
        env.e.position.set(0, top + 6 * 0.145 * squash + 0.02 + (1 - land) * 1.4, 0);
        env.e.scale.setScalar(lerp(1, 1.3, press));
        r.key.intensity = lerp(60, 28, prog(t, heavy, d, ease.out));
        const dr = drift(t, 0.012);
        const dist = lerp(5.6, 5.0, k);
        cam(dr.x + 0.3, top + 1.6 + dr.y, dist, 0, top + 0.2, 0, 30);
      },
    },

    // Daylight. The flap lifts on "open", a letter slides out, the envelope shrinks on "smaller".
    b6: {
      build(g) {
        const r = room(g, 'sand', { keyPower: 28, fillPower: 0.9, angle: 0.55, keyX: 1.6, keyZ: 3.2, wallZ: -2.2 });
        const env = envelope(g, 1.1, '#ffc94d', '#e8ae2c');
        env.e.position.set(0, 1.5, 0);
        const letter = new THREE.Group(); env.e.add(letter);
        rbox(letter, 0.82, 0.62, 0.01, 0.005, clay('#fbf8f2'), 0, 0, -0.03);
        const words = sign(letter, 'how are you?', { w: 0.74, h: 0.2, size: 0.45, color: '#2b2b30', weight: 700 });
        words.position.set(0, 0.16, -0.022);
        const sun = spill(g, 3, 3, '#fff1cf', 0.4); sun.position.set(0.5, 1.9, r.wall.position.z + 0.05);
        return { env, letter, r };
      },
      update({ env, letter, r }, t, k) {
        const op = kit.at('open'), sm = kit.at('smaller');
        env.hinge.rotation.x = -Math.PI * 0.55 * prog(t, op, op + 0.5, ease.out);
        // The letter rises out of the open envelope and sits in front of it.
        const rise = prog(t, op + 0.35, op + 0.95, ease.out);
        letter.position.set(0, 0.5 * rise, 0);
        const shrink = prog(t, sm, sm + 0.7, ease.inOut);
        env.e.scale.setScalar(lerp(1, 0.55, shrink));
        env.e.position.y = 1.5 + 0.2 * shrink;
        env.e.rotation.z = Math.sin(t * 1.3) * 0.03;
        r.key.intensity = lerp(28, 36, k);
        const dr = drift(t, 0.012);
        cam(dr.x, 1.7 + dr.y, lerp(5.0, 4.6, k), 0, 1.5, 0, 32);
      },
    },

    // Low on the floor by a closed door, light under it. An envelope slides across and under on "waiting".
    b7: {
      build(g) {
        const r = room(g, 'night', { keyPower: 70, fillPower: 1.8, wallZ: -2.4 });
        const door = O.door(g, { gap: 0.07 }); door.position.set(0, 0, r.wall.position.z + 0.02);
        const under = spill(g, 2.2, 0.8, '#ffc56e', 0.8); under.rotation.x = -Math.PI / 2; under.position.set(0, 0.01, r.wall.position.z + 0.45);
        const env = envelope(g, 0.75, '#ffc94d', '#e8ae2c');
        env.e.rotation.x = -Math.PI / 2;
        return { env, wz: r.wall.position.z, under };
      },
      update({ env, wz, under }, t, k, d) {
        const w = kit.at('waiting');
        const slide = prog(t, 0, w + 0.5, ease.inOut);
        env.e.position.set(lerp(0.12, 0, slide), 0.015, lerp(-1.15, wz - 0.3, slide));
        env.e.rotation.z = lerp(0.35, 0, slide);
        env.e.visible = slide < 0.99;
        under.set(0.6 + 0.4 * prog(t, w + 0.4, d, ease.out));
        const dr = drift(t, 0.012);
        cam(dr.x, 2.2 + dr.y, lerp(2.8, 2.5, k), 0, 0, -1.0, 32);
      },
    },
  };
};
