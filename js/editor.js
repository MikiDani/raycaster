class Editor {
	objectDataTypes;
	skys;
	floors;
	walls;
	objects;
	selectedElementData;
	objectName;
	constructor () {
		this.mapSize = 64
		this.mapContainerWidth = 4000
		this.levelData = {
			"player": {
				"x": 1.5,
				"y": 1.5,
				"angle": 0
			},
			"error": [
				{
					"textures": {
						"error": ["error"]
					},
					"type": "error"
				}
			],
			"sprites": [
			]
		}
		
		this.map = []
		this.skys = []
		this.floors = []
		this.walls = []
		this.objects = []

		this.objectName = null
		// ---------------
		$(window).on('resize', this.resizer(this.mapSize, this.mapContainerWidth))
		this.mapUpload(this.mapSize)
		this.resizer(this.mapSize, this.mapContainerWidth)
		this.mapIconSize()
		// ----------------
		this.loadTextures()
		this.loadMap('map')
		this.buttonOptions()
	}

	insertedOptions(clone, y, x) {
		let data = {}
		let insertType = ''
		let insertObject = clone.walls.find(obj => parseInt(obj.id) == parseInt(clone.selectedElementData.id))	
		if (insertObject) insertType = 'wall'
		if (!insertObject) {
			insertObject = clone.objects.find(obj => parseInt(obj.id) == parseInt(clone.selectedElementData.id))
			if (insertObject) {
				insertType = 'object'
				data.y = parseInt(y) + 0.5
				data.x = parseInt(x) + 0.5
			}
		}

		if(typeof insertObject != 'undefined') {
			data.id = clone.selectedElementData.id
			for(const [key, value] of Object.entries(insertObject)) {
				// If have modified options save the map array.
				if (key != 'textures' && key != 'anim_function') {
					if (value !== clone.selectedElementData[key]) {
						data[key] = clone.selectedElementData[key]
					}
				}
			}
		}
		return {
			insertType: insertType,
			data: data,
		};
	}

	buttonOptions() {
		var clone = this
		// LOAD DATAS IN VARIABLE WHEN CLICKED TEXTURE
		$("#textures-selected").on('input', () => this.loadElementsDatas(this.selectedElementData.textures))
		
		////////////////////////////////
		// 			CLICK MAP
		////////////////////////////////
		$("[id^='map_']").on('click', function() {
			let y = $(this).attr('map-y')
			let x = $(this).attr('map-x')
			if (clone.selectedElementData) {
				for(const [dir, filename] of Object.entries(clone.selectedElementData.textures)) {
					$(this).css('background-image', `url(./img/${clone.objectName}/${dir}/${filename[0]}.png)`);
					$(this).css('background-size', 'cover')
					$(this).css('border', 'none')
					if (typeof clone.selectedElementData.height != 'undefined' && clone.selectedElementData.height == 'big') $(this).css('border', '3px solid gray')
					break;
				}
				let insertedData = clone.insertedOptions(clone, y, x)

				if (insertedData && insertedData.insertType == 'wall') clone.map[y][x] = insertedData.data;
				if (insertedData && insertedData.insertType == 'object') clone.levelData.sprites.push(insertedData.data);
				
				console.log('ezt írja bele:');				
				console.log(insertedData.insertType);
				console.log(insertedData.data);
			} else {
				// delete map brick

				// clone.map[y][x] = 0
				// $(this).css("background-image", "none")
			}
		});

		// RIGHT CLICK
		$("[id^='map_']").on('contextmenu', (event) => {
            event.preventDefault()
        });

		$(".map-container").find("[id^='map_']").on('mousedown', { levelData: this.levelData }, function(event) {

			let levelData = event.data.levelData

			event.preventDefault()
			if (event.which == 3) {

				let y = $(this).attr('map-y')
				let x = $(this).attr('map-x')

				console.log(x, y);
				

				// clone.map[y][x] = 0
				// $(this).css("background-image","").css("background-size", "").css("border", "");

				console.log(levelData);

				console.log(levelData.sprites);
				
				let findSprites = levelData.sprites.find(sprite => x == Math.floor(sprite.y) && y == Math.floor(sprite.x))

				console.log(findSprites);

			}		
        });

		// FILL MAP BUTTON
		$("#fill-map-button").on('click', function () {
			console.log(clone.selectedElementData);
			
			if (clone.selectedElementData) {
				let counter = 0;
				for (let y = 0; y < clone.mapSize; y++) {
					for (let x = 0; x < clone.mapSize; x++) {
						clone.map[y][x] = clone.selectedElementData.id
						for(const [dir, filename] of Object.entries(clone.selectedElementData.textures)) {
							$(`#map_${counter}`).css('background-image', `url(./img/${clone.objectName}/${dir}/${filename[0]}.png)`);
							$(`#map_${counter}`).css('background-size', 'cover')
							$(this).css('border', 'none')
							if (typeof clone.selectedElementData.height != 'undefined' && clone.selectedElementData.height == 'big') $(this).css('border', '3px solid gray')
							break;
						}
						counter++;
					}
				}
			}
		});

		// FILL MAP BORDER BUTTON
		$("#fill-border-button").on('click', {selectedElementData: this.selectedElementData}, function (event) {
			if (clone.selectedElementData) {
				let counter = 0;
				for (let y = 0; y < clone.mapSize; y++) {
					for (let x = 0; x < clone.mapSize; x++) {
						if (x == 0 || x==clone.mapSize-1 || y==0 || y==clone.mapSize-1) {

							let dataInMap = clone.insertedOptions(clone, y, x)
							if(dataInMap) clone.map[y][x] = dataInMap;
							console.log('ezt írja bele:');
							console.log(dataInMap);

							for(const [dir, filename] of Object.entries(clone.selectedElementData.textures)) {
								$(`#map_${counter}`).css('background-image', `url(./img/${clone.objectName}/${dir}/${filename[0]}.png)`);
								$(`#map_${counter}`).css('background-size', 'cover')
								$(`#map_${counter}`).css('border', 'none')							
								if (typeof clone.selectedElementData.height != 'undefined' && clone.selectedElementData.height == 'big') $(`#map_${counter}`).css('border', '3px solid gray')
								break;
							}
						}
						counter++;
					}
				}
			} else {
				alert('Még nincsen adat a kurzorban!')
			}
		});

		// DESELECT BUTTON
		$("#deselect-button").on('click', function () {
			clone.selectedElementData = 0
		});

		// CLICK SAVE BUTTON
		$("#save-button").on('click', {levelData: this.levelData}, function (event) {
			event.data.levelData
			console.log('SAVE BUTTON Click:')
			event.data.levelData['map'] = clone.map

			console.log('Ezzt Küldi:')
			console.log(event.data.levelData);
			
			//const mapdata = JSON.stringify(event.data.levelData).replace(/\s+/g, '')
			const mapdata = JSON.stringify(event.data.levelData)

			if (clone.map.length != 0) {
				var xhr = new XMLHttpRequest()
				xhr.open("POST", "./save.php", true)
				xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded")
				xhr.send("mapdata=" + encodeURIComponent(mapdata))

				xhr.onreadystatechange = function() {
					if (xhr.readyState === 4 && xhr.status === 200) {
						console.log('A save.php válaszolt!');
						console.log(xhr.responseText);
						
						alert('Status: ' + xhr.status + ' Text: ' + xhr.responseText)
					}
				};
				console.log('Elküldtem a save.php-nak!');
			} else {
				console.log('ÜRES MÉG A MAP!');
			}
		});
	}

	resizer(mapSize, mapContainerWidth) {
		this.bricksize = Math.floor(mapContainerWidth / mapSize)

		$(".map-row").css('width', mapContainerWidth)
		$(".map-row").css('height', this.bricksize)

		$(".brick").css('width', this.bricksize)
		$(".brick").css('height', this.bricksize)
	}

	mapUpload(mapSize) {
		let counter = 0;
		for (let y = 0; y < mapSize; y++) {
			this.map[y] = [];
			let elementRow = document.createElement('div');
			elementRow.className = 'map-row';
			for (let x = 0; x < mapSize; x++) {	
				let element = document.createElement('div')
				element.className = 'brick'
				// element.innerText= counter
				element.style.width = this.bricksize + 'px'
				element.style.height = this.bricksize + 'px'
				element.setAttribute('map-y', y)
				element.setAttribute('map-x', x)
				element.setAttribute('id', 'map_' + counter)
				
				elementRow.appendChild(element)
				this.map[y][x] = 0
				counter++
			}
			document.querySelector(".map-container").appendChild(elementRow)
		}
	}

	getObjectNames(obj) {
		let textures = Object.values(obj)
		let textureDir = String(Object.values(Object.keys(textures[0].textures)))
		let textureName = String(Object.values(Object.values(textures[0].textures)[0]))
		return { textureDir: textureDir, textureName: textureName }
	}

	async loadMap(mapfileName) {
		const mapDataWait = await fetch(`./data/maps/${mapfileName}.JSON`);
		const mapData = await mapDataWait.json();
		console.log(mapData);

		await new Promise(resolve => setTimeout(resolve, 300));
		console.log('Eltelt');

		// load sky and floor
		if (typeof mapData.skys != 'undefined') this.levelData.skys = mapData.skys
		if (typeof mapData.floors != 'undefined') this.levelData.floors = mapData.floors
		this.selectedElementsBorderDraw(this)
		
		// Load walls
		for (let y = 0; y < this.map.length; y++) {
			for (let x = 0; x < this.map[0].length; x++) {
				let cellData = mapData.map[y][x]	// loaded data
				if(cellData) {
                    // Érték szerinti átadás
                    const wallValue = {...cellData}
                    this.map[y][x] = wallValue
					
                    let loadingTexture = this.walls.find(wall => wall !== null && wall.id == cellData.id);
					if (loadingTexture) {
						loadingTexture.dirName = 'walls'
						loadingTexture = {...loadingTexture, ...wallValue}
					}
					// if (!loadingTexture) {
					// 	loadingTexture = this.objects.find(object => object !== null && object.id == cellData.id);
					// 	if (loadingTexture) {
					// 		loadingTexture.dirName = 'objects'
					// 		loadingTexture = {...loadingTexture, ...wallValue}
					// 	}
					// }

					// Map container graphics
					if (loadingTexture) {
						for(const [dir, filename] of Object.entries(loadingTexture.textures)) {
							let mapBrickElment = $(".map-container").find(`[map-x='${x}'][map-y='${y}']`)
							mapBrickElment.css('background-image', `url(./img/${loadingTexture.dirName}/${dir}/${filename[0]}.png)`);
							mapBrickElment.css('background-size', 'cover')
							// delete loadingTexture.dirName
							mapBrickElment.css('border', 'none')
							if (typeof loadingTexture.height != 'undefined' && loadingTexture.height == 'big') mapBrickElment.css('border', '3px solid gray');
							break;
						}
					}
				}
			}
		}

		// load Sprites
		mapData.sprites.forEach(sprite => {
			let insertSprite = this.objects.find(obj => parseInt(obj.id) == parseInt(sprite.id))

			if (insertSprite) insertSprite.dirName = 'objects'
			if(typeof insertSprite != 'undefined') {
				let data = {}
				data.id = sprite.id
				for (const [key, value] of Object.entries(insertSprite)) data[key] = value;
				sprite = {...data, ...sprite}
			}

			// Map container graphics
			let y = Math.floor(sprite.y)
			let x = Math.floor(sprite.x)

			for(const [dir, filename] of Object.entries(insertSprite.textures)) {
				let mapBrickElment = $(".map-container").find(`[map-x='${x}'][map-y='${y}']`)
				mapBrickElment.css('background-image', `url(./img/${insertSprite.dirName}/${dir}/${filename[0]}.png)`);
				mapBrickElment.css('background-size', 'cover')
				break;
			}
		});
	}

	mapIconSize() {
		var clone = this
		$("#map-icon-size-button").on('click', function() {
			let dataSize = $(this).attr('data-size')
			if (dataSize == 'big') {
				$(this).text('Big Icons')
				$(this).attr('data-size', 'small')
				clone.resizer(64, 2000)
			} else {
				$(this).text('Small Icons')
				$(this).attr('data-size', 'big')
				clone.resizer(64, 4000)
			}
		});
	}

	loadInput(fileKey, fileValue) {
		// Action function
		function elementCreator(objectData, fileKey, fileValue) {

			let returnElement = `<div>Még nincsen megcsinálva! ${fileKey} ${fileKey}</div>`;

			if (objectData.inputType == 'null') returnElement = ``;

			if (objectData.inputType == 'hidden') {
				returnElement = `
				<input id="number_${fileKey}" name="${fileKey}" type="hidden" input-type="${objectData.inputType}" value="${fileValue}">`;
			}

			if (objectData.inputType == 'number') {
				returnElement = `
				<div class="data-title col-6 p-0 m-0"><span class="align-middle">${fileKey}:</span></div>
				<div class="data-data col-6 p-0 m-0"><input id="number_${fileKey}" name="${fileKey}" type="number" input-type="${objectData.inputType}" value="${fileValue}" min="0" max="5000" step="1" class="form-control form-control-sm"></div>`;
			}

			if (objectData.inputType == 'text') {
				returnElement = `
				<div class="data-title col-6 p-0 m-0"><span class="align-middle">${fileKey}:</span></div>
				<div class="data-data col-6 p-0 m-0"><input id="text_${fileKey}" name="${fileKey}" type="text" input-type="${objectData.inputType}" value="${fileValue}" id="text_${fileKey}" maxlength="50" class="form-control form-control-sm"></div>`;
			}

			if (objectData.inputType == 'array') {	// no modify
				returnElement = `
				<div class="data-title col-6 p-0 m-0"><span class="align-middle" input-type="${objectData.inputType}">${fileKey}:</span></div>
				<div class="data-data col-6 p-0 m-0">${fileValue}</div>`;
			}

			if (objectData.inputType == 'boolean') {
				function checkChecked(value) {
					if (fileValue == value) return ' selected'; else return '';
				}

				returnElement = `
				<div class="data-title col-6 p-0 m-0"><span class="align-middle">${fileKey}:</span></div>
				<div class="data-data col-6 p-0 m-0">
					<select id="boolean_${fileKey}" name="${fileKey}" input-type="${objectData.inputType}" class="form-control form-control-sm align-middle">
						<option value="false" ${checkChecked(false)}>false</option>
						<option value="true" ${checkChecked(true)}>true</option>
					</select>
				</div>`;
			}

			if (objectData.inputType == 'select') {
				function checkChecked(value) {
					if (fileValue == value) return ' selected'; else return '';
				}

				returnElement = `
				<div class="data-title col-6 p-0 m-0"><span class="align-middle">${fileKey}:</span></div>
				<div class="data-data col-6 p-0 m-0">
					<select id="select_${fileKey}" name="${fileKey}" input-type="${objectData.inputType}" class="form-control form-control-sm align-middle">`;
					for (const optionValue of objectData.values) {
						returnElement += `<option value="${optionValue}" ${checkChecked(optionValue)}>${optionValue}</option>`;
					}
					returnElement += `
					</select>
				</div>`;
			}
			return returnElement;
		}

		for (const [objKey, object] of Object.entries(this.objectDataTypes)) {
			if(fileKey == object.name) {
				return elementCreator(object, fileKey, fileValue)
			}
		}
		return '';
	}

	loadElementsDatas(textures) {
		let data = {}
		if (typeof textures !='undefined' || typeof textures != null) data.textures = textures
		$(`#selected-container`).find("input, select").each(function() {
			let name = $(this).attr('name')
			let value = $(this).val()
			let inputType = $(this).attr('input-type')
			
			// appropiate value format
			if (inputType == 'number') value = parseInt(value)
			else if (inputType == 'text') value = String(value)
			else if (inputType == 'boolean') if (value == 'true') value = true; else value = false;
			else if (inputType == 'array') value = toArray(value)
			
			data[name] = value
		});

		if(data.id) data.id = parseInt(data.id)

		this.selectedElementData = data

		console.log('------------------');
		console.log(this.selectedElementData)
		console.log('------------------');
	}

	async loadTextures() {
		var clone = this

		const loadData = await fetch("./data/objectdatatypes.JSON");
        this.objectDataTypes = await loadData.json()

		// Action function
		async function loadAction(name) {
			let connectFile = await fetch(`./data/${name}/${name}.JSON`)
			let fileData = await connectFile.json()

			function checkPicType(fileName) {
				if (fileName.includes('sky')) return '-sky';
				if (fileName.includes('ceiling')) return '-ceiling';
				if (fileName.includes('floor')) return '-floor';
				if (fileName.includes('wall')) return '-wall';
				if (fileName.includes('object')) return '-object';
			}

			let elements = `
			<div class="tools-title p-0 m-0">
				<h4>${name.toUpperCase()} Textures</h4>
			</div>
			<div class="p-0 px-1 m-0">
				<div class="textures-pic-container textures-pic-container_${name} p-0 m-0 mt-2">`;
					fileData.forEach((textureArray, index) => {
						for(const[key, value] of Object.entries(textureArray.textures)) {
							elements += `<img src="./img/${name}/${key}/${value[0]}.png" alt="${value[0]}" class="list-pic${checkPicType(value[0])} p-0 m-0 me-2 mb-2 border border-primary border-0" data-name="${name}" data-index="${index}" data-filename="${value[0]}" id="selected-${name}_${index}">`;
						}
					});					
				elements+= `</div>
			</div>`;
			$("#textures-list").append(elements);

			return fileData;
		}
		
		// Load textures
		this.walls = await loadAction('walls')
		this.objects = await loadAction('objects')
		this.skys = await loadAction('skys')
		this.floors = await loadAction('floors')

		console.log(this.walls);
		

		clone.clickTexture(clone)
	}

	clickTexture(clone) {
		// CLICK SELECTING TEXTURES
		var clone = this
		$("[id^='selected-']").on('click', function() {

			const elementName = $(this).attr('data-name')
			const elementFileName = $(this).attr('data-filename')
			const elementIndex = $(this).attr('data-index')

			clone.objectName = elementName

			// SKYS
			if(elementName == 'skys' || elementName == 'floors') {
				$(`.textures-pic-container_${elementName}`).find('img').addClass('border-0')
				$(this).removeClass('border-0').addClass('border-2')

				if (!clone.levelData[elementName]) clone.levelData[elementName]

				clone.levelData[elementName] = []
				clone.levelData[elementName].push(clone[elementName][elementIndex])
				
				return;
			}

			// WALLS, OBJECTS
			$("[id^='selected-']").each(function() { $(this).addClass('border-0'); })
			$(this).removeClass('border-0').addClass('border-2');

			let fileData = []

			if (elementName == 'walls') fileData = clone.walls;
			if (elementName == 'objects') fileData = clone.objects;

			let selectedElements = `
			<div id="selected-container" class="p-0 m-0 px-1">
				<div class="p-2 m-0 texture-class_ border border-secondary">
					<h6 class="text-white text-start"><strong>Name: </strong>${Object.values(fileData[elementIndex].textures)[0]}</h6>
					<hr class="p-0 my-2 border-white">
					<div class="textures-pic-container">
						<div id="" class="textures-pic">`;
						for(const[key, value] of Object.entries(fileData[elementIndex].textures)) {
							value.forEach(textureName => {
								selectedElements +=	`<img src="./img/${elementName}/${key}/${textureName}.png" alt="${textureName}" class="list-pic p-0 m-0 me-2 mb-2" data-name="${textureName}" data-index="${elementIndex}" data-key="${key}" data-texturename="${textureName}">`;
							});
						}
						selectedElements += `</div>
					</div>`;

					selectedElements += `
					<div class="texture-data text-white">
						<div class="row data-line p-0 m-0">`;
							for(const [fileKey, fileValue] of Object.entries(fileData[elementIndex])) {
								let loadInput = clone.loadInput(fileKey, fileValue)
								selectedElements += loadInput
							}
							selectedElements += `
						</div>
					</div>
				</div>
			</div>`;

			$(`#textures-selected`).html('')
			$(`#textures-selected`).append(selectedElements)

			clone.selectedElementsBorderDraw(clone)
						
			clone.loadElementsDatas(fileData[elementIndex].textures)
		});
	}

	selectedElementsBorderDraw(clone) {
		if (typeof clone.levelData.skys != 'undefined') {
			let names = clone.getObjectNames(clone.levelData.skys)			
			$(`img[src*='${names.textureDir}/${names.textureName}']`).removeClass('border-0').addClass('border-2')
		}
		
		if (typeof clone.levelData.floors != 'undefined') {
			let names = clone.getObjectNames(clone.levelData.floors)			
			$(`img[src*='${names.textureDir}/${names.textureName}']`).removeClass('border-0').addClass('border-2')
		}
	}
}

const editor = new Editor()