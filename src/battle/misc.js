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

function MakeSubclass(base, sub) {
    sub.prototype = Object.create(base.prototype)
}