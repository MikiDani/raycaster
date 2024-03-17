export default class MapDataClass {
    constructor({texturesClass: texturesClass}) {
        this.texturesClass = texturesClass
        //--------------------------------
        this.map = []
        this.walls = []; this.walls[0] = null;
    }

    returnActualWallTexture(wallY, wallX) {
        let wall = this.map[wallY][wallX]

        if (wall.type == 'animated' || wall.type == 'door') {

            // IF DOOR ANIMATION END THEN CLEAR THE DOOR
            if (wall.type == 'door' && (!wall.active)) {
                this.map[wallY][wallX] = 0
                return null;
            }
            let checkActAnim = this.texturesClass.loadAnimationTexture(wall)
            if (checkActAnim) return checkActAnim;
        }


        return [wall.dirConstruction[0], wall.dirConstruction[1]]
    }

    createWall(wallData, dirConstruction) {
        let wallArray = [];
        wallArray.dirConstruction = dirConstruction
        if (typeof wallData.type !== 'undefined') {
            wallArray.type = wallData.type
            if (wallData.type == 'animated' || wallData.type == 'door') {
                wallArray.active = wallData.active
                wallArray.anim_switch = wallData.anim_switch
                wallArray.anim_function = wallData.anim_function
                wallArray.anim_speed = wallData.anim_speed
                wallArray.anim_repeat = wallData.anim_repeat
                wallArray.anim_repeatCount = wallData.anim_repeatCount
                wallArray.anim_startFrame = wallData.anim_startFrame
                wallArray.anim_maxFrame = wallData.anim_maxFrame
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
                for(let n=1; n<this.walls.length; ++n) {
                    if (map[mY][mX] == n) { 
                        // Érték szerinti átadás
                        const wallValue = Object.assign({}, this.walls[n]);
                        this.map[mY][mX] = wallValue
                    }
                }
            }
        }
    }
}
