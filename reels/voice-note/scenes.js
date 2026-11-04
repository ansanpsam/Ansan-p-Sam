// The voice note: one scene per beat id. build(g) makes objects once; update(refs, t, k, d) poses them at time t.
// Your phone lives in cold, dark rooms; your parents' home is warm. The voice note is what crosses between them.
export default (kit) => {
  const { O, room, drift, prog, ease, lerp, clamp, clay, cyl, spill, steam, motes } = kit;
  const AMBER = '#ffb35c';
  // Every camera call sets its own up vector, so frames stay pure functions of time.
  const cam = (...a) => { kit.camera.up.set(0, 1, 0); kit.cam(...a); };
  const camRoll = (roll, ...a) => { kit.camera.up.set(Math.sin(roll), 0, -Math.cos(roll)); kit.cam(...a); };

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

  // A microphone glyph: capsule, cradle arc and stem.
  const mic = (x, cx, cy, s, col) => {
    x.fillStyle = col; x.strokeStyle = col; x.lineWidth = s * 0.12; x.lineCap = 'round';
    const cw = s * 0.42, ch = s * 0.78;
    x.beginPath(); x.roundRect(cx - cw / 2, cy - ch * 0.75, cw, ch, cw / 2); x.fill();
    x.beginPath(); x.arc(cx, cy - ch * 0.15, s * 0.42, 0.1, Math.PI - 0.1); x.stroke();
    x.beginPath(); x.moveTo(cx, cy + s * 0.27); x.lineTo(cx, cy + s * 0.5); x.stroke();
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
    mic(x, w / 2, h * 0.86, r * 0.62, '#0d0f14');
  };

  // The parents' phone: dark, then a voice message arrives.
  const home = (x, w, h, k) => {
    x.fillStyle = '#050506'; x.fillRect(0, 0, w, h);
    if (k <= 0) return;
    x.globalAlpha = k;
    x.fillStyle = '#1a1d24'; x.fillRect(0, 0, w, h);
    x.fillStyle = '#f4efe6'; x.textAlign = 'center'; x.textBaseline = 'middle';
    x.font = `700 ${w * 0.095}px Inter`; x.fillText('Voice message', w / 2, h * 0.28);
    x.font = `500 ${w * 0.07}px Inter`; x.fillStyle = '#b9b3a8'; x.fillText('from you', w / 2, h * 0.35);
    x.fillStyle = AMBER; x.beginPath(); x.arc(w / 2, h * 0.52, w * 0.2, 0, Math.PI * 2); x.fill();
    x.fillStyle = '#1a1d24'; x.beginPath();
    x.moveTo(w / 2 - w * 0.06, h * 0.52 - w * 0.09); x.lineTo(w / 2 + w * 0.1, h * 0.52); x.lineTo(w / 2 - w * 0.06, h * 0.52 + w * 0.09); x.fill();
    x.globalAlpha = 1;
  };

  // The warm kitchen at home, shared by b4 and b6. The parents' phone sits front and centre.
  const kitchen = (g) => {
    const r = room(g, 'sand', { keyPower: 85, fillPower: 0.7, wallZ: -2.4, keyX: 1.4, keyZ: 3.2 });
    const table = O.table(g, { color: '#6b4a32' });
    const m1 = O.mug(g, { color: '#c9643f' }); m1.position.set(-0.8, table.top, -0.25);
    const m2 = O.mug(g, { color: '#e9e2d4' }); m2.position.set(-0.35, table.top, -0.55);
    const phone = O.phone(g, { power: 1.1, color: '#2b2b2e' });
    phone.rotation.x = -Math.PI / 2 + 0.02; phone.rotation.z = -0.12; phone.position.set(0.25, table.top + 0.04, 0.3);
    const p = O.pendant(g, 3.6, { power: 16, color: '#ffc27a', shadow: true }); p.position.x = -0.4;
    const glow = spill(g, 3.4, 2.2, '#ffd9a8', 0.35); glow.position.set(0, 2.1, r.wall.position.z + 0.05);
    const st = steam(g, { x: -0.8, y: table.top + 0.32, z: -0.25, height: 0.7, power: 0.5 });
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
          wave(x, w, h * 1.9, t * 1.3, 1 - quiet * 0.92, h * 0.5);
        });
        const buzz = (1 - quiet) * (Math.floor(t * 1.6) % 2 === 0 ? 1 - ((t * 1.6) % 1) : 0);
        phone.position.x = Math.sin(t * 95) * 0.02 * buzz;
        phone.rotation.z = Math.sin(t * 71) * 0.03 * buzz;
        // Fast push-in from high above; the target sits nearer the camera than the phone so it rides above the caption.
        const push = prog(t, 0, 1.4, ease.out), dr = drift(t, 0.012);
        camRoll(lerp(0.35, 0, push), dr.x, lerp(12.5, 6.6, push) + dr.y, lerp(4.2, 2.3, push), 0, 1.02, 0.42, 30);
      },
    },
    b2: {
      build(g) {
        room(g, 'night', { keyPower: 80, fillPower: 0.7, keyX: 1.2, keyZ: 2.2 });
        const table = O.table(g, { color: '#33261c' });
        const phone = O.phone(g, { power: 1.2 }); phone.rotation.x = -Math.PI / 2 + 0.02; phone.position.set(0, table.top + 0.04, 0.1);
        phone.rotation.z = 0.18;
        return { phone };
      },
      update({ phone }, t, k) {
        const hit = kit.at('microphone');
        const pulse = 0.5 + 0.5 * Math.sin(t * 5);
        const boost = prog(t, hit, hit + 0.3, ease.back) * (1 - prog(t, hit + 0.6, hit + 1.2));
        phone.screen.paint((x, w, h) => chat(x, w, h, Math.max(pulse, boost), false, t, 0));
        // A lower three-quarter angle, sliding sideways: a new angle from b1.
        const dr = drift(t, 0.012), slide = prog(t, 0, 1.2, ease.out);
        cam(lerp(1.2, 0.6, slide) + dr.x, 2.85 + dr.y, 3.45 - k * 0.25, 0, 0.8, 0.2, 32);
      },
    },
    b3: {
      build(g) {
        const r = room(g, 'night', { keyPower: 220, fillPower: 1.1, keyX: 1.6, keyZ: 4.5, angle: 0.62, wallZ: -2.6 });
        const table = O.table(g, { color: '#3e2a1d' });
        const mug = O.mug(g); mug.position.set(-0.9, table.top, 0.25);
        const phone = O.phone(g, { power: 0 }); phone.rotation.x = Math.PI / 2; phone.position.set(-0.25, table.top + 0.05, 0.35); phone.rotation.z = 0.3;
        const books = [0, 1, 2, 3, 4, 5].map((i) => { const b = O.book(g, { color: ['#3f5e6b', '#7c4a3a', '#55624a', '#7a6a3f'][i % 4] }); b.position.set(0.5, table.top + i * 0.145, 0.05); b.rotation.y = (i % 3) * 0.14 - 0.14; return b; });
        const clock = O.clock(g, { r: 0.5 }); clock.position.set(0, 2.75, r.wall.position.z + 0.07);
        const dust = motes(g, { box: [4, 3.4, 2], n: 30 });
        return { books, clock, table, dust };
      },
      update({ books, clock, table, dust }, t, k) {
        dust.set(t);
        // On "later" the clock starts to run and the days stack up as books.
        const go = kit.at('later');
        books.forEach((b, i) => {
          const s = go + i * 0.19;
          const a = prog(t, s, s + 0.32, ease.drop);
          b.position.y = table.top + i * 0.145 + (1 - a) * 2.4;
          b.visible = t >= s;
        });
        clock.set(21 + prog(t, 0, go + 2.5, ease.in) * 30);
        const dr = drift(t, 0.02);
        cam(dr.x + lerp(0.5, -0.1, k), 1.9 + dr.y, lerp(9.4, 8.6, prog(t, 0, 0.8, ease.out)) - k * 0.4, 0, 1.3, 0, 28);
      },
    },
    b4: {
      build(g) { return kitchen(g); },
      update({ phone, p, glow, st }, t, k) {
        st.set(t);
        p.bulb.set(0.5);
        glow.set(0.7);
        phone.screen.paint((x, w, h) => home(x, w, h, 0));
        // Warm, slow, wide: a different home. Fast settle on frame 0 so it moves at once.
        const settle = prog(t, 0, 1.2, ease.out), dr = drift(t, 0.02);
        cam(lerp(2.0, 1.1, settle) + dr.x, 3.4 + dr.y, lerp(6.4, 5.4, settle) - k * 0.3, -0.15, 0.72, -0.05, 32);
      },
    },
    b5: {
      build(g) {
        room(g, 'ink', { keyPower: 70, fillPower: 0.45, keyX: -1, keyZ: 2.4 });
        const table = O.table(g, { color: '#2a2320' });
        // Your phone stands upright now, facing us, so the button is the whole frame.
        const phone = O.phone(g, { power: 1.2 }); phone.position.set(0, table.top + 0.8, 0.2); phone.rotation.x = -0.08;
        cyl(g, 0.3, 0.36, 0.05, clay('#22242c'), 0, table.top + 0.025, 0.25);
        return { phone };
      },
      update({ phone }, t, k, d) {
        const hold = kit.at('hold');
        const pressed = t >= hold + 0.1;
        const rec = prog(t, hold + 0.1, d, ease.inOut);
        const pulse = 0.5 + 0.5 * Math.sin(t * 5);
        phone.screen.paint((x, w, h) => chat(x, w, h, pulse, pressed, t, rec));
        const dr = drift(t, 0.01), push = prog(t, 0, 1.0, ease.out);
        cam(dr.x, 1.75 + dr.y, lerp(6.6, 5.7, push) - k * 0.3, 0, 1.47, 0.2, 32);
      },
    },
    b6: {
      build(g) { return kitchen(g); },
      update({ r, phone, p, glow, st }, t, k) {
        st.set(t);
        const arrive = prog(t, kit.at('waiting'), kit.at('waiting') + 0.4, ease.out);
        phone.screen.paint((x, w, h) => home(x, w, h, arrive));
        const warm = prog(t, kit.at('waiting'), kit.at('waiting') + 1.6, ease.out);
        p.bulb.set(0.35 + 0.45 * warm);
        glow.set(0.4 + 0.5 * warm);
        r.key.intensity = 60 + warm * 50;
        // Overhead on the waiting phone, easing back as the room warms.
        const back = prog(k, 0, 1, ease.inOut), dr = drift(t, 0.015);
        cam(lerp(0.3, 0.7, back) + dr.x, lerp(7.2, 6.3, back) + dr.y, lerp(2.5, 4.6, back), lerp(0.25, 0.1, back), 1.0, lerp(0.74, 0.62, back), 30);
        void clamp;
      },
    },
  };
};
