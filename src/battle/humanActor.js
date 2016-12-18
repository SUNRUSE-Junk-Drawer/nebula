function HumanActor(faction, room, configuration, initialX, initialY, initialFacingDirection) {
    var actor = this
    actor.faction = faction
    actor.faction.actors.push(actor)
    actor.room = room
    actor.configuration = configuration
    actor.layers = []
    actor.destination = room
    actor.facing = initialFacingDirection
    actor.health = actor.healthLimit = 6
    actor.initialX = initialX
    actor.initialY = initialY
    
    faction.orderGiven.listen(function() {
        actor.think()
    })
}

HumanActor.prototype.setup = function() {
    var actor = this
    
    actor.room.game.contentLoaded.listen(function() {
        actor.group = new SprigganGroup(actor.room.game.actorsGroup, function() {
            actor.room.game.mode.clicked(actor)
        })
        
        var healthSpriteSpacing = 2
        
        actor.healthSprites = []
        while (actor.healthSprites.length < actor.healthLimit) {
            var healthSprite = new SprigganSprite(actor.group, BattleContent, "battle/markers")
            healthSprite.hide()
            healthSprite.loop("healthGood")
            healthSprite.move(healthSpriteSpacing * (actor.healthSprites.length + 0.5 - actor.healthLimit / 2), 0)
            actor.healthSprites.push(healthSprite)
        }
        
        actor.legSpriteGroup = new SpriteGroup(actor.group, BattleContent, "character", [actor.configuration.legs])
        actor.legSpriteGroup.loop("idleDown")
        actor.torsoSpriteGroup = new SpriteGroup(actor.group, BattleContent, "character", [actor.configuration.torso, actor.configuration.weapon, actor.configuration.hair])
        actor.torsoSpriteGroup.loop("idleDown")
        
        actor.group.move(actor.initialX, actor.initialY)
        
        actor.room.game.actors.push(actor)
        actor.room.actors.push(actor)
        
        actor.room.addIdleActor(actor, "up")
        
        actor.room.entered.raise(actor)
    })
}

HumanActor.prototype.hurt = function(damage) {
    if (!this.health) return
    
    var newHealth = Math.max(0, this.health - damage)
    
    if (this.health == this.healthLimit) 
        for (var i = 0; i < this.healthLimit; i++) this.healthSprites[i].show()
    
    for (var i = newHealth; i < this.health; i++)
        this.healthSprites[i].loop("healthBad")
    
    this.health = newHealth
    this.think()
    if (!this.health) {
        for (var i = 0; i < this.healthLimit; i++) this.healthSprites[i].dispose()
        this.legSpriteGroup.play("death")
        this.torsoSpriteGroup.play("death")
    }
}

HumanActor.prototype.setDestination = function(room) {
    var actor = this
    actor.destination = room
    actor.think()
}

HumanActor.prototype.think = function() {
    var actor = this
    
    if (!actor.health) return

    if (!actor.moving) {
        var newDirection = actor.controller.getDirectionToMove()
        
        if (!newDirection) {
            actor.destination = actor.room
            actor.moving = false
        } else {
            actor.room.removeIdleActor(actor)
            actor.facing = newDirection
            var link = actor.room.links[newDirection]
            var next = null
            if (link) next = link.roomOpposite(actor.room)
            actor.moving = true
            
            if (!actor.walking) {
                actor.walking = true
                var foot = "left"
                
                function TakeStep() {
                    foot = foot == "left" ? "right" : "left"
                    BattleContent.sounds.footstep.play()
                    actor.legSpriteGroup.play("walk" + (foot == "left" ? "A" : "B") + Capitalize(actor.facing), TakeStep)
                }
                
                TakeStep()
            }
            
            

            // Walking over a link is a four step process:
            // - Walk 20 pixels in front of the boundary our side.
            // - Walk to the boundary.  The room swap happens here.
            // - Walk 20 pixels in front of the boundary on the new side.
            // - Recurse to .think()
            
            var x = actor.room.x * actor.room.game.tileset.gridSpacing + DirectionOffsetX(actor.facing, actor.room.game.tileset.gridSpacing / 2)
            var y = actor.room.y * actor.room.game.tileset.gridSpacing + DirectionOffsetY(actor.facing, actor.room.game.tileset.gridSpacing / 2)
            var xDiff = DirectionOffsetX(actor.facing, actor.room.game.tileset.linkLength)
            var yDiff = DirectionOffsetY(actor.facing, actor.room.game.tileset.linkLength)
            
            actor.group.moveAtPixelsPerSecond(x - xDiff, y - yDiff, 100, function() {
                if (link) link.enteredBy(actor)
                actor.group.moveAtPixelsPerSecond(x, y , 100, function() {
                    SprigganRemoveByValue(actor.room.actors, actor)
                    if (next) next.actors.push(actor)
                    var previous = actor.room
                    actor.room = next
                    previous.left.raise(actor)
                    if (next) next.entered.raise(actor)
                    if (next) previous.emitMotion(actor, next)
                    if (link) {
                        actor.group.moveAtPixelsPerSecond(x + xDiff, y + yDiff, 100, function() {
                            link.leftBy(actor)
                            actor.moving = false
                            actor.room.addIdleActor(actor, newDirection)
                        })
                    }
                })
            })
        }
    }
    
    if (!actor.moving) {
        actor.walking = false
        
        var x = actor.room.x * actor.room.game.tileset.gridSpacing
        var y = actor.room.y * actor.room.game.tileset.gridSpacing
        if (actor.room.idleActors.length > 1) {
            var angle = actor.room.idleActors.indexOf(actor) * 2 * Math.PI / actor.room.idleActors.length
            x += Math.sin(angle) * 8
            y += Math.cos(angle) * 8
        }
        actor.group.moveAtPixelsPerSecond(x, y, 100)
        actor.legSpriteGroup.loop("idle" + Capitalize(actor.facing))
    }
    
    if (!actor.acting) {
        for (var i = 0; i < actor.faction.orders.length; i++) {
            if (actor.faction.orders[i].tryExecute(actor, function() {
                actor.acting = false
                actor.think()
            })) {
                actor.acting = true
                break
            }
        }
    }
    
    Items[actor.configuration.weapon].weapon.handle(actor)
    
    if (!actor.acting) {
        if (actor.moving)
            actor.torsoSpriteGroup.loop("walk" + Capitalize(actor.facing))
        else
            actor.torsoSpriteGroup.loop("idle" + Capitalize(actor.facing))
    }
}

HumanActor.prototype.say = function(text, horizontalAlignment, verticalAlignment) {
    this.stopSaying()
    this.speechGroup = SprigganWrite(this.group, sharedContent, "fontBig", fontBig, text, "center", "bottom")
    this.speechGroup.moveAtPixelsPerSecond(0, -12, 64)
}

HumanActor.prototype.stopSaying = function() {
    if (this.speechGroup) {
        this.speechGroup.dispose()
        this.speechGroup = null
    }
}

HumanActor.prototype.hearSound = function(room) {
    this.controller.hearSound(room)
}

HumanActor.prototype.seeMotion = function(actor, fromRoom, toRoom) {
    this.controller.seeMotion(actor, fromRoom, toRoom)
}