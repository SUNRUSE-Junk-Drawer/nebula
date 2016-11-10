function Character(faction, room, clicked) {
    var character = this
    character.faction = faction
    character.room = room
    character.direction = "down"
    character.destination = room
    character.room.characters.push(character)
    character.room.game.contentManager.add(SprigganSpriteSheet, "character")
    character.contentLoaded = new SprigganEventOnce()
    
    character.room.game.contentLoaded.listen(function(){
        character.group = new SprigganGroup(character.room.game.charactersGroup)
        
        character.sprite = new SprigganSprite(character.group, character.room.game.contentManager, "character", clicked)
        character.sprite.loop("idle" + Capitalize(character.direction))
        
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
    
    if (character.moving) return
    
    if (character.room != character.destination) {
        var newDirection = character.room.navigateTo(character.destination)
        if (!newDirection) return
        character.direction = newDirection
        var link = character.room.links[newDirection]
        var next = link.roomOpposite(character.room)
        character.room.exited.raise(character)
        character.sprite.loop("walk" + Capitalize(character.direction))
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
        
        return
    }
    
    character.sprite.loop("idle" + Capitalize(character.direction))
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