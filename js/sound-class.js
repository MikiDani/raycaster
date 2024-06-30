export default class SoundClass {
	constructor() {
		this.maxSoundCount = 10
		this.soundsLoaded = false
		this.sounds = {}
		this.soundsPlaying = []
	}

	async loadSounds() {
		try {
			const response = await fetch('./data/sounds/sounds.JSON')
			const data = await response.json()

			for (const soundFile of data.sounds) {
				this.sounds[soundFile] = './sounds/' + soundFile + '.mp3'
			}

			this.soundsLoaded = true
			return this.sounds
		} catch (err) {
			console.error('Hiba a hangfájlok betöltésekor:', err)
		}
	}

	async playSound(fileName, volume = 1) {
		if (this.soundsPlaying.length < this.maxSoundCount) {

			let audio = new Audio(this.sounds[fileName])
			audio.volume = volume
			audio.play()
			
			this.soundsPlaying.push(audio)
			
			console.log(this.soundsPlaying)
	
			audio.addEventListener('ended', () => {
				console.log('A hang lejátszása befejeződött: ')
				this.soundsPlaying = this.soundsPlaying.filter(a => a !== audio)
				console.log(this.soundsPlaying)
			});
		} else {
			console.log('TÚL SOK A HANG!!!!!');
		}
	}

	playSoundEvent(fileName, volume) {
		$('#sound-button').attr('data-sound', fileName)
		$('#sound-button').attr('data-volume', volume)
		$('#sound-button').click()
	}
}
