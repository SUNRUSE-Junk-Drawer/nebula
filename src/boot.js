var sharedContent

function SprigganBoot(contentManager) {
    contentManager.add(SprigganSpriteSheet, "logo")
    contentManager.add(SprigganSpriteSheet, "fontBig")
    contentManager.add(SprigganSpriteSheet, "fontSmall")
    sharedContent = contentManager
    return function() {        
        // todo: this is a terrible hack to ignore the safety check which prevents
        //       audio being loaded without the user interacting with the game
        //       as required on mobile devices.
        SprigganEventWasTriggeredByUserInteraction = true
        LoadBattle()
    }
}