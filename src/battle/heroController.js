function HeroController() {}

MakeSubclass(ControllerBase, HeroController)

HeroController.prototype.setup = function() {}

HeroController.prototype.getDirectionToMove = function() {
    var controller = this
    
    var destination
    if (controller.game.mode instanceof ExitingMode) destination = controller.game.mode.exteriorDoor.room
    else destination = controller.destination
    
    return controller.actor.room.navigateTo(function(room) {
        return room == destination
    })
}