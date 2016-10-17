function Character(room) {
    var character = this
    character.room = room
    character.destination = room
    character.room.game.contentManager.add(SprigganSpriteSheet, "character")
    
    character.room.game.initializeParty.listen(function(){
        character.group = new SprigganGroup(character.room.game.charactersGroup)
        
        character.selectionMarker = new SprigganSprite(character.group, character.room.game.contentManager, "battle")
        character.selectionMarker.loop("selected")
        character.selectionMarker.hide()
        
        character.marker = new SprigganSprite(room.game.markersGroup, character.room.game.contentManager, "battle")
        character.marker.hide()
        
        character.sprite = new SprigganSprite(character.group, character.room.game.contentManager, "character", function() {
            character.room.game.characterClicked.raise(character)
        })
        character.sprite.loop("idleRight")
        character.group.move(character.room.x, character.room.y)
            
        character.room.game.characterClicked.listen(function(clickedCharacter) {
            if (character == clickedCharacter) {
                character.selected = !character.selected
            } else {
                character.selected = false
            }
            if (character.selected)
                character.selectionMarker.show()
            else
                character.selectionMarker.hide()
        })
        
        character.room.game.roomClicked.listen(function(room) {
            if (!character.selected) return
            character.selected = false
            character.selectionMarker.hide()
            character.marker.move(room.x, room.y)
            character.marker.loop("moving")
            character.marker.show()
            character.destination = room
            Think()
        })
        
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
            
            character.marker.hide()
            
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