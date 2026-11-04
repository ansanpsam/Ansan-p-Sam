// Water them too. One scene per beat id.
// Framing rule used throughout: the plant (y 1.0 to 2.4) or the upright phone sits
// above the caption pill at y 1240, so the camera target is set a little below the object.
export default (kit) => {
  const { THREE, O, room, cam, drift, prog, ease, lerp, clamp, clay, cyl, sphere, spill, motes, panel } = kit;

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
    const healthy = new THREE.Color('#4f8a3f'), dry = new THREE.Color('#9a8f48');
    p.wilt = (w) => {
      leaves.forEach((piv, i) => { piv.rotation.z = lerp(0.35, -1.0 - i * 0.04, w); });
      stemG.rotation.z = lerp(0, 0.34, w);
      green.color.copy(healthy).lerp(dry, clamp(w) * 0.85);
      soil.material.color.set(w > 0.5 ? '#7a5a40' : '#4a3222');
    };
    p.wilt(wilt0);
    return p;
  };

  // Water drops falling from height y0 onto the soil at (x, top), phase-driven by t.
  const rain = (g, n = 10) => [...Array(n)].map(() => sphere(g, 0.032, clay('#8fd0ff', { roughness: 0.15, emissive: '#2a6f9a', emissiveIntensity: 0.5 })));
  const fall = (drops, t, on, x, y0, y1, z) => drops.forEach((dr, i) => {
    const ph = (t * 1.8 + i / drops.length) % 1;
    dr.visible = on;
    dr.position.set(x + Math.sin(i * 7.3) * 0.12, lerp(y0, y1, ph * ph), z + Math.cos(i * 3.1) * 0.08);
  });

  // Chat list on the phone: rows of names, the "Friend" row slides away as you scroll.
  const list = (x, w, h, lit, off) => {
    x.fillStyle = '#0d0f12'; x.fillRect(0, 0, w, h);
    if (lit <= 0) return;
    x.globalAlpha = lit;
    x.fillStyle = '#e8e8e8'; x.font = `800 ${w * 0.09}px Inter`; x.textAlign = 'left'; x.fillText('Chats', w * 0.08, h * 0.09);
    const names = ['Friend', 'Work group', 'Deals', 'Gym', 'Delivery', 'Family', 'Memes', 'Class', 'News', 'Offers', 'Team', 'Updates'];
    names.forEach((nm, i) => {
      const y = h * 0.14 + i * h * 0.11 - off * h;
      if (y < h * 0.11 || y > h) return;
      const hot = i === 0;
      x.fillStyle = hot ? '#9be36b' : '#3a3f47'; x.beginPath(); x.arc(w * 0.15, y + h * 0.04, w * 0.07, 0, 7); x.fill();
      x.fillStyle = hot ? '#ffffff' : '#9aa0a8'; x.font = `${hot ? 800 : 600} ${w * 0.075}px Inter`; x.fillText(nm, w * 0.28, y + h * 0.035);
      x.fillStyle = '#4a4f57'; x.fillRect(w * 0.28, y + h * 0.055, w * (hot ? 0.3 : 0.5), h * 0.012);
    });
    x.globalAlpha = 1;
  };

  // A chat whose messages get shorter, then typing dots.
  const chat = (x, w, h, n, dots) => {
    x.fillStyle = '#0d0f12'; x.fillRect(0, 0, w, h);
    x.fillStyle = '#e8e8e8'; x.font = `800 ${w * 0.09}px Inter`; x.textAlign = 'center'; x.fillText('Friend', w / 2, h * 0.085);
    const msgs = [[0.74, 'left', 2], [0.6, 'right', 1], [0.46, 'left', 1], [0.55, 'right', 1], [0.24, 'left', 1], [0.48, 'right', 1], [0.1, 'left', 1]];
    let y = h * 0.13;
    msgs.slice(0, n).forEach(([len, side, lines]) => {
      const bw = w * len, bh = h * 0.05 * lines + h * 0.012 * (lines - 1);
      x.fillStyle = side === 'left' ? '#3a3f47' : '#3d8a4f';
      const bx = side === 'left' ? w * 0.06 : w * 0.94 - bw;
      x.beginPath(); x.roundRect(bx, y, bw, bh, h * 0.025); x.fill();
      y += bh + h * 0.035;
    });
    if (dots > 0) { x.fillStyle = `rgba(220,220,220,${dots})`; [0, 1, 2].forEach((i) => { x.beginPath(); x.arc(w * (0.12 + i * 0.07), y + h * 0.03, w * 0.022, 0, 7); x.fill(); }); }
  };

  const contact = (x, w, h, glow) => {
    x.fillStyle = '#101418'; x.fillRect(0, 0, w, h);
    x.textAlign = 'center';
    x.fillStyle = '#3a3f47'; x.beginPath(); x.arc(w / 2, h * 0.26, w * 0.17, 0, 7); x.fill();
    x.fillStyle = '#ffffff'; x.font = `800 ${w * 0.11}px Inter`; x.fillText('Friend', w / 2, h * 0.47);
    x.fillStyle = '#8a9099'; x.font = `500 ${w * 0.06}px Inter`; x.fillText('last call: a while ago', w / 2, h * 0.53);
    x.fillStyle = `rgba(52,199,89,${0.6 + 0.4 * glow})`; x.beginPath(); x.arc(w / 2, h * 0.78, w * 0.12 * (1 + 0.06 * glow), 0, 7); x.fill();
  };

  const calling = (x, w, h, t) => {
    const gr = x.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#24503a'); gr.addColorStop(1, '#0d1a13');
    x.fillStyle = gr; x.fillRect(0, 0, w, h);
    x.textAlign = 'center';
    x.fillStyle = '#9be36b'; x.globalAlpha = 0.25 + 0.15 * Math.sin(t * 5); x.beginPath(); x.arc(w / 2, h * 0.26, w * (0.2 + 0.03 * Math.sin(t * 5)), 0, 7); x.fill(); x.globalAlpha = 1;
    x.fillStyle = '#3a5a46'; x.beginPath(); x.arc(w / 2, h * 0.26, w * 0.17, 0, 7); x.fill();
    x.fillStyle = '#ffffff'; x.font = `800 ${w * 0.12}px Inter`; x.fillText('Friend', w / 2, h * 0.47);
    x.fillStyle = '#9be36b'; x.font = `600 ${w * 0.07}px Inter`; x.fillText('calling' + '.'.repeat(1 + (Math.floor(t * 3) % 3)), w / 2, h * 0.54);
    const r = w * 0.12 * (1 + 0.08 * Math.sin(t * 6));
    x.fillStyle = '#34c759'; x.beginPath(); x.arc(w / 2, h * 0.8, r, 0, 7); x.fill();
  };

  // A table in front of a bright window.
  const sill = (g, look, opts, sky = ['#cfe6ff', '#fff1d6'], power = 0.55) => {
    const r = room(g, look, opts);
    const table = O.table(g, { color: '#6b4a33' });
    let skyNow = sky;
    const win = panel(g, 1.8, 2.2, (x, w, h) => { const gr = x.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, skyNow[0]); gr.addColorStop(1, skyNow[1]); x.fillStyle = gr; x.fillRect(0, 0, w, h); x.fillStyle = '#5a4636'; x.fillRect(w / 2 - 6, 0, 12, h); x.fillRect(0, h / 2 - 6, w, 12); }, { power });
    win.position.set(0.3, 2.3, r.wall.position.z + 0.03);
    win.sky = (s) => { skyNow = s; win.paint?.(); };
    return { r, table, win };
  };

  // Small phone standing on the table, leaning back a touch.
  const standPhone = (g, top, x, z, s = 0.5, power = 1.1) => {
    const ph = O.phone(g, { power }); ph.scale.setScalar(s);
    ph.rotation.x = -0.12; ph.position.set(x, top + 0.74 * s + 0.02, z);
    return ph;
  };

  return {
    b1: {
      build(g) {
        const { table } = sill(g, 'sand', { keyPower: 60, fillPower: 0.9, keyX: 1.2, keyZ: 3, wallZ: -2.6 });
        const p = plant(g, 0.6); p.position.set(-0.35, table.top, 0.1);
        const phone = standPhone(g, table.top, 0.45, 0.25, 0.6);
        const s = spill(g, 1.6, 1, '#fff0d0', 0.35); s.rotation.x = -Math.PI / 2; s.position.set(-0.2, table.top + 0.005, 0.1);
        const drops = rain(g, 10);
        return { p, phone, drops, top: table.top };
      },
      update({ p, phone, drops, top }, t, k) {
        // Sags hard in the first half second, perks up on "water", then the phone lights on "friend" and scrolls past.
        const wa = kit.at('water'), fr = kit.at('friend'), sc = kit.at('scroll');
        const sag = prog(t, 0, 0.6, ease.drop), perk = prog(t, wa + 0.1, wa + 1.1, ease.back);
        p.wilt(clamp(0.6 + sag * 0.4 - perk * 0.95));
        fall(drops, t, t > wa - 0.1 && t < wa + 1.2, -0.35, top + 2.2, top + 0.42, 0.1);
        const lit = prog(t, fr - 0.1, fr + 0.3, ease.out), off = prog(t, sc, sc + 0.7, ease.inOut) * 0.55;
        phone.screen.paint((x, w, h) => list(x, w, h, lit, off));
        // Opens tight on the drooping plant, then pulls back to reveal the phone as "friend" lands.
        const pull = prog(t, 0, fr + 0.2, ease.inOut), dr = drift(t, 0.012);
        phone.rotation.z = t > fr && t < fr + 0.6 ? Math.sin(t * 80) * 0.03 : 0;
        cam(dr.x + lerp(-0.45, 0.05, pull), lerp(1.55, 1.75, pull) + dr.y, lerp(5.4, 6.6, pull), lerp(-0.4, 0.05, pull), lerp(1.36, 1.42, pull), 0, 30);
      },
    },
    b2: {
      build(g) {
        const { table } = sill(g, 'paper', { keyPower: 42, fillPower: 1, keyX: -1.4, keyZ: 2.5, wallZ: -2.6 }, ['#fff6e0', '#ffe2b0'], 0.5);
        const p = plant(g, 0.1); p.position.set(0, table.top, 0.1);
        const dust = motes(g, { box: [2.4, 2, 1.5], n: 40 });
        return { p, dust };
      },
      update({ p, dust }, t, k) {
        dust.set(t);
        // Healthy at first, drops on "droop", goes dry on "thirsty".
        const dp = kit.at('droop'), th = kit.at('thirsty');
        p.wilt(clamp(0.1 + prog(t, dp - 0.1, dp + 0.5, ease.drop) * 0.6 + prog(t, th - 0.1, th + 0.6, ease.out) * 0.3));
        const dr = drift(t, 0.012);
        // Side angle, sliding around the pot.
        const a = lerp(-0.45, -0.15, k), D = lerp(5.6, 5, prog(t, 0, 1, ease.out));
        cam(Math.sin(a) * D + dr.x, 1.5 + dr.y, Math.cos(a) * D + 0.1, 0, 1.3, 0.1, 30);
      },
    },
    b3: {
      build(g) {
        const r = room(g, 'ink', { keyPower: 40, fillPower: 0.6, angle: 0.4, keyX: -0.8, keyZ: 2.6, wallZ: -2.4 });
        const table = O.table(g, { color: '#2c2019' });
        const phone = O.phone(g, { power: 1.15 }); phone.rotation.set(-0.08, 0.22, 0); phone.position.set(0, table.top + 0.76, 0);
        const s = spill(g, 2.6, 2.4, '#5b7cff', 0.25); s.position.set(0, 1.9, r.wall.position.z + 0.05);
        return { phone };
      },
      update({ phone }, t, k) {
        const slow = kit.at('slower'), are = kit.at('are');
        const n = 3 + Math.floor(prog(t, 0, slow + 0.3) * 4);
        const dots = t > slow + 0.3 ? Math.max(0, 1 - prog(t, are - 0.4, are + 0.4)) * (0.5 + 0.5 * Math.sin(t * 8)) : 0;
        phone.screen.paint((x, w, h) => chat(x, w, h, n, dots));
        phone.rotation.y = lerp(0.22, 0.08, k);
        const push = prog(t, 0, 0.8, ease.out), dr = drift(t, 0.01);
        cam(dr.x + 0.2, 1.75 + dr.y, lerp(6.6, 5.6, push) - k * 0.2, 0.05, 1.35, 0, 30);
      },
    },
    b4: {
      build(g) {
        const { r, table, win } = sill(g, 'night', { keyPower: 110, fillPower: 0.8, keyX: 1.4, keyZ: 4, wallZ: -2.6 });
        const clock = O.clock(g, { r: 0.4 }); clock.position.set(-0.85, 2.6, r.wall.position.z + 0.07);
        const p = plant(g, 0.55); p.position.set(0.25, table.top, 0.1);
        return { r, clock, p, win };
      },
      update({ r, clock, p }, t, k) {
        // Days fly past: hands spin, light swings day and night, the plant keeps wilting.
        clock.set(8 + t * 20);
        const day = 0.5 + 0.5 * Math.sin(t * 5);
        r.key.intensity = 35 + day * 100;
        r.fill.intensity = 0.35 + day * 0.6;
        p.wilt(clamp(0.55 + k * 0.45));
        const dr = drift(t, 0.02);
        cam(dr.x - 0.2, 2 + dr.y, 8.4 - k * 0.5, -0.2, 1.4, 0, 30);
      },
    },
    b5: {
      build(g) {
        const { table } = sill(g, 'sand', { keyPower: 70, fillPower: 1, keyX: 1, keyZ: 3, wallZ: -2.6 });
        const p = plant(g, 1); p.position.set(-0.2, table.top, 0.1);
        // Watering can: body, spout, handle.
        const can = new THREE.Group(); g.add(can);
        const tin = clay('#3f7f8c', { roughness: 0.45 });
        cyl(can, 0.2, 0.22, 0.34, tin, 0, 0, 0);
        const spout = cyl(can, 0.025, 0.04, 0.55, tin, -0.3, 0.08, 0); spout.rotation.z = 1.0;
        kit.torus(can, 0.13, 0.025, tin, 0.18, 0.12, 0).rotation.y = Math.PI / 2;
        const drops = rain(g, 12);
        return { p, can, drops, top: table.top };
      },
      update({ p, can, drops, top }, t, k) {
        const w = kit.at('water'), back = kit.at('back');
        const tip = prog(t, 0, Math.max(0.6, w), ease.inOut);
        can.position.set(lerp(1.5, 0.45, tip), top + 1.25, 0.1);
        can.rotation.z = lerp(0, 0.6, tip);
        fall(drops, t, t > w - 0.05, -0.05, top + 1.05, top + 0.42, 0.1);
        p.wilt(1 - prog(t, w + 0.2, back + 0.3, ease.back));
        const dr = drift(t, 0.015);
        cam(-0.5 + dr.x, 1.7 + dr.y, 6.4 - k * 0.5, 0.05, 1.35, 0, 30);
      },
    },
    b6: {
      build(g) {
        const r = room(g, 'clay', { keyPower: 30, fillPower: 0.25, wallZ: -2.4 });
        const table = O.table(g, { color: '#5a3d2a' });
        const phone = O.phone(g, { power: 1.2 }); phone.rotation.set(-0.1, -0.3, 0); phone.position.set(0, table.top + 0.76, 0.1);
        const glow = spill(g, 3.2, 2.6, '#ffc27a', 0.6); glow.position.set(0, 1.9, r.wall.position.z + 0.05);
        return { r, phone, glow };
      },
      update({ r, phone, glow }, t, k) {
        const c = kit.at('call');
        const lit = prog(t, c - 0.1, c + 0.8, ease.out);
        phone.screen.paint((x, w, h) => (t < c ? contact(x, w, h, 0.5 + 0.5 * Math.sin(t * 7)) : calling(x, w, h, t)));
        glow.set(0.15 + lit * 0.85);
        r.key.intensity = 30 + lit * 60; r.fill.intensity = 0.25 + lit * 0.45;
        const push = prog(t, 0, 0.7, ease.out), dr = drift(t, 0.012);
        cam(lerp(-1.2, -0.9, k) + dr.x, 1.5 + dr.y, lerp(6.2, 5.3, push) - k * 0.3, 0, 1.38, 0.1, 30);
      },
    },
    b7: {
      build(g) {
        const { table } = sill(g, 'sand', { keyPower: 80, fillPower: 1.1, keyX: 1.6, keyZ: 3.2, wallZ: -2.6 }, ['#ffd9a0', '#ffb070'], 0.6);
        const p = plant(g, 0); p.position.set(-0.35, table.top, 0.1);
        const phone = standPhone(g, table.top, 0.45, 0.25, 0.5, 1.2);
        const bud = sphere(g, 0.15, clay('#7ccf5a')); bud.scale.set(1.6, 0.2, 0.7);
        const s = spill(g, 3, 1.6, '#ffd9a0', 0.5); s.position.set(0, 1.9, -2.55);
        return { p, phone, bud, top: table.top };
      },
      update({ p, phone, bud, top }, t, k) {
        p.wilt(-0.15 + 0.05 * Math.sin(t * 2));
        // A new leaf unfurls at the top as the line lands.
        const u = prog(t, kit.at('send') - 0.2, kit.at('them') + 0.4, ease.back);
        bud.scale.set(1.6 * u + 0.01, 0.2, 0.7 * u + 0.01);
        bud.position.set(-0.35 + 0.15 * u, top + 1.36, 0.12); bud.rotation.z = lerp(1.2, 0.3, u);
        phone.screen.paint((x, w, h) => calling(x, w, h, t));
        const dr = drift(t, 0.015);
        cam(dr.x + lerp(0.2, 0, k), 1.75 + dr.y, lerp(6, 6.8, k), 0.05, 1.32, 0, 30);
      },
    },
  };
};
