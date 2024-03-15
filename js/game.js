// -------------------------------------------------------
// 						DANI RAYENGINE
// -------------------------------------------------------

import GaphicsClass from './graphics-class.js'
import InputsClass from './input-class.js'
import TexturesClass from './textures-class.js'
import MapDataClass from './mapdata-class.js'
import SpritesClass from './sprites-class.js'

const CLOCKSIGNAL = 30
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
	creatureCheckX: null,
	creatureCheckY: null,
}

var keyPressed = {};

// -------------------------------------------------------

function checkDirection(angle, speed) {
    angle = graphicsClass.toRadians(angle);
    let sign = (speed > 0) ? 1 : -1;
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

function spriteDistanceCalc(sprite) {
	return Math.sqrt(Math.pow(player.y - sprite.y, 2) + Math.pow(player.x - sprite.x, 2));
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

	let checkX = check.spriteObjCheckX = actX + spriteObjAngleDirection.x
	let checkY = check.spriteObjCheckY = actY + spriteObjAngleDirection.y

	if (spriteObj.move) {
		(moveX) ? spriteObj.x += Math.cos(spriteObj.angle) * spriteObj.speed : false;
		(moveY) ? spriteObj.y += Math.sin(spriteObj.angle) * spriteObj.speed : false;
	}

	return {
		moveX: moveX,
		moveY: moveY,
		checkX: checkX,
		checkY: checkY,
	}
}

function movePlayer() {
	if (player.speed != 0) {

		let pCheck = checkMoveSprite(player)

		// DOOR check
		check.playerCheckX = pCheck.checkX
		check.playerCheckY = pCheck.checkY

		// Controlling the sprite relative to the player's movement.
		spritesClass.sprites.forEach((sprite,i) => {
			let playerActX = Math.floor(player.x / CELL_SIZE)
			let playerActY = Math.floor(player.y / CELL_SIZE)

			let spriteActX = Math.floor(sprite.x / CELL_SIZE)
			let spriteActY = Math.floor(sprite.y / CELL_SIZE)

			// ACTUAL PLAYER BRICK
			if ((spriteActX == playerActX) && (spriteActY == playerActY)) {

				// PICKUP COINS
				if (sprite.active == true && sprite.type == 'pickup' && sprite.mode.includes("coin")) {
					sprite.active = false
					player.score = parseInt(player.score) + parseInt(sprite.value)
					console.log('PICK UP COIN!!!' + player.score)
					// COLORIZE SCREEN
					let colorizeOption = {}
					if (sprite.mode=='coin1') colorizeOption = { color: "255, 180, 50", alpha: 0.5, time: 200 }
					if (sprite.mode=='coin2') colorizeOption = { color: "255, 255, 255", alpha: 0.5, time: 200 }
					if (sprite.mode=='coin3') colorizeOption = { color: "200, 100, 0", alpha: 0.5, time: 200 }
					graphicsClass.screenColorizeOptions(colorizeOption);
				}
			}
			
			if ((spriteActX == pCheck.checkX) && (spriteActY == pCheck.checkY)) {
				console.log('SPRITE A KÖVETKEZŐ!!!')
				if (sprite.type == 'pickup') return;
				pCheck.moveX = false
				pCheck.moveY = false
			}
		})

		// 45° CHECK
		let psPlayerX = Math.floor((player.x + Math.cos(player.angle) * player.speed) / CELL_SIZE)
		let psPlayerY = Math.floor((player.y + Math.sin(player.angle) * player.speed) / CELL_SIZE)
		if (mapDataClass.map[psPlayerY][psPlayerX]) { pCheck.moveX = false; pCheck.moveY = false; }

		player.z = playerWalk()
	}
}

function moveCreature(creature) {
	if (typeof creature.speed != 'undefined' && creature.speed != 0) {

		let cCheck = checkMoveSprite(creature)

		check.creatureCheckX = cCheck.checkX
		check.creatureCheckY = cCheck.checkY

		let playerActX = Math.floor(player.x / CELL_SIZE)
		let playerActY = Math.floor(player.y / CELL_SIZE)

		if ((playerActX == cCheck.checkX) && (playerActY == cCheck.checkY)) {

			console.log('PLAYER TALÁLAT!!!')
			creature.move = false
			creature.animation = false

			let colorizeOption = { color: "255, 0, 0", alpha: 0.5, time: 200 }
			graphicsClass.screenColorizeOptions(colorizeOption);

			// clearInterval(creature.animationFunction)
		} else {
			creature.move = true
			creature.animation = true
			creature.angle += 0.03
		}
	}
}

function moveAmmo(ammoSprite, nearData) {
	if (ammoSprite.speed != 0) {
		let ammoCheck = checkMoveSprite(ammoSprite)

		if (ammoCheck.moveX == false || ammoCheck.moveY == false) {
			
			// 1. csak megáll
			if (true) ammoSprite.move = false

			// 2. hide
			if (true) ammoSprite.active = false
			
			// 2. töröl
			if (false) {
				console.log('lehet törölni!!!')
				// console.log(nearData)
				// let nearIndex = spritesClass.nearSprites.indexOf(nearData)
				// console.log(nearIndex)
				// if (nearIndex !== -1) spritesClass.nearSprites.splice(nearIndex, 1);
	
				let spriteIndex = spritesClass.sprites.indexOf(ammoSprite);
				if (spriteIndex !== -1) spritesClass.sprites.splice(spriteIndex, 1);
				
				console.log(spritesClass.nearSprites)
				console.log(spritesClass.sprites)
			}
		}
	}
	return true
}

function spritesCheck() {
	// ARRANGE SPRITES
	spritesClass.nearSprites.forEach((nearData) => {
				
		let sprite = spritesClass.sprites[nearData]
		sprite.distance = spriteDistanceCalc(sprite)

		if (sprite.active) {
			let getActualTexture = sprite.dirConstruction[1]	// Standard texture
			// IF CREATURES
			if (sprite.type == 'creature') {
				
				if(sprite.animation != false) {
					if(!sprite.animationFunction) {
						sprite.actAnimationFrame = sprite.animationFrames[0]
						sprite.animationFunction = setInterval(() => {
							sprite.actAnimationFrame++
							if (sprite.actAnimationFrame>sprite.animationFrames.length)
								sprite.actAnimationFrame = sprite.animationFrames[0]
						}, sprite.animationSpeed)
					}
				}

				if(sprite.moveType == 'mode1') {
					getActualTexture = creatureSpriteSelect(sprite)
					moveCreature(sprite)
				}

				if(sprite.moveType == 'levitation') {
					sprite.z = playerWalk()
				}
			}

			// IF AMMO
			if (sprite.type == 'ammo') {
				if(sprite.active) {
					//console.log('ACTIVE AMMO !!!');
					moveAmmo(sprite, nearData)
					sprite.z = playerWalk()
				}
			}
			
			let actualTexture = (sprite.type == 'ammo') 
			? texturesClass.weaponsTextures[sprite.dirConstruction[0]][getActualTexture]
			: texturesClass.spriteTextures[sprite.dirConstruction[0]][getActualTexture];
			
			graphicsClass.renderScreenSprites(sprite, actualTexture)
		}
	});
}

function creatureSpriteSelect(creature) {
	creature.actAnimationFrame = (creature.actAnimationFrame) ? creature.actAnimationFrame : 2;

	let angDif = graphicsClass.toAngle(creature.angle - player.angle);

	// ROTATION
	if (creature.rotation) {
		var rot_b = creature.rotationFrames[0]; var rot_d = creature.rotationFrames[1]; var rot_a = creature.rotationFrames[2]; var rot_c = creature.rotationFrames[3];
	} else {
		var rot_b = 'a'; var rot_d = 'a';
		var rot_a = 'a'; var rot_c = 'a';
	}

	let texturename;

	// ANIMATIONFRAME
	if (angDif >= 135 && angDif < 225) {
		texturename = `${creature.dirConstruction[0]}_${rot_a}${creature.actAnimationFrame}`
	} else if (angDif >= 315 && angDif <= 360 || angDif >= 0 && angDif < 45) {
		texturename = `${creature.dirConstruction[0]}_${rot_b}${creature.actAnimationFrame}`
	} else if (angDif >= 225 && angDif < 315) {
		texturename = `${creature.dirConstruction[0]}_${rot_c}${creature.actAnimationFrame}`
	} else if (angDif >= 45 && angDif < 135) {
		texturename = `${creature.dirConstruction[0]}_${rot_d}${creature.actAnimationFrame}`
	}
	
	return texturename;
}

async function loadindDatas() {
	const weaponDataResponse = await fetch('./js/weapons/weapons.JSON')
	const weaponsData = await weaponDataResponse.json()

	// Load Wepon Textures
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
	
	const mapDataResponse = await fetch('./js/maps/e1m1.JSON');
    const mapData = await mapDataResponse.json();
	
	player.x = mapData.player.x * CELL_SIZE
	player.y = mapData.player.y * CELL_SIZE
	player.angle = graphicsClass.toRadians(mapData.player.angle)

	// Load Error Texture
	let error = mapData.error[0]
	await texturesClass.loadTexturesPicture(error, 'error', texturesClass.errorTexture)

	// Load SKY Texture
	let sky = mapData.sky[0]
	await texturesClass.loadTexturesPicture(sky, 'skys', texturesClass.skyTexture)

	// Load Floor Texture
	let floor = mapData.floor[0]
	await texturesClass.loadTexturesPicture(floor, 'floors', texturesClass.floorTexture)

	// Load Wall Textures
	for (let i = 0; i < mapData.walls.length; i++) {
        let wall = mapData.walls[i]
		let dirConstruction = await texturesClass.loadTextureToArray(wall.textures, 'walls', texturesClass.wallTextures)
		mapDataClass.createWall(wall, dirConstruction)
    }
	// Map Array upload Wall textures
	await mapDataClass.defineTextures(mapData.map)

	// Load Sprites
	for (let i = 0; i < mapData.sprites.length; i++) {
        let sprite = mapData.sprites[i]
		let dirConstruction = await texturesClass.loadTextureToArray(sprite.textures, 'sprites', texturesClass.spriteTextures)		
		spritesClass.createSprite(sprite, dirConstruction, spritesClass.sprites)
    }
}

async function gameMenu() {
	if(menu.menuactive) {
		//// MENU
		clearInterval(gamePlay.game)
		gamePlay.game = null		
		inputClass.moveMenuStar()
		document.getElementById('canvas').style.display='none'
		document.getElementById('loading').style.display='none'
		document.getElementById('menu-bg').style.display='block'
		graphicsClass.clrScr()
		return;
	} else {
		//// GAME
		
		// LOADING
		if (!gamePlay.gameLoaded) {
			document.getElementById('menu-bg').style.display='none'
			document.getElementById('canvas').style.display='none'
			document.getElementById('loading').style.display='block'
			await loadindDatas()
			gamePlay.gameLoaded = true
			document.getElementById('loading').style.display='none'
		}

		// BACK TO GAME
		document.getElementById('menu-bg').style.display='none'
		document.getElementById('loading').style.display='none'
		document.getElementById('canvas').style.display='block'
		
		if (!gamePlay.game) {
			gamePlay.game = setInterval(gameLoop, CLOCKSIGNAL);
		}
	}
	return;
}

var szamol = 0;

function gameLoop() {
	gamePlay.timeStart = Date.now()

	movePlayer()
	graphicsClass.rays = graphicsClass.getRays()
	graphicsClass.renderScreen()
	spritesClass.sprites = spritesClass.sprites.sort((a, b) => b.distance - a.distance)
	spritesClass.selectNearSprites()
	spritesCheck()
	graphicsClass.screenColorizeAction()

	if (menu.mapSwitch) graphicsClass.renderMinimap(graphicsClass.rays)
	if (menu.infoSwitch) graphicsClass.infoPanel()
	if (menu.clearGameSwitch) clearInterval(gamePlay.game)

	szamol++;
	//if (szamol == 3) clearInterval(gamePlay.game)
}

//-------------------
//	  GAME START	|
//-------------------
const texturesClass = new TexturesClass ()
const mapDataClass 	= new MapDataClass  ({texturesClass: texturesClass})
const spritesClass 	= new SpritesClass  ({CELL_SIZE: CELL_SIZE, player: player, texturesClass: texturesClass, mapDataClass: mapDataClass})
const graphicsClass = new GaphicsClass  ({mapDataClass: mapDataClass, spritesClass: spritesClass, texturesClass: texturesClass, CELL_SIZE: CELL_SIZE, player: player, menu: menu, gamePlay: gamePlay, check: check})
const inputClass 	= new InputsClass   ({mapDataClass: mapDataClass, spritesClass: spritesClass, graphicsClass: graphicsClass, menu: menu, gameMenu: gameMenu, player: player, keyPressed: keyPressed, gamePlay: gamePlay, check: check})

window.onload = async () => {
	gameMenu()
};
