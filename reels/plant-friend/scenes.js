// Water them too. One scene per beat id. Unrendered draft: needs a stills pass before trusting framing.
export default (kit) => {
  const { THREE, O, room, cam, drift, prog, ease, lerp, clamp, clay, cyl, sphere, rbox, box, spill, motes, panel } = kit;

  // A potted plant whose leaves can droop (wilt 0..1) and lose colour.
  const plant = (g, wilt0 = 0.8) => {
    const p = new THREE.Group(); g.add(p);
    cyl(p, 0.26, 0.19, 0.4, clay('#b5643f'), 0, 0.2, 0);
    cyl(p, 0.285, 0.285, 0.06, clay('#a3583a'), 0, 0.39, 0);
    const soil = cyl(p, 0.24, 0.24, 0.02, clay('#5a3d2a', { roughness: 1 }), 0, 0.41, 0);
    const stemG = new THREE.Group(); stemG.position.y = 0.42; p.add(stemG);
    const green = clay('#4f8a3f');
    cyl(stemG, 0.02, 0.028, 0.9, green, 0, 0.45, 0, 12);
    const leaves = [0, 1, 2, 3, 4, 5, 6].map((i) => {
      const piv = new THREE.Group(); piv.position.set(0, 0.22 + i * 0.1, 0); piv.rotation.y = i * 2.4; stemG.add(piv);
      const l = sphere(piv, 0.15, green); l.scale.set(1.6, 0.2, 0.7); l.position.set(0.2, 0, 0);
      return piv;
    });
    const healthy = new THREE.Color('#4f8a3f'), dry = new THREE.Color('#8f8a4a');
    p.wilt = (w) => {
      leaves.forEach((piv, i) => { piv.rotation.z = lerp(0.35, -1.05 - i * 0.04, w); });
      stemG.rotation.z = lerp(0, 0.38, w);
      green.color.copy(healthy).lerp(dry, w * 0.85);
      soil.material.color.set(w > 0.5 ? '#7a5a40' : '#4a3222');
    };
    p.wilt(wilt0);
    return p;
  };

  // A chat screen with messages that get shorter, then typing dots.
  const chat = (x, w, h, n, dots) => {
    x.fillStyle = '#0d0f12'; x.fillRect(0, 0, w, h);
    x.fillStyle = '#e8e8e8'; x.font = `700 ${w * 0.075}px Inter`; x.textAlign = 'center'; x.fillText('Friend', w / 2, h * 0.08);
    const msgs = [[0.72, 'left'], [0.6, 'right'], [0.45, 'left'], [0.5, 'right'], [0.22, 'left'], [0.4, 'right'], [0.1, 'left']];
    msgs.slice(0, n).forEach(([len, side], i) => {
      const bw = w * len, bh = h * 0.055, by = h * 0.14 + i * h * 0.1;
      x.fillStyle = side === 'left' ? '#2a2e35' : '#3d7a4a';
      const bx = side === 'left' ? w * 0.06 : w * 0.94 - bw;
      x.beginPath(); x.roundRect(bx, by, bw, bh, bh / 2); x.fill();
    });
    if (dots > 0) { x.fillStyle = `rgba(200,200,200,${dots})`; [0, 1, 2].forEach((i) => { x.beginPath(); x.arc(w * (0.12 + i * 0.06), h * 0.88, w * 0.02, 0, 7); x.fill(); }); }
  };

  const calling = (x, w, h, t) => {
    const gr = x.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#1d3b2a'); gr.addColorStop(1, '#0b1510');
    x.fillStyle = gr; x.fillRect(0, 0, w, h);
    x.textAlign = 'center'; x.fillStyle = '#ffffff'; x.font = `800 ${w * 0.11}px Inter`; x.fillText('Friend', w / 2, h * 0.3);
    x.fillStyle = '#9be36b'; x.font = `500 ${w * 0.065}px Inter`; x.fillText('calling' + '.'.repeat(1 + (Math.floor(t * 3) % 3)), w / 2, h * 0.38);
    const r = w * 0.11 * (1 + 0.08 * Math.sin(t * 6));
    x.fillStyle = '#34c759'; x.beginPath(); x.arc(w / 2, h * 0.78, r, 0, 7); x.fill();
  };

  const sill = (g, look, opts) => {
    const r = room(g, look, opts);
    const table = O.table(g, { color: '#6b4a33' });
    // A window: bright panel on the wall behind.
    const win = panel(g, 1.8, 2.2, (x, w, h) => { const gr = x.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#cfe6ff'); gr.addColorStop(1, '#fff1d6'); x.fillStyle = gr; x.fillRect(0, 0, w, h); x.fillStyle = '#5a4636'; x.fillRect(w / 2 - 6, 0, 12, h); x.fillRect(0, h / 2 - 6, w, 12); }, { power: 0.55 });
    win.position.set(0.3, 2.3, r.wall.position.z + 0.03);
    return { r, table, win };
  };

  return {
    b1: {
      build(g) {
        const { table } = sill(g, 'sand', { keyPower: 70, fillPower: 0.9, keyX: 1.2, keyZ: 3, wallZ: -2.6 });
        const p = plant(g, 0.45); p.position.set(0, table.top, 0.1);
        const s = spill(g, 1.6, 1, '#fff0d0', 0.4); s.rotation.x = -Math.PI / 2; s.position.set(0.3, table.top + 0.005, 0.1);
        return { p };
      },
      update({ p }, t, k, d) {
        // Leaves sag from the very first frame, then drop hard on "quiet".
        const q = kit.at('quiet');
        p.wilt(clamp(0.45 + prog(t, 0, q, ease.out) * 0.25 + prog(t, q, q + 0.5, ease.drop) * 0.3));
        const push = prog(t, 0, 1.2, ease.out), dr = drift(t, 0.015);
        cam(dr.x, lerp(1.9, 1.6, push) + dr.y, lerp(5.2, 3.6, push) - k * 0.3, 0, 1.45, 0, 30);
      },
    },
    b2: {
      build(g) {
        const { table } = sill(g, 'sand', { keyPower: 60, fillPower: 1, keyX: -1.4, keyZ: 2.5, wallZ: -2.6 });
        const p = plant(g, 1); p.position.set(0, table.top, 0.1);
        const dust = motes(g, { box: [2.4, 2, 1.5], n: 40 });
        return { p, dust, table };
      },
      update({ p, dust }, t, k) {
        dust.set(t);
        p.wilt(1);
        const dr = drift(t, 0.012);
        // Low angle close on dry soil and drooped leaves, sliding sideways.
        cam(lerp(-0.9, 0.5, k) + dr.x, 1.25 + dr.y, 2.3, 0, 1.3, 0.1, 30);
      },
    },
    b3: {
      build(g) {
        room(g, 'ink', { keyPower: 42, angle: 0.34, keyX: -0.8, keyZ: 2.6 });
        const table = O.table(g, { color: '#2c2019' });
        const phone = O.phone(g, { power: 1.1 }); phone.rotation.x = -Math.PI / 2 + 0.02; phone.position.set(0, table.top + 0.04, 0.1);
        return { phone };
      },
      update({ phone }, t, k, d) {
        const slow = kit.at('slower'), are = kit.at('are');
        const n = 2 + Math.floor(prog(t, 0, slow + 0.3) * 4);
        const dots = t > slow + 0.3 ? Math.max(0, 1 - prog(t, are - 0.4, are + 0.4)) * (0.5 + 0.5 * Math.sin(t * 8)) : 0;
        phone.screen.paint((x, w, h) => chat(x, w, h, n, dots));
        const push = prog(t, 0, 1, ease.out), dr = drift(t, 0.01);
        cam(dr.x, lerp(4.4, 3.4, push) + dr.y, lerp(1.6, 1.15, push), 0, 1.02, 0.05, 30);
      },
    },
    b4: {
      build(g) {
        const { r, table } = sill(g, 'night', { keyPower: 120, fillPower: 0.7, keyX: 1.4, keyZ: 4, wallZ: -2.6 });
        const clock = O.clock(g, { r: 0.42 }); clock.position.set(-0.95, 2.55, r.wall.position.z + 0.07);
        const p = plant(g, 0.7); p.position.set(0.45, table.top, 0.1);
        return { r, clock, p };
      },
      update({ r, clock, p }, t, k) {
        // Days fly past: hands spin, light swings day/night, the plant keeps wilting.
        clock.set(8 + t * 20);
        const day = 0.5 + 0.5 * Math.sin(t * 5);
        r.key.intensity = 40 + day * 110;
        r.fill.intensity = 0.3 + day * 0.6;
        p.wilt(clamp(0.7 + k * 0.3));
        const dr = drift(t, 0.02);
        cam(dr.x - 0.2, 2 + dr.y, 6.4 - k * 0.6, -0.2, 1.75, 0, 30);
      },
    },
    b5: {
      build(g) {
        const { table } = sill(g, 'sand', { keyPower: 80, fillPower: 1, keyX: 1, keyZ: 3, wallZ: -2.6 });
        const p = plant(g, 1); p.position.set(0, table.top, 0.1);
        // Watering can: body, spout, handle.
        const can = new THREE.Group(); g.add(can);
        const tin = clay('#3f7f8c', { roughness: 0.45 });
        cyl(can, 0.2, 0.22, 0.34, tin, 0, 0, 0);
        const spout = cyl(can, 0.025, 0.04, 0.55, tin, -0.3, 0.08, 0); spout.rotation.z = 1.0;
        kit.torus(can, 0.13, 0.025, tin, 0.18, 0.12, 0).rotation.y = Math.PI / 2;
        const drops = [0, 1, 2, 3, 4, 5, 6, 7].map(() => sphere(g, 0.022, kit.glass('#bfe6ff')));
        return { p, can, drops, top: table.top };
      },
      update({ p, can, drops, top }, t, k, d) {
        const w = kit.at('water'), back = kit.at('back');
        const tip = prog(t, 0, w, ease.inOut);
        can.position.set(lerp(1.4, 0.55, tip), top + 1.05, 0.1);
        can.rotation.z = lerp(0, 0.55, tip);
        const pour = t > w ? 1 : 0;
        const sx = can.position.x - 0.42, sy = can.position.y - 0.05;
        drops.forEach((dr, i) => {
          const ph = (t * 2.2 + i / drops.length) % 1;
          dr.visible = pour > 0;
          dr.position.set(lerp(sx, 0.05, ph), lerp(sy, top + 0.45, ph * ph), 0.1);
        });
        p.wilt(1 - prog(t, w + 0.2, back + 0.3, ease.back));
        const dr = drift(t, 0.015);
        cam(0.3 + dr.x, 1.75 + dr.y, 4.2 - k * 0.5, 0.25, 1.5, 0, 30);
      },
    },
    b6: {
      build(g) {
        const r = room(g, 'clay', { keyPower: 30, fillPower: 0.2 });
        const table = O.table(g, { color: '#5a3d2a' });
        const phone = O.phone(g, { power: 1.2 }); phone.rotation.x = -Math.PI / 2 + 0.02; phone.position.set(0, table.top + 0.04, 0.15);
        const lamp = O.pendant(g, 3, { power: 30, color: '#ffc27a', shadow: true });
        return { r, phone, lamp };
      },
      update({ r, phone, lamp }, t, k) {
        const c = kit.at('call');
        const lit = prog(t, c - 0.1, c + 0.8, ease.out);
        phone.screen.paint((x, w, h) => (t < c ? (x.fillStyle = '#050607', x.fillRect(0, 0, w, h)) : calling(x, w, h, t)));
        lamp.bulb.set(0.15 + lit * 0.85);
        r.key.intensity = 30 + lit * 70; r.fill.intensity = 0.2 + lit * 0.5;
        const dr = drift(t, 0.012);
        cam(dr.x, lerp(3.2, 3.9, k) + dr.y, lerp(1.0, 1.6, k), 0, 1.02, 0.12, 30);
      },
    },
    b7: {
      build(g) {
        const { table } = sill(g, 'sand', { keyPower: 95, fillPower: 1.1, keyX: 1.6, keyZ: 3.2, wallZ: -2.6 });
        const p = plant(g, 0); p.position.set(-0.45, table.top, 0.1);
        const phone = O.phone(g, { power: 1 }); phone.rotation.x = -Math.PI / 2 + 0.25; phone.position.set(0.55, table.top + 0.06, 0.35);
        const s = spill(g, 3, 1.6, '#ffd9a0', 0.55); s.position.set(0, 1.9, -2.55);
        return { p, phone };
      },
      update({ p, phone }, t, k) {
        p.wilt(-0.15 + 0.05 * Math.sin(t * 2));
        phone.screen.paint((x, w, h) => calling(x, w, h, t));
        const dr = drift(t, 0.015);
        cam(dr.x + lerp(0.5, 0, k), 1.8 + dr.y, lerp(4.4, 5.2, k), 0, 1.45, 0, 30);
      },
    },
  };
};
