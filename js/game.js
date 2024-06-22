// -------------------------------------------------------
// 						DANI RAYENGINE
// -------------------------------------------------------

import GaphicsClass from './graphics-class.js'
import InputsClass from './input-class.js'
import TexturesClass from './textures-class.js'
import MapDataClass from './mapdata-class.js'
import SpritesClass from './sprites-class.js'

const CLOCKSIGNAL = 40
const CELL_SIZE = 64

const player = {
	x: CELL_SIZE * 1.5,
	y: CELL_SIZE * 1.5,
	z: 0,
	inX: null,
	inY: null,
	move: true,
	angle: 0,
	speed: 0,
	goldScore: 0,
	silverScore: 0,
	copperScore: 0,
	weapon: 1,
	adoptedWeapons: {
		weapon1: true,
		weapon2: true,
		weapon3: true,
		weapon4: true,
	},
	weaponsDamage: [0, 1, 2, 3, 4],
	shoting: false,
	shoting_anim: null,
	shoting_anim_actFrame: 0,
	shoting_anim_time: [0, 80, 80, 10, 50],
	poison: false,
	energy: 100,
	shotTime: 100,
	map: true,	// !!
	key1: false,
	key2: false,
}

const menu = {
	actualMenuRow: 0,
	menuactive: true,
	optionsActive: false,
	clearGameSwitch: false,
	infoSwitch: false,
	mapSwitch: false,
	shadowsSwitch: true,
	spriteShadowsSwitch: true,
	mouseSwitch: true,
	floorSwitch: true,
	skySwitch: true,
}

var gamePlay = {
	game: null,
	gameLoaded: false,
	nextLevel: false,
	timeStart: null,
}

var check = {
	directions: [],
	playerCheckX: 0,
	playerCheckY: 0,

	creatureCheckX: null,
	creatureCheckY: null,
}

var keyPressed = {};

// -------------------------------------------------------

