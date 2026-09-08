#!/usr/bin/env bash
# Update One Nation, Under, ME. from git (fast-forward only).
set -euo pipefail
cd "$(dirname "$0")"
echo "Updating One Nation, Under, ME...."
git pull --ff-only
echo ""
echo "Up to date. Open index.html to play (no server needed)."
echo "Repo: https://github.com/DominicVII/the-long-session"
