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
