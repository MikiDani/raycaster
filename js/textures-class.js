export default class TexturesClass {
    constructor() {
        this.errorTextures = []
        this.errorFileNames = {
            'error':['error'],
        }

        this.skyTextures = []  
        this.skyFileNames = {
            'sky': ['sky1', 'sky2', 'sky3', 'sky4'],
        }
        this.floorTextures = []
        this.floorFileNames = {
            'floor': ['floor1', 'floor2', 'floor3'],
        }
        
        this.wallTextures = []
        this.spriteTextures = []
    }

    async loadTexturesToArray(textureArray, fileNames, dir) {
        textureArray.push('null');

        for (const nameDir of Object.keys(fileNames)) {
            textureArray[nameDir] = [];
    
            for (const fileName of fileNames[nameDir]) {
                textureArray[nameDir][fileName] = [];
    
                let loadTexture = await this.loadTexture(dir, nameDir, fileName);
                textureArray[nameDir][fileName] = loadTexture;
            }
        }

        return textureArray;
    }

    async loadTexturesToThis(fileNames, dir, thisVariableArray) {
        let dirConstruction = []
        for (const nameDir of Object.keys(fileNames)) {

            //IF NOTHING OBJECTDIR MAKE
            dirConstruction.push(nameDir)
            thisVariableArray[nameDir] = (typeof thisVariableArray[nameDir] !== 'undefined') ? thisVariableArray[nameDir] : [];
            for (const fileName of fileNames[nameDir]) {
                thisVariableArray[nameDir][fileName] = []
                
                let loadTexture = await this.loadTexture(dir, nameDir, fileName)
                thisVariableArray[nameDir][fileName] = loadTexture

                dirConstruction.push(fileName)
            }
        }

        return dirConstruction;
    }

    async loadTexture(dir, nameDir, filename) {
        return new Promise((good, fault) => {
            const img = new Image();
    
            img.src = `img/${dir}/${nameDir}/${filename}.png`

            // Finder //
            ////////////
            let $element = $('body').find("#" + filename);
            if ($element.length > 0) {
                console.log('Találtam egyezést az ' + filename + ' azonosítójú elemre. Már bevolt töltve : (');
            } else {
                img.onload = function() {
                    const imgWidth = this.width
                    const imgHeight = this.height
                    const imgCanvas = document.createElement("canvas")
                    imgCanvas.style.display = 'none'
                    imgCanvas.setAttribute('id', filename)
                    imgCanvas.setAttribute('width', imgWidth)
                    imgCanvas.setAttribute('height', imgHeight)
                    document.getElementById('graphics-container').appendChild(imgCanvas);
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
                    // Delete canvas in DOM
                    document.getElementById('graphics-container').innerHTML = '';
    
                    good({name: filename, imgWidth: imgWidth, imgHeight: imgHeight, data: texture});
                };
        
                img.onerror = function(error) {
                    fault(error);
                };
                console.log('A ' + filename + ' betöltődött...');
            }  
        });
    }
}
