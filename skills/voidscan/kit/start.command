#!/bin/zsh
# Double-click to start VOIDSCAN and open it in the browser
cd "$(dirname "$0")"
NODE="$(command -v node)"
[ -x /opt/homebrew/opt/node@24/bin/node ] && NODE=/opt/homebrew/opt/node@24/bin/node
PORT="${PORT:-4848}"
if ! curl -s -m 1 "http://127.0.0.1:$PORT/" >/dev/null; then
  "$NODE" server.mjs &
  sleep 1.5
fi
open "http://localhost:$PORT"
wait
