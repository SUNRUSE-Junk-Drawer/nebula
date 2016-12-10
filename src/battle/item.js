function ShouldAttackCharacter(attacker, target) {
    if (!target.health) return false
    if (!attacker.faction.shouldAttack(target.faction)) return false
    return true
}

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
                        if (ShouldAttackCharacter(character, character.room.idleCharacters[i]))
                            return character.room.idleCharacters[i]
                    
                    for (var i = 0; i < character.room.characters.length; i++) 
                        if (ShouldAttackCharacter(character, character.room.characters[i]))
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
                                    enemy.hurt(3)
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
                        for (var i = 0; i < room.characters.length; i++) 
                            if (ShouldAttackCharacter(character, room.characters[i]))
                                enemies.push(room.characters[i])
                    })
                    
                    // TODO: Pick closest/best?
                    return enemies[0]
                }
                
                if (!character.acting) {
                    var enemy = FindEnemy()
                    if (enemy) {
                        character.acting = true
                        character.facing = DirectionBetween(character.group.x(), character.group.y(), enemy.group.x(), enemy.group.y())
                        BattleContent.sounds.pistolDraw.play()
                        character.torsoSpriteGroup.play("drawPistol" + Capitalize(character.facing), function() {
                            function Fire() {
                                var enemy = FindEnemy()
                                if (!enemy) {
                                    BattleContent.sounds.pistolStow.play()
                                    character.torsoSpriteGroup.play("stowPistol" + Capitalize(character.facing), function() {
                                        character.acting = false
                                        character.think()
                                    })
                                } else {
                                    character.facing = DirectionBetween(character.group.x(), character.group.y(), enemy.group.x(), enemy.group.y())
                                    character.torsoSpriteGroup.play("firePistol" + Capitalize(character.facing), Fire)
                                    BattleContent.sounds.pistolFire.play()
                                    var tracer = new SprigganSprite(character.room.game.effectsGroup, BattleContent, "effects")
                                    tracer.loop("pistolTracer" + Capitalize(character.facing))
                                    
                                    var x = character.group.x()
                                    var y = character.group.y()
                                    switch (character.facing) {
                                        case "down": 
                                            y += 10
                                            break
                                        case "up": 
                                            y -= 10
                                            break
                                        case "right": 
                                            x += 10
                                            break
                                        case "left": 
                                            x -= 10
                                            break
                                    }
                                    tracer.move(x, y)
                                    
                                    x = enemy.group.x()
                                    y = enemy.group.y()
                                    switch (character.facing) {
                                        case "down": 
                                            y -= 5
                                            break
                                        case "up": 
                                            y += 5
                                            break
                                        case "right": 
                                            x -= 5
                                            break
                                        case "left": 
                                            x += 5
                                            break
                                    }
                                    tracer.moveAtPixelsPerSecond(x, y, 600, function() {
                                        enemy.hurt(1)
                                        tracer.play("pistolImpact" + Capitalize(character.facing), function() {
                                            tracer.dispose()
                                        })
                                    })
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
            var sprite = new SprigganSprite(fromCharacter.room.game.effectsGroup, BattleContent, "battle/itemPickups")
            sprite.move(fromCharacter.group.x(), fromCharacter.group.y())
            sprite.loop("wrenchThrown")
            BattleContent.sounds.throwWrench.play()
            sprite.moveAtPixelsPerSecond(toRoom.x * toRoom.game.tileset.gridSpacing, toRoom.y * toRoom.game.tileset.gridSpacing, 250, function() {
                BattleContent.sounds.hitWrench.play()
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
        itemPickup.sprite = new SprigganSprite(room.game.itemPickupsGroup, BattleContent, "battle/itemPickups", function(){
            room.game.mode.clicked(itemPickup)
        })
        room.arrived.listen(PerformPickup)
        function PerformPickup(){
            if (!room.game.inventory.tryToAcquire(itemName)) return
            itemPickup.sprite.dispose()
            BattleContent.sounds.pickUpWrench.play()
            room.arrived.unlisten(PerformPickup)
        }
        itemPickup.sprite.loop("wrench")
        itemPickup.sprite.move(room.x * room.game.tileset.gridSpacing, room.y * room.game.tileset.gridSpacing)
    })
}