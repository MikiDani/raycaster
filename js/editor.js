class Editor {
	walls;
	constructor () {
		this.mapSize = 64
		this.mapContainerWidth = 4000
		// ---------------
		$(window).on('resize', this.resizer(this.mapSize, this.mapContainerWidth));
		this.mapUpload(this.mapSize)
		this.resizer(this.mapSize, this.mapContainerWidth);
		this.mapIconSize()
		// ----------------
		this.loadTextures()
	}

	resizer(mapSize, mapContainerWidth) {
		this.bricksize = Math.floor(mapContainerWidth / mapSize)

		$(".map-row").css('width', mapContainerWidth)
		$(".map-row").css('height', this.bricksize)

		$(".brick").css('width', this.bricksize)
		$(".brick").css('height', this.bricksize)
	}

	mapUpload(mapSize) {
		for (let y = 0; y < mapSize; y++) {
			let elementRow = document.createElement('div');
			elementRow.className = 'map-row';
	
			for (let x = 0; x < mapSize; x++) {
				let r = Math.floor(Math.random() * 155)
				let g = Math.floor(Math.random() * 125)
				let b = Math.floor(Math.random() * 155)
	
				let element = document.createElement('div')
				// element.innerText= x
				element.className = 'brick'
				element.style.backgroundColor = 'rgb(' + r + ',' + g + ',' + b + ')'
				element.style.width = this.bricksize + 'px'
				element.style.height = this.bricksize + 'px'
	
				elementRow.appendChild(element);
			}
			document.querySelector(".map-container").appendChild(elementRow);
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

	async loadTextures() {
		// Action function
		async function loadAction(name) {
			let connectFile = await fetch(`/js/${name}/${name}.JSON`)
			let fileData = await connectFile.json()

			let elements = `
			<div class="tools-title p-0 m-0">
				<h4>${name.toUpperCase()} Textures</h4>
			</div>
			<div class="p-0 px-2 m-0">
				<div class="textures-pic-container p-0 m-0 mt-2">`;
					fileData.forEach((textureArray, index) => {
						for(const[key, value] of Object.entries(textureArray.textures)) {
							elements += `<img src="/img/walls/${key}/${value[0]}.png" alt="${value[0]}" class="list-pic p-0 m-0 me-2 mb-2" data-name="${name}" data-index="${index}" id="selected-${name}_${index}">`;
						}
					});					
				elements+= `</div>
			</div>`;
			
			$("#textures-list").append(elements);

			$("[id^='selected-']").on('click', function() {

				let elementName = $(this).attr('data-name')
				let elementIndex = $(this).attr('data-index')

				let selectedElements = `
				<div class="p-0 px-3 m-0">
					<div class="p-2 m-0 texture-class_ border border-secondary">
						<h6 class="text-white text-start"><strong>Name: </strong>${Object.values(fileData[elementIndex].textures)[0]}</h6>
						<hr class="p-0 my-2 border-white">
						<div class="textures-pic-container">
							<div id="" class="textures-pic">`;
							// console.log(fileData[elementIndex])
							for(const[key, value] of Object.entries(fileData[elementIndex].textures)) {
								// console.log(key); console.log(value)
								value.forEach(textureName => {
									selectedElements +=	`<img src="/img/walls/${key}/${textureName}.png" alt="${textureName}" class="list-pic p-0 m-0 me-2 mb-2" data-name="${textureName}" data-index="${elementIndex}" data-key="${key}" data-texturename="${textureName}">`;
								});
							}

							selectedElements += `</div>
						</div>
						<div class="texture-data text-white">
							<div class="row data-line p-0 m-0">
								<div class="data-title col-6 p-0 m-0"><span class="align-middle">Type:</span></div>
								<div class="data-data col-6 p-0 m-0">
									<select name="type" class="form-control form-control-sm align-middle">
										<option value="basic" checked>basic</option>
										<option value="animated">animated</option>
										<option value="animated">fixed</option>
										<option value="animated">pickup</option>
									</select>
								</div>
								<div class="data-title col-6 p-0 m-0 text-start"><span class="align-middle">anim_function:</span></div>
								<div class="data-data col-6 p-0 m-0 text-start text-success"><span class="align-middle">null</span></div>
							</div>
						</div>
					</div>
				</div>`;

				$(`#textures-selected`).html('')
				$(`#textures-selected`).append(selectedElements)
			});

			return fileData;
		}

		// Load textures
		this.walls = await loadAction('walls')

		console.log(this.walls)
		
	}
}

const editor = new Editor()