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
      x.fillStyle = '#f4f1ea'; x.fillRect(0, 0, w, h);
      x.fillStyle = '#9a958c';
      for (let i = 0; i < 9; i++) x.fillRect(w * 0.12, h * (0.12 + i * 0.08), w * (0.4 + r() * 0.45), h * 0.025);
    }, { lit: true, px: 300 });
  };

  return {
    // Hook. One coin drops in through the slot in the first half second, alone at the bottom.
    b1: {
      build(g) {
        room(g, 'ink', { keyPower: 60, fillPower: 0.55, angle: 0.4, keyX: -0.6, keyZ: 3 });
        const table = O.table(g, { color: '#3a2a1f' });
        const j = jar(g, 0); j.position.set(0, table.top, 0);
        const c = coin(g); c.rotation.x = Math.PI / 2;
        const glowPool = spill(g, 1.6, 1.6, '#ffcf8a', 0.35); glowPool.rotation.x = -Math.PI / 2; glowPool.position.set(0, table.top + 0.005, 0);
        return { c, table };
      },
      update({ c, table }, t) {
        // Falls from above the frame into the slot (0 to 0.3 s), then drops through the jar to the floor of it.
        const inSlot = prog(t, 0, 0.3, ease.in), fall = prog(t, 0.3, 0.55, ease.drop);
        const y = lerp(table.top + 2.2, table.top + 1.03, inSlot) - fall * (1.03 - 0.035);
        c.position.set(0, y, 0);
        // Edge-on while falling, lying flat once it lands, with a small wobble.
        const land = prog(t, 0.55, 0.9, ease.out);
        c.rotation.x = lerp(Math.PI / 2, 0.12 * Math.sin(t * 30) * (1 - land), land);
        const push = prog(t, 0, kit.at('empty') + 0.4, ease.out), dr = drift(t, 0.015);
        cam(dr.x, table.top + 1.25 + dr.y, lerp(5.4, 4.2, push), 0, table.top + 0.2, 0, 32);
      },
    },

    // Coins lift out one by one and drift away into the dark. Low side angle.
    b2: {
      build(g) {
        room(g, 'night', { keyPower: 90, fillPower: 0.7, keyX: 1.6, keyZ: 3.6, angle: 0.5, wallZ: -3 });
        const table = O.table(g, { color: '#2c2019' });
        const j = jar(g, 7, 9); j.position.set(-0.35, table.top, 0);
        const floaters = [0, 1, 2, 3, 4].map(() => coin(g));
        return { j, floaters, table };
      },
      update({ j, floaters, table }, t, k, d) {
        const start = kit.at('slips');
        floaters.forEach((c, i) => {
          const a = prog(t, start + i * 0.32, start + i * 0.32 + 1.6, ease.inOut);
          c.visible = a > 0 && a < 1;
          c.position.set(-0.35 + a * (1.6 + i * 0.15), table.top + 0.9 + a * (0.9 + i * 0.12), a * 0.4);
          c.rotation.set(a * 5 + i, a * 3, a * 2);
          c.scale.setScalar(1 - a * 0.6);
        });
        // The coins inside sink away as they leave, so the jar visibly empties.
        const gone = Math.floor(prog(t, start, d, ease.inOut) * 6);
        j.coins.forEach((c, i) => { c.visible = i < 7 - gone; });
        const dr = drift(t, 0.02);
        cam(lerp(1.9, 1.5, k) + dr.x, table.top + 0.75 + dr.y, 3.9 - k * 0.3, 0.15, table.top + 0.75, 0, 30);
      },
    },

    // High angle on a pale counter: coffee, snack, phone land on their words.
    b3: {
      build(g) {
        room(g, 'paper', { keyPower: 55, fillPower: 1.1, angle: 0.7, keyY: 6 });
        const table = O.table(g, { color: '#cdbfa8', w: 3.0, d: 2.2 });
        const cup = O.mug(g, { color: '#f1ede4' });
        const sleeve = cyl(cup, 0.2, 0.2, 0.12, clay('#9a6a3f'), 0, 0.16, 0, 32);
        const snack = new THREE.Group(); g.add(snack);
        rbox(snack, 0.6, 0.14, 0.4, 0.04, clay('#d9503a'), 0, 0.07, 0);
        const stripe = sign(snack, 'CRUNCH', { w: 0.5, h: 0.16, color: '#fff3d6', size: 0.6, lit: true }); stripe.rotation.x = -Math.PI / 2; stripe.position.y = 0.142;
        const phone = O.phone(g, { power: 0.9 }); phone.rotation.x = -Math.PI / 2;
        phone.screen.paint((x, w, h) => {
          x.fillStyle = '#101216'; x.fillRect(0, 0, w, h);
          x.fillStyle = '#ffffff'; x.textAlign = 'center'; x.font = `700 ${w * 0.1}px Inter`;
          x.fillText('Your order', w / 2, h * 0.3);
          x.fillStyle = '#9aa0a8'; x.font = `500 ${w * 0.075}px Inter`;
          x.fillText('Delivery fee', w / 2, h * 0.47); x.fillText('Service fee', w / 2, h * 0.56); x.fillText('Small order fee', w / 2, h * 0.65);
          x.fillStyle = '#F2B544'; x.fillRect(w * 0.15, h * 0.78, w * 0.7, h * 0.07);
        });
        return { table, cup, snack, phone, sleeve };
      },
      update({ table, cup, snack, phone }, t, k) {
        const drop = (obj, at, x, z, yOff, ry) => {
          const a = prog(t, at - 0.25, at + 0.1, ease.drop);
          obj.visible = t >= at - 0.25;
          obj.position.set(x, table.top + yOff + (1 - a) * 1.6, z);
          obj.rotation.y = ry;
        };
        drop(cup, kit.at('coffee'), -0.75, -0.35, 0, 0.3);
        drop(snack, kit.at('snack'), 0.65, -0.4, 0, -0.25);
        drop(phone, kit.at('delivery'), 0.0, 0.45, 0.04, 0);
        // A slight sideways slide keeps the first frames moving before the cup lands.
        const dr = drift(t, 0.02);
        cam(lerp(-0.5, 0.3, k) + dr.x, table.top + 4.1 + dr.y, 2.4, 0, table.top, -0.05, 34);
      },
    },

    // Receipts pile up, the calendar flips through the month, the jar stays empty.
    b4: {
      build(g) {
        const r = room(g, 'night', { keyPower: 160, fillPower: 0.8, keyX: -1.4, keyZ: 4.2, angle: 0.6, wallZ: -2.4 });
        const table = O.table(g, { color: '#3e2a1d' });
        const j = jar(g, 1, 3); j.position.set(0.55, table.top, 0.1);
        const rr = rng(17);
        const receipts = [...Array(10)].map((_, i) => {
          const p = receipt(g, 40 + i); p.rotation.x = -Math.PI / 2; p.rotation.z = (rr() - 0.5) * 1.2;
          p.base = [-0.6 + (rr() - 0.5) * 0.7, table.top + 0.004 + i * 0.003, 0.1 + (rr() - 0.5) * 0.6];
          return p;
        });
        const cal = new THREE.Group(); g.add(cal); cal.position.set(-0.4, 2.55, r.wall.position.z + 0.04);
        box(cal, 0.82, 0.92, 0.03, clay('#e9e3d6'), 0, 0, 0);
        const page = panel(cal, 0.76, 0.66, null, { lit: true, px: 300 }); page.position.set(0, -0.08, 0.02);
        box(cal, 0.82, 0.16, 0.035, clay('#b5412f'), 0, 0.38, 0.005);
        return { receipts, page, table };
      },
      update({ receipts, page, table }, t, k, d) {
        receipts.forEach((p, i) => {
          const at = i * 0.28, a = prog(t, at, at + 0.7, ease.out);
          p.visible = t >= at;
          p.position.set(p.base[0] + Math.sin(t * 4 + i) * 0.12 * (1 - a), p.base[1] + (1 - a) * 1.8, p.base[2]);
          p.rotation.y = Math.sin(t * 5 + i) * 0.5 * (1 - a);
        });
        // Calendar days run through the month, finishing as the voice reaches "ends".
        const day = 1 + Math.floor(prog(t, 0, kit.atEnd('ends'), ease.inOut) * 29);
        page.paint((x, w, h) => {
          x.fillStyle = '#f7f3ea'; x.fillRect(0, 0, w, h);
          x.fillStyle = '#2a2420'; x.textAlign = 'center'; x.textBaseline = 'middle';
          x.font = `800 ${h * 0.55}px Inter`; x.fillText(String(day), w / 2, h * 0.52);
        });
        const dr = drift(t, 0.02);
        cam(lerp(-0.3, 0.2, k) + dr.x, 2.15 + dr.y, lerp(6.8, 6.1, k), 0, 1.6, 0, 30);
      },
    },

    // A pendant lamp clicks on over the jar on "watch"; on "see", coins start dropping back in.
    b5: {
      build(g) {
        const r = room(g, 'clay', { keyPower: 20, fillPower: 0.25, wallZ: -2.8 });
        const table = O.table(g, { color: '#6b4a32' });
        const p = O.pendant(g, 3.1, { power: 36, color: '#ffc98a', shadow: true });
        const j = jar(g, 2, 6); j.position.set(0, table.top, 0.1);
        const back = [0, 1, 2, 3, 4, 5].map(() => coin(g));
        const pool = spill(g, 2.2, 2.2, '#ffd9a8', 0.5); pool.rotation.x = -Math.PI / 2; pool.position.set(0, table.top + 0.006, 0.1);
        const dust = motes(g, { box: [3, 2.5, 2], n: 24 });
        return { r, p, j, back, pool, dust, table };
      },
      update({ r, p, j, back, pool, dust, table }, t, k, d) {
        dust.set(t);
        const on = prog(t, kit.at('watch'), kit.at('watch') + 0.35, ease.out);
        // Starts faintly lit so frame 0 of the beat is never a black rectangle.
        p.bulb.set(0.15 + on * 0.85);
        r.key.intensity = 20 + on * 110;
        r.fill.intensity = 0.25 + on * 0.5;
        pool.set ? pool.set(0.2 + on * 0.8) : null;
        const s = kit.at('see');
        back.forEach((c, i) => {
          const at = s + i * 0.22, a = prog(t, at, at + 0.4, ease.drop);
          c.visible = t >= at;
          c.position.set(0, table.top + 2.2 - a * (2.2 - 0.09 - i * 0.027), 0.1);
          c.rotation.x = a < 1 ? Math.PI / 2 : 0;
        });
        const dr = drift(t, 0.015);
        cam(dr.x, table.top + 1.5 + dr.y, lerp(5.2, 4.3, prog(t, 0, d, ease.inOut)), 0, table.top + 0.3, 0, 32);
      },
    },

    // Warm ending: steaming coffee beside a fuller jar, a phone lights up with a send arrow on "send".
    b6: {
      build(g) {
        room(g, 'sand', { keyPower: 70, fillPower: 0.9, keyX: 1.2, keyZ: 3.4, angle: 0.55 });
        const table = O.table(g, { color: '#7a5236' });
        const j = jar(g, 14, 12); j.position.set(0.45, table.top, -0.05);
        const cup = O.mug(g, { color: '#f1ede4' }); cup.position.set(-0.55, table.top, 0.2);
        const st = steam(g, { x: -0.55, y: table.top + 0.36, z: 0.2, height: 0.8, power: 0.5 });
        const phone = O.phone(g, { power: 1 }); phone.rotation.x = -Math.PI / 2 + 0.03; phone.rotation.z = 0.25; phone.position.set(-0.2, table.top + 0.04, 0.75);
        phone.scale.setScalar(0.6);
        return { st, phone, table };
      },
      update({ st, phone, table }, t, k) {
        st.set(t);
        const lit = prog(t, kit.at('send') - 0.1, kit.at('send') + 0.25, ease.out);
        phone.screen.paint((x, w, h) => {
          x.fillStyle = '#0d0f13'; x.fillRect(0, 0, w, h);
          x.globalAlpha = 0.2 + lit * 0.8;
          x.fillStyle = '#F2B544'; x.beginPath(); x.arc(w / 2, h * 0.45, w * 0.26, 0, Math.PI * 2); x.fill();
          x.fillStyle = '#0d0f13'; x.beginPath();
          x.moveTo(w * 0.38, h * 0.38); x.lineTo(w * 0.66, h * 0.45); x.lineTo(w * 0.38, h * 0.52); x.lineTo(w * 0.43, h * 0.45); x.closePath(); x.fill();
          x.globalAlpha = 1;
        });
        // Slow orbit from left to right across the pair.
        const a = lerp(-0.35, 0.3, k), rad = 4.4, dr = drift(t, 0.015);
        cam(Math.sin(a) * rad + dr.x, table.top + 1.35 + dr.y, Math.cos(a) * rad, 0, table.top + 0.15, 0.1, 32);
      },
    },
  };
};
