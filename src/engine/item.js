var Items = {
    wrench: function(game, index) {
        game.targetRoom(function(room) {
            game.inventory.remove(index)
            game.giveOrder(function(character) {
                var thrown = new SprigganSprite(character.room.game.effectsGroup, sharedContent, "items/icons")
                thrown.loop("wrench")
                thrown.move(character.group.x(), character.group.y())
                thrown.moveAtPixelsPerSecond(room.x * 64, room.y * 64, 500, function() {
                    thrown.dispose()
                    new ItemPickup(room, "wrench")
                })
            })
        })
    }
}

function ItemPickup(room, itemName) {
    var itemPickup = this
    itemPickup.room = room
    room.game.contentLoaded.listen(function(){
        itemPickup.sprite = new SprigganSprite(room.game.itemPickupsGroup, sharedContent, "items/icons", function(){
            room.game.itemPickupClicked(itemPickup)
        })
        room.arrived.listen(PerformPickup)
        function PerformPickup(){
            if (room.game.inventory.tryToAcquire(itemName)) itemPickup.sprite.dispose()
            room.arrived.unlisten(PerformPickup)
        }
        itemPickup.sprite.loop("wrench")
        itemPickup.sprite.move(room.x * 64, room.y * 64)
    })
}