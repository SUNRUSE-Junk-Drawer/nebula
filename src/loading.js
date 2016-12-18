var firstLoadingScreen = true

function ShowLoadingScreen(then) {
    var textViewport = new SprigganViewport(screenWidth, screenHeight, "right", "bottom")
    
    var nowLoading = new SprigganSprite(textViewport, sharedContent, "logo")
    nowLoading.loop("nowLoading")
    nowLoading.move(screenWidth, screenHeight)
    var ellipsis = new SprigganSprite(textViewport, sharedContent, "logo")
    ellipsis.hide()
    ellipsis.move(screenWidth, screenHeight)
    
    var logoViewport
    if (firstLoadingScreen) {
        logoViewport = new SprigganViewport(screenWidth, screenHeight)
        var logo = new SprigganSprite(logoViewport, sharedContent, "logo")
        logo.move(screenWidth / 2, screenHeight / 2)
        logo.loop("logo")
        firstLoadingScreen = false
    }
    
    var contentManager = new SprigganContentManager({
        progress: function(loaded, total) {
            switch (loaded % 4) {
                case 0:
                    ellipsis.hide()
                    break
                case 1:
                    ellipsis.show()
                    // Intentional fall-through.
                default:
                    ellipsis.loop("ellipsis" + (loaded % 4))
            }
        },
        loaded: function() {
            textViewport.dispose()
            if (logoViewport) logoViewport.dispose()
            then()
        }
    })
    
    return contentManager
}