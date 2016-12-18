function ShouldAttackActor(attacker, target) {
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
            handle: function(actor) {
                function FindEnemy() {                    
                    // Prioritize people who aren't leaving.
                    for (var i = 0; i < actor.room.idleActors.length; i++)
                        if (ShouldAttackActor(actor, actor.room.idleActors[i]))
                            return actor.room.idleActors[i]
                    
                    for (var i = 0; i < actor.room.actors.length; i++) 
                        if (ShouldAttackActor(actor, actor.room.actors[i]))
                            return actor.room.actors[i]
                        
                    return null
                }
                
                if (!actor.acting) {
                    var enemy = FindEnemy()
                    if (enemy) {
                        actor.acting = true
                        actor.facing = DirectionBetween(actor.group.x(), actor.group.y(), enemy.group.x(), enemy.group.y())
                        actor.torsoSpriteGroup.play("drawSword" + Capitalize(actor.facing), function() {
                            var swiped = false
                            function Swipe() {
                                var enemy = FindEnemy()
                                if (!enemy) {
                                    actor.torsoSpriteGroup.play("stowSword" + Capitalize(actor.facing), function() {
                                        actor.acting = false
                                        actor.think()
                                    })
                                } else {
                                    enemy.hurt(3)
                                    actor.facing = DirectionBetween(actor.group.x(), actor.group.y(), enemy.group.x(), enemy.group.y())
                                    actor.torsoSpriteGroup.play("swipeSword" + (swiped ? "B" : "A") + Capitalize(actor.facing), Swipe)
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
            handle: function(actor) {
                function FindEnemy() {
                    var enemies = []
                    actor.room.emitLineOfSight(1000, true, function(room) {
                        for (var i = 0; i < room.actors.length; i++) 
                            if (ShouldAttackActor(actor, room.actors[i]))
                                enemies.push(room.actors[i])
                    })
                    
                    // TODO: Pick closest/best?
                    return enemies[0]
                }
                
                if (!actor.acting) {
                    var enemy = FindEnemy()
                    if (enemy) {
                        actor.acting = true
                        actor.facing = DirectionBetween(actor.group.x(), actor.group.y(), enemy.group.x(), enemy.group.y())
                        BattleContent.sounds.pistolDraw.play()
                        actor.torsoSpriteGroup.play("drawPistol" + Capitalize(actor.facing), function() {
                            function Fire() {
                                var enemy = FindEnemy()
                                if (!enemy) {
                                    BattleContent.sounds.pistolStow.play()
                                    actor.torsoSpriteGroup.play("stowPistol" + Capitalize(actor.facing), function() {
                                        actor.acting = false
                                        actor.think()
                                    })
                                } else {
                                    actor.facing = DirectionBetween(actor.group.x(), actor.group.y(), enemy.group.x(), enemy.group.y())
                                    actor.torsoSpriteGroup.play("firePistol" + Capitalize(actor.facing), Fire)
                                    BattleContent.sounds.pistolFire.play()
                                    var tracer = new SprigganSprite(actor.room.game.effectsGroup, BattleContent, "effects")
                                    tracer.loop("pistolTracer" + Capitalize(actor.facing))
                                    
                                    var x = actor.group.x()
                                    var y = actor.group.y()
                                    switch (actor.facing) {
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
                                    switch (actor.facing) {
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
                                        tracer.play("pistolImpact" + Capitalize(actor.facing), function() {
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
        "throw": function(fromActor, toRoom) {
            var sprite = new SprigganSprite(fromActor.room.game.effectsGroup, BattleContent, "battle/itemPickups")
            sprite.move(fromActor.group.x(), fromActor.group.y())
            sprite.loop("wrenchThrown")
            BattleContent.sounds.throwWrench.play()
            sprite.moveAtPixelsPerSecond(toRoom.x * toRoom.game.tileset.gridSpacing, toRoom.y * toRoom.game.tileset.gridSpacing, 250, function() {
                toRoom.emitSound(20)
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
        room.entered.listen(PerformPickup)
        function PerformPickup(character) {
            if (!(character.controller instanceof HeroController)) return
            if (!room.game.inventory.tryToAcquire(itemName)) return
            itemPickup.sprite.dispose()
            BattleContent.sounds.pickUpWrench.play()
            room.entered.unlisten(PerformPickup)
        }
        itemPickup.sprite.loop("wrench")
        itemPickup.sprite.move(room.x * room.game.tileset.gridSpacing, room.y * room.game.tileset.gridSpacing)
    })
}