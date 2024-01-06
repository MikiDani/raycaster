// -------------------------------------------------------
// 						DANI RAYENGINE
// -------------------------------------------------------

import TexturesClass from './textures-class.js';
const texturesClass = new TexturesClass();

const walkInterval = -7;

const SCREEN_WIDTH = window.innerWidth;
const SCREEN_HEIGHT = window.innerHeight + Math.abs(walkInterval);

//const NUMBER_OF_RAYS = 1
const NUMBER_OF_RAYS = Math.floor(SCREEN_WIDTH / 4)
const SKY_GRID_SIZE = 4

const GRID_SIZE = Math.floor(SCREEN_WIDTH / NUMBER_OF_RAYS)

const CLOCKSIGNAL = 60
const FOV = toRadians(60)
const CELL_SIZE = 64
const MOVE_SPEED = 20
const MOVE_ANGLE = 5
const WALL_DISTANCE = (CELL_SIZE / 100) * 40

const MINIMAP_SCALE = 0.5
const MINIMAP_X = 5
const MINIMAP_Y = 4
const PLAYER_SIZE = 6

const player = {
	x: CELL_SIZE * 6.5,
	y: CELL_SIZE * 4.5,
	z: 0,
	angle: 44.5,
	dirX: null,
	dirY: null,
	speed: 0,
}

player.dirX = calcDirX(player.angle)
player.dirY = calcDirY(player.angle)

var inX; var inY;

const menu = {
	clearGameSwitch: false,
	infoSwitch: false,
	mapSwitch: true,
	shadowsSwitch: true,
	mouseSwitch: true,
	floorSwitch: true,
	skySwitch: true,
}

var game
var playerRay
var shadowDistance
var floorTextureId = 2
var skyTextureId = 1
var timeStart

var rayDirX0, rayDirY0, rayDirX1, rayDirY1;

const canvas = document.createElement("canvas")
canvas.setAttribute('width', SCREEN_WIDTH)
canvas.setAttribute('HEIGHT', SCREEN_HEIGHT)
document.body.appendChild(canvas)
const context = canvas.getContext('2d')
context.imageSmoothingEnabled = false	// teszt üzem

// -------------------------------------------------------

const map = [
	[2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 4],
	[5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4],
	[5, 0, 1, 1, 0, 8, 8, 2, 3, 7, 3, 2, 0, 3, 3, 6, 7, 8, 4],
	[5, 0, 0, 0, 0, 0, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4],
	[5, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4],
	[5, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4],
	[5, 0, 1, 0, 9, 8, 8, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 4],
	[5, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4],
	[5, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4],
	[5, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4],
	[5, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4],
	[5, 6, 6, 6, 6, 6, 6, 7, 8, 9, 9, 9, 9, 7, 7, 7, 7, 7, 4],
];

function calcDirX(angle) {
	let returnValue = Math.abs(Math.floor((angle - Math.PI/2) / Math.PI) % 2);
	returnValue = (returnValue == 0) ? -1 : returnValue;
	return returnValue;
}

function calcDirY(angle) {
	let returnValue = Math.abs(Math.floor(angle / Math.PI) % 2);
	returnValue = (returnValue == 0) ? -1 : returnValue;
	return returnValue;
}

function toRadians(deg) {
	return ((deg * Math.PI) / 180);
}

function toAngle(rad) {
	let degrees = (rad * 180) / Math.PI;
	degrees %= 360;
	if (degrees < 0) {
		degrees += 360;
	}
	return degrees;
}

