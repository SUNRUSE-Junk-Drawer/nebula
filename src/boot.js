var viewport
var loadingGroup

function SprigganBoot(contentManager) {
    contentManager.add(SprigganSpriteSheet, "logo")
    return function() {
        viewport = new SprigganViewport(428, 240)
        loadingGroup = new SprigganGroup(viewport)
        var loadingLogo = new SprigganSprite(loadingGroup, contentManager, "logo")
        loadingLogo.loop("logo")
    }
}