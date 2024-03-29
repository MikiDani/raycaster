// import MapDataClass from "./mapdata-class"

export default class SpritesClass {
    constructor({CELL_SIZE: CELL_SIZE, player: player, texturesClass: texturesClass, mapDataClass: mapDataClass}) {
        this.texturesClass = texturesClass
        this.mapDataClass = mapDataClass
        this.player = player
        this.CELL_SIZE = CELL_SIZE
        //--------------------------------
        this.lookDistance = 25
        this.sprites = []
        this.nearSprites = []

        this.weponsSprites = []
    }

    createSprite(spriteData, dirConstruction, thisArray) {
        let spriteArray = [];
        
        spriteArray.dirConstruction = dirConstruction;

        if (typeof spriteData.name !== 'undefined')                 spriteArray.name = spriteData.name;
        if (typeof spriteData.active !== 'undefined')               spriteArray.active = spriteData.active;
        if (typeof spriteData.type !== 'undefined')                 spriteArray.type = spriteData.type;
        if (typeof spriteData.mode !== 'undefined')                 spriteArray.mode = spriteData.mode;
        if (typeof spriteData.animation !== 'undefined')            spriteArray.animation = spriteData.animation;
        if (typeof spriteData.x !== 'undefined')                    spriteArray.x = this.CELL_SIZE * spriteData.x
        if (typeof spriteData.y !== 'undefined')                    spriteArray.y = this.CELL_SIZE * spriteData.y
        if (typeof spriteData.z !== 'undefined')                    spriteArray.z = spriteData.z;
        if (typeof spriteData.angle !== 'undefined')                spriteArray.angle = spriteData.angle;
        if (typeof spriteData.speed !== 'undefined')                spriteArray.speed = spriteData.speed;
        if (typeof spriteData.move !== 'undefined')                 spriteArray.move = spriteData.move;
        if (typeof spriteData.moveType !== 'undefined')             spriteArray.moveType = spriteData.moveType;
        if (typeof spriteData.distance !== 'undefined')             spriteArray.distance = spriteData.distance;
        if (typeof spriteData.value !== 'undefined')                spriteArray.value = spriteData.value;
        if (typeof spriteData.value !== 'undefined')                spriteArray.value = spriteData.value;

        if (typeof spriteData.anim_switch !== 'undefined')          spriteArray.anim_switch = spriteData.anim_switch;
        if (typeof spriteData.anim_frames !== 'undefined')          spriteArray.anim_frames = spriteData.anim_frames;
        if (typeof spriteData.anim_speed !== 'undefined')           spriteArray.anim_speed = spriteData.anim_speed;
        if (typeof spriteData.anim_function !== 'undefined')        spriteArray.anim_function = spriteData.anim_function;
        if (typeof spriteData.anim_repeat !== 'undefined')          spriteArray.anim_repeat = spriteData.anim_repeat;
        if (typeof spriteData.anim_repeatCount !== 'undefined')     spriteArray.anim_repeatCount = spriteData.anim_repeatCount;
        if (typeof spriteData.anim_startFrame !== 'undefined')      spriteArray.anim_startFrame = spriteData.anim_startFrame;
        if (typeof spriteData.anim_maxFrame !== 'undefined')        spriteArray.anim_maxFrame = spriteData.anim_maxFrame;
        if (typeof spriteData.anim_actFrame !== 'undefined')        spriteArray.anim_actFrame = spriteData.anim_actFrame;
        
        if (typeof spriteData.rotation !== 'undefined')             spriteArray.rotation = spriteData.rotation;
        if (typeof spriteData.rotationFrames !== 'undefined')       spriteArray.rotationFrames = spriteData.rotationFrames;

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
            ammo.x = this.player.x + Math.cos(this.player.angle) * 64;
            ammo.y = this.player.y + Math.sin(this.player.angle) * 64;
            ammo.angle = this.player.angle
            this.sprites.push(ammo)
        }
    }
}
