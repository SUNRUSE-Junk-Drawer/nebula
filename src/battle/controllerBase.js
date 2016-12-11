function ControllerBase() {}

ControllerBase.prototype.bindTo = function(actor) {
    this.actor = actor
    actor.controller = this
    this.game = actor.room.game
    actor.setup()
    this.setup()
}