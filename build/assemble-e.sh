#!/bin/bash
set -euo pipefail
python3 - <<'PY'
import json, base64, pathlib
man = json.loads(pathlib.Path("build/onum-e.manifest.json").read_text())
buf = bytearray()
for p in man:
    b64 = pathlib.Path(p).read_text().strip()
    buf.extend(base64.b64decode(b64))
pathlib.Path("/tmp/onum-assembled.html").write_bytes(buf)
print("assembled", len(buf))
PY
cp /tmp/onum-assembled.html session.html
cp /tmp/onum-assembled.html index.html
cp /tmp/onum-assembled.html "One Nation, Under, ME.html"
cp /tmp/onum-assembled.html session.standalone.html
