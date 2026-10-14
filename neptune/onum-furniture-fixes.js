/* onum-furniture-fixes.js — NEPTUNE runtime furniture/placement fixes for session.html
 *
 * Load with a plain <script src="neptune/onum-furniture-fixes.js"></script> AFTER the game script.
 * session.html wraps the whole game in a strict-mode IIFE, so nothing (roomGroup, ROOMS, PROPS)
 * is global. This script therefore only touches the three.js scene: it wraps
 * THREE.Scene.prototype.onBeforeRender to see the scene, identifies the live room by its floor
 * slab (w x d), finds the faulty objects by position/scale signature, and moves/rescales them.
 * Every fix is idempotent (objects are tagged), and anything not found is skipped silently.
 * See neptune/FURNITURE-QA.md for the matching source fixes for session.html.
 *
 * Debug: window.ONUM_FF.log  (list of fixes applied), window.ONUM_FF.disabled = true to stop.
 */
(function(){
  "use strict";
  var T = window.THREE;
  if(!T || !T.Scene || !T.Box3 || !T.Object3D) return;
  if(window.ONUM_FF && window.ONUM_FF.installed) return;
  var FF = window.ONUM_FF = {installed:true, disabled:false, log:[], version:"20261013a"};

  /* room footprints from ROOMS in session.html (w x d) */
  var DIMS = {"9x11":"office","7x26":"corridor","7x9":"cloak","13x14":"caucus","12x13":"committee",
    "17x16":"floor","8x10":"press","8x9":"visit","14x13":"senate","12x12":"court","11x12":"exec",
    "10x11":"govoffice","20x14":"steps","16x15":"district"};

  function note(room, msg){ try{ FF.log.push(room + ": " + msg); if(FF.log.length > 200) FF.log.shift(); }catch(e){} }
  function near(a, b, eps){ return Math.abs(a - b) <= (eps == null ? 0.03 : eps); }
  var _bx = new T.Box3(), _tmp = new T.Box3();
  /* solid bbox in room-local space (flat contact discs / decals ignored) */
  function solidBox(o, rg){
    var out = new T.Box3();
    o.updateMatrixWorld(true);
    o.traverse(function(m){
      if(!m.isMesh || m.visible === false) return;
      _tmp.setFromObject(m);
      if(_tmp.isEmpty() || (_tmp.max.y - _tmp.min.y) < 0.025) return;
      out.union(_tmp);
    });
    if(!out.isEmpty() && rg){ out.min.sub(rg.position); out.max.sub(rg.position); }
    return out;
  }
  function move(o, dx, dy, dz){
    o.position.x += dx || 0; o.position.y += dy || 0; o.position.z += dz || 0;
    o.updateMatrix(); o.updateMatrixWorld(true);
    o.userData = o.userData || {}; o.userData.__onumFF = true;
  }
  function done(o){ return !!(o && o.userData && o.userData.__onumFF); }
  function setY(o, y, sy){
    o.position.y = y; if(sy != null) o.scale.y = sy;
    o.updateMatrix(); o.updateMatrixWorld(true);
    o.userData = o.userData || {}; o.userData.__onumFF = true;
  }
  function meshes(rg){ return rg.children.filter(function(o){ return o.isMesh; }); }
  function isBox(o, x, y, z, sx, sy, sz, eps){
    eps = eps == null ? 0.03 : eps;
    return o.isMesh && near(o.position.x, x, eps) && near(o.position.y, y, eps) && near(o.position.z, z, eps) &&
      (sx == null || near(o.scale.x, sx, eps)) && (sy == null || near(o.scale.y, sy, eps)) && (sz == null || near(o.scale.z, sz, eps));
  }
  var GEO = null;
  function box(mat, x, y, z, sx, sy, sz){
    GEO = GEO || new T.BoxGeometry(1, 1, 1);
    var m = new T.Mesh(GEO, mat);
    m.position.set(x, y, z); m.scale.set(sx, sy, sz);
    m.castShadow = false; m.receiveShadow = true;
    m.userData.__onumFF = true; m.userData.__onumAdded = true;
    m.updateMatrix(); m.matrixAutoUpdate = false;
    return m;
  }

  function roomOf(rg){
    var best = null, ba = 0;
    for(var i = 0; i < rg.children.length; i++){
      var o = rg.children[i];
      if(!o.isMesh) continue;
      _bx.setFromObject(o);
      if(_bx.isEmpty()) continue;
      var sy = _bx.max.y - _bx.min.y;
      if(sy > 0.3 || _bx.max.y > 0.05 || _bx.max.y < -0.5) continue;
      var a = (_bx.max.x - _bx.min.x) * (_bx.max.z - _bx.min.z);
      if(a > ba){ ba = a; best = [_bx.max.x - _bx.min.x, _bx.max.z - _bx.min.z]; }
    }
    if(!best) return null;
    var key = Math.round(best[0] - 0.08) + "x" + Math.round(best[1] - 0.08);
    var id = DIMS[key];
    if(!id) return null;
    var p = key.split("x");
    return {id:id, w:+p[0], d:+p[1], hw:+p[0]/2};
  }

  /* ── radiators: main slab is 0.62 tall, 0.10 deep, 1.0–1.4 long at y=0.36 ── */
  function radiatorClusters(rg){
    var out = [];
    meshes(rg).forEach(function(o){
      if(!near(o.position.y, 0.36, 0.02) || !near(o.scale.y, 0.62, 0.02) || !near(o.scale.z, 0.10, 0.02)) return;
      if(o.scale.x < 0.9 || o.scale.x > 1.5) return;
      var along = Math.abs(Math.sin(o.rotation.y)) > 0.5 ? "z" : "x";
      var half = o.scale.x / 2 + 0.05;
      var parts = meshes(rg).filter(function(m){
        if(m.position.y > 0.72) return false;
        if(along === "z") return near(m.position.x, o.position.x, 0.08) && Math.abs(m.position.z - o.position.z) <= half;
        return near(m.position.z, o.position.z, 0.08) && Math.abs(m.position.x - o.position.x) <= half;
      });
      out.push({main:o, along:along, len:o.scale.x, parts:parts});
    });
    return out;
  }
  function shiftCluster(c, dx, dz){ c.parts.forEach(function(m){ if(!done(m)) move(m, dx, 0, dz); }); }

  /* F-RAD-DOOR: back-wall radiator planted across the House Floor door (corridor, cloak) */
  function fixBackRadiator(rg, R){
    if(R.id !== "corridor" && R.id !== "cloak") return;
    radiatorClusters(rg).forEach(function(c){
      if(done(c.main) || c.along !== "x") return;
      if(!near(c.main.position.z, R.d - 0.22, 0.06) || Math.abs(c.main.position.x) > 0.3) return;
      shiftCluster(c, 1.7, 0);
      note(R.id, "radiator moved off the Floor door (x 0 -> 1.7)");
    });
  }
  /* F-RAD-SHELF: side-wall radiator buried in the end of a bookcase */
  function fixSideRadiators(rg, R){
    var tall = rg.children.filter(function(o){ return o.isGroup; }).map(function(g){ return {g:g, b:solidBox(g, rg)}; })
      .filter(function(t){ return !t.b.isEmpty() && (t.b.max.y - t.b.min.y) > 1.3 && t.b.min.y < 0.1; });
    radiatorClusters(rg).forEach(function(c){
      if(done(c.main) || c.along !== "z") return;
      var x = c.main.position.x, z0 = c.main.position.z - c.len/2, z1 = c.main.position.z + c.len/2;
      for(var i = 0; i < tall.length; i++){
        var b = tall[i].b;
        if(b.max.x < x - 0.45 || b.min.x > x + 0.45) continue;
        if(b.max.z <= z0 || b.min.z >= z1) continue;
        /* push the radiator clear of the case, toward the room's middle */
        var mid = R.d / 2, dz;
        if(c.main.position.z < (b.min.z + b.max.z)/2) dz = (b.min.z - 0.10) - z1; else dz = (b.max.z + 0.10) - z0;
        if(Math.abs(dz) > 1.6) return;
        shiftCluster(c, 0, dz);
        note(R.id, "radiator at z " + c.main.position.z.toFixed(2) + " cleared bookcase (dz " + dz.toFixed(2) + ")");
        return;
      }
    });
  }

  /* F-OFFICE-SOFA: PROPS.office has "The office sofa" at (-2.35, 5.4) but no mesh was ever built there */
  var LEATHER = null, WOOD = null;
  function fixOfficeSofa(rg, R){
    if(R.id !== "office" || rg.userData.__onumSofa) return;
    var taken = rg.children.some(function(o){
      if(o.userData && o.userData.__onumAdded) return false;
      var b = solidBox(o, rg); if(b.isEmpty()) return false;
      return b.min.y < 0.5 && b.max.y < 1.4 && b.max.x > -2.8 && b.min.x < -1.9 && b.max.z > 4.5 && b.min.z < 6.3 && (b.max.x - b.min.x) < 3;
    });
    if(taken){ rg.userData.__onumSofa = true; return; }
    LEATHER = LEATHER || new T.MeshStandardMaterial({color:0x3a1517, roughness:0.55});
    WOOD = WOOD || new T.MeshStandardMaterial({color:0x4a3220, roughness:0.6});
    var g = new T.Group(); g.userData.__onumFF = true; g.userData.__onumAdded = true; g.name = "onum-office-sofa";
    var sx = -2.35, sz = 5.4;
    /* same recipe as the sofa in session.html's cloak block (seat, back to the wall, two arms, four feet) */
    g.add(box(LEATHER, sx,       0.26, sz,       0.86, 0.32, 1.90));
    g.add(box(LEATHER, sx-0.36,  0.52, sz,       0.16, 0.84, 1.90));
    g.add(box(LEATHER, sx+0.02,  0.44, sz-0.88,  0.80, 0.28, 0.18));
    g.add(box(LEATHER, sx+0.02,  0.44, sz+0.88,  0.80, 0.28, 0.18));
    [[-0.34,-0.80],[0.30,-0.80],[-0.34,0.80],[0.30,0.80]].forEach(function(f){
      g.add(box(WOOD, sx+f[0], 0.05, sz+f[1], 0.08, 0.10, 0.08));
    });
    rg.add(g); g.updateMatrixWorld(true);
    rg.userData.__onumSofa = true;
    note("office", "added the missing office sofa at (-2.35, 5.4) under the 'sofa' interactable");
  }

  /* F-CLOAK-SOFA: the office sofa recipe was built in the cloakroom at (-2.35,5.4), through the coat rack and phone booth */
  function fixCloak(rg, R){
    if(R.id !== "cloak") return;
    var sofa = meshes(rg).filter(function(o){
      return !done(o) && o.position.x > -2.8 && o.position.x < -1.85 && o.position.z > 4.4 && o.position.z < 6.4 && o.position.y < 0.6 && o.scale.y < 1.0 && o.scale.x < 0.9;
    });
    var seat = sofa.filter(function(o){ return near(o.scale.x, 0.86) && near(o.scale.z, 1.90); })[0];
    if(seat){ sofa.forEach(function(o){ move(o, 0.75, 0, 0); }); note("cloak", "arm sofa moved +0.75 x out of the coat rack / phone booth (" + sofa.length + " parts)"); }
    /* coat #8 hangs inside the potted plant at (-2.5, 7.4) */
    meshes(rg).forEach(function(o){
      if(!done(o) && near(o.position.x, -2.5, 0.05) && near(o.position.y, 1.35, 0.05) && near(o.position.z, 7.35, 0.08) && near(o.scale.z, 0.5, 0.05)){
        o.visible = false; o.userData.__onumFF = true; note("cloak", "coat #8 (inside the plant) hidden");
      }
    });
    /* right-hand seating: legless 0.16 m leather slabs floating at y 0.27, a legless side table,
       and lamps hanging 0.6 m in mid-air */
    var hx = R.hw - 1.2;
    meshes(rg).forEach(function(o){
      if(done(o)) return;
      if(isBox(o, hx, 0.35, 3.0, 1.4, 0.16, 0.7)){ setY(o, 0.215, 0.43); move(o, 0, 0, 0.2); note("cloak", "bench @z3.0 grounded (0.43 tall) and moved to z3.2 clear of the back-rest sofa"); }
      else if(isBox(o, hx, 0.35, 5.4, 1.4, 0.16, 0.7)){ setY(o, 0.215, 0.43); note("cloak", "bench @z5.4 grounded"); }
      else if(isBox(o, hx, 0.42, 5.3, 0.5, 0.06, 0.5)){
        setY(o, 0.225, 0.45); move(o, 0, 0, -1.0); note("cloak", "side table grounded and moved to z4.3 (was inside bench)");
        meshes(rg).forEach(function(p){ if(!done(p) && near(p.position.x, hx, 0.15) && near(p.position.z, 5.3, 0.12) && p.position.y > 0.44 && p.position.y < 0.5 && p.scale.y < 0.01) move(p, 0, -0.005, -1.0); });
      }
    });
    var t2 = rg.children.some(function(o){ return o.userData && o.userData.__onumCloakT2; });
    var lamps = [[4.2, 4.3], [6.4, 6.4]];
    lamps.forEach(function(L, i){
      rg.children.forEach(function(o){
        if(done(o)) return;
        var lp = (o.isMesh && near(o.position.x, hx, 0.05) && near(o.position.z, L[0], 0.05) && o.position.y > 0.7 && o.position.y < 1.0);
        var ll = (o.isLight && near(o.position.x, hx, 0.05) && near(o.position.z, L[0], 0.05));
        if(lp || ll){ move(o, 0, -0.15, L[1] - L[0]); }
      });
    });
    if(!t2 && meshes(rg).some(function(o){ return o.userData && o.userData.__onumFF && near(o.position.z, 4.3, 0.05) && near(o.position.y, 0.225, 0.01); })){
      var tbl = meshes(rg).filter(function(o){ return near(o.position.z, 4.3, 0.05) && near(o.position.y, 0.225, 0.01); })[0];
      var t = box(tbl.material, hx, 0.225, 6.4, 0.5, 0.45, 0.5); t.userData.__onumCloakT2 = true; rg.add(t); t.updateMatrixWorld(true);
      note("cloak", "lamps lowered onto side tables at z4.3 / z6.4 (second table added)");
    }
  }

  /* F-FLOOR-BENCH: outermost bench row (|x| 8.4) runs into the side walls; its writing ledge (|x| 9.08) is inside the wall */
  function fixFloorBenches(rg, R){
    if(R.id !== "floor") return;
    rg.children.forEach(function(o){
      if(!o.isGroup || done(o) || !near(o.position.z, 7.5, 0.05)) return;
      var ax = Math.abs(o.position.x), s = Math.sign(o.position.x);
      if(near(ax, 2.6 + 4*1.45 + 0.68, 0.05)){ o.visible = false; o.userData.__onumFF = true; note("floor", "ledge in the wall at x " + o.position.x.toFixed(2) + " hidden"); }
      else if(near(ax, 2.6 + 4*1.45, 0.05)){
        var b = solidBox(o, rg), over = (s < 0 ? (-R.hw + 0.06) - b.min.x : b.max.x - (R.hw - 0.06));
        if(over > 0.005){ move(o, -s*over, 0, 0); note("floor", "outer bench pulled " + over.toFixed(2) + " m out of the wall"); }
      }
    });
  }

  /* F-SENATE-DOOR: outermost left desk + chair of the horseshoe sit in the Supreme Court door */
  function fixSenateDoor(rg, R){
    if(R.id !== "senate") return;
    var door = {x:-R.hw + 0.35, z:0.5 * R.d};
    rg.children.forEach(function(o){
      if(done(o) || o.isLight) return;
      var b = solidBox(o, rg); if(b.isEmpty() || (b.max.y - b.min.y) > 1.3 || (b.max.x - b.min.x) > 1.5) return;
      var cx = (b.min.x + b.max.x)/2, cz = (b.min.z + b.max.z)/2;
      if(cx > -R.hw + 0.45 && Math.hypot(cx - door.x, cz - door.z) < 1.45 && b.min.z > door.z){ meshes(rg).forEach(function(pp){ if(!done(pp) && pp !== o && pp.scale.y < 0.01 && pp.position.y > 0.6 && pp.position.x > b.min.x && pp.position.x < b.max.x && pp.position.z > b.min.z && pp.position.z < b.max.z) move(pp, 0.15, 0, 0.95); });
        move(o, 0.15, 0, 0.95); note("senate", "desk/chair at (" + cx.toFixed(2) + "," + cz.toFixed(2) + ") moved out of the Court door"); }
    });
  }

  /* F-PRESS-TV: monitor case + screen hang 0.5 m off the wall in mid-air */
  function fixPressTV(rg, R){
    if(R.id !== "press") return;
    meshes(rg).forEach(function(o){
      if(done(o)) return;
      if(isBox(o, -R.hw + 0.55, 1.7, 5.0, 0.08, 0.9, 1.5) || isBox(o, -R.hw + 0.60, 1.7, 5.0, 0.02, 0.76, 1.32)){
        move(o, -0.48, 0, 0); note("press", "monitor moved flush to the wall");
      }
    });
  }

  /* F-CAUCUS-CARAFE: 9 water carafes float in the gaps between the conference desks */
  function fixCaucus(rg, R){
    if(R.id !== "caucus") return;
    var moved = 0;
    meshes(rg).forEach(function(o){
      if(done(o)) return;
      if(near(o.position.y, 0.82, 0.02) && near(o.scale.y, 0.12, 0.02) && near(o.scale.x, 0.08, 0.02) &&
         [-3.5, 0, 3.5].some(function(x){ return near(o.position.x, x, 0.03); }) &&
         [4.0, 6.2, 8.4].some(function(z){ return near(o.position.z, z, 0.03); })){
        move(o, -0.9, 0, 0);
      }
      else if(near(o.position.x, -0.5, 0.03) && near(o.position.z, R.d - 2.25, 0.03) && near(o.position.y, 0.82, 0.02)){
        move(o, -0.28, 0, 0.55); note("caucus", "glass beside the lectern moved onto the dais step");
        setY(o, 0.24 + 0.07);
      }
        if(done(o) && near(o.position.y, 0.82, 0.02) && near(o.scale.y, 0.12, 0.02)) moved++;
    });
    if(moved) note("caucus", moved + " carafes moved onto desk tops");
  }

  /* F-VISIT-BACK: visitor office (8x9) reuses office (9x11) coordinates: chair, shelf, coat stand, bin go through the back wall */
  function fixVisit(rg, R){
    if(R.id !== "visit") return;
    var items = rg.children.filter(function(o){ return !o.isLight && !done(o); }).map(function(o){ return {o:o, b:solidBox(o, rg)}; })
      .filter(function(t){
        var b = t.b; if(b.isEmpty()) return false;
        var sx = b.max.x - b.min.x, sy = b.max.y - b.min.y, sz = b.max.z - b.min.z;
        if(sx > 2.5 || sy > 2.3) return false;
        if(b.max.z <= R.d - 0.02 || b.min.z < R.d - 1.8) return false;
        if(b.min.y > 0.05 && sz < 0.2 && b.max.z < R.d + 0.05) return false; /* wall-mounted */
        return true;
      });
    /* cluster by xz contact so multi-mesh props (coat stand) move together */
    var cl = [];
    items.forEach(function(t){
      var hit = null;
      for(var i = 0; i < cl.length && !hit; i++){
        var c = cl[i].b;
        if(t.b.min.x < c.max.x + 0.15 && t.b.max.x > c.min.x - 0.15 && t.b.min.z < c.max.z + 0.15 && t.b.max.z > c.min.z - 0.15) hit = cl[i];
      }
      if(hit){ hit.list.push(t.o); hit.b.union(t.b); } else cl.push({list:[t.o], b:t.b.clone()});
    });
    cl.forEach(function(c){
      var dz = (R.d - 0.08) - c.b.max.z;
      if(dz >= 0) return;
      c.list.forEach(function(o){ move(o, 0, 0, dz); });
      note("visit", "pulled " + c.list.length + " part(s) at x " + ((c.b.min.x + c.b.max.x)/2).toFixed(2) + " in by " + (-dz).toFixed(2) + " m");
    });
  }

  var FIXES = [fixBackRadiator, fixSideRadiators, fixOfficeSofa, fixCloak, fixFloorBenches, fixSenateDoor, fixPressTV, fixCaucus, fixVisit];

  function process(rg){
    var ch = rg.children, quick = ch.length + ":" + (ch[0] && ch[0].uuid) + ":" + (ch[ch.length-1] && ch[ch.length-1].uuid);
    if(rg.userData.__onumFFquick === quick) return;      /* cheap per-frame change check */
    rg.userData.__onumFFquick = quick;
    var R = roomOf(rg);
    if(!R) return;
    var sig = R.id + ":" + rg.children.length;
    if(rg.userData.__onumFFsig === sig) return;
    for(var i = 0; i < FIXES.length; i++){
      try{ FIXES[i](rg, R); }catch(e){ try{ console.warn("[onum-furniture-fixes]", FIXES[i].name, e); }catch(_e){} }
    }
    rg.userData.__onumFFsig = R.id + ":" + rg.children.length;
    ch = rg.children;
    rg.userData.__onumFFquick = ch.length + ":" + (ch[0] && ch[0].uuid) + ":" + (ch[ch.length-1] && ch[ch.length-1].uuid);
  }
  FF._roomOf = roomOf; FF._process = process;
  FF.scan = function(scene){
    if(!scene || !scene.children) return;
    for(var i = 0; i < scene.children.length; i++){
      var g = scene.children[i];
      if(g && g.isGroup && g.children.length > 40){
        g.userData = g.userData || {};
        try{ process(g); }catch(e){}
      }
    }
  };

  /* Hook: three r128 sets WebGLRenderer#render per instance (prototype wrapping misses it), but every
     render() calls scene.onBeforeRender(renderer, scene, camera) — defined on Object3D.prototype.
     A Scene.prototype override sees the game's scene without touching the game. */
  var SP = T.Scene && T.Scene.prototype;
  if(!SP) return;
  var prevOBR = SP.onBeforeRender, n = 0;
  SP.onBeforeRender = function(renderer, scene, camera){
    try{ if(!FF.disabled) FF.scan(this); }catch(e){}
    if(typeof prevOBR === "function") return prevOBR.apply(this, arguments);
  };
})();
