let character = JSON.parse(
    localStorage.getItem("currentCharacter")
);

if(!character){

    window.location.href = "index.html";

}
function saveCharacter(){

    localStorage.setItem(
        "currentCharacter",
        JSON.stringify(character)
    );

}

if(!character.skills){

    character.skills = {};

}

function eightrest(){
    updateHeader();
return Math.max(
        1,
        (this.getModifier(stats.constitution)+2 * level) 
    );

}
function twentyfourrest(){
    updateHeader();
return 2*eightrest();
}


//document.getElementById("name").textContent = character.name;
document.getElementById("characterName").addEventListener("input", function () {

    character.name = this.value;

    saveCharacter();

});
const healthInput = document.getElementById("health");

healthInput.addEventListener("input", () => {
    character.health = Number(healthInput.value);
    saveCharacter();
});

const manaInput = document.getElementById("mana");

manaInput.addEventListener("input", () => {
    character.mana = Number(manaInput.value);
    saveCharacter();
});
const staminaInput = document.getElementById("stamina");

staminaInput.addEventListener("input", () => {
    character.stamina = Number(staminaInput.value);
    saveCharacter();
});
document.getElementById("level").textContent = character.level;

document.getElementById("health").value = character.health;
document.getElementById("maxHealth").textContent = character.maxHealth;

document.getElementById("mana").value = character.mana;
document.getElementById("maxMana").textContent = character.maxMana;

document.getElementById("manaRegen").textContent = character.manaRegen;

document.getElementById("stamina").value = character.stamina;
document.getElementById("maxStamina").textContent = character.maxStamina;

document.getElementById("armor").textContent = character.armor;
document.getElementById("characterLevel").addEventListener("change", function(){

    let level = parseInt(this.value);

    if(isNaN(level) || level < 1)
        level = 1;

    character.level = level;

    recalculateDerivedStats();

    updateStats();

    updateSkills();

    saveCharacter();

});

console.log("ADDING STAT BUTTON EVENTS");
const buttons = document.querySelectorAll(".tabButton");

document.querySelectorAll(".plus").forEach(button=>{

    button.addEventListener("click",()=>{

        increaseStat(button.dataset.stat);

    });

});

document.querySelectorAll(".minus").forEach(button=>{

    button.addEventListener("click",()=>{

        decreaseStat(button.dataset.stat);

    });

});

function getCost(currentStat){

    if(currentStat < 15)
        return 2;

    return currentStat - 12;

}
function increaseStat(stat){

    let invested = character.investedStats[stat];

    let current = 8 + invested;

    if(current >= 20)
        return;

    const cost = getCost(current);

    if(character.points < cost)
        return;

    if(getAvailablePoints() < cost)
    return;

character.investedStats[stat]++;


    updateStats();
      console.log("INCREASE CALLED:", stat);

}
function decreaseStat(stat){

    let invested = character.investedStats[stat];

     if(invested <= -8)
        return;
 
    let current = 8 + invested;

    const refund = getCost(current-1);

  

    character.investedStats[stat]--;

    updateStats();

}


function formatModifier(mod){
    return mod >= 0 ? "+" + mod : mod;
}

function updateStats(){

    document.getElementById("availablePoints").textContent =
        getAvailablePoints();


    const stats = Rules.getFinalStats(character);


    for(const stat in stats){

        const score = stats[stat];

        const invested = character.investedStats[stat];


        document.getElementById(stat + "Value").textContent =
            score;


        document.getElementById(stat + "Invested").textContent =
            invested;


        document.getElementById(stat + "Mod").textContent =
            formatModifier(Rules.getModifier(score));

    }


    recalculateDerivedStats();

}

function formatModifier(mod){
    return mod >= 0 ? `+${mod}` : `${mod}`;
}
/* function recalculateDerivedStats(){

    const strength = getStatScore("strength");
    const constitution = getStatScore("constitution");
    const soul = getStatScore("soul");

    const strengthMod = getModifier(strength);

    character.maxHealth = Math.floor(constitution / 2 + strengthMod + 7);

    character.maxMana = soul;
    character.maxStamina = stats.constitution * (1 + Math.floor((character.level+1) / 6));
    character.maxPoints = 41 + character.level * 4;
updateHeader();
localStorage.setItem("character", JSON.stringify(character));
} */
function recalculateDerivedStats(){

    const stats = Rules.getFinalStats(character);

    character.maxHealth = Rules.getMaxHealth(stats);
    character.maxMana = Rules.getMaxMana(stats);
    character.maxStamina = Rules.getMaxStamina(stats, character.level);

    character.maxPoints = Rules.getMaxPoints(character.level);
    character.armor = Rules.getArmor(stats);
    

    updateHeader();

    saveCharacter();

}
//math
const BASE_STAT = 8;
function getStatScore(stat){

    return 8 +
           character.investedStats[stat];

}
function getModifier(stat){
    return Math.floor((stat - 10) / 2);
}


function getSpentPoints(){

    let spent = 0;

    for(const stat in character.investedStats){

        spent += Rules.getStatCost(
            getStatScore(stat)
        );

    }

    return spent;

}

function getAvailablePoints(){

    return Rules.getMaxPoints(character.level)
        - getSpentPoints();

}
function updateHeader(){

    document.getElementById("health").value = character.health;
    document.getElementById("maxHealth").textContent = character.maxHealth;

    document.getElementById("mana").value = character.mana;
    document.getElementById("maxMana").textContent = character.maxMana;

    document.getElementById("stamina").value = character.stamina;
    document.getElementById("armor").textContent = character.armor;
    document.getElementById("maxStamina").textContent = character.maxStamina;
    document.getElementById("availablePoints").textContent = getAvailablePoints();

    document.getElementById("maxPointsHeader").textContent =
    Rules.getMaxPoints(character.level);

}
const finalStats = Rules.getFinalStats(character);
/* function getFinalStats(){

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

} */

buttons.forEach(button=>{

    button.addEventListener("click",()=>{

        document.querySelectorAll(".tabButton")
            .forEach(b=>b.classList.remove("active"));

        document.querySelectorAll(".tab")
            .forEach(t=>t.classList.remove("active"));

        button.classList.add("active");

        document
            .getElementById(button.dataset.tab)
            .classList.add("active");

    });

    

});
function loadCharacterToUI(){
document.getElementById("characterLevel").value = character.level;
    
    updateStats();

    updateSkills();

    updateRaceInfo();
    updateHeader();


}