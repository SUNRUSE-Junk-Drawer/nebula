var sharedContent

function SprigganBoot(contentManager) {
    contentManager.add(SprigganSpriteSheet, "logo")
    contentManager.add(SprigganSpriteSheet, "fontBig")
    contentManager.add(SprigganSpriteSheet, "fontSmall")
    sharedContent = contentManager
    return function() {        
        LoadBattle()
    }
}