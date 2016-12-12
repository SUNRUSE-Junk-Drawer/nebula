function HumanActor(faction, room, legName, torsoName, weaponName, headName, initialX, initialY, initialFacingDirection) {
    var actor = this
    actor.faction = faction
    actor.faction.actors.push(actor)
    actor.room = room
    actor.legName = legName
    actor.torsoName = torsoName
    actor.weaponName = weaponName
    actor.headName = headName
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
        
        actor.legSpriteGroup = new SpriteGroup(actor.group, BattleContent, "character", [actor.legName])
        actor.legSpriteGroup.loop("idleDown")
        actor.torsoSpriteGroup = new SpriteGroup(actor.group, BattleContent, "character", [actor.torsoName, actor.weaponName, actor.headName])
        actor.torsoSpriteGroup.loop("idleDown")
        
        actor.group.move(actor.initialX, actor.initialY)
        
        actor.room.game.actors.push(actor)
        actor.room.actors.push(actor)
        
        actor.room.addIdleActor(actor, "up")
        
        actor.room.arrived.raise(actor)
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
            var next = link.roomOpposite(actor.room)
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
            
            var xDiff = 0, yDiff = 0
            
            switch (actor.facing) {
                case "up":
                    yDiff = -actor.room.game.tileset.linkLength
                    break
                case "down":
                    yDiff = actor.room.game.tileset.linkLength
                    break
                case "left":
                    xDiff = -actor.room.game.tileset.linkLength
                    break
                case "right":
                    xDiff = actor.room.game.tileset.linkLength
                    break
            }
            
            var x = (next.x + actor.room.x) * actor.room.game.tileset.gridSpacing / 2
            var y = (next.y + actor.room.y) * actor.room.game.tileset.gridSpacing / 2
            
            actor.group.moveAtPixelsPerSecond(x - xDiff, y - yDiff, 100, function() {
                link.enteredBy(actor)
                actor.group.moveAtPixelsPerSecond(x, y , 100, function() {
                    SprigganRemoveByValue(actor.room.actors, actor)
                    next.actors.push(actor)
                    actor.room = next
                    actor.room.arrived.raise(actor)
                    actor.group.moveAtPixelsPerSecond(x + xDiff, y + yDiff, 100, function() {
                        link.leftBy(actor)
                        actor.moving = false
                        actor.room.addIdleActor(actor, newDirection)
                    })
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
    
    Items[actor.weaponName].weapon.handle(actor)
    
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