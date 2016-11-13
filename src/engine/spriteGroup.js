function SpriteGroup(container, contentManager, spriteSheetUrl, prefixes) {
    this.sprites = []
    this.prefixes = prefixes
    while (this.sprites.length < this.prefixes.length) 
        this.sprites.push(new SprigganSprite(container, contentManager, spriteSheetUrl))
}

SpriteGroup.prototype.play = function(suffix, then) {
    suffix = Capitalize(suffix)
    for (var i = 0; i < this.sprites.length; i++)
        this.sprites[i].play(this.prefixes[i] + suffix, i == 0 ? then : null)
}

SpriteGroup.prototype.loop = function(suffix) {
    suffix = Capitalize(suffix)
    for (var i = 0; i < this.sprites.length; i++)
        this.sprites[i].loop(this.prefixes[i] + suffix)    
}