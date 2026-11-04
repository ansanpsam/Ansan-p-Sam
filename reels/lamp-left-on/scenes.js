// The lamp left on: rest is not laziness. One scene per beat.
export default (kit) => {
  const { THREE, O, room, cam, drift, prog, ease, lerp, clamp, clay, metal, glow, add, box, rbox, sphere, cyl, panel, sign, spill, motes, toScreen } = kit;

  // A desk lamp: round base, upright stem, an arm reaching forward and a shade hanging down over the desk.
  // lamp.set(k) runs from 0 (off) to 1 (fully lit).
  const deskLamp = (g, o = {}) => {
    const L = new THREE.Group(); g.add(L);
    const body = clay(o.color ?? '#2f3a36', { roughness: 0.45 });
    const brass = metal('#b08a52');
    cyl(L, 0.2, 0.24, 0.06, body, 0, 0.03, 0);
    cyl(L, 0.022, 0.022, 0.95, brass, 0, 0.5, 0, 16);
    sphere(L, 0.04, brass, 0, 0.98, 0);
    const arm = cyl(L, 0.02, 0.02, 0.5, brass, 0.25, 0.98, 0, 16); arm.rotation.z = Math.PI / 2;
    // Open shade, so the glowing bulb shows underneath.
    const shadeMat = clay(o.shade ?? '#3c5a4f', { roughness: 0.5, side: THREE.DoubleSide });
    const shade = add(L, new THREE.CylinderGeometry(0.07, 0.25, 0.3, 48, 1, true), shadeMat, 0.5, 0.86, 0);
    const color = o.glow ?? '#ffcf8a';
    const bulb = sphere(L, 0.075, glow(color, 0), 0.5, 0.78, 0); bulb.castShadow = false;
    const spot = new THREE.SpotLight(color, 0, 0, 0.75, 0.6, 1.6);
    spot.position.set(0.5, 0.82, 0); spot.target.position.set(0.5, -1, 0);
    spot.castShadow = true; spot.shadow.mapSize.set(1024, 1024); spot.shadow.bias = -0.001;
    L.add(spot, spot.target);
    const halo = new THREE.PointLight(color, 0, 0, 1.8); halo.position.set(0.5, 0.95, 0.25); L.add(halo);
    const pool = spill(L, 1.6, 1.0, color, o.pool ?? 0.55); pool.rotation.x = -Math.PI / 2; pool.position.set(0.5, 0.006, 0);
    L.set = (k) => {
      bulb.material.emissiveIntensity = k * (o.core ?? 7);
      spot.intensity = k * (o.power ?? 26);
      halo.intensity = k * (o.halo ?? 1.6);
      pool.set(k);
    };
    L.set(o.on ?? 1);
    L.bulbPos = [0.5, 0.78, 0];
    return L;
  };

  // A small hum flicker: dips for a moment, pure function of t.
  const flick = (t, at, len = 0.18) => (t > at && t < at + len ? 0.35 + 0.3 * Math.abs(Math.sin((t - at) * 60)) : 1);

  return {
    b1: {
      build(g) {
        room(g, 'ink', { keyPower: 30, fillPower: 0.35, angle: 0.4, keyX: -1.2, keyZ: 3, wallZ: -2.2 });
        const table = O.table(g, { color: '#3a281b' });
        const lamp = deskLamp(g); lamp.position.set(-0.4, table.top, -0.15);
        const book = O.book(g, { color: '#6d3d31' }); book.position.set(0.75, table.top, 0.2); book.rotation.y = 0.25;
        const glowWall = spill(g, 3.2, 2.4, '#ffbe73', 0.35); glowWall.position.set(0.1, 2.1, -2.15);
        const dust = motes(g, { box: [2.4, 2.2, 1.6], n: 26 });
        return { lamp, dust };
      },
      update({ lamp, dust }, t) {
        dust.set(t);
        // Flickers right away, then once more on "off".
        lamp.set(Math.min(flick(t, 0.08, 0.22), flick(t, kit.at('off'), 0.2)));
        const push = prog(t, 0, 2.2, ease.out), d = drift(t, 0.015);
        cam(d.x + lerp(0.6, 0.2, push), lerp(2.8, 2.15, push) + d.y, lerp(6.8, 5.0, push), 0.1, 1.3, -0.1, 30);
      },
    },

    b2: {
      build(g) {
        const r = room(g, 'night', { keyPower: 70, fillPower: 0.7, keyX: 1.5, keyZ: 4, wallZ: -1.8 });
        const table = O.table(g, { color: '#4a3324' });
        const lamp = deskLamp(g, { power: 12, pool: 0.35 }); lamp.position.set(-1.35, table.top, -0.35);
        // Laptop: a base and an open screen.
        const lap = new THREE.Group(); g.add(lap); lap.position.set(0.05, table.top, 0);
        rbox(lap, 1.1, 0.04, 0.72, 0.02, metal('#7d8088'), 0, 0.02, 0);
        const lid = new THREE.Group(); lap.add(lid); lid.position.set(0, 0.04, -0.36); lid.rotation.x = -0.22;
        rbox(lid, 1.1, 0.7, 0.03, 0.02, metal('#7d8088'), 0, 0.35, -0.016);
        const screen = panel(lid, 1.02, 0.62, (x, w, h) => {
          const gr = x.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#2a4f86'); gr.addColorStop(1, '#13253f');
          x.fillStyle = gr; x.fillRect(0, 0, w, h);
          x.fillStyle = 'rgba(255,255,255,0.75)';
          for (let i = 0; i < 6; i++) x.fillRect(w * 0.1, h * (0.16 + i * 0.12), w * (0.3 + ((i * 37) % 5) * 0.1), h * 0.04);
        }, { power: 0.9 });
        screen.position.set(0, 0.35, 0.001);
        const mug = O.mug(g, { color: '#d8cfc0' }); mug.position.set(0.95, table.top, 0.35);
        // The unfinished list.
        const list = panel(g, 0.5, 0.66, (x, w, h) => {
          x.fillStyle = '#cfc6b4'; x.fillRect(0, 0, w, h);
          x.strokeStyle = '#3a3a3a'; x.lineWidth = w * 0.012;
          for (let i = 0; i < 6; i++) {
            const y = h * (0.15 + i * 0.13);
            x.strokeRect(w * 0.1, y - h * 0.035, w * 0.08, w * 0.08);
            if (i < 2) { x.beginPath(); x.moveTo(w * 0.11, y); x.lineTo(w * 0.14, y + h * 0.03); x.lineTo(w * 0.19, y - h * 0.04); x.stroke(); }
            x.fillStyle = '#555'; x.fillRect(w * 0.26, y - h * 0.01, w * (0.4 + (i % 3) * 0.1), h * 0.02);
          }
        }, { lit: true });
        list.rotation.x = -Math.PI / 2; list.rotation.z = 0.2; list.position.set(-0.45, table.top + 0.01, 0.35);
        const clock = O.clock(g, { r: 0.36 }); clock.position.set(0.55, 2.55, r.wall.position.z + 0.06);
        const dust = motes(g, { box: [4, 3, 2], n: 24 });
        return { lamp, mug, list, lap, clock, dust };
      },
      update({ lamp, mug, list, lap, clock, dust }, t, k, d) {
        dust.set(t);
        lamp.set(1);
        // Each thing gives a small hop as it's named.
        const hop = (w) => { const a = kit.at(w); return Math.sin(clamp((t - a) / 0.35) * Math.PI) * 0.08; };
        lap.position.y = 1.01 + hop('laptop');
        mug.position.y = 1.01 + hop('tea');
        list.position.y = 1.02 + hop('list');
        clock.set(23.2 + k * 1.6);
        const dr = drift(t, 0.02);
        cam(lerp(-0.5, 0.4, k) + dr.x, 2.9 + dr.y, 6.9 - k * 0.6, lerp(-0.35, 0.2, k), 1.3, -0.2, 31);
      },
    },

    b3: {
      build(g) {
        const r = room(g, 'sand', { keyPower: 60, fillPower: 0.5, wallZ: -1.2, keyX: 0, keyZ: 4 });
        const table = O.table(g, { color: '#5b3a25', w: 2.2, d: 1.2 });
        const lamp = deskLamp(g, { power: 30, pool: 0.4 }); lamp.position.set(-0.45, table.top, -0.25);
        const glowWall = spill(g, 3, 2.4, '#ffbf78', 0.45); glowWall.position.set(0, 2, r.wall.position.z + 0.03);
        const word = sign(g, 'LAZY', { w: 1.5, h: 0.6, size: 0.8, color: '#b3261e', weight: 900 });
        word.position.set(0, 2.35, r.wall.position.z + 0.05);
        return { lamp, word };
      },
      update({ lamp, word }, t, k) {
        lamp.set(1);
        const a = kit.at('lazy');
        const s = prog(t, a, a + 0.22, ease.drop);
        word.visible = t >= a;
        const sc = lerp(1.9, 1, s); word.scale.set(sc, sc, 1);
        word.material.opacity = s;
        // Small shake when it lands.
        const shake = t > a + 0.22 && t < a + 0.5 ? Math.sin(t * 90) * 0.02 * (1 - (t - a - 0.22) / 0.28) : 0;
        const dr = drift(t, 0.015);
        cam(dr.x + shake, 2.0 + dr.y, lerp(5.6, 5.1, k), 0, 1.45, 0, 32);
      },
    },

    b4: {
      build(g) {
        room(g, 'night', { keyPower: 40, fillPower: 1.5, wallZ: -2.2 });
        const p = O.pendant(g, 3, { power: 16, core: 9, color: '#ffb066', shadow: true });
        const halo = spill(g, 2.6, 2.6, '#ffb066', 0.5); halo.position.set(0, 2.2, -2.15);
        return { p, halo };
      },
      update({ p, halo }, t, k, d) {
        const out = kit.at('out');
        // Fades from the start, stutters harder as it goes, then dies on "out".
        const base = lerp(1, 0.35, prog(t, 0, out, ease.in));
        const stutter = Math.sin(t * 23) * Math.sin(t * 7.1) > 0.55 - k * 0.5 ? 0.45 : 1;
        const lvl = t >= out ? Math.max(0, 0.3 * (1 - (t - out) / 0.25)) * (Math.floor(t * 20) % 2) : base * stutter;
        p.bulb.set(lvl);
        halo.set(lvl);
        const dr = drift(t, 0.02);
        cam(dr.x, 2.05 + dr.y, lerp(4.6, 3.4, prog(t, 0, d, ease.inOut)), 0, 2.15, 0, 30);
      },
    },

    b5: {
      build(g) {
        const r = room(g, 'night', { keyPower: 45, fillPower: 0.75, wallZ: -1.6, keyX: -1, keyZ: 4 });
        const table = O.table(g, { color: '#4a3324', w: 2.6 });
        const lamp = deskLamp(g, { power: 26 }); lamp.position.set(0.55, table.top, -0.2); lamp.rotation.y = Math.PI;
        const wz = r.wall.position.z;
        // A window that goes from night to sunrise.
        const frame = clay('#e6dccb');
        box(g, 1.3, 0.07, 0.08, frame, -0.15, 2.75, wz + 0.05); box(g, 1.3, 0.07, 0.08, frame, -0.15, 1.85, wz + 0.05);
        box(g, 0.07, 0.97, 0.08, frame, -0.8, 2.3, wz + 0.05); box(g, 0.07, 0.97, 0.08, frame, 0.5, 2.3, wz + 0.05);
        box(g, 0.05, 0.9, 0.05, frame, -0.15, 2.3, wz + 0.06);
        let dawn = 0;
        const sky = panel(g, 1.24, 0.86, (x, w, h) => {
          const gr = x.createLinearGradient(0, 0, 0, h);
          const mix = (a, b) => a.map((v, i) => Math.round(lerp(v, b[i], dawn)));
          const top = mix([12, 20, 46], [120, 170, 220]), bot = mix([24, 34, 70], [255, 196, 130]);
          gr.addColorStop(0, `rgb(${top})`); gr.addColorStop(1, `rgb(${bot})`);
          x.fillStyle = gr; x.fillRect(0, 0, w, h);
          if (dawn > 0) { x.fillStyle = `rgba(255,236,190,${dawn})`; x.beginPath(); x.arc(w * 0.66, h * (1.05 - dawn * 0.35), w * 0.09, 0, 6.29); x.fill(); }
        }, { power: 0.9, px: 300 });
        sky.position.set(-0.15, 2.3, wz + 0.02);
        const sun = spill(g, 3.4, 2.4, '#ffc58a', 0.6); sun.position.set(0.2, 1.7, wz + 0.04);
        const sunLight = new THREE.DirectionalLight('#ffd2a0', 0); sunLight.position.set(-2, 4, 3); g.add(sunLight);
        return { lamp, sky, sun, sunLight, r, setDawn: (v) => { dawn = v; } };
      },
      update({ lamp, sky, sun, sunLight, r, setDawn }, t, k, d) {
        const dawn = prog(t, kit.at('back'), kit.atEnd('tomorrow') + 0.4, ease.inOut);
        setDawn(dawn); sky.paint();
        sun.set(dawn);
        sunLight.intensity = dawn * 1.6;
        r.fill.intensity = 0.75 + dawn * 0.5;
        const off = kit.at('switch') + 0.05;
        lamp.set(t < off ? 1 : 0);
        const dr = drift(t, 0.015);
        cam(dr.x + lerp(0.35, -0.15, k), 2.1 + dr.y, 7.0 - k * 0.6, -0.05, 1.47, -0.3, 31);
      },
    },

    b6: {
      build(g) {
        room(g, 'night', { keyPower: 20, fillPower: 0.9, wallZ: -0.5, wallColor: '#262d44' });
        const wins = [];
        const frame = clay('#3a425c');
        for (let row = 0; row < 4; row++) for (let col = 0; col < 3; col++) {
          const x = (col - 1) * 1.15, y = 1.0 + row * 1.25;
          const me = row === 1 && col === 1;
          let lit = 1;
          const w = panel(g, 0.8, 0.95, (c, W, H) => {
            const gr = c.createLinearGradient(0, 0, 0, H);
            gr.addColorStop(0, me ? '#ffd38c' : '#ffcf8f'); gr.addColorStop(1, me ? '#e7964a' : '#d9904e');
            c.fillStyle = '#0d1222'; c.fillRect(0, 0, W, H);
            c.globalAlpha = lit; c.fillStyle = gr; c.fillRect(0, 0, W, H); c.globalAlpha = 1;
            if (me) { // the lamp, seen through the glass
              c.fillStyle = '#3b2a1a'; c.fillRect(W * 0.2, H * 0.84, W * 0.6, H * 0.05);
              c.fillRect(W * 0.38, H * 0.48, W * 0.03, H * 0.36); c.fillRect(W * 0.38, H * 0.46, W * 0.22, H * 0.03);
              c.beginPath(); c.moveTo(W * 0.54, H * 0.47); c.lineTo(W * 0.7, H * 0.47); c.lineTo(W * 0.76, H * 0.6); c.lineTo(W * 0.48, H * 0.6); c.fill();
              c.fillStyle = '#fff4d6'; c.beginPath(); c.arc(W * 0.62, H * 0.63, W * 0.05, 0, 6.29); c.fill();
            }
          }, { power: 1.0, px: 260 });
          w.position.set(x, y, -0.45);
          box(g, 0.9, 0.06, 0.06, frame, x, y - 0.5, -0.43); box(g, 0.9, 0.06, 0.06, frame, x, y + 0.5, -0.43);
          wins.push({ w, me, order: (row * 3 + col * 7) % 11, set: (v) => { lit = v; } });
        }
        return { wins };
      },
      update({ wins }, t, k, d) {
        const still = kit.at('still');
        wins.forEach((o) => {
          if (o.me) { o.set(1); o.w.paint(); return; }
          // The other windows go dark one after another, ending by "still".
          const when = (o.order / 11) * still * 0.9;
          o.set(t < when ? 1 : Math.max(0, 1 - (t - when) / 0.15));
          o.w.paint();
        });
        const dr = drift(t, 0.02);
        const push = prog(t, 0, d, ease.inOut);
        cam(dr.x, lerp(3.2, 2.35, push) + dr.y, lerp(9.5, 5.6, push), 0, lerp(2.7, 1.9, push), -0.5, 30);
      },
    },
  };
};