function movePlayer() {
	if (player.speed != 0) {
		let actX = Math.floor(player.x / CELL_SIZE)
		let actY = Math.floor(player.y / CELL_SIZE)
		inX =  Math.floor(player.x - (actX * CELL_SIZE))
		inY =  Math.floor(player.y - (actY * CELL_SIZE))
		
		let moveX = true
		let moveY = true

		if (player.x < player.x + (Math.cos(player.angle) * player.speed)) {
			// RIGHT
			if (map[actY][actX+1] && inX >= CELL_SIZE - WALL_DISTANCE) moveX = false;
		} else {
			// LEFT
			if (map[actY][actX-1] && inX <= WALL_DISTANCE) moveX = false;
		}

		if (player.y < player.y + (Math.sin(player.angle) * player.speed)) {
			// DOWN
			if (map[actY+1][actX] && inY >= CELL_SIZE - WALL_DISTANCE) moveY = false;
		} else {
			// UP
			if (map[actY-1][actX] && inY <= WALL_DISTANCE) moveY = false;
		}

		// 45° CHECK
		let psPlayerX = Math.floor((player.x + Math.cos(player.angle) * player.speed) / CELL_SIZE)
		let psPlayerY = Math.floor((player.y + Math.sin(player.angle) * player.speed) / CELL_SIZE)
		if (map[psPlayerY][psPlayerX]) { moveX = false;	moveY = false; }

		(moveX) ? player.x += Math.cos(player.angle) * player.speed : false;
		(moveY) ? player.y += Math.sin(player.angle) * player.speed : false;

		player.z = playerWalk()
	}
}

function playerWalk() {
	const amplitude = (Math.abs(walkInterval) - walkInterval) / 2;
	const offset = (Math.abs(walkInterval) + walkInterval) / 2;
	const frequency = 10;

	const value = Math.sin(frequency * Date.now() * 0.001) * amplitude + offset;
	return Math.floor(value);
}

function outOfMapBounds(x, y) {
	return x < 0 || x >= map[0].length || y < 0 || y >= map.length;
}

