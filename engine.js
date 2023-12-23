const SCREEN_WIDTH = window.innerWidth;
const SCREEN_HEIGHT = window.innerHeight;

const canvas = document.createElement("canvas")
canvas.setAttribute('width', SCREEN_WIDTH)
canvas.setAttribute('HEIGHT', SCREEN_HEIGHT)
document.body.appendChild(canvas)

const context = canvas.getContext('2d')

const TRICK = 30;
const FOV = toRadians(60);
const CELL_SIZE = 64;
const PLAYER_SIZE = 10;
const COLORS = {
    rays: '#ffa600',
    wall: '#00e03f',
    wallDark: '#179d3d',
    floor: '#ccc',
    ceiling: '#39bbff',
}

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
    x: CELL_SIZE * 1.5,
    y: CELL_SIZE * 1.5,
    angle: 0,
    speed: 0,
}

const numberOfRays = SCREEN_WIDTH
//const numberOfRays = 120;
const gridSize = Math.floor(SCREEN_WIDTH / numberOfRays);

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

function getVCollision(angle) {
    const right = Math.abs(Math.floor((angle-Math.PI/2) / Math.PI) % 2 )

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
        const cellX = (right)
        ? Math.floor(nextX / CELL_SIZE)
        : Math.floor(nextX / CELL_SIZE) - 1;

        const cellY = Math.floor(nextY / CELL_SIZE)

        if(outOfMapBounds(cellX, cellY)) {
            break
        }
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

function getHCollision(angle) {
    const up = Math.abs(Math.floor(angle / Math.PI) % 2 )

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

        const cellY = (up)
        ? Math.floor(nextY / CELL_SIZE) - 1
        : Math.floor(nextY / CELL_SIZE);

        if(outOfMapBounds(cellX, cellY)) {
            break;
        }
        
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
    const vCollision = getVCollision(angle)
    const hCollision = getHCollision(angle)

    //return vCollision

    return (hCollision.distance >= vCollision.distance) ? vCollision : hCollision;
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
        const wallHeight = ((CELL_SIZE * 2) / distance) * 400;

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

function renderMinimap(posX = 0 , posY = 0, scale = 0.8, rays) {

    const cellSize =  scale * CELL_SIZE;

    // WALLSw
    map.forEach((row, y) => {
        row.forEach((cell, x) => {
            if(cell) {
                context.fillStyle = 'gray'
                context.fillRect(
                    posX + (x * cellSize),
                    posY + (y * cellSize),
                    cellSize,
                    cellSize
                );
            }
        });
    });

    // PLAYER
    context.fillStyle = 'blue';
    context.fillRect(
        posX + (player.x * scale) - (PLAYER_SIZE/2),
        posY + (player.y * scale) - (PLAYER_SIZE/2),
        PLAYER_SIZE,
        PLAYER_SIZE,
    )

    //RAY
    const rayLength = PLAYER_SIZE * 5;
    
    context.strokeStyle = COLORS.rays;

    rays.forEach(ray => {
        context.beginPath()
        context.moveTo((player.x * scale) + posX, (player.y * scale) + posY)
        context.lineTo(
            (player.x + (Math.cos(ray.angle) * ray.distance)) * scale,
            (player.y + (Math.sin(ray.angle) * ray.distance)) * scale,
        )
        context.closePath()
        context.stroke()
    });

    context.strokeStyle = 'blue'
    context.beginPath()
    context.moveTo(player.x * (scale + posX), player.y * (scale + posY))
    context.lineTo(
        (player.x + (Math.cos(player.angle) * rayLength)) * scale,
        (player.y + (Math.sin(player.angle) * rayLength)) * scale,
    )
    context.closePath()
    context.stroke()

    context.fillStyle = 'white';
    context.fillRect(SCREEN_WIDTH - (scale * 300) - 10, 10, scale * 300, scale * 300)

    const lineheight = 20;
    const playerDataText = `
        Player Data:|
        x: ${player.x.toFixed(3)} |
        y: ${player.y.toFixed(3)} |
        angle: ${player.angle.toFixed(3)} |
        angle: ${toRadians(player.angle)} |
        speed: ${player.speed}`;

        
    const lines = playerDataText.split('|');

    //console.log(lines);

    context.fillStyle = 'black';
    context.font = "16px serif";

    for (var i = 0; i<lines.length; i++)
        context.fillText(lines[i], SCREEN_WIDTH - (scale * 300) - 40, 30 + (i*lineheight));

}

var upper = 0;

function gameLoop() {
    clearScreen()
    movePlayer()
    const rays = getRays()
    renderScreen(rays)
    renderMinimap(0,0, 0.5, rays)
    //console.log(upper)
    upper++
}

setInterval(gameLoop, TRICK)

function toRadians(deg) {
    return ((deg * Math.PI) / 180);
}

document.addEventListener('keydown', (e) => {
    if(e.key == "w" || e.keyCode == 38) player.speed = 2;
    if(e.key == "s" || e.keyCode == 40) player.speed = -2;
    if(e.key == "a" || e.keyCode == 37) player.angle += -toRadians(3)
    if(e.key == "d" || e.keyCode == 39) player.angle += toRadians(3)
});

document.addEventListener('keyup', (e) => {
    if(e.key == "w" || e.key == "s" || e.keyCode == 38 || e.keyCode == 40)
        player.speed = 0;
});

document.addEventListener('mousemove', (e) => {
    player.angle += toRadians(e.movementX)
});

addEventListener("mousedown", (event) => {
    player.speed = 2;
});

addEventListener("mouseup", (event) => {
    player.speed = 0;
});