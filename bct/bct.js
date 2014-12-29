(function(){ 
	var ourHealth, targetHealth, targetName, sdTimer, shTimer, tdTimer; 
	var sd = document.getElementById("sd"),
		sh = document.getElementById("sh"),
		td = document.getElementById("td");
	var fadeOut = function(el) {
		el.className = "fadeOut";
        el.innerText = '';
	};
	var clearTextIn = function(el, ms) { 
		return setTimeout(function() { fadeOut(el); timer = null; }, ms); 
	};
	var show = function(el, dmg, timer) {
		if (timer) clearTimeout(timer);
		el.innerText = (dmg > 0 ? '+' : '') + dmg; 
		el.className = "msg fadeIn";
		return clearTextIn(el, Math.abs(dmg) < 5 ? 500 : 1000);
	};
	var showCombatText = function(old, current, self) { 
		if (old !== undefined) {
			var dmg = current-old;
			if (old > current) { 
				if (self) {
					sdTimer = show(sd, dmg, sdTimer);
					// console.log('SELF DAMAGE: ' + dmg);
				} else {
					tdTimer = show(td, dmg, tdTimer);
					// console.log('TARGET DAMAGE: ' + dmg);
				}
			} else if (self) {
				shTimer = show(sh, dmg, shTimer);
				// console.log('HEAL: ' + dmg);
			}
		}
	}; 
	var init = function() { 
		// track our own health 
		cuAPI.OnCharacterHealthChanged(function(health, maxHealth) {
		    // console.log('HealthChange: ' + health + ' was ' + ourHealth + ' max ' + maxHealth);
		    if (health === -1 && maxHealth === -1) {
		        // resurection
		        ourHealth = undefined;
		    } else {
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