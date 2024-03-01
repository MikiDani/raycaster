export default class MapDataClass {
    constructor({graphicsClass: graphicsClass, texturesClass: texturesClass}) {
        this.graphicsClass = graphicsClass
        this.texturesClass = texturesClass
        //--------------------------------
        this.map = []
        this.walls = []; this.walls[0] = null;
    }

    returnActualTexture(wallY, wallX) {

        //console.log(wallY, wallX)
        // console.log(this.map[wallY][wallX])

        let wall = this.map[wallY][wallX]

        if (wall.type == 'animated' || wall.type == 'door') {

            if(wall.anim_switch) {

                if(!wall.anim_function) {
                    wall.anim_function = setInterval(() => {
                        wall.anim_actFrame++
    
                        wall.anim_actFrame = (wall.anim_actFrame >= wall.anim_maxFrame+1)
                        ? wall.anim_startFrame
                        : wall.anim_actFrame
    
                        // console.log(wall.anim_actFrame)

                        if (wall.anim_repeat != true) {
                            wall.anim_repeatCount++

                            //console.log(wall.anim_repeatCount)

                            if (wall.anim_repeatCount >= wall.anim_repeat) {
                                clearInterval(wall.anim_function)
                                wall.anim_switch = false
                                wall.anim_function = null
                                wall.anim_repeatCount = 0

                                if (wall.type == 'door') this.map[wallY][wallX] = 0
                            }
                        }
                    }, wall.anim_speed)
                }
                return [wall.dirConstruction[0], wall.dirConstruction[wall.anim_actFrame]];
            }
        }

        return [wall.dirConstruction[0], wall.dirConstruction[1]]
    }

    createWall(wallData, dirConstruction) {
        let wallArray = [];
        
        wallArray.dirConstruction = dirConstruction

        if (typeof wallData.type !== 'undefined') {

            wallArray.type = wallData.type
            
            if (wallData.type == 'animated' || wallData.type == 'door') {
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
