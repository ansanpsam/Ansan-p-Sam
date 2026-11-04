# The one that matters: DRAFT, not rendered

Status: BLOCKED. Only the script and scenes exist. There is no video, voice or check yet.

## Why
The session's auto-mode safety check blocked running code from the downloaded viral-agent repo
(`setup.sh`, `lint_script.py`, `render.mjs`, `voice.py`, `finish.py`, `check.py`). Every render,
voice and check step depends on that code, so none of them ran.

## What's here
- `script.json`: 7 beats, about 74 spoken words (roughly 26 to 29 s), three hooks, led with hook 1.
  I checked it against the linter's rules by hand, because the linter itself couldn't run.
- `scenes.js`: one scene per beat with `kit.at()` word syncs. It passes a syntax check but has
  **never been rendered**, so the framing (y 250 to 1200), exposure and camera are estimates.

## To finish
Allow the viral-agent scripts to run, then: lint, `--stills beats` and fix the framing,
`voice.py`, `finish.py` and `check.py`, as set out in the viral-animate, viral-voice and viral-check skills.
