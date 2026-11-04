NEEDS A LOOK

Hook: 11/12. Biggest strength: frame 0 shows the label "PHONE BATTERY VS SOCIAL BATTERY" over a phone at 4%, so a muted stranger gets it at once. Biggest risk: the hook is a statement rather than a question, so the pull to keep watching is milder.

Scores (rubric.json):
1. Frame 0 tells a stranger the topic: 2. Label "PHONE BATTERY VS SOCIAL BATTERY" over a phone at a red 4%.
2. First sentence lands the conflict: 2. "Your phone warns you before it dies." (7 words), and the turn "Your social battery never does." follows straight away.
3. A stranger would care: 2. A universal feeling, no insider words.
4. Moves in the first second, and the picture matches the words: 2. Camera pushes in and orbits while the phone buzzes; "Low Battery" banner drops on "warns". Motion score 0.0024 (was 0.0012 WARN, fixed).
5. Opens a question the end closes: 1. The implied question (so what do you do when nothing warns you?) is answered with low power mode and the "charging" close, but the hook doesn't ask it outright.
6. Captions and label readable, clear of red zones, not over the main object: 2. Checked every tile of sheet.jpg.

check.py: all PASS (22.4 s, -14.4 LUFS, -1.4 dBTP peak, no dead air, no dark or frozen stretches).

Fixed:
- Started from the earlier unrendered draft (script and scenes). Script unchanged; it lints 0 to fix.
- Reframed every beat so the main object sits between y 250 and y 1200, clear of the caption: pulled back the cameras in b1, b2, b4, b5 and b6, and centred the upright phone in b4.
- b4: larger invitation bubbles and a bigger YES stamp, with one bubble already showing on the first frame.
- b6: moved the pendant out of the top-down shot (it was covering the heart) and darkened the mug, which was blowing out to white.
- b1: the first check warned of too little movement in the first 3 s. Brightened the room and made the push-in, orbit and buzz run through the whole beat. Now passes.
- Hook unchanged: "Your phone warns you before it dies. Your *social* battery never does."

Left for you:
- Nobody has listened to voice.wav or final.mp4. Check that the free voice (edge-tts, en default) says "pop-up" and "charging" naturally and doesn't sound rushed at +8%.
- b4 (the YES stamp) partly covers the "Brunch Sunday?" and "Just one more!" bubbles by design. See whether that reads well at phone size.
- The voice is AI (Microsoft Edge read-aloud through edge-tts, not an official API). Use Instagram's AI label where it applies, and check its terms before any commercial use.
- No drawn people or animals.

Sources: none needed (no numbers or factual claims).

File: reels/social-battery/final.mp4. Whether to post is your call.
