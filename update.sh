#!/usr/bin/env bash
# Update The Long Session from git (fast-forward only).
set -euo pipefail
cd "$(dirname "$0")"
echo "Updating The Long Session..."
git pull --ff-only
echo ""
echo "Up to date. Open index.html to play (no server needed)."
echo "Repo: https://github.com/DominicVII/the-long-session"
