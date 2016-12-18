function ControllerBase() {}

ControllerBase.prototype.bindTo = function(actor) {
    this.actor = actor
    actor.controller = this
    this.game = actor.room.game
    actor.setup()
    this.setup()
}

ControllerBase.prototype.hearSound = function(room) {}
ControllerBase.prototype.seeMotion = function(actor, fromRoom, toRoom) {}