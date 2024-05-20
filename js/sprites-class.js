export default class SpritesClass {
    lookDistance;
    sprites;
    nearSprites;
    weponsSprites;
    objectDataTypes;
    constructor({CELL_SIZE: CELL_SIZE, player: player, texturesClass: texturesClass, mapDataClass: mapDataClass}) {
        this.texturesClass = texturesClass
        this.mapDataClass = mapDataClass
        this.player = player
        this.CELL_SIZE = CELL_SIZE
        //--------------------------------
        this.lookDistance = 24
        this.sprites = []
        this.nearSprites = []
        this.weponsSprites = []

        this.loadObjectDataTypes()
    }

    async loadObjectDataTypes() {
        const loadData = await fetch("./data/objectdatatypes.JSON");
        this.objectDataTypes = await loadData.json()
    }

    createSprite(spriteData, dirConstruction, thisArray) {
        let spriteArray = [];
        
        spriteArray.dirConstruction = dirConstruction;
                
        for (let key in spriteData) {
            const isset = this.objectDataTypes.some(item => item.name == key);
            if (isset) {
                (key == "x" || key == "y") 
                ? spriteArray[key] = this.CELL_SIZE * spriteData[key]
                : spriteArray[key] = spriteData[key]
            } 
        }

        thisArray.push(spriteArray)
    }

    selectNearSprites() {
        let pY = Math.floor(this.player.y / this.CELL_SIZE)
        let pX = Math.floor(this.player.x / this.CELL_SIZE)
        
        let checkYmin = (pY - this.lookDistance > 0)
        ? pY - this.lookDistance
        : 0;

        let checkYmax = (pY + this.lookDistance < this.mapDataClass.map.length)
        ? pY + this.lookDistance
        : this.mapDataClass.map[0].length;

        let checkXmin = (pX - this.lookDistance > 0)
        ? pX - this.lookDistance
        : 0;
        
        let checkXmax = (pX + this.lookDistance < this.mapDataClass.map[0].length)
        ? pX + this.lookDistance 
        : this.mapDataClass.map[0].length;

        this.nearSprites = []
        this.sprites.forEach((sprite, index) => {

            if (sprite.distance === null) sprite.distance = 5000
            
            let sY = Math.floor(sprite.y / this.CELL_SIZE)
            let sX = Math.floor(sprite.x / this.CELL_SIZE)

            if (sY >= checkYmin && sY <= checkYmax &&
                sX >= checkXmin && sX <= checkXmax) this.nearSprites.push(index)
        });
        // console.log(this.nearSprites);
    }

    startShot() {
        // console.log(this.texturesClass.weaponsTextures)
        // console.log(this.player.weapon)
        
        var findAmmo = this.weponsSprites.find(objektum => objektum.name == `ammo_weapon${this.player.weapon}`);

        if (findAmmo) {
            let ammo = { ...findAmmo };
            ammo.active = true
            ammo.x = this.player.x + Math.cos(this.player.angle) * 16;
            ammo.y = this.player.y + Math.sin(this.player.angle) * 16;
            ammo.angle = this.player.angle
            this.sprites.push(ammo)
        }
    }

    checkSpriteData(y, x, attr, name, type = null) {
        if (type == 'position') {
            y = Math.floor(y / this.CELL_SIZE)
            x = Math.floor(x / this.CELL_SIZE)
        }
    
        let check = this.sprites.find(sprite => (sprite[attr] == name && y == Math.floor(sprite.y / this.CELL_SIZE) && x == Math.floor(sprite.x / this.CELL_SIZE)))
    
        let returnValue = (check) ? check : false;
        return returnValue;
    }
    
    demage(get, give, drawing) {
        if (typeof get.energy != 'undefined' && typeof give.damage != 'undefined') {

            if (typeof get.damage_function === 'undefined' || get.damage_function === null) {

                console.log(get.energy);
            
                if (get.energy > 0) get.energy -= give.damage;
            
                if (drawing) {
                    $("#healt-percentage").text(get.energy + '%');
                    $("#healt-percentage").css('color', 'red');
                    setTimeout(() => {
                        $("#healt-percentage").css('color', 'white');
                    }, 250);
                }
            
                get.damage_function = setTimeout(() => {
                    get.damage_function = null;
                }, 500);
            }
        }
    }
}
