function Game(savegame) {
    var game = this
    
    game.savegame = savegame
    game.interactionMode = "command"
    game.interactionModeChanged = new SprigganEventRecurring()
    game.contentLoaded = new SprigganEventOnce()
    
    game.exteriorDoors = {}
    
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
        
        var door = game.exteriorDoors[game.savegame.fromDoor]
        var initialX = door.room.x * game.tileset.gridSpacing + DirectionOffsetX(door.position, game.tileset.gridSpacing / 2)
        var initialY = door.room.y * game.tileset.gridSpacing + DirectionOffsetY(door.position, game.tileset.gridSpacing / 2)
        var initialFacing = ReverseDirection(door.position)
        for (var i = 0; i < game.savegame.party.length; i++) {
            new HeroController().bindTo(new HumanActor(game.partyFaction, door.room, game.savegame.party[i], initialX, initialY, initialFacing))
        }
        
        game.inventory = new Inventory(game)
        game.playPause = new PlayPause(game)
        
        if (game.enemyFaction.actors.length)
            game.setMode(new CombatMode())
        else
            game.setMode(new ExploringMode())
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
        this.game.setMode(new FindingExitMode(clicked, CombatMode))
    }
}

CombatMode.prototype.entered = function() {}
CombatMode.prototype.showInventory = true
CombatMode.prototype.left = function() {}

function FindingExitMode(exteriorDoor, modeWhenCancelled) {
    this.exteriorDoor = exteriorDoor
    this.modeWhenCancelled = modeWhenCancelled
}

FindingExitMode.prototype.entered = function() {
    var mode = this
    mode.sprite = new SprigganSprite(mode.game.markersGroup, BattleContent, "battle/markers", function() {
        mode.clicked(mode.exteriorDoor)
    })
    mode.sprite.move(mode.exteriorDoor.markerX, mode.exteriorDoor.markerY)
    mode.sprite.loop("exiting")
    mode.game.partyFaction.think()
    
    // todo: what if a party member dies on the way to the exit?
    
    mode.enteredCallback = function() {
        // Ensure that all live part members are in the room before the door opens.
        for (var i = 0; i < mode.game.partyFaction.actors.length; i++) {
            var actor = mode.game.partyFaction.actors[i]
            if (!actor.health) return
            if (actor.room != mode.exteriorDoor.room) return
        }
        mode.game.setMode(new ExitingMode(mode.exteriorDoor))

    }
    
    mode.exteriorDoor.room.entered.listen(mode.enteredCallback)
    
    mode.enteredCallback()
}

FindingExitMode.prototype.showInventory = false

FindingExitMode.prototype.clicked = function(clicked) {
    if ((clicked instanceof ExteriorDoor) && clicked != this.exteriorDoor) 
        this.game.setMode(new FindingExitMode(clicked, this.modeWhenCancelled))
    else {
        this.game.setMode(new this.modeWhenCancelled())
        this.game.mode.clicked(clicked)
    }
}

FindingExitMode.prototype.left = function() {
    this.exteriorDoor.room.entered.unlisten(this.enteredCallback)
    this.sprite.dispose()
}

function ExitingMode(exteriorDoor) {
    this.exteriorDoor = exteriorDoor
}

ExitingMode.prototype.entered = function() {
    var mode = this
    mode.exteriorDoor.room.left.listen(function(character) {
        // Ensure that all live party rooms have left the room before switching map.
        for (var i = 0; i < mode.exteriorDoor.room.actors.length; i++) {
            var actor = mode.exteriorDoor.room.actors[i]
            if (!actor.health) continue
            if (actor.faction != mode.exteriorDoor.room.game.partyFaction) continue
            if (actor.room == mode.exteriorDoor.room) return
        }
        mode.game.viewport.dispose()
        mode.game.savegame.fromDoor = mode.game.savegame.roomPath
        mode.game.savegame.roomPath = mode.exteriorDoor.roomPath
        new Game(mode.game.savegame)
    })
    mode.game.partyFaction.think()
    mode.exteriorDoor.open()
}

ExitingMode.prototype.showInventory = false

ExitingMode.prototype.clicked = function(clicked) {
    if ((clicked instanceof ExteriorDoor) && clicked != this.exteriorDoor) 
        this.game.setMode(new ExitingMode(clicked))
    else this.game.setMode(new CombatMode())
}

ExitingMode.prototype.left = function() {
    this.exteriorDoor.room.entered.unlisten(this.enteredCallback)
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
    } else if (clicked instanceof ExteriorDoor) {
        this.game.setMode(new FindingExitMode(clicked))
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

function ExploringMode() {}

ExploringMode.prototype.entered = function() {}

ExploringMode.prototype.clicked = function(clicked) {   
    if (clicked instanceof ExteriorDoor) {
        this.game.setMode(new FindingExitMode(clicked, ExploringMode))
        return
    }

    var room = null
    if (clicked instanceof Room) room = clicked
    room = room || clicked.room
    
    if (!room) return
    
    for (var i = 0; i < this.game.partyFaction.actors.length; i++) {
        this.game.partyFaction.actors[i].controller.destination = room
        this.game.partyFaction.actors[i].think()
    }
}

ExploringMode.prototype.left = function() {}