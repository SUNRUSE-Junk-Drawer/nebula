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