// Represents a place characters can stand.
function Room(game, x, y, sprite) {
    var room = this
    room.game = game
    room.x = x
    room.y = y
    room.links = {}
    room.entered = new SprigganEventRecurring()
    room.exited = new SprigganEventRecurring()
    room.arrived = new SprigganEventRecurring()
    room.characters = []
    room.idleCharacters = []
    game.contentLoaded.listen(function(){
        room.sprite = new SprigganSprite(game.backgroundGroup, game.contentManager, game.tilesetSpriteSheet, function(){
            room.game.mode.clicked(room)
        })
        room.sprite.move(room.x * 64, room.y * 64)
        room.sprite.loop(sprite || "room")
    })
}

Room.prototype.addIdleCharacter = function(character, facing) {
    if (this.idleCharacters.indexOf(character) != -1) return
        
    // Try and find the "best" place in the list given the characters run
    // counter clockwise from south.
    if (!this.idleCharacters.length) {
        this.idleCharacters.push(character)
    } else if (this.idleCharacters.length == 1) {     
        switch(facing) {
            case "up":                
                // Start of array, south.
                this.idleCharacters.unshift(character)   
                break
                
            case "down":               
                // End of array, north.
                this.idleCharacters.push(character)
                break
                
            default:                
                if (Math.random() >= 0.5)
                    this.idleCharacters.push(character)
                else
                    this.idleCharacters.unshift(character)   
                break
        }
    } else {
        switch (facing) {
            case "left":
                this.idleCharacters.splice(Math.ceil(this.idleCharacters.length / 4), 0, character)
                break
            case "right":
                this.idleCharacters.splice(Math.ceil(this.idleCharacters.length * 3 / 4), 0, character)
                break
            case "up":
                this.idleCharacters.unshift(character) 
                break
            case "down":
                this.idleCharacters.splice(Math.ceil(this.idleCharacters.length / 2), 0, character)
                break
        }
    }
    
    for (var i = 0; i < this.idleCharacters.length; i++) this.idleCharacters[i].think()
}

Room.prototype.removeIdleCharacter = function(character) {
    if (this.idleCharacters.indexOf(character) == -1) return
    
    SprigganRemoveByValue(this.idleCharacters, character)
    for (var i = 0; i < this.idleCharacters.length; i++) this.idleCharacters[i].think()
}

// Given a destination room, returns the direction in which to go to reach it.
// Throws errors when the destination room is inaccessible or this room.
Room.prototype.navigateTo = function(checkIsDestination) {
    if (checkIsDestination(this)) return null
    
    var best = Infinity
    var bestOption = null
    
    // Floodfill from each link from this room.
    for (var key in this.links) {
        var checked = [{
            room: this,
            distance: 0
        }]
        
        function Recurse(fromRoom, link, distance) {
            if (!link.walkable(fromRoom)) return Infinity
            var toRoom = link.roomOpposite(fromRoom)
            if (checkIsDestination(toRoom)) return distance
            
            var obj, i
            
            for (i = 0; i < checked.length; i++) {
                obj = checked[i]
                if (obj.room != toRoom) continue
                if (obj.distance <= distance) return Infinity
                obj.distance = distance
                break
            }
            
            if (i == checked.length) {
                obj = { room: toRoom, distance: distance }
                checked.push(obj)
            }
            
            var best = Infinity
            
            for (var key in toRoom.links) {
                var linkDistance = Recurse(toRoom, toRoom.links[key], distance + 1)
                if (linkDistance < best) best = linkDistance
            }
            
            return best
        }
        
        var dist = Recurse(this, this.links[key], 1)
        if (dist >= best) continue
        best = dist
        bestOption = key
    }
    
    return bestOption
}

Room.prototype.emitLineOfSight = function(distance, waistHigh, callback) {
    var room = this
    callback(room)
    
    for (var key in room.links) {
        var fromRoom = room
        var link = room.links[key]
        var travelled = 0
        while (link) {
            if (travelled++ > distance) break
            if (link.blocksLineOfSight(fromRoom)) break
            if (waistHigh && link.blocksLineOfSightBelowWaist(fromRoom)) break
            var nextRoom = link.roomOpposite(fromRoom)
            callback(nextRoom)
            link = nextRoom.links[key]
            fromRoom = nextRoom
        }
    }
}

Room.prototype.getDirectionToRoom = function (toRoom) {
    if (this.x == toRoom.x) {
        if (this.y > toRoom.y)
            return "up"
        else if (this.y < toRoom.y)
            return "down"
    } else if (this.y == toRoom.y) {
        if (this.x > toRoom.x)
            return "left"
        else
            return "right"
    }
    
    return null
}

