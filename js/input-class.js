export default class InputClass {
	constructor ({mapDataClass: mapDataClass, spritesClass: spritesClass, graphicsClass: graphicsClass, movePlayer: movePlayer, menu: menu, gameMenu: gameMenu, player: player, keyPressed: keyPressed, gamePlay: gamePlay, check: check}) {
		this.mapDataClass = mapDataClass
		this.spritesClass = spritesClass
		this.graphicsClass = graphicsClass
		this.movePlayer = movePlayer
		//--------------------------------------------------------------------
		this.MOVE_SPEED = 10
		this.MOVE_ANGLE = 3
		this.MOVE_ANGLE_SLOW = 0.5
		this.WALL_DISTANCE = (graphicsClass.CELL_SIZE / 100) * 40
		//--------------------------------------------------------------------
		this.menu = menu
		this.gameMenu = gameMenu
		this.player = player
		this.keyPressed = keyPressed
		this.keybordListener = null
		this.gamePlay = gamePlay
		this.check = check
		this.mouseMoveSwitsh = false

		this.loadInputs()
		this.moveMenuStar()
	}
	
	menuGameJumpAction() {
		this.menu.menuactive = !this.menu.menuactive;
		if (this.menu.menuactive) {
			// MENU
			if (this.keybordListener) {
				cancelAnimationFrame(this.keybordListener);
				this.keybordListener = null;
			}
		} else {
			// GAME
			if (this.keybordListener == null || typeof this.keybordListener == 'undefined') this.handleKeyPress();
		}
		// REFRESH MENU
		this.graphicsClass.makeMenu()

		this.gameMenu()
	}

	moveMenuStar(way = 0) {
		let menuRowsAll = $('#menu-box').find('.menu-element')
		let menuRowsAllLength = $('#menu-box').find('.menu-element').length
		menuRowsAll.find('img').hide()
		this.menu.actualMenuRow = this.menu.actualMenuRow + way
		if (this.menu.actualMenuRow < 0) this.menu.actualMenuRow = menuRowsAllLength-1;
		else if (this.menu.actualMenuRow > menuRowsAllLength-1) this.menu.actualMenuRow = 0;
		menuRowsAll.eq(this.menu.actualMenuRow).find('img').show()
	}

	changeMenuStar(elementId, modifyActualMenuRow) {
		let menuRowsAll = $('#menu-box').find('.menu-element')
		menuRowsAll.find('img').hide()
		var menuIndex = $('#menu-box').find(`.menu-element[id=${elementId}]`).index();
		if (modifyActualMenuRow) {
			this.menu.actualMenuRow = menuIndex;
		}
		menuRowsAll.eq(menuIndex).find('img').show()
	}

	// ENTER
	getActualMenuStar() {
		let elementId = $('#menu-box .menu-element').filter(function() {
			return $(this).find('img').is(':visible');
		}).first().attr('id');
		return elementId;
	}

	changeOptionRow(elementId) {
		var selectedOption = $(`#${elementId}`).val()
		if (selectedOption == 0) {
			$(`#${elementId}`).val(1)
		} else if (selectedOption == 1) {
			 $(`#${elementId}`).val(0)
		}
		 $(`#${elementId}`).trigger('change')
	}

	menuAction(menuId) {
		var menuId = menuId
		setTimeout(() => {
			if (menuId == 'menu-new' || menuId == 'menu-resume') this.menuGameJumpAction();

			if (menuId == 'menu-options') {
				this.menu.optionsActive = true;
				this.menu.actualMenuRow = 0
				this.graphicsClass.makeMenu()
				this.add_optionsEventListeners()
				this.moveMenuStar(0)
			}

			if (menuId == 'menu-options-back') {
				this.menu.optionsActive = false;
				this.menu.actualMenuRow = 0
				this.remove_optionsEventListeners()
				this.graphicsClass.makeMenu()
				this.moveMenuStar(0)
			}

			if (menuId == 'menu-end') {
				console.log('End Game!');
				$("#graphics-container").html('')
				this.texturesClass = null
				clearInterval(this.gamePlay.game)
				this.gamePlay.gameLoaded = false
				this.gamePlay.game = null
				this.menu.menuactive = true
				this.menu.actualMenuRow = 0
				this.graphicsClass.makeMenu()
				this.moveMenuStar(0)
			}

			if (menuId == 'menu-infopanel') { 
				this.changeMenuStar('menu-infopanel', true)
				this.changeOptionRow('infopanel-select')
			};
			
			if (menuId == 'menu-minimap') { 
				this.changeMenuStar('menu-minimap', true)
				this.changeOptionRow('minimap-select')
			}

			if (menuId == 'menu-graphicsratio') { 
				this.changeMenuStar('menu-graphicsratio', true)
				this.changeOptionRow('graphicsratio-select')
			}

		}, 10)  // Ha lesz hang akkor kell majd beállítani
		return;
	}

	loadInputs() {
		//////////
		// KEYDOWN
		//////////
		document.addEventListener('keydown', (event) => {
			// TOGETHER
			if (event.key == ' ') {
				console.log('Space');

				// Check MAP
				if (this.mapDataClass.map[this.check.playerCheckY][this.check.playerCheckX]) {
					// type
					console.log(this.mapDataClass.map[this.check.playerCheckY][this.check.playerCheckX].mode);
					// OPEN DOOR
					if (this.mapDataClass.map[this.check.playerCheckY][this.check.playerCheckX].mode == 'door') {
						console.log('DOOR ANIM SWITCH');
						
						this.mapDataClass.map[this.check.playerCheckY][this.check.playerCheckX].anim_switch = true
					}

					if (this.mapDataClass.map[this.check.playerCheckY][this.check.playerCheckX].mode == 'secret') {
						
						let content = `<h3 class='text-center'>Your found a secret!</h3><p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Cupiditate, nostrum.</p>`
						this.graphicsClass.scrollInfoMaker(content, 3000)
						
						this.mapDataClass.map[this.check.playerCheckY][this.check.playerCheckX].anim_switch = true
					}

					if (this.mapDataClass.map[this.check.playerCheckY][this.check.playerCheckX].mode == 'key1') {
						if (this.player.key1)
							this.mapDataClass.map[this.check.playerCheckY][this.check.playerCheckX].anim_switch = true;
						else {
							let content = `<h3 class='text-center'>You need the silver key to open this door!</h3>`
							this.graphicsClass.scrollInfoMaker(content, 3000)
						}
					}

					if (this.mapDataClass.map[this.check.playerCheckY][this.check.playerCheckX].mode == 'key2') {
						if (this.player.key2)
							this.mapDataClass.map[this.check.playerCheckY][this.check.playerCheckX].anim_switch = true;
						else {
							let content = `<h3 class='text-center'>You need the gold key to open this door!</h3><p>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Officia tempora maiores sint! Ea optio repellat.Lorem ipsum dolor, sit amet consectetur adipisicing elit.

							<img src="./img/objects/keys/cellar-key2.png" alt="gold key" style='float:right;width:200px;'/>

							Officia tempora maiores sint! Ea optio repellat.Lorem ipsum dolor, sit amet consectetur adipisicing elit. Officia tempora maiores sint! Ea optio repellat.Lorem ipsum dolor, sit amet consectetur adipisicing elit. Officia tempora maiores sint! Ea optio repellat.Lorem ipsum dolor, sit amet consectetur adipisicing elit.</p>`
							this.graphicsClass.scrollInfoMaker(content, 3000)
						}
					}
				}

				// Check Blocks			
				
				// OPEN DOOR
				let checkingBlock = this.spritesClass.sprites.find(block => block.type == 'block' && block.mode == 'door'	// Type check
					&& Math.floor(block.x/this.graphicsClass.CELL_SIZE) == this.check.playerCheckX && Math.floor(block.y/this.graphicsClass.CELL_SIZE) == this.check.playerCheckY	// Position check
					&& block.open_function == null)		// not active

				if (checkingBlock) {
					console.log('DOOR OPEN KEZD');
					checkingBlock.open_switch = true
				}
			}
			
			if(event.key == 'Escape') {
				// MENU PUSH ESC
				if (this.menu.optionsActive) {
					this.menu.optionsActive = false
					this.graphicsClass.makeMenu()
					return;
				}

				// GAME PUSH ESC
				if (!this.menu.menuactive) {
					// this.keyPressed = []   ???
					this.menu.menuactive = false
					this.mouseMoveSwitsh = false
					$("body").css({cursor: "default"});
					this.menuGameJumpAction();
					return;
				}

				this.graphicsClass.makeMenu()
				this.moveMenuStar(0)
				return;
			}
			// MENU
			if (this.menu.menuactive) {
				// Enter
				if (event.key == 'Enter') { 
					let elementId = this.getActualMenuStar()
					this.menuAction(elementId)
				}

				if (event.key == 'w' || event.key == 'W' || event.key === 'ArrowUp' || event.key === 'Up') this.moveMenuStar(-1);
				if (event.key == 's' || event.key == 'S' || event.key === 'ArrowDown' || event.key === 'Down') this.moveMenuStar(1);
				
			} else {
			// GAME
				this.keyPressed[event.key] = true
				if (event.key == '1') this.menu.skySwitch = !this.menu.skySwitch;
				if (event.key == '2') this.menu.floorSwitch = !this.menu.floorSwitch;
				if (event.key == 'm') this.menu.mapSwitch = !this.menu.mapSwitch;
				if (event.key == 'i') this.menu.infoSwitch = !this.menu.infoSwitch;
				if (event.key == 'g') this.menu.shadowsSwitch = !this.menu.shadowsSwitch;
				if (event.key == 'h') this.menu.spriteShadowsSwitch = !this.menu.spriteShadowsSwitch;

				if (event.key == 'v') {
					console.log('ColorCache: ');
					console.log(this.graphicsClass.colorCache);
				}

				if (event.ctrlKey) {  console.log('CONTROL'); this.spritesClass.startShot() }
			}
		});

		////////////////////////////////
		// SPEED KEYS - Animation frames
		////////////////////////////////
		if (!this.menu.menuactive) {
			// GAME

			console.log('EVENT KEY : ');
			console.log(event.key);
			

			this.keyPressed[event.key] = true
			if (event.key == 'm') this.menu.mapSwitch = !this.menu.mapSwitch;
			if (event.key == 'i') this.menu.infoSwitch = !this.menu.infoSwitch;
			if (event.key == 'g') this.menu.shadowsSwitch = !this.menu.shadowsSwitch;
			if (event.key == 'h') this.menu.spriteShadowsSwitch = !this.menu.spriteShadowsSwitch;            
		}

		////////
		// KEYUP
		////////
		document.addEventListener('keyup', (event) => {
			// MENU
			if (this.menu.menuactive) {
				if(event.key == 'i') { console.log('MENU I megnyomva!! KEYUP') }
				// GAME
			} else {
				this.keyPressed[event.key] = false
				this.player.speed = 0;
			}
		});
		
		////////
		// MOUSE
		////////

		// MENU MOUSE USE
		document.addEventListener('click', (event) => {
			if (this.menu.menuactive) {
				let element = event.target;
				while (element) {
					if (element.id) {
						this.menuAction(element.id)
						this.moveMenuStar(0)
					}
					element = element.parentElement;
				}
			}
		});

		document.addEventListener('mouseover', (event) => {
			if (this.menu.menuactive) {
				let element = event.target;
				while (element) {
					if (element.id) {
						//console.log('Az element ID-je:', element.id)
						this.changeMenuStar(element.id, false)
						if (element.id == 'menu-bg' || element.id == 'menu-box') this.moveMenuStar(0);
						return;
					}
					element = element.parentElement;
				}
			}
		});

		// GAME MOUSE USE
		$(document).on('contextmenu', (event) => {
			event.preventDefault()
			this.mouseMoveSwitsh = false
			$("body").css({cursor: "default"});
		});

		$("#canvas").on('click', (event) => {

			$("body").css({cursor: "crosshair"});
			if(this.mouseMoveSwitsh) {
				if (event.pageX > (this.graphicsClass.SCREEN_WIDTH / 2)) {
					this.player.angle += this.graphicsClass.toRadians(this.MOVE_ANGLE * 2)
				} else {
					this.player.angle += -this.graphicsClass.toRadians(this.MOVE_ANGLE * 2)
				}
			}
			if (this.mouseMoveSwitsh) this.spritesClass.startShot()
			this.mouseMoveSwitsh = true
		});

		var lastMouseX = null;
		$(document).on('mousemove', (event) => {
			if (!(this.menu.menuactive) && this.mouseMoveSwitsh) {
				var movementX = event.clientX;
				if(movementX != null) {
					if (movementX > lastMouseX) {
						this.player.angle += this.graphicsClass.toRadians(this.MOVE_ANGLE)
					} else {
						this.player.angle += -this.graphicsClass.toRadians(this.MOVE_ANGLE)
					}
				}
				lastMouseX = movementX                
			}
		});
	}

	handleKeyPress = () => {
		if (this.keyPressed['q'] || this.keyPressed['Q'] || this.keyPressed['Home']) {
			let playerClone = {...this.player}
			playerClone.x = playerClone.x + (Math.cos(playerClone.angle - this.graphicsClass.toRadians(90)) * this.MOVE_SPEED)
			playerClone.y = playerClone.y + (Math.sin(playerClone.angle - this.graphicsClass.toRadians(90)) * this.MOVE_SPEED)
			let checkMove = this.movePlayer(playerClone, true)
			if (checkMove.moveX) this.player.x = this.player.x + (Math.cos(this.player.angle - this.graphicsClass.toRadians(90)) * this.MOVE_SPEED)
			if (checkMove.moveY) this.player.y = this.player.y + (Math.sin(this.player.angle - this.graphicsClass.toRadians(90)) * this.MOVE_SPEED)
		}
		if (this.keyPressed['e'] || this.keyPressed['E'] || this.keyPressed['PageUp']) {
			let playerClone = {...this.player}
			playerClone.x = playerClone.x + (Math.cos(playerClone.angle + this.graphicsClass.toRadians(90)) * this.MOVE_SPEED)
			playerClone.y = playerClone.y + (Math.sin(playerClone.angle + this.graphicsClass.toRadians(90)) * this.MOVE_SPEED)
			let checkMove = this.movePlayer(playerClone, true)
			if (checkMove.moveX) this.player.x = this.player.x + (Math.cos(this.player.angle + this.graphicsClass.toRadians(90)) * this.MOVE_SPEED)
			if (checkMove.moveY) this.player.y = this.player.y + (Math.sin(this.player.angle + this.graphicsClass.toRadians(90)) * this.MOVE_SPEED)
		}
		if (this.keyPressed['ArrowLeft']) { this.player.angle += -this.graphicsClass.toRadians(this.MOVE_ANGLE); }
		if (this.keyPressed['ArrowRight']) { this.player.angle += this.graphicsClass.toRadians(this.MOVE_ANGLE); }
		if (this.keyPressed['a'] || this.keyPressed['A']) { this.player.angle += -this.graphicsClass.toRadians(this.MOVE_ANGLE); }
		if (this.keyPressed['d'] || this.keyPressed['D']) { this.player.angle += this.graphicsClass.toRadians(this.MOVE_ANGLE); }
		if (this.keyPressed['r'] || this.keyPressed['R']) { this.player.angle += -this.graphicsClass.toRadians(this.MOVE_ANGLE_SLOW); }
		if (this.keyPressed['t'] || this.keyPressed['T']) { this.player.angle += this.graphicsClass.toRadians(this.MOVE_ANGLE_SLOW); }
		if (this.keyPressed['w'] || this.keyPressed['W']) { this.player.speed = this.MOVE_SPEED }
		if (this.keyPressed['s'] || this.keyPressed['S']) { this.player.speed = -this.MOVE_SPEED }
		if (this.keyPressed['p'] || this.keyPressed['P']) {
			if (this.player.poison == false) {
				this.player.poison = true;
			} else {
				this.player.poison = false;
				this.graphicsClass.FOV = this.graphicsClass.toRadians(60)
			}
		}
		if (this.keyPressed['ArrowUp']) { this.player.speed = this.MOVE_SPEED }
		if (this.keyPressed['ArrowDown']) { this.player.speed = -this.MOVE_SPEED }

		this.keybordListener = requestAnimationFrame(this.handleKeyPress);
	}

	add_optionsEventListeners() {
		// ADD OPTIONS
		var clone = this
		
		$('#graphicsratio-select').on('change', function(event) {
			event.preventDefault();
			var selectedValue = $(this).val();
			if (selectedValue == '10') {
				clone.graphicsClass.GRAPHICS_RATIO = 8; $(this).val(8)
			} else if (selectedValue == '8') {
				clone.graphicsClass.GRAPHICS_RATIO = 6; $(this).val(6)
			} else if (selectedValue == '6') {
				clone.graphicsClass.GRAPHICS_RATIO = 4; $(this).val(4)
			} else if (selectedValue == '4') {
				clone.graphicsClass.GRAPHICS_RATIO = 10; $(this).val(10)
			}
			$(this).blur();
			console.log(clone.graphicsClass.GRAPHICS_RATIO)

			clone.graphicsClass.gameResize()
		});

		$('#infopanel-select').on('change', function(event) {
			event.preventDefault();
			var selectedValue = $(this).val();
			if (selectedValue == '0') {
				clone.menu.infoSwitch = false;
			} else if (selectedValue == '1') {
				clone.menu.infoSwitch = true;
			}
			$(this).blur();
			console.log(clone.menu.infoSwitch)
		});

		$('#minimap-select').on('change', function(event) {
			event.preventDefault();
			var selectedValue = $(this).val();
			if (selectedValue == '0') {
				clone.menu.mapSwitch = false;
			} else if (selectedValue == '1') {
				clone.menu.mapSwitch = true;
			}
			$(this).blur();
			console.log(clone.menu.mapSwitch)
		});
	}

	remove_optionsEventListeners() {
		// REMOVE OPTIONS
		$('#infopanel-select').off('change')
		$('#minimap-select').off('change')
	}
}