export default class MapDataClass {
    constructor({texturesClass: texturesClass}) {
        this.texturesClass = texturesClass
        //--------------------------------
        this.map = []
        this.walls = []; this.walls[0] = null;
    }

    returnActualWallTexture(wall, wallY, wallX) {
        if (wall.mode == 'animated' || wall.mode == 'door' || wall.mode == 'secret' || wall.mode == 'key1' || wall.mode == 'key2' || wall.mode == 'ammo') {
            if (wall.anim_switch) {
                let checkActAnim = this.loadAnimationTexture(wall, wallY, wallX)                
                if (checkActAnim) return checkActAnim;
            }
        }
        return [wall.dirConstruction[0], wall.dirConstruction[1]]
    }

    async createWall(wallData, dirConstruction) {        
        let wallArray = [];
        wallArray.dirConstruction = dirConstruction
        if (typeof wallData.type !== 'undefined') {
            wallArray.id = wallData.id
            wallArray.type = wallData.type
            wallArray.mode = wallData.mode
            wallArray.height = wallData.height
            if (wallData.mode == 'animated' || wallData.mode == 'door' || wallData.mode == 'secret' || wallData.mode == 'key1' || wallData.mode == 'key2' || wallData.mode == 'ammo') {
                wallArray.anim_switch = wallData.anim_switch
                wallArray.anim_function = wallData.anim_function
                wallArray.anim_speed = wallData.anim_speed
                wallArray.anim_repeat = wallData.anim_repeat
                wallArray.anim_repeatCount = wallData.anim_repeatCount
                wallArray.anim_repeatEnd = wallData.anim_repeatEnd
                wallArray.anim_startFrame = wallData.anim_startFrame
                wallArray.anim_maxFrame = dirConstruction.length-1
                wallArray.anim_actFrame = wallData.anim_actFrame
            }
        }        
        this.walls.push(wallArray)
    }

    async defineTextures(map) {        
        // CREATE this.map
        for (let n = 0; n < map.length; n++) {
            this.map[n] = [];
            for (let m = 0; m < map[n].length; m++) {
                this.map[n][m] = 0;
            }
        }
        // Fill this.map
        for(let mY=0; mY<map.length; mY++) {
            for(let mX=0; mX<map[0].length; mX++) {
                if (map[mY][mX] != 0) {
                    let cellData = map[mY][mX]
                    // Texture search based on texture identifier.
                    let loadingTexture = this.walls.find(wall => wall !== null && wall.id == cellData.id);
                    // Érték szerinti átadás
                    const wallValue = {...loadingTexture, ...cellData}                    
                    this.map[mY][mX] = wallValue
                }
            }
        }
    }

    loadAnimationTexture(obj, wallY, wallX) {
		if(obj.anim_switch) {
			if(!obj.anim_function) {
                // Create animation interval
				obj.anim_function = setInterval(() => {
                    obj.anim_actFrame++
                    // obj.dirConstruction.length = anim_max frames
					obj.anim_actFrame = (obj.anim_actFrame >= obj.dirConstruction.length) ? obj.anim_startFrame : obj.anim_actFrame
                    if (!obj.anim_repeat) {
						obj.anim_repeatCount++
                        if (obj.anim_repeatCount >= obj.anim_repeatEnd) {
							clearInterval(obj.anim_function)
							obj.anim_switch = false
							obj.anim_function = null
							obj.anim_repeatCount = 0
							// if DOOR expiration deleting in map.
							if (obj.mode == 'door' || obj.mode == 'secret' || obj.mode == 'key1' ||obj.mode == 'key2') this.map[wallY][wallX] = 0
						}
					}
				}, obj.anim_speed)
			}
			return [obj.dirConstruction[0], obj.dirConstruction[obj.anim_actFrame]]
		}
	}
}
