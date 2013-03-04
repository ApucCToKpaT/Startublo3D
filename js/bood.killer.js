var boodKiller = function(config){
	var p = config || {};
	this._index = p.index;
	this._type = p.type || 'human';
	this._health = p.health || 100;
	this._speed = p.speed || 140;
	this._angle = Math.random() * Math.PI / 2 - Math.PI / 2 + Math.PI;
	this._distance = 600 + Math.round(Math.random() * 300);
	
	var sX = Math.sin(this._angle), cX = Math.cos(this._angle), sY = Math.sin(0), cY = Math.cos(0);
	this._ax = sX * cY;
	this._ay = cX * cY;

	this._animations = {
		idle: {
			time: 0
		},
		attack: {
			time: 1,
		},
		death: {
			time: 1.0
		},
		crdeath: {
			time: 0.6
		}
	};

	this.load({
		skin: Math.round(Math.random() * 3),
		weapon: 0
	});
	
};

boodKiller.prototype = {
	constructor: boodKiller,
	// model loader
	load: function(config) {
		var p = config || {}, character, self = this, modelConfig = {
			baseUrl: 'data/killers/ratamahatta/',
			body: 'ratamahatta.js',
			skins: [ 'ratamahatta.png', 'ctf_b.png', 'dead.png', 'gearwhore.png', 'ctf_r.png'],
			weapons:  [[ 'w_hyperblaster.js', 'w_hyperblaster.png' ]]
		};

		this._character = new THREE.MD2Character();
		this._character.scale = 2;
		this._character.onLoadComplete = function() {
			self._character.setWeapon(p.weapon || 0);
			self._character.setSkin(p.skin || 0);

			self._mesh = self._character.root;
			self._mesh.position.set(self._distance * self._ax, self._distance * self._ay, 47);
			self._mesh.rotation.x = Math.PI / 2;
			self._mesh.rotation.y = -self._angle;
			bood.scene.add(self._mesh);
			self.add2map();
			self.setAnimation('run');
			self._loaded = true;
		}
		this._character.loadParts(modelConfig);
	},
	//
	add2map: function(){
		document.getElementById('radar').appendChild(this._pm = document.createElement('i'));
	},
	//
	healthUp: function(value){
		this.params.health += value || 1;
	},
	//
	healthDown: function(value){
		this.params.health -= value || 1;
	},
	// 
	setAnimation: function(name){
		if(name !== this._animationName){
			this._animationName = name;
			this._animationTime = 0;
			this._character.setAnimation(this._animationName);
		}
	},
	//
	attack: function(){
		this.destroy();
	},
	//
	destroy: function(){
		this._destroy = true;
		bood.scene.remove(this._mesh);
		bood.renderer.deallocateObject(this._mesh);
		//console.log('killer destroy complete', this._index);
	},
	//
	reset: function(){
		this._angle = Math.random() * Math.PI / 2 - Math.PI / 4 + Math.PI;
		this._distance = 600 + Math.round(Math.random() * 300);
		var sX = Math.sin(this._angle), cX = Math.cos(this._angle), sY = Math.sin(0), cY = Math.cos(0);
		this._ax = sX * cY;
		this._ay = cX * cY;
		this._health = 100;
		this._mesh.rotation.y = -this._angle;
		this._character.setSkin(Math.round(Math.random() * 3));
		if(Math.ceil(bood._frags / 10) > bood._boss){
			bood._boss++;
			if(this._mesh.position.z != 94){
				this._speed *= 2;
				this._mesh.scale.set(2, 2, 2);
				this._mesh.position.z = 94;
			}
			this._speed += 2;
			this._character.setSkin(4);
			this._health *= bood._boss + 1;
		} else {
			if(this._mesh.position.z == 94){
				this._speed /= 2;
				this._mesh.scale.set(1, 1, 1);
				this._mesh.position.z = 47;
				bood._player.addAmmo(10 * bood._boss);
			} else {
				bood._player.addAmmo(Math.ceil(Math.random() * 3));
			}
		}
		this.setAnimation('run');
	},
	//
	process: function(delta){
		if(this._destroy == true)
			return this;
		switch(this._animationName){
			case 'run':
			case 'crwalk':
				this._character.update( delta );
				this._distance -= delta * this._speed;
				this._mesh.position.x = this._distance * this._ax;
				this._mesh.position.y = this._distance * this._ay;
				this._pm.style.left = 50 - Math.round(this._mesh.position.x / 10) + 'px';
				this._pm.style.top = 50 + Math.round(this._mesh.position.y / 10) + 'px';
				if (this._distance < 150){
					this.setAnimation('attack');
				}
			break;
			case 'idle':
				this._character.update( delta );
			break;
			case 'attack':
				this._animationTime += delta;
				if(this._animationTime > this._animations[this._animationName].time){
					bood._player.healthDown(delta * 2 * Math.random() * 1.4);
					document.getElementById('blood').style.opacity = 0.5;
					setTimeout(function(){
						document.getElementById('blood').style.opacity = 0;
					}, 100);
				}
				this._character.update( delta );
			break;
			case 'death':
				this._animationTime += delta;
				if(this._animationTime < this._animations[this._animationName].time){
					this._character.update( delta );
				}
				if(this._animationTime > 2){
					if(this._health <= 0){
						bood._frags++;
						document.getElementById('frags').innerHTML = bood._frags;
						this.reset();
					} else {
						this.setAnimation('run');
					}
				}
			break;
			case 'crdeath':
				this._animationTime += delta;
				if(this._animationTime < this._animations[this._animationName].time){
					this._character.update( delta );
				}
				if(this._animationTime > 2){
					this.setAnimation('crwalk');
				}
			break;
			case 'fire':
				this._animationTime += delta;
				bood._aY += delta * 0.08;
				if(this._animationTime > this._animations[this._animationName].time){
					this.setAnimation('idle');
				}
			break;
		}
	}
};