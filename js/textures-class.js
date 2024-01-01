export default class TexturesClass {
    constructor() {
        this.wallFileNames = ['wall1', 'wall2', 'wall3', 'wall4', 'wall5', 'wall6', 'wall7', 'wall8', 'book1']
        this.wallTextures = []
        this.floorFileNames = ['floor1', 'floor2', 'floor3', 'floort1', 'floort2']
        this.floorTextures = []
        this.skyFileNames = ['sky1', 'sky2', 'sky3', 'sky4']
        this.skyTextures = []
    }

    async loadTexturesToArray(textureArray, fileNames) {
        textureArray.push('null');
        for (const filename of fileNames) {
            let loadTexture = await this.loadTexture(filename)
            textureArray.push(loadTexture)
        }
        return textureArray;
    }

    async loadTexture(filename) {
        return new Promise((good, fault) => {
            const img = new Image();
    
            img.src = `img/textures/${filename}.png`
        
            img.onload = function() {
                const imgWidth = this.width
                const imgHeight = this.height
                const imgCanvas = document.createElement("canvas")
                imgCanvas.style.display = 'none'
                imgCanvas.setAttribute('id', filename)
                imgCanvas.setAttribute('width', imgWidth)
                imgCanvas.setAttribute('height', imgHeight)
                document.body.appendChild(imgCanvas);
                const imgContext = imgCanvas.getContext('2d')
    
                imgContext.drawImage(img, 0, 0, imgWidth, imgHeight)
                const pixel = imgContext.getImageData(0, 0, imgWidth, imgHeight).data

                var count = 0;
                var texture = new Array(imgHeight);
                for (let n = 0; n < imgHeight; n++) texture[n] = new Array(imgWidth);
                for (let h = 0; h < imgHeight; h++) {
                    for (let w = 0; w < imgWidth; w++) {
                        let rgbaColor = `rgba(${pixel[count]}, ${pixel[count + 1]}, ${pixel[count + 2]}, ${pixel[count + 3]})`
                        texture[h][w] = rgbaColor
                        count = count + 4
                    }
                }

                good({name: filename, data: texture});
            };
    
            img.onerror = function(error) {
                fault(error);
            };
        });
    }
}
