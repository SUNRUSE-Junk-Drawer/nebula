return function(game) {    
    var pickup = new Battle.Room(game, 1, 2)
    new Battle.ItemPickup(pickup, "wrench")
    var spawn = new Battle.Room(game, 1, 1)
    new Battle.ExteriorDoor(spawn, "right")
    
    var pathToDistraction = new Battle.Room(game, 0, 1)
    new Battle.Ledge(spawn, pathToDistraction)
    
    var distract = new Battle.Room(game, -1, 1)
    new Battle.ExteriorDoor(distract, "left")
    
    new Battle.Path(spawn, pickup)
    
    
    new Battle.InteriorDoor(pathToDistraction, distract)
    
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

    new Battle.Decoration(pathToTargetB, "top", "window")
    new Battle.Decoration(pathToTargetC, "top", "window")
    new Battle.Decoration(pathToTargetD, "top", "window")
    
    new Battle.EnemySpawnPoint(distract)
    new Battle.EnemySpawnPoint(distract)
    new Battle.EnemySpawnPoint(distract)
    new Battle.EnemySpawnPoint(distract)
    new Battle.EnemySpawnPoint(distract)
    
    game.spawnRoom = spawn    
    game.tilesetName = "leviathan"
}