function checkMoveSprite(spriteObj, type = null, inputStrafeCheck = null) {

	var actX = Math.floor(spriteObj.x / CELL_SIZE)
	var actY = Math.floor(spriteObj.y / CELL_SIZE)
	spriteObj.inX =  Math.floor(spriteObj.x - (actX * CELL_SIZE))
	spriteObj.inY =  Math.floor(spriteObj.y - (actY * CELL_SIZE))

	let WALL_DISTANCE
	if (type == 'player') WALL_DISTANCE = inputClass.PLAYER_WALL_DISTANCE
	if (type == 'creature') WALL_DISTANCE = inputClass.CREATURE_WALL_DISTANCE
	if (type == 'ammo') WALL_DISTANCE = inputClass.AMMO_WALL_DISTANCE
	
	var moveX = true
	var moveY = true
	
	let soAngleDirection = []
	let firstAngleDirection = []
		
	firstAngleDirection = inputClass.checkDirection(graphicsClass.toAngle(spriteObj.angle), spriteObj.speed)
		
	if (inputStrafeCheck) {
		soAngleDirection[0] = {x: actX, y: actY - 1, stopF:2, stopB:6}
		soAngleDirection[1] = {x: actX - 1, y: actY - 1, stopF:1, stopB:5}
		soAngleDirection[2] = {x: actX + 1, y: actY - 1, stopF:3, stopB:7}
		soAngleDirection[3] = {x: actX + 1, y: actY, stopF:4, stopB:4}
		soAngleDirection[4] = {x: actX - 1, y: actY, stopF:8, stopB:8}

		soAngleDirection[5] = {x: actX - 1, y: actY + 1, stopF:7, stopB:3 }
		soAngleDirection[6] = {x: actX, y: actY + 1, stopF:6, stopB:2 }
		soAngleDirection[7] = {x: actX + 1, y: actY + 1, stopF:5, stopB:1 }
	} else
	if (firstAngleDirection.way == 'right') {
		soAngleDirection[0] = {x: actX + firstAngleDirection.x, y: actY + firstAngleDirection.y, stopF:4, stopB:8}
		soAngleDirection[1] = {x: actX + firstAngleDirection.x, y: actY + firstAngleDirection.y - 1, stopF:3, stopB:1}
		soAngleDirection[2] = {x: actX + firstAngleDirection.x, y: actY + firstAngleDirection.y + 1, stopF:5, stopB:7}
		soAngleDirection[3] = {x: actX, y: actY - 1, stopF:2, stopB:2}
		soAngleDirection[4] = {x: actX, y: actY + 1, stopF:6, stopB:6}
	} else
	if (firstAngleDirection.way == 'right-down') {
		soAngleDirection[0] = {x: actX + firstAngleDirection.x, y: actY + firstAngleDirection.y, stopF:5, stopB:1}
		soAngleDirection[1] = {x: soAngleDirection[0].x, y: soAngleDirection[0].y + (- 1 * firstAngleDirection.sign), stopF:4, stopB:8}
		soAngleDirection[2] = {x: soAngleDirection[0].x  + (- 1 * firstAngleDirection.sign), y: soAngleDirection[0].y, stopF:6, stopB:2}
	} else
	if (firstAngleDirection.way == 'down') {
		soAngleDirection[0] = {x: actX + firstAngleDirection.x, y: actY + firstAngleDirection.y, stopF:6, stopB:2 }
		soAngleDirection[1] = {x: actX + firstAngleDirection.x + 1, y: actY + firstAngleDirection.y, stopF:5, stopB:1 }
		soAngleDirection[2] = {x: actX + firstAngleDirection.x - 1, y: actY + firstAngleDirection.y, stopF:7, stopB:3 }
		soAngleDirection[3] = {x: actX - 1, y: actY,  stopF:8, stopB:8}
		soAngleDirection[4] = {x: actX + 1, y: actY,  stopF:4, stopB:4}
	} else
	if (firstAngleDirection.way == 'left-down') {
		soAngleDirection[0] = {x: actX + firstAngleDirection.x, y: actY + firstAngleDirection.y,  stopF:7, stopB:3 }
		soAngleDirection[1] = {x: soAngleDirection[0].x, y: soAngleDirection[0].y + (- 1 * firstAngleDirection.sign), stopF:8, stopB:4}
		soAngleDirection[2] = {x: soAngleDirection[0].x  - (- 1 * firstAngleDirection.sign), y: soAngleDirection[0].y, stopF:6, stopB:2}
	} else
	if (firstAngleDirection.way == 'left') {
		soAngleDirection[0] = {x: actX + firstAngleDirection.x, y: actY + firstAngleDirection.y, stopF:8, stopB:4}
		soAngleDirection[1] = {x: actX + firstAngleDirection.x, y: actY + firstAngleDirection.y + 1, stopF:7, stopB:5}
		soAngleDirection[2] = {x: actX + firstAngleDirection.x, y: actY + firstAngleDirection.y - 1, stopF:1, stopB:3}
		soAngleDirection[3] = {x: actX, y: actY - 1, stopF:2, stopB:2}
		soAngleDirection[4] = {x: actX, y: actY + 1, stopF:6, stopB:6}
	} else
	if (firstAngleDirection.way == 'left-up') {
		soAngleDirection[0] = {x: actX + firstAngleDirection.x, y: actY + firstAngleDirection.y, stopF:1, stopB:5}
		soAngleDirection[1] = {x: soAngleDirection[0].x, y: soAngleDirection[0].y - (- 1 * firstAngleDirection.sign), stopF:8, stopB:4}
		soAngleDirection[2] = {x: soAngleDirection[0].x  - (- 1 * firstAngleDirection.sign), y: soAngleDirection[0].y, stopF:2, stopB:6}
	} else
	if (firstAngleDirection.way == 'up') {
		soAngleDirection[0] = {x: actX + firstAngleDirection.x, y: actY + firstAngleDirection.y, stopF:2, stopB:6}
		soAngleDirection[1] = {x: actX + firstAngleDirection.x - 1, y: actY + firstAngleDirection.y, stopF:1, stopB:7}
		soAngleDirection[2] = {x: actX + firstAngleDirection.x + 1, y: actY + firstAngleDirection.y, stopF:3, stopB:5}
		soAngleDirection[3] = {x: actX + 1, y: actY, stopF:4, stopB:4}
		soAngleDirection[4] = {x: actX - 1, y: actY, stopF:8, stopB:8}
	} else
	if (firstAngleDirection.way == 'right-up') {
		soAngleDirection[0] = {x: actX + firstAngleDirection.x, y: actY + firstAngleDirection.y, stopF:3, stopB:7}
		soAngleDirection[1] = {x: soAngleDirection[0].x, y: soAngleDirection[0].y - (- 1 * firstAngleDirection.sign), stopF:4, stopB:8}
		soAngleDirection[2] = {x: soAngleDirection[0].x  + (- 1 * firstAngleDirection.sign), y: soAngleDirection[0].y, stopF:2, stopB:6}
	}

	// FIRST CHACK WAY
	let checkX = soAngleDirection[0].x
	let checkY = soAngleDirection[0].y

	if (type == 'player') {
		check.directions = []
		check.directions = soAngleDirection
		if (typeof soAngleDirection[0] !='undefined' && typeof soAngleDirection[0].y != 'undefined') check.playerCheckY = soAngleDirection[0].y
		if (typeof soAngleDirection[0] !='undefined' && typeof soAngleDirection[0].x != 'undefined') check.playerCheckX = soAngleDirection[0].x
	}
	
	var spriteBarrier = []
	
	soAngleDirection.forEach(brick => {
		let checkMap = false
		if (typeof mapDataClass.map[brick.y] !='undefined' && typeof mapDataClass.map[brick.y][brick.x] != 'undefined') checkMap = (mapDataClass.map[brick.y][brick.x] != 0) ? true : false;
		
		let checkBlock = spritesClass.checkSpriteData(brick.y, brick.x, 'type', 'block')
		let checkBlockValue = (checkBlock && checkBlock.material == 'fix') ? true : false;
		
		let checkObject = spritesClass.checkSpriteData(brick.y, brick.x, 'type', 'object')
		let checkObjectValue = (checkObject && checkObject.material != 'ghost') ? true : false;

		let checkCreatures = spritesClass.checkSpriteData(brick.y, brick.x, 'type', 'creature')
		let checkCreaturesValue = (checkCreatures && checkCreatures.material != 'ghost') ? true : false;
				
		if (checkMap || checkBlockValue || checkObjectValue || checkCreaturesValue) {
			let actualNumber = (firstAngleDirection.sign > 0) ? brick.stopF : brick.stopB;
			if (!spriteBarrier.includes(actualNumber)) spriteBarrier.push(actualNumber)
		}
	});

	var deleteBarier = function(spriteBarrier, barrierId) {
		let findId = spriteBarrier.findIndex(barrier => barrier == barrierId)
		if (findId != -1) spriteBarrier.splice(findId, 1)
	}

	let deleteBarrierArray = [];

	spriteBarrier.forEach((barrier) => {
		if (barrier == 4) {
			if (spriteBarrier.includes(3)) deleteBarrierArray.push(3);
			if (spriteBarrier.includes(5)) deleteBarrierArray.push(5);
		}
		if (barrier == 8) {
			if (spriteBarrier.includes(1)) deleteBarrierArray.push(1);
			if (spriteBarrier.includes(7)) deleteBarrierArray.push(7);
		}
		if (barrier == 6) {
			if (spriteBarrier.includes(7)) deleteBarrierArray.push(7);
			if (spriteBarrier.includes(5)) deleteBarrierArray.push(5);
		}
		if (barrier == 2) {
			if (spriteBarrier.includes(1)) deleteBarrierArray.push(1);
			if (spriteBarrier.includes(3)) deleteBarrierArray.push(3);
		}
	});

	if (type == 'ammo') {
		deleteBarrierArray.push(1, 3, 5, 7)
	}

	deleteBarrierArray.forEach((barrier) => {
		deleteBarier(spriteBarrier, barrier)
	});

	if (type == 'ammo') {
		console.log(spriteBarrier);
	}

	spriteBarrier.forEach((barrier) => {
		if (barrier == 4 && (spriteObj.inX > CELL_SIZE - WALL_DISTANCE))	moveX = false;
		if (barrier == 8 && (spriteObj.inX < WALL_DISTANCE))	moveX = false;
		if (barrier == 6 && (spriteObj.inY > CELL_SIZE - WALL_DISTANCE)) moveY = false;
		if (barrier == 2 && (spriteObj.inY < WALL_DISTANCE)) moveY = false;
		
		if (barrier == 3 && (spriteObj.inY <= WALL_DISTANCE && spriteObj.inX >= CELL_SIZE - WALL_DISTANCE)) { moveX = false; moveY = false; }
		if (barrier == 5 && (spriteObj.inY >= CELL_SIZE - WALL_DISTANCE && spriteObj.inX >= CELL_SIZE - WALL_DISTANCE)) { moveX = false; moveY = false; }
		if (barrier == 7 && (spriteObj.inY >= CELL_SIZE - WALL_DISTANCE && spriteObj.inX <= WALL_DISTANCE)) { moveX = false; moveY = false; }
		if (barrier == 1 && (spriteObj.inY <= WALL_DISTANCE && spriteObj.inX <= WALL_DISTANCE)) { moveX = false; moveY = false; }
	});

	// if (type == 'ammo') {
	// 	moveX = true
	// 	moveY = true
	// 	spriteBarrier = []
	// }

	return {
		WALL_DISTANCE: WALL_DISTANCE,
		spriteBarrier: spriteBarrier,
		moveX: moveX,
		moveY: moveY,
		checkX: checkX,
		checkY: checkY,
	}
}

