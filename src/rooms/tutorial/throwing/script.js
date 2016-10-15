return function(game) {
    game.contentManager.add(SprigganSpriteSheet, "rooms/tutorial/throwing/atlas")
    
    game.initializeRoom.listen(function() {
        //var base = new SprigganSprite(game.backgroundGroup, game.contentManager, "rooms/tutorial/throwing/atlas")
        //base.loop("base")
    })
    
    var pickup = new Room(game, "rooms/tutorial/throwing/atlas", "pickup", 291, 219)
    var spawn = new Room(game, "rooms/tutorial/throwing/atlas", "spawn", 256, 174)
    
    new Link(pickup, spawn, ["walkable"])
    new Link(spawn, pickup, ["walkable"])
    
    var pathToDistraction = new Room(game, "rooms/tutorial/throwing/atlas", "pathToDistraction", 195, 181)
    new Link(spawn, pathToDistraction, ["fall"])
    
    var distract = new Room(game, "rooms/tutorial/throwing/atlas", "distract", 123, 167)
    new Link(distract, pathToDistraction, ["walkable"])
    new Link(pathToDistraction, distract, ["walkable"])
    
    var pathToTargetA = new Room(game, "rooms/tutorial/throwing/atlas", "pathToTargetA", 119, 78)
    new Link(distract, pathToTargetA, ["walkable"])
    new Link(pathToTargetA, distract, ["walkable"])    
    
    var pathToTargetB = new Room(game, "rooms/tutorial/throwing/atlas", "pathToTargetB", 168, 49)
    new Link(pathToTargetB, pathToTargetA, ["walkable"])
    new Link(pathToTargetA, pathToTargetB, ["walkable"])        
    
    var pathToTargetC = new Room(game, "rooms/tutorial/throwing/atlas", "pathToTargetC", 249, 47)
    new Link(pathToTargetB, pathToTargetC, ["walkable"])
    new Link(pathToTargetC, pathToTargetB, ["walkable"])            
    
    var pathToTargetD = new Room(game, "rooms/tutorial/throwing/atlas", "pathToTargetD", 307, 56)
    new Link(pathToTargetD, pathToTargetC, ["walkable"])
    new Link(pathToTargetC, pathToTargetD, ["walkable"])            
    
    var target = new Room(game, "rooms/tutorial/throwing/atlas", "target", 316, 110)
    new Link(pathToTargetD, target, ["walkable"])
    new Link(target, pathToTargetD, ["walkable"])        

    var exit = new Room(game, "rooms/tutorial/throwing/atlas", "exit", 52, 185)
    new Link(distract, exit, ["walkable"])
    new Link(exit, distract, ["walkable"])        
    
    game.spawnRoom = spawn    
}