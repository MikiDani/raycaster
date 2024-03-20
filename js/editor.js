class Editor {
	constructor () {
		this.mapSize = 64
		this.mapContainerWidth = 4000

		$(window).on('resize', this.resizer(this.mapSize, this.mapContainerWidth));
		this.mapUpload(this.mapSize)
		this.resizer(this.mapSize, this.mapContainerWidth);

		this.mapIconSize()
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
				let r = Math.floor(Math.random() * 256)
				let g = Math.floor(Math.random() * 256)
				let b = Math.floor(Math.random() * 256)
	
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
}

const editor = new Editor()