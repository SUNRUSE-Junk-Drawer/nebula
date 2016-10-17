function Inventory(game) {
    var inventory = this
    inventory.game = game
    inventory.opened = false
    inventory.viewport = new SprigganViewport(428, 240, "right", "bottom")
    inventory.icon = new SprigganSprite(inventory.viewport, game.contentManager, "battle", ToggleInventory)
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

function InventorySlot(inventory, x, y) {
    var inventorySlot = this
    inventorySlot.inventory = inventory
    inventorySlot.x = x
    inventorySlot.y = y
    inventorySlot.id = inventory.slots.length
    inventory.slots.push(inventorySlot)
    
    inventorySlot.sprite = new SprigganSprite(inventory.panelGroup, sharedContent, "items/icons", Clicked)
    
    function Clicked() {
        Items[inventory.game.savegame.inventory[inventorySlot.id]](inventory.game, inventorySlot.id)
    }
    
    inventorySlot.sprite.move(330 + x * 39, 63 + y * 39)
    
    inventorySlot.refresh()
}

InventorySlot.prototype.refresh = function() {
    var itemName = this.inventory.game.savegame.inventory[this.id]
    if (itemName) {
        this.sprite.loop(itemName)
        this.sprite.show()
    } else this.sprite.hide()
}