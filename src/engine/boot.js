var sharedContent

var fontBig = {
    lineSpacing: 14,
    kerning: {
        "default": 6,
        "i": 2,
        "j": 2,
        "c": 5,
        "f": 4,
        "t": 5,
        "r": 5,
        "k": 5,
        "l": 4,
        " ": 3,
        ":": 2,
        ";": 3,
        "!": 2,
        "?": 5,
        "(": 4,
        ")": 4,
        "[": 4,
        "]": 4,
        "{": 4,
        "}": 4,
        "\t": 10,
        "-": 4,
        "'": 1,
        "\"": 4,
        "=": 5,
        "%": 5,
        "/": 5,
        "\\": 5,
        ",": 3,
        "I": 2,
        "|": 2
    }
}

function SprigganBoot(contentManager) {
    contentManager.add(SprigganSpriteSheet, "character")
    contentManager.add(SprigganSpriteSheet, "items/icons")
    contentManager.add(SprigganSpriteSheet, "fontBig")
    sharedContent = contentManager
    return function() {
        var savegame = {
            roomPath: "tutorial/throwing",
            areaPath: "test",
            inventory: []
        }
        while (savegame.inventory.length < 12) savegame.inventory.push(null)
        
        //new Game(savegame)
        new NavigationGame(savegame)
    }
}