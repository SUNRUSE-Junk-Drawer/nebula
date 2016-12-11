function HeroController(room, weapon) {
    var heroController = this
    heroController.game = room.game
    
    heroController.character = new Character(heroController.game.partyFaction, room, "brownTrousers", "leatherJacket", weapon, "orangeHair", Clicked)
    
    function Clicked() {
        heroController.game.mode.clicked(heroController)
    }
    
    // partyMember.character.contentLoaded.listen(function() {
        // partyMember.selectedSprite = new SprigganSprite(partyMember.character.group, partyMember.game.contentManager, "battle", Clicked)
        // partyMember.selectedSprite.loop("selected")
        // partyMember.selectedSprite.hide()
    // })
    
    // partyMember.game.selectedPartyMemberChanged.listen(function(selected){        
        // if (partyMember == selected)
            // partyMember.selectedSprite.show()
        // else
            // partyMember.selectedSprite.hide()
    // })
}