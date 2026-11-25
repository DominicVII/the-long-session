#!/bin/bash
set -euo pipefail
D=build/n25risks
patch --no-backup-if-mismatch session.html < $D/session.html.patch
got=$(sha256sum session.html | cut -d' ' -f1)
want=$(cut -d' ' -f1 $D/expected.sha256)
if [ "$got" != "$want" ]; then echo "MISMATCH session.html $got != $want"; exit 1; fi
cp session.html index.html
cp session.html "One Nation, Under, ME.html"
cp session.html public/session.html
sha256sum session.html index.html "One Nation, Under, ME.html" public/session.html
git rm -r -q $D
