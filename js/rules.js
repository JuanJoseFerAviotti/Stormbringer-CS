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

    let hp = Math.floor((stats.constitution / 2) + Rules.getModifier(stats.strength))*character.level + 6;

    if(getTalentRank("tough") > 0){
        hp += character.level * 2;
    }

    return hp;

},
 getArmor(stats){

    let baseArmor = 10;

    if(character.equipped.armor){

        const equippedArmor = items.find(
            i => i.id === character.equipped.armor
        );

        if(equippedArmor){

            baseArmor = Number(equippedArmor.armorValue) || 10;

        }
    }

    return baseArmor + Rules.getModifier(stats.agility);

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

    return Math.max(
        1,
        this.getModifier(stats.constitution) *
        (1 + Math.floor((level + 1) / 6))
    );

},
 
 getMaxMana(stats){
    let Mana = stats.soul*character.level;
    return Mana;
},
getStatCost(score){

    let cost = 0;

    // Going below base gives points back
    if(score < this.BASE_STAT){

        for(let i = this.BASE_STAT; i > score; i--){
            cost -= 1;
        }

        return cost;
    }

    // Buying above base
    while(score > this.BASE_STAT){

        if(score <= 13)
            cost += 1;
        else
            cost += 2;

        score--;
    }

    return cost;
},
getWeightCapacity(strength){

    return strength * 5;

},

getEncumbered(strength){

    return strength * 10;

},

getHeavyEncumbered(strength){

    return strength * 15;

}

};
