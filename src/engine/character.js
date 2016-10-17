function Character(room) {
    var character = this
    character.room = room
    character.destination = room
    character.room.game.contentManager.add(SprigganSpriteSheet, "character")
    
    character.room.game.contentLoaded.listen(function(){
        character.group = new SprigganGroup(character.room.game.charactersGroup)
        
        character.sprite = new SprigganSprite(character.group, character.room.game.contentManager, "character", function() {
            character.room.game.characterClicked(character)
        })
        character.sprite.loop("idleRight")
        character.group.move(character.room.x, character.room.y)
        
        var moving = false
        
        function Think() {
            if (moving) return
            
            if (character.room != character.destination) {
                var next = character.room.navigateTo(character.destination)
                if (next == null) return
                character.room.exited.raise(character)
                character.room = next
                moving = true
                character.group.moveAtPixelsPerSecond(character.room.x, character.room.y, 100, function() {
                    moving = false
                    character.room.arrived.raise(character)
                    Think()
                })
                character.room.entered.raise(character)
                return
            }
            
            if (character.room.game.orders.length) {
                character.room.game.orders.pop()(character)
                Think()
            }
        }
        
        character.room.entered.raise(character)
        character.room.game.orderGiven.listen(Think)
        
        Think()        
    })
}