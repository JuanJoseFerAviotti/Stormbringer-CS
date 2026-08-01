//=============================
// Arcane.js 
//=============================
const elementColors = {

    lux: "#ffd700",

    natura: "#3cb043",

    gelum: "#00d4ff",

    ignis: "#ff7a00",

    umbra: "#202020",

    arcane: "#9a4dff",

    none: "#808080"

};
//-------------------------------------
// Character
//-------------------------------------

let spells = [];

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

    saveCharacter();
}

//-------------------------------------
// Load spells
//-------------------------------------

async function loadSpells() {

    spells = await fetch("js/spells.json")
        .then(r => r.json());

    updateSpellList();

}

//-------------------------------------
// Fill selectors
//-------------------------------------

function fillElementSelectors() {

    const elements = [
        "lux",
        "natura",
        "gelum",
        "umbra",
        "arcane",
        "ignis"
    ];

    const primary =
        document.getElementById("primaryElement");

    const secondary =
        document.getElementById("secondaryElement");

    primary.innerHTML = "";
    secondary.innerHTML = "";

    for (const element of elements) {

        primary.add(
            new Option(
                element.charAt(0).toUpperCase() +
                element.slice(1),
                element
            )
        );

        secondary.add(
            new Option(
                element.charAt(0).toUpperCase() +
                element.slice(1),
                element
            )
        );

    }

}

function fillLevels() {

    const level1 =
        document.getElementById("level1");

    const level2 =
        document.getElementById("level2");

    level1.innerHTML = "";
    level2.innerHTML = "";

    for (let i = 1; i <= 10; i++) {

        level1.add(new Option(i, i));
        level2.add(new Option(i, i));

    }

}

//-------------------------------------
// Load character affinities
//-------------------------------------

function loadCharacterMagic() {

    document.getElementById("primaryElement").value =
        character.arcane.primary.element;

    document.getElementById("primaryLevel").value =
        character.arcane.primary.level;

    document.getElementById("secondaryElement").value =
        character.arcane.secondary.element;

    document.getElementById("secondaryLevel").value =
        character.arcane.secondary.level;

}

//-------------------------------------
// Save character affinities
//-------------------------------------

function saveMagicSettings() {

    const primaryElement =
        document.getElementById("primaryElement").value;

    const secondaryElement =
        document.getElementById("secondaryElement").value;

    if (primaryElement === secondaryElement) {

        alert("Choose two different elements.");
        return;

    }

    character.arcane.enabled = true;

    character.arcane.primary.element =
        primaryElement;

    character.arcane.primary.level =
        Number(
            document.getElementById("primaryLevel").value
        );

    character.arcane.secondary.element =
        secondaryElement;

    character.arcane.secondary.level =
        Number(
            document.getElementById("secondaryLevel").value
        );

    saveCharacter();

}

//-------------------------------------
// Spell filter
//-------------------------------------

function canCast(spell) {

    const element1 =
        document.getElementById("element1").value;

    const element2 =
        document.getElementById("element2").value;

    const level1 =
        Number(
            document.getElementById("level1").value
        );

    const level2 =
        Number(
            document.getElementById("level2").value
        );

    for (const [element, required] of Object.entries(spell.elements)) {

        if (required <= 1)
            continue;

        if (element === element1) {

            if (required > level1)
                return false;

            continue;

        }

        if (element === element2) {

            if (required > level2)
                return false;

            continue;

        }

        return false;

    }

    return true;

}

function formatElements(elements) {

    return Object.entries(elements)
        .filter(([k, v]) => v > 0)
        .map(([k, v]) => `${k} ${v}`)
        .join(" | ");

}
//-------------------------------------
// Learn spell
//-------------------------------------

function learnSpell(id) {

    const spell = spells.find(s => s.id === id);

    if (!spell)
        return;

    // Check against the CHARACTER'S saved affinities
    if (
        !canCastCharacter(spell)
    ) {
        alert("Your character cannot learn this spell.");
        return;
    }

    if (character.arcane.knownSpells.includes(id))
        return;

    character.arcane.knownSpells.push(id);

    saveCharacter();

    updateSpellList();

}

//-------------------------------------
// Check character affinities
//-------------------------------------

function canCastCharacter(spell) {

    const element1 = character.arcane.primary.element;
    const element2 = character.arcane.secondary.element;

    const level1 = character.arcane.primary.level;
    const level2 = character.arcane.secondary.level;

    for (const [element, required] of Object.entries(spell.elements)) {

        if (required <= 1)
            continue;

        if (element === element1) {

            if (required > level1)
                return false;

            continue;

        }

        if (element === element2) {

            if (required > level2)
                return false;

            continue;

        }

        return false;

    }

    return true;

}

//-------------------------------------
// Spell list
//-------------------------------------


