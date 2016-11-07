return function(game) {
    game.contentManager.add(SprigganSpriteSheet, "rooms/tutorial/throwing/atlas")
    
    var pickup = new Room(game, 1, 2)
    new ItemPickup(pickup, "wrench")
    var spawn = new Room(game, 1, 1)
    
    var pathToDistraction = new Room(game, 0, 1)
    new Ledge(spawn, pathToDistraction)
    
    var distract = new Room(game, -1, 1)
    
    new Arch(spawn, pickup)
    
    
    new Door(pathToDistraction, distract)
    
    var pathToTargetA = new Room(game, -1, 0)
    
    new Arch(distract, pathToTargetA)
    
    var pathToTargetB = new Room(game, -1, -1)
    
    new Arch(pathToTargetA, pathToTargetB)
    
    var pathToTargetC = new Room(game, 0, -1)
    
    new Arch(pathToTargetB, pathToTargetC)
    
    var pathToTargetD = new Room(game, 1, -1)
    
    new Arch(pathToTargetC, pathToTargetD)          
    
    var target = new Room(game, 1, 0)
    new Ledge(spawn, target)
    
    new Arch(pathToTargetD, target)
    
    //new Link(pathToTargetD, target, ["walkable"])
    //new Link(target, pathToTargetD, ["walkable"])        

    //var exit = new Door(game, -3, 1, "tutorial/combat")
    //new Link(distract, exit, ["walkable"])
    //new Link(exit, distract, ["walkable"])   

    new Window(pathToTargetB, "top")
    new Window(pathToTargetC, "top")
    new Window(pathToTargetD, "top")
    
    game.spawnRoom = spawn    
}