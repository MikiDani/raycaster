// -------------------------------------------------------
// 						CONSTRUCTOR
// -------------------------------------------------------
const SCREEN_WIDTH = window.innerWidth;
const SCREEN_HEIGHT = window.innerHeight;

const numberOfRays = Math.floor(SCREEN_WIDTH / 4)
const gridSize = Math.floor(SCREEN_WIDTH / numberOfRays)

const TRICK = 30;
const FOV = toRadians(60);
const CELL_SIZE = 128;
const WALL_DISTANCE = (CELL_SIZE / 100) * 30

const MINIMAP_SCALE = 0.25
const MINIMAP_X = 5
const MINIMAP_Y = 5
const PLAYER_SIZE = 6;

const player = {
	x: CELL_SIZE * 1.5,
	y: CELL_SIZE * 1.5,
	angle: 6.283,
	speed: 0,
}

var inX; var inY;

var texture
var infoSwitch = true
var mapSwitch = true
var game
var playerRay
var ShadowDistance

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
	[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
	[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
	[1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
	[1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0],
	[1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0],
	[1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0],
	[1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0],
	[1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
];

function toHex(num) {
	return (num < 16 ? '0' : '') + num.toString(16).toUpperCase();
}

async function loadTexture() {
    return new Promise((resolve, reject) => {
        const img = new Image();

        img.src = "img/textures/bricks.png";

		//brick1, brick2, bookshelf, walkstone, dani, wall1, wall2, wall3

        img.onload = function() {
            const imgWidth = this.width;
            const imgHeight = this.height;
            const imgCanvas = document.createElement("canvas");
            imgCanvas.style.display = 'none';
            imgCanvas.setAttribute('width', imgWidth);
            imgCanvas.setAttribute('height', imgHeight);
            document.body.appendChild(imgCanvas);
            const imgContext = imgCanvas.getContext('2d');

            imgContext.drawImage(img, 0, 0, imgWidth, imgHeight);

            const pixel = imgContext.getImageData(0, 0, imgWidth, imgHeight).data;

            var texture = new Array(imgHeight);
            for (let n = 0; n < imgHeight; n++) texture[n] = new Array(imgWidth);

            var count = 0;
            for (let h = 0; h < imgHeight; h++) {
                for (let w = 0; w < imgWidth; w++) {
                    let hexColor = '#' + toHex(pixel[count]) + toHex(pixel[count + 1]) + toHex(pixel[count + 2]) + toHex(pixel[count + 3]);
                    texture[h][w] = hexColor;
                    count = count + 4;
                }
            }
            resolve(texture);
        };

        img.onerror = function(error) {
            reject(error);
        };
    });
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
	}
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

	return {
		angle,
		distance: distance(player.x, player.y, nextX, nextY),
		vertical: true,
		start: Math.floor(((nextY / CELL_SIZE) - actCellY) * CELL_SIZE),
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

	return { 
		angle,
		distance: distance(player.x, player.y, nextX, nextY),
		vertical: false,
		start: Math.floor(((nextX / CELL_SIZE) - actCellX) * CELL_SIZE),
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
    var r = parseInt(color.substring(1, 3), 16)
    var g = parseInt(color.substring(3, 5), 16)
    var b = parseInt(color.substring(5, 7), 16)

    r = Math.floor(r * (1 - size))
    g = Math.floor(g * (1 - size))
    b = Math.floor(b * (1 - size))

    var newColor = "#" + ("0" + r.toString(16)).slice(-2) + ("0" + g.toString(16)).slice(-2) + ("0" + b.toString(16)).slice(-2)

    return newColor;
}

function calcShadowDistance(distance) {
	let shadowDistance = (distance / 100) * 0.1;
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

		// Wall
		for(let n=0;n<CELL_SIZE; n++) {
			context.fillStyle = (ray.vertical) ? colorDarkening(texture[n][ray.start], 0.5) : texture[n][ray.start]

			let shadowDistance = calcShadowDistance(distance)
			//context.fillStyle = colorDarkening(context.fillStyle, shadowDistance)

			context.fillRect(
				cutOutX(i * gridSize),
				cutOutY(Math.floor(((SCREEN_HEIGHT / 2) - (wallHeight / 2)) + (Math.ceil(n * BRICK_SIZE)))),
				gridSize,
				cutOutY(Math.ceil(BRICK_SIZE))
			);

			// Shadow
			context.fillStyle = `rgba(0, 0, 0, ${shadowDistance})`;
			context.fillRect(
				cutOutX(i * gridSize),
				cutOutY(Math.floor(((SCREEN_HEIGHT / 2) - (wallHeight / 2)) + (Math.ceil(n * BRICK_SIZE)))),
				gridSize,
				cutOutY(Math.ceil(BRICK_SIZE))
			);
		}

		// Floor
		context.fillStyle = texture[32][32];
		context.fillRect(
			i * gridSize,
			(SCREEN_HEIGHT / 2) + (wallHeight / 2),
			gridSize,
			(SCREEN_HEIGHT / 2) - (wallHeight / 2),
		);
		
		// Ceiling
		// context.fillStyle = COLORS.ceiling;
		context.fillStyle = COLORS.ceiling;
		context.fillRect(
			i * gridSize,
			0,
			gridSize,
			(SCREEN_HEIGHT / 2) - (wallHeight / 2),
		);
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

	//PLAYER RAY
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
		inX: ${inX} |
		inY: ${inY} |
		angle: ${player.angle.toFixed(3)} Rad |
		angle: ${toAngle(player.angle).toFixed(1)} ° |
		P ray dis: ${playerRay.distance.toFixed(5)} |
		ShadowDistance : ${ShadowDistance} |
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

	let shadowDistance = calcShadowDistance(player.distance)
	
	context.fillStyle = (playerRay.vertical) ? colorDarkening('#ff0000',0) : '#ff0000'
	context.fillStyle = colorDarkening(context.fillStyle, ShadowDistance)
	context.fillRect(600,0, 100, 100)
	let last = context.fillStyle
	context.fillStyle = 'white'
	context.font = "16px serif"
	context.fillText(last, 620,50)
	

	if (mapSwitch) renderMinimap(rays)
	if (infoSwitch) infoPanel()
	
	//clearInterval(game)
}

document.addEventListener('keydown', (e) => {
	if(e.key == "w" || e.keyCode == 38) player.speed = 30;
	if(e.key == "s" || e.keyCode == 40) player.speed = -30;
	if(e.key == "a" || e.keyCode == 37) player.angle += -toRadians(5)		// 7.5
	if(e.key == "d" || e.keyCode == 39) player.angle += toRadians(5)		// 7.5
});

document.addEventListener('keyup', (e) => {
	if(e.key == "w" || e.key == "s" || e.keyCode == 38 || e.keyCode == 40)
		player.speed = 0;

		if(e.keyCode == 27) clearInterval(game);							// ESC
		if(e.keyCode == 77) mapSwitch = (mapSwitch) ? false : true;			// M
		if(e.keyCode == 73) infoSwitch = (infoSwitch) ? false : true;		// I
});

// document.addEventListener('mousemove', (e) => {
// 	player.angle += toRadians(e.movementX)
// });

addEventListener("mousedown", () => {
    player.speed = 1;
});

addEventListener("mouseup", () => {
	player.speed = 0;
});

// ---------- START ----------

async function startGame() {
	try {
		texture = await loadTexture();
		game = setInterval(gameLoop, TRICK)
	} catch (error) {
		console.error(error);
	}
}

window.onload = () => {
	startGame();
}