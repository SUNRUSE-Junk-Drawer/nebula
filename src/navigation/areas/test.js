return function(navigationGame) {
    navigationGame.areaName = "Test Sector"
    navigationGame.parentAreaPath = "testLoop"
    navigationGame.parentAreaName = "Loopback Sector"
    
    navigationGame.contentManager.add(SprigganSpriteSheet, "navigation/backgrounds/dark")
    navigationGame.contentLoaded.listen(function(){
        var background = new SprigganSprite(navigationGame.backgroundGroup, navigationGame.contentManager, "navigation/backgrounds/dark")
        background.loop("base")
        background.move(214 + 72, 120)
    })
    
    new NavigationOrbit(navigationGame, "bigPlanet", "Lone Moon", "testLoop", 30, -25)
    new NavigationOrbit(navigationGame, "asteroids", "Rocky Band", "testLoop", 80, 25)
    new NavigationOrbit(navigationGame, "twoMoon", "Two's Company", "testLoop", 150, 0)
    new NavigationOrbit(navigationGame, "tradingStation", "Last O2 For 10^10 Lightyears", "testLoop", 210, 50)
    new NavigationOrbit(navigationGame, "solarStation", "SunCap Inc.", "testLoop", 260, -20)
    new NavigationOrbit(navigationGame, "protostar", "Agatha's Eye", "testLoop", 300, 20)
    new NavigationOrbit(navigationGame, "protostarCluster", "The Huddle", "testLoop", 350, 0)
}