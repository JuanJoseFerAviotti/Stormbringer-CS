const Rules = {

    BASE_STAT: 8,
    MAX_STAT: 20,

    getModifier(score){
        return Math.floor((score - 10) / 2);
    },

    getMaxPoints(level){
        return 41 + level * 4;
    },
    

 getMaxHealth(stats){
    return Math.floor(stats.constitution / 2 + getModifier(stats.strength)+6);
},
 getArmor(stats){
    return 10+getModifier(stats.agility);
    
},
  getMaxStamina(stats){

    return Math.max(
        1,
        getModifier(stats.constitution) *
        (1 + Math.floor((character.level + 1) / 6))
    );

},
 
 getMaxMana(stats){
    return stats.soul;
},

    getStatCost(score){

    let cost = 0;


    // Going below base gives points back
    if(score < this.BASE_STAT){

        for(let i = this.BASE_STAT; i > score; i--){

            cost -= 2;

        }

        return cost;
    }


    // Buying above base
    while(score > this.BASE_STAT){

        if(score <= 15)
            cost += 2;
        else
            cost += score - 12;

        score--;

    }


    return cost;

}

};