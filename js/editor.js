class Editor {
	objectDataTypes;
	walls;
	objects;
	selectedElementData;
	objectName;
	constructor () {
		this.mapSize = 64
		this.mapContainerWidth = 4000
		this.map = []
		this.walls = null
		this.objects = null
		this.objectName = null
		// ---------------
		$(window).on('resize', this.resizer(this.mapSize, this.mapContainerWidth))
		this.mapUpload(this.mapSize)
		this.resizer(this.mapSize, this.mapContainerWidth)
		this.mapIconSize()
		// ----------------
		this.loadTextures()

		this.buttonOptions()
	}

	buttonOptions() {
		var clone = this

		// LOAD DATAS IN VARIABLE WHEN CLICKED TEXTURE
		$("#textures-selected").on('input', () => this.loadElementsDatas(this.selectedElementData.textures))

		// CLICK MAP
		$("[id^='map_']").on('click', function() {
			if (clone.selectedElementData) {
				let y = $(this).attr('map-y')
				let x = $(this).attr('map-x')

				for(const [dir, filename] of Object.entries(clone.selectedElementData.textures)) {
					$(this).css('background-image', `url(./img/${clone.objectName}/${dir}/${filename[0]}.png)`);
					$(this).css('background-size', 'cover')
					break;
				}

				let wallObj = clone.walls.find(obj => parseInt(obj.id) == parseInt(clone.selectedElementData.id))
				
				if(typeof wallObj != 'undefined') {
					let dataInMap = {}
					dataInMap.id = clone.selectedElementData.id

					for(const [key, value] of Object.entries(wallObj)) {
						if (key !== 'textures' && key !== 'anim_function') {
							if (String(value) !== String(clone.selectedElementData[key]))
								dataInMap[key] = clone.selectedElementData[key]
						}
					}
					clone.map[y][x] = dataInMap
				}				
			}
		});

		// FILL MAP BUTTON
		$("#fill-map-button").on('click', function () {
			
			console.log(clone.selectedElementData);
			
			if (clone.selectedElementData) {
				console.log('ITT!!!');
				
				let counter = 0;
				for (let y = 0; y < clone.mapSize; y++) {
					for (let x = 0; x < clone.mapSize; x++) {
						clone.map[y][x] = clone.selectedElementData.id
						for(const [dir, filename] of Object.entries(clone.selectedElementData.textures)) {
							$(`#map_${counter}`).css('background-image', `url(./img/${clone.objectName}/${dir}/${filename[0]}.png)`);
							$(`#map_${counter}`).css('background-size', 'cover')
							break;
						}
						counter++;
					}
				}
			}
		});

		// CLICK SAVE BUTTON
		$("#save-button").on('click', function () {
			console.log('SAVE BUTTON Click:')
			console.log(clone.map);
			const mapdata = JSON.stringify(clone.map); // JSON formátumba konvertálás

			if (clone.map.length !== 0) {
				var xhr = new XMLHttpRequest();
				xhr.open("POST", "./save.php", true);
				xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
				xhr.send("mapdata=" + encodeURIComponent(mapdata));

				xhr.onreadystatechange = function() {
					if (xhr.readyState === 4 && xhr.status === 200) {
						console.log('A save.php válaszolt!');
						alert(xhr.responseText)
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
				// let r = Math.floor(Math.random() * 155)
				// let g = Math.floor(Math.random() * 125)
				// let b = Math.floor(Math.random() * 155)
	
				let element = document.createElement('div')
				element.className = 'brick'
				// element.style.backgroundColor = 'rgb('+r+','+g+','+b+')'
				// element.innerText= counter
				element.style.width = this.bricksize + 'px'
				element.style.height = this.bricksize + 'px'
				element.setAttribute('map-y', y)
				element.setAttribute('map-x', x)
				element.setAttribute('id', 'map_' + counter)
				
				elementRow.appendChild(element)
				this.map[y][x] = null
				counter++
			}
			document.querySelector(".map-container").appendChild(elementRow)
		}
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

		function elementCreator(objectData, fileKey, fileValue) {

			let returnElement = `<div>Még nincsen megcsinálva! ${fileKey} ${fileKey}</div>`;

			if (objectData.inputType == 'null') returnElement = ``; 

			if (objectData.inputType == 'hidden') {
				returnElement = `
				<input id="number_${fileKey}" name="${fileKey}" type="hidden" value="${fileValue}">`;
			}

			if (objectData.inputType == 'number') {
				returnElement = `
				<div class="data-title col-6 p-0 m-0"><span class="align-middle">${fileKey}:</span></div>
				<div class="data-data col-6 p-0 m-0"><input id="number_${fileKey}" name="${fileKey}" type="number" value="${fileValue}" min="0" max="5000" step="1" class="form-control form-control-sm"></div>`;
			}

			if (objectData.inputType == 'text') {
				returnElement = `
				<div class="data-title col-6 p-0 m-0"><span class="align-middle">${fileKey}:</span></div>
				<div class="data-data col-6 p-0 m-0"><input id="text_${fileKey}" name="${fileKey}" type="text" value="${fileValue}" id="text_${fileKey}" maxlength="50" class="form-control form-control-sm"></div>`;
			}

			if (objectData.inputType == 'array') {	// no modify
				returnElement = `
				<div class="data-title col-6 p-0 m-0"><span class="align-middle">${fileKey}:</span></div>
				<div class="data-data col-6 p-0 m-0">${fileValue}</div>`;
			}

			if (objectData.inputType == 'boolean') {
				function checkChecked(value) {
					if (fileValue == value) return ' selected'; else return '';
				}

				returnElement = `
				<div class="data-title col-6 p-0 m-0"><span class="align-middle">${fileKey}:</span></div>
				<div class="data-data col-6 p-0 m-0">
					<select id="boolean_${fileKey}" name="${fileKey}" class="form-control form-control-sm align-middle">
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
					<select id="select_${fileKey}" name="${fileKey}" class="form-control form-control-sm align-middle">`;
					for (const optionValue of objectData.values) {
						returnElement += `<option value="${optionValue}" ${checkChecked(optionValue)}>${optionValue}</option>`;
					}
					returnElement += `
					</select>
				</div>`;
			}
			return returnElement;
		}

		for(const [objKey, object] of Object.entries(this.objectDataTypes)) {
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

			let elements = `
			<div class="tools-title p-0 m-0">
				<h4>${name.toUpperCase()} Textures</h4>
			</div>
			<div class="p-0 px-1 m-0">
				<div class="textures-pic-container p-0 m-0 mt-2">`;
					fileData.forEach((textureArray, index) => {
						for(const[key, value] of Object.entries(textureArray.textures)) {
							elements += `<img src="./img/${name}/${key}/${value[0]}.png" alt="${value[0]}" class="list-pic p-0 m-0 me-2 mb-2 border border-primary border-0" data-name="${name}" data-index="${index}" id="selected-${name}_${index}">`;
						}
					});					
				elements+= `</div>
			</div>`;
			
			$("#textures-list").append(elements);

			$("[id^='selected-']").on('click', {'clone': clone}, function(event) {
				var clone = event.data.clone

				name = $(this).attr('data-name')
				clone.objectName = name

				$("[id^='selected-']").each(function() { $(this).addClass('border-0'); })
				$(this).removeClass('border-0').addClass('border-2');

				const elementName = $(this).attr('data-name')
				const elementIndex = $(this).attr('data-index')

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
									selectedElements +=	`<img src="./img/${name}/${key}/${textureName}.png" alt="${textureName}" class="list-pic p-0 m-0 me-2 mb-2" data-name="${textureName}" data-index="${elementIndex}" data-key="${key}" data-texturename="${textureName}">`;
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
				
				clone.loadElementsDatas(fileData[elementIndex].textures)
			});

			return fileData;
		}

		// Load textures
		this.walls = await loadAction('walls')
		this.objects = await loadAction('objects')
		
	}
}

const editor = new Editor()