function Capitalize(str) {
    return str[0].toUpperCase() + str.slice(1)
}

function DirectionBetween(fromX, fromY, toX, toY) {    
    if (Math.abs(fromX - toX) > Math.abs(fromY - toY)) {
        if (toX > fromX)
            return "right"
        else
            return "left"
    } else {
        if (toY > fromY)
            return "down"
        else
            return "up"
    }
}

function DirectionOffsetX(direction, amount) {
    switch (direction) {
        case "left": return -amount
        case "right": return amount
        default: return 0
    }
}

function DirectionOffsetY(direction, amount) {
    switch (direction) {
        case "up": return -amount
        case "down": return amount
        default: return 0
    }
}

function ReverseDirection(direction) {
    switch (direction) {
        case "up": return "down"
        case "down": return "up"
        case "left": return "right"
        case "right": return "up"
        case null: return null
    }
}

function MakeSubclass(base, sub) {
    sub.prototype = Object.create(base.prototype)
}