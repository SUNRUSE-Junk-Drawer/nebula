function Tile(game, x, y) {
    var tile = this
    tile.game = game
    tile.x = x
    tile.y = y
    
    tile.game.tiles[y][x] = tile
    
    game.contentManager.add(SprigganSpriteSheet, "rooms/tiles")
    
    game.contentLoaded.listen(function(){
        tile.sprite = new SprigganSprite(game.tileGroup, game.contentManager, "rooms/tiles", function() {
            game.tileClicked(tile)
        })
        tile.sprite.loop("tile")
        tile.sprite.move(tile.x * 16, tile.y * 16)
    })
}

function TileRectangle(game, left, right, top, bottom) {
    for (var y = top; y <= bottom; y++) {
        for (var x = left; x <= right; x++) {
            new Tile(game, x, y)
        }
    }
}

function Decoration(game, type, x, y) {
    var decoration = this
    decoration.game = game
    decoration.type = type
    decoration.x = x
    decoration.y = y
    
    game.contentManager.add(SprigganSpriteSheet, "rooms/tiles")  

    game.contentLoaded.listen(function(){
        decoration.sprite = new SprigganSprite(game.decorationGroup, game.contentManager, "rooms/tiles")
        decoration.sprite.loop(type)
        decoration.sprite.move(decoration.x * 16, decoration.y * 16)
    })
}