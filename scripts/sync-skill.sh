#!/bin/sh
# Copy the one skill source (app/skills/domana-brain) into both plugins.
set -e
here=$(cd "$(dirname "$0")/.." && pwd)
src="${1:-$here/../app/skills/domana-brain}"
for target in "$here/claude/skills/domana-brain" "$here/codex/skills/domana-brain"; do
  rm -rf "$target"
  mkdir -p "$target"
  cp -R "$src"/. "$target"/
done
echo "synced from $src"
