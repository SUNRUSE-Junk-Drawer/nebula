function Faction(game) {
    var faction = this
    faction.game = game
    faction.enemyFactions = []
    faction.actors = []
    faction.orders = []
    
    faction.orderGiven = new SprigganEventRecurring()
    
    faction.game.factions.push(faction)
}

Faction.prototype.shouldAttack = function(faction) {
    return this.enemyFactions.indexOf(faction) != -1
}

Faction.prototype.think = function() {
    for (var i = 0; i < this.actors.length; i++)
        this.actors[i].think()
}

function Animosity(factionA, factionB) {
    var animosity = this
    animosity.between = [factionA, factionB]
    factionA.enemyFactions.push(factionB)
    factionB.enemyFactions.push(factionA)
}