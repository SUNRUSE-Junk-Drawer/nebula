function Character(faction, room, legName, torsoName, weaponName, headName, clicked) {
    var character = this
    character.faction = faction
    character.room = room
    character.legName = legName
    character.torsoName = torsoName
    character.weaponName = weaponName
    character.headName = headName
    character.layers = []
    character.destination = room
    character.facing = "down"

    character.room.game.contentManager.add(SprigganSpriteSheet, "character")
    character.contentLoaded = new SprigganEventOnce()
    
    faction.orderGiven.listen(function() {
        character.think()
    })
    
    character.room.game.contentLoaded.listen(function(){
        character.group = new SprigganGroup(character.room.game.charactersGroup, clicked)
        
        character.legSpriteGroup = new SpriteGroup(character.group, character.room.game.contentManager, "character", [character.legName])
        character.legSpriteGroup.loop("idleDown")
        character.torsoSpriteGroup = new SpriteGroup(character.group, character.room.game.contentManager, "character", [character.torsoName, character.weaponName, character.headName])
        character.torsoSpriteGroup.loop("idleDown")
        
        character.group.move(character.room.x * 64, character.room.y * 64)
        
        character.room.game.characters.push(character)
        character.room.characters.push(character)
        
        character.contentLoaded.raise()
        
        character.room.addIdleCharacter(character, "up")
        
        character.room.arrived.raise(character)
    })
}

Character.prototype.setDestination = function(room) {
    var character = this
    character.destination = room
    character.think()
}

Character.prototype.think = function() {
    var character = this

    if (!character.moving) {
        var newDirection = character.room.navigateTo(function(room) {
            return room == character.destination
        })
        
        if (!newDirection) {
            character.destination = character.room
            character.moving = false
        } else {
            character.room.removeIdleCharacter(character)
            character.facing = newDirection
            var link = character.room.links[newDirection]
            var next = link.roomOpposite(character.room)
            character.moving = true
            
            character.legSpriteGroup.loop("walk" + Capitalize(character.facing))

            // Walking over a link is a four step process:
            // - Walk 20 pixels in front of the boundary our side.
            // - Walk to the boundary.  The room swap happens here.
            // - Walk 20 pixels in front of the boundary on the new side.
            // - Recurse to .think()
            
            var xDiff = 0, yDiff = 0
            
            switch (character.facing) {
                case "up":
                    yDiff = -20
                    break
                case "down":
                    yDiff = 20
                    break
                case "left":
                    xDiff = -20
                    break
                case "right":
                    xDiff = 20
                    break
            }
            
            var x = (next.x + character.room.x) * 32
            var y = (next.y + character.room.y) * 32
            
            character.group.moveAtPixelsPerSecond(x - xDiff, y - yDiff, 100, function() {
                link.enteredBy(character)
                character.group.moveAtPixelsPerSecond(x, y , 100, function() {
                    character.room = next
                    character.room.arrived.raise(character)
                    character.group.moveAtPixelsPerSecond(x + xDiff, y + yDiff, 100, function() {
                        link.leftBy(character)
                        character.moving = false
                        character.room.addIdleCharacter(character, newDirection)
                    })
                })
            })
        }
    }
    
    if (!character.moving) {
        var x = character.room.x * 64
        var y = character.room.y * 64
        if (character.room.idleCharacters.length > 1) {
            var angle = character.room.idleCharacters.indexOf(character) * 2 * Math.PI / character.room.idleCharacters.length
            x += Math.sin(angle) * 8
            y += Math.cos(angle) * 8
        }
        character.group.moveAtPixelsPerSecond(x, y, 100)
        character.legSpriteGroup.loop("idle" + Capitalize(character.facing))
    }
    
    if (!character.acting) {
        for (var i = 0; i < character.faction.orders.length; i++) {
            if (character.faction.orders[i].tryExecute(character, function() {
                character.acting = false
                character.think()
            })) {
                character.acting = true
                break
            }
        }
    }
    
    if (!character.acting) {
        if (character.moving)
            character.torsoSpriteGroup.loop("walk" + Capitalize(character.facing))
        else
            character.torsoSpriteGroup.loop("idle" + Capitalize(character.facing))
    }
}

Character.prototype.say = function(text, horizontalAlignment, verticalAlignment) {
    this.stopSaying()
    this.speechGroup = SprigganWrite(this.group, sharedContent, "fontBig", fontBig, text, "center", "bottom")
    this.speechGroup.moveAtPixelsPerSecond(0, -12, 64)
}

Character.prototype.stopSaying = function() {
    if (this.speechGroup) {
        this.speechGroup.dispose()
        this.speechGroup = null
    }
}