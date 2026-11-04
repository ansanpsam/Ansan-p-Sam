// The jar that never fills. One scene per beat id.
// t is seconds into the beat, k is t/d, d is the beat's length. Key moments are tied to words with kit.at.
// Framing rule used throughout: the camera aims about 0.3 below the jar's centre, so the jar sits
// between y 250 and y 1200 on the 1080x1920 frame, above the caption pill at y 1240.
export default (kit) => {
  const { O, room, cam, drift, prog, ease, lerp, clay, metal, glass, glow, cyl, rbox, box, panel, sign, spill, steam, motes, rng, THREE } = kit;

  const gold = () => metal('#d9b45a', { roughness: 0.28 });

  // A glass savings jar with a slotted metal lid and a paper label. Returns the group, with .top and .coins.
  const jar = (g, n = 1, seed = 4) => {
    const j = new THREE.Group(); g.add(j);
    const body = cyl(j, 0.4, 0.4, 0.9, glass('#e4f1ec', { opacity: 0.3 }), 0, 0.45, 0, 56); body.castShadow = false;
    cyl(j, 0.4, 0.4, 0.02, glass('#e4f1ec', { opacity: 0.5 }), 0, 0.01, 0, 56);
    cyl(j, 0.36, 0.38, 0.06, glass('#e4f1ec', { opacity: 0.45 }), 0, 0.92, 0, 56);
    cyl(j, 0.39, 0.39, 0.08, metal('#a9a49b'), 0, 0.98, 0, 56);
    box(j, 0.26, 0.012, 0.05, clay('#111111'), 0, 1.022, 0);
    const tag = sign(j, 'SAVINGS', { w: 0.56, h: 0.17, color: '#3a2c1c', bg: '#efe4cc', size: 0.5, lit: true });
    tag.position.set(0, 0.5, 0.405);
    const r = rng(seed), mat = gold();
    j.coins = [...Array(n)].map((_, i) => {
      const c = cyl(j, 0.11, 0.11, 0.026, mat, (r() - 0.5) * 0.3, 0.035 + i * 0.027, (r() - 0.5) * 0.3, 32);
      c.rotation.set((r() - 0.5) * 0.25, r() * 6, (r() - 0.5) * 0.25);
      return c;
    });
    j.top = 1.02;
    return j;
  };

  const coin = (g) => { const c = cyl(g, 0.11, 0.11, 0.026, gold(), 0, 0, 0, 32); return c; };

  // A crumpled-flat paper receipt.
  const receipt = (g, seed) => {
    const r = rng(seed);
    return panel(g, 0.32, 0.5, (x, w, h) => {
      x.fillStyle = '#d9d3c7'; x.fillRect(0, 0, w, h);
      x.fillStyle = '#9a958c';
      for (let i = 0; i < 9; i++) x.fillRect(w * 0.12, h * (0.12 + i * 0.08), w * (0.4 + r() * 0.45), h * 0.025);
    }, { lit: true, px: 300 });
  };

  // Bloom is shared by every scene and frames render out of order, so each scene sets its own.
  const glowAmt = (v) => { kit.bloom.strength = v; };

  return {
    // Hook. One coin drops in through the slot in the first half second, alone at the bottom.
    b1: {
      build(g) {
        const r = room(g, 'ink', { keyPower: 90, fillPower: 1.6, angle: 0.4, keyX: -0.6, keyZ: 3 });
        const table = O.table(g, { color: '#3a2a1f' });
        const j = jar(g, 0); j.position.set(0, table.top, 0);
        const c = coin(g); c.rotation.x = Math.PI / 2;
        const glowPool = spill(g, 1.6, 1.6, '#ffcf8a', 0.35); glowPool.rotation.x = -Math.PI / 2; glowPool.position.set(0, table.top + 0.005, 0);
        const wallGlow = spill(g, 3.2, 2.2, '#ffcf8a', 0.5); wallGlow.position.set(0, 1.9, r.wall.position.z + 0.05);
        const dust = motes(g, { box: [3, 2.6, 2], n: 90 });
        return { c, table, r, wallGlow, dust, keyX0: r.key.position.x };
      },
      update({ c, table, r, wallGlow, dust, keyX0 }, t) {
        glowAmt(0.35);
        dust.set(t);
        // The key light sweeps across the jar through the hook, so light and shadow keep moving.
        r.key.position.x = keyX0 + Math.sin(t * 2.4) * 2.4;
        wallGlow.position.x = Math.sin(t * 2.4 + 0.6) * 1.2;
        // Frame 0: the coin hangs just above the slot, in view. It slips in, drops, then spins down
        // like a settling coin for about a second and a half, so the hook keeps moving.
        const inSlot = prog(t, 0, 0.35, ease.in), fall = prog(t, 0.35, 0.6, ease.drop);
        const y = lerp(table.top + 1.26, table.top + 1.03, inSlot) - fall * (1.03 - 0.05);
        const down = t > 0.6 ? 1 : 0, land = prog(t, 0.6, 2.2, ease.out);
        const tilt = 0.5 * (1 - land) * down;
        const spin = down ? (t - 0.6) * lerp(14, 4, land) : 0;
        c.position.set(0, y + Math.sin(tilt) * 0.11 * down, 0);
        c.rotation.set(down ? tilt * Math.cos(spin) : Math.PI / 2, down ? spin : t * 6, down ? tilt * Math.sin(spin) : 0);
        // A slow arc and push in that runs through the whole hook.
        const push = prog(t, 0, 3.2, (x) => x), dr = drift(t, 0.015);
        cam(lerp(-1.9, 1.1, push) + dr.x, table.top + lerp(1.6, 1.0, push) + dr.y, lerp(7.8, 4.7, push), 0, table.top + 0.3, 0, 32);
      },
    },

    // Coins rise out through the slot one by one and drift away into the dark. Low side angle.
    b2: {
      build(g) {
        room(g, 'night', { keyPower: 110, fillPower: 0.9, keyX: 1.6, keyZ: 3.6, angle: 0.5, wallZ: -3 });
        const table = O.table(g, { color: '#2c2019' });
        const j = jar(g, 7, 9); j.position.set(0, table.top, 0);
        const floaters = [0, 1, 2, 3, 4, 5].map(() => coin(g));
        return { j, floaters, table };
      },
      update({ j, floaters, table }, t, k, d) {
        glowAmt(0.35);
        // The first coin is already leaving at frame 0; the rest follow, ending as the voice finishes.
        const step = Math.max(0.3, (d - 1.4) / floaters.length);
        floaters.forEach((c, i) => {
          const at = 0.0 + i * step - 0.25, a = prog(t, at, at + 1.5, ease.inOut);
          c.visible = a > 0 && a < 1;
          c.position.set(a * (1.1 + i * 0.12), table.top + 1.03 + a * (1.4 + i * 0.1), a * 0.3);
          c.rotation.set(Math.PI / 2 + a * 4 + i, a * 3, a * 2);
          c.scale.setScalar(1 - a * 0.5);
        });
        const gone = floaters.filter((_, i) => t >= i * step - 0.25).length;
        j.coins.forEach((c, i) => { c.visible = i < 7 - gone; });
        const dr = drift(t, 0.02);
        cam(lerp(1.7, 1.3, k) + dr.x, table.top + 0.8 + dr.y, 5.3 - k * 0.3, 0.15, table.top + 0.25, 0, 30);
      },
    },

    // Top-down on a pale counter: coffee, snack, phone land on their words.
    b3: {
      build(g) {
        room(g, 'paper', { keyPower: 55, fillPower: 1.1, angle: 0.7, keyY: 6 });
        const table = O.table(g, { color: '#cdbfa8', w: 3.0, d: 2.4 });
        const cup = O.mug(g, { color: '#f1ede4' });
        cyl(cup, 0.2, 0.2, 0.12, clay('#9a6a3f'), 0, 0.16, 0, 32);
        cyl(cup, 0.16, 0.16, 0.01, clay('#4a2c18'), 0, 0.3, 0, 32);
        const snack = new THREE.Group(); g.add(snack);
        rbox(snack, 0.6, 0.14, 0.4, 0.04, clay('#d9503a'), 0, 0.07, 0);
        const stripe = sign(snack, 'CRUNCH', { w: 0.5, h: 0.16, color: '#fff3d6', size: 0.6, lit: true }); stripe.rotation.x = -Math.PI / 2; stripe.position.y = 0.142;
        const phone = O.phone(g, { power: 0.9 }); phone.rotation.x = -Math.PI / 2; phone.scale.setScalar(0.6);
        phone.screen.paint((x, w, h) => {
          x.fillStyle = '#101216'; x.fillRect(0, 0, w, h);
          x.fillStyle = '#ffffff'; x.textAlign = 'center'; x.font = `700 ${w * 0.11}px Inter`;
          x.fillText('Your order', w / 2, h * 0.28);
          x.fillStyle = '#c4c9d0'; x.font = `600 ${w * 0.085}px Inter`;
          x.fillText('Delivery fee', w / 2, h * 0.45); x.fillText('Service fee', w / 2, h * 0.54); x.fillText('Small order fee', w / 2, h * 0.63);
          x.fillStyle = '#F2B544'; x.fillRect(w * 0.15, h * 0.76, w * 0.7, h * 0.08);
        });
        return { table, cup, snack, phone };
      },
      update({ table, cup, snack, phone }, t, k) {
        glowAmt(0.2);
        const drop = (obj, at, x, z, yOff, ry) => {
          const a = prog(t, at - 0.25, at + 0.1, ease.drop);
          obj.visible = t >= at - 0.25;
          obj.position.set(x, table.top + yOff + (1 - a) * 1.6, z);
          obj.rotation.y = ry;
        };
        drop(cup, kit.at('coffee'), -0.38, -0.62, 0, 0.3);
        drop(snack, kit.at('snack'), 0.36, -0.2, 0, -0.35);
        drop(phone, kit.at('delivery'), -0.12, 0.42, 0.04, 0.12);
        // The camera slides and turns slightly from frame 0, so the empty counter is never still.
        const dr = drift(t, 0.02);
        cam(lerp(-0.25, 0.2, k) + dr.x, table.top + 5.4 + dr.y, 1.65, 0, table.top, 0.47, 34);
      },
    },

    // Receipts pile up, the calendar runs through the month, the jar stays empty.
    b4: {
      build(g) {
        const r = room(g, 'night', { keyPower: 170, fillPower: 1.25, keyX: -1.4, keyZ: 4.2, angle: 0.6, wallZ: -2.4 });
        const table = O.table(g, { color: '#4a3324' });
        const j = jar(g, 1, 3); j.position.set(0.5, table.top, 0.1);
        const rr = rng(17);
        const receipts = [...Array(10)].map((_, i) => {
          const p = receipt(g, 40 + i); p.scale.setScalar(1.25);
          p.base = [-0.55 + (rr() - 0.5) * 0.35, table.top + 0.02 + i * 0.022, 0.05 + (rr() - 0.5) * 0.25, (rr() - 0.5) * 1.0];
          return p;
        });
        const cal = new THREE.Group(); g.add(cal); cal.position.set(-0.45, 2.2, r.wall.position.z + 0.04);
        box(cal, 0.82, 0.92, 0.03, clay('#e9e3d6'), 0, 0, 0);
        const page = panel(cal, 0.76, 0.66, null, { lit: true, px: 300 }); page.position.set(0, -0.08, 0.02);
        box(cal, 0.82, 0.16, 0.035, clay('#b5412f'), 0, 0.38, 0.005);
        return { receipts, page, table };
      },
      update({ receipts, page }, t, k, d) {
        glowAmt(0.3);
        const step = Math.min(0.32, (d * 0.8) / receipts.length);
        receipts.forEach((p, i) => {
          const at = i * step, a = prog(t, at, at + 0.6, ease.out);
          p.visible = t >= at;
          // Each slip flutters down and settles tilted toward the camera, so the pile reads from this angle.
          p.position.set(p.base[0] + Math.sin(t * 4 + i) * 0.12 * (1 - a), p.base[1] + (1 - a) * 1.8, p.base[2]);
          p.rotation.set(-Math.PI / 2 + 0.5 + Math.sin(t * 5 + i) * 0.6 * (1 - a), 0, p.base[3]);
        });
        const day = 1 + Math.floor(prog(t, 0, kit.atEnd('ends'), ease.inOut) * 29);
        page.paint((x, w, h) => {
          x.fillStyle = '#f7f3ea'; x.fillRect(0, 0, w, h);
          x.fillStyle = '#2a2420'; x.textAlign = 'center'; x.textBaseline = 'middle';
          x.font = `800 ${h * 0.55}px Inter`; x.fillText(String(day), w / 2, h * 0.52);
        });
        const dr = drift(t, 0.02);
        cam(lerp(-0.3, 0.2, k) + dr.x, 1.9 + dr.y, lerp(6.6, 6.0, k), 0, 1.32, 0, 30);
      },
    },

    // A pendant lamp clicks on over the jar on "watch"; on "see", coins start dropping back in.
    b5: {
      build(g) {
        const r = room(g, 'clay', { keyPower: 20, fillPower: 0.3, wallZ: -2.8 });
        const table = O.table(g, { color: '#6b4a32' });
        const p = O.pendant(g, 3.05, { power: 14, color: '#ffc98a', shadow: true }); p.position.z = -0.7;
        const j = jar(g, 2, 6); j.position.set(0, table.top, 0.1);
        const back = [0, 1, 2, 3, 4, 5].map(() => coin(g));
        const pool = spill(g, 2.2, 2.2, '#ffd9a8', 0.4); pool.rotation.x = -Math.PI / 2; pool.position.set(0, table.top + 0.006, 0.1);
        const dust = motes(g, { box: [3, 2.5, 2], n: 24 });
        return { r, p, back, pool, dust, table };
      },
      update({ r, p, back, pool, dust, table }, t, k, d) {
        glowAmt(0.22);
        dust.set(t);
        const on = prog(t, kit.at('watch'), kit.at('watch') + 0.35, ease.out);
        p.bulb.set(0.2 + on * 0.6);
        r.key.intensity = 25 + on * 45;
        r.fill.intensity = 0.3 + on * 0.35;
        if (pool.set) pool.set(0.25 + on * 0.5);
        const s = kit.at('see');
        back.forEach((c, i) => {
          const at = s + i * 0.22, a = prog(t, at, at + 0.4, ease.drop);
          c.visible = t >= at;
          c.position.set((i % 3 - 1) * 0.06, table.top + 2.0 - a * (2.0 - 0.09 - i * 0.027), 0.1 + (i % 2) * 0.05);
          c.rotation.x = a < 1 ? Math.PI / 2 : 0;
        });
        const dr = drift(t, 0.015);
        cam(dr.x, table.top + 1.3 + dr.y, lerp(6.3, 5.7, prog(t, 0, d, ease.inOut)), 0, table.top + 0.25, 0, 32);
      },
    },

    // Warm ending: an iced coffee beside a fuller jar, a propped phone lights up with a send arrow on "send".
    b6: {
      build(g) {
        room(g, 'sand', { keyPower: 70, fillPower: 0.9, keyX: 1.2, keyZ: 3.4, angle: 0.55 });
        const table = O.table(g, { color: '#7a5236' });
        const j = jar(g, 14, 12); j.position.set(0.48, table.top, -0.05);
        // Iced coffee: a clear cup, coffee with a milk swirl, ice, a lid and a striped straw.
        const ic = new THREE.Group(); g.add(ic); ic.position.set(-0.6, table.top, 0.15);
        const shell = cyl(ic, 0.19, 0.15, 0.62, glass('#ffffff', { opacity: 0.25 }), 0, 0.31, 0, 40); shell.castShadow = false;
        cyl(ic, 0.17, 0.14, 0.42, clay('#6b3f22', { roughness: 0.4 }), 0, 0.22, 0, 40);
        cyl(ic, 0.175, 0.17, 0.08, clay('#d9b48c', { roughness: 0.4 }), 0, 0.46, 0, 40);
        [[-0.06, 0.5, 0.05], [0.07, 0.53, -0.03], [0.0, 0.56, 0.08]].forEach(([x, y, z], i) => {
          const ice = rbox(ic, 0.09, 0.09, 0.09, 0.02, glass('#eaf6ff', { opacity: 0.6 }), x, y, z); ice.rotation.set(i, i * 0.7, 0.3);
        });
        cyl(ic, 0.2, 0.2, 0.03, glass('#ffffff', { opacity: 0.4 }), 0, 0.63, 0, 40);
        const straw = cyl(ic, 0.018, 0.018, 0.6, clay('#2f7d5b'), 0.05, 0.85, 0, 12); straw.rotation.z = -0.15;
        // The phone stands propped between them, screen to camera.
        const phone = O.phone(g, { power: 1 }); phone.scale.setScalar(0.5); phone.rotation.x = -0.22; phone.position.set(-0.02, table.top + 0.02, 0.5);
        return { phone, table };
      },
      update({ phone, table }, t, k) {
        glowAmt(0.3);
        const lit = prog(t, kit.at('send') - 0.1, kit.at('send') + 0.25, ease.out);
        phone.screen.paint((x, w, h) => {
          x.fillStyle = '#0d0f13'; x.fillRect(0, 0, w, h);
          x.globalAlpha = 0.25 + lit * 0.75;
          x.fillStyle = '#F2B544'; x.beginPath(); x.arc(w / 2, h * 0.45, w * 0.26, 0, Math.PI * 2); x.fill();
          x.fillStyle = '#0d0f13'; x.beginPath();
          x.moveTo(w * 0.38, h * 0.38); x.lineTo(w * 0.66, h * 0.45); x.lineTo(w * 0.38, h * 0.52); x.lineTo(w * 0.43, h * 0.45); x.closePath(); x.fill();
          x.globalAlpha = 1;
        });
        // A slow orbit from left to right across the three objects.
        const a = lerp(-0.22, 0.12, k), rad = 5.8, dr = drift(t, 0.015);
        cam(Math.sin(a) * rad + dr.x, table.top + 1.2 + dr.y, Math.cos(a) * rad, 0.1, table.top + 0.12, 0.1, 32);
      },
    },
  };
};
