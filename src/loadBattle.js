var BattleContent
var Battle

function LoadBattle() {    
    if (!BattleContent) {
        BattleContent = ShowLoadingScreen(function() {
            Battle = BattleContent.get(SprigganJavaScript, "battle.js")
            AfterLoading()
        })
        BattleContent.add(SprigganJavaScript, "battle.js")
        BattleContent.add(SprigganSpriteSheet, "battle/inventory")
        BattleContent.add(SprigganSpriteSheet, "character")
        BattleContent.add(SprigganSpriteSheet, "battle")
        BattleContent.add(SprigganSpriteSheet, "battle/itemPickups")
        BattleContent.add(SprigganSpriteSheet, "battle/markers")
        BattleContent.add(SprigganSpriteSheet, "effects")
        
        BattleContent.sounds = {
            footstep: new SoundSet(BattleContent, "battle/footstep", 4),
            pistolFire: new SoundSet(BattleContent, "battle/pistolFire", 4),
            pistolDraw: new SoundSet(BattleContent, "battle/pistolDraw", 1),
            pistolStow: new SoundSet(BattleContent, "battle/pistolStow", 1),
            throwWrench: new SoundSet(BattleContent, "battle/throwWrench", 1),
            hitWrench: new SoundSet(BattleContent, "battle/hitWrench", 1),
            pickUpWrench: new SoundSet(BattleContent, "battle/pickUpWrench", 1),
            openDoor: new SoundSet(BattleContent, "battle/openDoor", 1),
            closeDoor: new SoundSet(BattleContent, "battle/closeDoor", 1)
        }
    } else AfterLoading()
    
    function AfterLoading() {
        var savegame = {
            fromDoor: null,
            map: "tutorial/throwing",
            areaPath: "test",
            inventory: [],
            party: [{
                legs: "brownTrousers", 
                torso: "leatherJacket", 
                weapon: "sword", 
                hair: "orangeHair"
            }, {
                legs: "brownTrousers", 
                torso: "leatherJacket", 
                weapon: "pistol", 
                hair: "orangeHair"
            }]
        }
        while (savegame.inventory.length < 12) savegame.inventory.push(null)
        new Battle.Game(savegame)
    }
}