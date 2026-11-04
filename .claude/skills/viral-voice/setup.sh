#!/bin/bash
# Adds the free voice engine to the toolkit.
set -e
TK="${VIRAL_TOOLKIT:-$HOME/.viral-agent}"
mkdir -p "$TK"
[ -d "$TK/py" ] || python3 -m venv "$TK/py"
PIP="$TK/py/bin/pip"; [ -x "$PIP" ] || PIP="$TK/py/Scripts/pip"
"$PIP" install --quiet --disable-pip-version-check edge-tts==7.3.1
# Local addition (ansan-p-sam): in Claude Code cloud sessions, HTTPS goes through a proxy whose CA
# lives at /root/.ccr/ca-bundle.crt. edge-tts only trusts certifi's bundle, so add that CA to the
# venv's certifi once. Verification stays on. Does nothing on a normal computer.
CCR_CA=/root/.ccr/ca-bundle.crt
if [ -f "$CCR_CA" ]; then
  CERTIFI="$("$TK/py/bin/python" -c 'import certifi; print(certifi.where())')"
  grep -q "ccr-proxy-ca-added" "$CERTIFI" || { printf '\n# ccr-proxy-ca-added\n' >> "$CERTIFI"; cat "$CCR_CA" >> "$CERTIFI"; }
fi
echo "voice engine ready"
