var boodPlayer = function(config){
	var p = config || {};
	this._type = p.type || 'human';
	this._ammo = 0;
	this._health = 0;
	this._speed = p.speed || 1;
	var self = this;
	bood.utils.getModel('data/guns/weapon1.js', 'data/guns', function(d){
		self._mesh = d;
		self._mesh.material.materials[0].metal = true;
		self._mesh.material.materials[0].shininess = 15;
		self._mesh.scale.set(50, 50, 50);
		self._mesh.rotation.x = Math.PI / 2;
		self._mesh.rotation.y = Math.PI;
		bood.scene.add(self._mesh);
	});
	this._animations = {
		idle: {
			time: 0
		},
		fire: {
			time: 0.1
		}
	};
	this.addAmmo(100);
	this.addHealth(p.health || 100);
	this.setAnimation('idle');
};

boodPlayer.prototype = {
	constructor: boodPlayer,
	addAmmo: function(count){
		this._ammo += count;
		document.getElementById('ammo').innerHTML = this._ammo;
	},
	addHealth: function(count){
		this._health += count;
		document.getElementById('health').innerHTML = this._health;
	},
	//
	fire: function(){
		if(!bood._pause && this._ammo > 0){
			this.setAnimation('fire');
			bood._bullets.push(new boodBullet());
			this.addAmmo(-1);
		}
	},
	//
	healthUp: function(value){
		this._health += value || 1;
	},
	//
	healthDown: function(value){
		this._health -= value || 1;
		if(this._health <= 0){
			this._health = 0;
			bood.gameOver();
		}
		document.getElementById('health').innerHTML = Math.round(this._health);
	},
	//
	setAnimation: function(name){
		if(name !== this._animationName){
			this._animationName = name;
			this._animationTime = 0;
			//console.log('player state', this._animationName);
		}
	},
	//
	process: function(delta){
		if(this._mesh == undefined)
			return this;
		if(bood._keyDownList[37] == true || bood._keyDownList[65] == true){
			bood._aX -= delta * 1.8;
			bood._player._mesh.rotation.y = -bood._aX + Math.PI;
		}
		if(bood._keyDownList[39] == true || bood._keyDownList[68] == true){
			bood._aX += delta * 1.8;
			bood._player._mesh.rotation.y = -bood._aX + Math.PI;
		}

		if(bood._keyDownList[38] == true && bood._aY > - Math.PI / 12){
			bood._aY -= delta * 1.4;
		}
		if(bood._keyDownList[40] == true && bood._aY < Math.PI / 12){
			bood._aY += delta * 1.4;
		}
		switch(this._animationName){
			case 'idle':
				this._mesh.rotation.x = Math.PI / 2;
			break;
			case 'fire':
				this._animationTime += delta;
				bood._aY += delta * 0.12;
				if(this._animationTime > this._animations[this._animationName].time){
					bood._aY -= this._animations[this._animationName].time * 0.12;
					this.setAnimation('idle');
				}
			break;
		}
	}
};