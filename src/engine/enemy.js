function Enemy(room) {
    var enemy = this
    enemy.game = room.game
    
    enemy.character = new Character(room, Clicked)
    
    function Clicked() {
        enemy.game.enemyClicked(enemy)
    }
}