function movePlayer(bringPlayer, inputStrafeCheck) {

	let playerActX = Math.floor(bringPlayer.x / CELL_SIZE)
	let playerActY = Math.floor(bringPlayer.y / CELL_SIZE)

	// WALL CREATURE ATTACK
	for(const [key, value] of Object.entries(mapDataClass.wayCordinates)) {
		let checkEnemyWall = mapDataClass.map[playerActY + value.y][playerActX + value.x]
		
		if (checkEnemyWall.type == 'creature' && checkEnemyWall.energy > 0) {
			spritesClass.damage(bringPlayer, checkEnemyWall, true)

			let colorizeOption = { color: "255, 0, 0", alpha: 0.2, time: 5 }
			graphicsClass.screenColorizeOptions(colorizeOption);
		}
	}

	if (bringPlayer.move || inputStrafeCheck) {
		
		bringPlayer.move = false
		var pCheck = false
		
		pCheck = checkMoveSprite(bringPlayer, 'player', inputStrafeCheck)

		// OLD 45
		if (false) {
			let psPlayerX = Math.floor((bringPlayer.x + Math.cos(bringPlayer.angle) * bringPlayer.speed) / CELL_SIZE)
			let psPlayerY = Math.floor((bringPlayer.y + Math.sin(bringPlayer.angle) * bringPlayer.speed) / CELL_SIZE)
			if (mapDataClass.map[psPlayerY][psPlayerX]) { pCheck.moveX = false; pCheck.moveY = false; }
		}

		// Controlling the sprite relative to the player's movement.
		if (true) {
			spritesClass.sprites.forEach((sprite) => {
				let spriteActX = Math.floor(sprite.x / CELL_SIZE)
				let spriteActY = Math.floor(sprite.y / CELL_SIZE)

				// WAY PLAYER BRICK
				if ((pCheck.checkX == spriteActX) && (pCheck.checkY == spriteActY)) {

					// console.log('SPRITE A KÖVETKEZŐ!!!')
					
					if (sprite.type == 'block') return;
					if (sprite.material == 'ghost') return;

					// CRASH AND STOP PLAYER  // old crash
					// pCheck.moveX = false
					// pCheck.moveY = false

					let colorizeOption = { color: "0, 255, 0", alpha: 0.05, time: 10 }
					graphicsClass.screenColorizeOptions(colorizeOption)
				}

				// ACTUAL PLAYER BRICK
				if ((spriteActX == playerActX) && (spriteActY == playerActY)) {

					// PICKUP COINS
					if (sprite.active == true && sprite.mode.includes("coin")) {
						sprite.active = false
						bringPlayer.score = parseInt(bringPlayer.score) + parseInt(sprite.value)
						console.log('PICK UP COIN!!!')
						// COLORIZE SCREEN
						let colorizeOption = {}
						if (sprite.mode=='coin1') {
							bringPlayer.goldScore = parseInt(bringPlayer.goldScore) + parseInt(sprite.value)
							$('#coin-gold-text').text(bringPlayer.goldScore)
							colorizeOption = { color: "255, 180, 50", alpha: 0.5, time: 200 }
						}
						if (sprite.mode=='coin2') {
							console.log(bringPlayer.silverScore);
							
							bringPlayer.silverScore = parseInt(bringPlayer.silverScore) + parseInt(sprite.value)
							$('#coin-silver-text').text(bringPlayer.silverScore)
							colorizeOption = { color: "255, 255, 255", alpha: 0.5, time: 200 }
						}
						if (sprite.mode=='coin3') {
							bringPlayer.copperScore = parseInt(bringPlayer.copperScore) + parseInt(sprite.value)
							$('#coin-copper-text').text(bringPlayer.copperScore)
							colorizeOption = { color: "200, 100, 0", alpha: 0.5, time: 200 }
						}
						graphicsClass.screenColorizeOptions(colorizeOption);
						return;
					}

					// PICKUP MASHROOM
					if (sprite.active == true && sprite.mode == 'mushroom') {
						console.log('Mashroom!!!')
						sprite.active = false
						bringPlayer.poison = true
						return;
					}

					// PICKUP MAP
					if (sprite.active == true && sprite.mode == 'map') {
						console.log('MAP!!!')
						sprite.active = false
						bringPlayer.map = true

						let colorizeOption = { color: "255, 240, 180", alpha: 0.5, time: 200 }
						graphicsClass.screenColorizeOptions(colorizeOption)

						let content = `<div class="text-center"><h3 class='text-center'>You picked up the map</h3><div class="mx-auto">If you want to use the map, press the "m" key.</div></div>`
						graphicsClass.scrollInfoMaker(content, inputClass.messageTime)

						return;
					}

					// PICKUP HEALTS					
					if (sprite.active == true && sprite.mode == 'energy') {
						if (bringPlayer.energy < 100) {
							console.log('HEALTH!!!')
							sprite.active = false
							bringPlayer.energy += sprite.value
							if (bringPlayer.energy>100) bringPlayer.energy = 100

							$("#healt-percentage").text(bringPlayer.energy + '%');
							$("#healt-percentage").css('color', 'green');
							spritesClass.playerHealtTimeOut(bringPlayer.energy)
	
							let colorizeOption = { color: "60, 175, 215", alpha: 0.5, time: 200 }
							graphicsClass.screenColorizeOptions(colorizeOption)
						}
						return;
					}
					
					// PICKUP KEYS
					if (sprite.active == true && sprite.mode.includes("key")) {
						
						let colorizeOption = {}
						if (!player.key1 && sprite.type == 'object' && sprite.mode=='key1') {
							console.log('PICK UP cellar KEY SILVER')
							bringPlayer.key1 = true
							sprite.active = false
							$('#silver-key').addClass('silver-key-on')
							colorizeOption = { color: "255, 255, 255", alpha: 0.5, time: 200 }
							graphicsClass.screenColorizeOptions(colorizeOption);
						}
						if (!player.key2 && sprite.type == 'object' && sprite.mode=='key2') {
							console.log('PICK UP cellar GOLD KEY')
							bringPlayer.key2 = true
							sprite.active = false
							$('#gold-key').addClass('gold-key-on')
							colorizeOption = { color: "255, 180, 50", alpha: 0.5, time: 200 }
							graphicsClass.screenColorizeOptions(colorizeOption);
						}
						return;
					}

					// PICKUP WEAPONS
					if (sprite.active == true && sprite.mode.includes("weapon")) {
						
						console.log('WEAPON2 nél');
						
						let colorizeOption = {}
						if (sprite.type == 'object' && sprite.mode=='weapon2') {
							console.log('PICK UP WEAPON2!')
							bringPlayer.adoptedWeapons.weapon2 = true
							bringPlayer.weapon = 2
							sprite.active = false
							$('#weapon2').addClass('weapon2-on')
							colorizeOption = { color: "255, 255, 255", alpha: 0.5, time: 200 }
							graphicsClass.screenColorizeOptions(colorizeOption);
						}
						return;
					}

					// PICKUP SCROLLS
					if (sprite.active == true && sprite.mode == 'message') {
						sprite.active = false
						let content = `<div class="text-center"><h3 class='text-center'>${sprite.message}</h3></div>`
						let useButton = (sprite.time == 0) ? true : false;
						graphicsClass.scrollInfoMaker(content, sprite.time, useButton)
						return;
					}
				}

				// EXIT
				let checkExit = spritesClass.checkSpriteData(player.y, player.x, 'mode', 'exit', 'position')				
				if (checkExit) {
					gamePlay.nextLevel = true
					return;
				}
			})
		}
		
		moveAction(bringPlayer, pCheck)

		bringPlayer.z = graphicsClass.amplitudeA(graphicsClass.WALKINTERVAL)

		if (bringPlayer.speed < 0) {
			bringPlayer.speed = 1
			bringPlayer.move = true
		}
	}

	return pCheck;
}

