// The voice note: one scene per beat id. build(g) makes objects once; update(refs, t, k, d) poses them at time t.
// Your phone lives in cold, dark rooms; your parents' home is warm. The voice note is what crosses between them.
export default (kit) => {
  const { O, room, cam, drift, prog, ease, lerp, clamp, clay, cyl, spill, steam, motes } = kit;
  const AMBER = '#ffb35c';

  // A live voice waveform, used on your phone.
  const wave = (x, w, h, t, amp, y0) => {
    const n = 26, gap = w * 0.75 / n, bw = gap * 0.55, x0 = w * 0.125;
    x.fillStyle = AMBER;
    for (let i = 0; i < n; i++) {
      const v = 0.18 + 0.82 * Math.abs(Math.sin(t * 6.1 + i * 0.9) * Math.sin(t * 2.3 + i * 0.37));
      const bh = h * 0.16 * v * amp + h * 0.006;
      x.fillRect(x0 + i * gap, y0 - bh / 2, bw, bh);
    }
  };

  // The chat screen: a header, two old grey bubbles, and the mic button.
  const chat = (x, w, h, pulse, pressed, t, recK) => {
    x.fillStyle = '#0d0f14'; x.fillRect(0, 0, w, h);
    x.fillStyle = '#1b1f29'; x.fillRect(0, 0, w, h * 0.12);
    x.fillStyle = '#f4efe6'; x.font = `700 ${w * 0.09}px Inter`; x.textAlign = 'left'; x.textBaseline = 'middle';
    x.fillText('Mum & Dad', w * 0.08, h * 0.065);
    x.fillStyle = '#2a2f3b';
    x.fillRect(w * 0.08, h * 0.2, w * 0.55, h * 0.06);
    x.fillRect(w * 0.08, h * 0.29, w * 0.4, h * 0.06);
    x.fillStyle = '#8a8f9c'; x.font = `500 ${w * 0.05}px Inter`;
    x.fillText('call when free?', w * 0.11, h * 0.23);
    // Recording waveform grows across the middle once the button is held.
    if (recK > 0) {
      x.save(); x.beginPath(); x.rect(0, 0, w * (0.1 + 0.8 * recK), h); x.clip();
      wave(x, w, h * 1.2, t, 1, h * 0.55); x.restore();
    }
    const r = w * (0.12 + 0.02 * pulse) * (pressed ? 1.35 : 1);
    x.fillStyle = pressed ? AMBER : `rgba(255,179,92,${0.35 + 0.4 * pulse})`;
    x.beginPath(); x.arc(w / 2, h * 0.86, r, 0, Math.PI * 2); x.fill();
    // Simple mic glyph.
    x.fillStyle = '#0d0f14';
    x.fillRect(w / 2 - w * 0.025, h * 0.86 - w * 0.07, w * 0.05, w * 0.09);
    x.fillRect(w / 2 - w * 0.006, h * 0.86 + w * 0.03, w * 0.012, w * 0.035);
  };

  // The parents' phone: dark, then a voice message arrives.
  const home = (x, w, h, k) => {
    x.fillStyle = '#050506'; x.fillRect(0, 0, w, h);
    if (k <= 0) return;
    x.globalAlpha = k;
    x.fillStyle = '#1a1d24'; x.fillRect(0, 0, w, h);
    x.fillStyle = '#f4efe6'; x.textAlign = 'center'; x.textBaseline = 'middle';
    x.font = `600 ${w * 0.075}px Inter`; x.fillText('New voice message', w / 2, h * 0.3);
    x.fillStyle = AMBER; x.beginPath(); x.arc(w / 2, h * 0.5, w * 0.16, 0, Math.PI * 2); x.fill();
    x.fillStyle = '#1a1d24'; x.beginPath();
    x.moveTo(w / 2 - w * 0.05, h * 0.5 - w * 0.07); x.lineTo(w / 2 + w * 0.08, h * 0.5); x.lineTo(w / 2 - w * 0.05, h * 0.5 + w * 0.07); x.fill();
    x.globalAlpha = 1;
  };

  // The warm kitchen at home, shared by b4 and b6.
  const kitchen = (g) => {
    const r = room(g, 'sand', { keyPower: 150, fillPower: 0.8, wallZ: -2.6 });
    const table = O.table(g, { color: '#6b4a32' });
    const m1 = O.mug(g, { color: '#c9643f' }); m1.position.set(-0.95, table.top, 0.15);
    const m2 = O.mug(g, { color: '#e9e2d4' }); m2.position.set(-0.55, table.top, -0.3);
    const phone = O.phone(g, { power: 1.1, color: '#2b2b2e' });
    phone.rotation.x = -Math.PI / 2 + 0.02; phone.position.set(0.55, table.top + 0.04, 0.2);
    const p = O.pendant(g, 3.3, { power: 30, color: '#ffc27a', shadow: true });
    const glow = spill(g, 3.4, 2.2, '#ffd9a8', 0.45); glow.position.set(0, 2.1, r.wall.position.z + 0.05);
    const st = steam(g, { x: -0.95, y: table.top + 0.32, z: 0.15, height: 0.7, power: 0.5 });
    return { r, phone, p, glow, st };
  };

  return {
    b1: {
      build(g) {
        room(g, 'ink', { keyPower: 46, angle: 0.36, keyX: -0.8, keyZ: 2.6 });
        const table = O.table(g, { color: '#2c2019' });
        const phone = O.phone(g, { power: 1.2 }); phone.rotation.x = -Math.PI / 2 + 0.02; phone.position.set(0, table.top + 0.04, 0.1);
        return { phone };
      },
      update({ phone }, t) {
        // Motion from frame 0: the waveform is already moving and the phone buzzes.
        const quiet = prog(t, kit.at('parents'), kit.at('parents') + 0.5, ease.out);
        phone.screen.paint((x, w, h) => {
          x.fillStyle = '#07080a'; x.fillRect(0, 0, w, h);
          wave(x, w, h, t, 1 - quiet * 0.92, h * 0.5);
        });
        const buzz = (1 - quiet) * (Math.floor(t * 1.6) % 2 === 0 ? 1 - ((t * 1.6) % 1) : 0);
        phone.position.x = Math.sin(t * 95) * 0.02 * buzz;
        phone.rotation.z = Math.sin(t * 71) * 0.03 * buzz;
        const push = prog(t, 0, 2.2, ease.out), dr = drift(t, 0.012);
        cam(dr.x, lerp(5.2, 3.45, push) + dr.y, lerp(2.2, 1.3, push), 0, 1.02, 0.1, 30);
      },
    },
    b2: {
      build(g) {
        room(g, 'night', { keyPower: 70, fillPower: 0.6, keyX: 1.2, keyZ: 2.2 });
        const table = O.table(g, { color: '#33261c' });
        const phone = O.phone(g, { power: 1.15 }); phone.rotation.x = -Math.PI / 2 + 0.02; phone.position.set(0, table.top + 0.04, 0.1);
        phone.rotation.z = 0.12;
        return { phone };
      },
      update({ phone }, t, k) {
        const hit = kit.at('microphone');
        const pulse = 0.5 + 0.5 * Math.sin(t * 5);
        const boost = prog(t, hit, hit + 0.3, ease.back) * (1 - prog(t, hit + 0.6, hit + 1.2));
        phone.screen.paint((x, w, h) => chat(x, w, h, Math.max(pulse, boost), false, t, 0));
        // Top-down, rotating slowly: a new angle from b1.
        const dr = drift(t, 0.01);
        cam(dr.x + 0.05, 2.85 - k * 0.15, 0.25 + dr.y * 0.3, 0, 1.02, 0.12, 32);
      },
    },
    b3: {
      build(g) {
        const r = room(g, 'night', { keyPower: 220, fillPower: 0.75, keyX: 1.6, keyZ: 4.5, angle: 0.62, wallZ: -2.6 });
        const table = O.table(g, { color: '#3e2a1d' });
        const mug = O.mug(g); mug.position.set(-1.05, table.top, 0.25);
        const phone = O.phone(g, { power: 0 }); phone.rotation.x = Math.PI / 2; phone.position.set(-0.2, table.top + 0.05, 0.35);
        const books = [0, 1, 2, 3, 4, 5].map((i) => { const b = O.book(g, { color: ['#3f5e6b', '#7c4a3a', '#55624a', '#7a6a3f'][i % 4] }); b.position.set(0.75, table.top + i * 0.145, 0.05); b.rotation.y = (i % 3) * 0.14 - 0.14; return b; });
        const clock = O.clock(g, { r: 0.5 }); clock.position.set(0, 2.75, r.wall.position.z + 0.07);
        const dust = motes(g, { box: [4, 3.4, 2], n: 30 });
        return { books, clock, table, dust };
      },
      update({ books, clock, table, dust }, t, k) {
        dust.set(t);
        // On "later" the clock starts to run and the days stack up as books.
        const go = kit.at('later');
        books.forEach((b, i) => {
          const s = go + i * 0.28;
          const a = prog(t, s, s + 0.4, ease.drop);
          b.position.y = table.top + i * 0.145 + (1 - a) * 2.4;
          b.visible = t >= s;
        });
        clock.set(21 + prog(t, go, go + 2.5, ease.in) * 30);
        const dr = drift(t, 0.02);
        cam(dr.x + lerp(0.4, -0.1, k), 1.9 + dr.y, 8.8 - k * 0.6, 0, 1.6, 0, 28);
      },
    },
    b4: {
      build(g) { return kitchen(g); },
      update({ phone, p, glow, st }, t, k) {
        st.set(t);
        p.bulb.set(0.55);
        glow.set(0.8);
        phone.screen.paint((x, w, h) => home(x, w, h, 0));
        // Warm, slow, wide: a different home. Fast settle on frame 0 so it moves at once.
        const settle = prog(t, 0, 1.2, ease.out), dr = drift(t, 0.02);
        cam(lerp(1.2, 0.3, settle) + dr.x, 2.3 + dr.y, lerp(5.2, 4.4, settle) - k * 0.3, 0, 1.25, 0, 30);
      },
    },
    b5: {
      build(g) {
        room(g, 'ink', { keyPower: 60, fillPower: 0.35, keyX: -1, keyZ: 2.4 });
        // Your phone stands upright now, facing us, so the button is the whole frame.
        const phone = O.phone(g, { power: 1.2 }); phone.position.set(0, 1.55, 0); phone.rotation.x = -0.08;
        const stand = cyl(g, 0.3, 0.36, 0.05, clay('#22242c'), 0, 0.78, 0.02);
        return { phone, stand };
      },
      update({ phone }, t, k, d) {
        const hold = kit.at('hold');
        const pressed = t >= hold + 0.1;
        const rec = prog(t, hold + 0.1, d, ease.inOut);
        const pulse = 0.5 + 0.5 * Math.sin(t * 5);
        phone.screen.paint((x, w, h) => chat(x, w, h, pulse, pressed, t, rec));
        phone.position.y = 1.55 + Math.sin(t * 1.3) * 0.01;
        const dr = drift(t, 0.01), push = prog(t, 0, 1.0, ease.out);
        cam(dr.x, 1.55 + dr.y, lerp(4.2, 3.4, push) - k * 0.4, 0, 1.55, 0, 32);
      },
    },
    b6: {
      build(g) { return kitchen(g); },
      update({ r, phone, p, glow, st }, t, k) {
        st.set(t);
        const arrive = prog(t, kit.at('waiting'), kit.at('waiting') + 0.4, ease.out);
        phone.screen.paint((x, w, h) => home(x, w, h, arrive));
        const warm = prog(t, kit.at('waiting'), kit.at('waiting') + 1.6, ease.out);
        p.bulb.set(0.45 + 0.55 * warm);
        glow.set(0.5 + 0.5 * warm);
        r.key.intensity = 120 + warm * 80;
        // Start close on the dark phone, then pull back as the room warms.
        const back = prog(t, 0.4, 3.2, ease.inOut), dr = drift(t, 0.015);
        cam(lerp(0.55, 0.2, back) + dr.x, lerp(2.6, 2.4, back) + dr.y, lerp(1.5, 4.6, back), lerp(0.55, 0.1, back), lerp(1.02, 1.2, back), lerp(0.2, 0, back), 30);
        void clamp; void k;
      },
    },
  };
};
