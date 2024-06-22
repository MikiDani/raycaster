class Editor {
	objectDataTypes;
	skys;
	floors;
	walls;
	blocks;
	objects;
	selectedElementData;
	objectName;
	effects;
	constructor (mapList) {
		this.mapList = mapList

		console.log(this.mapList);
		
		this.mapSize = 64
		this.mapContainerWidth = 4000
		this.levelDataBasic = {
			"shadow": 160,
			"player": {
				"y": 1.5,
				"x": 1.5,
				"angle": 0,
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
		this.mapfileName = ''
		this.levelData = this.levelDataBasic
		this.map = []
		this.skys = []
		this.floors = []
		this.walls = []
		this.blocks = []
		this.objects = []
		this.creatures = []
		this.effects = []

		this.objectName = null
		// ---------------
		$(window).on('resize', this.resizer(this.mapSize, this.mapContainerWidth))
		this.mapUpload(this.mapSize)
		this.resizer(this.mapSize, this.mapContainerWidth)
		this.mapIconSize()
		// ----------------
		this.loadTextures()
		this.loadMap(mapList[0])
		this.buttonOptions()
	}

	drawPlayer(y, x, angle, mode) {
		let mY = Math.floor(y)
		let mX = Math.floor(x)
		let mapBrick = $(".map-container").find(`[id^='map_'][map-y='${mY}'][map-x='${mX}']`);
		
		if (mode == 'draw') {
			mapBrick.css('background-image', `url(./img/editor/player-${angle}.png)`);
			mapBrick.css('background-size', 'cover')
			mapBrick.css('border', 'none')
		}

		if (mode == 'delete') {
			mapBrick.css("background-image","").css("background-size", "").css("border", "");
		}
	}

	insertedOptions(clone, y, x) {
		let data = {}
		let insertType = ''
		let insertObject = clone.walls.find(wall => parseInt(wall.id) == parseInt(clone.selectedElementData.id))	
		if (insertObject) insertType = 'wall'
		if (!insertObject) {
			insertObject = clone.objects.find(object => parseInt(object.id) == parseInt(clone.selectedElementData.id))
			if (insertObject) {
				insertType = 'object'
				data.y = parseInt(y) + 0.5
				data.x = parseInt(x) + 0.5
			}
			if (!insertObject) {
				insertObject = clone.blocks.find(block => parseInt(block.id) == parseInt(clone.selectedElementData.id))
				if (insertObject) {
					insertType = 'block'
					data.y = parseInt(y) + 0.5
					data.x = parseInt(x) + 0.5
				}
			}
			if (!insertObject) {
				insertObject = clone.creatures.find(creature => parseInt(creature.id) == parseInt(clone.selectedElementData.id))
				if (insertObject) {
					insertType = 'creature'
					data.y = parseInt(y) + 0.5
					data.x = parseInt(x) + 0.5
				}
			}
			if (!insertObject) {
				insertObject = clone.effects.find(effect => parseInt(effect.id) == parseInt(clone.selectedElementData.id))
				if (insertObject) {
					insertType = 'effect'
					data.y = parseInt(y)
					data.x = parseInt(x)
				}
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

	clearMapCordinate(y, x) {
		let mY = Math.floor(y)
		let mX = Math.floor(x)
		// Map delete		
		this.map[mY][mX] = 0
		// Sprite delete
		let findSpriteIndex = this.levelData.sprites.findIndex(sprite => y == Math.floor(sprite.y) && x == Math.floor(sprite.x))
		if (findSpriteIndex !== -1) this.levelData.sprites.splice(findSpriteIndex, 1)
	}

	clickedBgDrawing(element, time, color) {
		element.css({"background-image": "", "background-size": "" });
		element.css('background-color', color)
		setTimeout(function() {
			element.css('background-color', '#0a0a0a')
			element.addClass('brick')
		}, time);
	}

	drawMessage = function(message, color) {
		$("#filename-message").html(`<span class='text-${color}'>${message}</span>`)
		$("#filename-message").show()
		setTimeout(() => {
			$("#filename-message").text('')
			$("#filename-message").hide(200)
		}, 2000);
	}

	async clearMap(clone) {
		for (let y = 0; y < clone.mapSize; y++) {
			for (let x = 0; x < clone.mapSize; x++) {
				clone.map[y][x] = 0
				let findSpriteIndex = clone.levelData.sprites.findIndex(sprite => y == Math.floor(sprite.y) && x == Math.floor(sprite.x))
				if (findSpriteIndex !== -1) clone.levelData.sprites.splice(findSpriteIndex, 1)
									
				let mapBrickElment = $(".map-container").find(`[map-x='${x}'][map-y='${y}']`)
				mapBrickElment.css("background-image","").css("background-size", "").css("border", "");
			}
		}
		clone.levelData = []
		clone.levelData.sprites = []
		clone.levelData.player = clone.levelDataBasic.player

		console.log('deleted all!');
		console.log(clone.levelData);
	}

	buttonOptions() {
		var clone = this

		$("#shadow-input").on('input', {leveldata: this.levelData}, function (event) {
			var leveldata = event.data.leveldata			
			console.log('regi: ' + leveldata.shadow);
			leveldata.shadow = $(this).val()
			console.log('új: ' + leveldata.shadow);
			$("#shadow-input-value").html($(this).val())
		});

		// LOAD DATAS IN VARIABLE WHEN CLICKED TEXTURE	
		$("#textures-selected").on('input', () => this.loadElementsData(this.selectedElementData.textures))
		////////////////////////////////
		// 			CLICK MAP
		////////////////////////////////
		$("[id^='map_']").on('click', function() {
			let y = $(this).attr('map-y')
			let x = $(this).attr('map-x')
			
			if (clone.selectedElementData) {
				
				// IF Player selected
				if (clone.selectedElementData.player) {
					let newAngle = clone.selectedElementData.playerAngle
					
					// old place
					clone.clearMapCordinate(clone.levelData.player.y, clone.levelData.player.x)
					clone.drawPlayer(clone.levelData.player.y, clone.levelData.player.x, null, 'delete')
					// new place
					clone.clearMapCordinate(y, x)
					
					clone.levelData.player.y = parseInt(y) + 0.5
					clone.levelData.player.x = parseInt(x) + 0.5
					clone.levelData.player.angle = newAngle

					clone.drawPlayer(y, x, newAngle, 'draw')

					clone.selectedElementData = null
					
					return;
				}

				if (clone.selectedElementData.mode == 'exit') {
					let mapElement = $("div.brick[style*='direction-exit.png']");
					let searchExit = clone.levelData.sprites.filter(sprite => sprite.mode == 'exit');

					if (searchExit.length != 0 || mapElement.length > 0) {
						alert('The exit is already placed!')
						return;
					}
				}
			}

			// Player dont deleting
			if (y == Math.floor(clone.levelData.player.y) && x == Math.floor(clone.levelData.player.x)) return;

			if (clone.selectedElementData) {
				
				clone.clickedBgDrawing($(this), 200, '#00800077')
				
				if (clone.selectedElementData.type == 'effect') {
					let imgVal
					if (clone.selectedElementData.mode == 'direction') imgVal = clone.selectedElementData.angle
					if (clone.selectedElementData.mode == 'exit') imgVal = clone.selectedElementData.mode

					$(this).css('background-image', `url(./img/editor/direction-${imgVal}.png)`);
					$(this).css('background-size', 'cover')
				} else {
					for(const [dir, filename] of Object.entries(clone.selectedElementData.textures)) {
						$(this).css('background-image', `url(./img/${clone.objectName}/${dir}/${filename[0]}.png)`);
						$(this).css('background-size', 'cover')
						$(this).css('border', 'none')

						console.log(clone.selectedElementData.mode);
						console.log($(this));
						
						if (clone.selectedElementData.mode == 'secret') $(this).css('border', '3px solid white')
						if (typeof clone.selectedElementData.height != 'undefined' && clone.selectedElementData.height == 'big') $(this).css('border', '3px solid gray')
						break;
					}
				}

				let insertedData = clone.insertedOptions(clone, y, x)

				function insertBlockFrame(clone, y, x, angle) {
					function deleteMap(clone, y,x) {
						clone.map[y][x] = 0;
					} 
					function deleteSprite(clone, y,x) {
						let findSpriteIndex = clone.levelData.sprites.findIndex(sprite => y == Math.floor(sprite.y) && x == Math.floor(sprite.x))
						if (findSpriteIndex !== -1) clone.levelData.sprites.splice(findSpriteIndex, 1)
					}
					function drawTexture(clone, y, x, obj) {
						let loadingTexture = clone.walls.find(wall => wall.id == obj.id)						
						let mapBrick = $(".map-container").find(`[id^='map_'][map-y='${y}'][map-x='${x}']`);
						
						for(const [dir, filename] of Object.entries(loadingTexture.textures)) {
							mapBrick.css('background-image', `url(./img/walls/${dir}/${filename[0]}.png)`);
							mapBrick.css('background-size', 'cover')
							mapBrick.css('border', 'none')
							if (typeof loadingTexture.height != 'undefined' && loadingTexture.height == 'big') $(this).css('border', '3px solid gray')
							break;
						}
					}

					if (angle == 90) {
						if (typeof clone.map[y][x-1] != undefined)
							deleteMap(clone, y, x-1); deleteSprite(clone, y, x-1); clone.map[y][x-1] = {id:5}; drawTexture(clone, y, x-1, {id:5});
						
						if (typeof clone.map[y][x+1] != undefined)
							deleteMap(clone, y, x+1); deleteSprite(clone, y, x+1); clone.map[y][x+1] = {id:5}; drawTexture(clone, y, x+1, {id:5});
					}

					if (angle == 0) {
						if (typeof clone.map[y-1][x] != undefined)
							deleteMap(clone, y-1, x); deleteSprite(clone, y-1, x); clone.map[y-1][x] = {id:5}; drawTexture(clone, y-1, x, {id:5});
						
						if (typeof clone.map[y+1][x] != undefined)
							deleteMap(clone, y+1, x); deleteSprite(clone, y+1, x); clone.map[y+1][x] = {id:5}; drawTexture(clone, y+1, x, {id:5});
					}
				}

				if (insertedData && insertedData.insertType == 'wall') {
					delete insertedData.insertType
					// if have delete sprite
					let findSpriteIndex = clone.levelData.sprites.findIndex(sprite => y == Math.floor(sprite.y) && x == Math.floor(sprite.x))
					if (findSpriteIndex !== -1) clone.levelData.sprites.splice(findSpriteIndex, 1)
					// insert wall
					clone.map[y][x] = insertedData.data;
				}
				if (insertedData && (insertedData.insertType == 'object' || insertedData.insertType == 'block' || insertedData.insertType == 'creature' || insertedData.insertType == 'effect')) {
					if (insertedData.insertType == 'block') insertBlockFrame(clone, Math.floor(insertedData.data.y), Math.floor(insertedData.data.x), clone.selectedElementData.angle)
					delete insertedData.insertType
					delete insertedData.dirName
					
					// if have delete sprite
					let findSpriteIndex = clone.levelData.sprites.findIndex(sprite => y == Math.floor(sprite.y) && x == Math.floor(sprite.x))
					if (findSpriteIndex !== -1) clone.levelData.sprites.splice(findSpriteIndex, 1)
					// if have delete map
					clone.map[y][x] = 0;
					// insert sprite
					clone.levelData.sprites.push(insertedData.data);
				}

				// console.log('ezt írja bele:')
				// console.log(insertedData.data)
			} else {
				clone.drawMessage('No have selected anything!', 'warning')
			}
		});

		// RIGHT CLICK
		$(document).on('contextmenu', (event) => event.preventDefault())
				
		$(".map-container").find("[id^='map_']").on('mousedown', { levelData: this.levelData }, function(event) {	
			let levelData = event.data.levelData
			event.preventDefault()

			// RIGHT MOUSE CLICK
			if (event.which == 3) {
				let y = $(this).attr('map-y')
				let x = $(this).attr('map-x')
				
				// Map delete
				clone.map[y][x] = 0

				$(this).css("background-image","").css("background-size", "").css("border", "");
				clone.clickedBgDrawing($(this), 200, '#ff000077')

				// Sprite delete
				let findSpriteIndex = levelData.sprites.findIndex(sprite => y == Math.floor(sprite.y) && x == Math.floor(sprite.x))
				if (findSpriteIndex !== -1) levelData.sprites.splice(findSpriteIndex, 1)
				
				clone.drawPlayer(clone.levelData.player.y, clone.levelData.player.x, clone.levelData.player.angle, 'draw')
			}
		});
				
		// DELETE ALL MAP
		$("#delete-all-button").on('click', async function () {
			await clone.clearMap(clone)
		});

		// FILL MAP BORDER BUTTON
		$("#fill-border-button").on('click', function () {
			if (clone.selectedElementData) {
				let counter = 0;
				for (let y = 0; y < clone.mapSize; y++) {
					for (let x = 0; x < clone.mapSize; x++) {
						if (x == 0 || x==clone.mapSize-1 || y==0 || y==clone.mapSize-1) {

							let dataInMap = clone.insertedOptions(clone, y, x)
							// insert map
							if(dataInMap) clone.map[y][x] = dataInMap.data;
							// if have sprite delete
							let findSpriteIndex = clone.levelData.sprites.findIndex(sprite => y == Math.floor(sprite.y) && x == Math.floor(sprite.x))
							if (findSpriteIndex !== -1) clone.levelData.sprites.splice(findSpriteIndex, 1)

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
				this.drawMessage('No have data in cursor!', 'warning')
			}
		});

		// CLICK SAVE BUTTON
		$("#save-button").on('click', {levelData: this.levelData}, function (event) {
			event.data.levelData
			event.data.levelData['map'] = clone.map
			if (clone.map.length != 0) {

				console.log('Ezzt Küldi:')
				console.log(event.data.levelData);
				
				let filename = $("input[name='filename']").val()

				if (filename.length > 0) {
					const mapdata = JSON.stringify(event.data.levelData)
					
					var removeAfterDot = function (str) {
						const dotIndex = str.indexOf('.');
						if (dotIndex !== -1) return str.substring(0, dotIndex);
						return str;
					}

					filename = removeAfterDot(filename)
					$("input[name='filename']").val(filename)
				
					var xhr = new XMLHttpRequest()
					xhr.open("POST", "./save.php", true)
					xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded")
					var dataToSend = "mapdata=" + encodeURIComponent(mapdata) + "&filename=" + encodeURIComponent(filename);
					xhr.send(dataToSend)
					xhr.onreadystatechange = function() {
						if (xhr.readyState === 4 && xhr.status === 200) {
							// console.log(xhr.responseText);
							let color = (xhr.status == 200) ? 'success' : 'danger';
							clone.drawMessage(xhr.responseText, color)
						}
					};
				} else clone.drawMessage('No have filename!', 'danger')
			} else clone.drawMessage('The map is empty!', 'danger');
		});

		// CLICK LOAD BUTTON
		$("#load-button").on('click', async function () {

			await clone.clearMap(clone)

			clone.levelData = [];
						
			let filename = $("input[name='filename']").val()

			if (filename.length > 0) {
				clone.levelData = clone.levelDataBasic

				for (let y = 0; y < clone.mapSize; y++) {
					for (let x = 0; x < clone.mapSize; x++) {						
						let mapBrickElment = $(".map-container").find(`[map-x='${x}'][map-y='${y}']`)
						mapBrickElment.css("background-image","").css("background-size", "").css("border", "");
					}
				}

				clone.loadMap(filename)
				
			} else clone.drawMessage('No have filename!', 'danger')
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

	async clickMapnameLoad(clone, filename) {

		await clone.clearMap(clone)

		clone.levelData = [];

		if (filename.length > 0) {
			clone.levelData = clone.levelDataBasic

			for (let y = 0; y < clone.mapSize; y++) {
				for (let x = 0; x < clone.mapSize; x++) {						
					let mapBrickElment = $(".map-container").find(`[map-x='${x}'][map-y='${y}']`)
					mapBrickElment.css("background-image","").css("background-size", "").css("border", "");
				}
			}

			clone.loadMap(filename)
			
		} else clone.drawMessage('No have filename!', 'danger')
	}


	async loadMap(mapfileName) {
		async function fetchMapData(mapfileName) {
			try {
				const mapDataWait = await fetch(`./data/maps/${mapfileName}.json`);
				
				if (!mapDataWait.ok) {
					throw new Error(`HTTP error! status: ${mapDataWait.status}`);
				}
				
				const mapData = await mapDataWait.json();
				return mapData;
			} catch (error) {
				throw('Error fetching map data:', error);
			}
		}

		var clone = this

		var mapData = null;

		fetchMapData(mapfileName)
		.then(mapDataLoaded => {
			if (mapDataLoaded) {
				console.log('Map data EZ:', mapDataLoaded);
				mapData = mapDataLoaded
				this.mapfileName = mapfileName
			} else {
				return ('Map file not found or another error occurred.');
			}
		});

		// const mapDataWait = await fetch(`./data/maps/${mapfileName}.JSON`)
		// const mapData = await mapDataWait.json()

		await new Promise(resolve => setTimeout(resolve, 300))

		console.log('Eltelt')

		$("input[name='filename']").val(mapfileName)
		$("#map-selector").html('')

		this.mapList.forEach((mapName, index) => {
			let ifChecked = (mapName == mapfileName) ? 'checked' : '';
			let element = 
			`<div class="form-check">
				<input id="mapselector_${index}" class="form-check-input" name="mapselector" type="radio" value="${mapName}" ${ifChecked}>
				<label class="form-check-label">${mapName}</label>
			</div>`;

			$("#map-selector").append(element)

			$(`#mapselector_${index}`).on('click', function() {
				var loadMapName = $(this).val()
				let result = confirm('Are you sure you want to load the "' + loadMapName + '" map?');
				if (result) {
					clone.clickMapnameLoad(clone, loadMapName)
				} else {
					$("#map-selector").find('input').each(function() {
						if ($(this).val() == clone.mapfileName) $(this).prop('checked', true)
					});
				}
			});
		});



		// LOADING SUCCESS
		this.levelData.player.y = mapData.player.y
		this.levelData.player.x = mapData.player.x
		this.levelData.player.angle = mapData.player.angle
		this.levelData.shadow = mapData.shadow

		$("#shadow-input-value").text(this.levelData.shadow)

		this.drawPlayer(this.levelData.player.y, this.levelData.player.x, this.levelData.player.angle, 'draw')

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

					// Map container graphics
					if (loadingTexture) {
						for(const [dir, filename] of Object.entries(loadingTexture.textures)) {
							let mapBrickElment = $(".map-container").find(`[map-x='${x}'][map-y='${y}']`)
							mapBrickElment.css('background-image', `url(./img/${loadingTexture.dirName}/${dir}/${filename[0]}.png)`);
							mapBrickElment.css('background-size', 'cover')
							// delete loadingTexture.dirName
							mapBrickElment.css('border', 'none')
							if (loadingTexture.mode == 'secret') mapBrickElment.css('border', '3px solid white')
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
			if (insertSprite) {
				insertSprite.dirName = 'objects';
			} else {
				insertSprite = this.blocks.find(block => parseInt(block.id) == parseInt(sprite.id))
				if (insertSprite) {
					insertSprite.dirName = 'blocks';
				} else {
					insertSprite = this.creatures.find(creatures => parseInt(creatures.id) == parseInt(sprite.id))
					if (insertSprite) {
						insertSprite.dirName = 'creatures';
					} else {
						insertSprite = this.effects.find(effects => parseInt(effects.id) == parseInt(sprite.id))
						if (insertSprite) {
							insertSprite.dirName = 'effects';
						}
					}
				} 
			}
						
			if (insertSprite) {
				let data = {}
				data.id = sprite.id

				for (const [key, value] of Object.entries(insertSprite)) data[key] = value;
				sprite = {...data, ...sprite}

				this.levelData.sprites.push(sprite)
			}
			
			// Map container graphics
			let y = Math.floor(sprite.y)
			let x = Math.floor(sprite.x)

			if (sprite.type == 'effect') {
				let imgVal
				if (sprite.mode == 'direction') imgVal = sprite.angle
				if (sprite.mode == 'exit') imgVal = sprite.mode

				let mapBrickElment = $(".map-container").find(`[map-x='${x}'][map-y='${y}']`)
				mapBrickElment.css('background-image', `url(./img/editor/direction-${imgVal}.png)`);
				mapBrickElment.css('background-size', 'cover')
			} else {
				for(const [dir, filename] of Object.entries(insertSprite.textures)) {				
					let mapBrickElment = $(".map-container").find(`[map-x='${x}'][map-y='${y}']`)
					mapBrickElment.css('background-image', `url(./img/${insertSprite.dirName}/${dir}/${filename[0]}.png)`);
					mapBrickElment.css('background-size', 'cover')
					break;
				}
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

	loadInput(fileKey, fileValue, elementName) {
		// Action function
		function elementCreator(objectData, fileKey, fileValue) {
			let returnElement;
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
				<div class="data-data col-6 p-0 m-0"><input id="text_${fileKey}" name="${fileKey}" type="text" input-type="${objectData.inputType}" value="${fileValue}" id="text_${fileKey}" class="form-control form-control-sm"></div>`;
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
				
				let checkDisabled = (fileKey == 'type') ? 'disabled' : '';
				let checkBg = (fileKey == 'type') ? 'bg-disabled' : '';

				returnElement = `
				<div class="data-title col-6 p-0 m-0"><span class="align-middle">${fileKey}:</span></div>
				<div class="data-data col-6 p-0 m-0">
					<select id="select_${fileKey}" name="${fileKey}" input-type="${objectData.inputType}" class="form-control form-control-sm align-middle ${checkBg}" ${checkDisabled}>`;
					for (const optionValue of objectData[elementName]) {
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

	loadElementsData(textures) {
		if (typeof this.selectedElementData != 'undefined' && this.selectedElementData != null
			&& typeof this.selectedElementData.player != 'undefined') return;	// Ha Player akkor már van benne adat

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

		if (data.id) data.id = parseInt(data.id)
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
				if (fileName.includes('wall') || fileName.includes('door')) return '-wall';
				if (fileName.includes('sky')) return '-sky';
				if (fileName.includes('ceiling')) return '-ceiling';
				if (fileName.includes('floor')) return '-floor';
				if (fileName.includes('block')) return '-block';
				if (fileName.includes('object')) return '-object';
				if (fileName.includes('creature')) return '-creature';
			}

			let elements = `
			<div class="tools-title p-0 m-0">
				<h4>${name.toUpperCase()} Textures</h4>
			</div>
			<div class="p-0 px-1 m-0">
				<div class="textures-pic-container textures-pic-container_${name} p-0 m-0 mt-2">`;
					fileData.forEach((textureArray, index) => {
						for(const[key, value] of Object.entries(textureArray.textures)) {	
							if (key == 'color') return;
							elements += `<img src="./img/${name}/${key}/${value[0]}.png" alt="${value[0]}" class="list-pic${checkPicType(value[0])} p-0 m-0 me-2 mb-2 border border-primary border-0" data-name="${name}" data-index="${index}" data-filename="${value[0]}" id="selected-${name}_${index}">`;
						}
					});					
				elements+= `</div>
			</div>`;
			$("#textures-list").append(elements);

			return fileData;
		}
		// Load Menu Elements
		this.loadMenuPlayer('Player orientation', 'player', false)
		
		// Load textures
		this.walls = await loadAction('walls')
		this.blocks = await loadAction('blocks')
		this.objects = await loadAction('objects')
		this.creatures = await loadAction('creatures')

		let effectsFile = await fetch(`./data/effects/effects.JSON`)
		clone.effects = await effectsFile.json()
		this.loadMenuPlayer('Creatures walking direction', 'direction', true)

		this.skys = await loadAction('skys')
		this.floors = await loadAction('floors')

		clone.clickTexture(clone)
	}

	loadMenuPlayer(title, name, exitOn) {
		let angles = (exitOn) ? [0, 90, 180, 270, 'exit'] : [0, 90, 180, 270];
		let newElement = `
		<div class="tools-title p-0 m-0">
			<h4>${title}</h4>
		</div>
		<div class="p-0 px-1 m-0">
			<div class="textures-pic-container textures-pic-container_${name} p-0 m-0 mt-2">`
			angles.forEach(angle => {
				newElement += `
				<img src="./img/editor/${name}-${angle}.png" alt="${name}-${angle}" data-angle="${angle}" data-${name}="true" class="list-pic-${name} p-0 m-0 me-2 mb-2 border border-primary border-0" data-name="${name}-${angle}" data-filename="${name}-${angle}.png" id="selected-${name}">`;
			});
			newElement += `
			</div>
		</div>`;
		$("#textures-list").append(newElement);
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

			// Effects
			if (elementName.includes('direction-')) {				
				if (elementName.includes('-0')) clone.selectedElementData = clone.effects.filter(effect => (effect.id == '2000'));
				else if (elementName.includes('-90')) clone.selectedElementData = clone.effects.filter(effect => (effect.id == '2005'));
				else if (elementName.includes('-180')) clone.selectedElementData = clone.effects.filter(effect => (effect.id == '2010'));
				else if (elementName.includes('-270')) clone.selectedElementData = clone.effects.filter(effect => (effect.id == '2015'));
				else if (elementName.includes('-exit')) clone.selectedElementData = clone.effects.filter(effect => (effect.id == '2020'));
				
				clone.selectedElementData = clone.selectedElementData[0]

				console.log(clone.selectedElementData);
				
				return;
			}

			// PLAYER ORIENTATION
			if ($(this).attr('data-player') == 'true') {
				let playerAngle = $(this).attr('data-angle')

				clone.selectedElementData = {
					'player': true,
					'playerAngle': playerAngle
				}
				return;
			}

			// WALLS, OBJECTS
			$("[id^='selected-']").each(function() { $(this).addClass('border-0'); })
			$(this).removeClass('border-0').addClass('border-2');
			
			let fileData = []

			console.log('-----------');
			console.log(elementName);
			
			if (elementName == 'walls') fileData = clone.walls;
			if (elementName == 'objects') fileData = clone.objects;
			if (elementName == 'blocks') fileData = clone.blocks;
			if (elementName == 'creatures') fileData = clone.creatures;
			
			var selectedElements = `
			<div id="selected-container" class="p-0 m-0 px-1">
				<div class="p-2 m-0 texture-class_ border border-secondary">
					<span class="text-white text-start"><strong>Name: </strong>`;
					
					Object.values(fileData[elementIndex].textures)[0].forEach(name => {
						selectedElements += `<span>${name}, </span>`;
					});
					
					selectedElements += `</span>
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
								let loadInput = clone.loadInput(fileKey, fileValue, elementName)
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
						
			clone.loadElementsData(fileData[elementIndex].textures)
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

import MapDataClass from './mapdata-class.js';

const mapdataClass = new MapDataClass({texturesClass: null});
let mapList = mapdataClass.maps

const editor = new Editor(mapList)