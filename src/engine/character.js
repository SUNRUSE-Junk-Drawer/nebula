function Character(faction, room, legLayerNames, torsoLayerNames, clicked) {
    var character = this
    character.faction = faction
    character.room = room
    character.legLayerNames = legLayerNames
    character.torsoLayerNames = torsoLayerNames
    character.layers = []
    character.destination = room
    character.facing = "down"
    character.room.game.characters.push(character)
    character.room.characters.push(character)
    character.room.game.contentManager.add(SprigganSpriteSheet, "character")
    character.contentLoaded = new SprigganEventOnce()
    
    faction.orderGiven.listen(function() {
        character.think()
    })
    
    character.room.game.contentLoaded.listen(function(){
        character.group = new SprigganGroup(character.room.game.charactersGroup, clicked)
        
        character.legSpriteGroup = new SpriteGroup(character.group, character.room.game.contentManager, "character", character.legLayerNames)
        character.legSpriteGroup.loop("idleDown")
        character.torsoSpriteGroup = new SpriteGroup(character.group, character.room.game.contentManager, "character", character.torsoLayerNames)
        character.torsoSpriteGroup.loop("idleDown")
        
        character.group.move(character.room.x * 64, character.room.y * 64)
        
        character.contentLoaded.raise()
        
        character.moving = false
        
        character.room.entered.raise(character)

        character.think()  
    })
}

Character.prototype.setDestination = function(room) {
    var character = this
    character.destination = room
    character.think()
}

Character.prototype.think = function() {
    var character = this
    
    if (!character.moving && character.room != character.destination) {
        var newDirection = character.room.navigateTo(function(room) {
            return room == character.destination
        })
        if (!newDirection) return
        character.facing = newDirection
        
        var link = character.room.links[character.facing]
        var next = link.roomOpposite(character.room)
        character.room.exited.raise(character)
        character.legSpriteGroup.loop("walk" + Capitalize(character.facing))
        
        SprigganRemoveByValue(character.room.characters, character)
        next.characters.push(character)
        character.room = next
        character.moving = true
        
        link.enteredBy(character)
        character.group.moveAtPixelsPerSecond(character.room.x * 64, character.room.y * 64, 100, function() {
            link.leftBy(character)
            character.moving = false
            character.room.arrived.raise(character)
            character.think()
        })
        character.room.entered.raise(character)
    }
    
    if (!character.moving) 
        character.legSpriteGroup.loop("idle" + Capitalize(character.facing))
    
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