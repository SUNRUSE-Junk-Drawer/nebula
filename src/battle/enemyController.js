function EnemyController(room) {
    var controller = this
    controller.game = room.game
    
    controller.actor = new HumanActor(controller.game.enemyFaction, room, "brownTrousers", "leatherJacket", "sword", "orangeHair", Clicked)
    
    function Clicked() {
        controller.game.mode.clicked(controller)
    }
}