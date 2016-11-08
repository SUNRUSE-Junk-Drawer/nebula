function Faction() {
    var faction = this
    faction.enemyFactions = []
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