function SoundSet(contentManager, url, count) {
    this.contentManager = contentManager
    this.url = url
    this.count = count
    
    for (var i = 0; i < count; i++)
        contentManager.add(SprigganSound, url + i + ".mp3")
}

SoundSet.prototype.play = function() {
    if (!this.sounds) {
        this.sounds = []
        for (var i = 0; i < this.count; i++)
            this.sounds.push(this.contentManager.get(SprigganSound, this.url + i + ".mp3"))
    }
    
    // The most recently played sounds are at the end of the array here, and
    // we use pow() to weight the random() towards the start.
    
    var pick = Math.floor(Math.pow(Math.random(), 4.0) * this.sounds.length)
    var sound = this.sounds.splice(pick, 1)
    this.sounds.push(sound[0])
    sound[0]()
}