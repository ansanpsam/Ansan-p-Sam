// The door you won't knock on. One scene per beat.
export default (kit) => {
  const { O, room, cam, drift, prog, ease, lerp, clamp, clay, glow, box, rbox, spill, steam, motes, THREE } = kit;
  const WARM = '#ffb866';

  // A doorway on the wall: the door, a warm glowing room behind it, and light on the floor.
  const doorway = (g, r, o = {}) => {
    const wz = r.wall.position.z;
    const behind = box(g, 1.6, 3.04, 0.02, glow(WARM, o.glow ?? 1.4), 0, 1.52, wz + 0.03);
    const door = O.door(g, { color: o.color ?? '#5a3d2b', frame: '#2a1d16', gap: 0.08 });
    door.position.set(0, 0, wz + 0.1);
    const under = spill(g, 2.4, 1.1, WARM, 0.7); under.rotation.x = -Math.PI / 2; under.position.set(0, 0.012, wz + 0.55);
    const floodWide = spill(g, 3.6, 5.5, WARM, 0.75); floodWide.rotation.x = -Math.PI / 2; floodWide.position.set(0.3, 0.014, wz + 2.6);
    floodWide.set(0);
    return { door, behind, under, floodWide, wz };
  };

  // Split Malayalam into whole letters so deleting never breaks a cluster.
  const seg = new Intl.Segmenter('ml', { granularity: 'grapheme' });
  const MSG = [...seg.segment('ഒരു help വേണമായിരുന്നു...')].map((s) => s.segment);

  const chat = (x, w, h, typed, caret) => {
    x.fillStyle = '#0d0f14'; x.fillRect(0, 0, w, h);
    // header
    x.fillStyle = '#181b23'; x.fillRect(0, 0, w, h * 0.12);
    x.fillStyle = '#3a3f4d'; x.beginPath(); x.arc(w * 0.13, h * 0.06, w * 0.055, 0, 7); x.fill();
    x.fillStyle = '#e8e8ea'; x.font = `700 ${w * 0.06}px Inter, "Noto Sans Malayalam"`; x.textAlign = 'left'; x.textBaseline = 'middle';
    x.fillText('Chettan', w * 0.23, h * 0.06);
    x.fillStyle = '#7d8290'; x.font = `500 ${w * 0.038}px Inter`; x.fillText('online', w * 0.23, h * 0.088);
    // an old message far up, so the chat feels real
    x.fillStyle = '#20242e'; rr(x, w * 0.06, h * 0.2, w * 0.5, h * 0.06, w * 0.03); x.fill();
    x.fillStyle = '#c9ccd4'; x.font = `500 ${w * 0.045}px Inter, "Noto Sans Malayalam"`; x.fillText('ok da 👍', w * 0.1, h * 0.23);
    // input box: big, two lines, so the words read on a phone
    const iy = h * 0.36, ih = h * 0.2;
    x.fillStyle = '#1d212b'; rr(x, w * 0.05, iy, w * 0.9, ih, w * 0.06); x.fill();
    x.strokeStyle = typed.length ? WARM : '#3a3f4d'; x.lineWidth = w * 0.01; rr(x, w * 0.05, iy, w * 0.9, ih, w * 0.06); x.stroke();
    const txt = typed.join('');
    const cut = 'ഒരു help'.length;
    const lines = txt ? [txt.slice(0, cut).trim(), txt.slice(cut).trim()].filter((l) => l) : ['Message'];
    x.font = `700 ${w * 0.085}px "Noto Sans Malayalam", Inter`; x.fillStyle = txt ? '#f3f3f3' : '#6c7180';
    lines.forEach((l, i) => x.fillText(l, w * 0.1, iy + ih * (0.32 + i * 0.38)));
    if (caret) { const last = lines[lines.length - 1]; const tw = txt ? x.measureText(last).width : 0; const ly = iy + ih * (0.32 + (lines.length - 1) * 0.38); x.fillStyle = WARM; x.fillRect(w * 0.1 + tw + w * 0.01, ly - ih * 0.14, w * 0.01, ih * 0.28); }
    // send button, dim
    x.fillStyle = typed.length ? '#3a2c1c' : '#232733'; x.beginPath(); x.arc(w * 0.84, iy + ih + h * 0.06, h * 0.035, 0, 7); x.fill();
    x.fillStyle = typed.length ? WARM : '#555b69'; x.beginPath(); const sy = iy + ih + h * 0.06; x.moveTo(w * 0.82, sy - h * 0.018); x.lineTo(w * 0.865, sy); x.lineTo(w * 0.82, sy + h * 0.018); x.fill();
  };
  function rr(x, a, b, w, h, r) { x.beginPath(); x.moveTo(a + r, b); x.arcTo(a + w, b, a + w, b + h, r); x.arcTo(a + w, b + h, a, b + h, r); x.arcTo(a, b + h, a, b, r); x.arcTo(a, b, a + w, b, r); x.closePath(); }

  return {
    // Hook: a closed door in a dark hall, light leaking under it. Fast push-in.
    b1: {
      build(g) {
        const r = room(g, 'night', { keyPower: 190, fillPower: 2.1, wallZ: -2, keyX: 1.5, keyZ: 4, angle: 0.5 });
        const dw = doorway(g, r, { color: '#7a5238' });
        const dust = motes(g, { box: [5, 3.4, 4], n: 90, color: '#ffd9a8', power: 0.55 });
        return { ...dw, dust };
      },
      update({ under, behind, dust }, t) {
        dust.set(t);
        // someone moves inside: the light under the door dips and returns
        const pass = Math.max(0, Math.sin(t * 3.2)) ** 2;
        under.set(1.25 - pass * 1.1);
        under.scale.set(1 + (1 - pass) * 0.6, 1 + (1 - pass) * 0.8, 1);
        behind.material.emissiveIntensity = 1.8 - pass * 1.5;
        const push = prog(t, 0, 3.0, ease.out), dr = drift(t, 0.02);
        const orbit = lerp(2.8, -0.9, prog(t, 0, 3.4, (x) => x));
        cam(dr.x + orbit, lerp(2.8, 1.15, push) + dr.y, lerp(18, 10.8, push), 0, 0.9, -2, 32);
        kit.camera.rotateZ(lerp(0.1, 0, push));
      },
    },
    // The excuses: a message typed, then deleted letter by letter.
    b2: {
      build(g) {
        room(g, 'ink', { keyPower: 46, angle: 0.36, keyX: -0.8, keyZ: 2.6 });
        const table = O.table(g, { color: '#2c2019' });
        const phone = O.phone(g, { power: 1.05 }); phone.rotation.x = -Math.PI / 2 + 0.02; phone.position.set(0, table.top + 0.04, 0.1);
        return { phone };
      },
      update({ phone }, t, k, d) {
        const exc = kit.at('excuse');
        const typedTo = Math.max(0.6, exc - 0.1);
        const tIn = prog(t, 0.05, typedTo, ease.inOut);
        const tOut = prog(t, exc + 0.3, Math.min(d - 0.4, exc + 3.2), ease.in);
        const n = Math.round(MSG.length * tIn * (1 - tOut));
        const caret = Math.floor(t * 2.4) % 2 === 0;
        phone.screen.paint((x, w, h) => chat(x, w, h, MSG.slice(0, n), caret));
        const dr = drift(t, 0.01);
        cam(dr.x + lerp(-0.2, 0.1, k), lerp(7.0, 6.3, prog(t, 0, 1.6, ease.out)) + dr.y, 1.15, 0, 1.02, 0.42, 30);
      },
    },
    // Carrying it alone: bricks keep landing on a chair, the stack leaning.
    b3: {
      build(g) {
        const r = room(g, 'clay', { keyPower: 120, fillPower: 0.35, wallZ: -2.4, keyX: -1.6, keyZ: 3.5, angle: 0.5 });
        const chair = O.chair(g, { color: '#3a2620' });
        const bricks = [...Array(8)].map((_, i) => { const b = O.brick(g, { color: ['#a8553a', '#93492f', '#b7623f'][i % 3] }); return b; });
        return { bricks, r };
      },
      update({ bricks }, t, k, d) {
        const span = Math.max(1.4, d - 0.6);
        bricks.forEach((b, i) => {
          const s = (i / bricks.length) * span, a = prog(t, s, s + 0.38, ease.drop);
          const lean = i * i * 0.0009;
          b.visible = t >= s;
          b.position.set(lean * 6 + (i % 2 ? 0.04 : -0.04), 0.87 + 0.11 + i * 0.222 + (1 - a) * 2.6, 0.05);
          b.rotation.y = (i % 2 ? 0.12 : -0.18) + i * 0.02;
          b.rotation.z = -lean * 2.5;
        });
        const dr = drift(t, 0.02);
        cam(dr.x + lerp(-0.7, -0.3, k), 1.45 + dr.y, lerp(9.0, 8.5, k), 0.05, 1.3, 0, 30);
      },
    },
    // It was never locked: low angle, the door cracks open on "push".
    b4: {
      build(g) {
        const r = room(g, 'night', { keyPower: 50, fillPower: 0.6, wallZ: -2, keyX: -1.5, keyZ: 4, angle: 0.5 });
        const dw = doorway(g, r, { glow: 1.1 });
        const lock = rbox(g, 0.16, 0.1, 0.05, 0.02, clay('#c9b27a', { metalness: 0.6, roughness: 0.35 }));
        return { ...dw, r, lock };
      },
      update({ door, under, floodWide, r, lock, wz }, t, k, d) {
        const pushAt = kit.at('തള്ളിയാൽ');
        const open = prog(t, pushAt, Math.min(d, pushAt + 1.2), ease.out);
        door.open(open * 0.28);
        // the latch: shown on the closed door, rides with it
        const h = door.hinge; const a = h.rotation.y;
        lock.position.set(-0.79 + Math.cos(a) * 1.42, 1.3, wz + 0.1 + 0.07 - Math.sin(a) * 1.42);
        lock.rotation.y = a;
        under.set(0.7 + open * 0.3);
        floodWide.set(open * 0.85);
        r.fill.intensity = 0.6 + open * 0.25;
        const dr = drift(t, 0.015);
        cam(dr.x + lerp(1.6, 1.2, k), 0.45 + dr.y, lerp(9.0, 8.4, k), 0, 0.8, wz, 34);
      },
    },
    // Behind the door: a warm room, two mugs steaming, a lamp on.
    b5: {
      build(g) {
        const r = room(g, 'sand', { keyPower: 150, fillPower: 0.75, wallZ: -2.6, keyX: 1.6, keyZ: 4.5, angle: 0.55 });
        const table = O.table(g, { color: '#6a4a33', w: 2.6 });
        const m1 = O.mug(g, { color: '#d8cbb3' }); m1.position.set(-0.45, table.top, 0.2);
        const m2 = O.mug(g, { color: '#b5654a' }); m2.position.set(0.45, table.top, 0.05);
        const s1 = steam(g, { x: -0.45, y: table.top + 0.34, z: 0.2, power: 0.16 });
        const s2 = steam(g, { x: 0.45, y: table.top + 0.34, z: 0.05, power: 0.16, seed: 4 });
        const p = O.pendant(g, 3.0, { power: 20, color: '#ffc27a' });
        const wallGlow = spill(g, 4, 3, '#ffcf96', 0.2); wallGlow.position.set(0, 2.2, r.wall.position.z + 0.05);
        const chair = O.chair(g, { color: '#4a3226' }); chair.position.set(1.7, 0, -0.6); chair.rotation.y = -0.6;
        return { s1, s2, p, table, m1, m2 };
      },
      update({ s1, s2, p }, t, k) {
        s1.set(t); s2.set(t + 1.3);
        p.bulb.set(0.85 + 0.03 * Math.sin(t * 3));
        // we arrive through the door: a slide in from the side
        const come = prog(t, 0, 1.6, ease.out), dr = drift(t, 0.015);
        cam(lerp(-2.4, 0.3, come) + dr.x, lerp(2.3, 2.0, come) + dr.y, lerp(7.2, 6.0, come) - k * 0.3, 0, 1.35, 0, 30);
      },
    },
    // Knock today: the door swings wide and warm light floods the hall.
    b6: {
      build(g) {
        const r = room(g, 'night', { keyPower: 50, fillPower: 0.6, wallZ: -2, keyX: 1.5, keyZ: 4, angle: 0.5 });
        const dw = doorway(g, r, { glow: 0.9 });
        const dust = motes(g, { box: [3, 3, 3], n: 30, color: '#ffd9a8', power: 0.35 });
        return { ...dw, r, dust };
      },
      update({ door, under, floodWide, behind, r, dust }, t, k, d) {
        dust.set(t);
        const knockAt = kit.at('knock');
        // a tiny shake on the knock, then it opens
        const shake = t > knockAt && t < knockAt + 0.3 ? Math.sin((t - knockAt) * 60) * 0.006 * (1 - (t - knockAt) / 0.3) : 0;
        const open = prog(t, knockAt + 0.35, knockAt + 2.2, ease.inOut);
        door.open(0.03 + open * 0.75);
        door.position.x = shake;
        under.set(0.8 + open * 0.2);
        floodWide.set(0.2 + open * 0.8);
        behind.material.emissiveIntensity = lerp(0.9, 1.15, open);
        r.fill.intensity = 0.6 + open * 0.5;
        r.key.intensity = 50 + open * 40;
        const dr = drift(t, 0.015);
        cam(dr.x + lerp(-0.4, 0, k), 1.15 + dr.y, lerp(10.4, 9.2, prog(t, 0, d, ease.inOut)), 0, 0.85, -2, 32);
      },
    },
  };
};
