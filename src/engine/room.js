// Represents a place characters can stand.
function Room(game, x, y) {
    var room = this
    room.game = game
    room.x = x
    room.y = y
    room.links = []
    room.entered = new SprigganEventRecurring()
    room.exited = new SprigganEventRecurring()
    room.arrived = new SprigganEventRecurring()
    game.contentManager.add(SprigganSpriteSheet, "rooms/rooms")
    game.contentLoaded.listen(function(){
        room.sprite = new SprigganSprite(game.backgroundGroup, game.contentManager, "rooms/rooms", function(){
            game.roomClicked(room)
        })
        room.sprite.move(room.x * 64, room.y * 64)
        room.sprite.loop("room")
    })
}

// A Room which changes the room when all party members are inside.
function Door(game, spriteSheetUrl, x, y, roomPath) {
    Room.call(this, game, spriteSheetUrl, x, y)
    this.arrived.listen(function() {
        game.dispose()
        game.savegame.roomPath = roomPath
        new Game(game.savegame)
    })
}

// Given a destination room, returns the link to follow to reach it.
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
                var linkDistance = Recurse(node.links[i].roomOpposite(node), distance + 1)
                if (linkDistance < best) best = linkDistance
            }
            
            return best
        }
        
        var dist = Recurse(this.links[i].roomOpposite(this), 1)
        if (dist >= best) continue
        best = dist
        bestOption = this.links[i]
    }
    
    if (bestOption) return bestOption
    
    throw new Error("No route found")
}

function MakeLink(type) {
    type.prototype.roomOpposite = function(room) {
        return room == this.fromRoom ? this.toRoom : this.fromRoom
    }
    
    type.prototype.enteredBy = function(character) {}
    type.prototype.leftBy = function(character) {}
}

function Door(fromRoom, toRoom) {
    var door = this
    door.users = 0
    door.fromRoom = fromRoom
    door.fromRoom.links.push(door)
    door.toRoom = toRoom
    door.toRoom.links.push(door)
    door.game = toRoom.game
    door.game.contentManager.add(SprigganSpriteSheet, "rooms/rooms")
    door.animationPrefix = "door" + (fromRoom.x == toRoom.x ? "Vertical" : "Horizontal")
    door.game.contentLoaded.listen(function() {
        door.sprite = new SprigganSprite(door.game.backgroundOverlayGroup, door.game.contentManager, "rooms/rooms")
        door.sprite.move((fromRoom.x + toRoom.x) * 32, (fromRoom.y + toRoom.y) * 32)
        door.sprite.loop(door.animationPrefix + "Closed")
    })
}

MakeLink(Door)

Door.prototype.enteredBy = function(character) {
    var door = this
    if (!door.users) door.sprite.play(door.animationPrefix + "Opening", function() {
        door.sprite.loop(door.animationPrefix + "Opened")
    })
    door.users++
}

Door.prototype.leftBy = function(character) {
    var door = this
    door.users--
    if (!door.users) door.sprite.play(door.animationPrefix + "Closing", function() {
        door.sprite.loop(door.animationPrefix + "Closed")
    })
}

function Arch(fromRoom, toRoom) {
    var arch = this
    arch.fromRoom = fromRoom
    arch.fromRoom.links.push(arch)
    arch.toRoom = toRoom
    arch.toRoom.links.push(arch)
    arch.game = toRoom.game
    arch.game.contentManager.add(SprigganSpriteSheet, "rooms/rooms")
    arch.game.contentLoaded.listen(function() {
        arch.sprite = new SprigganSprite(arch.game.backgroundOverlayGroup, arch.game.contentManager, "rooms/rooms")
        arch.sprite.move((fromRoom.x + toRoom.x) * 32, (fromRoom.y + toRoom.y) * 32)
        arch.sprite.loop("arch" + (fromRoom.x == toRoom.x ? "Vertical" : "Horizontal"))
    })
}

MakeLink(Arch)

function Ledge(fromRoom, toRoom) {
    var ledge = this
    ledge.fromRoom = fromRoom
    ledge.fromRoom.links.push(ledge)
    ledge.toRoom = toRoom
    ledge.game = toRoom.game
    ledge.game.contentManager.add(SprigganSpriteSheet, "rooms/rooms")
    ledge.game.contentLoaded.listen(function() {
        ledge.sprite = new SprigganSprite(ledge.game.backgroundOverlayGroup, ledge.game.contentManager, "rooms/rooms")
        ledge.sprite.move((fromRoom.x + toRoom.x) * 32, (fromRoom.y + toRoom.y) * 32)
        if (toRoom.y < fromRoom.y) ledge.sprite.loop("ledgeUp")
        if (toRoom.y > fromRoom.y) ledge.sprite.loop("ledgeDown")
        if (toRoom.x < fromRoom.x) ledge.sprite.loop("ledgeLeft")
        if (toRoom.x > fromRoom.x) ledge.sprite.loop("ledgeRight")
    })
}

MakeLink(Ledge)

function Window(room, position) {
    var window = this
    window.room = room
    window.game = room.game
    window.game.contentManager.add(SprigganSpriteSheet, "rooms/rooms")
    window.game.contentLoaded.listen(function() {
        window.sprite = new SprigganSprite(window.game.backgroundOverlayGroup, window.game.contentManager, "rooms/rooms")
        window.sprite.move(room.x * 64, room.y * 64)
        window.sprite.loop("window" + position[0].toUpperCase() + position.slice(1))
    })
}