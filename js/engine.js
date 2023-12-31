// -------------------------------------------------------
// 						DANI RAYENGINE
// -------------------------------------------------------

import TexturesClass from './textures-class.js';
const texturesClass = new TexturesClass();

const walkInterval = -7;

const SCREEN_WIDTH = window.innerWidth;
const SCREEN_HEIGHT = window.innerHeight + Math.abs(walkInterval);

//const numberOfRays = 1
const numberOfRays = Math.floor(SCREEN_WIDTH / 4)

const gridSize = Math.floor(SCREEN_WIDTH / numberOfRays)

const TRICK = 30
const FOV = toRadians(60)
const CELL_SIZE = 64
const MOVE_SPEED = 10
const MOVE_ANGLE = 5
const WALL_DISTANCE = (CELL_SIZE / 100) * 40

const MINIMAP_SCALE = 0.5
const MINIMAP_X = 5
const MINIMAP_Y = 4
const PLAYER_SIZE = 6

const player = {
	x: CELL_SIZE * 1.5,
	y: CELL_SIZE * 1.5,
	z: 0,
	angle: 0,
	speed: 0,
}

var inX; var inY;

const menu = {
	infoSwitch: true,
	mapSwitch: true,
	shadows: true,
	mouseSwitch: false,	// !!
}

var game
var playerRay
var shadowDistance
var p = 2		// !!

const canvas = document.createElement("canvas")
canvas.setAttribute('width', SCREEN_WIDTH)
canvas.setAttribute('HEIGHT', SCREEN_HEIGHT)
document.body.appendChild(canvas)
const context = canvas.getContext('2d')

// -------------------------------------------------------

const COLORS = {
	ray: 'yellow',
	floor: '#ccc',
	ceiling: '#39bbff',
}

const map = [
	[2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 4],
	[5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4],
	[5, 0, 1, 1, 0, 1, 1, 2, 3, 7, 3, 2, 7, 3, 4],
	[5, 0, 0, 0, 0, 0, 8, 0, 0, 0, 0, 0, 0, 0, 4],
	[5, 0,10, 0, 0, 0, 8, 0, 0,11, 0, 0, 0, 0, 4],
	[5, 0,10, 0, 0, 0, 0, 0, 0,12, 0, 0, 0, 0, 4],
	[5, 0,10, 0,11, 0,12, 0, 0, 0, 0, 0, 0, 0, 4],
	[5, 6, 6, 6, 6, 6, 6, 7, 7, 7, 7, 7, 7, 7, 4],
];

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

function clearScreen() {
	context.fillStyle = 'black'
	context.fillRect(0,0, SCREEN_WIDTH, SCREEN_HEIGHT)
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
			// LEFT
			if (map[actY][actX+1] && inX >= CELL_SIZE - WALL_DISTANCE) moveX = false;
		} else {
			// RIGHT
			if (map[actY][actX-1] && inX <= WALL_DISTANCE) moveX = false;
		}

		if (player.y < player.y + (Math.sin(player.angle) * player.speed)) {
			// UP
			if (map[actY+1][actX] && inY >= CELL_SIZE - WALL_DISTANCE) moveY = false;
		} else {
			// DOWN
			if (map[actY-1][actX] && inY <= WALL_DISTANCE) moveY = false;
		}

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

function getVCrash(angle) {
	const right = Math.abs(Math.floor((angle-Math.PI/2) / Math.PI) % 2)

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

	while(!wall) {
		const cellX = (right) ? Math.floor(nextX / CELL_SIZE) : Math.floor(nextX / CELL_SIZE) - 1;
		const cellY = Math.floor(nextY / CELL_SIZE)

		if(outOfMapBounds(cellX, cellY)) break;

		wall = map[cellY][cellX]
		actCellY = cellY

		if(!wall) { nextX += xA; nextY += yA }
	}

	let start = (!right)
		? (CELL_SIZE - (Math.floor(((nextY / CELL_SIZE) - actCellY) * CELL_SIZE)) - 1)
		: Math.floor(((nextY / CELL_SIZE) - actCellY) * CELL_SIZE);

	let floor = (!right)
		? {'floorXWall': nextX + start, 'floorYWall': nextY } 
		: {'floorXWall': nextX + start, 'floorYWall': nextY + 1.0};

	return {
		wall : wall,
		posX: nextX,
		posY: nextY,
		angle,
		distance: distance(player.x, player.y, nextX, nextY),
		vertical: true,
		right: right,
		start: start,
		floor: floor,
	}
}

