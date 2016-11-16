var Items = {
    wrench: {
        "throw": function(fromCharacter, toRoom) {
            var sprite = new SprigganSprite(fromCharacter.room.game.effectsGroup, sharedContent, "items/icons")
            sprite.move(fromCharacter.group.x(), fromCharacter.group.y())
            sprite.loop("wrench")
            sprite.moveAtPixelsPerSecond(toRoom.x * 64, toRoom.y * 64, 250, function() {
                sprite.dispose()
                new ItemPickup(toRoom, "wrench")
            })
        }
    }
}

function ItemPickup(room, itemName) {
    var itemPickup = this
    itemPickup.room = room
    room.game.contentLoaded.listen(function(){
        itemPickup.sprite = new SprigganSprite(room.game.itemPickupsGroup, sharedContent, "items/icons", function(){
            room.game.mode.clicked(itemPickup)
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