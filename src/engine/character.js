function Character(faction, room, layerNames, clicked) {
    var character = this
    character.faction = faction
    character.room = room
    character.layerNames = layerNames
    character.layers = []
    character.destination = room
    character.room.game.characters.push(character)
    character.room.characters.push(character)
    character.room.game.contentManager.add(SprigganSpriteSheet, "character")
    character.contentLoaded = new SprigganEventOnce()
    
    character.room.game.contentLoaded.listen(function(){
        character.group = new SprigganGroup(character.room.game.charactersGroup, clicked)
        
        while (character.layers.length < character.layerNames.length) 
            character.layers.push(new SprigganSprite(character.group, character.room.game.contentManager, "character"))
        
        character.loop("idle", "down")
        
        character.group.move(character.room.x * 64, character.room.y * 64)
        
        character.contentLoaded.raise()
        
        character.moving = false
        
        character.room.entered.raise(character)

        character.think()  
    })
}

Character.prototype.play = function(animation, direction, then) {
    if (direction) this.direction = direction
    
    for (var i = 0; i < this.layers.length; i++) {
        this.layers[i].play(this.layerNames[i] + Capitalize(animation) + Capitalize(this.direction), i == 0 ? then : null)
    }
}

Character.prototype.loop = function(animation, direction) {
    if (direction) this.direction = direction
    
    for (var i = 0; i < this.layers.length; i++) {
        this.layers[i].loop(this.layerNames[i] + Capitalize(animation) + Capitalize(this.direction))
    }
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
        var link = character.room.links[newDirection]
        var next = link.roomOpposite(character.room)
        character.room.exited.raise(character)
        character.loop("walk", newDirection)
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
    
    character.loop("idle")
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