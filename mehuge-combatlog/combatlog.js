(function () {
    var maxHeight = window.innerHeight;
    var ourName, ourHealth, ourStamina, targetHealth, targetName, friendlyHealth, friendlyName;
    var combatLog = document.getElementById("combatlog");
    var combat = { log: function(className, text) {
        var div = document.createElement('div');
        div.className = className;
        div.textContent = text;
        combatlog.appendChild(div);
        var h = combatLog.offsetHeight;
        while (h > maxHeight) {
            var remove = combatLog.children[0];
            if (remove._fadeOutTimer) {
                clearTimeout(remove._fadeOutTimer);
                remove._fadeOutTimer = null;
            }
            h -= remove.offsetHeight;
            combatLog.removeChild(remove);
        }
        (function (fade) {
            function fadeOut() {
                if (fade._fadeOutTimer) {
                    var op = +(fade.style.opacity || 1.0);
                    fade.className = fade.className.replace(" shadow", "");
                    // console.log('Opacity : ' + op + ' x10 > 1 ' + (((op * 10) | 0) > 1));
                    if (((op*10)|0) > 1) {                  // crude way to round to 1 decimal place
                        fade.style.opacity = op - 0.025;
                        fade._fadeOutTimer = setTimeout(fadeOut, 100);
                    } else {
                        fade.style.opacity = 0;
                    }
                }
            }
            fade._fadeOutTimer = setTimeout(fadeOut, 30000);
        })(div);
    }};
	var init = function () {
		// track our own health 
	    cuAPI.OnCharacterHealthChanged(function (health, maxHealth) {
		    // console.log('HealthChange: ' + health + ' was ' + ourHealth + ' max ' + maxHealth);
		    if (health === -1 && maxHealth === -1) {
		        // resurection
		        ourHealth = undefined;
		    } else {
		        if (typeof ourHealth !== "undefined") {
		            var diff = ourHealth - health;
		            if (diff > 0) {
		                combat.log('health lost', 'You took ' + diff + ' damage.');
		                if (diff > 10) {
		                    (new Audio("hit.wav")).play();
		                }
		            } else {
		                combat.log('health gained', 'You were healed for ' + (-diff) + '.');
		            }
		        }
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
	            if (typeof ourStamina !== "undefined") {
	                var diff = ourStamina - stamina;
	                if (diff > 0) {
	                    combat.log('stamina lost', 'You used ' + diff + ' stamina.');
	                } else {
	                    combat.log('stamina gained', 'You recovered ' + (-diff) + ' stamina.');
	                }
	            }
	            ourStamina = stamina;
	        }	    
	    });
        // track enemy health
		cuAPI.OnEnemyTargetHealthChanged(function(health, maxHealth) { 
			// console.log('TargetHealthChange: ' + health + ' was ' + targetHealth + ' max ' + maxHealth);
			if (health === -1 && maxHealth === -1) {
				// no target
			} else {
			    if (typeof targetHealth !== "undefined") {
			        var diff = targetHealth - health;
			        if (diff > 0) {
			            combat.log('enemy lost', targetName + ' took ' + diff + ' damage.');
			        } else {
			            combat.log('enemy gained', targetName + ' recovered ' + (-diff) + ' health.');
			        }
			    }
			    targetHealth = health;
			}
		});
	    // track enemy target changes
		cuAPI.OnCharacterNameChanged(function (name) {
		    // console.log('TargetChange: ' + name);			
		    if (name.length === 0) {
		        ourName = ourHealth = undefined;
		    } else {
		        if (ourName !== name) {
		            ourHealth = undefined;
		        }
		        ourName = name;
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
	    // track friendly target changes
		cuAPI.OnFriendlyTargetNameChanged(function (name) {
		    // console.log('TargetChange: ' + name);			
		    if (name.length === 0) {
		        friendlyName = friendlyHealth = undefined;
		    } else {
		        if (friendlyName !== name) {
		            friendlyHealth = undefined;
		        }
		        friendlyName = name;
		    }
		});
	    // track enemy health
		cuAPI.OnFriendlyTargetHealthChanged(function (health, maxHealth) {
		    // console.log('TargetHealthChange: ' + health + ' was ' + targetHealth + ' max ' + maxHealth);
		    if (health === -1 && maxHealth === -1) {
		        // no target
		    } else {
		        if (typeof friendlyHealth !== "undefined" && friendlyName !== ourName) {
		            var diff = friendlyHealth - health;
		            if (diff > 0) {
		                combat.log('friendly lost', friendlyName + ' took ' + diff + ' damage.');
		            } else {
		                combat.log('friendly gained', friendlyName + ' was healed for ' + (-diff) + '.');
		            }
		        }
		        friendlyHealth = health;
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