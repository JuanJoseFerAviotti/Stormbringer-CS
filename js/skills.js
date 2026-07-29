let skills={};


fetch("js/skills.json")
.then(response=>response.json())
.then(data=>{

    skills=data;


    for(const skill in skills){

        if(!character.skills[skill]){

            character.skills[skill]={
                proficiency:false,
                expertise:false
            };

        }

    }


    createSkillsTable();

    saveCharacter();

});
document.querySelectorAll(".proficiency").forEach(box=>{

    box.addEventListener("change",()=>{

        const skill = box.dataset.skill;

        character.skills[skill].proficiency =
            box.checked;


        updateSkills();

        saveCharacter();

    });

});
document.querySelectorAll(".expertise").forEach(box=>{

    box.addEventListener("change",()=>{

        const skill = box.dataset.skill;

        character.skills[skill].expertise =
            box.checked;


        updateSkills();

        saveCharacter();

    });

});
function createSkillsTable(){

    const table =
    document.getElementById("skillsTable");


    table.innerHTML="";


    let currentCategory="";


    for(const skill in skills){

        const data = skills[skill];


     let category = 
    data.stat.charAt(0).toUpperCase() + 
    data.stat.slice(1);


if(category !== currentCategory){

    currentCategory = category;

    let header = document.createElement("tr");

    header.innerHTML =
    `<th colspan="5">${currentCategory}</th>`;

    table.appendChild(header);

    // Add Strength information before Athletics
    if(currentCategory === "Strength"){

    let row = document.createElement("tr");

    row.innerHTML = `
        <td colspan="5">

            <div class="carryWeight">

                <div class="carryBar">

                    <div id="carryMarker"></div>

                </div>

                <div class="carryLabels">

                    <span>0 kg</span>

                    <span id="weightCapacity"></span>

                    <span id="encumbered"></span>

                    <span id="heavyEncumbered"></span>

                </div>

                <div class="carryCurrent">
                    Carrying:
                    <span id="currentCarryWeight">0 kg</span>
                </div>

            </div>

        </td>
    `;

    table.appendChild(row);

}

}



        let row=document.createElement("tr");


        row.innerHTML=`

        <td>${skill}</td>

        <td id="${skill}Passive"></td>

        <td id="${skill}Active"></td>

        <td>
            <input 
            type="checkbox"
            class="proficiency"
            data-skill="${skill}">
        </td>


        <td>
            <input 
            type="checkbox"
            class="expertise"
            data-skill="${skill}">
        </td>

        `;


        table.appendChild(row);

    }


    addSkillListeners();

    updateSkills();

}
function getProficiencyBonus(){

    return Math.floor(
        2 + ((character.level-1)/4)
    );

}
function addSkillListeners(){

    document.querySelectorAll(".proficiency")
    .forEach(box=>{


        box.addEventListener("change",()=>{


            let skill=box.dataset.skill;


            character.skills[skill].proficiency =
            box.checked;


            updateSkills();

            saveCharacter();

        });


    });



    document.querySelectorAll(".expertise")
    .forEach(box=>{


        box.addEventListener("change",()=>{


            let skill=box.dataset.skill;


            character.skills[skill].expertise =
            box.checked;


            updateSkills();

            saveCharacter();

        });


    });

}
function updateSkills(){

    const stats=Rules.getFinalStats(character);

    const carriedWeight = 0;

document.getElementById("currentCarryWeight").textContent =
    carriedWeight.toFixed(1) + " kg";

const heavy =
    Rules.getHeavyEncumbered(stats) / 2.205;

document.getElementById("carryMarker").style.left =
    (carriedWeight / heavy * 100) + "%";
const strength = stats.strength;

const weightCapacity = strength * 5;
const encumbered = strength * 10;
const heavyEncumbered = strength * 15;

document.getElementById("weightCapacity").textContent =
    `${weightCapacity} lb or ${(weightCapacity / 2.205).toFixed(1)} kg`;

document.getElementById("encumbered").textContent =
    `${encumbered} lb or ${(encumbered / 2.205).toFixed(1)} kg`;

document.getElementById("heavyEncumbered").textContent =
    `${heavyEncumbered} lb or ${(heavyEncumbered / 2.205).toFixed(1)} kg`;
    for(const skill in skills){


        const stat=skills[skill].stat;


        let bonus =
        Rules.getModifier(stats[stat]);


        let prof=0;


        if(character.skills[skill]?.proficiency)
            prof += getProficiencyBonus();


        if(character.skills[skill]?.expertise)
            prof += getProficiencyBonus();



        document.getElementById(skill+"Passive")
        .textContent =
        10 + bonus + prof;



        document.getElementById(skill+"Active")
        .textContent =
        bonus + prof;


    }

}