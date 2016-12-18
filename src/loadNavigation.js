var NavigationContent
var Navigation

function LoadNavigation() {    
    if (!NavigationContent) {
        NavigationContent = ShowLoadingScreen(function() {
            Navigation = NavigationContent.get(SprigganJavaScript, "navigation.js")
            AfterLoading()
        })
        NavigationContent.add(SprigganJavaScript, "navigation.js")
    } else AfterLoading()
    
    function AfterLoading() {
        var savegame = {
            map: "tutorial/throwing",
            areaPath: "test",
            inventory: []
        }
        while (savegame.inventory.length < 12) savegame.inventory.push(null)
        
        new Navigation.Game(savegame)
    }
}