function distance(x1, y1, x2, y2) {
	return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

// VERTICAL CHECK
function getVCrash(angle) {
	const right = Math.abs(Math.floor((angle-Math.PI/2) / Math.PI) % 2)
	const up = Math.abs(Math.floor(angle / Math.PI) % 2)

	const firstX = (right)
	? Math.floor(player.x / CELL_SIZE) * CELL_SIZE + CELL_SIZE
	: Math.floor(player.x / CELL_SIZE) * CELL_SIZE;
	
	const firstY = player.y + (firstX - player.x) * Math.tan(angle)
	
	const xA = right ? CELL_SIZE : -CELL_SIZE;
	const yA = xA * Math.tan(angle)

	let wall;
	let nextX = firstX;
	let nextY = firstY;
	let actCellY;
	let lastCellX;
	let lastCellY;

	while(!wall) {
		const cellX = (right) ? Math.floor(nextX / CELL_SIZE) : Math.floor(nextX / CELL_SIZE) - 1;
		const cellY = Math.floor(nextY / CELL_SIZE)

		if(outOfMapBounds(cellX, cellY)) break;

		wall = map[cellY][cellX]
		actCellY = cellY

		if(!wall) { nextX += xA; nextY += yA; lastCellX = cellX; lastCellY = cellY; }
	}

	let start = (!right)
		? (CELL_SIZE - (Math.floor(((nextY / CELL_SIZE) - actCellY) * CELL_SIZE)) - 1)
		: Math.floor(((nextY / CELL_SIZE) - actCellY) * CELL_SIZE);

	return {
		wall : wall,
		wallX: lastCellX,
		wallY: lastCellY,
		angle,
		distance: distance(player.x, player.y, nextX, nextY),
		vertical: true,
		start: start,
		dirX: right,
		dirY: up,
		rayDirX: nextX,
		rayDirY: nextY,
	}
}

// HORIZONTAL CHECK
function getHCrash(angle) {
	const up = Math.abs(Math.floor(angle / Math.PI) % 2)
	const right = Math.abs(Math.floor((angle-Math.PI/2) / Math.PI) % 2)
	
	const firstY = (up)
	? Math.floor(player.y / CELL_SIZE) * CELL_SIZE
	: Math.floor(player.y / CELL_SIZE) * CELL_SIZE + CELL_SIZE;

	const firstX = player.x + (firstY - player.y) / Math.tan(angle)
	const yA = up ? -CELL_SIZE : CELL_SIZE;
	const xA = yA / Math.tan(angle)

	let wall;
	let nextX = firstX;
	let nextY = firstY;
	let actCellX;
	let lastCellX;
	let lastCellY;

	while(!wall) {
		const cellX = Math.floor(nextX / CELL_SIZE)
		const cellY = (up) ? Math.floor(nextY / CELL_SIZE) - 1 : Math.floor(nextY / CELL_SIZE);

		if(outOfMapBounds(cellX, cellY)) break;

		wall = map[cellY][cellX]
		actCellX = cellX

		if(!wall) { nextX += xA; nextY += yA; lastCellX = cellX; lastCellY = cellY; }
	}

	let start = (!up) 
		? (CELL_SIZE - (Math.floor(((nextX / CELL_SIZE) - actCellX) * CELL_SIZE)) - 1)
		: Math.floor(((nextX / CELL_SIZE) - actCellX) * CELL_SIZE);

	return { 
		wall: wall,
		wallX: lastCellX,
		wallY: lastCellY,
		angle,
		distance: distance(player.x, player.y, nextX, nextY),
		vertical: false,
		start: start,
		dirY: up,
		dirX: right,
		rayDirX: nextX,
		rayDirY: nextY,
	}
}

function castRay(angle) {
	const vCrash = getVCrash(angle)
	const hCrash = getHCrash(angle)
	return (hCrash.distance >= vCrash.distance) ? vCrash : hCrash;
}

function getRays() {
	// const initialAngle = player.angle		// 1 RAY TEST MODE
	// const angleStep = FOV / NUMBER_OF_RAYS		// 1 RAY TEST MODE
	const initialAngle = player.angle - (FOV/2)
	const angleStep = FOV / NUMBER_OF_RAYS

	return Array.from({length: NUMBER_OF_RAYS}, (_, i) => {
		const angle = initialAngle + i * angleStep;
		const ray = castRay(angle)
		return ray
	})
}

function fixFhishEye(distance, angle, playerAngle) {
	const diff = angle - playerAngle;
	return distance * Math.cos(diff)
}

function cutOutX(x) {
	x = (x > SCREEN_WIDTH) ? SCREEN_WIDTH : x;
	x = (x < 0) ? 0 : x;
	return x;
}

function cutOutY(y) {
	y = (y > SCREEN_HEIGHT) ? SCREEN_HEIGHT : y;
	y = (y < 0) ? 0 : y;
	return y;
}

function colorDarkening(color, size) {
    var rgbaArr = color.match(/\d+(\.\d+)?/g);
    let r = Math.floor(parseInt(rgbaArr[0]) * (1 - size));
    let g = Math.floor(parseInt(rgbaArr[1]) * (1 - size));
    let b = Math.floor(parseInt(rgbaArr[2]) * (1 - size));
    let a = Math.min(parseFloat(rgbaArr[3]));
    return "rgba(" + r + ", " + g + ", " + b + ", " + a + ")";
}

function calcShadowDistance(distance) {
	let shadowDistance = (distance / 160) * 0.1;
	shadowDistance = (shadowDistance > 1) ? 1 : shadowDistance;
	shadowDistance = shadowDistance.toFixed(1);
	return shadowDistance
}

function renderScreen(rays) {

	// OWN FIRST DRAW SKY
	if (true) {
		let textureWidth = texturesClass.skyTextures[skyTextureId].data[0].length
		// let textureHeight = texturesClass.skyTextures[skyTextureId].data.length
		let widthPixel, arundPixel;
		let skyAngle = toAngle(player.angle)
		let plusWidth = (textureWidth / 360)
		let flip = Math.floor(skyAngle * plusWidth)
	
		if(menu.skySwitch) {
			for(let h=0; h<((SCREEN_HEIGHT / SKY_GRID_SIZE) / 2)+5; h++) {
				widthPixel = 0
				for(let w=0; w<(SCREEN_WIDTH / SKY_GRID_SIZE); w++) {
	
					arundPixel = (widthPixel + flip) % textureWidth;
	
					context.fillStyle = texturesClass.skyTextures[skyTextureId].data[h][arundPixel];
					context.fillRect(
						(w * SKY_GRID_SIZE),
						(h * SKY_GRID_SIZE),
						SKY_GRID_SIZE,
						SKY_GRID_SIZE,
					);
	
					widthPixel = (widthPixel>textureWidth) ? 0 : widthPixel=widthPixel+1;
				}
			}
		}
	}

	// DRAW FLOOR
	if(true) {
		let planeX = 1.0
		let planeY = 0.66

		const FLOOR_GRID_SIZE = GRID_SIZE

		let textWidth = texturesClass.floorTextures[floorTextureId].imgWidth
		let textHeight = texturesClass.floorTextures[floorTextureId].imgHeight

		let screenHeightNow = (SCREEN_HEIGHT / FLOOR_GRID_SIZE)
		let screenWidthNow = (SCREEN_WIDTH / FLOOR_GRID_SIZE)

		for(let y=Math.floor(screenHeightNow / 2); y<screenHeightNow; ++y) {
			rayDirX0 = rays[0].rayDirX - planeX
			rayDirY0 = rays[0].rayDirY - planeY
			rayDirX1 = rays[rays.length-1].rayDirX + planeX
			rayDirY1 = rays[rays.length-1].rayDirY + planeY

			let p = y + screenHeightNow / 2;
			
			//let posZ = 0.5 * screenHeightNow // ORIGINAL		
			let posZ = 0.5 * screenHeightNow// OWN

			let rowDistance = posZ / p

			let floorStepX = rowDistance * (rayDirX1 - rayDirX0) / screenWidthNow
			let floorStepY = rowDistance * (rayDirY1 - rayDirY0) / screenWidthNow
			
			let floorX = player.x + rowDistance * rayDirX0
			let floorY = player.y + rowDistance * rayDirY0
	
			for (let x = 0; x < screenWidthNow; ++x) {
				
				let cellX = floorX | 0;
				let cellY = floorY | 0;
				
				floorX += floorStepX
				floorY += floorStepY
								
				let tx = (textWidth * (floorX - cellX)) & (textWidth - 1);
				let ty = (textHeight * (floorY - cellY)) & (textHeight - 1);

				// floor
				//context.fillStyle = texturesClass.wallTextures[floorTextureId].data[ty][tx]
				context.fillStyle = texturesClass.floorTextures[floorTextureId].data[textWidth * ty + tx]
				context.fillRect(
					(x * FLOOR_GRID_SIZE),
					(y * FLOOR_GRID_SIZE) + player.z,
					FLOOR_GRID_SIZE,
					FLOOR_GRID_SIZE,
				);
			}
		}
	}
	// START RAYS
	rays.forEach((ray, i) => {
		//const distance = ray.distance;
		const distance = fixFhishEye(ray.distance, ray.angle, player.angle)
		const wallHeight = ((CELL_SIZE) / distance) * 1450
		const BRICK_SIZE = wallHeight / CELL_SIZE

		// Wall
		if (true) {
			for(let n=0; n<CELL_SIZE; n++) {
				if (typeof ray.vertical !== 'undefined') {
					context.fillStyle = (ray.vertical) ? colorDarkening(texturesClass.wallTextures[ray.wall].data[n][ray.start], 0.4) : texturesClass.wallTextures[ray.wall].data[n][ray.start];
					
					context.fillRect(
						cutOutX(i * GRID_SIZE),
						cutOutY(player.z + Math.floor((((SCREEN_HEIGHT / 2)) - (wallHeight / 2)) + (Math.ceil(n * BRICK_SIZE)))),
						GRID_SIZE,
						cutOutY(Math.ceil(BRICK_SIZE))
					);
		
					//Shadow
					if (menu.shadowsSwitch) {
						let shadowDistance = calcShadowDistance(distance)
						context.fillStyle = `rgba(0, 0, 0, ${shadowDistance})`;
						context.fillRect(
							cutOutX(i * GRID_SIZE),
							cutOutY(player.z + Math.floor(((SCREEN_HEIGHT / 2) - (wallHeight / 2)) + (Math.ceil(n * BRICK_SIZE)))),
							GRID_SIZE,
							cutOutY(Math.ceil(BRICK_SIZE))
						);
					}
				}
			}
		}

		// Simple Floor
		if(!menu.floorSwitch) {
			context.fillStyle = texturesClass.wallTextures[floorTextureId].data[0][0];
			context.fillRect(
				i * GRID_SIZE,
				player.z + (SCREEN_HEIGHT / 2) + (wallHeight / 2),
				GRID_SIZE,
				SCREEN_HEIGHT
			);
		}

		// Simple Sky
		if(!menu.skySwitch) {
			context.fillStyle = texturesClass.skyTextures[skyTextureId].data[0][0];
			context.fillRect(
				i * GRID_SIZE,
				0,
				GRID_SIZE,
				player.z + (SCREEN_HEIGHT / 2) - (wallHeight / 2),
			);
		}
	})
}

function renderMinimap(rays) {
	const cellSize =  MINIMAP_SCALE * CELL_SIZE;

	// WALLS
	map.forEach((row, y) => {
		row.forEach((cell, x) => {
			if(cell) {
				context.fillStyle = 'gray'
				context.fillRect(
					MINIMAP_X + (x * cellSize),
					MINIMAP_Y + (y * cellSize),
					cellSize,
					cellSize,
				);
			}
		});
	});
	
	// FOV RAYS       
	rays.forEach(ray => {
		context.strokeStyle = 'yellow'
		context.lineWidth = 1;
		context.beginPath()
		context.moveTo((player.x * MINIMAP_SCALE) + MINIMAP_X, (player.y * MINIMAP_SCALE) + MINIMAP_Y)
		context.lineTo(
			MINIMAP_X + ((player.x + (Math.cos(ray.angle) * ray.distance)) * MINIMAP_SCALE),
			MINIMAP_Y + ((player.y + (Math.sin(ray.angle) * ray.distance)) * MINIMAP_SCALE),
		)
		context.closePath()
		context.stroke()
	});

	// PLAYER
	context.fillStyle = 'blue';
	context.fillRect(
		MINIMAP_X + (player.x * MINIMAP_SCALE) - (PLAYER_SIZE/2),
		MINIMAP_Y + (player.y * MINIMAP_SCALE) - (PLAYER_SIZE/2),
		PLAYER_SIZE,
		PLAYER_SIZE,
	)

	// PLAYER RAY
	const rayLength = PLAYER_SIZE * 5;

	context.strokeStyle = 'orange'
	context.lineWidth = 1;
	context.beginPath()
	context.moveTo(MINIMAP_X + (player.x * MINIMAP_SCALE), MINIMAP_Y + (player.y * MINIMAP_SCALE))
	context.lineTo(
		MINIMAP_X + ((player.x + (Math.cos(player.angle) * rayLength)) * MINIMAP_SCALE),
		MINIMAP_Y + ((player.y + (Math.sin(player.angle) * rayLength)) * MINIMAP_SCALE),
	)
	context.closePath()
	context.stroke()
}

function infoPanel() {
	context.fillStyle = 'white';
	context.fillRect(SCREEN_WIDTH - 230 - 10, 10, 200, 400)
	const lineheight = 16;

	var timeStop = (Date.now()-timeStart)

	const playerDataText = `
		Player Data:  |
		------------- |
		Frame time: ${timeStop} ms |
		x: ${player.x.toFixed(3)} |
		y: ${player.y.toFixed(3)} |
		z: ${player.z.toFixed(3)} |
		P. ray Distance : ${playerRay.distance.toFixed(3)} |
		Shadow Distance : ${shadowDistance} |
		inX: ${inX} |
		inY: ${inY} |
		angle: ${player.angle.toFixed(3)} Rad |
		angle: ${toAngle(player.angle).toFixed(1)} ° |
		speed: ${player.speed} |
		P. dirX: ${calcDirX(player.angle)} |
		P. dirY: ${calcDirY(player.angle)} |
		----------------------- |
		RAYS: ${NUMBER_OF_RAYS} |
		GRID_SIZE: ${GRID_SIZE} |
		------------------------|
		rayDirX0: ${rayDirX0.toFixed(5)}   |
		rayDirY0: ${rayDirY0.toFixed(5)}   |
		------------------------|
		rayDirX1: ${rayDirX1.toFixed(5)}   |
		rayDirY1: ${rayDirY1.toFixed(5)}   |
		`;

	const lines = playerDataText.split('|');

	context.fillStyle = 'black'
	context.font = '12px serif'
	for (var i = 0; i<lines.length; i++)
		context.fillText(lines[i], SCREEN_WIDTH - 200 - 40, 30 + (i * lineheight));
}

function gameLoop() {

	timeStart = Date.now()

	movePlayer()
	const rays = getRays()
	renderScreen(rays)
	playerRay = castRay(player.angle)
	shadowDistance = calcShadowDistance(playerRay.distance)

	if (menu.mapSwitch) renderMinimap(rays)

	if (menu.infoSwitch) infoPanel()
	
	if (menu.clearGameSwitch) clearInterval(game)
}

if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    // MOBILE
	let actionClickMove = null;

	document.addEventListener("touchstart", function(e) {
		if (e.touches.length === 1) {
			actionClickMove = setInterval(function() {
				const touch = e.touches[0];
				const clientX = touch.clientX;
				const screenWidth = window.innerWidth; // Telefon kijelző szélessége
				if (clientX <= screenWidth / 2) {
					player.angle += -toRadians(MOVE_ANGLE);
				} else {
					player.angle += toRadians(MOVE_ANGLE);
				}
				player.speed = MOVE_SPEED;
			}, 1);
		}
	});
	
	document.addEventListener("touchend", function(e) {
		clearInterval(actionClickMove); // Törlés az időzítőből
		player.speed = 0; // Amikor véget ér az érintés, a player.speed legyen 0
	});

} else {
    // DESKTOP
	document.addEventListener('keydown', (e) => {
		if(e.key == "w" || e.keyCode == 38) player.speed = MOVE_SPEED;
		if(e.key == "s" || e.keyCode == 40) player.speed = -MOVE_SPEED;
		if(e.key == "a" || e.keyCode == 37) player.angle += -toRadians(MOVE_ANGLE)
		if(e.key == "d" || e.keyCode == 39) player.angle += toRadians(MOVE_ANGLE)
	});
	
	document.addEventListener('keyup', (e) => {
		if(e.key == "w" || e.key == "s" || e.keyCode == 38 || e.keyCode == 40)
			player.speed = 0;
	
			if(e.keyCode == 27) { clearInterval(game); console.log('STOP!') }						// ESC
			if(e.keyCode == 77) menu.mapSwitch = (menu.mapSwitch) ? false : true;					// M
			if(e.keyCode == 73) menu.infoSwitch = (menu.infoSwitch) ? false : true;					// I
			if(e.keyCode == 72) menu.shadowsSwitch = (menu.shadowsSwitch) ? false : true;			// H
			if(e.keyCode == 70) menu.floorSwitch = (menu.floorSwitch) ? false : true;				// F
			if(e.keyCode == 75) menu.skySwitch = (menu.skySwitch) ? false : true;					// K
			if(e.keyCode == 49) 
				floorTextureId = ( floorTextureId >= texturesClass.floorTextures.length-1)			// 1
					? 1 
					: floorTextureId + 1;
			if(e.keyCode == 50) 
				skyTextureId = ( skyTextureId >= texturesClass.skyTextures.length-1)				// 2
					? 1 
					: skyTextureId + 1;
	});

	if(menu.mouseSwitch) {
		// document.addEventListener('mousemove', (e) => {
		// 		player.angle += toRadians(e.movementX)
		// });
	
		let actionClickMove = null;
	
		addEventListener("mousedown", (e) => {
			if (e.button === 0) {
				actionClickMove = setInterval(function() {
					(e.clientX <= SCREEN_WIDTH / 2) ? player.angle += -toRadians(MOVE_ANGLE) : player.angle += toRadians(MOVE_ANGLE);
				}, 1);
			}
			if (e.button === 2) player.speed = MOVE_SPEED;
		});
	
		addEventListener("mouseup", () => {
			player.speed = 0;
			clearInterval(actionClickMove)
		});
	
		// Kontextmenu disabled
		document.addEventListener('contextmenu', function(event) {
			event.preventDefault();
		});
	}
}

// ---------- START ----------

window.onload = async () => {
    texturesClass.wallTextures = await texturesClass.loadTexturesToArray(texturesClass.wallTextures, texturesClass.wallFileNames, 1);
    texturesClass.floorTextures = await texturesClass.loadTexturesToArray(texturesClass.floorTextures, texturesClass.floorFileNames, 2);
    texturesClass.skyTextures = await texturesClass.loadTexturesToArray(texturesClass.skyTextures, texturesClass.skyFileNames, 1);

	game = setInterval(gameLoop, CLOCKSIGNAL)
};
