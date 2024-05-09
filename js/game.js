// -------------------------------------------------------
// 						DANI RAYENGINE
// -------------------------------------------------------

import GaphicsClass from './graphics-class.js'
import InputsClass from './input-class.js'
import TexturesClass from './textures-class.js'
import MapDataClass from './mapdata-class.js'
import SpritesClass from './sprites-class.js'

const CLOCKSIGNAL = 10
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
	score: 0,
	weapon: 1,
	poison: false,
}

const menu = {
	actualMenuRow: 0,
	menuactive: true,
	optionsActive: false,
	clearGameSwitch: false,
	infoSwitch: false,
	mapSwitch: true,
	shadowsSwitch: true,
	spriteShadowsSwitch: true,
	mouseSwitch: true,
	floorSwitch: true,
	skySwitch: true,
}

var gamePlay = {
	game: null,
	gameLoaded: false,
	timeStart: null,
}

// DOOR CHECK ??
var check = {
	playerCheckX: 0,
	playerCheckY: 0,
	playerCheckX2: 0,
	playerCheckY2: 0,
	creatureCheckX: null,
	creatureCheckY: null,
}

var keyPressed = {};

// -------------------------------------------------------

function checkDirection(angle, speed) {
    angle = graphicsClass.toRadians(angle);
    // let sign = (speed > 0) ? 1 : -1;			// !!!
    let sign = 1;
    if (angle >= 0 && angle < Math.PI / 8) {
        return { y: 0, x: 1 * sign };      			// Right
    } else if (angle >= Math.PI / 8 && angle < 3 * Math.PI / 8) {
        return { y: 1 * sign, x: 1 * sign };      	// Down-Right
    } else if (angle >= 3 * Math.PI / 8 && angle < 5 * Math.PI / 8) {
        return { y: 1 * sign, x: 0 };      			// Down
    } else if (angle >= 5 * Math.PI / 8 && angle < 7 * Math.PI / 8) {
        return { y: 1 * sign, x: -1 * sign };      	// Down-Left
    } else if (angle >= 7 * Math.PI / 8 && angle < 9 * Math.PI / 8) {
        return { y: 0, x: -1 * sign };      		// Left
    } else if (angle >= 9 * Math.PI / 8 && angle < 11 * Math.PI / 8) {
        return { y: -1 * sign, x: -1 * sign };      // Up-Left
    } else if (angle >= 11 * Math.PI / 8 && angle < 13 * Math.PI / 8) {
        return { y: -1 * sign, x: 0 };      		// Up
    } else if (angle >= 13 * Math.PI / 8 && angle < 15 * Math.PI / 8) {
        return { y: -1 * sign, x: 1 * sign };      	// Up-Right
    } else {
        return { y: 0, x: 1 * sign };				// Default Up-Right
    }
}

function playerWalk() {
	const amplitude = (Math.abs(graphicsClass.WALKINTERVAL) - graphicsClass.WALKINTERVAL) / 2;
	const offset = (Math.abs(graphicsClass.WALKINTERVAL) + graphicsClass.WALKINTERVAL) / 2;
	const frequency = 10;

	const value = Math.sin(frequency * Date.now() * 0.001) * amplitude + offset;
	return Math.floor(value);
}

function checkMoveSprite(spriteObj) {
	let actX = Math.floor(spriteObj.x / CELL_SIZE)
	let actY = Math.floor(spriteObj.y / CELL_SIZE)
	spriteObj.inX =  Math.floor(spriteObj.x - (actX * CELL_SIZE))
	spriteObj.inY =  Math.floor(spriteObj.y - (actY * CELL_SIZE))
	
	let moveX = true
	let moveY = true

	if (spriteObj.x < spriteObj.x + (Math.cos(spriteObj.angle) * spriteObj.speed)) {
		// RIGHT
		if (mapDataClass.map[actY][actX+1] && spriteObj.inX >= CELL_SIZE - inputClass.WALL_DISTANCE) moveX = false;
	} else {
		// LEFT
		if (mapDataClass.map[actY][actX-1] && spriteObj.inX <= inputClass.WALL_DISTANCE) moveX = false;
	}
	
	if (spriteObj.y < spriteObj.y + (Math.sin(spriteObj.angle) * spriteObj.speed)) {
		// DOWN
		if (mapDataClass.map[actY+1][actX] && spriteObj.inY >= CELL_SIZE - inputClass.WALL_DISTANCE) moveY = false;
	} else {
		// UP
		if (mapDataClass.map[actY-1][actX] && spriteObj.inY <= inputClass.WALL_DISTANCE) moveY = false;
	}

	let spriteObjAngleDirection = checkDirection(graphicsClass.toAngle(spriteObj.angle), spriteObj.speed)

	console.log(spriteObjAngleDirection);
	
	let checkX = actX + spriteObjAngleDirection.x
	let checkY = actY + spriteObjAngleDirection.y

	return {
		moveX: moveX,
		moveY: moveY,
		checkX: checkX,
		checkY: checkY,
	}
}

