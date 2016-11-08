function Game(savegame) {
    var game = this
    
    game.savegame = savegame
    game.interactionMode = "command"
    game.interactionModeChanged = new SprigganEventRecurring()
    game.selectedPartyMember = null
    game.selectedPartyMemberChanged = new SprigganEventRecurring()
    game.contentLoaded = new SprigganEventOnce()
    game.orderGiven = new SprigganEventRecurring()
    game.orders = []
    
    game.partyFaction = new Faction()
    game.enemyFaction = new Faction()
    new Animosity(game.partyFaction, game.enemyFaction)
    
    var roomScriptContentManager = new SprigganContentManager({ loaded: LoadedRoomScript })
    roomScriptContentManager.add(SprigganJavaScript, "rooms/" + savegame.roomPath + "/script.js")
    
    function LoadedRoomScript() {
        game.contentManager = new SprigganContentManager({ loaded: LoadedContent })
        game.contentManager.add(SprigganSpriteSheet, "battle")
        
        roomScriptContentManager.get(SprigganJavaScript, "rooms/" + savegame.roomPath + "/script.js")(game)
        new PartyMember(game.spawnRoom)
        roomScriptContentManager.dispose()
    }
    
    function LoadedContent() {
        game.viewport = new SprigganViewport(428, 240)
        game.group = new SprigganGroup(game.viewport)
        game.group.move(214, 88)
        game.backgroundGroup = new SprigganGroup(game.group)
        game.backgroundOverlayGroup = new SprigganGroup(game.group)
        game.itemPickupsGroup = new SprigganGroup(game.group)
        game.markersGroup = new SprigganGroup(game.group)
        game.charactersGroup = new SprigganGroup(game.group)
        game.effectsGroup = new SprigganGroup(game.group)
        game.foregroundGroup = new SprigganGroup(game.group)

        game.contentLoaded.raise()
        
        game.inventory = new Inventory(game)
        game.playPause = new PlayPause(game)
    }
}

Game.prototype.dispose = function() {
    this.contentManager.dispose()
    this.viewport.dispose()
    this.inventory.dispose()
    this.playPause.dispose()
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
            if (game.selectedPartyMember) {
                game.selectedPartyMember.character.setDestination(room)
                game.selectPartyMember(null)
            }
            break
    }
}

Game.prototype.partyMemberClicked = function(partyMember) {
    var game = this
    switch (game.interactionMode) {
        case "targetRoom":
            game.interactionMode = "command"
            game.interactionModeChanged.raise("command")
            game.targetingCallback(partyMember.character.room)
            break
        case "command":
            game.selectPartyMember(partyMember == game.selectedPartyMember ? null : partyMember)
            break
    }
}

Game.prototype.enemyClicked = function(enemy) {
    var game = this
    switch (game.interactionMode) {
        case "targetRoom":
            game.interactionMode = "command"
            game.interactionModeChanged.raise("command")
            game.targetingCallback(enemy.room)
            break
        case "command":
            if (game.selectedPartyMember) {
                game.selectedPartyMember.character.setDestination(enemy.character.room)
                game.selectPartyMember(null)
            }
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
            if (game.selectedPartyMember) {
                game.selectedPartyMember.character.setDestination(item.room)
                game.selectPartyMember(null)
            }
            break
    }
}

Game.prototype.giveOrder = function(callback) {
    this.orders.push(callback)
    this.orderGiven.raise()
}

Game.prototype.selectPartyMember = function(partyMember) {
    var game = this
    game.selectedPartyMember = partyMember
    game.selectedPartyMemberChanged.raise(partyMember)
}