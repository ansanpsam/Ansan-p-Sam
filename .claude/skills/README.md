# Vendored skills: viral-agent

The five `viral-*` skills in this folder are a copy of
https://github.com/hadi-a-azeez/viral-agent at commit `2e550e6`, under the MIT licence
(see `VIRAL-AGENT-LICENSE`). They're committed here so cloud sessions load them from this
repo instead of downloading code from outside on every run.

The copy was reviewed before it was committed. The scripts only call ffmpeg, ffprobe and Node, plus a local
server on 127.0.0.1. Outside network calls go to Apify (`viral-find`, only with `APIFY_TOKEN`),
ElevenLabs (`viral-voice`, only with `ELEVENLABS_API_KEY`) and the free Edge voice
through `edge-tts`. The setup scripts install pinned packages from npm and PyPI into
`~/.viral-agent`.

To update, copy a newer `skills/` folder over these, review the diff, and change the commit above.

## Local change

`viral-voice/setup.sh` has one addition. When it runs in a Claude Code cloud session (where `/root/.ccr/ca-bundle.crt` exists), it adds that proxy CA to the voice engine's certifi bundle. Otherwise `edge-tts` fails TLS checks there. On a normal computer it does nothing.

## Permission rule for cloud sessions in auto mode

Auto mode's safety check refuses to run these setup scripts (they install npm and PyPI packages)
unless the repo allows them. The repo owner needs to add this file as `.claude/settings.json`; Claude can't add it
itself. The rules allow only these exact scripts, run from the repo root:

```json
{
  "permissions": {
    "allow": [
      "Bash(bash .claude/skills/viral-animate/setup.sh)",
      "Bash(bash .claude/skills/viral-voice/setup.sh)",
      "Bash(node .claude/skills/viral-animate/render.mjs *)",
      "Bash(python3 .claude/skills/viral-animate/timing.py *)",
      "Bash(python3 .claude/skills/viral-script/lint_script.py *)",
      "Bash(python3 .claude/skills/viral-voice/voice.py *)",
      "Bash(python3 .claude/skills/viral-voice/finish.py *)",
      "Bash(python3 .claude/skills/viral-voice/sfx.py *)",
      "Bash(python3 .claude/skills/viral-check/check.py *)"
    ]
  }
}
```
