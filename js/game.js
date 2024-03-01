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
	x: CELL_SIZE * 3.5,
	y: CELL_SIZE * 4.5,
	z: 0,
	inX: null,
	inY: null,
	angle: 0,
	speed: 0,
	score: 0,
}

const menu = {
	actualMenuRow: 0,
	menuactive: true,
	optionsActive: false,
	clearGameSwitch: false,
	infoSwitch: true,
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

function movePlayer() {
	if (player.speed != 0) {
		let actX = Math.floor(player.x / CELL_SIZE)
		let actY = Math.floor(player.y / CELL_SIZE)
		player.inX =  Math.floor(player.x - (actX * CELL_SIZE))
		player.inY =  Math.floor(player.y - (actY * CELL_SIZE))
		
		let moveX = true
		let moveY = true

		if (player.x < player.x + (Math.cos(player.angle) * player.speed)) {
			// RIGHT
			if (mapDataClass.map[actY][actX+1] && player.inX >= CELL_SIZE - inputClass.WALL_DISTANCE) moveX = false;
		} else {
			// LEFT
			if (mapDataClass.map[actY][actX-1] && player.inX <= inputClass.WALL_DISTANCE) moveX = false;
		}
		
		if (player.y < player.y + (Math.sin(player.angle) * player.speed)) {
			// DOWN
			if (mapDataClass.map[actY+1][actX] && player.inY >= CELL_SIZE - inputClass.WALL_DISTANCE) moveY = false;
		} else {
			// UP
			if (mapDataClass.map[actY-1][actX] && player.inY <= inputClass.WALL_DISTANCE) moveY = false;
		}
		let playerAngleDirection = checkDirection(graphicsClass.toAngle(player.angle), player.speed)

		let checkX = check.playerCheckX = actX + playerAngleDirection.x	 //ideiglenes check-hez
		let checkY = check.playerCheckY = actY + playerAngleDirection.y  //ideiglenes check-hez

		spritesClass.sprites.forEach((sprite,i) => {
			let playerActX = Math.floor(player.x / CELL_SIZE)
			let playerActY = Math.floor(player.y / CELL_SIZE)

			let spriteActX = Math.floor(sprite.x / CELL_SIZE)
			let spriteActY = Math.floor(sprite.y / CELL_SIZE)

			if ((spriteActX == playerActX) && (spriteActY == playerActY)
			&& sprite.active == true && sprite.type == 'pickup' && sprite.mode == "coin") {
				sprite.active = false
				console.log(sprite.value)
				player.score = parseInt(player.score) + parseInt(sprite.value)
				console.log('PICK UP COIN!!!' + player.score)
				// Színezés teszt
				graphicsClass.screenColorizeOptions('255, 180, 50', 0.5, 200);
			}
			
			// if ((spriteActX == checkX) && (spriteActY == checkY)) {
			// 	console.log('SPRITE A KÖVETKEZŐ!!!')
			// 	moveX = false
			// 	moveY = false
			// }
		})

		// 45° CHECK
		let psPlayerX = Math.floor((player.x + Math.cos(player.angle) * player.speed) / CELL_SIZE)
		let psPlayerY = Math.floor((player.y + Math.sin(player.angle) * player.speed) / CELL_SIZE)
		if (mapDataClass.map[psPlayerY][psPlayerX]) { moveX = false; moveY = false; }

		(moveX) ? player.x += Math.cos(player.angle) * player.speed : false;
		(moveY) ? player.y += Math.sin(player.angle) * player.speed : false;

		player.z = playerWalk()
	}
}

function moveCteature(creature) {
	if (creature.speed != 0) {
		let actX = Math.floor(creature.x / CELL_SIZE)
		let actY = Math.floor(creature.y / CELL_SIZE)
		creature.inX =  Math.floor(creature.x - (actX * CELL_SIZE))
		creature.inY =  Math.floor(creature.y - (actY * CELL_SIZE))
		
		let moveX = true
		let moveY = true

		if (creature.x < creature.x + (Math.cos(creature.angle) * creature.speed)) {
			// RIGHT
			if (graphicsClass.map[actY][actX+1] && creature.inX >= CELL_SIZE - inputClass.WALL_DISTANCE) moveX = false;
		} else {
			// LEFT
			if (graphicsClass.map[actY][actX-1] && creature.inX <= inputClass.WALL_DISTANCE) moveX = false;
		}
		
		if (creature.y < creature.y + (Math.sin(creature.angle) * creature.speed)) {
			// DOWN
			if (graphicsClass.map[actY+1][actX] && creature.inY >= CELL_SIZE - inputClass.WALL_DISTANCE) moveY = false;
		} else {
			// UP
			if (graphicsClass.map[actY-1][actX] && creature.inY <= inputClass.WALL_DISTANCE) moveY = false;
		}

		(moveX) ? creature.x += Math.cos(creature.angle) * creature.speed : false;
		(moveY) ? creature.y += Math.sin(creature.angle) * creature.speed : false;

		creature.angle += 0.03

		let creatureAngleDirection = checkDirection(graphicsClass.toAngle(creature.angle), creature.speed)

		let checkX = check.creatureCheckX = actX + creatureAngleDirection.x
		let checkY = check.creatureCheckY = actY + creatureAngleDirection.y

		let playerActX = Math.floor(player.x / CELL_SIZE)
		let playerActY = Math.floor(player.y / CELL_SIZE)
		if ((playerActX == checkX) && (playerActY == checkY)) {
			console.log('PLAYER TALÁLAT!!!')
			creature.speed = 0
			clearInterval(creature.animationFunction)
		}
	}
}

function playerWalk() {
	const amplitude = (Math.abs(graphicsClass.WALKINTERVAL) - graphicsClass.WALKINTERVAL) / 2;
	const offset = (Math.abs(graphicsClass.WALKINTERVAL) + graphicsClass.WALKINTERVAL) / 2;
	const frequency = 10;

	const value = Math.sin(frequency * Date.now() * 0.001) * amplitude + offset;
	return Math.floor(value);
}

function creatureSpriteSelect(creature) {
	creature.actAnimationFrame = (creature.actAnimationFrame) ? creature.actAnimationFrame : 1;

	let angDif = graphicsClass.toAngle(creature.angle - player.angle);

	if (creature.rotation) {
		var rot_b = creature.rotationFrames[0]; var rot_d = creature.rotationFrames[1];
		var rot_a = creature.rotationFrames[2]; var rot_c = creature.rotationFrames[3];
	} else {
		var rot_b = 'a'; var rot_d = 'a';
		var rot_a = 'a'; var rot_c = 'a';
	}

	if (angDif >= 315 && angDif <= 360 || angDif >= 0 && angDif < 45) {
		creature.texturePlace[1] = creature.texturePlace[0]+'_'+rot_b+creature.actAnimationFrame
	} else if (angDif >= 45 && angDif < 135) {
		creature.texturePlace[1] = creature.texturePlace[0]+'_'+rot_d+creature.actAnimationFrame
	} else if (angDif >= 135 && angDif < 225) {
		creature.texturePlace[1] = creature.texturePlace[0]+'_'+rot_a+creature.actAnimationFrame
	} else if (angDif >= 225 && angDif < 315) {
		creature.texturePlace[1] = creature.texturePlace[0]+'_'+rot_c+creature.actAnimationFrame
	}	
}

async function loadindDatas() {
	const response = await fetch('./js/maps/e1m1.JSON');
    const mapData = await response.json();
	
	player.x = mapData.player.x * CELL_SIZE
	player.y = mapData.player.y * CELL_SIZE
	player.angle = graphicsClass.toRadians(mapData.player.angle)

	texturesClass.errorTextures = await texturesClass.loadTexturesToArray(texturesClass.errorTextures, texturesClass.errorFileNames, 'errors')
	texturesClass.skyTextures = await texturesClass.loadTexturesToArray(texturesClass.skyTextures, texturesClass.skyFileNames, 'skys')
	texturesClass.floorTextures = await texturesClass.loadTexturesToArray(texturesClass.floorTextures, texturesClass.floorFileNames, 'floors')

	// Load Wall Textures
	for (let i = 0; i < mapData.walls.length; i++) {
        let wall = mapData.walls[i]
		let dirConstruction = await texturesClass.loadTexturesToThis(wall.textures, 'walls', texturesClass.wallTextures)
		mapDataClass.createWall(wall, dirConstruction)
    }
	// Map Array upload Wall textures
	await mapDataClass.defineTextures(mapData.map)

	// Load Sprites
	for (let i = 0; i < mapData.sprites.length; i++) {
        let sprite = mapData.sprites[i]
		let dirConstruction = await texturesClass.loadTexturesToThis(sprite.textures, 'sprites', texturesClass.spriteTextures)		
		spritesClass.createSprite(sprite, dirConstruction)
    }

	console.log(spritesClass.sprites)
	
    // texturesClass.creaturesTextures = await texturesClass.loadTexturesToArray(texturesClass.creaturesTextures, texturesClass.creaturesFileNames, 'creatures')
}

function gameLoop() {
	gamePlay.timeStart = Date.now()
	movePlayer()
	graphicsClass.rays = graphicsClass.getRays()
	graphicsClass.renderScreen()

	spritesClass.sprites = spritesClass.sprites.sort((a, b) => b.distance - a.distance)
	
	spritesClass.sprites.forEach((sprite, index) => {
		if (sprite.active) {
			// ÉLŐLÉNYEK
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

				if(sprite.move == 'stay') {
					creatureSpriteSelect(sprite)
				}

				if(sprite.move == 'mode1') {
					creatureSpriteSelect(sprite)
					moveCteature(sprite)
				}

				if(sprite.move == 'levitation') {
					sprite.z = playerWalk()
				}
			}
			
			let actualTexture = texturesClass.spriteTextures[sprite.dirConstruction[0]][sprite.dirConstruction[1]];

			graphicsClass.renderScreenSprites(sprite, index, actualTexture)
		}
	});

	// villogó képernyő
	graphicsClass.screenColorizeAction()

	if (menu.mapSwitch) graphicsClass.renderMinimap(graphicsClass.rays)
	if (menu.infoSwitch) graphicsClass.infoPanel()
	if (menu.clearGameSwitch) clearInterval(gamePlay.game)

	//clearInterval(gamePlay.game)
}

async function gameMenu() {
	if(menu.menuactive) {
		// MENU
		clearInterval(gamePlay.game)
		gamePlay.game = null		
		inputClass.moveMenuStar()
		document.getElementById('canvas').style.display='none'
		document.getElementById('loading').style.display='none'
		document.getElementById('menu-bg').style.display='block'
		graphicsClass.clrScr()
		return;
	} else {
		// GAME
		
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

//-------------------
//	  GAME START	|
//-------------------
const texturesClass = new TexturesClass ()
const spritesClass 	= new SpritesClass  ({CELL_SIZE: CELL_SIZE, texturesClass: texturesClass})
const mapDataClass 	= new MapDataClass  ({texturesClass: texturesClass})
const graphicsClass = new GaphicsClass  ({mapDataClass: mapDataClass, spritesClass: spritesClass, texturesClass: texturesClass, CELL_SIZE: CELL_SIZE, player: player, menu: menu, gamePlay: gamePlay, check: check})
const inputClass 	= new InputsClass   ({mapDataClass: mapDataClass, graphicsClass: graphicsClass, menu: menu, gameMenu: gameMenu, player: player, keyPressed: keyPressed, gamePlay: gamePlay, check: check})

window.onload = async () => {
	gameMenu()
};
