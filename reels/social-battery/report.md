NOT READY (draft only, not rendered)

Reel 15: "The phone battery vs your social battery". Title: Social battery.

Done:
- script.json: 6 beats, about 28 s estimated (76 words at 2.8 words/s). Three hooks, led with Hook 1 (The object truth).
- Checked by hand against every rule in viral-script/lint_script.py: 0 to fix (the linter itself couldn't be run).
- scenes.js: one scene per beat, with kit.at() syncs on warns / charger / red / yes / closed / dim / charging. Passes a JS syntax check.

Not done: the session's permission classifier blocked running any code from the viral-agent repo
(setup.sh, lint_script.py, render.mjs, voice.py, finish.py, check.py). So there are no stills, no voice,
no final.mp4, no timing.json and no check sheet. Object positions in scenes.js are untested and need a
`--stills beats` pass, especially b3 (the wall battery sign), b4 (the upright phone) and b5 (the door).

No numbers or factual claims, so there are no sources.
