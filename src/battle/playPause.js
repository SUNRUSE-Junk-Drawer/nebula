function PlayPause(game) {
    var playPause = this
    playPause.viewport = new SprigganViewport(428, 240, "left", "bottom")
    playPause.sprite = new SprigganSprite(playPause.viewport, game.contentManager, "battle", TogglePause)
    playPause.sprite.loop("pause")
    playPause.paused = false
    function TogglePause() {
        playPause.paused = !playPause.paused
        if (playPause.paused) {
            playPause.sprite.loop("play")
            game.group.pause()
        } else {
            playPause.sprite.loop("pause")
            game.group.resume()
        }
    }
}

PlayPause.prototype.dispose = function() {
    this.viewport.dispose()
}