function moveAction(sprite, check) {
	let testX = (check.moveX) ? sprite.x + Math.cos(sprite.angle) * sprite.speed : sprite.x;
	let testY = (check.moveY) ? sprite.y + Math.sin(sprite.angle) * sprite.speed : sprite.y;

	let testActX = Math.floor(testX / CELL_SIZE)
	let testActY = Math.floor(testY / CELL_SIZE)

	let testInX = Math.floor(testX - (testActX * CELL_SIZE))
	let testInY = Math.floor(testY - (testActY * CELL_SIZE))

	var crash = false

	check.spriteBarrier.forEach((barrier) => {
		const FAR = CELL_SIZE - check.WALL_DISTANCE
		const NEAR = check.WALL_DISTANCE
		const maxX = (testActX * CELL_SIZE) + (FAR)
		const minX = (testActX * CELL_SIZE) + (NEAR)
		const maxY = (testActY * CELL_SIZE) + (FAR)
		const minY = (testActY * CELL_SIZE) + (NEAR)

		if (barrier == 4 && (testInX > FAR)) {
			sprite.wallCrash = 4
			testX = maxX
			crash = 4
		}
		if (barrier == 8 && (testInX < NEAR)) {
			sprite.wallCrash = 8
			testX = minX
			crash = 8
		}
		if (barrier == 6 && (testInY > FAR)) {
			sprite.wallCrash = 6
			testY = maxY
			crash = 6
		}
		if (barrier == 2 && (testInY < NEAR)) {
			sprite.wallCrash = 2
			testY = minY
			crash = 2
		}
		if (barrier == 3 && (testInY <= NEAR && testInX >= FAR)) {
			testX = maxX
			testY = minY
			crash = 3
		}
		if (barrier == 5 && (testInY >= FAR && testInX >= FAR)) {
			testX = maxX
			testY = maxY
			crash = 5
		}
		if (barrier == 7 && (testInY >= FAR && testInX <= NEAR)) {
			testX = minX
			testY = maxY
			crash = 7
		}
		if (barrier == 1 && (testInY <= NEAR && testInX <= NEAR)) {
			testX = minX
			testY = minY
			crash = 1
		}
	});
	// MOVE
	sprite.x = testX
	sprite.y = testY

	return crash;
}

