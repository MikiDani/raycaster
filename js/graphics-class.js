export default class GaphicsClass {
	map;
	menuElement;
	floorTexture;
	context;
	rays;
	screenColorize;

	spriteGrid;
	constructor ({mapDataClass: mapDataClass, spritesClass: spritesClass, texturesClass: texturesClass, CELL_SIZE: CELL_SIZE, player: player, menu: menu, gamePlay: gamePlay, check: check})
	{
		this.texturesClass = texturesClass
		this.spritesClass = spritesClass
		this.mapDataClass = mapDataClass
		//--------------------------------------------------------------------
		this.SCREEN_WIDTH = window.innerWidth
		this.SCREEN_HEIGHT = window.innerHeight
		this.GAME_WIDTH = 1250
		this.GAME_HEIGHT = 700

		this.CELL_SIZE = CELL_SIZE
		this.WALKINTERVAL = -7
		this.FOV = this.toRadians(60)
		this.MINIMAP_SCALE = 0.25
		this.MINIMAP_X = (this.GAME_WIDTH / 2) - (this.MINIMAP_SCALE * CELL_SIZE) * 30
		this.MINIMAP_Y = (this.GAME_HEIGHT / 2) - (this.GAME_HEIGHT / 2.5)
		this.PLAYER_SIZE = 10
		this.SPRITE_SIZE = 10
		//--------------------------------------------------------------------
		this.map = []
		this.player = player
		this.menuElement = ""
		this.menu = menu
		this.gamePlay = gamePlay
		this.check = check
		
		this.floorTexture = ['floor', 'floor1']

		this.context
		this.rays

		this.screenColorize = {
			switch: false,
			color: null,
			alpha: null,
			time: null,
			action: null,
		}

		this.spriteGrid = {
			angle: 0,
			x: 0,
			y: 0,
			minimapLength: this.CELL_SIZE
		}

		window.addEventListener("resize", () => {
			document.body.style.backgroundColor = "black";
			this.gameResize()
		});

		this.gameResize()
	}

	gameResize() {
		this.SCREEN_WIDTH = window.innerWidth
		this.SCREEN_HEIGHT = window.innerHeight

		this.SLIP_WIDTH = Math.floor(-(this.GAME_WIDTH/100) * 10)
		this.GAME_WIDTH3D = this.GAME_WIDTH + (2 * Math.abs(this.SLIP_WIDTH))
		this.NUMBER_OF_RAYS = Math.floor(this.GAME_WIDTH3D / 6)
		this.GRID_SIZE = Math.floor(this.GAME_WIDTH3D / this.NUMBER_OF_RAYS)
		this.makeScreen()
		this.makeMenu()
	}

	clrScr() {
		this.context.fillStyle = 'black'
		this.context.fillRect(this.SLIP_WIDTH, 0, this.GAME_WIDTH3D, this.SCREEN_WIDTH)
	}

	screenColorizeAction() {
		if (this.screenColorize.switch) {
        	this.context.fillStyle = `rgba(${this.screenColorize.color}, ${this.screenColorize.alpha})`
			this.context.fillRect(0, 0, this.GAME_WIDTH, this.GAME_HEIGHT)
		}
	}
	
	screenColorizeOptions(colorizeOption) {
		if (!this.screenColorize.switch) {
			this.screenColorize.switch = true
			this.screenColorize.color = colorizeOption.color
			this.screenColorize.alpha = colorizeOption.alpha
			this.screenColorize.action = setInterval(() => {
				this.screenColorize.switch = false
				this.screenColorize.color = null
				this.screenColorize.alpha = null
				clearInterval(this.screenColorize.action)
			}, colorizeOption.time);
		}
	}

	makeScreen() {
		if($("#container").length > 0) {
			$('#container').html('')
			const container = document.getElementById('container')
		} else {
			const container = document.createElement('div')
			container.setAttribute('id', 'container')
			container.style.width = this.SCREEN_WIDTH + 'px'
			container.style.height = this.SCREEN_HEIGHT + 'px'
			document.body.appendChild(container)
		}
		const loading = document.createElement("div")
		loading.setAttribute('id', 'loading')
		loading.style.display = 'none'
		loading.style.width = '300px'
		loading.style.height = '70px'
		loading.style.textAlign = 'center'
		loading.style.margin = '0 auto'
		loading.style.paddingTop = '20px'
		loading.textContent = 'Loading...'
		loading.classList.add("loading-box");
		container.appendChild(loading)

		this.menuElement = document.createElement("div")
		this.menuElement.style.width = this.GAME_WIDTH + 'px'
		this.menuElement.style.height = this.GAME_HEIGHT + 'px'
		this.menuElement.style.display='block'
		this.menuElement.setAttribute('id', 'menu-bg')
		this.menuElement.setAttribute('margin', '0 auto')
		this.menuElement.style.margin = '0 auto'
		this.menuElement.style.backgroundSize = 'cover'
		this.menuElement.style.backgroundImage = 'url("./img/menu/bg-menu.jpg")'
		container.appendChild(this.menuElement)

		const canvas = document.createElement("canvas")
		canvas.setAttribute('id', 'canvas')
		canvas.setAttribute('width', this.GAME_WIDTH)
		canvas.setAttribute('height', this.GAME_HEIGHT)
		canvas.style.display='none'
		container.appendChild(canvas)
		this.context = canvas.getContext('2d')
		this.context.imageSmoothingEnabled = false
	}

	makeMenu() {
		$("#menu-bg").html('')
		let menuElementContent = `
			<div><img src="./img/menu/menu-logo.png" alt="Yukio Ninja" class="logo-position" style="display:block;"/></div>
			<div id="menu-box" class="mx-auto col-4 pt-5">`;
				if (this.menu.optionsActive) {
					
					let infopanelSelected = (this.menu.infoSwitch) ? 'selected' : null;
					let minimapSelected = (this.menu.mapSwitch) ? 'selected' : null;

					menuElementContent += `
					<div id="menu-options-back" class="menu-element row">
						<div class="menu-row col-2 bg-menu-selector d-flex justify-content-center align-items-center"><img src="./img/menu/star-selector.gif" style="display:none;"></div>
						<div class="menu-row col d-flex justify-content-start align-items-center">
							<span>Back</span>
						</div>
					</div>`;
					menuElementContent += `
					<div id="menu-infopanel" class="menu-element row">
						<div class="menu-row col-2 bg-menu-selector d-flex justify-content-center align-items-center"><img src="./img/menu/star-selector.gif" style="display:none;"></div>
						<div class="menu-row col d-flex justify-content-start align-items-center">
							<span>infopanel:</span>
							<select id="infopanel-select" name="infopanel" class="form-control form-control-sm control-small-width ms-5 invisible-pointer">
								<option value="0">Ki</option>
								<option value="1" ${infopanelSelected}>Be</option>
							</select>
						</div>
					</div>`;
					menuElementContent += `
					<div id="menu-minimap" class="menu-element row">
						<div class="menu-row col-2 bg-menu-selector d-flex justify-content-center align-items-center"><img src="./img/menu/star-selector.gif" style="display:none;"></div>
						<div class="menu-row col d-flex justify-content-start align-items-center">
							<span>Minimap:</span>
							<select id="minimap-select" name="minimap" class="form-control form-control-sm control-small-width ms-5 invisible-pointer">
								<option value="0">Ki</option>
								<option value="1" ${minimapSelected}>Be</option>
							</select>
						</div>
					</div>`;
				} else {
					if(this.gamePlay.gameLoaded) {
						menuElementContent += `
						<div id="menu-resume" class="menu-element row">
							<div class="menu-row col-2 bg-menu-selector d-flex justify-content-center align-items-center"><img src="./img/menu/star-selector.gif" style="display:none;"></div>
							<div class="menu-row col d-flex justify-content-start align-items-center text-warning">RESUME GAME</div>
						</div>`;
					} else {
						menuElementContent += `
						<div id="menu-new" class="menu-element row">
							<div class="menu-row col-2 bg-menu-selector d-flex justify-content-center align-items-center"><img src="./img/menu/star-selector.gif" style="display:block;"></div>
							<div class="menu-row col d-flex justify-content-start align-items-center text-danger">NEW GAME</div>
						</div>`;
					}
	
					menuElementContent += `
					<div id="menu-options" class="menu-element row">
					<div class="menu-row col-2 bg-menu-selector d-flex justify-content-center align-items-center"><img src="./img/menu/star-selector.gif" style="display:none;"></div>
					<div class="menu-row col d-flex justify-content-start align-items-center">OPTIONS</div>
					</div>`;
	
					if(this.gamePlay.gameLoaded) {
						menuElementContent += `
						<div id="menu-end" class="menu-element row">
						<div class="menu-row col-2 bg-menu-selector d-flex justify-content-center align-items-center"><img src="./img/menu/star-selector.gif" style="display:none;"></div>
						<div class="menu-row col d-flex justify-content-start align-items-center">END GAME</div>
						</div>`;
					}
				}
			menuElementContent += `</div>`;
		$("#menu-bg").append(menuElementContent)
	}

	toAngle(rad) {
		let degrees = (rad * 180) / Math.PI;
		degrees %= 360;
		if (degrees < 0) {
			degrees += 360;
		}
		return degrees;
	}
	
	toRadians(deg) {
		let radians = ((deg * Math.PI) / 180);
		radians %= (2 * Math.PI);
		if (radians < 0) {
			radians += (2 * Math.PI);
		}
		return radians;
	}

	calcDirX(angle) {
		let returnValue = Math.abs(Math.floor((angle - Math.PI/2) / Math.PI) % 2);
		returnValue = (returnValue == 0) ? -1 : returnValue;
		return returnValue;
	}
	
	calcDirY(angle) {
		let returnValue = Math.abs(Math.floor(angle / Math.PI) % 2);
		returnValue = (returnValue == 0) ? -1 : returnValue;
		return returnValue;
	}

	calculatePercentage(value, percentage) {
		return (value * percentage) / 100;
	}

	fixFhishEye(distance, angle, playerAngle) {
		const diff = angle - playerAngle;
		return distance * Math.cos(diff)
	}

	outOfMapBounds(x, y) {
		return x < 0 || x >= this.mapDataClass.map[0].length || y < 0 || y >= this.mapDataClass.map.length;
	}

	distance(x1, y1, x2, y2) {
		return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
	}

	colorDarkening(color, size) {
		var rgbaArr = color.match(/\d+(\.\d+)?/g)
		let r = Math.floor(parseInt(rgbaArr[0]) * (1 - size))
		let g = Math.floor(parseInt(rgbaArr[1]) * (1 - size))
		let b = Math.floor(parseInt(rgbaArr[2]) * (1 - size))
		let a = Math.min(parseFloat(rgbaArr[3]));
		return "rgba(" + r + ", " + g + ", " + b + ", " + a + ")";
	}

	cutOutX(x) {
		x = (x > this.GAME_WIDTH) ? this.GAME_WIDTH : x;
		x = (x < 0) ? 0 : x;
		return x;
	}
	
	cutOutY(y) {
		y = (y > this.GAME_HEIGHT) ? this.GAME_HEIGHT : y;
		y = (y < 0) ? 0 : y;
		return y;
	}
	
	calcShadowDistance(distance) {
		let shadowDistance = (distance / 160) * 0.1;
		shadowDistance = (shadowDistance > 1) ? 1 : shadowDistance;
		shadowDistance = shadowDistance.toFixed(1);
		return shadowDistance
	}

	getVCrash(angle) {
		// VERTICAL CHECK
		const right = Math.abs(Math.floor((angle-Math.PI/2) / Math.PI) % 2)
		const up = Math.abs(Math.floor(angle / Math.PI) % 2)

		const firstX = (right)
		? Math.floor(this.player.x / this.CELL_SIZE) * this.CELL_SIZE + this.CELL_SIZE
		: Math.floor(this.player.x / this.CELL_SIZE) * this.CELL_SIZE;
		
		const firstY = this.player.y + (firstX - this.player.x) * Math.tan(angle)
		
		const xA = right ? this.CELL_SIZE : -this.CELL_SIZE;
		const yA = xA * Math.tan(angle)

		let wall;
		let nextX = firstX;
		let nextY = firstY;
		let actCellY;
		let lastCellX;
		let lastCellY;

		while(!wall) {
			const cellX = (right) ? Math.floor(nextX / this.CELL_SIZE) : Math.floor(nextX / this.CELL_SIZE) - 1;
			const cellY = Math.floor(nextY / this.CELL_SIZE)

			if(this.outOfMapBounds(cellX, cellY)) break;

			wall = (this.mapDataClass.map[cellY][cellX]) ? true : false;
			actCellY = cellY

			if(!wall) {
				nextX += xA; nextY += yA;
			} else {
				lastCellX = cellX; lastCellY = cellY;
			}
		}

		let start = (!right)
			? (this.CELL_SIZE - (Math.floor(((nextY / this.CELL_SIZE) - actCellY) * this.CELL_SIZE)) - 1)
			: Math.floor(((nextY / this.CELL_SIZE) - actCellY) * this.CELL_SIZE);

		return {
			// wall : wall,
			wallX: lastCellX,
			wallY: lastCellY,
			angle,
			distance: this.distance(this.player.x, this.player.y, nextX, nextY),
			vertical: true,
			start: start,
			dirX: right,
			dirY: up,
			rayDirX: nextX,
			rayDirY: nextY,
		}
	}

	getHCrash(angle) {
		// HORIZONTAL CHECK
		const up = Math.abs(Math.floor(angle / Math.PI) % 2)
		const right = Math.abs(Math.floor((angle-Math.PI/2) / Math.PI) % 2)
		
		const firstY = (up)
		? Math.floor(this.player.y / this.CELL_SIZE) * this.CELL_SIZE
		: Math.floor(this.player.y / this.CELL_SIZE) * this.CELL_SIZE + this.CELL_SIZE;

		const firstX = this.player.x + (firstY - this.player.y) / Math.tan(angle)
		const yA = up ? -this.CELL_SIZE : this.CELL_SIZE;
		const xA = yA / Math.tan(angle)

		let wall;
		let nextX = firstX;
		let nextY = firstY;
		let actCellX;
		let lastCellX;
		let lastCellY;

		while(!wall) {
			const cellX = Math.floor(nextX / this.CELL_SIZE)
			const cellY = (up) ? Math.floor(nextY / this.CELL_SIZE) - 1 : Math.floor(nextY / this.CELL_SIZE);

			if(this.outOfMapBounds(cellX, cellY)) break;

			wall = (this.mapDataClass.map[cellY][cellX]) ? true : false;
			actCellX = cellX

			if(!wall) {
				nextX += xA; nextY += yA;
			} else {
				lastCellX = cellX; lastCellY = cellY;
			}

		}

		let start = (!up) 
			? (this.CELL_SIZE - (Math.floor(((nextX / this.CELL_SIZE) - actCellX) * this.CELL_SIZE)) - 1)
			: Math.floor(((nextX / this.CELL_SIZE) - actCellX) * this.CELL_SIZE);

		return {
			// wall: wall,
			wallX: lastCellX,
			wallY: lastCellY,
			angle,
			distance: this.distance(this.player.x, this.player.y, nextX, nextY),
			vertical: false,
			start: start,
			dirY: up,
			dirX: right,
			rayDirX: nextX,
			rayDirY: nextY,
		}
	}

	castRay(angle) {
		const vCrash = this.getVCrash(angle)
		const hCrash = this.getHCrash(angle)
		return (hCrash.distance >= vCrash.distance) ? vCrash : hCrash;
	}

	getRays() {
		const initialAngle = this.player.angle - (this.FOV/2)
		const angleStep = this.FOV / this.NUMBER_OF_RAYS
	
		return Array.from({length: this.NUMBER_OF_RAYS}, (_, i) => {
			const angle = initialAngle + i * angleStep;
			const ray = this.castRay(angle)
			return ray
		})
	}
	
	loadTexture(textureType, texturePlace) {
		if (this.texturesClass[textureType]) {
			let actualTexture = this.texturesClass[textureType]
			for (const key of texturePlace) {
				if (actualTexture && actualTexture[key]) {
					actualTexture = actualTexture[key];
				} else {
					return this.texturesClass.errorTextures['error']['error']
				}
			}
			return actualTexture
		}
		return this.texturesClass.errorTextures['error']['error']
	}

	loadTexture2(classType, textureType, texturePlace) {
		if (classType[textureType]) {
			let actualTexture = classType[textureType]
			for (const key of texturePlace) {
				if (actualTexture && actualTexture[key]) {
					actualTexture = actualTexture[key];
				} else {
					return this.texturesClass.errorTextures['error']['error']
				}
			}
			return actualTexture
		}
		return this.texturesClass.errorTextures['error']['error']
	}

	renderMinimap(rays) {
		const cellSize = this.MINIMAP_SCALE * this.CELL_SIZE;
		// WALLS
		this.mapDataClass.map.forEach((row, y) => {
			row.forEach((cell, x) => {
				if(cell) {
					if (cell.type == 'door') this.context.fillStyle = 'gold'
					else this.context.fillStyle = 'gray'

					this.context.fillRect(
						this.MINIMAP_X + (x * cellSize),
						this.MINIMAP_Y + (y * cellSize),
						cellSize,
						cellSize,
					);
				}
			});
		});
		
		// FOV RAYS
		if (true) {
			rays.forEach(ray => {
				this.context.strokeStyle = 'yellow'
				this.context.lineWidth = 1;
				this.context.beginPath()
				this.context.moveTo(this.MINIMAP_X +(this.player.x * this.MINIMAP_SCALE), this.MINIMAP_Y + (this.player.y * this.MINIMAP_SCALE))
				this.context.lineTo(
					this.MINIMAP_X + ((this.player.x + (Math.cos(ray.angle) * ray.distance)) * this.MINIMAP_SCALE),
					this.MINIMAP_Y + ((this.player.y + (Math.sin(ray.angle) * ray.distance)) * this.MINIMAP_SCALE),
				)
				this.context.closePath()
				this.context.stroke()
			});
		}
	
		// PLAYER
		this.context.fillStyle = 'blue';
		this.context.fillRect(
			this.MINIMAP_X + (this.player.x * this.MINIMAP_SCALE) - (this.PLAYER_SIZE/2),
			this.MINIMAP_Y + (this.player.y * this.MINIMAP_SCALE) - (this.PLAYER_SIZE/2),
			this.PLAYER_SIZE,
			this.PLAYER_SIZE,
		)
	
		// PLAYER RAY
		const rayLength = this.PLAYER_SIZE * 5;
	
		this.context.strokeStyle = 'orange'
		this.context.lineWidth = 4;
		this.context.beginPath()
		this.context.moveTo(this.MINIMAP_X + (this.player.x * this.MINIMAP_SCALE), this.MINIMAP_Y + (this.player.y * this.MINIMAP_SCALE))
		this.context.lineTo(
			this.MINIMAP_X + ((this.player.x + (Math.cos(this.player.angle) * rayLength)) * this.MINIMAP_SCALE),
			this.MINIMAP_Y + ((this.player.y + (Math.sin(this.player.angle) * rayLength)) * this.MINIMAP_SCALE),
		)
		this.context.closePath()
		this.context.stroke()

		// --------------------

		// MEROLEGES
		const merolegesHossz = this.PLAYER_SIZE * 5;
	
		this.context.strokeStyle = 'green'
		this.context.lineWidth = 4;
		this.context.beginPath()
		this.context.moveTo(this.MINIMAP_X + (this.player.x * this.MINIMAP_SCALE), this.MINIMAP_Y + (this.player.y * this.MINIMAP_SCALE))
		this.context.lineTo(
			this.MINIMAP_X + ((this.player.x + (Math.cos(this.player.angle - this.toRadians(90)) * merolegesHossz)) * this.MINIMAP_SCALE),
			this.MINIMAP_Y + ((this.player.y + (Math.sin(this.player.angle - this.toRadians(90)) * merolegesHossz)) * this.MINIMAP_SCALE),
		)
		this.context.closePath()
		this.context.stroke()

		this.context.strokeStyle = 'blue'
		this.context.lineWidth = 4;
		this.context.beginPath()
		this.context.moveTo(this.MINIMAP_X + (this.player.x * this.MINIMAP_SCALE), this.MINIMAP_Y + (this.player.y * this.MINIMAP_SCALE))
		this.context.lineTo(
			this.MINIMAP_X + ((this.player.x - (Math.cos(this.player.angle - this.toRadians(90)) * merolegesHossz)) * this.MINIMAP_SCALE),
			this.MINIMAP_Y + ((this.player.y - (Math.sin(this.player.angle - this.toRadians(90)) * merolegesHossz)) * this.MINIMAP_SCALE),
		)
		this.context.closePath()
		this.context.stroke()

		// ---------------------
	
		const spriteRayLength = 50;

		// SPRITES DRAW
		this.spritesClass.nearSprites.forEach(nearIndex => {
			let sprite = this.spritesClass.sprites[nearIndex]
			if (typeof sprite != 'undefined' && sprite.active) {
				this.context.fillStyle = 'red';
				this.context.fillRect(
					this.MINIMAP_X + (sprite.x * this.MINIMAP_SCALE) - (this.SPRITE_SIZE/2),
					this.MINIMAP_Y + (sprite.y * this.MINIMAP_SCALE) - (this.SPRITE_SIZE/2),
					this.SPRITE_SIZE,
					this.SPRITE_SIZE,
				)
		
				// SPRITE RAY	
				this.context.strokeStyle = 'deeppink'
				this.context.lineWidth = 1;
				this.context.beginPath()
				this.context.moveTo(this.MINIMAP_X + (sprite.x * this.MINIMAP_SCALE), this.MINIMAP_Y + (sprite.y * this.MINIMAP_SCALE))
				this.context.lineTo(
					this.MINIMAP_X + ((sprite.x + (Math.cos(this.toRadians(sprite.angle)) * spriteRayLength)) * this.MINIMAP_SCALE),
					this.MINIMAP_Y + ((sprite.y + (Math.sin(this.toRadians(sprite.angle)) * spriteRayLength)) * this.MINIMAP_SCALE),
				)
				this.context.closePath()
				this.context.stroke()
			}
		});
		
		// CHECK Player BRICK
		this.context.fillStyle = '#0000ff55'
		this.context.fillRect(
			this.MINIMAP_X + (this.check.playerCheckX * cellSize),
			this.MINIMAP_Y + (this.check.playerCheckY * cellSize),
			cellSize,
			cellSize,
		);

		// CHECK Creatures BRICK
		this.context.fillStyle = '#FFA50055'
		this.context.fillRect(
			this.MINIMAP_X + (this.check.creatureCheckX * cellSize),
			this.MINIMAP_Y + (this.check.creatureCheckY * cellSize),
			cellSize,
			cellSize,
		);
	}
	
	infoPanel() {
		this.context.fillStyle = 'white';
		this.context.fillRect(this.GAME_WIDTH - 230 - 10, 10, 200, 350)
		const lineheight = 16;
	
		var timeStop = (Date.now()-this.gamePlay.timeStart)
	
		const playerDataText = `
			Verzió: 0.4 |
			------------------------|
			GAME_WIDTH: ${this.GAME_WIDTH} px |
			GAME_WIDTH3D: ${this.GAME_WIDTH3D} px |
			Frame time: ${timeStop} ms |
			x: ${this.player.x.toFixed(3)} |
			y: ${this.player.y.toFixed(3)} |
			z: ${this.player.z.toFixed(3)} |
			inX: ${this.player.inX} |
			inY: ${this.player.inY} |
			checkX: ${this.check.playerCheckX} |
			checkY: ${this.check.playerCheckY} |
			angle: ${this.player.angle.toFixed(3)} Rad |
			angle: ${this.toAngle(this.player.angle).toFixed(1)} ° |
			speed: ${this.player.speed} |
			P. dirX: ${this.calcDirX(this.player.angle)} |
			P. dirY: ${this.calcDirY(this.player.angle)} |
			----------------------- |
			RAYS: ${this.NUMBER_OF_RAYS} |
			GRID_SIZE: ${this.GRID_SIZE} |
			------------------------|
			`;
	
		const lines = playerDataText.split('|');
	
		this.context.fillStyle = 'black'
		this.context.font = '12px serif'
		for (var i = 0; i<lines.length; i++) {
			this.context.fillText(lines[i], this.GAME_WIDTH - 200 - 40, 30 + (i * lineheight));
		}
	}

	renderScreen() {
		// OWN FIRST DRAW SKY
		if(this.menu.skySwitch) {
			// SKY
			if (this.texturesClass.skyTexture.type == 'sky') {
				let texture = this.texturesClass.skyTexture.element
				let textureWidth = this.texturesClass.skyTexture.textureWidth
				let textureHeight = this.texturesClass.skyTexture.textureHeight
	
				let largestTextureWidth = textureWidth * 2
				let largestTextureHeight = textureHeight * 2
				
				if (texture) {
					let skyAngle = this.toAngle(this.player.angle)
					let textureSlice =textureWidth / 360
					let flip = skyAngle * textureSlice
					
					let textureSliceLargest = largestTextureWidth / 360
					let flipLargest = skyAngle * textureSliceLargest
					
					this.context.drawImage(texture,
						flip, 0,
						textureWidth-flip, textureHeight,
						0, 0,
						largestTextureWidth-flipLargest, largestTextureHeight)
					
					if (textureWidth-flip <= canvas.width) {
						this.context.drawImage(texture,	
							0, 0,
							textureWidth, textureHeight,
							largestTextureWidth-flipLargest, 0,
							largestTextureWidth, largestTextureHeight)
					}
				}
			} else {
				// CEILING 			"sky": [ {"texture": { "ceiling1": ["ceiling1"] }, "type": "celling" } ],
				let texture = this.texturesClass.skyTexture.element
				let textureWidth = this.texturesClass.skyTexture.textureWidth
				let textureHeight = this.texturesClass.skyTexture.textureHeight
				
				var repetitionX = Math.ceil(canvas.width / textureWidth)
				
				for (var i = 0; i < repetitionX; i++) {
					this.context.drawImage(texture, i * textureWidth, 0, textureWidth, textureHeight);
				}
			}
		}
	
		// Floor Shadow
		if (this.menu.floorSwitch) {
			let texture = this.texturesClass.floorTexture.element
			let textureWidth = this.texturesClass.floorTexture.textureWidth
			
			var repetitionX = Math.ceil(canvas.width / textureWidth)
			
			for (var i = 0; i < repetitionX; i++) {
				this.context.drawImage(texture, i * textureWidth, canvas.height / 2);
			}
		}

		// START RAYS
		this.rays.forEach((ray, i) => {
			//const distance = ray.distance;
			const distance = this.fixFhishEye(ray.distance, ray.angle, this.player.angle)
			const wallHeight = ((this.CELL_SIZE) / distance) * 1450
			const BRICK_SIZE = wallHeight / this.CELL_SIZE
	
			// Wall
			let wall = this.mapDataClass.map[ray.wallY][ray.wallX]
			
			let mod = 0

			let wallHeightNum; let wallHeightPos;
			if (wall.height == 'big') {
				wallHeightNum = this.CELL_SIZE * 1.5
				wallHeightPos = (wallHeight/2) + (wallHeight / 2)
				mod = this.CELL_SIZE / 2
			} else {
				wallHeightNum = this.CELL_SIZE
				wallHeightPos = wallHeight / 2
			}
			
			let nowTexture = this.mapDataClass.returnActualWallTexture(wall, ray.wallY, ray.wallX)
			let actualTexture = this.loadTexture('wallTextures', nowTexture)

			for(let n = 0; n < wallHeightNum; n++) {
				if (typeof ray.vertical !== 'undefined') {

					let actPixel = ((n + mod) % this.CELL_SIZE)

					this.context.fillStyle = (ray.vertical)
					? this.colorDarkening(actualTexture.data[actPixel][ray.start], 0.4)
					: actualTexture.data[actPixel][ray.start];
					
					if (this.SLIP_WIDTH + (i * this.GRID_SIZE) + this.GRID_SIZE > 0) {

						this.context.fillRect(
							this.cutOutX(this.SLIP_WIDTH + (i * this.GRID_SIZE)),
							this.cutOutY(this.player.z + Math.floor((((this.GAME_HEIGHT / 2)) - wallHeightPos) + (Math.ceil(n * BRICK_SIZE)))),
							this.GRID_SIZE,
							this.cutOutY(Math.ceil(BRICK_SIZE))
						);
			
						//Shadow
						if (this.menu.shadowsSwitch) {
							let shadowDistance = this.calcShadowDistance(distance)
							this.context.fillStyle = `rgba(0, 0, 0, ${shadowDistance})`;
							this.context.fillRect(
								this.cutOutX(this.SLIP_WIDTH + (i * this.GRID_SIZE)),
								this.cutOutY(this.player.z + Math.floor(((this.GAME_HEIGHT / 2) - wallHeightPos) + (Math.ceil(n * BRICK_SIZE)))),
								this.GRID_SIZE,
								this.cutOutY(Math.ceil(BRICK_SIZE))
							);
						}
					}
				}
			}
	
			// Simple Floor
			if(!this.menu.floorSwitch) {
				this.context.fillStyle = 'orange';
				this.context.fillRect(
					this.SLIP_WIDTH + (i * this.GRID_SIZE),
					this.player.z + (this.GAME_HEIGHT / 2) + (wallHeight / 2),
					this.GRID_SIZE,
					this.GAME_HEIGHT
				);
			}
	
			// Simple Sky
			if(!this.menu.skySwitch) {
				this.context.fillStyle = 'brown';
				this.context.fillRect(
					this.SLIP_WIDTH + (i * this.GRID_SIZE),
					0,
					this.GRID_SIZE,
					this.player.z + (this.GAME_HEIGHT / 2) - (wallHeight / 2),
				);
			}
		})
	}

	renderScreenSprites(sprite, actualTexture) {		
		var spriteAngle = Math.atan2(sprite.y - this.player.y, sprite.x - this.player.x);
		spriteAngle = this.toAngle(spriteAngle)
		
		const isOnTheScreen = this.rays.findIndex((textureRay, i) => {
			if (i != this.rays.length-1) {

				const rayFirst = this.toAngle(textureRay.angle);
				const raySecond = this.toAngle(this.rays[i+1].angle);
				
				// If a point falls on the line, exception handling.
				if (rayFirst > raySecond && ( spriteAngle == 0 || (spriteAngle > 359 && spriteAngle < 360)  || (spriteAngle > 0 && spriteAngle < 0.204)) )
				 	return true;
				
				if (spriteAngle >= rayFirst && spriteAngle <= raySecond) return true;
				return false;
			}
		});
	
		if(isOnTheScreen !== -1) {
			let spriteHeight = ((this.CELL_SIZE) / sprite.distance) * 1500
			let brick_number = spriteHeight / this.GRID_SIZE
			let color_num = spriteHeight / actualTexture.imgHeight
			
			// SPRITE
			let wi = isOnTheScreen - Math.floor(brick_number/2)
			for(let w=0; w<brick_number; w++) {
				if(typeof this.rays[wi] != 'undefined' && this.rays[wi].distance > sprite.distance) {
					for(let h=0; h<brick_number; h++) {
						let colorX = Math.floor(((w * this.GRID_SIZE) / color_num))
						let colorY = Math.floor(((h * this.GRID_SIZE) / color_num))
						if (this.SLIP_WIDTH + (wi * this.GRID_SIZE) + this.GRID_SIZE > 0) {
							if(actualTexture.data[colorY][colorX] != 'rgba(0, 0, 0, 0)') {
								this.context.fillStyle = actualTexture.data[colorY][colorX];
								this.context.fillRect(
									this.cutOutX(this.SLIP_WIDTH + (wi * this.GRID_SIZE)),
									this.cutOutY(Math.floor(this.player.z + (this.GAME_HEIGHT / 2) - ((spriteHeight / 2) + (this.calculatePercentage(spriteHeight, sprite.z))) + (h * this.GRID_SIZE))),
									this.cutOutX(this.GRID_SIZE),
									this.cutOutY(Math.ceil(this.GRID_SIZE))
								);
								
								// Sprite Shadow
								if (this.menu.spriteShadowsSwitch && sprite.distance>300 && actualTexture.data[colorY][colorX] !== 'rgba(0, 0, 0, 0)') {
									let shadowDistance = this.calcShadowDistance(sprite.distance)
									this.context.fillStyle = `rgba(0, 0, 0, ${shadowDistance})`
									this.context.fillRect(
										this.cutOutX(this.SLIP_WIDTH + (wi * this.GRID_SIZE)),
										this.cutOutY(Math.floor(this.player.z + (this.GAME_HEIGHT / 2) - ((spriteHeight / 2) + (this.calculatePercentage(spriteHeight, sprite.z))) + (h * this.GRID_SIZE))),
										this.cutOutX(this.GRID_SIZE),
										this.cutOutY(Math.ceil(this.GRID_SIZE))
									);
								}
							}
						}
					}
				}
				wi++
			}
		}
	}
}
