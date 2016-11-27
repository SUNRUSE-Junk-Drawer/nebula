function Inventory(game) {
    var inventory = this
    inventory.game = game
    inventory.opened = false
    inventory.viewport = new SprigganViewport(428, 240, "right", "bottom")
    inventory.icon = new SprigganSprite(inventory.viewport, BattleContent, "battle", ToggleInventory)
    function ToggleInventory() {
        inventory.opened = !inventory.opened
        inventory.refresh()
    }
    
    inventory.panelGroup = new SprigganGroup(inventory.viewport)
    inventory.panelGroup.move(120, 0)
    inventory.panelBackground = new SprigganSprite(inventory.panelGroup, game.contentManager, "battle")
    inventory.panelBackground.loop("inventoryPanel")
    
    inventory.slots = []
    for (var y = 0; y < 4; y++) {
        for (var x = 0; x < 3; x++) {
            new InventorySlot(inventory, x, y)
        }
    }
    
    inventory.refresh()     
}

Inventory.prototype.close = function() {
    this.opened = false
    this.refresh()
}

Inventory.prototype.refresh = function() {
    this.icon.loop(this.opened ? "inventoryOpened" : "inventoryClosed")
    this.panelGroup.moveAtPixelsPerSecond(this.opened ? 0 : 120, 0, 1000)
}

Inventory.prototype.tryToAcquire = function(itemName) {
    var inventory = this
    for (var i = 0; i < inventory.game.savegame.inventory.length; i++) {
        if (inventory.game.savegame.inventory[i]) continue
        inventory.game.savegame.inventory[i] = itemName
        inventory.slots[i].refresh()
        inventory.icon.play("inventoryAdded", function() {
            inventory.refresh()
        })
        return true
    }
    inventory.icon.play("inventoryFull", function() {
        inventory.refresh()
    })
    return false
}

Inventory.prototype.remove = function(index) {
    this.game.savegame.inventory[index] = null
    this.slots[index].refresh()
}

Inventory.prototype.dispose = function() {
    this.viewport.dispose()
}

function InventorySlot(inventory, x, y) {
    var inventorySlot = this
    inventorySlot.inventory = inventory
    inventorySlot.x = x
    inventorySlot.y = y
    inventorySlot.reserved = false
    inventorySlot.id = inventory.slots.length
    inventory.slots.push(inventorySlot)
    
    inventorySlot.group = new SprigganGroup(inventory.panelGroup, function() {
        inventory.game.mode.clicked(inventorySlot)
    })
    
    inventorySlot.group.move(330 + x * 39, 63 + y * 39)
    
    inventorySlot.itemSprite = new SprigganSprite(inventorySlot.group, BattleContent, "items/icons")
    inventorySlot.statusSprite = new SprigganSprite(inventorySlot.group, BattleContent, "battle")

    inventorySlot.refresh()
}

InventorySlot.prototype.refresh = function() {    
    this.itemName = this.inventory.game.savegame.inventory[this.id]
    if (this.itemName) {
        this.item = Items[this.itemName]
        this.itemSprite.loop(this.itemName)
        this.itemSprite.show()
        this.statusSprite.loop("inventorySlot" + (this.reservedFor ? Capitalize(this.reservedFor) : "Occupied"))
        
    } else {
        this.item = null
        this.itemSprite.hide()
        this.statusSprite.loop("inventorySlotEmpty")
    }
}

InventorySlot.prototype.replace = function(withItemName) {
    this.inventory.game.savegame.inventory[this.id] = withItemName
    this.reserveFor(null)
}

InventorySlot.prototype.reserveFor = function(actionName) {
    this.reservedFor = actionName
    this.refresh()
}