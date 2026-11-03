#!/bin/bash
# Runs Claude Code inside a macOS sandbox: the kernel refuses every write and delete outside the allow list.
HERE="$(cd "$(dirname "$0")" && pwd)"
APP="$(dirname "$HERE")"
CLAUDE_BIN="${VOIDSCAN_CLAUDE:-$(command -v claude 2>/dev/null)}"
[ -x "$CLAUDE_BIN" ] || CLAUDE_BIN="$HOME/.local/bin/claude"
# Claude Code keeps each folder's sessions under ~/.claude/projects/<path with every other character turned into ->
PROJ="$HOME/.claude/projects/$(printf '%s' "$APP/agent-cwd" | sed 's/[^A-Za-z0-9]/-/g')"
HOME_RE="$(printf '%s' "$HOME" | sed 's/[][\\.^$*+?(){}|/]/\\&/g')"
exec /usr/bin/sandbox-exec -D HOME="$HOME" -D HOME_RE="$HOME_RE" -D APP="$APP" -D PROJ="$PROJ" -f "$HERE/readonly.sb" "$CLAUDE_BIN" "$@"
