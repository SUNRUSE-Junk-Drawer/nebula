function SprigganBoot(contentManager) {
    contentManager.add(SprigganSpriteSheet, "character")
    return function() {
        new Battle()
    }
}

// Represents a place characters can stand.
function Room(battle, x, y) {
    var room = this
    room.battle = battle
    battle.contentManager.add(SprigganSpriteSheet, "room")
    room.x = x
    room.y = y
    room.links = []
    
    battle.roomsLoaded.listen(function(){
        room.sprite = new SprigganSprite(battle.backgroundGroup, battle.contentManager, "room", function() {
            battle.roomClicked.raise(room)
        })
        room.sprite.loop("room")
        room.sprite.move(room.x, room.y)
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
    character.room.battle.contentManager.add(SprigganSpriteSheet, "character")
    
    this.room.battle.charactersLoaded.listen(function(){
        character.group = new SprigganGroup(character.room.battle.charactersGroup)
        
        character.selectionMarker = new SprigganSprite(character.group, character.room.battle.contentManager, "battle")
        character.selectionMarker.loop("selected")
        character.selectionMarker.hide()
        
        character.marker = new SprigganSprite(room.battle.markersGroup, character.room.battle.contentManager, "battle")
        character.marker.hide()
        
        character.sprite = new SprigganSprite(character.group, character.room.battle.contentManager, "character", function() {
            character.room.battle.characterClicked.raise(character)
        })
        character.sprite.loop("idleRight")
        character.group.move(character.room.x, character.room.y)
            
        character.room.battle.characterClicked.listen(function(clickedCharacter) {
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
        
        character.room.battle.roomClicked.listen(function(room) {
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
                character.room = next
                moving = true
                character.group.moveAtPixelsPerSecond(character.room.x, character.room.y, 100, function() {
                    moving = false
                    Think()
                })
                return
            }
            
            character.marker.hide()
        }
        
        Think()        
    })
}

function Battle() {
    var battle = this
    battle.roomsLoaded = new SprigganEventOnce()
    battle.charactersLoaded = new SprigganEventOnce()
    battle.roomClicked = new SprigganEventRecurring()
    battle.characterClicked = new SprigganEventRecurring()
    battle.contentManager = new SprigganContentManager({
        loaded: Loaded
    })
    
    battle.contentManager.add(SprigganSpriteSheet, "battle")
    
    // This is a ring of test rooms with bidirecitonal links.
    var roomA = new Room(battle, 20, 40)
    var roomB = new Room(battle, 80, 30)
    var roomC = new Room(battle, 80, 78)
    var roomD = new Room(battle, 140, 35)
    var roomE = new Room(battle, 160, 90)
    var roomF = new Room(battle, 110, 140)
    new Link(roomA, roomB, ["walk"])
    new Link(roomB, roomC, ["walk"])
    new Link(roomB, roomA, ["walk"])
    new Link(roomC, roomB, ["walk"])
    new Link(roomB, roomD, ["walk"])
    new Link(roomD, roomB, ["walk"])
    new Link(roomE, roomD, ["walk"])
    new Link(roomD, roomE, ["walk"])
    new Link(roomE, roomF, ["walk"])
    new Link(roomF, roomC, ["walk"])
    new Link(roomF, roomE, ["walk"])
    new Link(roomC, roomF, ["walk"])
    
    new Character(roomA)
    new Character(roomC)
    
    function Loaded() {    
        battle.viewport = new SprigganViewport(428, 240)
        battle.gameGroup = new SprigganGroup(battle.viewport)
        battle.backgroundGroup = new SprigganGroup(battle.gameGroup)
        battle.markersGroup = new SprigganGroup(battle.gameGroup)
        battle.charactersGroup = new SprigganGroup(battle.gameGroup)
        battle.effectsGroup = new SprigganGroup(battle.gameGroup)
        
        battle.bottomLeftUiViewport = new SprigganViewport(428, 240, "left", "bottom")
    
        battle.roomsLoaded.raise()
        battle.charactersLoaded.raise()
        var playPause = new SprigganSprite(battle.bottomLeftUiViewport, battle.contentManager, "battle", function() {
            if (battle.gameGroup.paused) {
                battle.gameGroup.resume()
                playPause.loop("pause")
            } else {
                battle.gameGroup.pause()
                playPause.loop("play")
            }
        })
        playPause.loop("pause")
    }
}