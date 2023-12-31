export default class TexturesClass {
    constructor() {
        this.fileNames = ['wall1', 'wall2', 'wall3', 'wall4', 'wall5', 'wall6', 'wall7', 'wall8', 'book1', 'a_wall1', 'a_wall2', 'a_wall3',]
        this.textures = []
    }

    async loadTexturesToArray() {
        this.textures.push('null');
        for (const filename of this.fileNames) {
            let loadTexture = await this.loadTexture(filename)
            this.textures.push(loadTexture)
        }
        //console.log(this.textures)
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
                good(texture);
            };
    
            img.onerror = function(error) {
                fault(error);
            };
        });
    }
}
