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

  none: "#808080",
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
      level: 1,
    },

    secondary: {
      element: "lux",
      level: 1,
    },

    knownSpells: [],
  };

  saveCharacter();
}

//-------------------------------------
// Load spells
//-------------------------------------

async function loadSpells() {
  spells = await fetch("js/spells.json").then((r) => r.json());

  updateSpellList();
}

//-------------------------------------
// Fill selectors
//-------------------------------------

function fillElementSelectors() {
  const elements = ["lux", "natura", "gelum", "umbra", "arcane", "ignis"];

  const primary = document.getElementById("primaryElement");

  const secondary = document.getElementById("secondaryElement");

  primary.innerHTML = "";
  secondary.innerHTML = "";

  for (const element of elements) {
    primary.add(
      new Option(element.charAt(0).toUpperCase() + element.slice(1), element),
    );

    secondary.add(
      new Option(element.charAt(0).toUpperCase() + element.slice(1), element),
    );
  }
}

function fillLevels() {
  const level1 = document.getElementById("level1");

  const level2 = document.getElementById("level2");

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
  const primaryElement = document.getElementById("primaryElement").value;

  const secondaryElement = document.getElementById("secondaryElement").value;

  if (primaryElement === secondaryElement) {
    alert("Choose two different elements.");
    return;
  }

  character.arcane.enabled = true;

  character.arcane.primary.element = primaryElement;

  character.arcane.primary.level = Number(
    document.getElementById("primaryLevel").value,
  );

  character.arcane.secondary.element = secondaryElement;

  character.arcane.secondary.level = Number(
    document.getElementById("secondaryLevel").value,
  );

  saveCharacter();
}

//-------------------------------------
// Spell filter
//-------------------------------------