function getHCrash(angle) {
	const up = Math.abs(Math.floor(angle / Math.PI) % 2)
	
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

	while(!wall) {
		const cellX = Math.floor(nextX / CELL_SIZE)
		const cellY = (up) ? Math.floor(nextY / CELL_SIZE) - 1 : Math.floor(nextY / CELL_SIZE);

		if(outOfMapBounds(cellX, cellY)) break;

		wall = map[cellY][cellX]
		actCellX = cellX

		if(!wall) { nextX += xA; nextY += yA; }
	}

	let start = (!up) 
		? (CELL_SIZE - (Math.floor(((nextX / CELL_SIZE) - actCellX) * CELL_SIZE)) - 1)
		: Math.floor(((nextX / CELL_SIZE) - actCellX) * CELL_SIZE);

	let floor = (!up)
		? {'floorXWall': nextX, 'floorYWall': nextY + start } 
		: {'floorXWall': nextX + 1.0, 'floorYWall': nextY + start};

	return { 
		wall: wall,
		posX: nextX,
		posY: nextY,
		angle,
		distance: distance(player.x, player.y, nextX, nextY),
		vertical: false,
		up: up,
		start: start,
		floor: floor,
	}
}

function castRay(angle) {
	const vCrash = getVCrash(angle)
	const hCrash = getHCrash(angle)
	return (hCrash.distance >= vCrash.distance) ? vCrash : hCrash;
}

