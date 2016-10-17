function Game(savegame) {
    var game = this
    
    game.savegame = savegame
    game.interactionMode = "command"
    game.interactionModeChanged = new SprigganEventRecurring()
    game.selectedCharacter = null
    game.selectedCharacterChanged = new SprigganEventRecurring()
    game.orders = []
    
    var roomScriptContentManager = new SprigganContentManager({ loaded: LoadedRoomScript })
    roomScriptContentManager.add(SprigganJavaScript, "rooms/" + savegame.roomPath + "/script.js")
    
    function LoadedRoomScript() {
        game.contentLoaded = new SprigganEventRecurring()
        game.orderGiven = new SprigganEventRecurring()
        
        game.contentManager = new SprigganContentManager({ loaded: LoadedContent })
        game.contentManager.add(SprigganSpriteSheet, "battle")
        
        roomScriptContentManager.get(SprigganJavaScript, "rooms/" + savegame.roomPath + "/script.js")(game)
        new Character(game.spawnRoom)
        roomScriptContentManager.dispose()
    }
    
    function LoadedContent() {
        game.viewport = new SprigganViewport(428, 240)
        game.group = new SprigganGroup(game.viewport)
        game.backgroundGroup = new SprigganGroup(game.group)
        game.backgroundGroup.move(214, 120)
        game.itemPickupsGroup = new SprigganGroup(game.group)
        game.markersGroup = new SprigganGroup(game.group)
        game.charactersGroup = new SprigganGroup(game.group)
        game.effectsGroup = new SprigganGroup(game.group)
        
        game.bottomLeftViewport = new SprigganViewport(428, 240, "left", "bottom")
        var playPause = new SprigganSprite(game.bottomLeftViewport, game.contentManager, "battle", TogglePause)
        playPause.loop("pause")
        var paused = false
        function TogglePause() {
            paused = !paused
            if (paused) {
                playPause.loop("play")
                game.group.pause()
            } else {
                playPause.loop("pause")
                game.group.resume()
            }
        }

        game.contentLoaded.raise()
        
        game.inventory = new Inventory(game)
    }
}

Game.prototype.dispose = function() {
    this.contentManager.dispose()
    this.viewport.dispose()
}

Game.prototype.targetRoom = function(callback) {
    var game = this
    game.targetingCallback = callback
    game.interactionMode = "targetRoom"
    game.interactionModeChanged.raise("targetRoom")
}

Game.prototype.roomClicked = function(room) {
    var game = this
    switch (game.interactionMode) {
        case "targetRoom":
            game.interactionMode = "command"
            game.interactionModeChanged.raise("command")
            game.targetingCallback(room)
            break
        case "command":
            if (game.selectedCharacter) {
                game.selectedCharacter.setDestination(room)
                game.selectCharacter(null)
            }
            break
    }
}

Game.prototype.characterClicked = function(character) {
    var game = this
    switch (game.interactionMode) {
        case "targetRoom":
            game.interactionMode = "command"
            game.interactionModeChanged.raise("command")
            game.targetingCallback(character.room)
            break
        case "command":
            game.selectCharacter(character == game.selectedCharacter ? null : character)
            break
    }
}

Game.prototype.itemPickupClicked = function(item) {
    var game = this
    switch (game.interactionMode) {
        case "targetRoom":
            game.interactionMode = "command"
            game.interactionModeChanged.raise("command")
            game.targetingCallback(item.room)
            break
        case "command":
            if (game.selectedCharacter) {
                game.selectedCharacter.setDestination(item.room)
                game.selectCharacter(null)
            }
            break
    }
}

Game.prototype.giveOrder = function(callback) {
    this.orders.push(callback)
    this.orderGiven.raise()
}

Game.prototype.selectCharacter = function(character) {
    var game = this
    game.selectedCharacter = character
    game.selectedCharacterChanged.raise(character)
}