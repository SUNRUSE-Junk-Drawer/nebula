function Game(savegame) {
    var game = this
    
    game.savegame = savegame
    game.interactionMode = "command"
    game.interactionModeChanged = new SprigganEventRecurring()
    game.contentLoaded = new SprigganEventOnce()
    
    game.characters = []
    
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
        
        game.setMode(new CombatMode())
    }
}

Game.prototype.dispose = function() {
    this.contentManager.dispose()
    this.viewport.dispose()
    this.inventory.dispose()
    this.playPause.dispose()
}

Game.prototype.setMode = function(mode) {
    if (this.mode) this.mode.left()
    this.mode = mode
    if (this.mode.showInventory)
        this.inventory.viewport.show()
    else
        this.inventory.viewport.hide()
    mode.game = this
}

function CombatMode() { }

CombatMode.prototype.clicked = function(clicked) {
    if (clicked instanceof PartyMember) this.game.setMode(new PartyMemberSelectedMode(clicked))
    if (clicked instanceof InventorySlot) {
        if (clicked.item["throw"]) this.game.setMode(new ThrowingItemMode(clicked))
    }
}

CombatMode.prototype.showInventory = true

CombatMode.prototype.left = function() {}

function PartyMemberSelectedMode(partyMember) { 
    this.partyMember = partyMember
    this.sprite = new SprigganSprite(this.partyMember.character.group, this.partyMember.game.contentManager, "battle")
    this.sprite.loop("selected")
}

PartyMemberSelectedMode.prototype.clicked = function(clicked) {
    if (clicked == this.partyMember) {
        this.game.setMode(new CombatMode())
    } else if (clicked instanceof PartyMember) {
        this.game.setMode(new PartyMemberSelectedMode(clicked))
    } else {
        var room
        if (clicked instanceof Room) room = clicked
        if (clicked instanceof Enemy) room = clicked.character.room
        if (clicked instanceof ItemPickup) room = clicked.room
        if (!room) return
        this.partyMember.character.setDestination(room)
        this.game.setMode(new CombatMode())
    }
}

PartyMemberSelectedMode.prototype.left = function() {
    this.sprite.dispose()
}

PartyMemberSelectedMode.prototype.showInventory = true

function ThrowingItemMode(inventorySlot) {
    this.inventorySlot = inventorySlot
    this.item = this.inventorySlot.item
}

ThrowingItemMode.prototype.clicked = function(clicked) {
    var mode = this
    
    var room
    if (clicked instanceof Room) room = clicked
    if (clicked instanceof Enemy) room = clicked.character.room
    if (clicked instanceof PartyMember) room = clicked.character.room
    if (clicked instanceof ItemPickup) room = clicked.room
    if (!room) return
    mode.inventorySlot.reserveFor("throwing")
    new Order(mode.game.partyFaction, mode.game.markersGroup, mode.game.contentManager, "throwingTo", room.x * 64, room.y * 64, CanExecute, Execute, Cancel)

    function CanExecute(character) {
        return character.room.hasLineOfSightToRoom(room)
    }
    
    function Execute(character) {
        mode.inventorySlot.replace(null)
        
        // TODO: this can currently be interrupted
        character.torsoSpriteGroup.play("throw" + Capitalize(character.room.getDirectionToRoom(room)), function() {
            mode.item["throw"](character, room)
            character.think()
        })
    }
    
    function Cancel() {
        mode.inventorySlot.reserveFor(null)
    }

    mode.game.setMode(new CombatMode())
}

ThrowingItemMode.prototype.left = function() {}