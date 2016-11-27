function Faction(game) {
    var faction = this
    faction.game = game
    faction.enemyFactions = []
    faction.orders = []
    
    faction.orderGiven = new SprigganEventRecurring()
    
    faction.game.factions.push(faction)
}

Faction.prototype.shouldAttack = function(faction) {
    return this.enemyFactions.indexOf(faction) != -1
}

function Animosity(factionA, factionB) {
    var animosity = this
    animosity.between = [factionA, factionB]
    factionA.enemyFactions.push(factionB)
    factionB.enemyFactions.push(factionA)
}