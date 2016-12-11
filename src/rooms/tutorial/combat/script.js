return function(game) {    
    var doorToThrowing = new Battle.Room(game, 0, 0)
    new Battle.ExteriorDoor(doorToThrowing, "right", null, "tutorial/throwing")
    
    game.spawnRoom = doorToThrowing    
    game.tilesetName = "leviathan"
}