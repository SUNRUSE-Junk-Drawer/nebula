function Order(faction, markerContainer, markerContentManager, markerAnimationName, markerX, markerY, canExecute, execute, onCancel) {
    var order = this
    
    order.faction = faction
    order.canExecute = canExecute
    order.execute = execute
    order.onCancel = onCancel
    
    order.faction.orders.push(order)
    
    order.markerSprite = new SprigganSprite(markerContainer, markerContentManager, "battle", function() {
        order.cancel()
    })
    order.markerSprite.move(markerX, markerY)
    order.markerSprite.loop(markerAnimationName)    
    
    order.faction.orderGiven.raise()
}

Order.prototype.tryExecute = function(character) {
    if (!this.canExecute(character)) return false
    SprigganRemoveByValue(this.faction.orders, this)
    this.markerSprite.dispose()
    this.execute(character)
    return true
}

Order.prototype.cancel = function() {
    SprigganRemoveByValue(this.faction.orders, this)
    this.markerSprite.dispose()
    this.onCancel()
}