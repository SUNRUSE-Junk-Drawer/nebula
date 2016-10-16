var sharedContent

function SprigganBoot(contentManager) {
    contentManager.add(SprigganSpriteSheet, "character")
    contentManager.add(SprigganSpriteSheet, "items/icons")
    sharedContent = contentManager
    return function() {
        var savegame = {
            roomPath: "tutorial/throwing",
            inventory: []
        }
        while (savegame.inventory.length < 12) savegame.inventory.push(null)
        
        new Game(savegame)
    }
}

var Items = {
    wrench: function(game, index) {
        alert("You are using a wrench!")
        game.inventory.remove(index)
    }
}

function ItemPickup(room, itemName) {
    var itemPickup = this
    room.game.initializeParty.listen(function(){
        itemPickup.sprite = new SprigganSprite(room.game.itemPickupsGroup, sharedContent, "items/icons", function(){
            room.game.roomClicked.raise(room)
        })
        room.arrived.listen(PerformPickup)
        function PerformPickup(){
            if (room.game.inventory.tryToAcquire(itemName)) itemPickup.sprite.dispose()
            room.arrived.unlisten(PerformPickup)
        }
        itemPickup.sprite.loop("wrench")
        itemPickup.sprite.move(room.x, room.y)
    })
}

// Represents a place characters can stand.
function Room(game, spriteSheetUrl, name, x, y) {
    var room = this
    room.game = game
    room.x = x
    room.y = y
    room.links = []
    room.entered = new SprigganEventRecurring()
    room.exited = new SprigganEventRecurring()
    room.arrived = new SprigganEventRecurring()
    game.contentManager.add(SprigganSpriteSheet, spriteSheetUrl)
    game.initializeRoom.listen(function(){
        room.sprite = new SprigganSprite(game.backgroundGroup, game.contentManager, spriteSheetUrl, function(){
            game.roomClicked.raise(room)
        })
        room.sprite.loop(name)
    })
}

// A Room which changes the room when all party members are inside.
function Door(game, spriteSheetUrl, name, x, y, roomPath) {
    Room.call(this, game, spriteSheetUrl, name, x, y)
    this.arrived.listen(function() {
        game.dispose()
        game.savegame.roomPath = roomPath
        new Game(game.savegame)
    })
}

// Given a destination room, returns the room to move to.
// Throws errors when the destination room is inaccessible or this room.
Room.prototype.navigateTo = function(navigateTo) {
    if (navigateTo == this) throw new Error("You are already in this room")
    
    var best = Infinity
    var bestOption = null
    
    // Floodfill from each link from this room.
    for (var i = 0; i < this.links.length; i++) {
        var checked = [{
            room: this,
            distance: 0
        }]
        
        function Recurse(node, distance) {
            if (node == navigateTo) return distance
            
            var obj, i
            
            for (i = 0; i < checked.length; i++) {
                obj = checked[i]
                if (obj.room != node) continue
                if (obj.distance <= distance) return Infinity
                obj.distance = distance
                break
            }
            
            if (i == checked.length) {
                obj = { room: node, distance: distance }
                checked.push(obj)
            }
            
            var best = Infinity
            
            for (var i = 0; i < node.links.length; i++) {
                var linkDistance = Recurse(node.links[i].toRoom, distance + node.links[i].length)
                if (linkDistance < best) best = linkDistance
            }
            
            return best
        }
        
        var dist = Recurse(this.links[i].toRoom, this.links[i].length)
        if (dist >= best) continue
        best = dist
        bestOption = this.links[i].toRoom
    }
    
    if (bestOption) return bestOption
    
    throw new Error("No route found")
}

// Represents a one-way link between two Rooms.
// Flags is an array of strings such as ["flagName"].
// You can then test for these using if (link.flags.flagName).
function Link(fromRoom, toRoom, flags) {
    this.fromRoom = fromRoom
    this.toRoom = toRoom
    this.length = Math.sqrt(((toRoom.x - fromRoom.x) * (toRoom.x - fromRoom.x)) + ((toRoom.y - fromRoom.y) * (toRoom.y - fromRoom.y)))
    this.flags = {}
    for (var i = 0; i < flags.length; i++) this.flags[flags[i]] = true
    fromRoom.links.push(this)
}

