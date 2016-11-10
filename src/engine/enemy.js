function Enemy(room) {
    var enemy = this
    enemy.game = room.game
    
    enemy.character = new Character(enemy.game.enemyFaction, room, Clicked)
    
    function Clicked() {
        enemy.game.mode.clicked(enemy)
    }
}