function canCast(spell) {
  const element1 = document.getElementById("element1").value;

  const element2 = document.getElementById("element2").value;

  const level1 = Number(document.getElementById("level1").value);

  const level2 = Number(document.getElementById("level2").value);

  for (const [element, required] of Object.entries(spell.elements)) {
    if (required <= 1) continue;

    if (element === element1) {
      if (required > level1) return false;

      continue;
    }

    if (element === element2) {
      if (required > level2) return false;

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
  const spell = spells.find((s) => s.id === id);

  if (!spell) return;

  // Check against the CHARACTER'S saved affinities
  if (!canCastCharacter(spell)) {
    alert("Your character cannot learn this spell.");
    return;
  }

  if (character.arcane.knownSpells.includes(id)) return;

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
    if (required <= 1) continue;

    if (element === element1) {
      if (required > level1) return false;

      continue;
    }

    if (element === element2) {
      if (required > level2) return false;

      continue;
    }

    return false;
  }

  return true;
}

//-------------------------------------
// Spell list
//-------------------------------------

function updateSpellList() {
  const table = document.getElementById("spellList");

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
          level: level,
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
        arcane: 5,
      };

      if (order[pa.element] !== order[pb.element])
        return order[pa.element] - order[pb.element];

      // Then by the level of that primary element
      if (pa.level !== pb.level) return pa.level - pb.level;

      // Then by total element levels
      const totalA = Object.values(a.elements).reduce((x, y) => x + y, 0);

      const totalB = Object.values(b.elements).reduce((x, y) => x + y, 0);

      if (totalA !== totalB) return totalA - totalB;

      // Finally alphabetical
      return a.name.localeCompare(b.name);
    })
    .forEach((spell) => {
      const info = getSpellElements(spell);

      const primaryColor = elementColors[info.primary];

      const secondaryColor = info.secondary
        ? elementColors[info.secondary]
        : "transparent";
      const learned = character.arcane.knownSpells.includes(spell.id);
    
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
                    ? "✓"
                    : `<button onclick="event.stopPropagation();learnSpell('${spell.id}')">
                Learn
                </button>`
                }
                ${`<button onclick="openSpellCalculator('${spell.id}')">
                Calculate
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

            </td>

        </tr>

        `;
    });
}
function toggleSpell(id) {
  const row = document.getElementById("details-" + id);

  if (row.style.display === "table-row") row.style.display = "none";
  else row.style.display = "table-row";
}
function formatElementsIcons(elements) {
  let result = "";

  const icons = {
    arcane: "Icons/arcane.png",
    lux: "Icons/lux.png",
    natura: "Icons/natura.png",
    gelum: "Icons/gelum.png",
    umbra: "Icons/umbra.png",
    ignis: "Icons/ignis.png",
  };

  for (const [element, value] of Object.entries(elements)) {
    if (value > 0) {
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
  .addEventListener("change", saveMagicSettings);

document
  .getElementById("secondaryElement")
  .addEventListener("change", saveMagicSettings);

document
  .getElementById("primaryLevel")
  .addEventListener("change", saveMagicSettings);

document
  .getElementById("secondaryLevel")
  .addEventListener("change", saveMagicSettings);

//-------------------------------------
// Spell search selectors
//-------------------------------------

document.getElementById("element1").addEventListener("change", updateSpellList);

document.getElementById("element2").addEventListener("change", updateSpellList);

document.getElementById("level1").addEventListener("change", updateSpellList);

document.getElementById("level2").addEventListener("change", updateSpellList);

//-------------------------------------
// Startup
//-------------------------------------

fillElementSelectors();
fillLevels();
fillSpiritWhisperSelectors();
loadCharacterMagic();

// Default spell search filter
document.getElementById("element1").value = character.arcane.primary.element;

document.getElementById("level1").value = character.arcane.primary.level;

document.getElementById("element2").value = character.arcane.secondary.element;

document.getElementById("level2").value = character.arcane.secondary.level;

loadSpells();

function getSpellElements(spell) {
  const list = Object.entries(spell.elements)
    .filter(([e, v]) => v > 0)
    .sort((a, b) => b[1] - a[1]);

  return {
    primary: list[0]?.[0] ?? "none",

    secondary: list[1]?.[0] ?? null,
  };
}

//Spirit Whisper
function fillSpiritWhisperSelectors() {

    const elementSelect =
        document.getElementById("spiritWhisperElement");

    const levelSelect =
        document.getElementById("spiritWhisperLevel");

    if (!elementSelect || !levelSelect) return;

    elementSelect.innerHTML = "";
    levelSelect.innerHTML = "";

    const elements = [
        "lux",
        "natura",
        "gelum",
        "umbra",
        "arcane",
        "ignis"
    ];

    elements.forEach(element => {

        const option = document.createElement("option");

        option.value = element;
        option.textContent =
            element.charAt(0).toUpperCase() + element.slice(1);

        elementSelect.appendChild(option);
    });

    for (let level = 1; level <= 20; level++) {

        const option = document.createElement("option");

        option.value = level;
        option.textContent = level;

        levelSelect.appendChild(option);
    }

    elementSelect.addEventListener(
        "change",
        updateSpiritWhisperSpellList
    );

    levelSelect.addEventListener(
        "change",
        updateSpiritWhisperSpellList
    );

    updateSpiritWhisperSpellList();
}

function updateSpiritWhisperSpellList() {

  const table = document.getElementById("spiritWhisperSpellList");

  if (!table) return;

  table.innerHTML = "";

  const spiritElement =
    document.getElementById("spiritWhisperElement").value;

  const spiritLevel =
    Number(document.getElementById("spiritWhisperLevel").value);


  //========================================
  // FILTER
  //========================================

  const availableSpells = spells.filter((spell) => {

    if (!spell.elements) return false;

    const activeElements = Object.entries(spell.elements)
      .filter(([element, level]) => Number(level) > 0);

    if (activeElements.length === 0) return false;


    // Find PRIMARY element
    let primaryElement = null;
    let primaryLevel = -1;

    for (const [element, value] of activeElements) {

      const level = Number(value);

      if (level > primaryLevel) {
        primaryLevel = level;
        primaryElement = element;
      }
    }


    // Spirit element must be primary
    if (primaryElement !== spiritElement) {
      return false;
    }


    // Primary cannot exceed Spirit level
    if (primaryLevel > spiritLevel) {
      return false;
    }


    // Other elements can only be half
    // of the spell's primary element
    const otherLimit = primaryLevel / 2;


    for (const [element, value] of activeElements) {

      if (element === spiritElement) continue;

      if (Number(value) > otherLimit) {
        return false;
      }
    }


    return true;
  });


  //========================================
  // SORT
  //========================================

  availableSpells.sort((a, b) => {

    const levelA =
      Number(a.elements[spiritElement] || 0);

    const levelB =
      Number(b.elements[spiritElement] || 0);

    if (levelA !== levelB) {
      return levelA - levelB;
    }

    const totalA =
      Object.values(a.elements)
        .reduce((x, y) => x + Number(y), 0);

    const totalB =
      Object.values(b.elements)
        .reduce((x, y) => x + Number(y), 0);

    if (totalA !== totalB) {
      return totalA - totalB;
    }

    return a.name.localeCompare(b.name);
  });


  //========================================
  // CREATE ROWS
  //========================================

  availableSpells.forEach((spell) => {

    const info = getSpellElements(spell);

    const primaryColor =
      elementColors[info.primary];

    const secondaryColor =
      info.secondary
        ? elementColors[info.secondary]
        : "transparent";


    //======================================
    // SPELL ROW
    //======================================

    table.innerHTML += `

      <tr
        class="spellRow spellCard"
        style="
          border-left-color:${primaryColor};
          border-top-color:${secondaryColor};
        "
        onclick="toggleSpiritWhisperSpell('${spell.id}')"
      >

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
        </td>

      </tr>


      <!-- SPELL DETAILS -->

      <tr
        class="spellDetails"
        id="spirit-details-${spell.id}"
      >

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
    function toggleSpiritWhisperSpell(id) {

  const row =
    document.getElementById("spirit-details-" + id);

  if (!row) return;

  if (row.style.display === "table-row") {
    row.style.display = "none";
  } else {
    row.style.display = "table-row";
  }
}
// ============================================================
// SPELL CALCULATOR
// ============================================================
function renderSpellCalculator(spell) {

    // --------------------------------------------------------
    // Find calculator container
    // --------------------------------------------------------

    let container =
        document.getElementById(
            "spellCalculator"
        );


    // --------------------------------------------------------
    // If the container does not exist, create it.
    // --------------------------------------------------------

    if (!container) {

        container =
            document.createElement("div");

        container.id =
            "spellCalculator";


        // Put it at the end of the body

        document.body.appendChild(
            container
        );
    }


    // --------------------------------------------------------
    // Create calculator
    // --------------------------------------------------------

    container.innerHTML = `

        <div class="spell-calculator">

            <h3>
                ${spell.name}
            </h3>


            <table class="spellCalculatorTable">

                <tr>
                    <th colspan="2">
                        Spell Information
                    </th>
                </tr>

                <tr>
                    <td>
                        Circle
                    </td>

                    <td id="calculatorCircle">
                    </td>
                </tr>

                <tr>
                    <td>
                        Elements
                    </td>

                    <td id="calculatorElements">
                    </td>
                </tr>

                <tr>
                    <td>
                        Effect
                    </td>

                    <td>
                        ${spell.effect || "none"}
                    </td>
                </tr>

               <tr>
    <td>
        Effect Range
    </td>

    <td id="spellCalcEffectRange">
    </td>
</tr>

<tr>
    <td>
        Range
    </td>

    <td id="spellCalcRange">
    </td>
</tr>

                <tr>
                    <td>
                        Canalization
                    </td>

                    <td>
                        ${spell.Canalization || "n"}
                    </td>
                </tr>


                <tr>
                    <th colspan="2">
                        Inputs
                    </th>
                </tr>


                <tr>

                    <td>
                        Key
                    </td>

                    <td>
                        <input
                            id="spellCalcKey"
                            type="number"
                            value="1"
                            step="1"
                        >
                    </td>

                </tr>


                <tr>

                    <td>
                        Cast Time
                    </td>

                    <td>
                        <input
                            id="spellCalcCastTime"
                            type="number"
                            value="1"
                            step="0.1"
                        >
                    </td>

                </tr>


                <tr>

                    <td>
                        Speed
                    </td>

                    <td>
                        <input
                            id="spellCalcSpeed"
                            type="number"
                            value="1"
                            step="0.1"
                        >
                    </td>

                </tr>


                <tr>

                    <td>
                        Size
                    </td>

                    <td>
                        <input
                            id="spellCalcSize"
                            type="number"
                            value="1"
                            step="0.1"
                        >
                    </td>

                </tr>


                <tr>
                    <th colspan="2">
                        Results
                    </th>
                </tr>


                <tr>

                    <td>
                        Cost
                    </td>

                    <td id="spellCalcCost">
                    </td>

                </tr>


                <tr>

                    <td>
                        Prime Damage
                    </td>

                    <td id="spellCalcPrimeDamage">
                    </td>

                </tr>


                <tr>

                    <td>
                        Damage
                    </td>

                    <td id="spellCalcDamage">
                    </td>

                </tr>


                <tr>

                    <td>
                        Damage Dice
                    </td>

                    <td id="spellCalcDice">
                    </td>

                </tr>


                <tr>

                    <td>
                        Prime Duration
                    </td>

                    <td id="spellCalcPrimeDuration">
                    </td>

                </tr>


                <tr>

                    <td>
                        Duration
                    </td>

                    <td id="spellCalcDuration">
                    </td>

                </tr>


                <tr>

                    <td>
                        Elemental Power
                    </td>

                    <td id="spellCalcElementalPower">
                    </td>

                </tr>

            </table>

        </div>

    `;


    // --------------------------------------------------------
    // Fill spell information
    // --------------------------------------------------------

    document.getElementById(
        "calculatorCircle"
    ).textContent =
        getSpellCircleLevel(spell);


    document.getElementById(
        "calculatorElements"
    ).textContent =
        formatSpellElements(spell);


    // --------------------------------------------------------
    // Update calculator whenever an input changes
    // --------------------------------------------------------

    const inputs =
        container.querySelectorAll(
            "input"
        );


    inputs.forEach(
        input => {

            input.addEventListener(
                "input",
                () => {

                    updateSpellCalculator(
                        spell
                    );
                }
            );
        }
    );

    // --------------------------------------------------------
    // Initial calculation
    // --------------------------------------------------------

    updateSpellCalculator(
        spell
    );
}
function openSpellCalculator(spellId) {

    const spell =
        spells.find(
            spell =>
                spell.id === spellId
        );


    if (!spell) {

        console.error(
            "Spell not found:",
            spellId
        );

        return;
    }


    renderSpellCalculator(spell);
}function formatSpellElements(spell) {

    return Object.entries(
        spell.elements || {}
    )
        .filter(
            ([element, amount]) =>
                Number(amount) > 0
        )
        .map(
            ([element, amount]) =>
                `${element} ${amount}`
        )
        .join(", ");
}


function updateSpellCalculator(spell) {

    const result =
        calculateSpell(
            spell,
            {

                key:
                    document.getElementById(
                        "spellCalcKey"
                    ).value,

                castTime:
                    document.getElementById(
                        "spellCalcCastTime"
                    ).value,

                speed:
                    document.getElementById(
                        "spellCalcSpeed"
                    ).value,

                size:
                    document.getElementById(
                        "spellCalcSize"
                    ).value
            }
        );


    // --------------------------------------------------------
    // Cost
    // --------------------------------------------------------

    document.getElementById(
        "spellCalcCost"
    ).textContent =
        result.cost;

// --------------------------------------------------------
// Range
// --------------------------------------------------------

document.getElementById(
    "spellCalcRange"
).textContent =
    result.range;


// --------------------------------------------------------
// Effect range
// --------------------------------------------------------

document.getElementById(
    "spellCalcEffectRange"
).textContent =
    result.effectRange;
    // --------------------------------------------------------
    // Prime damage
    // --------------------------------------------------------

    document.getElementById(
        "spellCalcPrimeDamage"
    ).textContent =
        result.damagePrime;


    // --------------------------------------------------------
    // Damage
    // --------------------------------------------------------

    document.getElementById(
        "spellCalcDamage"
    ).textContent =
        result.damage;


    // --------------------------------------------------------
    // Dice
    // --------------------------------------------------------

    document.getElementById(
        "spellCalcDice"
    ).textContent =
        result.dice;


    // --------------------------------------------------------
    // Prime duration
    // --------------------------------------------------------

    document.getElementById(
        "spellCalcPrimeDuration"
    ).textContent =
        result.primeDuration;


    // --------------------------------------------------------
    // Duration
    // --------------------------------------------------------

    if (result.duration > 0) {

        document.getElementById(
            "spellCalcDuration"
        ).textContent =

            `${result.duration} turns ` +
            `(${result.durationSeconds} sec / ` +
            `${result.durationMinutes.toFixed(2)} min / ` +
            `${result.durationHours.toFixed(2)} hrs)`;

    } else {

        document.getElementById(
            "spellCalcDuration"
        ).textContent =
            "Instant / Concentration";
    }


    // --------------------------------------------------------
    // Elemental power
    // --------------------------------------------------------

    document.getElementById(
        "spellCalcElementalPower"
    ).textContent =
        result.elementalPower;
} 
function even(value) {

    value = Math.ceil(Number(value));

    if (!Number.isFinite(value)) {
        return 0;
    }

    return value % 2 === 0
        ? value
        : value + 1;
}


function getCharacterArcaneElements() {

    const result = {
        primaryElement: null,
        primaryElementLevel: 1,
        secondaryElement: null,
        secondaryElementLevel: 1
    };

    if (!character?.arcane) {
        return result;
    }

    if (character.arcane.primary) {

        result.primaryElement =
            String(
                character.arcane.primary.element || ""
            ).toLowerCase();

        result.primaryElementLevel =
            Number(
                character.arcane.primary.level
            ) || 1;
    }

    if (character.arcane.secondary) {

        result.secondaryElement =
            String(
                character.arcane.secondary.element || ""
            ).toLowerCase();

        result.secondaryElementLevel =
            Number(
                character.arcane.secondary.level
            ) || 1;
    }

    return result;
}


function getSpellElementCount(spell, element) {

    if (!element) {
        return 0;
    }

    return Number(
        spell.elements?.[element] || 0
    );
}


function getCircleLevel(spell) {

    return Object.values(
        spell.elements || {}
    ).reduce(
        (total, value) => total + (Number(value) || 0),
        0
    );
}


function getSpellEffectType(spell) {

    const categories = Array.isArray(spell.category)
        ? spell.category.map(value =>
            String(value).toLowerCase()
        )
        : [];

    const effect =
        String(spell.effect || "").toLowerCase();

    const effectRange =
        String(spell.EffectRange || "").toLowerCase();


    if (
        categories.includes("heal") ||
        effect === "heal"
    ) {
        return "heal";
    }


    if (
        categories.includes("shild") ||
        effect === "shild"
    ) {
        return "shild";
    }


    if (
        categories.includes("summon") ||
        effect === "inv" ||
        effect === "summon"
    ) {
        return "inv";
    }


    if (
        categories.includes("effect") ||
        effect === "ef" ||
        effect === "eff"
    ) {
        return "ef";
    }


    if (
        effectRange === Number.isFinite(Number(effectRange))
    ) {
        return "aoe";
    }


    if (effect === "dmg") {
        return "dmg";
    }


    return null;
}
function scaleRange(range, size) {

    if (range === null || range === undefined) {
        return "—";
    }

    const text = String(range).trim();

    // Look for a number at the beginning
    const match = text.match(/^(\d+(?:\.\d+)?)\s*(.*)$/);

    // No number = something like "single target"
    if (!match) {
        return text;
    }

    const baseValue = Number(match[1]);
    const unit = match[2];

    const calculatedValue =
        baseValue * size;

    return unit
        ? `${calculatedValue} ${unit}`
        : calculatedValue;
}

function calculateSpell(spell, inputs) {

    const key =
        Number(inputs.key) || 1;

    const castTime =
        Number(inputs.castTime) || 1;

    const speed =
        Number(inputs.speed) || 1;

    const size =
        Number(inputs.size) || 1;

const calculatedRange =
    scaleRange(
        spell.Range,
        size
    );

const calculatedEffectRange =
    scaleRange(
        spell.EffectRange,
        size
    );
    const circleLevel =
        getCircleLevel(spell);


    const characterElements =
        getCharacterArcaneElements();


    const primaryElement =
        characterElements.primaryElement;

    const secondaryElement =
        characterElements.secondaryElement;


    const primaryElementCount =
        getSpellElementCount(
            spell,
            primaryElement
        );


    const secondaryElementCount =
        getSpellElementCount(
            spell,
            secondaryElement
        );


    const primaryElementLevel =
        primaryElementCount > 0
            ? characterElements.primaryElementLevel
            : 1;


    const secondaryElementLevel =
        secondaryElementCount > 0
            ? characterElements.secondaryElementLevel
            : 1;


    const otherElementCount =
        circleLevel -
        primaryElementCount -
        secondaryElementCount;


    const costMultiplier =
        Number(spell.costMultiplier) || 1;


    const canalization =
        String(
            spell.Canalization || ""
        ).toLowerCase();


    const isCanalized =
        canalization === "c";


    const rawCost =
        circleLevel *
        key *
        castTime *
        Math.pow(speed, 1.5) *
        size *
        costMultiplier *
        (isCanalized ? 0.1 : 1);


    const cost =
        Math.ceil(rawCost);


    const variableTime =
        Number(spell.variableTime) || 0;


    const durationPrime =
        Math.floor(
            (castTime * variableTime) / 3
        );


    const elementPower =
        (primaryElementCount *
            primaryElementLevel) +

        (secondaryElementCount *
            secondaryElementLevel) +

        otherElementCount;


    const baseDamage =
        elementPower *
        (
            (castTime / 1.5) *
            speed *
            Math.min(size, 1)
        );


    const effectType =
        getSpellEffectType(spell);


    let damagePrime;


    if (effectType === "dmg") {

        damagePrime =
            baseDamage;

    }
    else if (effectType === "shild") {

        damagePrime =
            baseDamage;

    }
    else if (effectType === "heal") {

        damagePrime =
            baseDamage /
            durationPrime;

    }
    else if (effectType === "aoe") {

        damagePrime =
            baseDamage / 3;

    }
    else if (effectType === "inv") {

        damagePrime =
            baseDamage;

    }
    else if (effectType === "ef") {

        damagePrime =
            baseDamage /
            (durationPrime / 10);

    }
    else {

        damagePrime = 0;
    }


    if (
        !Number.isFinite(damagePrime) ||
        Number.isNaN(damagePrime)
    ) {
        damagePrime = 0;
    }


    const damage =
        Math.floor(
            damagePrime / 3
        );


    let diceValue = 0;


    if (damagePrime !== 0) {

        diceValue =
            even(
                (damagePrime + 4) / 1.5
            );
    }


    let diceCount;


    if (diceValue < 20) {

        if (
            diceValue > 12 &&
            diceValue < 20
        ) {
            diceCount = 2;
        }
        else {
            diceCount = 1;
        }

    }
    else {

        diceCount =
            Math.round(
                diceValue / 20
            );
    }


    let diceSize;


    if (diceValue < 20) {

        if (
            diceValue > 12 &&
            diceValue < 20
        ) {

            diceSize =
                even(
                    diceValue / 2
                );

        }
        else {

            diceSize =
                diceValue;
        }

    }
    else {

        diceSize = 20;
    }


    let duration = 0;


    if (!isCanalized) {

        let durationValue =
            durationPrime *
            (
                damagePrime < 1
                    ? damagePrime
                    : 1
            );


        if (
            !Number.isFinite(durationValue) ||
            Number.isNaN(durationValue)
        ) {
            durationValue = 0;
        }


        duration =
            Math.round(
                durationValue
            );
    }


    const durationSeconds =
        duration * 8;

    const durationMinutes =
        durationSeconds / 60;

    const durationHours =
        durationMinutes / 60;


    return {

        circleLevel,
range: calculatedRange,
    effectRange: calculatedEffectRange,
        primaryElement,
        primaryElementCount,
        primaryElementLevel,

        secondaryElement,
        secondaryElementCount,
        secondaryElementLevel,

        otherElementCount,

        key,
        castTime,
        speed,
        size,

        costMultiplier,
        cost,

        elementPower,

        effectType,

        damagePrime,
        damage,

        diceValue,
        diceCount,
        diceSize,

        dice:
            damagePrime !== 0
                ? `${diceCount}d${diceSize}`
                : "0",

        durationPrime,
        duration,
        durationSeconds,
        durationMinutes,
        durationHours,

        canalization: isCanalized
    };
}


function getSpellCircleLevel(spell) {
    return getCircleLevel(spell);
}