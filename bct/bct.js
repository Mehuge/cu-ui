(function(){ 
	var ourHealth, targetHealth, targetName, sdTimer, shTimer, tdTimer, alTimer; 
	var sprites = [], animating, lasts = {};
	var createSprite = function (type, pos, spd, text) {
	    var now = Date.now(), last = lasts[type] || now;
	    lasts[type] = now;
	    var p = function(n) {
	        if (n in pos) el.style[n] = (pos[n]|0) + 'px';
	    };
	    var el = document.createElement('div');
	    el.className = 'msg ' + type;
	    el.textContent = text;
	    el.id = type;
	    p("top");
	    p("left");
	    p("bottom");
	    p("right");
	    if (now - last < 1000) {
	        lasts[type] = now-1000;  // force toggle back to first col on next display
            if ("left" in pos) el.style.left = (pos.left + 20) + 'px';
            if ("right" in pos) el.style.right = (pos.right - 20) + 'px';
        }
	    document.body.appendChild(el);
	    sprites.push({
	        spd: spd,
            type: type,
            style: el.style,
            node: el,
            start: now
	    });
	    return sprites[sprites.length - 1];
	}
	var renderFrame = function () {
	    var n = Date.now(), ns = [];
	    for (var i = 0; i < sprites.length; i++) {
	        var s = sprites[i];
	        switch (s.type) {
	        case "al":
	            if (s.start + s.spd < n) {
	                document.body.removeChild(s.node);
	                s.node = null;
	            } else {
	                ns.push(s);
	            }
	            break;
	        default:
	            // animate this sprite
	            var top = s.node.offsetTop;
	            if (top < s.spd) {
	                // sprite ended
	                document.body.removeChild(s.node);
	            } else {
	                top -= s.spd;
	                s.style.top = top + 'px';
	                ns.push(s);
	            }
	            break;
	        }
	    };
	    sprites = ns;
	};
	var animate = function () {
	    if (sprites.length && animating === undefined) {
	        animating = setInterval(renderFrame, 100);
	    }
	};
	var show = function (type, pos, dmg, spd) {
	    spd = spd || (Math.abs(dmg) < 5 ? 2 : 1);
	    var sprite = createSprite(type, pos, spd, ((dmg | 0) > 0 ? '+' : '') + dmg);
	    animate();
	    return sprite;
	};
	var showCombatText = function(old, current, self) { 
		if (old !== undefined) {
			var dmg = current-old;
			if (old > current) { 
				if (self) {
				    show("sd", { left: 0, bottom: 0 }, dmg);
					// console.log('SELF DAMAGE: ' + dmg);
				} else {
				    show("td", { right: 0, bottom: 0 }, dmg);
					// console.log('TARGET DAMAGE: ' + dmg);
				}
			} else if (self) {
			    show("sh", { left: 50, bottom: 0 }, dmg);
				// console.log('HEAL: ' + dmg);
			}
		}
	}; 
	var init = function () {
	    var lowHealth, lowTargetHealth;
		// track our own health 
	    cuAPI.OnCharacterHealthChanged(function (health, maxHealth) {
		    // console.log('HealthChange: ' + health + ' was ' + ourHealth + ' max ' + maxHealth);
		    if (health === -1 && maxHealth === -1) {
		        // resurection
		        ourHealth = undefined;
		    } else {
		        if (ourHealth !== undefined && health < ourHealth && health / maxHealth < 0.2) {
		            if (!lowHealth || lowHealth.node === null) {
		                lowHealth = show("al", { top: 0 }, "LOW HEALTH!", 2000);
		            } else {
		                lowHealth.start = Date.now();           // extend display time of existing health warning
		            }
		        }
		        showCombatText(ourHealth, health, true);
		        ourHealth = health;
		    }
		});
        // track enemy health
		cuAPI.OnEnemyTargetHealthChanged(function(health, maxHealth) { 
			// console.log('TargetHealthChange: ' + health + ' was ' + targetHealth + ' max ' + maxHealth);
			if (health === -1 && maxHealth === -1) {
				// no target
			} else {
			    if (targetHealth !== undefined && health < targetHealth && health / maxHealth < 0.2) {
			        if (!lowTargetHealth || lowTargetHealth.node === null) {
			            lowTargetHealth = show("al", { bottom: 0 }, "FINISH HIM!", 2000);
			        } else {
			            lowTargetHealth.start = Date.now();
			        }
			    }
			    showCombatText(targetHealth, health, false);
				targetHealth = health; 
			}
		});
        // track enemy target changes
		cuAPI.OnEnemyTargetNameChanged(function(name) {
			// console.log('TargetChange: ' + name);			
			if (name.length === 0) {
				targetName = targetHealth = undefined;
			} else {
				if (targetName !== name) {
					targetHealth = undefined;
				}
				targetName = name;
			}
		});
	};  
	// initialise 
	if (typeof cuAPI !== "undefined") { 
		if (cuAPI.initialized) {  // already initialised
			init();
		} else {
			cuAPI.OnInitialized(init);
		}
	} 
})();