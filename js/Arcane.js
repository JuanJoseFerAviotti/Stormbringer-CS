let spells = [];

async function loadSpells(){

    spells = await fetch("js/spells.json")
        .then(r=>r.json());

    updateSpellList();
}
if (!character.arcane) {
    character.arcane = {
        enabled: false,
        primary: {
            element: "arcane",
            level: 1
        },
        secondary: {
            element: "lux",
            level: 1
        },
        knownSpells: []
    };
}
document.getElementById("element1").addEventListener("change",updateSpellList);
document.getElementById("element2").addEventListener("change",updateSpellList);

document.getElementById("level1").addEventListener("change",updateSpellList);
document.getElementById("level2").addEventListener("change",updateSpellList);
fillElementSelectors();
fillLevels();

primaryElement.value = character.arcane.primary.element;
document.getElementById("primaryLevel").value =
    character.arcane.primary.level;


secondaryElement.value = character.arcane.secondary.element;
document.getElementById("secondaryLevel").value = character.arcane.secondary.level;

updateSpellList();
function canCastSpell(spell, affinity1, level1, affinity2, level2) {

    for (const [element, required] of Object.entries(spell.elements)) {

        // Level 1 requirements are always allowed.
        if (required <= 1)
            continue;

        if (element === affinity1) {
            if (required > level1)
                return false;
            continue;
        }

        if (element === affinity2) {
            if (required > level2)
                return false;
            continue;
        }

        // Requires another element.
        return false;
    }

    return true;
}
const availableSpells = spells.filter(spell =>
    canCastSpell(
        spell,
        "arcane", 10,
        "lux", 10
    )
);
function fillLevels(){

    const level1 = document.getElementById("level1");
    const level2 = document.getElementById("level2");

    for(let i=1;i<=10;i++){

        level1.add(new Option(i,i));
        level2.add(new Option(i,i));

    }

}
function canCast(spell){

    const element1 = document.getElementById("element1").value;
    const element2 = document.getElementById("element2").value;

    const level1 = Number(document.getElementById("level1").value);
    const level2 = Number(document.getElementById("level2").value);

    for(const [element,required] of Object.entries(spell.elements)){

        if(required <= 1)
            continue;

        if(element == element1){

            if(required > level1)
                return false;

            continue;

        }

        if(element == element2){

            if(required > level2)
                return false;

            continue;

        }

        return false;

    }

    return true;

}
function updateSpellList(){

    const div = document.getElementById("spellList");

    div.innerHTML = "";

    spells
        .filter(canCast)
        .sort((a,b)=>a.name.localeCompare(b.name))
        .forEach(spell=>{

            div.innerHTML += `
                <div class="spell">
                    ${spell.name}
                </div>
            `;

        });

}
function updateSpellList() {

    const div = document.getElementById("spellList");
    div.innerHTML = "";

    spells
        .filter(canCast)
        .sort((a, b) => a.name.localeCompare(b.name))
        .forEach(spell => {

            div.innerHTML += `
            <div class="spellCard">

                <h3>${spell.name}</h3>

                <p><b>Elements:</b> ${formatElements(spell.elements)}</p>

                <p><b>Circles:</b> ${spell.circles.join(", ")}</p>

                <p><b>Category:</b> ${spell.category}</p>

                <p><b>Cost:</b> x${spell.costMultiplier}</p>

                <p><b>Casting Time:</b> ${spell.castingTime}</p>

                <p><b>Speed:</b> ${spell.speed}</p>

                <p>${spell.description}</p>

                <button onclick="learnSpell('${spell.id}')">
                    Learn
                </button>

            </div>
            `;

        });

}
function formatElements(elements){

    return Object.entries(elements)
        .filter(([_,value]) => value > 0)
        .map(([name,value]) => `${name} ${value}`)
        .join(" | ");

}
function learnSpell(id){

    const spell = spells.find(s => s.id === id);

    if(!canCast(spell)){
        alert("You cannot learn this spell.");
        return;
    }

    if(character.magic.knownSpells.includes(id))
        return;

    character.magic.knownSpells.push(id);

    saveCharacter();

    updateSpellList();
}
function saveMagicSettings(){

    const primaryElement =
        document.getElementById("primaryElement").value;

    const secondaryElement =
        document.getElementById("secondaryElement").value;

    if(primaryElement === secondaryElement){

        alert("Choose two different elements.");
        return;

    }

    character.arcane.primary.element = primaryElement;
    character.arcane.primary.level =
        Number(document.getElementById("primaryLevel").value);

    character.arcane.secondary.element = secondaryElement;
    character.arcane.secondary.level =
        Number(document.getElementById("secondaryLevel").value);

        
    saveCharacter();

    updateSpellList();

}
function loadCharacterMagic() {
    primaryElement.value = character.arcane.primary.element;
    primaryLevel.value = character.arcane.primary.level;

    secondaryElement.value = character.arcane.secondary.element;
    secondaryLevel.value = character.arcane.secondary.level;
}
function fillElementSelectors() {

    const elements = [
        "lux",
        "natura",
        "gelum",
        "umbra",
        "arcane",
        "ignis"
    ];

    const primary = document.getElementById("primaryElement");
    const secondary = document.getElementById("secondaryElement");

    primary.innerHTML = "";
    secondary.innerHTML = "";

    for (const element of elements) {

        primary.add(new Option(
            element.charAt(0).toUpperCase() + element.slice(1),
            element
        ));

        secondary.add(new Option(
            element.charAt(0).toUpperCase() + element.slice(1),
            element
        ));
    }
}