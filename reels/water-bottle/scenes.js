// The bottle that comes home full. One scene per beat.
// build(g) makes objects once; update(refs, t, k, d) poses them for time t.
export default (kit) => {
  const { O, room, cam, drift, prog, ease, lerp, clay, glass, cyl, rbox, box, panel, spill, motes, THREE } = kit;

  // The story's object: a clear bottle you can see the water in, with a blue cap.
  // Base at y = 0. BODY tall. bottle.level(k) sets water from empty (0) to full (1).
  const BODY = 0.62, R = 0.12;
  const bottle = (g, o = {}) => {
    const b = new THREE.Group(); g.add(b);
    const prof = [[0, 0.004], [R - 0.012, 0], [R, 0.014], [R, BODY - 0.1], [R - 0.03, BODY - 0.04], [0.06, BODY - 0.02], [0.06, BODY]]
      .map(([a, c]) => new THREE.Vector2(a, c));
    const shell = new THREE.Mesh(new THREE.LatheGeometry(prof, 48), glass('#e8f6ff', { opacity: 0.3, side: THREE.DoubleSide, roughness: 0.05 }));
    b.add(shell);
    // Water: a cylinder scaled from its base, so its top is the level.
    const wmat = clay('#2f9fe0', { roughness: 0.1, transparent: true, opacity: 0.82, emissive: new THREE.Color('#0d4f7a'), emissiveIntensity: 0.35 });
    const wg = new THREE.CylinderGeometry(R - 0.008, R - 0.008, 1, 40); wg.translate(0, 0.5, 0);
    const water = new THREE.Mesh(wg, wmat); water.position.y = 0.012; b.add(water);
    const FULL = BODY - 0.13;
    b.level = (k) => { water.scale.y = Math.max(0.002, FULL * k); water.visible = k > 0.002; };
    // Cap in its own group so it can turn and lift.
    const cap = new THREE.Group(); cap.position.y = BODY; b.add(cap);
    const cm = clay(o.cap ?? '#1f7fd6', { roughness: 0.4 });
    const c1 = cyl(cap, 0.072, 0.072, 0.09, cm, 0, 0.045, 0, 32); c1.castShadow = true;
    const ridge = clay('#165fa3');
    for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; box(cap, 0.012, 0.08, 0.012, ridge, Math.cos(a) * 0.074, 0.045, Math.sin(a) * 0.074); }
    const loop = kit.torus(cap, 0.04, 0.011, cm, 0, 0.105, 0); loop.rotation.y = Math.PI / 2;
    // A white band label around the middle, so it reads as a bottle at a glance.
    const band = cyl(b, R + 0.003, R + 0.003, 0.06, clay('#f4f1ea', { roughness: 0.6 }), 0, 0.075, 0, 48); band.castShadow = false;
    b.cap = cap; b.level(o.level ?? 1);
    return b;
  };

  // Laptop: base slab and a lit screen panel. Returns { screen } for painting.
  const laptop = (g, top) => {
    const l = new THREE.Group(); g.add(l);
    rbox(l, 1.1, 0.04, 0.72, 0.02, clay('#9ea3ab', { roughness: 0.35, metalness: 0.4 }), 0, top + 0.02, 0);
    const hinge = new THREE.Group(); hinge.position.set(0, top + 0.04, -0.34); hinge.rotation.x = -0.22; l.add(hinge);
    rbox(hinge, 1.1, 0.7, 0.03, 0.02, clay('#8a8f97', { roughness: 0.35, metalness: 0.4 }), 0, 0.35, -0.016);
    const scr = panel(hinge, 1.02, 0.62, () => {}, { px: 512, power: 1.0 }); scr.position.set(0, 0.35, 0.002);
    l.screen = scr;
    return l;
  };
  // Chat messages that keep arriving: n bubbles visible, alternating sides.
  const chat = (x, w, h, n) => {
    x.fillStyle = '#10141c'; x.fillRect(0, 0, w, h);
    x.fillStyle = '#1c2533'; x.fillRect(0, 0, w, h * 0.1);
    const cols = ['#3d7be0', '#2b3445', '#e0a13d', '#2b3445', '#4fb57f', '#2b3445', '#d9628f'];
    const shown = Math.floor(n), part = n - shown;
    for (let i = 0; i < shown + 1; i++) {
      const slot = shown - i; const y = h * 0.86 - slot * h * 0.15 - (i === shown ? 0 : 0) + (1 - part) * 0;
      if (y < h * 0.12) continue;
      const left = i % 2 === 0, bw = w * (0.38 + ((i * 37) % 23) / 100);
      x.globalAlpha = i === shown ? part : 1;
      x.fillStyle = cols[i % cols.length];
      x.beginPath(); x.roundRect(left ? w * 0.05 : w * 0.95 - bw, y, bw, h * 0.1, h * 0.04); x.fill();
    }
    x.globalAlpha = 1;
  };

  // Frame the bottle: it stands at (x, top, z). Camera sits dist away at yaw (radians) and elev above
  // the aim point. Aiming below the bottle's middle puts it in the upper-middle of the frame,
  // clear of the caption pill at y 1240.
  const frame = (x, top, z, dist, elev, yaw, dr, fov = 32) => {
    const ty = top + 0.17;
    cam(x + Math.sin(yaw) * dist + dr.x, ty + elev + dr.y, z + Math.cos(yaw) * dist, x, ty, z, fov);
  };

  return {
    // Hook: morning counter, water pouring into the bottle, cap drops on "bottle".
    b1: {
      build(g) {
        const r = room(g, 'sand', { keyPower: 55, fillPower: 0.9, keyX: 2.2, keyY: 4.5, keyZ: 3, angle: 0.5, wallZ: -2 });
        const table = O.table(g, { color: '#c9b49a' });
        const bt = bottle(g, { level: 0.35 }); bt.position.set(0, table.top, 0.1);
        const smat = clay('#58b8ee', { roughness: 0.1, transparent: true, opacity: 0.75 });
        const stream = cyl(g, 0.018, 0.018, 1, smat, 0, 0, 0.1, 16);
        // A tap above, out of the label's way.
        const tap = new THREE.Group(); g.add(tap);
        const steel = kit.metal('#c9cdd2');
        cyl(tap, 0.035, 0.035, 0.5, steel, 0, 0, 0); tap.rotation.z = Math.PI / 2; tap.position.set(0.22, table.top + 1.02, 0.1);
        const spout = cyl(g, 0.035, 0.03, 0.12, steel, 0, table.top + 0.97, 0.1);
        const sun = spill(g, 2.4, 1.8, '#ffe0b0', 0.55); sun.position.set(0.6, 1.9, r.wall.position.z + 0.05);
        const dust = motes(g, { box: [2.2, 2.2, 1.4], n: 22 });
        return { bt, stream, top: table.top, dust, spout };
      },
      update({ bt, stream, top, dust }, t, k, d) {
        dust.set(t);
        const shut = kit.at('bottle');
        const fill = prog(t, 0, shut, ease.out);
        bt.level(lerp(0.35, 1, fill));
        // The stream runs from the spout down to the water surface, then stops.
        const on = t < shut - 0.05;
        const wTop = top + 0.012 + (BODY - 0.13) * lerp(0.35, 1, fill);
        const sTop = top + 0.92;
        stream.visible = on;
        stream.scale.y = Math.max(0.01, sTop - wTop); stream.position.y = (sTop + wTop) / 2;
        stream.scale.x = stream.scale.z = 1 + Math.sin(t * 40) * 0.08;
        // Cap drops on at "bottle".
        const drop = prog(t, shut - 0.05, shut + 0.3, ease.drop);
        bt.cap.position.y = BODY + (1 - drop) * 0.5;
        bt.cap.visible = t > shut - 0.1;
        bt.cap.rotation.y = drop * 2.4;
        // Fast push-in and swing from frame 0, so the opening moves; then a slow settle.
        const rush = prog(t, 0, 1.5, ease.out), push = prog(t, 0, d, ease.inOut), dr = drift(t, 0.01);
        frame(0, top + 0.07, 0.1, lerp(5.6, 3.55, rush) - 0.15 * push, lerp(1.1, 0.5, rush), lerp(0.55, 0, rush), dr);
      },
    },
    // Office desk: bottle lands beside a laptop as messages pile up.
    b2: {
      build(g) {
        const r = room(g, 'paper', { keyPower: 60, fillPower: 0.9, keyX: -2, keyY: 5, keyZ: 3, angle: 0.55, wallZ: -2.4 });
        const table = O.table(g, { color: '#6b5444' });
        const lap = laptop(g, table.top); lap.position.set(-0.3, 0, -0.45); lap.rotation.y = 0.25;
        const bt = bottle(g); bt.position.set(0.35, table.top, 0.25);
        const glowS = spill(g, 1.6, 1.0, '#9cc4ff', 0.25); glowS.position.set(-0.2, table.top + 0.5, r.wall.position.z + 0.05);
        return { lap, bt, top: table.top };
      },
      update({ lap, bt, top }, t, k, d) {
        const land = kit.at('bag');
        const a = prog(t, 0, land, ease.drop);
        bt.position.y = top + (1 - a) * 1.6;
        bt.rotation.z = (1 - a) * 0.4;
        const n = 1 + t * 2.2;
        lap.screen.paint((x, w, h) => chat(x, w, h, n));
        const dr = drift(t, 0.012);
        frame(0.35, top, 0.25, lerp(3.6, 3.3, k), 0.75, lerp(0.35, 0.2, k), dr);
      },
    },
    // Close on the cap. It turns a little, stops. The wall clock spins through the afternoon.
    b3: {
      build(g) {
        const r = room(g, 'clay', { keyPower: 50, fillPower: 0.85, keyX: 1.5, keyY: 4, keyZ: 2.5, angle: 0.5, wallZ: -1.6 });
        const table = O.table(g, { color: '#5a4436' });
        const bt = bottle(g); bt.position.set(0.05, table.top, 0.2);
        const clock = O.clock(g, { r: 0.3 }); clock.position.set(-0.55, table.top + 0.86, r.wall.position.z + 0.07);
        return { bt, clock, top: table.top };
      },
      update({ bt, clock, top }, t, k, d) {
        // A half turn that gives up.
        const tw = prog(t, 0.05, 0.5, ease.out) - prog(t, 0.7, 1.0, ease.inOut);
        bt.cap.rotation.y = tw * 0.9;
        bt.cap.position.y = BODY + tw * 0.01;
        clock.set(12 + prog(t, 0.3, d, ease.inOut) * 6);
        const dr = drift(t, 0.01);
        frame(0.05, top + 0.12, 0.2, lerp(2.9, 3.3, k), 0.3, lerp(0.2, 0.05, k), dr);
      },
    },
    // Evening: the plant greens up, the full bottle stands beside it.
    b4: {
      build(g) {
        const r = room(g, 'clay', { keyPower: 70, fillPower: 0.7, keyX: -2.5, keyY: 3, keyZ: 2.5, angle: 0.55, wallZ: -2, wallColor: '#b07a55' });
        const table = O.table(g, { color: '#4a3528' });
        const pl = O.plant(g, { k: 0.3, color: '#5f9a45' }); pl.scale.setScalar(0.42); pl.position.set(-0.3, table.top, 0);
        const bt = bottle(g); bt.position.set(0.25, table.top, 0.15);
        const cup = new THREE.Group(); g.add(cup);
        cyl(cup, 0.1, 0.085, 0.24, glass('#e8f6ff', { opacity: 0.25 }), 0, 0.12, 0, 24);
        cyl(cup, 0.09, 0.078, 0.13, clay('#2f9fe0', { roughness: 0.15 }), 0, 0.075, 0, 24);
        const smat = clay('#58b8ee', { roughness: 0.1, transparent: true, opacity: 0.75 });
        const stream = cyl(g, 0.012, 0.012, 1, smat, -0.38, 0, 0.0, 12);
        const sun = spill(g, 2.2, 1.4, '#ffb070', 0.55); sun.position.set(-0.5, 1.7, r.wall.position.z + 0.05);
        return { pl, bt, cup, stream, top: table.top, r };
      },
      update({ pl, bt, cup, stream, top, r }, t, k, d) {
        // A cup tips over the plant on "വെള്ളം", then the plant grows.
        const pour = kit.at('വെള്ളം');
        const tip = prog(t, 0, pour, ease.inOut) - prog(t, pour + 0.6, pour + 1.0, ease.inOut);
        cup.rotation.z = tip * 1.7;
        cup.position.set(-0.2 + tip * 0.02, top + 0.62, 0.0);
        cup.visible = t < pour + 1.1;
        const flowing = prog(t, pour - 0.15, pour + 0.1) * (1 - prog(t, pour + 0.5, pour + 0.7));
        stream.visible = flowing > 0.01;
        stream.position.set(-0.3, top + 0.42, 0.0); stream.scale.y = 0.36 * flowing;
        pl.grow(lerp(0.3, 1, prog(t, pour, pour + 1.4, ease.out)));
        // Thirst: the light dims slightly on "ദാഹിച്ച്".
        const dim = prog(t, kit.at('ദാഹിച്ച്'), d, ease.out);
        r.key.intensity = lerp(70, 48, dim);
        const dr = drift(t, 0.012);
        frame(-0.02, top + 0.06, 0.1, lerp(3.9, 3.5, k), 0.5, lerp(-0.2, 0.1, k), dr);
      },
    },
    // The cap unscrews and lifts off, the water drops a little, warm light comes up.
    b5: {
      build(g) {
        const r = room(g, 'sand', { keyPower: 40, fillPower: 0.7, keyX: 1.8, keyY: 4.5, keyZ: 3, angle: 0.5, wallZ: -2 });
        const table = O.table(g, { color: '#b08a66' });
        const bt = bottle(g); bt.position.set(0, table.top, 0.1);
        const sun = spill(g, 2.6, 1.8, '#ffd29a', 0.3); sun.position.set(0.3, 1.8, r.wall.position.z + 0.05);
        return { bt, top: table.top, r, sun };
      },
      update({ bt, top, r, sun }, t, k, d) {
        const sip = kit.at('sip');
        const turn = prog(t, 0, sip, ease.inOut);
        const lift = prog(t, sip - 0.2, sip + 0.35, ease.back);
        bt.cap.rotation.y = turn * 6;
        bt.cap.position.set(lift * 0.22, BODY + turn * 0.03 + lift * 0.18, 0);
        bt.cap.rotation.z = -lift * 0.5;
        bt.level(lerp(1, 0.82, prog(t, sip + 0.2, sip + 1.0, ease.out)));
        const warm = prog(t, sip, d, ease.out);
        r.key.intensity = lerp(40, 75, warm); sun.set(lerp(0.3, 0.75, warm));
        const dr = drift(t, 0.01);
        frame(0, top + 0.05, 0.1, lerp(3.3, 3.6, k), 0.45, lerp(-0.1, 0.1, k), dr);
      },
    },
    // Home at night: the bottle, now lighter, in a pool of lamp light. The send line.
    b6: {
      build(g) {
        const r = room(g, 'night', { keyPower: 30, fillPower: 1.2, keyX: 1.2, keyY: 3.5, keyZ: 2.2, angle: 0.5, wallZ: -2 });
        const table = O.table(g, { color: '#5a3e2c' });
        const bt = bottle(g, { level: 0.5 }); bt.position.set(0, table.top, 0.1);
        bt.cap.position.set(0.3, -BODY + 0.0, 0.05); // cap lying on the table beside it
        bt.cap.rotation.z = Math.PI / 2; bt.cap.position.y = 0.075;
        const pool = spill(g, 1.6, 1.6, '#ffc890', 0.6); pool.rotation.x = -Math.PI / 2; pool.position.set(0, table.top + 0.005, 0.1);
        const lamp = O.pendant(g, 3.4, { power: 7, color: '#ffc27a' }); lamp.position.set(-0.6, 0, -0.8);
        const dust = motes(g, { box: [2, 2, 1.4], n: 16 });
        return { bt, top: table.top, dust, lamp };
      },
      update({ bt, top, dust, lamp }, t, k, d) {
        dust.set(t);
        lamp.bulb.set(0.8 + 0.2 * prog(t, 0, 0.6, ease.out));
        const ang = lerp(-0.35, 0.3, prog(t, 0, d, ease.inOut)), dr = drift(t, 0.01);
        frame(0.08, top, 0.1, lerp(3.6, 3.2, k), 0.6, ang, dr);
      },
    },
  };
};
