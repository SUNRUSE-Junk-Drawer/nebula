var sharedContent

var fontBig = {
    lineSpacing: 6,
    lineHeight: 8,
    letterSpacing: 1,
    kerning: {
        "default": 5,
        "i": 1,
        "j": 1,
        "c": 4,
        "f": 3,
        "t": 4,
        "r": 4,
        "k": 4,
        "l": 3,
        " ": 2,
        ":": 1,
        ";": 2,
        "!": 1,
        "?": 4,
        "(": 3,
        ")": 3,
        "[": 3,
        "]": 3,
        "{": 3,
        "}": 3,
        "\t": 9,
        "-": 3,
        "_": 6,
        "'": 1,
        "\"": 4,
        "=": 4,
        "%": 4,
        "/": 4,
        "\\": 4,
        ",": 2,
        "I": 1,
        "|": 1,
        ".": 1
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