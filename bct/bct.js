(function(){ 
    var ourHealth, ourStamina, targetHealth, targetName, sdTimer, shTimer, tdTimer, alTimer; 
	var sprites = [], animating, lasts = {};
	var createSprite = function (type, pos, spd, text) {
	    var now = Date.now(), last = lasts[type] || now;
	    lasts[type] = now;
	    var p = function(n) {
	        if (n in pos) el.style[n] = (pos[n]|0) + 'px';
	    };
	    var id = type.split(' ')[0];
	    var el = document.createElement('div');
	    el.className = 'msg ' + type;
	    el.textContent = text;
	    el.id = id;
	    p("top");
	    p("left");
	    p("bottom");
	    p("right");
	    if (now - last < 1000) {
	        lasts[type] = now-1000;  // force toggle back to first col on next display
            if ("left" in pos) el.style.left = (pos.left + pos.off) + 'px';
            if ("right" in pos) el.style.right = (pos.right - pos.off) + 'px';
        }
	    document.body.appendChild(el);
	    sprites.push({
	        spd: spd,
            type: id,
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

        // If no more sprites to animate, cancel timer
	    if (sprites.length === 0) {
	        clearInterval(animating);
	        animating = undefined;
	    }
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
	var showCombatText = function(old, current, type) { 
		if (old !== undefined) {
			var dmg = current-old;
			if (old > current) {
			    // lost health/stamina
			    switch (type) {
			        case "sd": show(type, { left: 0, bottom: 0, off: 20 }, dmg); break;
			        case "td": show(type, { right: 0, bottom: 0, off: 20 }, dmg); break;
			        case "ss": show(type, { left: 15, bottom: 0, off: 20 }, dmg); break;
			    }
				
				// console.log(type + ' DAMAGE: ' + dmg);
			} else switch (type) {
			    case "sd": show("sh", { left: 55, bottom: 0, off: 15 }, dmg); break;
			    case "ss": show("rs", { left: 20, bottom: 0, off: 10 }, dmg); break;
			}
		}
	}; 
	var init = function () {
	    var lowHealth, lowTargetHealth, lowStamina;
		// track our own health 
	    cuAPI.OnCharacterHealthChanged(function (health, maxHealth) {
		    // console.log('HealthChange: ' + health + ' was ' + ourHealth + ' max ' + maxHealth);
		    if (health === -1 && maxHealth === -1) {
		        // resurection
		        ourHealth = undefined;
		    } else {
		        if (ourHealth !== undefined && health < ourHealth && health / maxHealth < 0.2) {
		            if (!lowHealth || lowHealth.node === null) {
		                lowHealth = show("al health", { top: 0 }, "LOW HEALTH!", 2000);
		            } else {
		                lowHealth.start = Date.now();           // extend display time of existing health warning
		            }
		        }
		        showCombatText(ourHealth, health, "sd");
		        ourHealth = health;
		    }
	    });
        // track stamina
	    cuAPI.OnCharacterStaminaChanged(function (stamina, maxStamina) {
	        // console.log('StaminaChange: ' + stamina + ' was ' + ourStamina + ' max ' + maxStamina);
	        if (stamina === -1 && maxStamina === -1) {
	            // resurection
	            ourStamina = undefined;
	        } else {
	            if (ourStamina !== undefined && stamina < ourStamina && stamina / maxStamina < 0.2) {
	                if (!lowStamina || lowStamina.node === null) {
	                    lowStamina = show("al stamina", { top: 0 }, "LOW STAMINA!", 2000);
	                } else {
	                    lowStamina.start = Date.now();           // extend display time of existing health warning
	                }
	            }
	            showCombatText(ourStamina, stamina, "ss");
	            ourStamina = stamina;
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
			            lowTargetHealth = show("al target", { bottom: 0 }, "FINISH HIM!", 2000);
			        } else {
			            lowTargetHealth.start = Date.now();
			        }
			    }
			    showCombatText(targetHealth, health, "td");
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