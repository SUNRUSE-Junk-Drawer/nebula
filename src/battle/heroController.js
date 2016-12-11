function HeroController() {}

MakeSubclass(ControllerBase, HeroController)

HeroController.prototype.setup = function() {}

HeroController.prototype.getDirectionToMove = function() {
    var controller = this
    return controller.actor.room.navigateTo(function(room) {
        return room == controller.destination
    })
}