function moveCreature(creature) {
	if (typeof creature.speed != 'undefined' && creature.speed != 0) {
		
		let cCheck = checkMoveSprite(creature, 'creature')
						
		if (mapDataClass.map[cCheck.checkY][cCheck.checkX] != 0 && mapDataClass.map[cCheck.checkY][cCheck.checkX].type == 'effect') {
			console.log(mapDataClass.map[cCheck.checkY][cCheck.checkX].type);
		}

		check.creatureCheckX = cCheck.checkX
		check.creatureCheckY = cCheck.checkY

		let playerActX = Math.floor(player.x / CELL_SIZE)
		let playerActY = Math.floor(player.y / CELL_SIZE)

		// HIT PLAYER
		if ((playerActX == cCheck.checkX) && (playerActY == cCheck.checkY) && !creature.anim_die_actFrame) {
			console.log('PLAYER TALÁLAT!!!')

			creature.move = false

			spritesClass.damage(player, creature, true)
			
			// ATTACK TEXTURE
			if (!creature.anim_attack_function) {
				creature.anim_attack_actFrame = `${creature.dirConstruction[0]}_E1`
				creature.anim_attack_function = setInterval(() => {
					creature.anim_attack_actFrame = (creature.anim_attack_actFrame == `${creature.dirConstruction[0]}_E1`) ? `${creature.dirConstruction[0]}_E2` : `${creature.dirConstruction[0]}_E1`;
				}, creature.anim_speed)
			}

			let colorizeOption = { color: "255, 0, 0", alpha: 0.2, time: 5 }
			graphicsClass.screenColorizeOptions(colorizeOption);
		} else {
			// NORMAL CREATURE WALK

			// MOVE CREATURE
			creature.move = true

			// DELETE ATTACK CREATURE
			if (creature.anim_attack_function) {
				clearInterval(creature.anim_attack_function)
				creature.anim_attack_function = null
			}

			// IF FIX SPRITE	angel:180
			let checkMapSprite = spritesClass.checkSpriteData(creature.y, creature.x, 'type', 'object', 'position')
			if (checkMapSprite && checkMapSprite.material == 'fix') creature.angle += (Math.PI / 2)

			// IF DOOR
			let checkDoor = spritesClass.checkSpriteData(creature.y, creature.x, 'mode', 'door', 'position')
			if (checkDoor && checkDoor.material == 'fix') creature.angle += (Math.PI / 2)
	
			// IF BLOCK
			let checkBlock = spritesClass.checkSpriteData(creature.y, creature.x, 'type', 'block', 'position')
			if (checkBlock && checkBlock.mode != 'door') creature.angle += (Math.PI / 2)
	
			// DIE CREATURE
			if (creature.anim_die_function) return;
			
			// MOVE MODES
			if (creature.moveType == 'stay') return;

			if (creature.moveType == 'levitation') {
				creature.z = graphicsClass.amplitudeA(graphicsClass.WALKINTERVAL)
				return;
			}

			// MOVE CREATURE
			if (creature.moveType == 'patrol') {
				if (typeof creature.wallCrash != 'undefined' && creature.wallCrash != null) {
					let wall = creature.wallCrash
					creature.wallCrash = null
					creature.x = Math.floor((creature.x / CELL_SIZE)) * CELL_SIZE + (CELL_SIZE / 2)
					creature.y = Math.floor((creature.y / CELL_SIZE)) * CELL_SIZE + (CELL_SIZE / 2)
					
					let creatureMapX = Math.floor(creature.x / CELL_SIZE)
					let creatureMapY = Math.floor(creature.y / CELL_SIZE)
					let alterWays = {... mapDataClass.wayBarriers}
					
					delete alterWays[wall];
					mapDataClass.wayCordinates.forEach(way => {
						if (typeof mapDataClass.map[creatureMapY + way.y] != 'undefined' && typeof mapDataClass.map[creatureMapY + way.y][creatureMapX + way.x] != 'undefined') {
							if (mapDataClass.map[creatureMapY + way.y][creatureMapX + way.x] != 0) delete alterWays[way.barrier]
						}

						let wayCheckBlock = spritesClass.checkSpriteData(creatureMapY + way.y, creatureMapX + way.x, 'type', 'block')
						if (wayCheckBlock && wayCheckBlock.active && wayCheckBlock.material == 'fix') {
							delete alterWays[way.barrier]
						}
						
						let wayCheckObject = spritesClass.checkSpriteData(creatureMapY + way.y, creatureMapX + way.x, 'type', 'object')						
						if (wayCheckObject && wayCheckObject.active && wayCheckObject.material == 'fix') {
							delete alterWays[way.barrier]
						}

						let wayCheckCreature = spritesClass.checkSpriteData(creatureMapY + way.y, creatureMapX + way.x, 'type', 'creature')
						if (wayCheckCreature && wayCheckCreature.active) {
							delete alterWays[way.barrier]
						}
					});

					let wayBarriers = Object.keys(alterWays)
					let barriersLength = wayBarriers.length

					if (barriersLength > 0) {
						// RANDOM WAY
						let randomBarrier =  Math.floor(Math.random() * (barriersLength))
						creature.angle = graphicsClass.toRadians(alterWays[wayBarriers[randomBarrier]])
					}
				}
			}

			// IF EFFECT
			let checkEffect = spritesClass.checkSpriteData(creature.y, creature.x, 'type', 'effect', 'position')
			if (checkEffect) if (checkEffect.mode == 'direction') {
				//console.log('EFFETC WAY !!!');
				if ((creature.inY >=inputClass.CREATURE_WALL_DISTANCE && creature.inY <= CELL_SIZE - inputClass.CREATURE_WALL_DISTANCE) &&
					(creature.inX >=inputClass.CREATURE_WALL_DISTANCE && creature.inX <= CELL_SIZE - inputClass.CREATURE_WALL_DISTANCE)) creature.angle = checkEffect.angle;
			}
			
			// IF ATTACK CREATURE
			if (creature.moveType == 'attack') {
				let distanceX = player.x - creature.x;
				let distanceY = player.y - creature.y;
				creature.angle = Math.atan2(distanceY, distanceX);

				if (!cCheck.moveX && !((creature.inY >=32 && creature.inY <=32) && cCheck.moveY)) {
					cCheck.moveY = false
				} 
				if (!cCheck.moveY && !((creature.inX >=32 && creature.inX <=32) && cCheck.moveX)) {
					cCheck.moveX = false
				}

				if (!cCheck.moveY && !cCheck.moveX) {
					creature.moveType = 'patrol'
					creature.speed = 3
				}
			}
			
			// MOVE
			if (creature.move) moveAction(creature, cCheck)
		}
	}
}

