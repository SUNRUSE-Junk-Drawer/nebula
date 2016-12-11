function Game(savegame) {
    var game = this
    
    game.savegame = savegame
    game.interactionMode = "command"
    game.interactionModeChanged = new SprigganEventRecurring()
    game.contentLoaded = new SprigganEventOnce()
    
    // TODO: is this used?
    game.actors = []
    
    game.factions = []
    game.partyFaction = new Faction(game)
    game.enemyFaction = new Faction(game)
    new Animosity(game.partyFaction, game.enemyFaction)
    
    var roomScriptContentManager = ShowLoadingScreen(LoadedRoomScript)
    roomScriptContentManager.add(SprigganJavaScript, "rooms/" + savegame.roomPath + "/script.js")
    
    function LoadedRoomScript() {
        game.contentManager = ShowLoadingScreen(LoadedContent)
        
        roomScriptContentManager.get(SprigganJavaScript, "rooms/" + savegame.roomPath + "/script.js")(game)
        
        game.tileset = Tilesets[game.tilesetName]
        game.tilesetSpriteSheet = "battle/tilesets/" + game.tilesetName
        game.contentManager.add(SprigganSpriteSheet, game.tilesetSpriteSheet)
        
        new HeroController().bindTo(new HumanActor(game.partyFaction, game.spawnRoom, "brownTrousers", "leatherJacket", "pistol", "orangeHair"))
        new HeroController().bindTo(new HumanActor(game.partyFaction, game.spawnRoom, "brownTrousers", "leatherJacket", "pistol", "orangeHair"))
        roomScriptContentManager.dispose()
    }
    
    function LoadedContent() {
        game.viewport = new SprigganViewport(screenWidth, screenHeight)
        game.group = new SprigganGroup(game.viewport)
        game.group.move(screenWidth / 2, (screenHeight - game.tileset.gridSpacing) / 2)
        game.backgroundGroup = new SprigganGroup(game.group)
        game.backgroundOverlayGroup = new SprigganGroup(game.group)
        game.itemPickupsGroup = new SprigganGroup(game.group)
        game.markersGroup = new SprigganGroup(game.group)
        game.actorsGroup = new SprigganGroup(game.group)
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
    this.mode.entered()
}

function CombatMode() { }

CombatMode.prototype.clicked = function(clicked) {
    if (clicked.controller instanceof HeroController) this.game.setMode(new HeroSelectedMode(clicked))
    if (clicked instanceof InventorySlot) {
        if (clicked.reservedFor) return
        if (!clicked.item) return
        if (clicked.item["throw"]) this.game.setMode(new ThrowingItemMode(clicked))
    }
    if (clicked instanceof ExteriorDoor) {
        this.game.setMode(new ExitingMode(clicked))
    }
}

CombatMode.prototype.entered = function() {}
CombatMode.prototype.showInventory = true
CombatMode.prototype.left = function() {}

function ExitingMode(exteriorDoor) {
    this.exteriorDoor = exteriorDoor
}

ExitingMode.prototype.entered = function() {
    var mode = this
    mode.sprite = new SprigganSprite(mode.game.markersGroup, BattleContent, "battle/markers", function() {
        mode.clicked(mode.exteriorDoor)
    })
    mode.sprite.move(mode.exteriorDoor.markerX, mode.exteriorDoor.markerY)
    mode.sprite.loop("exiting")
    mode.game.partyFaction.think()
    
    // todo: what if a party member dies on the way to the exit?
    
    mode.arrivedCallback = function() {
        // Ensure that all live part members are in the room before the door opens.
        for (var i = 0; i < mode.game.partyFaction.actors.length; i++) {
            var actor = mode.game.partyFaction.actors[i]
            if (!actor.health) return
            if (actor.room != mode.exteriorDoor.room) return
        }
        mode.game.viewport.dispose()
        mode.game.savegame.roomPath = mode.exteriorDoor.roomPath
        new Game(mode.game.savegame)
    }
    
    mode.exteriorDoor.room.arrived.listen(mode.arrivedCallback)
    
    mode.arrivedCallback()
}

ExitingMode.prototype.showInventory = false

ExitingMode.prototype.clicked = function(clicked) {
    if ((clicked instanceof ExteriorDoor) && clicked != this.exteriorDoor) 
        this.game.setMode(new ExitingMode(clicked))
    else this.game.setMode(new CombatMode())
}

ExitingMode.prototype.left = function() {
    this.exteriorDoor.room.arrived.unlisten(this.arrivedCallback)
    this.sprite.dispose()
}

function HeroSelectedMode(actor) { 
    this.actor = actor
    this.sprite = new SprigganSprite(this.actor.group, BattleContent, "battle/markers")
    this.sprite.loop("selected")
}

HeroSelectedMode.prototype.entered = function() {}

HeroSelectedMode.prototype.clicked = function(clicked) {
    if (clicked == this.actor) {
        this.game.setMode(new CombatMode())
    } else if (clicked.controller instanceof HeroController) {
        this.game.setMode(new HeroSelectedMode(clicked))
    } else {
        var room
        if (clicked instanceof Room) room = clicked
        if (clicked instanceof EnemyController) room = clicked.actor.room
        if (clicked instanceof ItemPickup) room = clicked.room
        if (!room) return
        this.actor.controller.destination = room
        this.actor.think()
        this.game.setMode(new CombatMode())
    }
}

HeroSelectedMode.prototype.left = function() {
    this.sprite.dispose()
}

HeroSelectedMode.prototype.showInventory = true

function ThrowingItemMode(inventorySlot) {
    this.inventorySlot = inventorySlot
    this.item = this.inventorySlot.item
}

ThrowingItemMode.prototype.entered = function() {}

ThrowingItemMode.prototype.clicked = function(clicked) {
    var mode = this
    
    var room
    if (clicked instanceof Room) room = clicked
    if (clicked instanceof EnemyController) room = clicked.actor.room
    if (clicked instanceof HeroController) room = clicked.actor.room
    if (clicked instanceof ItemPickup) room = clicked.room
    if (!room) return
    mode.inventorySlot.reserveFor("throwing")
    new Order(mode.game.partyFaction, mode.game.markersGroup, "throwing", room.x * mode.game.tileset.gridSpacing, room.y * mode.game.tileset.gridSpacing, CanExecute, Execute, Cancel)

    function CanExecute(actor) {
        return actor.room.hasLineOfSightToRoom(room)
    }
    
    function Execute(actor, then) {
        mode.inventorySlot.replace(null)
        
        // TODO: this can currently be interrupted
        actor.torsoSpriteGroup.play("throw" + Capitalize(actor.room.getDirectionToRoom(room) || "down"), function() {
            mode.item["throw"](actor, room)
            then()
        })
    }
    
    function Cancel() {
        mode.inventorySlot.reserveFor(null)
    }

    mode.game.setMode(new CombatMode())
}

ThrowingItemMode.prototype.left = function() {}