function EnemyController() {
    this.roomsToInvestigate = []
}

MakeSubclass(ControllerBase, EnemyController)

EnemyController.prototype.setup = function() {}

EnemyController.prototype.getDirectionToMove = function() {
    var controller = this
    
    for (var i = 0; i < controller.game.factions.length; i++) {
        var faction = controller.game.factions[i]
        if (!controller.actor.faction.shouldAttack(faction)) continue
        for (var j = 0; j < faction.actors.length; j++) {
            var enemy = faction.actors[j]
            if (controller.actor.canAttack(enemy.room)) return null
        }
    }
    
    if (controller.roomsToInvestigate.length) {
        SprigganRemoveByValue(controller.roomsToInvestigate, controller.actor.room)
        return controller.actor.room.navigateTo(function(room) {
            return controller.roomsToInvestigate.indexOf(room) != -1
        })
    }
}

EnemyController.prototype.recordRoomToInvestigate = function(room) {
    if (this.roomsToInvestigate.indexOf(room) == -1) {
        this.roomsToInvestigate.push(room)
        this.actor.think()
        return true
    } else return false
}

EnemyController.prototype.hearSound = function(room) {
    this.recordRoomToInvestigate(room)
}

EnemyController.prototype.seeMotion = function(actor, fromRoom, toRoom) {
    if (!this.actor.faction.shouldAttack(actor.faction)) return
    this.recordRoomToInvestigate(toRoom)
}