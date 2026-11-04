# The voice note (reel 10): draft only

Status: **NOT RENDERED.** This session wasn't allowed to install or run the viral-agent toolkit (blocked as code from an external repo), so these files are missing: `final.mp4`, `timing.json`, `beats.jpg`, `sheet.jpg`, `report.md`.

What's here:
- `script.json`: six beats, about 26 s estimated, three hooks, leading with "The object truth". Checked by hand against `lint_script.py`'s rules; the linter itself wasn't run.
- `scenes.js`: one scene per beat, written against the kit's API but never rendered. Expect two or three rounds of fixing after the first `--stills beats`.

To finish: in a session where the toolkit may run, copy this folder to `~/work/voice-note/`, then run `timing.py`, `render.mjs --stills beats`, `voice.py`, `finish.py` and `check.py`.
