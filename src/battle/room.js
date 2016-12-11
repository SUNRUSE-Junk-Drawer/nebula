// Represents a place actors can stand.
function Room(game, x, y, sprite) {
    var room = this
    room.game = game
    room.x = x
    room.y = y
    room.links = {}
    room.entered = new SprigganEventRecurring()
    room.exited = new SprigganEventRecurring()
    room.arrived = new SprigganEventRecurring()
    room.actors = []
    room.idleActors = []
    game.contentLoaded.listen(function(){
        room.sprite = new SprigganSprite(game.backgroundGroup, game.contentManager, game.tilesetSpriteSheet, function(){
            room.game.mode.clicked(room)
        })
        room.sprite.move(room.x * room.game.tileset.gridSpacing, room.y * room.game.tileset.gridSpacing)
        room.sprite.loop(sprite || "room")
    })
}

Room.prototype.addIdleActor = function(actor, facing) {
    if (this.idleActors.indexOf(actor) != -1) return
        
    // Try and find the "best" place in the list given the actors run
    // counter clockwise from south.
    if (!this.idleActors.length) {
        this.idleActors.push(actor)
    } else if (this.idleActors.length == 1) {     
        switch(facing) {
            case "up":                
                // Start of array, south.
                this.idleActors.unshift(actor)   
                break
                
            case "down":               
                // End of array, north.
                this.idleActors.push(actor)
                break
                
            default:                
                if (Math.random() >= 0.5)
                    this.idleActors.push(actor)
                else
                    this.idleActors.unshift(actor)   
                break
        }
    } else {
        switch (facing) {
            case "left":
                this.idleActors.splice(Math.ceil(this.idleActors.length / 4), 0, actor)
                break
            case "right":
                this.idleActors.splice(Math.ceil(this.idleActors.length * 3 / 4), 0, actor)
                break
            case "up":
                this.idleActors.unshift(actor) 
                break
            case "down":
                this.idleActors.splice(Math.ceil(this.idleActors.length / 2), 0, actor)
                break
        }
    }
    
    for (var i = 0; i < this.idleActors.length; i++) this.idleActors[i].think()
}

Room.prototype.removeIdleActor = function(actor) {
    if (this.idleActors.indexOf(actor) == -1) return
    
    SprigganRemoveByValue(this.idleActors, actor)
    for (var i = 0; i < this.idleActors.length; i++) this.idleActors[i].think()
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
    
    type.prototype.enteredBy = function(actor) {}
    type.prototype.leftBy = function(actor) {}
    
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

function InteriorDoor(fromRoom, toRoom, sprite) {
    var interiorDoor = this
    interiorDoor.users = 0
    interiorDoor.fromRoom = fromRoom
    interiorDoor.toRoom = toRoom
    interiorDoor.linkToRooms()
    
    interiorDoor.animationPrefix = (sprite || "interiorDoor") + Capitalize(interiorDoor.orientation)
    
    interiorDoor.game = toRoom.game
    
    interiorDoor.game.contentLoaded.listen(function() {
        interiorDoor.sprite = new SprigganSprite(interiorDoor.game.backgroundOverlayGroup, interiorDoor.game.contentManager, interiorDoor.game.tilesetSpriteSheet)
        interiorDoor.sprite.move((fromRoom.x + toRoom.x) * fromRoom.game.tileset.gridSpacing / 2, (fromRoom.y + toRoom.y) * fromRoom.game.tileset.gridSpacing / 2)
        interiorDoor.sprite.loop(interiorDoor.animationPrefix + "Closed")
        
        interiorDoor.foregroundSprite = new SprigganSprite(interiorDoor.game.foregroundGroup, interiorDoor.game.contentManager, interiorDoor.game.tilesetSpriteSheet)
        interiorDoor.foregroundSprite.move((fromRoom.x + toRoom.x) * fromRoom.game.tileset.gridSpacing / 2, (fromRoom.y + toRoom.y) * fromRoom.game.tileset.gridSpacing / 2)
        interiorDoor.foregroundSprite.loop(interiorDoor.animationPrefix + "Foreground")
    })
}

MakeLink(InteriorDoor)

InteriorDoor.prototype.enteredBy = function(actor) {
    var interiorDoor = this
    if (!interiorDoor.users) {
        BattleContent.sounds.openDoor.play()
        interiorDoor.sprite.play(interiorDoor.animationPrefix + "Opening", function() {
            interiorDoor.sprite.loop(interiorDoor.animationPrefix + "Opened")
        })
    }
    interiorDoor.users++
}

InteriorDoor.prototype.leftBy = function(actor) {
    var interiorDoor = this
    interiorDoor.users--
    if (!interiorDoor.users) {
        BattleContent.sounds.closeDoor.play()
        interiorDoor.sprite.play(interiorDoor.animationPrefix + "Closing", function() {            
            interiorDoor.sprite.loop(interiorDoor.animationPrefix + "Closed")
        })
    }
}

InteriorDoor.prototype.walkable = function(fromRoom) {
    return true
}

InteriorDoor.prototype.blocksLineOfSight = function(fromRoom) {
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
        path.sprite.move((fromRoom.x + toRoom.x) * fromRoom.game.tileset.gridSpacing / 2, (fromRoom.y + toRoom.y) * fromRoom.game.tileset.gridSpacing / 2)
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
        ledge.sprite.move((fromRoom.x + toRoom.x) * fromRoom.game.tileset.gridSpacing / 2, (fromRoom.y + toRoom.y) * fromRoom.game.tileset.gridSpacing / 2)
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
        decoration.sprite.move(room.x * room.game.tileset.gridSpacing, room.y * room.game.tileset.gridSpacing)
        decoration.sprite.loop(sprite + position[0].toUpperCase() + position.slice(1))
    })
}

function ExteriorDoor(room, position, sprite) {
    var exteriorDoor = this
    exteriorDoor.room = room
    exteriorDoor.game = room.game
    var spritePrefix = (sprite || "exteriorDoor") + Capitalize(position)
    exteriorDoor.game.contentLoaded.listen(function() {
        exteriorDoor.sprite = new SprigganSprite(exteriorDoor.game.backgroundOverlayGroup, exteriorDoor.game.contentManager, exteriorDoor.game.tilesetSpriteSheet)
        exteriorDoor.sprite.move(room.x * room.game.tileset.gridSpacing, room.y * room.game.tileset.gridSpacing)
        exteriorDoor.sprite.loop(spritePrefix + "Closed")
        exteriorDoor.foregroundSprite = new SprigganSprite(exteriorDoor.game.foregroundGroup, exteriorDoor.game.contentManager, exteriorDoor.game.tilesetSpriteSheet)
        exteriorDoor.foregroundSprite.move(room.x * room.game.tileset.gridSpacing, room.y * room.game.tileset.gridSpacing)
        exteriorDoor.foregroundSprite.loop(spritePrefix + "Foreground")
    })
}

function EnemySpawnPoint(room) {
    var enemySpawnPoint = this
    enemySpawnPoint.room = room
    enemySpawnPoint.game = room.game
    enemySpawnPoint.game.contentLoaded.listen(function() {
        new EnemyController().bindTo(new HumanActor(enemySpawnPoint.game.enemyFaction, enemySpawnPoint.room, "brownTrousers", "leatherJacket", "pistol", "orangeHair"))
    })
}