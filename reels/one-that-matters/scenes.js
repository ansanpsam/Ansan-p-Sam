// The one that matters. One scene per beat id.
// t: seconds into the beat, k: t/d, d: beat length. All motion is a pure function of t.
// NOTE: written without a render pass (the toolkit could not be run in this session),
// so framing still needs the --stills beats check described in viral-animate.
export default (kit) => {
  const { THREE, O, room, cam, drift, prog, ease, lerp, clamp, clay, glow, metal, rbox, cyl, sphere, spill, motes, rng } = kit;

  // An envelope: a thin body plus a triangular flap on a hinge along its top edge.
  // It stands upright facing the camera; lay it flat with group.rotation.x = -PI/2.
  const envelope = (g, s = 1, color = '#f1ece2') => {
    const e = new THREE.Group(); g.add(e);
    rbox(e, 0.9 * s, 0.6 * s, 0.03 * s, 0.01 * s, clay(color));
    const hinge = new THREE.Group(); hinge.position.set(0, 0.3 * s, 0.017 * s); e.add(hinge);
    const sh = new THREE.Shape();
    sh.moveTo(-0.45 * s, 0); sh.lineTo(0.45 * s, 0); sh.lineTo(0, -0.34 * s); sh.closePath();
    const flap = new THREE.Mesh(new THREE.ShapeGeometry(sh), clay('#e2dacb', { side: THREE.DoubleSide }));
    flap.castShadow = true; hinge.add(flap);
    return { e, hinge };
  };

  // The inbox screen. off scrolls the list (in rows), hi lights the one row that matters.
  const ROWS = 16, KEY = 5;
  const inbox = (x, w, h, off, hi, badgeOn) => {
    x.fillStyle = '#f3f2ee'; x.fillRect(0, 0, w, h);
    const rh = h * 0.085, top = h * 0.13;
    for (let i = 0; i < ROWS + 8; i++) {
      const y = top + (i - off) * rh;
      if (y < top - rh || y > h) continue;
      const key = i % ROWS === KEY;
      if (key && hi > 0) { x.fillStyle = `rgba(255,201,77,${0.25 + 0.6 * hi})`; x.fillRect(0, y, w, rh); }
      x.fillStyle = key ? '#1b1b1f' : '#c9c7c0';
      x.fillRect(w * 0.16, y + rh * 0.24, w * (key ? 0.5 : 0.36 + ((i * 37) % 20) / 100), rh * (key ? 0.2 : 0.14));
      x.fillStyle = key ? '#3a3a40' : '#dedcd5';
      x.fillRect(w * 0.16, y + rh * 0.56, w * 0.66, rh * 0.12);
      x.beginPath(); x.arc(w * 0.08, y + rh * 0.45, rh * 0.2, 0, Math.PI * 2);
      x.fillStyle = key ? '#2f6bff' : '#e4e2db'; x.fill();
      x.fillStyle = '#e6e4de'; x.fillRect(0, y + rh - 2, w, 2);
    }
    // Header and the red badge.
    x.fillStyle = '#fbfaf7'; x.fillRect(0, 0, w, top);
    x.fillStyle = '#1b1b1f'; x.textAlign = 'left'; x.textBaseline = 'middle';
    x.font = `800 ${w * 0.11}px Inter`; x.fillText('Inbox', w * 0.07, top * 0.55);
    x.beginPath(); x.arc(w * 0.8, top * 0.55, w * 0.075, 0, Math.PI * 2);
    x.fillStyle = badgeOn ? '#ff3b30' : '#b52a22'; x.fill();
    x.fillStyle = '#ffffff'; x.textAlign = 'center'; x.font = `800 ${w * 0.06}px Inter`;
    x.fillText('99+', w * 0.8, top * 0.56);
  };

  // A desk lamp from primitives, standing at (x, y, z), shade pointing down at the desk.
  const lamp = (g, x, y, z) => {
    const m = clay('#26262a', { roughness: 0.5 });
    cyl(g, 0.22, 0.25, 0.05, m, x, y + 0.025, z);
    const arm = cyl(g, 0.025, 0.025, 1.2, m, x, y + 0.6, z);
    void arm;
    const shade = cyl(g, 0.1, 0.32, 0.34, m, x + 0.3, y + 1.15, z + 0.05);
    shade.rotation.z = 0.55;
    const bulb = sphere(g, 0.085, glow('#ffd18a', 3), x + 0.36, y + 1.05, z + 0.05);
    return { shade, bulb };
  };

  return {
    // HOOK: one bold row glows in a grey inbox. The phone buzzes from frame 0.
    b1: {
      build(g) {
        room(g, 'ink', { keyPower: 42, fillPower: 0.6, angle: 0.36, keyX: -0.6, keyZ: 2.6 });
        const table = O.table(g, { color: '#2a2019' });
        const phone = O.phone(g, { power: 1.05 }); phone.rotation.x = -Math.PI / 2 + 0.02; phone.position.set(0, table.top + 0.04, 0.1);
        return { phone };
      },
      update({ phone }, t) {
        const scared = kit.at('scared');
        const hi = prog(t, scared - 0.15, scared + 0.35, ease.out) * (0.85 + 0.15 * Math.sin(t * 6));
        phone.screen.paint((x, w, h) => inbox(x, w, h, 0, Math.max(0.15, hi), Math.floor(t * 2.4) % 2 === 0));
        const buzz = Math.floor(t * 1.4) % 2 === 0 ? 1 - ((t * 1.4) % 1) : 0;
        phone.position.x = Math.sin(t * 95) * 0.02 * buzz;
        phone.rotation.z = Math.sin(t * 71) * 0.03 * buzz;
        const push = prog(t, 0, 2.4, ease.out), dr = drift(t, 0.012);
        // Target sits a little in front of the phone so the phone rides above frame centre, clear of the caption.
        cam(dr.x, lerp(5.2, 3.4, push) + dr.y, lerp(2.2, 1.35, push), 0, 1.02, 0.32, 30);
      },
    },

    // Envelopes rain onto the desk, then get swept off on "swipe".
    b2: {
      build(g) {
        room(g, 'paper', { keyPower: 34, fillPower: 0.7, angle: 0.5, keyX: 1.2, keyZ: 3 });
        const table = O.table(g, { color: '#9c7b5c' });
        const R = rng(7), tints = ['#f1ece2', '#e9e3f0', '#e3ece6', '#f3e6d8'];
        const items = [];
        for (let i = 0; i < 16; i++) {
          const env = envelope(g, 0.75, tints[i % 4]);
          env.e.rotation.x = -Math.PI / 2;
          items.push({ ...env, x: (R() - 0.5) * 1.8, z: (R() - 0.5) * 0.9, ry: (R() - 0.5) * 1.6, delay: i * 0.11, spin: (R() - 0.5) * 2, top: table.top + 0.02 + i * 0.024 });
        }
        return { items };
      },
      update({ items }, t, k) {
        const sw = kit.at('swipe');
        const s = prog(t, sw, sw + 0.55, ease.in);
        items.forEach((it, i) => {
          const a = prog(t, it.delay, it.delay + 0.42, ease.drop);
          it.e.visible = t >= it.delay;
          it.e.position.set(it.x + s * (3.6 + (i % 3) * 0.4), it.top + (1 - a) * 2.6 - s * s * 0.6, it.z);
          it.e.rotation.z = it.ry + (1 - a) * it.spin + s * 0.8;
        });
        const dr = drift(t, 0.015);
        cam(dr.x + lerp(-0.3, 0.2, k), 3.9 + dr.y, 3.2 - k * 0.3, 0, 1.0, 0.45, 32);
      },
    },

    // Upright phone, list scrolling fast; the bold row slides past.
    b3: {
      build(g) {
        const r = room(g, 'sand', { keyPower: 30, fillPower: 0.75, wallZ: -2.2 });
        const phone = O.phone(g, { power: 1.0 }); phone.position.set(0, 1.55, 0);
        const halo = spill(g, 2.4, 2.4, '#ffe1b0', 0.35); halo.position.set(0, 1.6, r.wall.position.z + 0.05);
        return { phone };
      },
      update({ phone }, t, k, d) {
        // Scroll so the key row (index 5) crosses the middle of the screen around "past".
        const past = kit.at('past');
        const off = lerp(-2, 14, prog(t, 0, d, (x) => x)) + (past - d * 0.5) * -1.2;
        phone.screen.paint((x, w, h) => inbox(x, w, h, off, 0, true));
        phone.rotation.y = Math.sin(t * 0.8) * 0.12 - 0.1;
        phone.rotation.x = -0.06;
        const dr = drift(t, 0.012);
        cam(dr.x + 0.15, 1.55 + dr.y, lerp(3.3, 2.9, k), 0, 1.38, 0, 32);
      },
    },

    // One sealed envelope under a desk lamp. Low angle, dark room.
    b4: {
      build(g) {
        const r = room(g, 'night', { keyPower: 120, fillPower: 0.9, keyX: 0.4, keyY: 3.2, keyZ: 1.2, angle: 0.4, wallZ: -2.4 });
        const table = O.table(g, { color: '#3a281c' });
        const L = lamp(g, -0.95, table.top, -0.35);
        const env = envelope(g, 1);
        env.e.rotation.x = -Math.PI / 2 + 0.0; env.e.rotation.z = 0.18;
        env.e.position.set(0.15, table.top + 0.02, 0.15);
        const pool = spill(g, 1.8, 1.3, '#ffcf8a', 0.55); pool.rotation.x = -Math.PI / 2; pool.position.set(0.1, table.top + 0.005, 0.1);
        const dust = motes(g, { box: [3, 2.4, 2], n: 26 });
        return { env, L, dust, r };
      },
      update({ env, L, dust }, t, k) {
        dust.set(t);
        const how = kit.at('how');
        // The flap twitches on "how", as if it almost opened.
        env.hinge.rotation.x = -0.25 * Math.sin(prog(t, how, how + 0.6, ease.out) * Math.PI);
        L.bulb.material.emissiveIntensity = 2.6 + 0.3 * Math.sin(t * 3);
        const dr = drift(t, 0.015);
        cam(dr.x + lerp(0.9, 0.5, k), 1.55 + dr.y, lerp(3.1, 2.6, k), 0.1, 0.95, 0.1, 30);
      },
    },

    // The envelope presses a stack of books down as it gets "heavier"; the room dims.
    b5: {
      build(g) {
        const r = room(g, 'clay', { keyPower: 70, fillPower: 0.8, wallZ: -2.6 });
        const table = O.table(g, { color: '#5a3d2a' });
        const stack = new THREE.Group(); stack.position.set(0, table.top, 0); g.add(stack);
        const books = [0, 1, 2, 3, 4].map((i) => { const b = O.book(stack, { color: ['#3f5e6b', '#7c4a3a', '#55624a', '#7a6a3f', '#4b4566'][i] }); b.position.set(0, i * 0.145, 0); b.rotation.y = (i % 2) * 0.12 - 0.06; return b; });
        const env = envelope(g, 0.95);
        env.e.rotation.x = -Math.PI / 2;
        return { stack, books, env, r, table };
      },
      update({ stack, env, r, table }, t, k, d) {
        const heavy = kit.at('heavier');
        const press = prog(t, kit.at('longer'), heavy + 0.4, ease.inOut);
        const squash = lerp(1, 0.55, press);
        stack.scale.set(1 + (1 - squash) * 0.25, squash, 1 + (1 - squash) * 0.25);
        // Landing: the envelope drops onto the stack in the first half second.
        const land = prog(t, 0, 0.45, ease.drop);
        env.e.position.set(0, table.top + 5 * 0.145 * squash + 0.02 + (1 - land) * 1.6, 0);
        env.e.scale.setScalar(lerp(1, 1.25, press));
        r.key.intensity = lerp(70, 30, prog(t, heavy, d, ease.out));
        const dr = drift(t, 0.012);
        cam(dr.x, 1.75 + dr.y, lerp(3.6, 3.0, k), 0, 1.12, 0, 30);
      },
    },

    // Daylight. The flap lifts on "open", a letter slides out, the envelope shrinks on "smaller".
    b6: {
      build(g) {
        const r = room(g, 'paper', { keyPower: 26, fillPower: 0.9, angle: 0.55, keyX: 1.6, keyZ: 3.2, wallZ: -2.2 });
        const env = envelope(g, 1.15);
        env.e.position.set(0, 1.55, 0);
        const letter = rbox(env.e, 0.8, 0.62, 0.01, 0.005, clay('#ffffff'), 0, 0, -0.02);
        const sun = spill(g, 3, 3, '#fff1cf', 0.45); sun.position.set(0.5, 1.8, r.wall.position.z + 0.05);
        return { env, letter, r };
      },
      update({ env, letter, r }, t, k, d) {
        const op = kit.at('open'), sm = kit.at('smaller');
        env.hinge.rotation.x = -Math.PI * 0.95 * prog(t, op, op + 0.5, ease.out);
        letter.position.y = 0.55 * prog(t, op + 0.35, op + 0.9, ease.out);
        const shrink = prog(t, sm, sm + 0.7, ease.inOut);
        env.e.scale.setScalar(lerp(1, 0.35, shrink));
        env.e.rotation.z = Math.sin(t * 1.3) * 0.03;
        r.key.intensity = lerp(26, 34, k);
        const dr = drift(t, 0.012);
        cam(dr.x, 1.55 + dr.y, lerp(3.4, 3.1, k), 0, 1.32, 0, 32);
      },
    },

    // A closed door with warm light under it. An envelope slides across the floor and under on "waiting".
    b7: {
      build(g) {
        const r = room(g, 'night', { keyPower: 60, fillPower: 1.0, wallZ: -2.4 });
        const door = O.door(g, { gap: 0.06 }); door.position.set(0, 0, r.wall.position.z + 0.02);
        const under = spill(g, 1.9, 0.5, '#ffc56e', 0.8); under.rotation.x = -Math.PI / 2; under.position.set(0, 0.01, r.wall.position.z + 0.3);
        const env = envelope(g, 0.7);
        env.e.rotation.x = -Math.PI / 2;
        return { env, wz: r.wall.position.z, under };
      },
      update({ env, wz, under }, t, k, d) {
        const w = kit.at('waiting');
        const slide = prog(t, 0, w + 0.4, ease.inOut);
        env.e.position.set(lerp(0.6, 0, slide), 0.015, lerp(1.6, wz - 0.1, slide));
        env.e.rotation.z = lerp(0.6, 0, slide);
        env.e.visible = slide < 0.995;
        under.set(0.7 + 0.3 * prog(t, w + 0.3, d, ease.out));
        const dr = drift(t, 0.015);
        cam(dr.x, 1.7 + dr.y, lerp(4.6, 4.0, k), 0, 1.05, wz + 0.2, 32);
      },
    },
  };
};
