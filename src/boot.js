function SprigganBoot(contentManager) {
    contentManager.add(SprigganSpriteSheet, "character")
    return function() {
        new Game("tutorial/throwing")
    }
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
        new Game(roomPath)
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

function Game(roomPath) {
    var game = this
    
    var roomScriptContentManager = new SprigganContentManager({ loaded: LoadedRoomScript })
    roomScriptContentManager.add(SprigganJavaScript, "rooms/" + roomPath + "/script.js")
    
    function LoadedRoomScript() {
        game.initializeRoom = new SprigganEventOnce()
        game.initializeParty = new SprigganEventOnce()
        game.roomClicked = new SprigganEventRecurring()
        game.characterClicked = new SprigganEventRecurring()
        
        game.contentManager = new SprigganContentManager({ loaded: LoadedContent })
        game.contentManager.add(SprigganSpriteSheet, "battle")
        
        roomScriptContentManager.get(SprigganJavaScript, "rooms/" + roomPath + "/script.js")(game)
        new Character(game.spawnRoom)
        roomScriptContentManager.dispose()
    }
    
    function LoadedContent() {
        game.viewport = new SprigganViewport(428, 240)
        game.group = new SprigganGroup(game.viewport)
        game.backgroundGroup = new SprigganGroup(game.group)
        game.backgroundGroup.move(214, 120)
        game.markersGroup = new SprigganGroup(game.group)
        game.charactersGroup = new SprigganGroup(game.group)
        
        game.bottomLeftViewport = new SprigganViewport(428, 240, "left", "bottom")
        var playPause = new SprigganSprite(game.bottomLeftViewport, game.contentManager, "battle")
        playPause.loop("pause")
        
        game.bottomRightViewport = new SprigganViewport(428, 240, "right", "bottom")
        var inventoryOpenClose = new SprigganSprite(game.bottomRightViewport, game.contentManager, "battle", ToggleInventory)
        inventoryOpenClose.loop("inventoryClosed")
        var inventoryOpen = false
        function ToggleInventory() {
            inventoryOpen = !inventoryOpen
            if (inventoryOpen) {
                inventoryOpenClose.loop("inventoryOpened")
                inventoryPanelBackground.moveAtPixelsPerSecond(0, 0, 800)
            } else {
                inventoryOpenClose.loop("inventoryClosed")
                inventoryPanelBackground.moveAtPixelsPerSecond(120, 0, 800)
            }
        }
        var inventoryPanelGroup = new SprigganGroup(game.bottomRightViewport)
        var inventoryPanelBackground = new SprigganSprite(inventoryPanelGroup, game.contentManager, "battle")
        inventoryPanelBackground.loop("inventoryPanel")
        inventoryPanelBackground.move(120, 0)
        
        game.initializeRoom.raise()
        game.initializeParty.raise()
    }
}

Game.prototype.dispose = function() {
    this.contentManager.dispose()
    this.viewport.dispose()
}