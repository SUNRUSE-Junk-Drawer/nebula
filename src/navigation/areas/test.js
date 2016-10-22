return function(navigationGame) {
    navigationGame.contentManager.add(SprigganSpriteSheet, "navigation/backgrounds/dark")
    navigationGame.contentLoaded.listen(function(){
        var background = new SprigganSprite(navigationGame.backgroundGroup, navigationGame.contentManager, "navigation/backgrounds/dark")
        background.loop("base")
        background.move(214, 120)
    })
    
    new NavigationOrbit(navigationGame, "bigPlanet", 30, -25)
    new NavigationOrbit(navigationGame, "asteroids", 80, 25)
    new NavigationOrbit(navigationGame, "twoMoon", 150, 0)
    new NavigationOrbit(navigationGame, "tradingStation", 210, 0)
    new NavigationOrbit(navigationGame, "solarStation", 260, 0)
    new NavigationOrbit(navigationGame, "protostar", 300, 0)
    new NavigationOrbit(navigationGame, "protostarCluster", 350, 0)
}