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

    let header=document.createElement("tr");

    header.innerHTML =
    `<th colspan="5">${currentCategory}</th>`;

    table.appendChild(header);

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

    const stats=getFinalStats();


    for(const skill in skills){


        const stat=skills[skill].stat;


        let bonus =
        getModifier(stats[stat]);


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