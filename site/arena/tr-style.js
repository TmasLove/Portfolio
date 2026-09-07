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
	function pinFloor(){ settings.FLOOR_RED = FLOOR[0]; settings.FLOOR_GREEN = FLOOR[1]; settings.FLOOR_BLUE = FLOOR[2]; settings.FLOOR_DETAIL = 3; }
	pinFloor();

	/* walls: taller, additive light with a bright top edge (the cyberpunk look), same colours the players chose */
	var WALL_SCALE = 1.9;
	if(typeof createWall === "function")
	{
		var stockCreateWall = createWall;
		createWall = function(cycle, x, y)
		{
			var group = stockCreateWall(cycle, x, y);
			var wall = group.children[0], line = group.children[1];
			if(wall && wall.material)
			{
				wall.material = new THREE.MeshBasicMaterial({
					side: THREE.DoubleSide, color: cycle.tailColor,
					transparent: true, opacity: 0.55, depthWrite: false, blending: THREE.AdditiveBlending
				});
				wall.scale.z = WALL_SCALE;
			}
			if(line && line.material)
			{
				line.material = new THREE.LineBasicMaterial({ color: cycle.tailColor, transparent: true, opacity: 1 });
				line.scale.z = WALL_SCALE;
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

	function addBillboards()
	{
		if(!engine.grid || !engine.logicalBox) return;
		var f = engine.REAL_ARENA_SIZE_FACTOR, b = engine.logicalBox;
		var minX = b.min.x*f, maxX = b.max.x*f, minY = b.min.y*f, maxY = b.max.y*f;
		var AW = maxX-minX, AH = maxY-minY, cx = (minX+maxX)/2, cy = (minY+maxY)/2;
		/* Armagetron scale: a wall is ~1 unit tall, so boards are sized to that, not to the arena */
		var wallH = 0.75*WALL_SCALE, W = Math.min(AW*0.14, wallH*22), H = W*448/768, off = Math.max(AW*0.08, wallH*6), z = H/2 + wallH*3.5;
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
		for(var i=0;i<30;i++)
		{
			var side = i%4, t = rnd(), dist = off + wallH*(6+rnd()*30), w = wallH*(2+rnd()*5), h = wallH*(4+rnd()*22), x, y;
			if(side===0){ x = minX+AW*t; y = minY-dist; } else if(side===1){ x = minX+AW*t; y = maxY+dist; }
			else if(side===2){ x = minX-dist; y = minY+AH*t; } else { x = maxX+dist; y = minY+AH*t; }
			var g = new THREE.BoxGeometry(w, w, h), tower = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: 0x05070b }));
			tower.position.set(x, y, h/2);
			tower.add(new THREE.LineSegments(new THREE.EdgesGeometry(g), new THREE.LineBasicMaterial({ color: [0x0d6b62,0x4a2a7a,0x7a2340,0x0c4f7a][i%4], transparent: true, opacity: 0.75 })));
			holder.add(tower);
		}
		engine.grid.add(holder);
	}

	if(typeof window.buildGrid === "function")
	{
		var stockBuildGrid = window.buildGrid;
		window.buildGrid = function(){ pinFloor(); var r = stockBuildGrid.apply(this, arguments); try { addBillboards(); } catch(e){ console.warn("billboards:", e); } return r; };
	}
})();
