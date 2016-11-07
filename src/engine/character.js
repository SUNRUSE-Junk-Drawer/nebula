function Character(room, clicked) {
    var character = this
    character.room = room
    character.destination = room
    character.room.game.contentManager.add(SprigganSpriteSheet, "character")
    character.contentLoaded = new SprigganEventOnce()
    
    character.room.game.contentLoaded.listen(function(){
        character.group = new SprigganGroup(character.room.game.charactersGroup)
        
        character.sprite = new SprigganSprite(character.group, character.room.game.contentManager, "character", clicked)
        character.sprite.loop("walkLeft")        
        
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
        var link = character.room.navigateTo(character.destination)
        if (link == null) return
        var next = link.roomOpposite(character.room)
        character.room.exited.raise(character)
        if (next.x > character.room.x) character.sprite.loop("walkRight")
        if (next.x < character.room.x) character.sprite.loop("walkLeft")
        if (next.y > character.room.y) character.sprite.loop("walkDown")
        if (next.y < character.room.y) character.sprite.loop("walkUp")
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
    
    if (character.room.game.orders.length) {
        character.room.game.orders.pop()(character)
        character.think()
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