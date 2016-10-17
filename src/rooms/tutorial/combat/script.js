return function(game) {
    game.contentManager.add(SprigganSpriteSheet, "rooms/tutorial/combat/atlas")
    
    var entrance = new Room(game, "rooms/tutorial/combat/atlas", "entrance", 337, 176)
    var pathToEntrance = new Room(game, "rooms/tutorial/combat/atlas", "pathToEntrance", 284, 174)
    
    new Link(entrance, pathToEntrance, ["walkable"])     
    new Link(pathToEntrance, entrance, ["walkable"])     
    
    var arena = new Room(game, "rooms/tutorial/combat/atlas", "arena", 197, 159)

    new Link(arena, pathToEntrance, ["walkable"])     
    new Link(pathToEntrance, arena, ["walkable"])     
    
    var pathToAlarmExit = new Room(game, "rooms/tutorial/combat/atlas", "pathToAlarmExit", 195, 73)

    new Link(arena, pathToAlarmExit, ["walkable"])     
    new Link(pathToAlarmExit, arena, ["walkable"])     
    
    var alarmExit = new Room(game, "rooms/tutorial/combat/atlas", "alarmExit", 195, 26)

    new Link(alarmExit, pathToAlarmExit, ["walkable"])     
    new Link(pathToAlarmExit, alarmExit, ["walkable"])     
    
    var storeroomExit = new Room(game, "rooms/tutorial/combat/atlas", "storeroomExit", 203, 230)

    new Link(arena, storeroomExit, ["walkable"])     
    new Link(storeroomExit, arena, ["walkable"])     
    
    game.spawnRoom = entrance    
}