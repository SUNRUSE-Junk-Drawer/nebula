function EnemyController() {
    this.roomsToInvestigate = []
}

MakeSubclass(ControllerBase, EnemyController)

EnemyController.prototype.setup = function() {}

EnemyController.prototype.getDirectionToMove = function() {
    var controller = this
    if (controller.roomsToInvestigate.length) {
        
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