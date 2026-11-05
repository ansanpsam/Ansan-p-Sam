NEEDS A LOOK

Hook: 11/12. Biggest strength: a closed door glowing at the bottom, under "THE DOOR YOU WON'T KNOCK ON", tells a muted stranger the whole idea on frame 0. Biggest risk: the question it opens ("why do we stand there for weeks?") is a feeling, not a mystery, so the pull to the end is softer than a curiosity hook.

| # | Question | Score | What I saw |
|---|---|---|---|
| 1 | Frame 0 tells a muted stranger the topic | 2 | frame0.jpg: label "THE DOOR YOU WON'T KNOCK ON" over a tilted, closed door with warm light leaking under it |
| 2 | Claim lands within about 14 words | 2 | "ഒരു door-ൽ knock ചെയ്യാൻ, നമ്മൾ ആഴ്ചകളോളം അതിന്റെ മുന്നിൽ നിൽക്കും." is 9 words ("To knock on one door, we stand in front of it for weeks.") |
| 3 | A non-follower would care | 2 | No insider words; anyone who has put off asking for help |
| 4 | Moves in the first second and matches the words | 2 | hook.jpg: camera rolls level and pushes in from a wide shot from frame 0, and the light under the door dips as if someone moves inside, while the voice says "door-ൽ knock" |
| 5 | Opens a question the end closes | 1 | Why we wait (b2 excuses, b3 carrying it alone) is answered by b4 "it was never locked" and closed in b6 as the door swings open on "knock", but it's an emotional gap, not a curiosity gap |
| 6 | Captions and label readable and clear of red zones | 2 | sheet.jpg: every caption at y ~1240 under the main object; label below the top 220 px; Malayalam renders with no boxes or broken letters |

Technical: all PASS except one WARN, "Movement in first 3 s" (0.0012 against a 0.002 bar). Accepted on purpose, after three rounds of fixes: hook.jpg shows clear motion (a 0.1 rad roll settling level, a push from 18 to 10.8 units, an orbit across, the door light pulsing). The metric is ffmpeg's average scene-change score, and it stays low on a dark hallway with a flat-coloured door. A brighter, warmer door doubled it from 0.0006; to pass, the scene would have to stop being a dark hallway.

Fixed:
- First render scored 0.0006 on movement. b1 now opens wider with a camera roll and an ease-out push that runs the full 3 s, the door is lighter and the hall brighter, and the light under the door pulses harder. Re-rendered: 0.0012. Hook text unchanged.
- Before the render: doors in b1, b4 and b6 sat under the caption, so the cameras were re-aimed to put them between y ~300 and ~1190. The phone in b2 was too close and cut at the top, so it was pulled back and the typed message made big and two-line so it reads on a phone. The brick stack in b3 reached the top red zone, so it's one brick shorter and the camera is pulled back. The open doorway in b6 was blown to white, so its glow was lowered to a warm cream.

Left for you:
- Nobody has listened to voice.wav / final.mp4. It's the free Malayalam voice (ml-IN-MidhunNeural), and a Malayalam speaker must check the pronunciation, especially the mixed words "door-ൽ", "knock ചെയ്യാൻ", "excuse", "busy ആയിരിക്കും", "lock ആയിരുന്നില്ല", "door-ന്" and "ശല്യമാവും". If any come out wrong, add a "tts" respelling to that beat and re-run voice.py and finish.py.
- The script hasn't been matched to your own voice: there are no voice samples (no profile.md). It's plain everyday spoken Malayalam.
- The chat name on the phone in b2 is "Chettan" (older brother). Change it in scenes.js if you'd rather it said something else.
- The voice is AI (Microsoft Edge read-aloud through edge-tts, not an official API; check the terms for commercial use). Use Instagram's AI label where it applies.

Sources: none needed. No numbers or factual claims; "the people on the other side have knocked on someone's door too" is framed as a shared feeling, not a statistic.

Also checked: no people or animals drawn, only doors, a phone, bricks, a chair, mugs, a lamp and rooms. No promise of views or results.

File: check/report.md. The decision to post is yours.