function Character(room) {
    var character = this
    character.room = room
    character.destination = room
    character.room.game.contentManager.add(SprigganSpriteSheet, "character")
    
    character.room.game.initializeParty.listen(function(){
        character.group = new SprigganGroup(character.room.game.charactersGroup)
        
        character.selectionMarker = new SprigganSprite(character.group, character.room.game.contentManager, "battle")
        character.selectionMarker.loop("selected")
        character.selectionMarker.hide()
        
        character.marker = new SprigganSprite(room.game.markersGroup, character.room.game.contentManager, "battle")
        character.marker.hide()
        
        character.sprite = new SprigganSprite(character.group, character.room.game.contentManager, "character", function() {
            character.room.game.characterClicked.raise(character)
        })
        character.sprite.loop("idleRight")
        character.group.move(character.room.x, character.room.y)
            
        character.room.game.characterClicked.listen(function(clickedCharacter) {
            if (character == clickedCharacter) {
                character.selected = !character.selected
            } else {
                character.selected = false
            }
            if (character.selected)
                character.selectionMarker.show()
            else
                character.selectionMarker.hide()
        })
        
        character.room.game.roomClicked.listen(function(room) {
            if (!character.selected) return
            character.selected = false
            character.selectionMarker.hide()
            character.marker.move(room.x, room.y)
            character.marker.loop("moving")
            character.marker.show()
            character.destination = room
            Think()
        })
        
        var moving = false
        
        function Think() {
            if (moving) return
            
            if (character.room != character.destination) {
                var next = character.room.navigateTo(character.destination)
                if (next == null) return
                character.room.exited.raise(character)
                character.room = next
                moving = true
                character.group.moveAtPixelsPerSecond(character.room.x, character.room.y, 100, function() {
                    moving = false
                    character.room.arrived.raise(character)
                    Think()
                })
                character.room.entered.raise(character)
                return
            }
            
            character.marker.hide()
        }
        
        character.room.entered.raise(character)
        
        Think()        
    })
}

function Game(savegame) {
    var game = this
    
    game.savegame = savegame
    
    var roomScriptContentManager = new SprigganContentManager({ loaded: LoadedRoomScript })
    roomScriptContentManager.add(SprigganJavaScript, "rooms/" + savegame.roomPath + "/script.js")
    
    function LoadedRoomScript() {
        game.initializeRoom = new SprigganEventOnce()
        game.initializeParty = new SprigganEventOnce()
        game.roomClicked = new SprigganEventRecurring()
        game.characterClicked = new SprigganEventRecurring()
        
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

function Inventory(game) {
    var inventory = this
    inventory.game = game
    inventory.opened = false
    inventory.viewport = new SprigganViewport(428, 240, "right", "bottom")
    inventory.icon = new SprigganSprite(inventory.viewport, game.contentManager, "battle", ToggleInventory)
    function ToggleInventory() {
        inventory.opened = !inventory.opened
        inventory.refresh()
    }
    
    inventory.panelGroup = new SprigganGroup(inventory.viewport)
    inventory.panelGroup.move(120, 0)
    inventory.panelBackground = new SprigganSprite(inventory.panelGroup, game.contentManager, "battle")
    inventory.panelBackground.loop("inventoryPanel")
    
    inventory.slots = []
    for (var y = 0; y < 4; y++) {
        for (var x = 0; x < 3; x++) {
            new InventorySlot(inventory, x, y)
        }
    }
    
    inventory.refresh()     
}

Inventory.prototype.refresh = function() {
    this.icon.loop(this.opened ? "inventoryOpened" : "inventoryClosed")
    this.panelGroup.moveAtPixelsPerSecond(this.opened ? 0 : 120, 0, 1000)
}

Inventory.prototype.tryToAcquire = function(itemName) {
    var inventory = this
    for (var i = 0; i < inventory.game.savegame.inventory.length; i++) {
        if (inventory.game.savegame.inventory[i]) continue
        inventory.game.savegame.inventory[i] = itemName
        inventory.slots[i].refresh()
        inventory.icon.play("inventoryAdded", function() {
            inventory.refresh()
        })
        return true
    }
    inventory.icon.play("inventoryFull", function() {
        inventory.refresh()
    })
    return false
}

Inventory.prototype.remove = function(index) {
    this.game.savegame.inventory[index] = null
    this.slots[index].refresh()
}

function InventorySlot(inventory, x, y) {
    var inventorySlot = this
    inventorySlot.inventory = inventory
    inventorySlot.x = x
    inventorySlot.y = y
    inventorySlot.id = inventory.slots.length
    inventory.slots.push(inventorySlot)
    
    inventorySlot.sprite = new SprigganSprite(inventory.panelGroup, sharedContent, "items/icons", Clicked)
    
    function Clicked() {
        Items[inventory.game.savegame.inventory[inventorySlot.id]](inventory.game, inventorySlot.id)
    }
    
    inventorySlot.sprite.move(330 + x * 39, 63 + y * 39)
    
    inventorySlot.refresh()
}

InventorySlot.prototype.refresh = function() {
    var itemName = this.inventory.game.savegame.inventory[this.id]
    if (itemName) {
        this.sprite.loop(itemName)
        this.sprite.show()
    } else this.sprite.hide()
}