Room.prototype.hasLineOfSightToRoom = function (toRoom, waistHigh) {
    if (this == toRoom) return true
    var direction = this.getDirectionToRoom(toRoom)
    if (!direction) return false
    
    var fromRoom = this
    while (fromRoom != toRoom) {
        var link = fromRoom.links[direction]
        if (!link) return false
        if (link.blocksLineOfSight(fromRoom)) return false
        if (waistHigh && link.blocksLineOfSightBelowWaist(fromRoom)) return false
        fromRoom = link.roomOpposite(fromRoom)
    }
    
    return true
}

function MakeLink(type) {
    type.prototype.roomOpposite = function(room) {
        return room == this.fromRoom ? this.toRoom : this.fromRoom
    }
    
    type.prototype.enteredBy = function(character) {}
    type.prototype.leftBy = function(character) {}
    
    type.prototype.blocksLineOfSight = function(fromRoom) {
        return false
    }

    type.prototype.blocksLineOfSightBelowWaist = function(fromRoom) {
        return false
    }
    
    type.prototype.linkToRooms = function() {
        if (this.fromRoom.y == this.toRoom.y) {
            this.orientation = "horizontal"
            if (this.fromRoom.x > this.toRoom.x) {
                this.direction = "left"
                this.fromRoom.links.left = this
                this.toRoom.links.right = this
            } else {
                this.direction = "right"
                this.fromRoom.links.right = this
                this.toRoom.links.left = this            
            }
        } else {
            this.orientation = "vertical"
            if (this.fromRoom.y > this.toRoom.y) {
                this.direction = "up"
                this.fromRoom.links.up = this
                this.toRoom.links.down = this
            } else {
                this.direction = "down"
                this.fromRoom.links.down = this
                this.toRoom.links.up = this            
            }
            return "Horizontal"
        }
    }
}

function Door(fromRoom, toRoom, sprite) {
    var door = this
    door.users = 0
    door.fromRoom = fromRoom
    door.toRoom = toRoom
    door.linkToRooms()
    
    door.animationPrefix = (sprite || "door") + Capitalize(door.orientation)
    
    door.game = toRoom.game
    
    door.game.contentLoaded.listen(function() {
        door.sprite = new SprigganSprite(door.game.backgroundOverlayGroup, door.game.contentManager, door.game.tilesetSpriteSheet)
        door.sprite.move((fromRoom.x + toRoom.x) * 32, (fromRoom.y + toRoom.y) * 32)
        door.sprite.loop(door.animationPrefix + "Closed")
        
        door.foregroundSprite = new SprigganSprite(door.game.foregroundGroup, door.game.contentManager, door.game.tilesetSpriteSheet)
        door.foregroundSprite.move((fromRoom.x + toRoom.x) * 32, (fromRoom.y + toRoom.y) * 32)
        door.foregroundSprite.loop(door.animationPrefix + "Foreground")
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

Door.prototype.walkable = function(fromRoom) {
    return true
}

Door.prototype.blocksLineOfSight = function(fromRoom) {
    return !this.users
}

function Path(fromRoom, toRoom, sprite) {
    var path = this
    path.fromRoom = fromRoom
    path.toRoom = toRoom
    path.linkToRooms()
    path.game = toRoom.game
    path.game.contentLoaded.listen(function() {
        path.sprite = new SprigganSprite(path.game.backgroundOverlayGroup, path.game.contentManager, path.game.tilesetSpriteSheet)
        path.sprite.move((fromRoom.x + toRoom.x) * 32, (fromRoom.y + toRoom.y) * 32)
        path.sprite.loop((sprite || "path") + Capitalize(path.orientation))
    })
}

MakeLink(Path)

Path.prototype.walkable = function(fromRoom) {
    return true
}

function Ledge(fromRoom, toRoom, sprite) {
    var ledge = this
    ledge.fromRoom = fromRoom
    ledge.toRoom = toRoom
    ledge.linkToRooms()
    ledge.game = toRoom.game
    ledge.game.contentLoaded.listen(function() {
        ledge.sprite = new SprigganSprite(ledge.game.backgroundOverlayGroup, ledge.game.contentManager, ledge.game.tilesetSpriteSheet)
        ledge.sprite.move((fromRoom.x + toRoom.x) * 32, (fromRoom.y + toRoom.y) * 32)
        ledge.sprite.loop((sprite || "ledge") + Capitalize(ledge.direction))
    })
}

MakeLink(Ledge)

Ledge.prototype.walkable = function(fromRoom) {
    return fromRoom == this.fromRoom
}

function Decoration(room, position, sprite) {
    var decoration = this
    decoration.room = room
    decoration.game = room.game
    decoration.game.contentLoaded.listen(function() {
        decoration.sprite = new SprigganSprite(decoration.game.backgroundOverlayGroup, decoration.game.contentManager, decoration.game.tilesetSpriteSheet)
        decoration.sprite.move(room.x * 64, room.y * 64)
        decoration.sprite.loop(sprite + position[0].toUpperCase() + position.slice(1))
    })
}