function moveAmmo(ammoSprite) {
	if (ammoSprite.speed != 0) {
		
		function turnOffAmmo(ammoSprite) {
			ammoSprite.move = false
			ammoSprite.anim_switch = false
			ammoSprite.anim_actFrame = ammoSprite.dirConstruction.length - 1
			
			ammoSprite.endFunction = setTimeout(() => {
				ammoSprite.active = false
				clearTimeout(ammoSprite.endFunction);
				ammoSprite.endFunction = null;
			}, 10)
		}
		
		let ammoCheck = checkMoveSprite(ammoSprite, 'ammo')
		
		// CHECK HIT SPRITES
		let checkSprites = spritesClass.sprites.filter(obj => Math.floor(obj.y / CELL_SIZE) == ammoCheck.checkY && Math.floor(obj.x / CELL_SIZE) == ammoCheck.checkX)
		checkSprites.forEach((findSprite) => {
			if ((findSprite.type == 'creature' && findSprite.material == 'enemy' && findSprite.active)) {
				spritesClass.enemyHit(findSprite)
				// DELETE AMMO
				turnOffAmmo(ammoSprite)
				let ammoIndex = spritesClass.sprites.indexOf(ammoSprite);
				if (ammoIndex !== -1) spritesClass.sprites.splice(ammoIndex, 1)
			}

			if ((findSprite.type == 'block') || (findSprite.type == 'object' && findSprite.material == 'fix')) {
				if ((findSprite.mode == 'door' || findSprite.mode == 'key1' || findSprite.mode == 'key2') && findSprite.open_positionValue < -50) {
					// DOOR OPENED
					return;
				}

				// DELETE AMMO
				turnOffAmmo(ammoSprite)
				let ammoIndex = spritesClass.sprites.indexOf(ammoSprite);
				if (ammoIndex !== -1) spritesClass.sprites.splice(ammoIndex, 1)
			}
		});

		// MOVE AMMO
		var haveCrash = moveAction(ammoSprite, ammoCheck)
	
		// CHECK HIT WALL ENEMY
		if (haveCrash) {				
			var ammoMapX = Math.floor(ammoSprite.x/CELL_SIZE)
			var ammoMapY = Math.floor(ammoSprite.y/CELL_SIZE)
			
			var wallData = 0			

			if (haveCrash == 2) wallData = mapDataClass.map[ammoMapY - 1][ammoMapX];
			else if (haveCrash == 6) wallData = mapDataClass.map[ammoMapY + 1][ammoMapX];
			else if (haveCrash == 8) wallData = mapDataClass.map[ammoMapY][ammoMapX - 1];
			else if (haveCrash == 4) wallData = mapDataClass.map[ammoMapY][ammoMapX + 1];
			else if (haveCrash == 1) wallData = mapDataClass.map[ammoMapY - 1][ammoMapX - 1];
			else if (haveCrash == 3) wallData = mapDataClass.map[ammoMapY - 1][ammoMapX + 1];
			else if (haveCrash == 5) wallData = mapDataClass.map[ammoMapY + 1][ammoMapX + 1];
			else if (haveCrash == 7) wallData = mapDataClass.map[ammoMapY + 1][ammoMapX - 1];

			if (typeof wallData != 'undefined' && wallData?.type == 'creature') {
				if (wallData.energy > 0) wallData.energy--
				
				console.log('Energy: ' + wallData.energy)
				
				console.log(wallData.dirConstruction[[wallData.dirConstruction.length-1]])

				if (wallData.energy <= 0) {
					wallData.anim_startFrame = wallData.dirConstruction.length-1
					wallData.anim_actFrame = wallData.dirConstruction.length-1

					wallData.anim_switch = false
				}
			}

			// TURN OFF AMMO
			turnOffAmmo(ammoSprite)
		}
	}
	return true
}
		   
function spritesCheck() {
	// ARRANGE SPRITES
	spritesClass.nearSprites.forEach((nearData) => {
		let sprite = spritesClass.sprites[nearData]
		if (typeof sprite == 'undefined') return;

		// CHECK CREATURE DIE
		if (sprite.energy < 1) {
			sprite.move = false
			sprite.material = 'ghost'
			if (!sprite.anim_die_function) {
				clearInterval(sprite.anim_function); sprite.anim_function = null
				clearInterval(sprite.anim_attack_function); sprite.anim_attack_function = null
				clearInterval(sprite.anim_damage_function); sprite.anim_damage_function = null
				// MAJD TÖRÖLNI AZ INTERVALOKAT A KÖVETKEZŐ MAP TÖLTÉSÉNÉL!!!!				
				sprite.anim_die_actFrame = `${sprite.dirConstruction[0]}_F1`
				sprite.anim_die_actFrame_count = 1
				sprite.anim_die_function = setInterval(() => {					
					if (sprite.anim_die_actFrame_count < 4) sprite.anim_die_actFrame_count++
					if (sprite.anim_die_actFrame == 5) return;
					sprite.anim_die_actFrame = `${sprite.dirConstruction[0]}_F${sprite.anim_die_actFrame_count}`
				}, sprite.anim_speed)
			}
		}

		sprite.distance = graphicsClass.spriteDistanceCalc(sprite)
				
		if (sprite.active) {
			let getActualTexture = sprite.dirConstruction[1]	// Standard texture

			// IF CREATURES
			if (sprite.type == 'creature') {
				// CREATURE DIE
				if (sprite.anim_die_function) getActualTexture = sprite.anim_die_actFrame
				// CREATURE damage
				else if (sprite.anim_damage_function) getActualTexture = sprite.anim_damage_actFrame
				// CREATURE ATTACK
				else if (sprite.anim_attack_function) getActualTexture = sprite.anim_attack_actFrame
				// BASIC ANIM START
				else if (!sprite.anim_function) {
					sprite.anim_actFrame = sprite.anim_frames[0]
					sprite.anim_function = setInterval(() => {
						sprite.anim_actFrame++
						if (sprite.anim_actFrame > sprite.anim_frames.length) sprite.anim_actFrame = sprite.anim_frames[sprite.anim_startFrame]
					}, sprite.anim_speed)
				// BASIC ANIM
				} else {
					getActualTexture = creatureSpriteSelect(sprite)
				}
				moveCreature(sprite)
			}

			// ANIM TEXTURES
			if (sprite.type == 'block' || sprite.type == 'object') {
				if (sprite.active) {
					let checkActAnim = mapDataClass.loadAnimationTexture(sprite)
					if (checkActAnim) getActualTexture = checkActAnim[1]
				}
			}

			// IF AMMO
			if (sprite.type == 'ammo') {
				if (sprite.active) {
					moveAmmo(sprite)
					let checkActAnim = mapDataClass.loadAnimationTexture(sprite)
					if (checkActAnim) getActualTexture = checkActAnim[1]

					let interval = 0
					if (player.weapon == 3) interval = -6;
					if (player.weapon == 4) interval = -4;

					if (interval) sprite.z = graphicsClass.amplitudeA(interval);

					// if (player.weapon == 3) sprite.x += graphicsClass.amplitudeA(interval);
				}
			}
			
			let actualTexture = (sprite.type == 'ammo') 
			? texturesClass.weaponsTextures[sprite.dirConstruction[0]][getActualTexture]
			: texturesClass.spriteTextures[sprite.dirConstruction[0]][getActualTexture];
			
			graphicsClass.renderScreenSprites(sprite, actualTexture)
		}
	});

	// DELETE AMMOS
	let delAmmos = spritesClass.sprites.filter(obj => obj.type == "ammo" && obj.active == false)
	delAmmos.forEach((ammoSprite) => {
		let ammoIndex = spritesClass.sprites.indexOf(ammoSprite);
		if (ammoIndex !== -1) spritesClass.sprites.splice(ammoIndex, 1)
	});	
}

