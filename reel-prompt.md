# Prompt for one reel per cloud session

Copy everything between the two lines into a new cloud session that has the `ansanpsam/ansan-p-sam` repository attached. Change only the REEL NUMBER (1 to 20) so each session makes a different reel. The language is English.

---

REEL NUMBER: 1

Make one finished faceless Instagram reel in English. Its topic is the one with the REEL NUMBER above in this list:

1. The phone you check first thing every morning
2. The gym bag that's been packed by the door for weeks
3. The 10,000 unread emails, and the one that matters
4. The plant you forget to water, and the friend you forget to call
5. The alarm you snooze five times
6. The savings jar that never fills, because of the small daily spends
7. The half-finished project folder on your laptop
8. The tea that goes cold while you scroll
9. The shoes you bought for running and never ran in
10. The voice note to your parents you keep putting off
11. The desk that's so messy you can't start working
12. The notebook with only the first page used
13. The lamp left on all night: rest is not laziness
14. The suitcase for the trip you keep postponing
15. The phone battery vs your social battery
16. The water bottle you carry and never drink from
17. The door you're afraid to knock on (asking for help)
18. The clock at 2 a.m.: revenge bedtime procrastination
19. The receipt pile: knowing where your money goes
20. The candle that burns at both ends (burnout)

Make it using the viral-agent skills that are committed in this repo under `.claude/skills/` (viral-script, viral-animate, viral-voice, viral-check). Use that copy. Don't clone or download the skills from anywhere else. Work start to finish without stopping to ask me anything. Where a skill says to wait for the user, pick the best option yourself and note it in the final report.

## 1. Set up (about 2 minutes)

Run every command from the repo root, exactly in these forms (repo-relative paths, no `cd`, no `$SK` variable). The repo's permission rules match these forms:

```bash
bash .claude/skills/viral-animate/setup.sh
bash .claude/skills/viral-voice/setup.sh
python3 .claude/skills/viral-script/lint_script.py <project>
python3 .claude/skills/viral-animate/timing.py <project>
node .claude/skills/viral-animate/render.mjs <project> --stills beats
python3 .claude/skills/viral-voice/voice.py <project>
python3 .claude/skills/viral-voice/finish.py <project>
python3 .claude/skills/viral-check/check.py <project>
```
Then read the SKILL.md of viral-script, viral-animate, viral-voice and viral-check in `.claude/skills/`, plus `.claude/skills/viral-animate/example/scenes.js`, and follow them. When a SKILL.md names a script, run it in the form above.

Known fixes for this cloud environment:
- **Voice certificate errors** are handled by `viral-voice/setup.sh`, which adds this environment's proxy CA to the voice engine's trust store. Never turn TLS verification off.
- **Voice fails with `NoAudioReceived` on a random beat.** The free voice service is flaky. Re-run `voice.py` up to 8 times, waiting 10 seconds between tries. Don't change the script because of it.
- **Do not reinstall Playwright.** setup.sh's browser check passes with what's already installed.
- **The full render is slow**, about 20 minutes for 20 seconds, because there's no GPU. Run `finish.py` as a background command with a long timeout (40 minutes) and wait for it to finish. Don't start a second copy.
- **If a command is refused by a permission check**, don't work around it. Stop and report which command was refused.

## 2. Script (viral-script)

Project folder: `~/work/<short-slug>/`. Aim for 18 to 30 seconds and 5 to 7 beats. Write three hooks with different shapes from `hooks.json`, lead with the strongest, and end on a line people want to send to a friend. Use objects, rooms, light and type only: no people or animals. Don't use numbers, statistics or factual claims unless you've checked a real source and listed it in `sources`. If you can't check it, cut it. Run `lint_script.py` until it shows 0 to fix.

## 3. Animate (viral-animate)

Write `scenes.js`, one scene per beat, with motion in the first half second and `kit.at('word')` syncing the key moments to the words. Then render `--stills beats` and **look at the image**. Repeat until all of these are true:
- The main object sits between y 250 and y 1200 on the 1080x1920 frame: below the top label, above the caption, and never covered by the caption.
- Nothing is blown out to white or too dark to read on a phone.
- Every beat changes the look, angle or object.

Expect two or three rounds of fixes. That's normal.

## 4. Voice and finish (viral-voice)

Use the free voice (default for the language). Run `voice.py`, re-render `--stills beats` on the real timing and fix anything that drifted. Then run `finish.py` in the background as above.

## 5. Check (viral-check)

Run `check.py`. Look at `frame0.jpg`, `hook.jpg` and `sheet.jpg`, score the hook against `rubric.json` honestly, and fix anything weak as the skill says, including a re-render if needed. Write `check/report.md`. The status can't be READY, because nobody has listened to the voice yet.

## 6. Save it to the repo (required: this machine is deleted afterwards)

In the attached `ansan-p-sam` repo, on this session's branch, create `reels/<short-slug>/` and copy in exactly these files: `final.mp4`, `script.json`, `scenes.js`, `timing.json`, `stills/beats.jpg` (as `beats.jpg`), `check/sheet.jpg` (as `sheet.jpg`) and `check/report.md` (as `report.md`). Don't commit `video.mp4`, `voice.wav`, `mix.wav` or `sfx.wav`. Commit with the message `Add reel: <title>` and push. If the push fails because of the network, retry up to 4 times.

## 7. Reply to me with

- The title, length and the slug folder in the repo
- The three hooks and which one you led with
- The check result line and the hook score
- Anything I should look at or listen to before posting

---
