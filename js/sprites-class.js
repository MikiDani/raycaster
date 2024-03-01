export default class SpritesClass {
    constructor({CELL_SIZE: CELL_SIZE, texturesClass: texturesClass}) {
        this.texturesClass = texturesClass
        //--------------------------------
        this.CELL_SIZE = CELL_SIZE
        this.sprites = []
    }

    createSprite(spriteData, dirConstruction) {
        let spriteArray = [];
        
        spriteArray.dirConstruction     = dirConstruction
        spriteArray.type                = spriteData.type
        spriteArray.active              = spriteData.active
        spriteArray.mode                = spriteData.mode
        spriteArray.animation           = spriteData.animation
        spriteArray.x                   = this.CELL_SIZE * spriteData.x
        spriteArray.y                   = this.CELL_SIZE * spriteData.y
        spriteArray.z                   = spriteData.z
        spriteArray.angle               = spriteData.angle
        spriteArray.distance            = spriteData.distance

        if (typeof spriteData.animation !== 'undefined') 
        {
            spriteArray.animation = spriteData.animation;
        }
        
        this.sprites.push(spriteArray)
    }
}
