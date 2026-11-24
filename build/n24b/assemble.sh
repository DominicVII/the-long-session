#!/bin/bash
# 20261124b: rebuild session.html from base64 parts, check it against its sha256, copy it to the mirrors, remove the parts.
set -euo pipefail
D=build/n24b
( cd $D && sha256sum -c parts.sha256 )
while IFS='|' read -r key sum dest; do
  cat $D/$key.part*.b64 | base64 -d > "$dest.tmp"
  got=$(sha256sum "$dest.tmp" | cut -d' ' -f1)
  if [ "$got" != "$sum" ]; then echo "MISMATCH $dest $got != $sum"; exit 1; fi
  mv "$dest.tmp" "$dest"; echo "ok $dest $sum"
done < $D/manifest.txt
cp session.html index.html; cp session.html "One Nation, Under, ME.html"; cp session.html public/session.html
md5sum session.html index.html "One Nation, Under, ME.html" public/session.html
git rm -r -q $D
