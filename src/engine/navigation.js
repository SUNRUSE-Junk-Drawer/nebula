function NavigationGame(savegame) {
    var navigationGame = this
    
    navigationGame.savegame = savegame
    navigationGame.contentLoaded = new SprigganEventOnce()
    
    var roomScriptContentManager = new SprigganContentManager({ loaded: LoadedAreaScript })
    roomScriptContentManager.add(SprigganJavaScript, "navigation/areas/" + savegame.areaPath + ".js")
    
    function LoadedAreaScript() {
        navigationGame.contentManager = new SprigganContentManager({ loaded: LoadedContent })
        navigationGame.contentManager.add(SprigganSpriteSheet, "navigation/objects")
        
        roomScriptContentManager.get(SprigganJavaScript, "navigation/areas/" + savegame.areaPath + ".js")(navigationGame)
    }
    
    function LoadedContent() {
        navigationGame.viewport = new SprigganViewport(428, 240)
        
        navigationGame.backgroundGroup = new SprigganGroup(navigationGame.viewport)
        navigationGame.orbitGroup = new SprigganGroup(navigationGame.viewport)
        navigationGame.uiGroup = new SprigganGroup(navigationGame.viewport)
        
        navigationGame.contentLoaded.raise()
    }
}

function NavigationOrbit(navigationGame, type, x, y) {
    var navigationOrbit = this
    navigationOrbit.navigationGame = navigationGame
    navigationOrbit.type = type
    navigationOrbit.x = x
    navigationOrbit.y = y
    
    navigationOrbit.navigationGame.contentLoaded.listen(function(){
        navigationOrbit.orbitSprite = new SprigganSprite(navigationOrbit.navigationGame.orbitGroup, navigationOrbit.navigationGame.contentManager, "navigation/objects")
        navigationOrbit.orbitSprite.loop("orbit")
        navigationOrbit.orbitSprite.move(navigationOrbit.x, 120)
        
        navigationOrbit.iconSprite = new SprigganSprite(navigationOrbit.navigationGame.orbitGroup, navigationOrbit.navigationGame.contentManager, "navigation/objects")
        navigationOrbit.iconSprite.loop(type)
        navigationOrbit.iconSprite.move(navigationOrbit.x, 120 + navigationOrbit.y)
    })
}