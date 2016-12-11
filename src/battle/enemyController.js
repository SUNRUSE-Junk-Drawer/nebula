function EnemyController(room) {
    var controller = this
    controller.game = room.game
    
    controller.character = new Character(controller.game.enemyFaction, room, "brownTrousers", "leatherJacket", "sword", "orangeHair", Clicked)
    
    function Clicked() {
        controller.game.mode.clicked(controller)
    }
}