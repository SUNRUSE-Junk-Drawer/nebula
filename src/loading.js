function ShowLoadingScreen(then) {
    var viewport = new SprigganViewport(screenWidth, screenHeight, "right", "bottom")
    
    var nowLoading = new SprigganSprite(viewport, sharedContent, "logo")
    nowLoading.loop("nowLoading")
    var ellipsis = new SprigganSprite(viewport, sharedContent, "logo")
    ellipsis.hide()
    
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
            viewport.dispose()
            then()
        }
    })
    
    return contentManager
}