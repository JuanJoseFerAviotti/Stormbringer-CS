window.races = {};
fetch("js/races.json")
.then(response => response.json())
.then(data => {

   window.races = data;

    loadRaceSelect();

    updateRaceInfo();

    recalculateDerivedStats();

    updateStats();

});
document
.getElementById("genderSelect")
.addEventListener("change", function(){

    character.gender = this.value;

    recalculateDerivedStats();
    updateStats();
    saveCharacter();

});
function loadRaceSelect(){

    const select = document.getElementById("raceSelect");

    select.innerHTML = "";

    for(const race in races){

        const option = document.createElement("option");

        option.value = race;
        option.textContent = race;

        select.appendChild(option);

    }


    select.value = character.race;

}
document
.getElementById("raceSelect")
.addEventListener("change", function(){

    character.race = this.value;

    updateRaceInfo();

    recalculateDerivedStats();

    updateStats();

    saveCharacter();

});
function updateRaceInfo(){

    const race = window.races[character.race];

    if(!race)
        return;


    document.getElementById("raceDescription").textContent =
        race.description || "No description.";


    // Magic

    const magicBox =
        document.getElementById("raceMagic");

    magicBox.innerHTML = "";

    for(const magic of race.magic || []){

        const li = document.createElement("li");

        li.textContent = magic;

        magicBox.appendChild(li);

    }


    // Skills / abilities

    const abilityBox =
        document.getElementById("raceAbilities");

    abilityBox.innerHTML = "";

    for(const skill of race.skills || []){

        const li = document.createElement("li");

        li.textContent = skill;

        abilityBox.appendChild(li);

    }


    // Bonuses

    const bonusBox =
        document.getElementById("raceBonuses");

    bonusBox.innerHTML = "";


    const male =
        race.genders.Male.bonuses;


    const female =
        race.genders.Female.bonuses;


    const maleTitle =
        document.createElement("h4");

    maleTitle.textContent = "Male:";

    bonusBox.appendChild(maleTitle);


    for(const stat in male){

        const li=document.createElement("li");

        li.textContent =
            stat + " " + formatBonus(male[stat]);

        bonusBox.appendChild(li);

    }


    const femaleTitle =
        document.createElement("h4");

    femaleTitle.textContent = "Female:";

    bonusBox.appendChild(femaleTitle);


    for(const stat in female){

        const li=document.createElement("li");

        li.textContent =
            stat + " " + formatBonus(female[stat]);

        bonusBox.appendChild(li);

    }

}
function formatBonus(value){

    if(value > 0)
        return "+" + value;

    return value;

}