function movePlayer(bringPlayer, inputStrafeCheck) {
	var pCheck = false
	
	let playerActX = Math.floor(bringPlayer.x / CELL_SIZE)
	let playerActY = Math.floor(bringPlayer.y / CELL_SIZE)

	pCheck = checkMoveSprite(bringPlayer)

	// PLAYER WAY ATMOSPHERE (DOOR)
	check.playerCheckX = pCheck.checkX
	check.playerCheckY = pCheck.checkY

	// Controlling the sprite relative to the player's movement.
	spritesClass.sprites.forEach((sprite,i) => {

		let spriteActX = Math.floor(sprite.x / CELL_SIZE)
		let spriteActY = Math.floor(sprite.y / CELL_SIZE)

		// WAY PLAYER BRICK
		if ((pCheck.checkX == spriteActX) && (pCheck.checkY == spriteActY)) {
			console.log('SPRITE A KÖVETKEZŐ!!!')
			if (sprite.material == 'ghost') return;
			
			// CRASH AND STOP PLAYER
			pCheck.moveX = false
			pCheck.moveY = false

			let colorizeOption = { color: "0, 255, 0", alpha: 0.1, time: 100 }
			graphicsClass.screenColorizeOptions(colorizeOption);
		}

		// ACTUAL PLAYER BRICK
		if ((spriteActX == playerActX) && (spriteActY == playerActY)) {

			// PICKUP COINS
			if (sprite.active == true && sprite.mode.includes("coin")) {
				sprite.active = false
				bringPlayer.score = parseInt(bringPlayer.score) + parseInt(sprite.value)
				console.log('PICK UP COIN!!!' + bringPlayer.score)
				// COLORIZE SCREEN
				let colorizeOption = {}
				if (sprite.mode=='coin1') colorizeOption = { color: "255, 180, 50", alpha: 0.5, time: 200 }
				if (sprite.mode=='coin2') colorizeOption = { color: "255, 255, 255", alpha: 0.5, time: 200 }
				if (sprite.mode=='coin3') colorizeOption = { color: "200, 100, 0", alpha: 0.5, time: 200 }
				graphicsClass.screenColorizeOptions(colorizeOption);
				return;
			}
			
			// PICKUP KEYS
			if (sprite.active == true && sprite.mode.includes("key")) {
				sprite.active = false
				let colorizeOption = {}
				if (sprite.mode=='key1') {
					bringPlayer.key1 = true
					console.log('PICK UP cellar KEY1')
					colorizeOption = { color: "255, 255, 255", alpha: 0.5, time: 200 }
				}
				if (sprite.mode=='key2') {
					bringPlayer.key2 = true
					console.log('PICK UP cellar KEY2')
					colorizeOption = { color: "255, 180, 50", alpha: 0.5, time: 200 }
				}
				graphicsClass.screenColorizeOptions(colorizeOption);
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
		let checkExit = checkSpriteData(player.y, player.x, 'mode', 'exit')
		if (checkExit) {
			console.log('EXITEN ÁLLSZ ! JEE ! : )')
		}
	})

	if (false) {
		// 45° CHECK
		let psPlayerX = Math.floor((bringPlayer.x + Math.cos(bringPlayer.angle) * bringPlayer.speed) / CELL_SIZE)
		let psPlayerY = Math.floor((bringPlayer.y + Math.sin(bringPlayer.angle) * bringPlayer.speed) / CELL_SIZE)
		if (mapDataClass.map[psPlayerY][psPlayerX]) { pCheck.moveX = false; pCheck.moveY = false; }

		check.playerCheckY2 = psPlayerY
		check.playerCheckX2 = psPlayerX
	}


	if (bringPlayer.speed != 0 || inputStrafeCheck) {

		moveAction(bringPlayer, pCheck)
		bringPlayer.z = playerWalk()
	}


	return pCheck;
}

function checkSpriteData(y, x, attr, name) {
	y = Math.floor(y / CELL_SIZE)
	x = Math.floor(x / CELL_SIZE)

	let check = spritesClass.sprites.find(sprite => (sprite[attr] == name && y == Math.floor(sprite.y / CELL_SIZE) && x == Math.floor(sprite.x / CELL_SIZE)))

	let returnValue = (check) ? check : false;
	return returnValue;
}

function moveCreature(creature) {
	if (typeof creature.speed != 'undefined' && creature.speed != 0) {
		
		let cCheck = checkMoveSprite(creature)
						
		if(mapDataClass.map[cCheck.checkY][cCheck.checkX] != 0 && mapDataClass.map[cCheck.checkY][cCheck.checkX].type == 'effect') {
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
			
			if(!creature.anim_attack_function) {
				creature.anim_attack_actFrame = `${creature.dirConstruction[0]}_E1`
				creature.anim_attack_function = setInterval(() => {
					creature.anim_attack_actFrame = (creature.anim_attack_actFrame == `${creature.dirConstruction[0]}_E1`) ? `${creature.dirConstruction[0]}_E2` : `${creature.dirConstruction[0]}_E1`;
				}, creature.anim_speed)
			}

			let colorizeOption = { color: "255, 0, 0", alpha: 0.1, time: 200 }
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

			// IF FIX SPRITE
			let checkMapSprite = checkSpriteData(creature.y, creature.x, 'type', 'object')
			if (checkMapSprite && checkMapSprite.material == 'fix') creature.angle += (Math.PI / 2)

			// IF DOOR
			let checkDoor = checkSpriteData(creature.y, creature.x, 'mode', 'door')
			if (checkDoor && checkDoor.material == 'fix') creature.angle += (Math.PI / 2)
	
			// IF BLOCK
			let checkBlock = checkSpriteData(creature.y, creature.x, 'type', 'block')
			if (checkBlock && checkBlock.mode != 'door') creature.angle += (Math.PI / 2)
	
			// DIE CREATURE
			if (creature.anim_die_function) return;
			
			// MOVE MODES
			if (creature.moveType == 'stay') return;

			if (creature.moveType == 'levitation') {
				creature.z = playerWalk()
				return;
			}			

			// MOVE CREATURE
			if (creature.moveType == 'patrol') {
				if (!cCheck.moveY || !cCheck.moveX) {
					// CENTER CREATURE
					creature.x = Math.floor((creature.x / CELL_SIZE)) * CELL_SIZE + (CELL_SIZE / 2)
					creature.y = Math.floor((creature.y / CELL_SIZE)) * CELL_SIZE + (CELL_SIZE / 2)

					if (!cCheck.moveY) creature.angle = (Math.floor(Math.random() * 2)) ? graphicsClass.toRadians(180) : graphicsClass.toRadians(0);
					if (!cCheck.moveX) creature.angle = (Math.floor(Math.random() * 2)) ? graphicsClass.toRadians(90) : graphicsClass.toRadians(270);		
				}
			}

			// IF EFFECT
			let checkEffect = checkSpriteData(creature.y, creature.x, 'type', 'effect')
			if (checkEffect) if (checkEffect.mode == 'direction') {
				if ((creature.inY >=30 && creature.inY <=34) && (creature.inX >=30 && creature.inX <=34)) creature.angle = checkEffect.angle;
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

			moveAction(creature, cCheck)			
		}
	}
}

function moveAmmo(ammoSprite) {
	if (ammoSprite.speed != 0) {
		let ammoCheck = checkMoveSprite(ammoSprite)
		// CHECK HIT SPRITES
		let checkSprites = spritesClass.sprites.filter(obj => Math.floor(obj.y / CELL_SIZE) == ammoCheck.checkY && Math.floor(obj.x / CELL_SIZE) == ammoCheck.checkX)
		checkSprites.forEach((findSprite) => {
			if (findSprite.type == 'creature' && findSprite.material == 'enemy') {
				findSprite.energy--
				console.log('Energy: ' + findSprite.energy)

				findSprite.moveType = 'attack'
				findSprite.speed += 2

				if(!findSprite.anim_demage_function) {
					findSprite.anim_demage_actFrame = `${findSprite.dirConstruction[0]}_E3`
					
					findSprite.anim_demage_function = setInterval(() => {
						console.log('Lejárt!');
						clearInterval(findSprite.anim_demage_function)
						findSprite.anim_demage_function = null
						findSprite.anim_demage_actFrame = null
					},findSprite.anim_speed)
				}
				
				// DELETE AMMO
				let ammoIndex = spritesClass.sprites.indexOf(ammoSprite);
				if (ammoIndex !== -1) spritesClass.sprites.splice(ammoIndex, 1)
			}
		});
		
		if (ammoCheck.moveX == false || ammoCheck.moveY == false) ammoSprite.active = false

		moveAction(ammoSprite, ammoCheck)
	}
	return true
}

function moveAction(sprite, check) {
	if (sprite.move) {
		(check.moveX) ? sprite.x += Math.cos(sprite.angle) * sprite.speed : false;
		(check.moveY) ? sprite.y += Math.sin(sprite.angle) * sprite.speed : false;
	}
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
			if(!sprite.anim_die_function) {
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
				// CREATURE DEMAGE
				else if (sprite.anim_demage_function) getActualTexture = sprite.anim_demage_actFrame
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

			// IF AMMO
			if (sprite.type == 'ammo') {
				if(sprite.active) {
					moveAmmo(sprite)
					let checkActAnim = mapDataClass.loadAnimationTexture(sprite)
					if (checkActAnim) getActualTexture = checkActAnim[1]
					sprite.z = playerWalk()
				}
			}

			// IF BLOCK
			if (sprite.type == 'block') {
				if(sprite.active) {
					let checkActAnim = mapDataClass.loadAnimationTexture(sprite)
					if (checkActAnim) getActualTexture = checkActAnim[1]
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
		var rot_b = 'a'; var rot_d = 'a';
		var rot_a = 'a'; var rot_c = 'a';
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
	const weaponDataResponse = await fetch('./data/weapons/weapons.JSON')
	const weaponsData = await weaponDataResponse.json()

	// LOAD WEAPON TEXTURES
	for (let n = 0; n < weaponsData.weapons.length; n++) {
		let weapon = weaponsData.weapons[n]
		let dirConstruction = await texturesClass.loadTextureToArray(weapon.textures, 'weapons', texturesClass.weaponsTextures)
		spritesClass.createSprite(weapon, dirConstruction, spritesClass.weponsSprites)
	}
	for (let n = 0; n < weaponsData.ammos.length; n++) {
		let ammo = weaponsData.ammos[n]
		let dirConstruction = await texturesClass.loadTextureToArray(ammo.textures, 'weapons', texturesClass.weaponsTextures)
		spritesClass.createSprite(ammo, dirConstruction, spritesClass.weponsSprites)
	}
	
	const mapDataResponse = await fetch('./data/maps/map.JSON')
    const mapData = await mapDataResponse.json()
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

		if(typeof insertSprite != 'undefined') {
			let data = {}
			data.id = sprite.id
			for (const [key, value] of Object.entries(insertSprite)) data[key] = value;
			sprite = {...data, ...sprite}
			if (sprite.type == 'creature' || sprite.type == 'effect') sprite.angle = graphicsClass.toRadians(sprite.angle)
		}
		
		var dirConstruction
		if(sprite.type !='effect') {
			dirConstruction = await texturesClass.loadTextureToArray(sprite.textures, dirName, texturesClass.spriteTextures)
		}

		spritesClass.createSprite(sprite, dirConstruction, spritesClass.sprites)
    }
}

async function gameMenu() {
	if(menu.menuactive) {
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

function gameLoop() {
	gamePlay.timeStart = Date.now()

	movePlayer(player)
	graphicsClass.rays = graphicsClass.getRays()
	spritesClass.sprites = spritesClass.sprites.sort((a, b) => b.distance - a.distance)
	graphicsClass.renderScreen()
	spritesClass.selectNearSprites()
	
	spritesCheck()
	spritesClass.sprites.forEach(sprite => {
		sprite.distance = graphicsClass.spriteDistanceCalc(sprite)
	});
	
	graphicsClass.screenColorizeAction()

	if (menu.mapSwitch) graphicsClass.renderMinimap(graphicsClass.rays)
	if (menu.infoSwitch) graphicsClass.infoPanel()
	if (menu.clearGameSwitch) clearInterval(gamePlay.game)

	szamol++;
	// if (szamol == 3) clearInterval(gamePlay.game)

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
