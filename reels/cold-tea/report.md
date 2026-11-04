# Cold tea (reel 8): draft only, NOT rendered

Status: BLOCKED. Only the script and scenes are written.

The viral-agent toolkit was never installed. The session's permission system turned down
`viral-animate/setup.sh` and `viral-voice/setup.sh`, which install npm and pip packages, as
"code from external". So no stills, voice, `final.mp4` or check ran, and there is no hook score.

- script.json: 6 beats, about 25 s by estimate. Checked by hand against lint_script.py's rules
  (hook word limits, no dashes, no stock phrases, no promises, no negation runs). The linter itself was not run.
- scenes.js: one scene per beat, tied to the words with kit.at. It parses but has never been rendered,
  so framing and exposure haven't been checked.

Next: allow the setup scripts, then run timing.py, render.mjs --stills beats, voice.py, finish.py and check.py.
