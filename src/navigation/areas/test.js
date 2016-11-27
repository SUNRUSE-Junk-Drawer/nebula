return function(game) {
    game.areaName = "Test Sector"
    game.parentAreaPath = "testLoop"
    game.parentAreaName = "Loopback Sector"
    
    game.contentManager.add(SprigganSpriteSheet, "navigation/backgrounds/dark")
    game.contentLoaded.listen(function(){
        var background = new SprigganSprite(game.backgroundGroup, game.contentManager, "navigation/backgrounds/dark")
        background.loop("base")
        background.move(214 + 72, 120)
    })
    
    new Navigation.Destination(game, "bigPlanet", "Lone Moon", "testLoop", 30, -25)
    new Navigation.Destination(game, "asteroids", "Rocky Band", "testLoop", 80, 25)
    new Navigation.Destination(game, "twoMoon", "Two's Company", "testLoop", 150, 0)
    new Navigation.Destination(game, "tradingStation", "Last O2 For 10^10 Lightyears", "testLoop", 210, 50)
    new Navigation.Destination(game, "solarStation", "SunCap Inc.", "testLoop", 260, -20)
    new Navigation.Destination(game, "protostar", "Agatha's Eye", "testLoop", 300, 20)
    new Navigation.Destination(game, "protostarCluster", "The Huddle", "testLoop", 350, 0)
}