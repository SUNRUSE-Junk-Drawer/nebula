function Game(savegame) {
    var game = this
    
    game.savegame = savegame
    game.contentLoaded = new SprigganEventOnce()
    
    var roomScriptContentManager = new SprigganContentManager({ loaded: LoadedAreaScript })
    roomScriptContentManager.add(SprigganJavaScript, "navigation/areas/" + savegame.areaPath + ".js")
    
    function LoadedAreaScript() {
        game.contentManager = new SprigganContentManager({ loaded: LoadedContent })
        game.contentManager.add(SprigganSpriteSheet, "navigation/objects")
        
        roomScriptContentManager.get(SprigganJavaScript, "navigation/areas/" + savegame.areaPath + ".js")(game)
    }
    
    function LoadedContent() {
        game.viewport = new SprigganViewport(428, 240)
        
        game.backgroundGroup = new SprigganGroup(game.viewport)
        game.orbitGroup = new SprigganGroup(game.viewport)
        game.uiGroup = new SprigganGroup(game.viewport)
        
        game.areaNameGroup = SprigganWrite(game.uiGroup, sharedContent, "fontBig", fontBig, game.areaName)
        game.areaNameGroup.move(1, 1)
        
        game.contentLoaded.raise()
    }
}

function Destination(game, type, name, areaPath, x, y) {
    var destination = this
    destination.game = game
    destination.type = type
    destination.name = name
    destination.areaPath = areaPath
    destination.x = x
    destination.y = y
    
    destination.game.contentLoaded.listen(function(){
        destination.orbitSprite = new SprigganSprite(destination.game.orbitGroup, destination.game.contentManager, "navigation/objects")
        destination.orbitSprite.loop("orbit")
        destination.orbitSprite.move(destination.x, 120)
        
        destination.iconSprite = new SprigganSprite(destination.game.orbitGroup, destination.game.contentManager, "navigation/objects")
        destination.iconSprite.loop(type)
        destination.iconSprite.move(destination.x, 120 + destination.y)
        
        destination.nameGroup = SprigganWrite(game.uiGroup, sharedContent, "fontBig", fontBig, destination.name)
        destination.nameGroup.move(destination.x, 120 + destination.y + 16)
    })
}