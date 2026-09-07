/* tommyroldan.com look for Armawebtron — walls, floor grid, billboards. GPL-2.0 like the rest of this folder.
   Everything here wraps Armawebtron's own globals (settings, createWall, buildGrid) so the engine files stay stock. */
/* Bug fix for the stock build: player.js calls a global round(value, decimals) that no file defines, so the frame loop
   throws every frame once a cycle reaches that branch — the game stutters and dies. This defines it. */
if(typeof window.round !== "function")
{
	window.round = function(v, decimals){ var m = Math.pow(10, decimals || 0); return Math.round(v * m) / m; };
}

(function(){
	if(typeof settings === "undefined" || typeof THREE === "undefined") return;

	/* floor: the grid tile is grayscale, tinted by these three; light grey so it stays out of the way.
	   Presets (Classic etc.) repaint the floor, so the same values are re-applied every time the grid is built. */
	var FLOOR = [0.42, 0.44, 0.5];
	/* IMPORTANT: assigning a setting schedules its callback (FLOOR_* → updategrid → buildGrid). Assigning the same
	   value again would still schedule it, so only assign when the value differs — otherwise the grid rebuilds forever. */
	function pinFloor()
	{
		var changed = false;
		if(settings.FLOOR_RED !== FLOOR[0]){ settings.FLOOR_RED = FLOOR[0]; changed = true; }
		if(settings.FLOOR_GREEN !== FLOOR[1]){ settings.FLOOR_GREEN = FLOOR[1]; changed = true; }
		if(settings.FLOOR_BLUE !== FLOOR[2]){ settings.FLOOR_BLUE = FLOOR[2]; changed = true; }
		if(settings.FLOOR_DETAIL !== 3) settings.FLOOR_DETAIL = 3;
		return changed;
	}
	pinFloor();
	/* presets repaint the floor; re-pin once after a preset is applied */
	if(typeof preset === "function")
	{
		var stockPreset = preset;
		preset = function(){ var r = stockPreset.apply(this, arguments); setTimeout(pinFloor, 30); return r; };
	}
	window.__trGridBuilds = 0;

	/* walls: a cyclearena-style ribbon — a thin unlit translucent band in the rider's colour with bright edge lines
	   top and bottom, and low (about bike height) so turns read cleanly */
	var WALL_SCALE = 0.5;
	if(typeof createWall === "function")
	{
		var stockCreateWall = createWall;
		createWall = function(cycle, x, y)
		{
			var group = stockCreateWall(cycle, x, y);
			var wall = group.children[0], line = group.children[1];
			var bright = new THREE.Color(cycle.tailColor).lerp(new THREE.Color(0xffffff), 0.55);
			if(wall && wall.material)
			{
				wall.material = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, color: new THREE.Color(cycle.tailColor).lerp(new THREE.Color(0xffffff), 0.12), transparent: true, opacity: 0.5, depthWrite: false });
				wall.scale.z = WALL_SCALE;
				/* glow: a taller, fainter additive copy of the band behind it — a halo rising off the ribbon */
				var glow = new THREE.Mesh(wall.geometry, new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, color: cycle.tailColor, transparent: true, opacity: 0.28, depthWrite: false, blending: THREE.AdditiveBlending }));
				glow.scale.set(1, 1, 1.7); wall.add(glow);
				var glow2 = new THREE.Mesh(wall.geometry, new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, color: cycle.tailColor, transparent: true, opacity: 0.16, depthWrite: false, blending: THREE.AdditiveBlending }));
				glow2.scale.set(1, 1, 2.6); wall.add(glow2);
			}
			if(line && line.material)
			{
				line.material = new THREE.LineBasicMaterial({ color: bright });
				line.scale.z = WALL_SCALE;
				/* a second edge line along the floor: the two lines are what make it read as a ribbon of light */
				var base = new THREE.Line(line.geometry, line.material); base.scale.set(1, 1, 0.002); line.add(base); /* child of the line, so the group keeps its two children (their code indexes them) */
			}
			return group;
		};
	}

	/* billboards for the apps on the site, ringing the arena above the rim, plus a dark lit skyline behind them */
	var ADS = [
		["Canary","Tool","/assets/icons/canary.png"],["Rehab Pro","App","/assets/icons/rehabpro.png"],
		["SocialAudit","App","/assets/icons/social-audit.png"],["Clear Care Dental","App","/assets/icons/clear-care-dental.png"],
		["World Resort Rescue","Web","/assets/icons/world-resort-rescue.png"],["WrapMe","Web","/assets/icons/wrapme.png"],
		["Versatile Customs","App","/assets/icons/versatile-customs.jpg"],["Alexandra Rossi Portal","App","/assets/icons/alexandra-rossi.png"],
		["Dolce Vita Supplements","Web","/assets/icons/dolce-vita-supplements.png"],["La Dolce Vita Casa","Web","/assets/icons/la-dolce-vita-casa.png"],
		["NST Redesign","Web","/assets/icons/nst-redesign.png"],["PowerPoint Speech Tool","Tool","/assets/icons/powerpoint-speech-tool.png"]
	];
	var ACCENT = ["#00E0C6","#FF5F57","#FEBC2E","#8B7DFF","#4FC3FF","#F25CFF"];

	function adTexture(ad, accent)
	{
		var cv = document.createElement("canvas"); cv.width = 768; cv.height = 448; var x = cv.getContext("2d");
		var tex = new THREE.CanvasTexture(cv); tex.minFilter = THREE.LinearFilter;
		function paint(img)
		{
			x.fillStyle = "#06080d"; x.fillRect(0,0,768,448);
			x.strokeStyle = accent; x.lineWidth = 10; x.strokeRect(14,14,740,420);
			x.strokeStyle = "rgba(255,255,255,.18)"; x.lineWidth = 2; x.strokeRect(30,30,708,388);
			x.fillStyle = accent; x.fillRect(48,48,220,220); x.fillStyle = "#06080d"; x.fillRect(56,56,204,204);
			if(img)
			{
				x.save(); x.beginPath(); x.rect(56,56,204,204); x.clip();
				var r = Math.max(204/img.width, 204/img.height), w = img.width*r, h = img.height*r;
				x.drawImage(img, 56+(204-w)/2, 56+(204-h)/2, w, h); x.restore();
			}
			x.fillStyle = "#f2fffd"; x.font = "700 54px 'Space Grotesk',Archivo,sans-serif"; x.textBaseline = "top";
			var words = ad[0].split(" "), line = "", yy = 70, lines = [];
			words.forEach(function(w){ var t = (line ? line+" " : "")+w; if(x.measureText(t).width > 440 && line){ lines.push(line); line = w; } else line = t; });
			lines.push(line);
			lines.slice(0,2).forEach(function(l){ x.fillText(l, 300, yy); yy += 62; });
			x.fillStyle = accent; x.font = "600 30px ui-monospace,Menlo,monospace"; x.fillText(ad[1].toUpperCase(), 300, yy+12);
			x.fillStyle = "rgba(159,245,233,.7)"; x.font = "600 26px ui-monospace,Menlo,monospace"; x.fillText("TOMMYROLDAN.COM", 48, 330);
			x.fillStyle = accent; x.fillRect(48,372,672,6);
			tex.needsUpdate = true;
		}
		paint(null);
		var img = new Image(); img.onload = function(){ paint(img); }; img.src = ad[2];
		return tex;
	}

	var holderCache = null, holderKey = "";
	function addBillboards()
	{
		if(!engine.grid || !engine.logicalBox) return;
		if(/[?&](plain|nobillboards)=1/.test(location.search)) return; /* kill switch */
		var f = engine.REAL_ARENA_SIZE_FACTOR, b = engine.logicalBox;
		var minX = b.min.x*f, maxX = b.max.x*f, minY = b.min.y*f, maxY = b.max.y*f;
		var AW = maxX-minX, AH = maxY-minY, cx = (minX+maxX)/2, cy = (minY+maxY)/2;
		/* Armagetron scale: a wall is ~1 unit tall, so boards are sized to that, not to the arena */
		/* built once per arena size and reused: rebuilding the grid must not rebuild these */
		var key = AW.toFixed(1)+"x"+AH.toFixed(1);
		if(holderCache && holderKey === key){ engine.grid.add(holderCache); return; }
		var wallH = 0.75*WALL_SCALE, W = wallH*5, H = W*448/768, off = Math.max(AW*0.25, 40), z = H/2 + wallH*2.5;
		var spots = [];
		[0.22,0.5,0.78].forEach(function(t){ spots.push([minX+AW*t, minY-off]); spots.push([minX+AW*t, maxY+off]); });
		[0.3,0.7].forEach(function(t){ spots.push([minX-off, minY+AH*t]); spots.push([maxX+off, minY+AH*t]); });
		var holder = new THREE.Group(); holder.name = "tr-billboards";
		spots.forEach(function(sp, i)
		{
			var ad = ADS[i % ADS.length], accent = ACCENT[i % ACCENT.length];
			var m = new THREE.Mesh(new THREE.PlaneGeometry(W, H), new THREE.MeshBasicMaterial({ map: adTexture(ad, accent), side: THREE.DoubleSide }));
			m.position.set(sp[0], sp[1], z);
			m.up.set(0,0,1); m.lookAt(new THREE.Vector3(cx, cy, z));
			m.add(new THREE.LineSegments(new THREE.EdgesGeometry(m.geometry), new THREE.LineBasicMaterial({ color: accent })));
			var post = new THREE.Mesh(new THREE.BoxGeometry(W*0.05, W*0.05, z), new THREE.MeshBasicMaterial({ color: 0x0a0e14 }));
			post.position.set(sp[0], sp[1], z/2); holder.add(post);
			holder.add(m);
		});
		/* skyline */
		var seed = 7; function rnd(){ seed = (seed*16807) % 2147483647; return seed/2147483647; }
		for(var i=0;i<16;i++)
		{
			var side = i%4, t = rnd(), dist = off + wallH*(10+rnd()*60), w = wallH*(2+rnd()*4), h = wallH*(3+rnd()*10), x, y;
			if(side===0){ x = minX+AW*t; y = minY-dist; } else if(side===1){ x = minX+AW*t; y = maxY+dist; }
			else if(side===2){ x = minX-dist; y = minY+AH*t; } else { x = maxX+dist; y = minY+AH*t; }
			var g = new THREE.BoxGeometry(w, w, h), tower = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: 0x05070b }));
			tower.position.set(x, y, h/2);
			tower.add(new THREE.LineSegments(new THREE.EdgesGeometry(g), new THREE.LineBasicMaterial({ color: [0x0d6b62,0x4a2a7a,0x7a2340,0x0c4f7a][i%4], transparent: true, opacity: 0.75 })));
			holder.add(tower);
		}
		holderCache = holder; holderKey = key;
		engine.grid.add(holder);
	}

	if(typeof window.buildGrid === "function")
	{
		var stockBuildGrid = window.buildGrid;
		window.buildGrid = function(){ window.__trGridBuilds++; var r = stockBuildGrid.apply(this, arguments); try { addBillboards(); } catch(e){ console.warn("billboards:", e); } return r; };
	}
})();