function creatureSpriteSelect(creature) {
	creature.anim_actFrame = (creature.anim_actFrame) ? creature.anim_actFrame : 2;

	let angDif = graphicsClass.toAngle(creature.angle - player.angle);

	// ROTATION
	if (creature.rotate_switch) {
		var rot_b = creature.rotate_frames[0]; var rot_d = creature.rotate_frames[1]; var rot_a = creature.rotate_frames[2]; var rot_c = creature.rotate_frames[3];
	} else {
		var rot_b = 'a'; var rot_d = 'a'; var rot_a = 'a'; var rot_c = 'a';
	}

	let texturename;

	// ANIMATIONFRAME
	if (angDif >= 135 && angDif < 225) {
		texturename = `${creature.dirConstruction[0]}_${rot_a}${creature.anim_actFrame}`
	} else if (angDif >= 315 && angDif <= 360 || angDif >= 0 && angDif < 45) {
		texturename = `${creature.dirConstruction[0]}_${rot_b}${creature.anim_actFrame}`
	} else if (angDif >= 225 && angDif < 315) {
		texturename = `${creature.dirConstruction[0]}_${rot_c}${creature.anim_actFrame}`
	} else if (angDif >= 45 && angDif < 135) {
		texturename = `${creature.dirConstruction[0]}_${rot_d}${creature.anim_actFrame}`
	}
	
	return texturename;
}

async function loadindData() {

	mapDataClass.map = []
	spritesClass.sprites = []
	spritesClass.nearSprites = []
	spritesClass.weponsSprites = []
	
	var actualLevel = mapDataClass.maps[mapDataClass.mapLevel];

	console.log('load map name: ' + actualLevel);

	const weaponAmmoDataResponse = await fetch('./data/weapons/weapon_ammos.JSON')
	const weaponsAmmoData = await weaponAmmoDataResponse.json()

	// LOAD WEAPON AMMOS TEXTURES
	for (let n = 0; n < weaponsAmmoData.ammos.length; n++) {
		let ammo = weaponsAmmoData.ammos[n]
		let dirConstruction = await texturesClass.loadTextureToArray(ammo.textures, 'weapons', texturesClass.weaponsTextures)
		spritesClass.createSprite(ammo, dirConstruction, spritesClass.weponsSprites)
	}
		
	const mapDataResponse = await fetch(`./data/maps/${actualLevel}.JSON`)
	const mapData = await mapDataResponse.json()

	mapDataClass.shadow = mapData.shadow
		
	// console.log(mapData)
	
	const wallsDataResponse = await fetch('./data/walls/walls.JSON')
	const wallsData = await wallsDataResponse.json()
	// console.log(wallsData)

	const blocksDataResponse = await fetch('./data/blocks/blocks.JSON');
	const blocksData = await blocksDataResponse.json()
	// console.log(blocksData)

	const objectsDataResponse = await fetch('./data/objects/objects.JSON')
	const objectsData = await objectsDataResponse.json()
	// console.log(objectsData)

	const creaturesDataResponse = await fetch('./data/creatures/creatures.JSON')
	const creaturesData = await creaturesDataResponse.json()
	// console.log(creaturesData)

	const effectsDataResponse = await fetch('./data/effects/effects.JSON')
	const effectsData = await effectsDataResponse.json()
	// console.log('effectsData')
	// console.log(effectsData)
	
	player.x = mapData.player.x * CELL_SIZE
	player.y = mapData.player.y * CELL_SIZE
	player.angle = graphicsClass.toRadians(mapData.player.angle)

	// Load Error Texture
	let error = mapData.error[0]
	await texturesClass.loadTexturesPicture(error, 'error', texturesClass.errorTexture)
	
	// Load SKY Texture
	let sky = mapData.skys[0]
	mapDataClass.sky = sky
	
	await texturesClass.loadTexturesPicture(sky, 'skys', texturesClass.skyTexture)

	// Load Floor Texture
	let floor = mapData.floors[0]
	mapDataClass.floor = floor
	
	await texturesClass.loadTexturesPicture(floor, 'floors', texturesClass.floorTexture)

	// Load Wall Textures
	for (let i = 0; i < wallsData.length; i++) {
		let wall = wallsData[i]		
		let dirConstruction = await texturesClass.loadTextureToArray(wall.textures, 'walls', texturesClass.wallTextures)
		await mapDataClass.createWall(wall, dirConstruction)
	}
	
	// Map Array upload Wall textures
	await mapDataClass.defineTextures(mapData.map)

	// Load Sprites
	for (let i = 0; i < mapData.sprites.length; i++) {
		let sprite = mapData.sprites[i]
		let dirName
		let insertSprite = objectsData.find(obj => parseInt(obj.id) == parseInt(sprite.id))
		if (insertSprite) { dirName = 'objects' }
		else if (!insertSprite) {
			insertSprite = blocksData.find(block => parseInt(block.id) == parseInt(sprite.id))
			if (insertSprite) { dirName = 'blocks' }
			else if (!insertSprite) {
				insertSprite = creaturesData.find(creature => parseInt(creature.id) == parseInt(sprite.id))
				if (insertSprite) { dirName = 'creatures'; } else if (!insertSprite) {
					insertSprite = effectsData.find(effect => parseInt(effect.id) == parseInt(sprite.id))
					if (insertSprite) { 
						dirName = 'effects';
					}
				}
			}
		}

		if (typeof insertSprite != 'undefined') {
			let data = {}
			data.id = sprite.id
			for (const [key, value] of Object.entries(insertSprite)) data[key] = value;
			sprite = {...data, ...sprite}
			if (sprite.type == 'creature' || sprite.type == 'effect') sprite.angle = graphicsClass.toRadians(sprite.angle)
		}
		
		var dirConstruction
		if (sprite.type !='effect') {
			dirConstruction = await texturesClass.loadTextureToArray(sprite.textures, dirName, texturesClass.spriteTextures)
		}

		spritesClass.createSprite(sprite, dirConstruction, spritesClass.sprites)
	}

	// LOADING INFO
	// console.log(texturesClass.loadingInfo);

	console.log(texturesClass.loadingInfo.length + ' image loaded.');
	texturesClass.loadingInfo = []
}

