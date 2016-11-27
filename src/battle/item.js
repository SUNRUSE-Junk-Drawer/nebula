var Items = {
    sword: {
        weapon: {
            damage: 4,
            canAttack: function(fromRoom, toRoom, targetCrouching) {
                return fromRoom == toRoom
            },
            handle: function(character) {
                function FindEnemy() {
                    // Prioritize people who aren't leaving.
                    for (var i = 0; i < character.room.idleCharacters.length; i++) 
                        if (character.faction.shouldAttack(character.room.idleCharacters[i].faction)) 
                            return character.room.idleCharacters[i]
                    
                    for (var i = 0; i < character.room.characters.length; i++) 
                        if (character.faction.shouldAttack(character.room.characters[i].faction)) 
                            return character.room.characters[i]
                        
                    return null
                }
                
                if (!character.acting) {
                    var enemy = FindEnemy()
                    if (enemy) {
                        character.acting = true
                        character.facing = DirectionBetween(character.group.x(), character.group.y(), enemy.group.x(), enemy.group.y())
                        character.torsoSpriteGroup.play("drawSword" + Capitalize(character.facing), function() {
                            var swiped = false
                            function Swipe() {
                                var enemy = FindEnemy()
                                if (!enemy) {
                                    character.torsoSpriteGroup.play("stowSword" + Capitalize(character.facing), function() {
                                        character.acting = false
                                        character.think()
                                    })
                                } else {
                                    character.facing = DirectionBetween(character.group.x(), character.group.y(), enemy.group.x(), enemy.group.y())
                                    character.torsoSpriteGroup.play("swipeSword" + (swiped ? "B" : "A") + Capitalize(character.facing), Swipe)
                                    swiped = !swiped
                                }
                            }
                            
                            Swipe()
                        })
                    }
                }
            }
        }
    },
    pistol: {
        weapon: {
            damage: 1,
            canAttack: function(fromRoom, toRoom, targetCrouching) {
                return fromRoom.hasLineOfSightToRoom(toRoom, targetCrouching)
            },
            handle: function(character) {
                function FindEnemy() {
                    var enemies = []
                    character.room.emitLineOfSight(1000, true, function(room) {
                        for (var i = 0; i < room.characters.length; i++) {
                            var enemy = room.characters[i]
                            if (!character.faction.shouldAttack(enemy.faction)) continue
                            enemies.push(enemy)
                        }
                    })
                    
                    // TODO: Pick closest/best?
                    return enemies[0]
                }
                
                if (!character.acting) {
                    var enemy = FindEnemy()
                    if (enemy) {
                        character.acting = true
                        character.facing = DirectionBetween(character.group.x(), character.group.y(), enemy.group.x(), enemy.group.y())
                        character.torsoSpriteGroup.play("drawPistol" + Capitalize(character.facing), function() {
                            function Fire() {
                                var enemy = FindEnemy()
                                if (!enemy) {
                                    character.torsoSpriteGroup.play("stowPistol" + Capitalize(character.facing), function() {
                                        character.acting = false
                                        character.think()
                                    })
                                } else {
                                    character.facing = DirectionBetween(character.group.x(), character.group.y(), enemy.group.x(), enemy.group.y())
                                    character.torsoSpriteGroup.play("firePistol" + Capitalize(character.facing), Fire)
                                }
                            }
                            
                            Fire()
                        })
                    }
                }
            }
        }
    },
    wrench: {
        "throw": function(fromCharacter, toRoom) {
            var sprite = new SprigganSprite(fromCharacter.room.game.effectsGroup, BattleContent, "items/icons")
            sprite.move(fromCharacter.group.x(), fromCharacter.group.y())
            sprite.loop("wrench")
            sprite.moveAtPixelsPerSecond(toRoom.x * 64, toRoom.y * 64, 250, function() {
                sprite.dispose()
                new ItemPickup(toRoom, "wrench")
            })
        }
    }
}

function ItemPickup(room, itemName) {
    var itemPickup = this
    itemPickup.room = room
    room.game.contentLoaded.listen(function(){
        itemPickup.sprite = new SprigganSprite(room.game.itemPickupsGroup, BattleContent, "items/icons", function(){
            room.game.mode.clicked(itemPickup)
        })
        room.arrived.listen(PerformPickup)
        function PerformPickup(){
            if (room.game.inventory.tryToAcquire(itemName)) itemPickup.sprite.dispose()
            room.arrived.unlisten(PerformPickup)
        }
        itemPickup.sprite.loop("wrench")
        itemPickup.sprite.move(room.x * 64, room.y * 64)
    })
}