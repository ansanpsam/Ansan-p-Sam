// Social battery: phone battery vs your social battery. One scene per beat id.
// Not yet rendered: positions follow the kit's documented scale and need a --stills beats pass.
export default (kit) => {
  const { O, room, cam, drift, prog, ease, lerp, clamp, clay, glass, glow, rbox, cyl, sphere, panel, spill, motes } = kit;

  // Phone screen: big percent, a battery bar, optional warning banner sliding from the top.
  const battery = (x, w, h, pct, color, banner = 0) => {
    x.fillStyle = '#07080a'; x.fillRect(0, 0, w, h);
    x.fillStyle = color; x.textAlign = 'center'; x.textBaseline = 'middle';
    x.font = `800 ${w * 0.28}px Inter`; x.fillText(`${Math.round(pct)}%`, w / 2, h * 0.44);
    const bw = w * 0.58, bh = h * 0.08, bx = (w - bw) / 2, by = h * 0.57;
    x.strokeStyle = '#f2f2f2'; x.lineWidth = w * 0.012; x.strokeRect(bx, by, bw, bh);
    x.fillStyle = '#f2f2f2'; x.fillRect(bx + bw + w * 0.012, by + bh * 0.28, w * 0.022, bh * 0.44);
    x.fillStyle = color; x.fillRect(bx + w * 0.018, by + w * 0.018, Math.max((bw - w * 0.036) * (pct / 100), w * 0.012), bh - w * 0.036);
    if (banner > 0) {
      const y = lerp(-h * 0.16, h * 0.05, banner);
      x.fillStyle = '#26282d'; x.beginPath(); x.roundRect(w * 0.06, y, w * 0.88, h * 0.13, w * 0.05); x.fill();
      x.fillStyle = '#ff453a'; x.font = `700 ${w * 0.07}px Inter`; x.textAlign = 'left';
      x.fillText('Low Battery', w * 0.12, y + h * 0.045);
      x.fillStyle = '#d6d6d6'; x.font = `500 ${w * 0.055}px Inter`;
      x.fillText('Plug in soon', w * 0.12, y + h * 0.095);
    }
  };

  // A wall-sized battery for the person: green to red, no warning.
  const bigBattery = (x, w, h, pct) => {
    x.clearRect(0, 0, w, h);
    const col = pct > 50 ? '#39d36b' : pct > 22 ? '#f2b33d' : '#ff3b30';
    const bx = w * 0.08, by = h * 0.18, bw = w * 0.78, bh = h * 0.64;
    x.strokeStyle = '#efe6d8'; x.lineWidth = h * 0.06; x.strokeRect(bx, by, bw, bh);
    x.fillStyle = '#efe6d8'; x.fillRect(bx + bw + h * 0.03, by + bh * 0.3, w * 0.05, bh * 0.4);
    x.fillStyle = col; x.fillRect(bx + h * 0.07, by + h * 0.07, Math.max((bw - h * 0.14) * pct / 100, h * 0.04), bh - h * 0.14);
  };

  // Chat bubbles, for the invitations.
  const chats = ['Dinner Friday?', 'Drinks after?', 'Brunch Sunday?', 'Just one more!', 'You coming?'];
  const inbox = (x, w, h, n, stamp) => {
    x.fillStyle = '#101216'; x.fillRect(0, 0, w, h);
    x.textBaseline = 'middle'; x.textAlign = 'left'; x.font = `600 ${w * 0.075}px Inter`;
    for (let i = 0; i < chats.length; i++) {
      const a = clamp(n - i, 0, 1);
      if (a <= 0) continue;
      const y = h * (0.1 + i * 0.15) + (1 - a) * h * 0.04;
      x.globalAlpha = a;
      x.fillStyle = '#2f3440'; x.beginPath(); x.roundRect(w * 0.07, y, w * 0.74, h * 0.105, w * 0.05); x.fill();
      x.fillStyle = '#f4f4f4'; x.fillText(chats[i], w * 0.12, y + h * 0.053);
    }
    x.globalAlpha = 1;
    if (stamp > 0) {
      x.save(); x.translate(w / 2, h * 0.55); x.rotate(-0.22); const s = lerp(1.8, 1, stamp); x.scale(s, s);
      x.globalAlpha = Math.min(1, stamp * 2);
      x.strokeStyle = '#7CF29A'; x.lineWidth = w * 0.025; x.strokeRect(-w * 0.3, -h * 0.07, w * 0.6, h * 0.14);
      x.fillStyle = '#7CF29A'; x.textAlign = 'center'; x.font = `900 ${w * 0.2}px Inter`; x.fillText('YES', 0, h * 0.005);
      x.restore();
    }
  };

  // Heart-shaped battery for the last beat.
  const heart = (x, w, h, fill) => {
    x.fillStyle = '#07080a'; x.fillRect(0, 0, w, h);
    const path = () => {
      x.beginPath();
      const cx = w / 2, cy = h * 0.42, s = w * 0.32;
      x.moveTo(cx, cy + s * 0.9);
      x.bezierCurveTo(cx - s * 1.5, cy - s * 0.1, cx - s * 0.7, cy - s * 1.2, cx, cy - s * 0.45);
      x.bezierCurveTo(cx + s * 0.7, cy - s * 1.2, cx + s * 1.5, cy - s * 0.1, cx, cy + s * 0.9);
      x.closePath();
    };
    x.save(); path(); x.clip();
    const top = h * 0.42 + w * 0.32 * 0.9, bottom = h * 0.42 - w * 0.32 * 1.0;
    x.fillStyle = '#39d36b'; const yy = lerp(top, bottom, fill); x.fillRect(0, yy, w, top - yy);
    x.restore();
    path(); x.strokeStyle = '#f2f2f2'; x.lineWidth = w * 0.02; x.stroke();
    x.fillStyle = '#9fe8b4'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.font = `700 ${w * 0.08}px Inter`;
    x.fillText('Charging', w / 2, h * 0.72);
  };

  return {
    // Hook: the phone buzzes, the warning slides down on "warns".
    b1: {
      build(g) {
        room(g, 'ink', { keyPower: 48, fillPower: 0.6, angle: 0.36, keyX: -0.8, keyZ: 2.6 });
        const table = O.table(g, { color: '#2c2019' });
        const phone = O.phone(g, { power: 1.15 }); phone.rotation.x = -Math.PI / 2 + 0.02; phone.position.set(0, table.top + 0.04, 0.1);
        return { phone };
      },
      update({ phone }, t) {
        const banner = prog(t, kit.at('warns'), kit.at('warns') + 0.35, ease.back);
        const on = Math.floor(t * 2.6) % 2 === 0;
        phone.screen.paint((x, w, h) => battery(x, w, h, 4, on ? '#ff3b30' : '#a3221a', banner));
        const buzz = Math.floor(t * 1.4) % 2 === 0 ? 1 - ((t * 1.4) % 1) : 0;
        phone.position.x = Math.sin(t * 95) * 0.022 * buzz;
        phone.rotation.z = Math.sin(t * 71) * 0.03 * buzz;
        const push = prog(t, 0, 2.2, ease.out), d = drift(t, 0.012);
        cam(d.x, lerp(5.2, 3.4, push) + d.y, lerp(2.1, 1.25, push), 0, 1.02, 0.1, 30);
      },
    },
    // The phone gets care: a low, side angle, the cable lands on "charger".
    b2: {
      build(g) {
        room(g, 'ink', { keyPower: 52, fillPower: 0.6, angle: 0.42, keyX: 0.9, keyZ: 2.4 });
        const table = O.table(g, { color: '#2c2019' });
        const y = table.top + 0.03;
        const phone = O.phone(g, { power: 1.15 }); phone.rotation.x = -Math.PI / 2 + 0.02; phone.position.set(0, table.top + 0.04, 0.1);
        const cable = O.cable(g, [[1.7, y, -0.7], [1.2, y, -0.1], [0.85, y, 0.5], [0.4, y, 0.98], [0, y + 0.005, 1.1], [0, y + 0.005, 0.86]], { color: '#eeeae2' });
        const plug = rbox(g, 0.11, 0.05, 0.2, 0.012, clay('#eeeae2'));
        return { phone, cable, plug };
      },
      update({ phone, cable, plug }, t, k, d) {
        const landed = kit.at('charger') + 0.2;
        const run = prog(t, 0, landed, ease.inOut);
        cable.show(run);
        const p = cable.curve.getPoint(run);
        plug.position.set(p.x, p.y + 0.012, p.z);
        const fill = prog(t, landed, d, ease.out);
        phone.screen.paint((x, w, h) => battery(x, w, h, 4 + fill * 96, run >= 1 ? '#39d36b' : '#ff3b30', 1 - prog(t, landed, landed + 0.3)));
        const dr = drift(t, 0.012);
        cam(lerp(1.3, 0.7, k) + dr.x, 2.35 + dr.y, 2.6 - k * 0.25, 0, 1.02, 0.3, 32);
      },
    },
    // You: a candlelit dinner, a wall battery drains with no alert. Red lands on "red".
    b3: {
      build(g) {
        const r = room(g, 'night', { keyPower: 140, fillPower: 0.9, keyX: -1.4, keyZ: 4, angle: 0.6, wallZ: -2.4 });
        const table = O.table(g, { color: '#4a2f22' });
        const top = table.top;
        const plateM = clay('#ece6db', { roughness: 0.4 });
        cyl(g, 0.34, 0.3, 0.03, plateM, -0.75, top + 0.015, 0.3);
        cyl(g, 0.34, 0.3, 0.03, plateM, 0.75, top + 0.015, 0.3);
        const gl = glass('#cfe3ff');
        cyl(g, 0.07, 0.06, 0.26, gl, -0.35, top + 0.13, -0.15);
        cyl(g, 0.07, 0.06, 0.26, gl, 0.35, top + 0.13, -0.15);
        const candle = O.candle(g, { h: 0.34 }); candle.position.set(0, top, -0.2);
        const warm = spill(g, 3.2, 1.6, '#ffb36b', 0.45); warm.position.set(0, 1.6, r.wall.position.z + 0.04);
        const sign = panel(g, 1.7, 0.75, (x, w, h) => bigBattery(x, w, h, 100), { px: 512, power: 0.9 });
        sign.position.set(0, 2.55, r.wall.position.z + 0.06);
        return { candle, sign };
      },
      update({ candle, sign }, t, k, d) {
        candle.flicker(t);
        const end = Math.max(kit.at('red') + 0.1, 0.6);
        const pct = lerp(92, 6, prog(t, 0.1, end, ease.inOut));
        sign.paint((x, w, h) => bigBattery(x, w, h, pct));
        const dr = drift(t, 0.02);
        cam(lerp(-0.5, 0.3, k) + dr.x, 1.75 + dr.y, lerp(7.4, 6.6, prog(t, 0, d, ease.inOut)), 0, 1.75, 0, 30);
      },
    },
    // One more plan: an upright phone fills with invitations, YES stamps on "yes".
    b4: {
      build(g) {
        room(g, 'sand', { keyPower: 60, fillPower: 0.7, angle: 0.5, keyX: 1.2, keyZ: 3 });
        const table = O.table(g, { color: '#8a6a4f' });
        const phone = O.phone(g, { power: 1.05 });
        phone.position.set(0, table.top + 0.02, 0); phone.rotation.x = -0.12;
        return { phone, top: table.top };
      },
      update({ phone, top }, t, k) {
        const yes = kit.at('yes');
        const n = prog(t, 0, Math.max(yes, 0.8), ease.inOut) * chats.length;
        const stamp = prog(t, yes, yes + 0.25, ease.out);
        phone.screen.paint((x, w, h) => inbox(x, w, h, n, stamp));
        // A small tilt as each bubble arrives, and a jolt on the stamp.
        phone.rotation.z = Math.sin(n * Math.PI) * 0.025 + (stamp > 0 && stamp < 1 ? Math.sin(t * 60) * 0.02 : 0);
        const dr = drift(t, 0.015);
        cam(lerp(-0.25, 0.25, k) + dr.x, top + 0.8 + dr.y, lerp(3.9, 3.3, prog(t, 0, 1.2, ease.out)), 0, top + 0.76, 0, 30);
      },
    },
    // Low power mode: the door shuts on "closed", the bulb dims on "dim".
    b5: {
      build(g) {
        const r = room(g, 'night', { keyPower: 110, fillPower: 0.85, wallZ: -2.2, keyX: 1, keyZ: 4 });
        const wz = r.wall.position.z;
        const door = O.door(g, { color: '#3a4652', gap: 0.06 }); door.position.set(0.35, 0, wz + 0.02);
        const under = spill(g, 1.8, 0.35, '#ffcf8a', 0.0); under.rotation.x = -Math.PI / 2; under.position.set(0.35, 0.01, wz + 0.3);
        const p = O.pendant(g, 3.4, { power: 30, color: '#ffbf75', shadow: true });
        p.position.x = -0.7;
        const dust = motes(g, { box: [3, 3, 2], n: 24 });
        return { door, under, p, r, dust };
      },
      update({ door, under, p, r, dust }, t, k) {
        dust.set(t);
        const shut = prog(t, kit.at('closed') - 0.15, kit.at('closed') + 0.35, ease.inOut);
        door.open(lerp(0.55, 0, shut));
        under.set(shut * 0.7);
        const dim = prog(t, kit.at('dim'), kit.at('dim') + 0.8, ease.out);
        p.bulb.set(lerp(0.9, 0.35, dim));
        r.key.intensity = lerp(110, 55, dim);
        const dr = drift(t, 0.02);
        cam(lerp(0.9, 0.2, prog(t, 0, 1.4, ease.out)) + dr.x, 1.9 + dr.y, lerp(7.8, 7.0, k), 0.05, 1.75, 0, 31);
      },
    },
    // Sendable close: a phone on a nightstand, a heart battery filling, the room warming.
    b6: {
      build(g) {
        const r = room(g, 'clay', { keyPower: 30, fillPower: 0.25, wallZ: -2.4 });
        const stand = O.table(g, { w: 1.5, d: 1.0, color: '#5a3c2a' });
        const top = stand.top;
        const phone = O.phone(g, { power: 1.1 }); phone.rotation.x = -Math.PI / 2 + 0.02; phone.position.set(0, top + 0.04, 0.05);
        const y = top + 0.03;
        const cable = O.cable(g, [[0, y + 0.005, 0.81], [0.05, y, 1.0], [0.55, y, 0.98], [0.78, y - 0.2, 0.7], [0.8, 0.05, 0.6]], { color: '#eeeae2' });
        const p = O.pendant(g, 3.2, { power: 36, color: '#ffc27a', shadow: true });
        const mug = O.mug(g); mug.position.set(-0.5, top, -0.15);
        return { phone, p, r, top };
      },
      update({ phone, p, r, top }, t, k, d) {
        const fill = prog(t, 0.1, Math.max(kit.at('charging') + 0.4, d * 0.8), ease.inOut);
        phone.screen.paint((x, w, h) => heart(x, w, h, fill));
        const warm = prog(t, kit.at('charging') - 0.2, d, ease.out);
        p.bulb.set(0.2 + warm * 0.8);
        r.key.intensity = 30 + warm * 70;
        r.fill.intensity = 0.25 + warm * 0.4;
        const dr = drift(t, 0.012);
        cam(dr.x, lerp(4.3, 3.0, prog(t, 0, d, ease.inOut)) + dr.y, lerp(2.4, 1.6, k), 0, top, 0.05, 30);
      },
    },
  };
};