async function gameMenu() {
	if (gamePlay.nextLevel) {
		clearInterval(gamePlay.game)
		gamePlay = {
			game: null,
			gameLoaded: false,
			timeStart: null,
			nextLevel: false,
		}
		player.key1 = false
		player.key2 = false
		player.map = false
		player.poison = false

		$('#silver-key').removeClass('silver-key-on')
		$('#gold-key').removeClass('gold-key-on')

		// MAP ÖSSZESÍTŐ INFO
		
		// let content = `<div class="text-center"><h3 class='text-center'>Youfind the EXIT!</h3></div>`
		// graphicsClass.scrollInfoMaker(content, null, true)

		mapDataClass.mapLevel++	
		if (mapDataClass.maps.length-1 < mapDataClass.mapLevel) mapDataClass.mapLevel = 0
		menu.menuactive = false
	}

	if (menu.menuactive) {
		//// MENU
		clearInterval(gamePlay.game)
		gamePlay.game = null
		inputClass.moveMenuStar()
		document.getElementById('canvas-container').style.display='none'
		document.getElementById('loading').style.display='none'
		document.getElementById('menu-bg').style.display='block'
		graphicsClass.clrScr()
		return;
	} else {
		//// GAME

		// LOADING
		if (!gamePlay.gameLoaded) {
			document.getElementById('menu-bg').style.display='none'
			document.getElementById('canvas-container').style.display='none'
			document.getElementById('loading').style.display='block'
			await loadindData()
			gamePlay.gameLoaded = true
			document.getElementById('loading').style.display='none'
		}

		// BACK TO GAME
		document.getElementById('menu-bg').style.display='none'
		document.getElementById('loading').style.display='none'
		document.getElementById('canvas-container').style.display='block'
		
		if (!gamePlay.game) {
			gamePlay.game = setInterval(gameLoop, CLOCKSIGNAL);
		}
	}
	return;
}

var szamol = 0;

function nextLevel() {
	clearInterval(gamePlay.game)
	gamePlay.game = null
	graphicsClass.clrScr()
	
	inputClass.graphicsClass.makeMenu()
	inputClass.gameMenu()
}

function gameLoop() {
	gamePlay.timeStart = Date.now()
	movePlayer(player)

	if (gamePlay.nextLevel) { nextLevel(); return; }

	graphicsClass.rays = graphicsClass.getRays()
	spritesClass.sprites = spritesClass.sprites.sort((a, b) => b.distance - a.distance)
	graphicsClass.renderScreen()
	spritesClass.selectNearSprites()
	spritesCheck()
	spritesClass.sprites.forEach(sprite => {
		sprite.distance = graphicsClass.spriteDistanceCalc(sprite)
	});
	
	if (!menu.menuactive && player.weapon) graphicsClass.playerWeapon()
	
	graphicsClass.screenColorizeAction()
	if (menu.mapSwitch) graphicsClass.renderMinimap()
	if (menu.infoSwitch) graphicsClass.infoPanel()
	if (menu.clearGameSwitch) clearInterval(gamePlay.game)

	// szamol++;
	// if (szamol == 1) clearInterval(gamePlay.game)

	if (player.poison) graphicsClass.poison()
}

//-------------------
//	  GAME START	|
//-------------------
const texturesClass = new TexturesClass ()
const mapDataClass 	= new MapDataClass  ({texturesClass: texturesClass})
const spritesClass 	= new SpritesClass  ({CELL_SIZE: CELL_SIZE, player: player, texturesClass: texturesClass, mapDataClass: mapDataClass})
const graphicsClass = new GaphicsClass  ({mapDataClass: mapDataClass, spritesClass: spritesClass, texturesClass: texturesClass, CELL_SIZE: CELL_SIZE, player: player, menu: menu, gamePlay: gamePlay, check: check})
const inputClass 	= new InputsClass   ({mapDataClass: mapDataClass, spritesClass: spritesClass, graphicsClass: graphicsClass, movePlayer: movePlayer, menu: menu, gameMenu: gameMenu, player: player, keyPressed: keyPressed, gamePlay: gamePlay, check: check})

window.onload = async () => {
	gameMenu()
};
