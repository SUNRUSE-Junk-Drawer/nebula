function Game(savegame) {
    var game = this
    
    game.savegame = savegame
    game.targeting = null
    game.orders = []
    
    var roomScriptContentManager = new SprigganContentManager({ loaded: LoadedRoomScript })
    roomScriptContentManager.add(SprigganJavaScript, "rooms/" + savegame.roomPath + "/script.js")
    
    function LoadedRoomScript() {
        game.initializeRoom = new SprigganEventOnce()
        game.initializeParty = new SprigganEventOnce()
        game.roomClicked = new SprigganEventRecurring()
        game.characterClicked = new SprigganEventRecurring()
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

        game.initializeRoom.raise()
        game.initializeParty.raise()
        
        game.inventory = new Inventory(game)
    }
}

Game.prototype.dispose = function() {
    this.contentManager.dispose()
    this.viewport.dispose()
}

Game.prototype.target = function(type, then) {
    var game = this
    game.targeting = type
    switch (type) {
        case "room": {
            function RoomClicked(room) {
                game.characterClicked.unlisten(CharacterClicked)
                then(room)
            }
            function CharacterClicked(character) {
                game.roomClicked.unlisten(RoomClicked)
                then(character.room)
            }

            game.roomClicked.listenOnce(RoomClicked)
            game.characterClicked.listenOnce(CharacterClicked)
            break
        }
        default: throw new Error("Unimplemented targeting type " + type)
    }
}

Game.prototype.giveOrder = function(callback) {
    this.orders.push(callback)
    this.orderGiven.raise()
}