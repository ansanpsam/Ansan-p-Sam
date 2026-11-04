// First look: the phone gets the first look of the day, the window waits.
export default (kit) => {
  const { O, room, cam, drift, prog, ease, lerp, clay, box, rbox, glow, panel, sign, spill, steam, motes } = kit;

  // Lock screen: cold blue glow with stacked notification cards. n is how many cards are in (can be fractional).
  const lock = (x, w, h, n = 0, tint = 0) => {
    const gr = x.createLinearGradient(0, 0, 0, h);
    gr.addColorStop(0, tint > 0 ? `rgb(${40 + tint * 120},${60},${150 - tint * 60})` : '#1b3a8c'); gr.addColorStop(1, '#0a1640');
    x.fillStyle = gr; x.fillRect(0, 0, w, h);
    x.fillStyle = 'rgba(255,255,255,0.92)'; x.textAlign = 'center'; x.textBaseline = 'middle';
    x.font = `300 ${w * 0.22}px Inter`; x.fillText('7:02', w / 2, h * 0.17);
    for (let i = 0; i < 5; i++) {
      const a = Math.max(0, Math.min(1, n - i)); if (a <= 0) continue;
      const y = h * 0.32 + i * h * 0.12 + (1 - a) * -h * 0.08;
      x.globalAlpha = a; x.fillStyle = 'rgba(235,240,255,0.88)';
      x.beginPath(); x.roundRect(w * 0.07, y, w * 0.86, h * 0.1, w * 0.04); x.fill();
      x.fillStyle = ['#ff5a5f', '#3fb8ff', '#ffc53d', '#7c5cff', '#36d399'][i];
      x.beginPath(); x.roundRect(w * 0.11, y + h * 0.02, w * 0.12, w * 0.12, w * 0.03); x.fill();
      x.fillStyle = 'rgba(30,40,70,0.75)'; x.fillRect(w * 0.28, y + h * 0.028, w * 0.5, h * 0.016); x.fillRect(w * 0.28, y + h * 0.058, w * 0.36, h * 0.013);
      x.globalAlpha = 1;
    }
  };

  // Full-screen "feed" cards for b3: 0 news, 1 holiday, 2 opinion.
  const feed = (x, w, h, which) => {
    if (which === 0) {
      x.fillStyle = '#f4f1ea'; x.fillRect(0, 0, w, h);
      x.fillStyle = '#d0342c'; x.fillRect(0, h * 0.08, w, h * 0.06);
      x.fillStyle = '#fff'; x.font = `800 ${w * 0.09}px Inter`; x.textAlign = 'left'; x.textBaseline = 'middle'; x.fillText('BREAKING', w * 0.07, h * 0.11);
      x.fillStyle = '#16181d'; for (let i = 0; i < 3; i++) x.fillRect(w * 0.07, h * (0.2 + i * 0.065), w * (0.86 - i * 0.18), h * 0.04);
      x.fillStyle = '#9aa0aa'; x.fillRect(w * 0.07, h * 0.45, w * 0.86, h * 0.3);
      x.fillStyle = '#c3c7ce'; for (let i = 0; i < 3; i++) x.fillRect(w * 0.07, h * (0.8 + i * 0.045), w * 0.86, h * 0.022);
    } else if (which === 1) {
      const gr = x.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#3fb4ff'); gr.addColorStop(0.55, '#a8e4ff'); gr.addColorStop(0.56, '#1aa3b8'); gr.addColorStop(0.7, '#2bc0c8'); gr.addColorStop(0.71, '#f3d9a4'); gr.addColorStop(1, '#e8c487');
      x.fillStyle = gr; x.fillRect(0, 0, w, h);
      x.fillStyle = '#fff6c8'; x.beginPath(); x.arc(w * 0.72, h * 0.2, w * 0.12, 0, 7); x.fill();
      x.fillStyle = '#e8473f'; x.beginPath(); x.moveTo(w * 0.3, h * 0.66); x.lineTo(w * 0.62, h * 0.66); x.lineTo(w * 0.46, h * 0.6); x.fill();
      x.fillStyle = '#fff'; x.font = `700 ${w * 0.075}px Inter`; x.textAlign = 'center'; x.fillText('♥ 2,481', w * 0.5, h * 0.93);
    } else {
      x.fillStyle = '#16171c'; x.fillRect(0, 0, w, h);
      const bub = (bx, by, bw, bh, c) => { x.fillStyle = c; x.beginPath(); x.roundRect(bx, by, bw, bh, w * 0.05); x.fill(); };
      bub(w * 0.07, h * 0.12, w * 0.7, h * 0.13, '#2c2f39'); bub(w * 0.23, h * 0.3, w * 0.7, h * 0.18, '#ff5a3c'); bub(w * 0.07, h * 0.53, w * 0.6, h * 0.11, '#2c2f39'); bub(w * 0.3, h * 0.69, w * 0.63, h * 0.14, '#ff5a3c');
      x.fillStyle = '#fff'; x.font = `900 ${w * 0.16}px Inter`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('!!', w * 0.58, h * 0.39);
    }
  };

  // A window on the back wall with curtains. win.open(k) slides the curtains, win.sky(k) brightens the sky.
  const makeWindow = (g, wz, cx = 0, cy = 2.1, W = 1.5, H = 1.9, cloth = '#6d6f86') => {
    const grp = new kit.THREE.Group(); g.add(grp); grp.position.set(cx, cy, wz + 0.02);
    const skyPanel = panel(grp, W, H, null, { px: 300, power: 1 });
    skyPanel.position.z = 0.01;
    const wood = clay('#e9e2d4', { roughness: 0.6 });
    box(grp, W + 0.16, 0.08, 0.1, wood, 0, H / 2 + 0.04, 0.05); box(grp, W + 0.16, 0.1, 0.22, wood, 0, -H / 2 - 0.05, 0.1);
    box(grp, 0.08, H, 0.1, wood, -W / 2 - 0.04, 0, 0.05); box(grp, 0.08, H, 0.1, wood, W / 2 + 0.04, 0, 0.05);
    box(grp, 0.04, H, 0.06, wood, 0, 0, 0.04); box(grp, W, 0.04, 0.06, wood, 0, 0.1, 0.04);
    const cmat = clay(cloth, { roughness: 0.95 });
    const L = rbox(grp, W / 2 + 0.22, H + 0.5, 0.05, 0.02, cmat, -W / 4 - 0.11, 0.05, 0.22);
    const R = rbox(grp, W / 2 + 0.22, H + 0.5, 0.05, 0.02, cmat, W / 4 + 0.11, 0.05, 0.22);
    box(grp, W + 1.4, 0.04, 0.04, kit.metal('#9c968a'), 0, H / 2 + 0.32, 0.25);
    const line = box(grp, 0.035, H + 0.3, 0.02, glow('#ffc46b', 0), 0, 0.05, 0.25); line.castShadow = false;
    const win = { grp, line, L, R, skyPanel, W, H };
    win.open = (k) => { L.position.x = -W / 4 - 0.11 - k * (W / 2 + 0.05); R.position.x = W / 4 + 0.11 + k * (W / 2 + 0.05); L.scale.x = R.scale.x = 1 - k * 0.35; };
    win.sky = (k) => skyPanel.paint((x, w, h) => {
      const gr = x.createLinearGradient(0, 0, 0, h);
      gr.addColorStop(0, `rgb(${lerp(40, 255, k)},${lerp(48, 205, k)},${lerp(70, 140, k)})`);
      gr.addColorStop(1, `rgb(${lerp(70, 255, k)},${lerp(70, 160, k)},${lerp(90, 90, k)})`);
      x.fillStyle = gr; x.fillRect(0, 0, w, h);
      x.fillStyle = `rgba(255,240,200,${k})`; x.beginPath(); x.arc(w * 0.68, h * 0.62, w * 0.12, 0, 7); x.fill();
    });
    win.sky(0); win.open(0);
    return win;
  };

  return {
    b1: {
      build(g) {
        const r = room(g, 'night', { keyPower: 30, fillPower: 0.35, wallZ: -1.6 });
        const win = makeWindow(g, r.wall.position.z, 0, 2.2, 1.4, 1.5, '#8b8098');
        const table = O.table(g, { w: 1.5, d: 0.8, color: '#3a2a20' }); table.position.z = -1.05;
        const phone = O.phone(g, { power: 0 }); phone.rotation.x = -Math.PI / 2 + 0.02; phone.position.set(0.05, table.top + 0.04, -0.95);
        const blue = spill(g, 2.2, 2.2, '#4f7dff', 0.55); blue.rotation.x = -Math.PI / 2; blue.position.set(0.05, table.top + 0.075, -0.95);
        const blueWall = spill(g, 2.6, 1.8, '#3d64ff', 0.35); blueWall.position.set(0, 1.4, r.wall.position.z + 0.04);
        return { phone, blue, blueWall, win };
      },
      update({ phone, blue, blueWall, win }, t) {
        const on = prog(t, Math.max(0, kit.at('phone') - 0.05), kit.at('phone') + 0.25, ease.out);
        phone.screen.material.emissiveIntensity = 0.55 + on * 0.6;
        phone.screen.paint((x, w, h) => lock(x, w, h, 0.6 + prog(t, 0, 2.4, ease.out) * 1.6));
        blue.set(0.5 + on * 0.5); blueWall.set(0.4 + on * 0.6);
        const buzz = t < 1.2 ? 1 - t / 1.2 : 0;
        phone.position.x = 0.05 + Math.sin(t * 95) * 0.02 * buzz;
        phone.rotation.z = Math.sin(t * 71) * 0.03 * buzz;
        // the window sits grey and ignored; a dim seam appears on "window"
        win.line.material.emissiveIntensity = 0.25 * prog(t, kit.at('window'), kit.at('window') + 0.6);
        const push = prog(t, 0, 3, ease.out), d = drift(t, 0.015);
        cam(d.x, lerp(3.9, 3.5, push) + d.y, lerp(5.4, 4.5, push), 0, 1.15, -1.0, 32);
      },
    },
    b2: {
      build(g) {
        room(g, 'ink', { keyPower: 18, fillPower: 0.2 });
        const table = O.table(g, { w: 1.6, d: 1.2, color: '#2b211b' });
        const phone = O.phone(g, { power: 1.15 }); phone.rotation.x = -Math.PI / 2 + 0.02; phone.position.set(0, table.top + 0.04, 0);
        const blue = spill(g, 2.6, 2.6, '#4f7dff', 0.6); blue.rotation.x = -Math.PI / 2; blue.position.set(0, table.top + 0.075, 0);
        return { phone, blue, table };
      },
      update({ phone, blue }, t, k, d) {
        const mood = kit.at('mood');
        const n = 1 + prog(t, 0, mood, ease.inOut) * 4;
        const tint = prog(t, mood, mood + 0.5, ease.out);
        phone.screen.paint((x, w, h) => lock(x, w, h, n, tint));
        blue.set(0.8 + Math.sin(t * 3) * 0.1);
        const dr = drift(t, 0.008);
        // straight down, slowly turning, pushing in
        const z = lerp(4.6, 3.9, prog(t, 0, d, ease.inOut));
        cam(lerp(-0.25, 0.15, k) + dr.x, 1.04 + z, 0.75 + dr.y, 0, 1.05, 0.3, 32);
      },
    },
    b3: {
      build(g) {
        room(g, 'night', { keyPower: 26, fillPower: 0.3 });
        const table = O.table(g, { w: 1.6, d: 1.2, color: '#2b211b' });
        const phone = O.phone(g, { power: 1.0 }); phone.rotation.x = -Math.PI / 2 + 0.02; phone.rotation.z = 0.28; phone.position.set(0, table.top + 0.04, 0);
        const glowP = spill(g, 2.4, 2.4, '#ffffff', 0.35); glowP.rotation.x = -Math.PI / 2; glowP.position.set(0, table.top + 0.075, 0);
        return { phone, glowP };
      },
      update({ phone, glowP }, t, k) {
        const ts = [kit.at('news'), kit.at('holiday'), kit.at('opinion')];
        const which = t >= ts[2] - 0.1 ? 2 : t >= ts[1] - 0.1 ? 1 : 0;
        const since = t - (which === 0 ? 0 : ts[which] - 0.1);
        // a quick flip on each new card
        const flip = 1 - prog(since, 0, 0.18, ease.out);
        phone.screen.paint((x, w, h) => { feed(x, w, h, which); if (flip > 0) { x.fillStyle = `rgba(0,0,0,${flip})`; x.fillRect(0, 0, w, h); } });
        phone.position.y = 1.05 + flip * 0.03;
        glowP.material.color.set(['#ffffff', '#5fd0ff', '#ff6a4a'][which]); glowP.set(0.4);
        const dr = drift(t, 0.01);
        cam(lerp(0.6, 0.3, k) + dr.x, 5.2 - k * 0.4 + dr.y, 1.9, 0, 1.05, 0.3, 32);
      },
    },
    b4: {
      build(g) {
        const r = room(g, 'night', { keyPower: 25, fillPower: 0.45, wallZ: -1.6 });
        const win = makeWindow(g, r.wall.position.z, 0, 2.2, 1.4, 1.5, '#8b8098');
        const floorLine = spill(g, 0.35, 3.2, '#ffc46b', 0.7); floorLine.rotation.x = -Math.PI / 2; floorLine.position.set(0, 0.012, r.wall.position.z + 1.6);
        const wallGlow = spill(g, 1.2, 2.6, '#ffb24a', 0.6); wallGlow.position.set(0, 2.2, r.wall.position.z + 0.24);
        const dust = motes(g, { box: [1.2, 3, 1.2], n: 26, power: 0.4 });
        return { win, floorLine, wallGlow, dust, wz: r.wall.position.z };
      },
      update({ win, floorLine, wallGlow, dust, wz }, t, k, d) {
        dust.set(t);
        const light = prog(t, 0, kit.at('light') + 0.6, ease.out);
        win.line.material.emissiveIntensity = 0.6 + light * 5;
        wallGlow.set(0.25 + light * 0.75);
        // the light line creeps out across the floor toward the camera
        const creep = prog(t, 0.2, d, ease.inOut);
        floorLine.scale.y = 0.1 + creep * 0.9; floorLine.position.z = wz + 0.1 + 1.6 * (0.1 + creep * 0.9);
        floorLine.set(light);
        win.open(0.02 * Math.sin(t * 1.5) + 0.02);
        const dr = drift(t, 0.02);
        cam(lerp(-0.9, -0.3, k) + dr.x, 1.9 + dr.y, lerp(5.6, 4.6, prog(t, 0, d, ease.inOut)), 0, 1.65, wz, 32);
      },
    },
    b5: {
      build(g) {
        const r = room(g, 'night', { keyPower: 20, fillPower: 0.35, wallZ: -1.6, keyX: 0, keyY: 2.4, keyZ: -1.2, angle: 1.1 });
        r.key.color.set('#ffc98a'); r.key.target.position.set(0, 0.8, 1.5);
        const win = makeWindow(g, r.wall.position.z, 0, 2.2, 1.4, 1.5, '#8b8098');
        const table = O.table(g, { w: 1.5, d: 0.8, color: '#3a2a20' }); table.position.z = -1.05;
        const phone = O.phone(g, { power: 1.0 }); phone.rotation.x = -Math.PI / 2 + 0.02; phone.position.set(0.05, table.top + 0.045, -0.95);
        const wash = spill(g, 3.4, 3.4, '#ffd08a', 0.75); wash.position.set(0, 1.9, r.wall.position.z + 0.25);
        const floorPool = spill(g, 2.6, 3.4, '#ffc06a', 0.6); floorPool.rotation.x = -Math.PI / 2; floorPool.position.set(0, 0.012, r.wall.position.z + 1.8);
        const dust = motes(g, { box: [2.4, 3, 2], n: 40, power: 0.35 });
        return { r, win, phone, wash, floorPool, dust };
      },
      update({ r, win, phone, wash, floorPool, dust }, t, k) {
        dust.set(t);
        const tw = kit.at('window'), tp = kit.at('phone');
        const open = prog(t, tw - 0.1, tw + 1.1, ease.inOut);
        win.open(open); win.sky(open);
        win.line.material.emissiveIntensity = 3 * (1 - open);
        wash.set(open); floorPool.set(open);
        r.key.intensity = 20 + open * 160;
        r.fill.intensity = 0.35 + open * 0.6;
        kit.bloom.strength = 0.4 - open * 0.15;
        // the phone flips face-down on "phone"
        const flip = prog(t, tp - 0.1, tp + 0.45, ease.inOut);
        phone.rotation.x = -Math.PI / 2 + 0.02 + flip * Math.PI;
        phone.position.y = 1.055 + Math.sin(flip * Math.PI) * 0.25;
        phone.screen.material.emissiveIntensity = 1 - flip;
        phone.screen.paint((x, w, h) => lock(x, w, h, 5, 0));
        const dr = drift(t, 0.02);
        cam(lerp(0.7, 0.3, k) + dr.x, 3.3 + dr.y, lerp(5.6, 5.1, k), 0, 1.08, -1.0, 32);
      },
    },
    b6: {
      build(g) {
        const r = room(g, 'sand', { keyPower: 70, fillPower: 0.55, wallZ: -1.2, keyX: 1.6, keyY: 4.5, keyZ: 2.5, angle: 0.5 });
        const wz = r.wall.position.z;
        const sill = rbox(g, 2.6, 0.12, 0.7, 0.03, clay('#efe6d6', { roughness: 0.6 }), 0, 1.0, wz + 0.35);
        box(g, 2.6, 1.0, 0.6, clay('#d9c7ad'), 0, 0.47, wz + 0.3);
        const mug = O.mug(g, { color: '#f4efe6' }); mug.position.set(-0.35, 1.06, wz + 0.4);
        const st = steam(g, { x: -0.35, y: 1.4, z: wz + 0.4, height: 0.8, power: 0.22 });
        const phone = O.phone(g, { power: 0 }); phone.rotation.x = Math.PI / 2 - 0.02; phone.rotation.z = 0.35; phone.position.set(0.45, 1.1, wz + 0.42);
        const sun = spill(g, 2.2, 1.6, '#fff1c4', 0.3); sun.position.set(0.1, 1.9, wz + 0.02);
        const words = sign(g, 'good morning', { w: 1.6, h: 0.3, color: '#3a2a1c', weight: 800, lit: true });
        words.position.set(0, 1.75, wz + 0.03);
        const dust = motes(g, { box: [2, 1.6, 1], n: 26, power: 0.3 });
        return { st, words, dust, sill };
      },
      update({ st, words, dust }, t, k) {
        st.set(t); dust.set(t);
        const show = prog(t, kit.at('good') - 0.1, kit.at('good') + 0.5, ease.back);
        words.scale.setScalar(Math.max(0.001, show));
        words.material.opacity = Math.min(1, show);
        const dr = drift(t, 0.015);
        cam(dr.x + lerp(-0.25, 0.1, k), 1.9 + dr.y, lerp(4.3, 3.8, prog(t, 0, 1.2, ease.out)), 0, 1.2, -1.0, 32);
      },
    },
  };
};
