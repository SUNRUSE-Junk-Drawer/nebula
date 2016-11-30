return function(game) {    
    var pickup = new Battle.Room(game, 1, 2)
    new Battle.ItemPickup(pickup, "wrench")
    var spawn = new Battle.Room(game, 1, 1)
    
    var pathToDistraction = new Battle.Room(game, 0, 1)
    new Battle.Ledge(spawn, pathToDistraction)
    
    var distract = new Battle.Room(game, -1, 1)
    
    new Battle.Path(spawn, pickup)
    
    
    new Battle.Door(pathToDistraction, distract)
    
    var pathToTargetA = new Battle.Room(game, -1, 0)
    
    new Battle.Path(distract, pathToTargetA)
    
    var pathToTargetB = new Battle.Room(game, -1, -1)
    
    new Battle.Path(pathToTargetA, pathToTargetB)
    
    var pathToTargetC = new Battle.Room(game, 0, -1)
    
    new Battle.Path(pathToTargetB, pathToTargetC)
    
    var pathToTargetD = new Battle.Room(game, 1, -1)
    
    new Battle.Path(pathToTargetC, pathToTargetD)          
    
    var target = new Battle.Room(game, 1, 0)
    new Battle.Ledge(spawn, target)
    
    new Battle.Path(pathToTargetD, target)
    
    //new Link(pathToTargetD, target, ["walkable"])
    //new Link(target, pathToTargetD, ["walkable"])        

    //var exit = new Door(game, -3, 1, "tutorial/combat")
    //new Link(distract, exit, ["walkable"])
    //new Link(exit, distract, ["walkable"])   

    new Battle.Window(pathToTargetB, "top")
    new Battle.Window(pathToTargetC, "top")
    new Battle.Window(pathToTargetD, "top")
    
    game.spawnRoom = spawn    
    game.tilesetName = "leviathan"
}