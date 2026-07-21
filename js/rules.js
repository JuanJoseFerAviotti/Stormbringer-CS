/* let character = JSON.parse(
    localStorage.getItem("currentCharacter")
); */
window.races = {};

window.racesLoaded = fetch("js/races.json")
    .then(response => response.json())
    .then(data => {

        window.races = data;

    });
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
    return Math.floor(stats.constitution / 2 + Rules.getModifier(stats.strength)+6);
},
 getArmor(stats){
    return 10+Rules.getModifier(stats.agility);
    
}, getFinalStats(character){

    let stats = {};

    // Base 8 + player point buy
    for(const stat in character.investedStats){

        stats[stat] =
            8 + character.investedStats[stat];

    }


    // Race + Gender bonuses
    const race = window.races[character.race];

    if(race){

        const gender = race.genders[character.gender];

        if(gender){

            const bonuses = gender.bonuses;

            for(const stat in bonuses){

                if(stats[stat] !== undefined){

                    stats[stat] += bonuses[stat];

                }

            }

        }

    }


   console.log(
    "Race:",
    character.race,
    "Gender:",
    character.gender,
    "Stats:",
    stats
);

return stats;

}, 

  getMaxStamina(stats,level){
console.log("Level:",level);
    return Math.max(
        1,
        this.getModifier(stats.constitution) *
        (1 + Math.floor((level + 1) / 6))
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