function getRays() {
	const initialAngle = player.angle - (FOV/2)
	const angleStep = FOV / numberOfRays

	return Array.from({length: numberOfRays}, (_, i) => {
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
	rays.forEach((ray, i) => {
		//const distance = ray.distance;
		const distance = fixFhishEye(ray.distance, ray.angle, player.angle)
		const wallHeight = ((CELL_SIZE) / distance) * 1450
		const BRICK_SIZE = wallHeight / CELL_SIZE

		const HEIGHT_REMAINDER = SCREEN_WIDTH - (SCREEN_WIDTH / 2 + (wallHeight / 2))
		const DRAWEND = HEIGHT_REMAINDER / BRICK_SIZE
		//const drawEnd = SCREEN_HEIGHT

		// Wall
		for(let n=0; n<CELL_SIZE; n++) {

			if (typeof ray.vertical !== 'undefined') {
				context.fillStyle = (ray.vertical) ? colorDarkening(texturesClass.textures[ray.wall][n][ray.start], 0.4) : texturesClass.textures[ray.wall][n][ray.start];
				
				context.fillRect(
					cutOutX(i * gridSize),
					cutOutY(player.z + Math.floor((((SCREEN_HEIGHT / 2)) - (wallHeight / 2)) + (Math.ceil(n * BRICK_SIZE)))),
					gridSize,
					cutOutY(Math.ceil(BRICK_SIZE))
				);
	
				//Shadow
				if (menu.shadows) {
					let shadowDistance = calcShadowDistance(distance)
					context.fillStyle = `rgba(0, 0, 0, ${shadowDistance})`;
					context.fillRect(
						cutOutX(i * gridSize),
						cutOutY(player.z + Math.floor(((SCREEN_HEIGHT / 2) - (wallHeight / 2)) + (Math.ceil(n * BRICK_SIZE)))),
						gridSize,
						cutOutY(Math.ceil(BRICK_SIZE))
					);
				}
			}
		}
		
		// // VERTIKÁLIS MÓDSZER
		// /////////////////////////////////////////////////////////////////////////////////////////////
		// //FLOOR CASTING (függőleges változat, közvetlenül a függőleges falcsík megrajzolása után az aktuális x-hez)
		// console.log(ray.floor.floorXWall, ray.floor.floorYWall) //x, y a padlótexel helyzete a fal alján
	
		let distWall, distPlayer, currentDist;

		distWall = distance;
		distPlayer = 0.0;

		// húzza meg a padlót a rajzolás végétől a képernyő aljáig
		// for(let y = drawEnd + 1; y < h; y++)

		// floor
		for(let y=0; y<DRAWEND; y++) {

			//currentDist = h / (2.0 * y - h);
			currentDist = DRAWEND / (2.0 * y - DRAWEND);

			let weight = (currentDist - distPlayer) / (distWall - distPlayer);

			let currentFloorX = weight * ray.floor.floorXWall + (1.0 - weight) * ray.posX;
			let currentFloorY = weight * ray.floor.floorYWall + (1.0 - weight) * ray.posY;
			// console.log('currentFloorX: ' + currentFloorX + ' | currentFloorY: ' + currentFloorY)

			let floorTexX = Math.floor(currentFloorX * CELL_SIZE) % CELL_SIZE;
			let floorTexY = Math.floor(currentFloorY * CELL_SIZE) % CELL_SIZE;

			if (floorTexX>64) { floorTexX = 64 } else if(floorTexX < 0) { floorTexX = 0 }
			if (floorTexY>64) { floorTexY = 64 } else if(floorTexY < 0) { floorTexY = 0 }
			
			//let buffer = (textures[3][CELL_SIZE * floorTexY + floorTexX] >> 1) & 8355711;
			//console.log('buffer[y][x]: ' + buffer)
			
			// ---
			// console.log('currentFloorX: ' + currentFloorX + ' | currentFloorY: ' + currentFloorY)
			// console.log('floorTexX: ' + floorTexX + ' floorTexY: ' + floorTexY + ' | color: ' + texturesClass.textures[3][floorTexY][floorTexX])
			// ---

			context.fillStyle = texturesClass.textures[6][floorTexY][floorTexX];
			context.fillRect(
				i * gridSize,
				player.z + (SCREEN_HEIGHT / 2) + (wallHeight / 2) + (y * BRICK_SIZE),
				gridSize,
				BRICK_SIZE
			);
		}
		
		//SAJAT RAJZ
		// let p = 1;
		// for(let n=0; n<DRAWEND; n++) {
		// 	p++;
		// 	//floor
		// 	context.fillStyle = texturesClass.textures[p][32][32];
		// 	context.fillRect(
		// 		i * gridSize,
		// 		player.z + (SCREEN_HEIGHT / 2) + (wallHeight / 2) + (n * BRICK_SIZE),
		// 		gridSize,
		// 		BRICK_SIZE
		// 	);
		// 	p = (p==9) ? p=1 : p;
		// }

		/////////////////////////////////////////////////////////////////////////
		// 1.0
		// // Floor
		// context.fillStyle = texturesClass.textures[3][32][32];
		// context.fillRect(
		// 	i * gridSize,
		// 	player.z + (SCREEN_HEIGHT / 2) + (wallHeight / 2),
		// 	gridSize,
		// 	SCREEN_HEIGHT
		// );
		
		// // Ceiling
		// context.fillStyle = COLORS.ceiling;
		// context.fillRect(
		// 	i * gridSize,
		// 	0,
		// 	gridSize,
		// 	player.z + (SCREEN_HEIGHT / 2) - (wallHeight / 2),
		// );
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
		context.strokeStyle = COLORS.ray
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
	const rayLength = PLAYER_SIZE * 1;

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
	context.fillRect(SCREEN_WIDTH - 230 - 10, 10, 200, 350)
	const lineheight = 20;
	const playerDataText = `
		Player Data:  |
		------------- |
		x: ${player.x.toFixed(3)} |
		y: ${player.y.toFixed(3)} |
		z: ${player.z.toFixed(3)} |
		inX: ${inX} |
		inY: ${inY} |
		angle: ${player.angle.toFixed(3)} Rad |
		angle: ${toAngle(player.angle).toFixed(1)} ° |
		P ray dis: ${playerRay.distance.toFixed(5)} |
		ShadowDistance : ${shadowDistance} |
		speed: ${player.speed} |
		RIGHT?: ${Math.abs(Math.floor((player.angle-Math.PI/2) / Math.PI) % 2)} |
		UP?: ${Math.abs(Math.floor(player.angle / Math.PI) % 2)} |
		------------- |
		RAYS: ${numberOfRays} |
		gridSize: ${gridSize} |
		`;
	const lines = playerDataText.split('|');

	context.fillStyle = 'black'
	context.font = '16px serif'
	for (var i = 0; i<lines.length; i++)
		context.fillText(lines[i], SCREEN_WIDTH - 200 - 40, 30 + (i * lineheight));
}

function gameLoop() {
	clearScreen()
	movePlayer()
	const rays = getRays()
	renderScreen(rays)
	playerRay = castRay(player.angle)

	shadowDistance = calcShadowDistance(playerRay.distance)

	if (menu.mapSwitch) renderMinimap(rays)
	if (menu.infoSwitch) infoPanel()
	
	//clearInterval(game)
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
	
			if(e.keyCode == 27) { clearInterval(game); console.log('STOP!') }			// ESC
			if(e.keyCode == 77) menu.mapSwitch = (menu.mapSwitch) ? false : true;		// M
			if(e.keyCode == 73) menu.infoSwitch = (menu.infoSwitch) ? false : true;		// I
			if(e.keyCode == 72) menu.shadows = (menu.shadows) ? false : true;			// H
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
    const textures = await texturesClass.loadTexturesToArray();
	game = setInterval(gameLoop, TRICK)
};
