function PartyMember(room, weapon) {
    var partyMember = this
    partyMember.game = room.game
    
    partyMember.character = new Character(partyMember.game.partyFaction, room, "brownTrousers", "leatherJacket", weapon, "orangeHair", Clicked)
    
    function Clicked() {
        partyMember.game.mode.clicked(partyMember)
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