var Items = {
    wrench: function(game, index) {
        game.target("room", function(room) {
            game.giveOrder(function(character) {
                game.inventory.remove(index)
                var thrown = new SprigganSprite(character.room.game.effectsGroup, sharedContent, "items/icons")
                thrown.loop("wrench")
                thrown.move(character.group.x(), character.group.y())
                thrown.moveAtPixelsPerSecond(room.x, room.y, 500, function() {
                    thrown.dispose()
                    new ItemPickup(room, "wrench")
                })
            })
        })
    }
}

function ItemPickup(room, itemName) {
    var itemPickup = this
    room.game.initializeParty.listen(function(){
        itemPickup.sprite = new SprigganSprite(room.game.itemPickupsGroup, sharedContent, "items/icons", function(){
            room.game.roomClicked.raise(room)
        })
        room.arrived.listen(PerformPickup)
        function PerformPickup(){
            if (room.game.inventory.tryToAcquire(itemName)) itemPickup.sprite.dispose()
            room.arrived.unlisten(PerformPickup)
        }
        itemPickup.sprite.loop("wrench")
        itemPickup.sprite.move(room.x, room.y)
    })
}