function updateSpellList(){

    const table =
        document.getElementById("spellList");

    table.innerHTML = "";


    spells
    .filter(canCast)
    .sort((a, b) => {

    function getPrimary(spell) {

        let primary = "";
        let level = -1;

        for (const [element, value] of Object.entries(spell.elements)) {

            if (value > level) {
                level = value;
                primary = element;
            }

        }

        return {
            element: primary,
            level: level
        };

    }

    const pa = getPrimary(a);
    const pb = getPrimary(b);
    

    // Order elements
    const order = {
        lux: 0,
        natura: 1,
        gelum: 2,
        ignis: 3,
        umbra: 4,
        arcane: 5
    };

    if (order[pa.element] !== order[pb.element])
        return order[pa.element] - order[pb.element];

    // Then by the level of that primary element
    if (pa.level !== pb.level)
        return pa.level - pb.level;

    // Then by total element levels
    const totalA =
        Object.values(a.elements).reduce((x, y) => x + y, 0);

    const totalB =
        Object.values(b.elements).reduce((x, y) => x + y, 0);

    if (totalA !== totalB)
        return totalA - totalB;

    // Finally alphabetical
    return a.name.localeCompare(b.name);

})
    .forEach(spell=>{

const info = getSpellElements(spell);

const primaryColor =
    elementColors[info.primary];

const secondaryColor =
    info.secondary
        ? elementColors[info.secondary]
        : "transparent";
        const learned =
            character.arcane.knownSpells.includes(spell.id);


        table.innerHTML += `

        <tr class="spellRow spellCard" style=" border-left-color:${primaryColor};border-top-color:${secondaryColor};" onclick="toggleSpell('${spell.id}')" >

            <td>
                ${spell.name}
            </td>

            <td>
                ${formatElementsIcons(spell.elements)}
            </td>

            <td>
                ${spell.Range}
            </td>

            <td>
                ${spell.circle.join(" ")}
            </td>

            <td>
                ${
                learned
                ?
                "✓"
                :
                `<button onclick="event.stopPropagation();learnSpell('${spell.id}')">
                Learn
                </button>`
                }
            </td>

        </tr>


        <tr class="spellDetails" id="details-${spell.id}">

            <td colspan="5">

                <b>Description:</b><br>
                ${spell.description}

                <br><br>
                <b>costmultiplier:</b>
                ${spell.costMultiplier}
                 
                <b>Duration:</b>
                ${spell.castingTime}
                <b>Canalization:</b>
                ${spell.Canalization}
                <br>

                <b>Area of effect range:</b>
                ${spell.EffectRange ?? "Single Target"}

            </td>

        </tr>

        `;

    });

}
function toggleSpell(id){

    const row =
        document.getElementById(
            "details-" + id
        );


    if(row.style.display === "table-row")
        row.style.display="none";
    else
        row.style.display="table-row";

}
function formatElementsIcons(elements){

    let result="";

    const icons={

        arcane:"Icons/arcane.png",
        lux:"Icons/lux.png",
        natura:"Icons/natura.png",
        gelum:"Icons/gelum.png",
        umbra:"Icons/umbra.png",
        ignis:"Icons/ignis.png"

    };


    for(const [element,value] of Object.entries(elements)){

        if(value>0){

            result += `
            <img 
            src="${icons[element]}"
            title="${element} ${value}"
            class="elementIcon">

            ${value}
            `;
        }

    }

    return result;

}
//-------------------------------------
// Character selectors
//-------------------------------------

document
    .getElementById("primaryElement")
    .addEventListener(
        "change",
        saveMagicSettings
    );

document
    .getElementById("secondaryElement")
    .addEventListener(
        "change",
        saveMagicSettings
    );

document
    .getElementById("primaryLevel")
    .addEventListener(
        "change",
        saveMagicSettings
    );

document
    .getElementById("secondaryLevel")
    .addEventListener(
        "change",
        saveMagicSettings
    );

//-------------------------------------
// Spell search selectors
//-------------------------------------

document
    .getElementById("element1")
    .addEventListener(
        "change",
        updateSpellList
    );

document
    .getElementById("element2")
    .addEventListener(
        "change",
        updateSpellList
    );

document
    .getElementById("level1")
    .addEventListener(
        "change",
        updateSpellList
    );

document
    .getElementById("level2")
    .addEventListener(
        "change",
        updateSpellList
    );

//-------------------------------------
// Startup
//-------------------------------------

fillElementSelectors();
fillLevels();

loadCharacterMagic();

// Default spell search filter
document.getElementById("element1").value =
    character.arcane.primary.element;

document.getElementById("level1").value =
    character.arcane.primary.level;

document.getElementById("element2").value =
    character.arcane.secondary.element;

document.getElementById("level2").value =
    character.arcane.secondary.level;

loadSpells();


function getSpellElements(spell){

    const list = Object.entries(spell.elements)
        .filter(([e,v]) => v > 0)
        .sort((a,b)=>b[1]-a[1]);

    return{

        primary:
            list[0]?.[0] ?? "none",

        secondary:
            list[1]?.[0] ?? null

    };

}