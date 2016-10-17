function Character(room) {
    var character = this
    character.room = room
    character.destination = room
    character.room.game.contentManager.add(SprigganSpriteSheet, "character")
    
    character.room.game.contentLoaded.listen(function(){
        character.group = new SprigganGroup(character.room.game.charactersGroup)
        
        character.selectedSprite = new SprigganSprite(character.group, character.room.game.contentManager, "battle", PassClickOn)
        character.selectedSprite.loop("selected")
        character.selectedSprite.hide()
        
        character.sprite = new SprigganSprite(character.group, character.room.game.contentManager, "character", PassClickOn)
        character.sprite.loop("idleRight")        
        
        function PassClickOn() {
            character.room.game.characterClicked(character)
        }
        
        character.group.move(character.room.x, character.room.y)
        
        character.moving = false
        
        character.room.entered.raise(character)
        character.room.game.orderGiven.listen(function(){
            character.think()
        })
        
        character.room.game.selectedCharacterChanged.listen(function(selected){
            if (character == selected)
                character.selectedSprite.show()
            else
                character.selectedSprite.hide()
        })
        
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
        var next = character.room.navigateTo(character.destination)
        if (next == null) return
        character.room.exited.raise(character)
        character.room = next
        character.moving = true
        character.group.moveAtPixelsPerSecond(character.room.x, character.room.y, 100, function() {
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