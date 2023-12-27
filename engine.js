const SCREEN_WIDTH = window.innerWidth;
const SCREEN_HEIGHT = window.innerHeight;

const canvas = document.createElement("canvas")
canvas.setAttribute('width', SCREEN_WIDTH)
canvas.setAttribute('HEIGHT', SCREEN_HEIGHT)
document.body.appendChild(canvas)

const context = canvas.getContext('2d')

const TRICK = 30;
const FOV = toRadians(90);
const CELL_SIZE = 16;
const PLAYER_SIZE = 6;
const COLORS = {
    wall: '#00e03f',
    wallDark: '#179d3d',
    floor: '#ccc',
    ceiling: '#39bbff',
}

const MINIMAP_X = 0
const MINIMAP_Y = 0
const MINIMAP_SCALE = 3

const map = [
    [1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 0, 1, 1],
    [1, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 0, 0, 0, 1],
    [1, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 0, 1],
    [1, 1, 1, 1, 1, 1, 1],
];

const player = {
    x: CELL_SIZE * 5.2,
    y: CELL_SIZE * 4.5,
    angle: 3.927,
    speed: 0,
}

const numberOfRays = Math.floor(SCREEN_WIDTH / 15)
const gridSize = Math.floor(SCREEN_WIDTH / numberOfRays);

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
    context.fillStyle = 'red'
    context.fillRect(0,0, SCREEN_WIDTH, SCREEN_HEIGHT)
}

function movePlayer() {
    player.x += Math.cos(player.angle) * player.speed
    player.y += Math.sin(player.angle) * player.speed
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
    
    const xA = right ? CELL_SIZE : -CELL_SIZE
    const yA = xA * Math.tan(angle)

    let wall;
    let nextX = firstX;
    let nextY = firstY;

    while(!wall) {
        const cellX = (right) ? Math.floor(nextX / CELL_SIZE) : Math.floor(nextX / CELL_SIZE) - 1;
        const cellY = Math.floor(nextY / CELL_SIZE)

        if(outOfMapBounds(cellX, cellY)) break;

        wall = map[cellY][cellX]
        if(!wall) {
            nextX += xA
            nextY += yA
        }
    }

    return { 
        angle,
        distance: distance(player.x, player.y, nextX, nextY),
        vertical: true,
    }
}

function getHCrash(angle) {
    const up = Math.abs(Math.floor(angle / Math.PI) % 2)
    
    const firstY = (up)
    ? Math.floor(player.y / CELL_SIZE) * CELL_SIZE
    : Math.floor(player.y / CELL_SIZE) * CELL_SIZE + CELL_SIZE;

    const firstX = player.x + (firstY - player.y) / Math.tan(angle)
    const yA = up ? -CELL_SIZE : CELL_SIZE
    const xA = yA / Math.tan(angle)

    let wall;
    let nextX = firstX;
    let nextY = firstY;

    while(!wall) {
        const cellX = Math.floor(nextX / CELL_SIZE)
        const cellY = (up) ? Math.floor(nextY / CELL_SIZE) - 1 : Math.floor(nextY / CELL_SIZE);

        if(outOfMapBounds(cellX, cellY)) break;
        
        wall = map[cellY][cellX]
        if(!wall) {
            nextX += xA
            nextY += yA
        }
    }

    return { 
        angle,
        distance: distance(player.x, player.y, nextX, nextY),
        vertical: false,
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

function renderScreen(rays) {
    rays.forEach((ray, i) => {
        //const distance = ray.distance;
        const distance = fixFhishEye(ray.distance, ray.angle, player.angle);
        const wallHeight = ((CELL_SIZE * 2) / distance) * 300;

        // Wall
        context.fillStyle = (ray.vertical) ? COLORS.wallDark : COLORS.wall;
        context.fillRect(i * gridSize, (SCREEN_HEIGHT / 2) - (wallHeight / 2), gridSize, wallHeight);

        // Floor
        context.fillStyle = COLORS.floor;
        context.fillRect(
            i * gridSize,
            (SCREEN_HEIGHT / 2) + (wallHeight / 2),
            gridSize,
            (SCREEN_HEIGHT / 2) - (wallHeight / 2),
        );
        
        // Ceiling
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
        
        if (ray.way == '1') {
            context.strokeStyle = COLORS.raysRight
        } else if (ray.way == '0') {
            context.strokeStyle = COLORS.raysLeft
        } else if (ray.way2 == '1') {
            context.strokeStyle = COLORS.raysTop
        } else if (ray.way2 == '0') {
            context.strokeStyle = COLORS.raysBottom
        } else {
            context.strokeStyle = COLORS.error
        }
        
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

    context.fillStyle = 'white';
    context.fillRect(SCREEN_WIDTH - 200 - 10, 10, 200, 200)

    const lineheight = 20;
    const playerDataText = `
        Player Data:|
        x: ${player.x.toFixed(3)} |
        y: ${player.y.toFixed(3)} |
        angle: ${player.angle.toFixed(3)} Rad |
        angle: ${toAngle(player.angle).toFixed(1)} ° |
        RIGHT?: ${Math.abs(Math.floor((player.angle-Math.PI/2) / Math.PI) % 2)} |
        UP?: ${Math.abs(Math.floor(player.angle / Math.PI) % 2)} |
        RAYS: ${numberOfRays} |
        speed: ${player.speed}`;
    const lines = playerDataText.split('|');

    context.fillStyle = 'black';
    context.font = "16px serif";
    for (var i = 0; i<lines.length; i++)
        context.fillText(lines[i], SCREEN_WIDTH - 200 - 40, 30 + (i * lineheight));
}

function gameLoop() {
    
    clearScreen()
    movePlayer()

    const rays = getRays()

    renderScreen(rays)

    renderMinimap(rays)
    
    //clearInterval(game)
}

var game = setInterval(gameLoop, TRICK)

document.addEventListener('keydown', (e) => {
    if(e.key == "w" || e.keyCode == 38) player.speed = 1;
    if(e.key == "s" || e.keyCode == 40) player.speed = -1;
    if(e.key == "a" || e.keyCode == 37) player.angle += -toRadians(7.5)
    if(e.key == "d" || e.keyCode == 39) player.angle += toRadians(7.5)
});

document.addEventListener('keyup', (e) => {
    if(e.key == "w" || e.key == "s" || e.keyCode == 38 || e.keyCode == 40)
        player.speed = 0;

        if(e.keyCode == 77) clearInterval(game)
});

document.addEventListener('mousemove', (e) => {
    // player.angle += toRadians(e.movementX)
});

// addEventListener("mousedown", (event) => {
//     player.speed = 1;
// });

addEventListener("mouseup", (event) => {
    player.speed = 0;
});