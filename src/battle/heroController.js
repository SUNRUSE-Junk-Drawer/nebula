function HeroController() {}

MakeSubclass(ControllerBase, HeroController)

HeroController.prototype.setup = function() {}

HeroController.prototype.getDirectionToMove = function() {
    var controller = this
    
    if (controller.game.mode instanceof ExitingMode) return controller.game.mode.exteriorDoor.position
    
    var destination
    if (controller.game.mode instanceof FindingExitMode) destination = controller.game.mode.exteriorDoor.room
    else destination = controller.destination
    
    return controller.actor.room.navigateTo(function(room) {
        return room == destination
    })
}