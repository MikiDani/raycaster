export default class GaphicsClass {
	map;
	menuElement;
	floorTexture;
	context;
	rays;
	screenColorize;

	checkDistance;
	mod;

	poisonModValue;
	poisonModScale;
	blockMask;

	constructor ({mapDataClass: mapDataClass, spritesClass: spritesClass, texturesClass: texturesClass, CELL_SIZE: CELL_SIZE, player: player, menu: menu, gamePlay: gamePlay, check: check, poisonModValue: poisonModValue})
	{
		this.texturesClass = texturesClass
		this.spritesClass = spritesClass
		this.mapDataClass = mapDataClass
		this.poisonModValue = poisonModValue

		this.checkDistance = []
		this.blockMask = []
		//--------------------------------------------------------------------
		this.SCREEN_WIDTH = window.innerWidth
		this.SCREEN_HEIGHT = window.innerHeight
		this.GAME_WIDTH = 1250
		this.GAME_HEIGHT = 700
		this.GRAPHICS_RATIO = 6	// 4, Best, 6 Normal, 8, Medim, 10 Low, 

		this.CELL_SIZE = CELL_SIZE
		this.WALKINTERVAL = -7
		this.FOV = this.toRadians(60)
		// this.MINIMAP_SCALE = 0.25
		// this.MINIMAP_X = (this.GAME_WIDTH / 2) - (this.MINIMAP_SCALE * CELL_SIZE) * 30
		// this.MINIMAP_Y = (this.GAME_HEIGHT / 2) - (this.GAME_HEIGHT / 2.5)
		this.MINIMAP_SCALE = 1.3
		this.MINIMAP_X = 100
		this.MINIMAP_Y = 50
		this.PLAYER_SIZE = 10
		this.SPRITE_SIZE = 10
		//--------------------------------------------------------------------
		this.map = []
		this.player = player
		this.menuElement = ""
		this.menu = menu
		this.gamePlay = gamePlay
		this.check = check
		this.poisonModValue = 60
		this.poisonModScale = 2
		this.colorCache = new Map()
		
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

		if (false) {
			window.addEventListener("resize", () => {
				document.body.style.backgroundColor = "black";
				this.gameResize()
			});
		}

		this.gameResize()
	}

	gameResize() {
		this.SCREEN_WIDTH = window.innerWidth
		this.SCREEN_HEIGHT = window.innerHeight

		this.SLIP_WIDTH = Math.floor(-(this.GAME_WIDTH/100) * 10)
		this.GAME_WIDTH3D = this.GAME_WIDTH + (2 * Math.abs(this.SLIP_WIDTH))
		this.NUMBER_OF_RAYS = Math.floor(this.GAME_WIDTH3D / this.GRAPHICS_RATIO)	// GRAPHICS_RATIO BEST = 6
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

		let canvasContainer = document.createElement("div")
		canvasContainer.setAttribute('id', 'canvas-container')
		canvasContainer.setAttribute('width', this.GAME_WIDTH)
		canvasContainer.setAttribute('height', this.GAME_HEIGHT)
		canvasContainer.style.display='none'
		canvasContainer.style.position='relative'
		container.appendChild(canvasContainer)

		const canvas = document.createElement("canvas")
		canvas.setAttribute('id', 'canvas')
		canvas.setAttribute('width', this.GAME_WIDTH)
		canvas.setAttribute('height', this.GAME_HEIGHT)
		// canvas.style.display='none'
		canvasContainer.appendChild(canvas)
		this.context = canvas.getContext('2d')
		this.context.imageSmoothingEnabled = false

		let scrollXpos = (this.GAME_WIDTH / 2) - 375
		let scrollInfoBox = document.createElement("div")
		scrollInfoBox.setAttribute('id', 'scroll-info-box')
		scrollInfoBox.setAttribute('width', '750px')
		scrollInfoBox.style.position='absolute'
		scrollInfoBox.style.left= scrollXpos + 'px'
		scrollInfoBox.style.top='200px'
				
		let scrollInfoBoxTop = document.createElement("div")
		scrollInfoBoxTop.setAttribute('id', 'scroll-info-box-top')
		scrollInfoBoxTop.classList.add('scroll-info-box-top')
		scrollInfoBox.appendChild(scrollInfoBoxTop)
		
		let scrollInfoBoxContent = document.createElement("div")
		scrollInfoBoxContent.setAttribute('id', 'scroll-info-box-content')
		scrollInfoBoxContent.classList.add('scroll-info-box-content')
		scrollInfoBoxContent.style.position='relative'
		scrollInfoBox.appendChild(scrollInfoBoxContent)
		
		let scrollInfoBoxContentText = document.createElement("div")
		scrollInfoBoxContentText.setAttribute('id', 'scroll-info-box-content-text')
		scrollInfoBoxContent.appendChild(scrollInfoBoxContentText)
		
		let scrollInfoBoxBottom = document.createElement("div")
		scrollInfoBoxBottom.style.position='absolute'
		scrollInfoBoxBottom.style.bottom='-28px'
		scrollInfoBoxBottom.style.left='0px'
		scrollInfoBoxBottom.classList.add('scroll-info-box-bottom')
		scrollInfoBoxBottom.setAttribute('id', 'scroll-info-box-bottom')
		scrollInfoBoxContent.appendChild(scrollInfoBoxBottom)

		canvasContainer.appendChild(scrollInfoBox)
		scrollInfoBox.style.display='none'
	}

	makeMenu() {
		$("#menu-bg").html('')
		let menuElementContent = `
			<div><img src="./img/menu/menu-logo.png" alt="Yukio Ninja" class="logo-position" style="display:block;"/></div>
			<div id="menu-box" class="mx-auto col-4 pt-5">`;
				if (this.menu.optionsActive) {
					
					let graphicsratioSelected = function(value, GRAPHICS_RATIO) {
						if (value == GRAPHICS_RATIO) return 'selected';
						return '';
					}

					let infopanelSelected = (this.menu.infoSwitch) ? 'selected' : null;
					let shadowsSelected = (this.menu.shadowsSwitch) ? 'selected' : null;
					let skySelected = (this.menu.skySwitch) ? 'selected' : null;
					let floorSelected = (this.menu.floorSwitch) ? 'selected' : null;

					menuElementContent += `
					<div id="menu-options-back" class="menu-element row">
						<div class="menu-row col-2 bg-menu-selector-back d-flex justify-content-center align-items-center"><img src="./img/menu/star-selector.gif" style="display:none;"></div>
						<div class="menu-row col d-flex justify-content-start align-items-center">
							<span>Back</span>
						</div>
					</div>`;
					// <h3>Graphics Options</h3>
					menuElementContent += `
					<div id="menu-graphicsratio" class="menu-element row">
						<div class="menu-row col-2 bg-menu-selector d-flex justify-content-center align-items-center"><img src="./img/menu/star-selector.gif" style="display:none;"></div>
						<div class="menu-row col d-flex justify-content-between align-items-center">
							<span>graphicsratio:</span>
							<select id="graphicsratio-select" name="graphicsratio" class="form-control form-control-sm control-small-width ms-5 invisible-pointer">
								<option value="10" ${graphicsratioSelected(10, this.GRAPHICS_RATIO)}>Low</option>
								<option value="8" ${graphicsratioSelected(8, this.GRAPHICS_RATIO)}>Medium</option>
								<option value="6" ${graphicsratioSelected(6, this.GRAPHICS_RATIO)}>Best</option>
							</select>
						</div>
					</div>`;
					menuElementContent += `
					<div id="menu-shadows" class="menu-element row">
						<div class="menu-row col-2 bg-menu-selector d-flex justify-content-center align-items-center"><img src="./img/menu/star-selector.gif" style="display:none;"></div>
						<div class="menu-row col d-flex justify-content-between align-items-center">
							<span>shadows:</span>
							<select id="shadows-select" name="shadows" data-variablename="shadowsSwitch" class="form-control form-control-sm control-small-width ms-5 invisible-pointer">
								<option value="0">Off</option>
								<option value="1" ${shadowsSelected}>On</option>
							</select>
						</div>
					</div>`;
					menuElementContent += `
					<div id="menu-sky" class="menu-element row">
						<div class="menu-row col-2 bg-menu-selector d-flex justify-content-center align-items-center"><img src="./img/menu/star-selector.gif" style="display:none;"></div>
						<div class="menu-row col d-flex justify-content-between align-items-center">
							<span>sky:</span>
							<select id="sky-select" name="sky" data-variablename="skySwitch" class="form-control form-control-sm control-small-width ms-5 invisible-pointer">
								<option value="0">Off</option>
								<option value="1" ${skySelected}>On</option>
							</select>
						</div>
					</div>`;
					menuElementContent += `
					<div id="menu-floor" class="menu-element row">
						<div class="menu-row col-2 bg-menu-selector d-flex justify-content-center align-items-center"><img src="./img/menu/star-selector.gif" style="display:none;"></div>
						<div class="menu-row col d-flex justify-content-between align-items-center">
							<span>floor:</span>
							<select id="floor-select" name="floor" data-variablename="floorSwitch" class="form-control form-control-sm control-small-width ms-5 invisible-pointer">
								<option value="0">Off</option>
								<option value="1" ${floorSelected}>On</option>
							</select>
						</div>
					</div>`;
					menuElementContent += `
					<div id="menu-infopanel" class="menu-element row">
						<div class="menu-row col-2 bg-menu-selector d-flex justify-content-center align-items-center"><img src="./img/menu/star-selector.gif" style="display:none;"></div>
						<div class="menu-row col d-flex justify-content-between align-items-center">
							<span>infopanel:</span>
							<select id="infopanel-select" name="infopanel" data-variablename="infoSwitch" class="form-control form-control-sm control-small-width ms-5 invisible-pointer">
								<option value="0">Off</option>
								<option value="1" ${infopanelSelected}>On</option>
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

	async scrollInfoMaker(htmlElements, time, useButton) {
		var GAME_HEIGHT = this.GAME_HEIGHT
		let imgTopUrl = "./img/menu/info-scroll-top-pix.png";
		let imgBottomUrl = "./img/menu/info-scroll-bottom-pix.png";
		let imgBgUrl = "./img/menu/info-scroll-bg-pix.png";
	
		function loadImage(url) {
			return new Promise((success, error) => {
				let img = new Image();
				img.onload = () => success();
				img.onerror = error;
				img.src = url;
			});
		}

		var hideScrollInfoBoxAction = function() { $("#scroll-info-box-content-text").html(''); $("#scroll-info-box").hide(); }

		try {
			await Promise.all([
				new Promise(resolve => {
					if (useButton) htmlElements += '<div class="text-center"><button type="button" id="scroll-button" class="btn btn-primary">Ok</button></div>'
					$("#scroll-info-box-content-text").html(htmlElements);

					if (useButton) {						
						$("#scroll-info-box-content-text").find('#scroll-button').on('click', hideScrollInfoBoxAction);
						function handleEnterKeyPress(event) { if (event.key === "Enter") { hideScrollInfoBoxAction(); document.removeEventListener('keydown', handleEnterKeyPress) }	}
						document.addEventListener('keydown', handleEnterKeyPress);
					}

					resolve();
				}),
				loadImage(imgTopUrl),
				loadImage(imgBottomUrl),
				loadImage(imgBgUrl)
			]);

			let marginTop = Math.floor((GAME_HEIGHT - $("#scroll-info-box").height()) / 2)

			$("#scroll-info-box").css('top', marginTop + 'px')
			$("#scroll-info-box").show();

		} catch (error) { console.error(error); }
		
		// Hide Info
		if (!useButton) setTimeout(() => hideScrollInfoBoxAction(), time);
		
	}

	spriteDistanceCalc(sprite) {
		return Math.sqrt(Math.pow(this.player.y - sprite.y, 2) + Math.pow(this.player.x - sprite.x, 2));
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
		let diff = angle - playerAngle;
		return distance * Math.cos(diff)
	}

	outOfMapBounds(x, y) {
		return x < 0 || x >= this.mapDataClass.map[0].length || y < 0 || y >= this.mapDataClass.map.length;
	}

	distance(x1, y1, x2, y2) {
		return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
	}

	calcShadowDistance(distance) {
	// let shadowDistance = (distance / 160) * 0.1;
	let shadowDistance = (distance / 160) * 0.15;
	shadowDistance = (shadowDistance > 1) ? 1 : shadowDistance;
	shadowDistance = shadowDistance.toFixed(1);
	return shadowDistance
}

	colorDarkening(color, size) {		
		if (color) {
			let cacheKey = color + '_' + size;
			if (this.colorCache.has(cacheKey)) {
				return this.colorCache.get(cacheKey);
			} else {
				var rgbaArr = color.match(/\d+(\.\d+)?/g)
				let r = Math.floor(parseInt(rgbaArr[0]) * (1 - (size)));
				let g = Math.floor(parseInt(rgbaArr[1]) * (1 - (size)));
				let b = Math.floor(parseInt(rgbaArr[2]) * (1 - (size)));
				let a = Math.min(parseFloat(rgbaArr[3]));
				let result = "rgba(" + r + ", " + g + ", " + b + ", " + a + ")";
	
				this.colorCache.set(cacheKey, result);
	
				return result;
			}
		}
		return "rgba(0,0,0,0)";
	}

	getVCrash(angle, type, bY, bX) {
		// VERTICAL CHECK
		let right = Math.abs(Math.floor((angle-Math.PI/2) / Math.PI) % 2)
		let up = Math.abs(Math.floor(angle / Math.PI) % 2)

		let firstX = (right)
		? Math.floor(this.player.x / this.CELL_SIZE) * this.CELL_SIZE + this.CELL_SIZE
		: Math.floor(this.player.x / this.CELL_SIZE) * this.CELL_SIZE;
		
		let firstY = this.player.y + (firstX - this.player.x) * Math.tan(angle)
		
		let xA = right ? this.CELL_SIZE : -this.CELL_SIZE;
		let yA = xA * Math.tan(angle)

		let wall;
		let nextX = firstX;
		let nextY = firstY;
		let actCellY;
		let lastCellX;
		let lastCellY;

		while(!wall) {
			let cellX = (right) ? Math.floor(nextX / this.CELL_SIZE) : Math.floor(nextX / this.CELL_SIZE) - 1;
			let cellY = Math.floor(nextY / this.CELL_SIZE)

			if(this.outOfMapBounds(cellX, cellY)) break;

			if (!type) {
				// Normal check
				wall = (this.mapDataClass.map[cellY][cellX]) ? true : false;
			} else {				
				// Block check
				wall = (cellY == bY && cellX == bX) ? true : false;
			}

			actCellY = cellY

			if(!wall) {
				nextX += xA; nextY += yA;
			} else {
				lastCellX = cellX; lastCellY = cellY;
			}
		}

		if (type) {
			let xA = right ? (this.CELL_SIZE/2) : (-this.CELL_SIZE/2);
			let yA = xA * Math.tan(angle)

			nextX = nextX + xA
			nextY = nextY + yA
		}

		let start
		if (type) {
			start = (this.CELL_SIZE - (Math.floor(((nextY / this.CELL_SIZE) - actCellY) * this.CELL_SIZE)) - 1)
		} else {
			start = (!right)
				? (this.CELL_SIZE - (Math.floor(((nextY / this.CELL_SIZE) - actCellY) * this.CELL_SIZE)) - 1)
				: Math.floor(((nextY / this.CELL_SIZE) - actCellY) * this.CELL_SIZE);
		}

		return {
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

	getHCrash(angle, type, bY, bX) {
		// HORIZONTAL CHECK
		let up = Math.abs(Math.floor(angle / Math.PI) % 2)
		let right = Math.abs(Math.floor((angle-Math.PI/2) / Math.PI) % 2)
		
		let firstY = (up)
		? Math.floor(this.player.y / this.CELL_SIZE) * this.CELL_SIZE
		: Math.floor(this.player.y / this.CELL_SIZE) * this.CELL_SIZE + this.CELL_SIZE;

		let firstX = this.player.x + (firstY - this.player.y) / Math.tan(angle)
		let yA = up ? -this.CELL_SIZE : this.CELL_SIZE;
		let xA = yA / Math.tan(angle)

		let wall;
		let nextX = firstX;
		let nextY = firstY;
		let actCellX;
		let lastCellX;
		let lastCellY;

		while(!wall) {
			let cellX = Math.floor(nextX / this.CELL_SIZE)
			let cellY = (up) ? Math.floor(nextY / this.CELL_SIZE) - 1 : Math.floor(nextY / this.CELL_SIZE);

			if (this.outOfMapBounds(cellX, cellY)) break;

			if (!type) {
				// Normal check
				wall = (this.mapDataClass.map[cellY][cellX]) ? true : false;
			} else {				
				// Block check
				wall = (cellY == bY && cellX == bX) ? true : false;
			}

			actCellX = cellX

			if (!wall) {
				nextX += xA; nextY += yA;
			} else {
				lastCellX = cellX; lastCellY = cellY;
			}
		}

		if (type) {
			let yA = up ? (-this.CELL_SIZE/2) : (this.CELL_SIZE/2);
			let xA = yA / Math.tan(angle)

			nextX = nextX + xA
			nextY = nextY + yA
		}

		let start
		if (type) {
			start =  (this.CELL_SIZE - (Math.floor(((nextX / this.CELL_SIZE) - actCellX) * this.CELL_SIZE)) - 1)
		} else {
			start = (!up) 
				? (this.CELL_SIZE - (Math.floor(((nextX / this.CELL_SIZE) - actCellX) * this.CELL_SIZE)) - 1)
				: Math.floor(((nextX / this.CELL_SIZE) - actCellX) * this.CELL_SIZE);
		}

		return {
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

	getRays() {
		let initialAngle = this.player.angle - (this.FOV/2)
		let angleStep = this.FOV / this.NUMBER_OF_RAYS
	
		return Array.from({length: this.NUMBER_OF_RAYS}, (_, i) => {
			let angle = initialAngle + i * angleStep;

			let vCrash = this.getVCrash(angle, false)
			let hCrash = this.getHCrash(angle, false)

			let ray = (hCrash.distance >= vCrash.distance) ? vCrash : hCrash;

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
					// console.log(this.texturesClass.errorTexture);
					return this.texturesClass.errorTexture['error']['error']
				}
			}
			return actualTexture
		}
		return this.texturesClass.errorTexture['error']['error']
	}

	renderMinimap(rays) {
		const cellSize = this.MINIMAP_SCALE * this.CELL_SIZE;
		// WALLS
		this.mapDataClass.map.forEach((row, y) => {
			row.forEach((cell, x) => {
				if(cell) {
					if (cell.mode == 'door') this.context.fillStyle = 'gold'
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

		// BLOCK RAYS CHECK	
		if (false) {
			this.checkDistance.forEach(ray => {
				//console.log( ray.distance);
				this.context.strokeStyle = 'lime'
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
			this.checkDistance = []
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
		if (false) {
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
		}

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

		// -----------------------
	
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

		var timeStop = (Date.now() - this.gamePlay.timeStart)

		const playerDataText = `
			Verzió: 0.4 |
			------------------------|
			GAME_WIDTH: ${this.GAME_WIDTH} px |
			GAME_WIDTH3D: ${this.GAME_WIDTH3D} px |
			x: ${this.player.x.toFixed(3)} |
			y: ${this.player.y.toFixed(3)} |
			z: ${this.player.z.toFixed(3)} |
			inX: ${this.player.inX} |
			inY: ${this.player.inY} |
			Frame time: ${timeStop} ms |
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
			
			let distance = (this.player.poison)
			? ray.distance 
			: this.fixFhishEye(ray.distance, ray.angle, this.player.angle);

			let wallHeight = (this.player.poison)
			? ((this.CELL_SIZE) / distance) * 1450 + this.poisonModValue 
			: ((this.CELL_SIZE) / distance) * 1450;

			let BRICK_SIZE = wallHeight / this.CELL_SIZE
	
			// WALLS DRAWING
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

					var shadowDisMod = (this.menu.shadowsSwitch)
					? (ray.vertical) ? this.calcShadowDistance(distance + 225) : this.calcShadowDistance(distance)
					: this.context.fillStyle = actualTexture.data[actPixel][ray.start];
					
					this.context.fillStyle = this.colorDarkening(actualTexture.data[actPixel][ray.start], shadowDisMod)

					if (this.SLIP_WIDTH + (i * this.GRID_SIZE) + this.GRID_SIZE > 0) {
						this.context.fillRect(
							this.SLIP_WIDTH + (i * this.GRID_SIZE),
							this.player.z + Math.floor((((this.GAME_HEIGHT / 2)) - wallHeightPos) + (Math.ceil(n * BRICK_SIZE))),
							this.GRID_SIZE,
							Math.ceil(BRICK_SIZE)
						);
					}
				}
			}

			// Simple Floor
			if(!this.menu.floorSwitch) {
				this.context.fillStyle = this.mapDataClass.floor.color;
				this.context.fillRect(
					this.SLIP_WIDTH + (i * this.GRID_SIZE),
					this.player.z + (this.GAME_HEIGHT / 2) + (wallHeight / 2),
					this.GRID_SIZE,
					this.GAME_HEIGHT
				);
			}
	
			// Simple Sky
			if(!this.menu.skySwitch) {
				this.context.fillStyle = this.mapDataClass.sky.color;
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
		// Object Draw
		if (sprite.active) {
			// BLOCK SPRITE draw
			if (sprite.type == 'block') {
				let checkY = Math.floor(sprite.y / this.CELL_SIZE)
				let checkX = Math.floor(sprite.x / this.CELL_SIZE)
				
				this.rays.forEach((ray, i) => {				
					let blockDistance
					if (sprite.angle == 90) blockDistance = this.getHCrash(ray.angle, true, checkY, checkX)
					if (sprite.angle == 0) blockDistance = this.getVCrash(ray.angle, true, checkY, checkX)

					if (blockDistance.wallY != undefined && blockDistance.wallX != undefined) {
						
						this.checkDistance.push(blockDistance)	// SEGED

						let rayDistance = ray.distance
						
						let distance = (this.player.poison)
						? blockDistance.distance 
						: this.fixFhishEye(blockDistance.distance, blockDistance.angle, this.player.angle);

						let wallHeight = (this.player.poison)
						? ((this.CELL_SIZE) / distance) * 1450 + this.poisonModValue 
						: ((this.CELL_SIZE) / distance) * 1450;

						let BRICK_SIZE = wallHeight / this.CELL_SIZE					

						if (sprite.open_switch) {				
							(sprite.open_positionValue == 0)
							? this.doorOpenOrClose(sprite, -5)
							: this.doorOpenOrClose(sprite, 5)
						}

						this.context.fillStyle = "rgba(0, 0, 0, 0)";
						if (rayDistance > blockDistance.distance && blockDistance.start >= 0 && blockDistance.start <= this.CELL_SIZE) {
							for(let n = 0; n < this.CELL_SIZE; n++) {
								
								let actPixel = (n % this.CELL_SIZE)									

								let modPix = (typeof sprite.open_positionValue != 'undefined')
								? blockDistance.start + sprite.open_positionValue
								: blockDistance.start;
								
								let shadowDisMod = this.calcShadowDistance(distance)

								if (this.menu.shadowsSwitch) {
									this.context.fillStyle = (sprite.vertical)
									? this.colorDarkening(actualTexture.data[actPixel][modPix], shadowDisMod)
									: this.colorDarkening(actualTexture.data[actPixel][modPix], shadowDisMod)
								} else {
									this.context.fillStyle = actualTexture.data[actPixel][modPix]
								}

								this.context.fillRect(
									this.SLIP_WIDTH + (i * this.GRID_SIZE),
									this.player.z + Math.floor((((this.GAME_HEIGHT / 2)) - (wallHeight / 2)) + (Math.ceil(n * BRICK_SIZE))),
									this.GRID_SIZE,
									Math.ceil(BRICK_SIZE)
								);
							}
						}
					}
				});
			// OBJECT, AMMO, CREATURE
			} else if (sprite.type=='object' || sprite.type == 'ammo' || sprite.type == 'creature') {
				let spriteAngle = Math.atan2(sprite.y - this.player.y, sprite.x - this.player.x);
				spriteAngle = this.toAngle(spriteAngle)
				
				let isOnTheScreen = this.rays.findIndex((textureRay, i) => {
					if (i != this.rays.length-1) {
						let rayFirst = this.toAngle(textureRay.angle);
						let raySecond = this.toAngle(this.rays[i+1].angle);
						
						// If a point falls on the line, exception handling.
						if (rayFirst > raySecond && ( spriteAngle == 0 || (spriteAngle > 359 && spriteAngle < 360)  || (spriteAngle > 0 && spriteAngle < 0.204)) )
							return true;
						
						if (spriteAngle >= rayFirst && spriteAngle <= raySecond) return true;
						return false;
					}
				});
			
				if (isOnTheScreen !== -1) {
					let spriteHeight = ((this.CELL_SIZE) / sprite.distance) * 1500
					let brick_number = spriteHeight / this.GRID_SIZE
					let color_num = spriteHeight / actualTexture.imgHeight
					
					// SPRITE
					let wi = isOnTheScreen - Math.floor(brick_number / 2)
					for(let w=0; w<brick_number; w++) {

						if (typeof this.rays[wi] != 'undefined' && this.rays[wi].distance > sprite.distance && sprite.distance >= 50) {
							
							for (let h=0; h < brick_number; h++) {
								let colorX = Math.floor(((w * this.GRID_SIZE) / color_num))
								let colorY = Math.floor(((h * this.GRID_SIZE) / color_num))
								if (this.SLIP_WIDTH + (wi * this.GRID_SIZE) + this.GRID_SIZE > 0) {
									if (actualTexture.data[colorY][colorX] != 'rgba(0, 0, 0, 0)') {

										let shadowDisMod = this.calcShadowDistance(sprite.distance)

										this.context.fillStyle = (this.menu.shadowsSwitch)
										? this.colorDarkening(actualTexture.data[colorY][colorX], shadowDisMod)
										: this.context.fillStyle = actualTexture.data[colorY][colorX]
										
										this.context.fillRect(
											this.SLIP_WIDTH + (wi * this.GRID_SIZE),
											Math.floor(this.player.z + (this.GAME_HEIGHT / 2) - ((spriteHeight / 2) + (this.calculatePercentage(spriteHeight, sprite.z))) + (h * this.GRID_SIZE)),
											this.GRID_SIZE,
											Math.ceil(this.GRID_SIZE)
										);
									}
								}
							}
						}
						wi++
					}
				}
			}
		}
	}

	doorOpenOrClose(sprite, open_moveValue) {
		if (sprite.open_function == null) {
			sprite.anim_switch = true
			sprite.open_function = setInterval(() => {
				sprite.open_positionValue = sprite.open_positionValue + open_moveValue
				if (sprite.open_positionValue >= 0) {
					//console.log('CLOSED DOOR')
					sprite.open_positionValue = 0
					
					clearInterval(sprite.open_function)
					sprite.open_function = null
					sprite.open_switch = false
					
					sprite.material = 'fix'
				}
				
				if (sprite.open_positionValue <= -58) {
					sprite.open_positionValue = -58
					
					clearInterval(sprite.open_function)
					sprite.open_function = null
					sprite.open_switch = false
					
					sprite.material = 'ghost'
				}
			}, 10);
		}
	}

	poison() {
		// fov
		this.poisonModValue = this.poisonModValue + this.poisonModScale
		this.FOV = this.toRadians(this.poisonModValue)
		if (this.poisonModValue >=120) this.poisonModScale = -2
		if (this.poisonModValue <=50) this.poisonModScale = 2
		// color
		let cR = Math.floor(Math.random() * 256)
		let cG = Math.floor(Math.random() * 256)
		let cB = Math.floor(Math.random() * 256)
		let colorizeOption = { color: `${cR}, ${cG}, ${cB}`, alpha: 0.2, time: 150 }
		this.screenColorizeOptions(colorizeOption)
	}
}
