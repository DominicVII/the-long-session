#!/bin/bash
# 20261125n4: apply the hash-checked patch-12 session.html patch on 20261125j1 (82418c5), copy to the mirrors, remove the temporary parts.
set -euo pipefail
D=build/n25n4
patch --no-backup-if-mismatch session.html < $D/session.html.patch
got=$(sha256sum session.html | cut -d' ' -f1)
want=$(cut -d' ' -f1 $D/expected.sha256)
if [ "$got" != "$want" ]; then echo "MISMATCH session.html $got != $want"; exit 1; fi
cp session.html index.html
cp session.html "One Nation, Under, ME.html"
cp session.html public/session.html
sha256sum session.html index.html "One Nation, Under, ME.html" public/session.html
git rm -r -q $D
