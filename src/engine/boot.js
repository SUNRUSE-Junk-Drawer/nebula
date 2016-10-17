var sharedContent

function SprigganBoot(contentManager) {
    contentManager.add(SprigganSpriteSheet, "character")
    contentManager.add(SprigganSpriteSheet, "items/icons")
    sharedContent = contentManager
    return function() {
        var savegame = {
            roomPath: "tutorial/throwing",
            inventory: []
        }
        while (savegame.inventory.length < 12) savegame.inventory.push(null)
        
        new Game(savegame)
    }
}