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
function getAverageElementColor(elements) {
    let totalR = 0;
    let totalG = 0;
    let totalB = 0;
    let totalWeight = 0;

    for (const [element, value] of Object.entries(elements || {})) {

        const amount = Number(value) || 0;

        if (amount <= 0) continue;

        const color = elementColors[element];

        if (!color) continue;

        const hex = color.replace("#", "");

        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);

        totalR += r * amount;
        totalG += g * amount;
        totalB += b * amount;

        totalWeight += amount;
    }

    if (totalWeight === 0) {
        return "#ffffff";
    }

    return `rgb(
        ${Math.round(totalR / totalWeight)},
        ${Math.round(totalG / totalWeight)},
        ${Math.round(totalB / totalWeight)}
    )`;
}
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
                </button>`}
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
  const elementSelect = document.getElementById("spiritWhisperElement");

  const levelSelect = document.getElementById("spiritWhisperLevel");

  if (!elementSelect || !levelSelect) return;

  elementSelect.innerHTML = "";
  levelSelect.innerHTML = "";

  const elements = ["lux", "natura", "gelum", "umbra", "arcane", "ignis"];

  elements.forEach((element) => {
    const option = document.createElement("option");

    option.value = element;
    option.textContent = element.charAt(0).toUpperCase() + element.slice(1);

    elementSelect.appendChild(option);
  });

  for (let level = 1; level <= 20; level++) {
    const option = document.createElement("option");

    option.value = level;
    option.textContent = level;

    levelSelect.appendChild(option);
  }

  elementSelect.addEventListener("change", updateSpiritWhisperSpellList);

  levelSelect.addEventListener("change", updateSpiritWhisperSpellList);

  updateSpiritWhisperSpellList();
}

function updateSpiritWhisperSpellList() {
  const table = document.getElementById("spiritWhisperSpellList");

  if (!table) return;

  table.innerHTML = "";

  const spiritElement = document.getElementById("spiritWhisperElement").value;

  const spiritLevel = Number(
    document.getElementById("spiritWhisperLevel").value,
  );

  //========================================
  // FILTER
  //========================================

  const availableSpells = spells.filter((spell) => {
    if (!spell.elements) return false;

    const activeElements = Object.entries(spell.elements).filter(
      ([element, level]) => Number(level) > 0,
    );

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
    const levelA = Number(a.elements[spiritElement] || 0);

    const levelB = Number(b.elements[spiritElement] || 0);

    if (levelA !== levelB) {
      return levelA - levelB;
    }

    const totalA = Object.values(a.elements).reduce((x, y) => x + Number(y), 0);

    const totalB = Object.values(b.elements).reduce((x, y) => x + Number(y), 0);

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

    const primaryColor = elementColors[info.primary];

    const secondaryColor = info.secondary
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
    <button
        onclick="
            event.stopPropagation();
            openSpiritWhisperSpellCalculator('${spell.id}')
        "
    >
        Calculate
    </button>
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
  const row = document.getElementById("spirit-details-" + id);

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
function renderSpellCalculator(spell, magicSystem = "arcane") {
  // --------------------------------------------------------
  // Find calculator container
  // --------------------------------------------------------

  let container = document.getElementById("spellCalculator");

  // --------------------------------------------------------
  // If the container does not exist, create it.
  // --------------------------------------------------------

  if (!container) {
    container = document.createElement("div");

    container.id = "spellCalculator";

    // Put it at the end of the body

    document.body.appendChild(container);
  }

  // --------------------------------------------------------
  // Create calculator
  // --------------------------------------------------------
  const spellInfo = getSpellElements(spell);
  const primaryColor = elementColors[spellInfo.primary] || elementColors.none;

  container.innerHTML = `

    <div class="spell-calculator"
         style="--spell-color: ${primaryColor};">

        <div class="spell-calculator-header">
            <h3 >${spell.name}</h3>
        </div>

        <table class="spellCalculatorTable">

            <!-- SPELL INFORMATION -->
            <tr class="section-header">
                <th colspan="2">
                    Spell Information
                </th>
            </tr>

<tr>
    <td colspan="2" id="calculatorElements" class="magic-circle-cell"></td>
</tr>

            <tr>
                <td>Effect</td>
                <td>${spell.effect || "None"}</td>
            </tr>

            <tr>
                <td>Effect Range</td>
                <td id="spellCalcEffectRange"></td>
            </tr>

            <tr>
                <td>Range</td>
                <td id="spellCalcRange"></td>
            </tr>

            <tr>
                <td>Canalization</td>
                <td>${spell.Canalization || "N"}</td>
            </tr>


            <!-- INPUTS -->
            <tr class="section-header">
                <th colspan="2">
                    Inputs
                </th>
            </tr>

            <tr>
                <td>Key</td>
               <td>
    <input
        id="spellCalcKey"
        type="number"
        value="0"
        min="0"
        max="3"
        step="1"
    >
</td>
            </tr>

            <tr>
                <td>Cast Time</td>
                <td>
                    <input
                        id="spellCalcCastTime"
                        type="number"
                        value="1"
                        step="1"
                    >
                </td>
            </tr>

            <tr>
                <td>Speed</td>
                <td>
                    <input
                        id="spellCalcSpeed"
                        type="number"
                        value="1"
                        step="0.5"
                    >
                </td>
            </tr>

            <tr>
                <td>Size</td>
                <td>
                    <input
                        id="spellCalcSize"
                        type="number"
                        value="1"
                        step="0.5"
                    >
                </td>
            </tr>


            <!-- RESULTS -->
            <tr class="section-header">
                <th colspan="2">
                    Results
                </th>
            </tr>

            <tr>
                <td>Cost</td>
                <td id="spellCalcCost"></td>
            </tr>

           
            <tr>
                <td>Damage</td>
                <td id="spellCalcDamage"></td>
            </tr>

            <tr>
                <td>Duration</td>
                <td id="spellCalcDuration"></td>
            </tr>

          

        </table>

    </div>
`;

  // --------------------------------------------------------
  // Fill spell information
  // --------------------------------------------------------
/* 
  document.getElementById("calculatorCircle").textContent =
    getSpellCircleLevel(spell); */
document.getElementById("calculatorElements").innerHTML =
    formatMagicCircle(
        spell,
        Number(document.getElementById("spellCalcKey")?.value) || 0
    );
  //formatElementsIcons(spell.elements);

  // --------------------------------------------------------
  // Update calculator whenever an input changes
  // --------------------------------------------------------

  const inputs = container.querySelectorAll("input");

  inputs.forEach((input) => {
    input.addEventListener("input", () => {
      updateSpellCalculator(spell, magicSystem);

      if (input.id === "spellCalcKey") {
        updateMagicCircle(spell);
      }
    });
  });

  // --------------------------------------------------------
  // Initial calculation
  // --------------------------------------------------------

  updateSpellCalculator(spell, magicSystem);
  updateMagicCircle(spell);
}
function openSpellCalculator(spellId) {
  const spell = spells.find((spell) => spell.id === spellId);

  if (!spell) {
    console.error("Spell not found:", spellId);

    return;
  }

  renderSpellCalculator(spell);
}
function openSpiritWhisperSpellCalculator(spellId) {
  const spell = spells.find((spell) => spell.id === spellId);

  if (!spell) {
    console.error("Spell not found:", spellId);

    return;
  }

  renderSpellCalculator(spell, "spiritWhisper");
}
function formatSpellElements(spell) {
  return Object.entries(spell.elements || {})
    .filter(([element, amount]) => Number(amount) > 0)
    .map(([element, amount]) => `${element} ${amount}`)
    .join(", ");
}

function updateSpellCalculator(spell, magicSystem = "arcane") {
  const result = calculateSpell(
    spell,
    {
      key: document.getElementById("spellCalcKey").value,

      castTime: document.getElementById("spellCalcCastTime").value,

      speed: document.getElementById("spellCalcSpeed").value,

      size: document.getElementById("spellCalcSize").value,
    },
    magicSystem,
  );

  // --------------------------------------------------------
  // Cost
  // --------------------------------------------------------

  document.getElementById("spellCalcCost").textContent = result.cost;

  // --------------------------------------------------------
  // Range
  // --------------------------------------------------------

  document.getElementById("spellCalcRange").textContent = result.range;

  // --------------------------------------------------------
  // Effect range
  // --------------------------------------------------------

  document.getElementById("spellCalcEffectRange").textContent =
    result.effectRange;
  // --------------------------------------------------------
  // Prime damage
  // --------------------------------------------------------

/*   document.getElementById("spellCalcPrimeDamage").textContent =
    result.damagePrime;
 */
  // --------------------------------------------------------
  // Damage
  // --------------------------------------------------------

  document.getElementById("spellCalcDamage").textContent =
    `${result.dice} + ${result.damage}`;

  // --------------------------------------------------------
  // Dice
  // --------------------------------------------------------
/* 
  document.getElementById("spellCalcDice").textContent = result.dice; */

  // --------------------------------------------------------
  // Prime duration
  // --------------------------------------------------------
/* 
  document.getElementById("spellCalcPrimeDuration").textContent =
    result.primeDuration; */

  // --------------------------------------------------------
  // Duration
  // --------------------------------------------------------

  if (result.duration > 0) {
    document.getElementById("spellCalcDuration").textContent =
      `${result.duration} turns ` +
      `(${result.durationSeconds} sec / ` +
      `${result.durationMinutes.toFixed(2)} min / ` +
      `${result.durationHours.toFixed(2)} hrs)`;
  } else {
    document.getElementById("spellCalcDuration").textContent =
      "Instant / Concentration";
  }

  // --------------------------------------------------------
  // Elemental power
  // --------------------------------------------------------

  
}
function even(value) {
  value = Math.ceil(Number(value));

  if (!Number.isFinite(value)) {
    return 0;
  }

  return value % 2 === 0 ? value : value + 1;
}

function getCharacterArcaneElements() {
  const result = {
    primaryElement: null,
    primaryElementLevel: 1,
    secondaryElement: null,
    secondaryElementLevel: 1,
  };

  if (!character?.arcane) {
    return result;
  }

  if (character.arcane.primary) {
    result.primaryElement = String(
      character.arcane.primary.element || "",
    ).toLowerCase();

    result.primaryElementLevel = Number(character.arcane.primary.level) || 1;
  }

  if (character.arcane.secondary) {
    result.secondaryElement = String(
      character.arcane.secondary.element || "",
    ).toLowerCase();

    result.secondaryElementLevel =
      Number(character.arcane.secondary.level) || 1;
  }

  return result;
}

function getSpellElementCount(spell, element) {
  if (!element) {
    return 0;
  }

  return Number(spell.elements?.[element] || 0);
}

function getCircleLevel(spell) {
  return Object.values(spell.elements || {}).reduce(
    (total, value) => total + (Number(value) || 0),
    0,
  );
}

function getSpellEffectType(spell) {
  const categories = Array.isArray(spell.category)
    ? spell.category.map((value) => String(value).toLowerCase())
    : [];

  const effect = String(spell.effect || "").toLowerCase();

  const effectRange = String(spell.EffectRange || "").toLowerCase();

  if (categories.includes("heal") || effect === "heal") {
    return "heal";
  }

  if (categories.includes("shild") || effect === "shild") {
    return "shild";
  }

  if (
    categories.includes("summon") ||
    effect === "inv" ||
    effect === "summon"
  ) {
    return "inv";
  }

  if (categories.includes("effect") || effect === "ef" || effect === "eff") {
    return "ef";
  }

  if (effectRange === Number.isFinite(Number(effectRange))) {
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

  const calculatedValue = baseValue * size;

  return unit ? `${calculatedValue} ${unit}` : calculatedValue;
}

function calculateSpell(spell, inputs, magicSystem = "arcane") {
  const key = Number(inputs.key) +1 ;

  const castTime = Number(inputs.castTime) || 1;

  const speed = Number(inputs.speed) || 1;

  const size = Number(inputs.size) || 1;

  const calculatedRange = scaleRange(spell.Range, size);

  const calculatedEffectRange = scaleRange(spell.EffectRange, size);
  const circleLevel = getCircleLevel(spell);

  let primaryElement = null;
  let secondaryElement = null;

  let primaryElementCount = 0;
  let secondaryElementCount = 0;

  let primaryElementLevel = 1;
  let secondaryElementLevel = 1;

  let otherElementCount = 0;

  // ============================================================
  // ARCANE
  // ============================================================

  if (magicSystem === "arcane") {
    const characterElements = getCharacterArcaneElements();

    primaryElement = characterElements.primaryElement;

    secondaryElement = characterElements.secondaryElement;

    primaryElementCount = getSpellElementCount(spell, primaryElement);

    secondaryElementCount = getSpellElementCount(spell, secondaryElement);

    primaryElementLevel =
      primaryElementCount > 0 ? characterElements.primaryElementLevel : 1;

    secondaryElementLevel =
      secondaryElementCount > 0 ? characterElements.secondaryElementLevel : 1;

    otherElementCount =
      circleLevel - primaryElementCount - secondaryElementCount;
  }

  // ============================================================
  // SPIRIT WHISPER
  // ============================================================
  else if (magicSystem === "spiritWhisper") {
    const spiritElement = document.getElementById("spiritWhisperElement").value;

    const spiritLevel =
      Number(document.getElementById("spiritWhisperLevel").value) || 1;

    primaryElement = spiritElement;

    primaryElementCount = getSpellElementCount(spell, spiritElement);

    primaryElementLevel = spiritLevel;

    // Everything except the Spirit Whisper's
    // element uses half its level.

    const otherElementLevel = spiritLevel / 2;

    otherElementCount = 0;

    for (const [element, value] of Object.entries(spell.elements || {})) {
      const amount = Number(value) || 0;

      if (amount <= 0) {
        continue;
      }

      if (element === spiritElement) {
        continue;
      }

      otherElementCount += amount;
    }
  }

  const costMultiplier = Number(spell.costMultiplier) || 1;

  const canalization = String(spell.Canalization || "").toLowerCase();

  const isCanalized = canalization === "c";

  const rawCost =
    circleLevel *
    key *
    castTime *
    Math.pow(speed, 1.5) *
    size *
    costMultiplier *
    (isCanalized ? 0.1 : 1);

  const cost = Math.ceil(rawCost);

  const variableTime = Number(spell.castingTime) || 0;

  const durationPrime = Math.floor((castTime * variableTime) / 3);

  let elementPower = 0;

  if (magicSystem === "arcane") {
    elementPower =
      primaryElementCount * primaryElementLevel +
      secondaryElementCount * secondaryElementLevel +
      otherElementCount;
  } else if (magicSystem === "spiritWhisper") {
    const spiritLevel =
      Number(document.getElementById("spiritWhisperLevel").value) || 1;

    const otherElementLevel = spiritLevel / 2;

    elementPower = primaryElementCount * spiritLevel;

    for (const [element, value] of Object.entries(spell.elements || {})) {
      if (element === primaryElement) {
        continue;
      }

      const amount = Number(value) || 0;

      elementPower += amount * otherElementLevel;
    }
  }

  const baseDamage =
    elementPower * ((castTime / 1.5) * speed * Math.min(size, 1));

  const effectType = getSpellEffectType(spell);

  let damagePrime;

  if (effectType === "dmg") {
    damagePrime = baseDamage;
  } else if (effectType === "shild") {
    damagePrime = baseDamage;
  } else if (effectType === "heal") {
    damagePrime = baseDamage / durationPrime;
  } else if (effectType === "aoe") {
    damagePrime = baseDamage / 3;
  } else if (effectType === "inv") {
    damagePrime = baseDamage;
  } else if (effectType === "ef") {
    damagePrime = baseDamage / (durationPrime / 10);
  } else {
    damagePrime = 0;
  }

  if (!Number.isFinite(damagePrime) || Number.isNaN(damagePrime)) {
    damagePrime = 0;
  }

  const damage = Math.floor(damagePrime / 3);

  let diceValue = 0;

  if (damagePrime !== 0) {
    diceValue = even((damagePrime + 4) / 1.5);
  }

  let diceCount;

  if (diceValue < 20) {
    if (diceValue > 12 && diceValue < 20) {
      diceCount = 2;
    } else {
      diceCount = 1;
    }
  } else {
    diceCount = Math.round(diceValue / 20);
  }

  let diceSize;

  if (diceValue < 20) {
    if (diceValue > 12 && diceValue < 20) {
      diceSize = even(diceValue / 2);
    } else {
      diceSize = diceValue;
    }
  } else {
    diceSize = 20;
  }

  let duration = 0;

  if (!isCanalized) {
    let durationValue = durationPrime * (damagePrime < 1 ? damagePrime : 1);

    if (!Number.isFinite(durationValue) || Number.isNaN(durationValue)) {
      durationValue = 0;
    }

    duration = Math.round(durationValue);
  }

  const durationSeconds = duration * 8;

  const durationMinutes = durationSeconds / 60;

  const durationHours = durationMinutes / 60;

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

    dice: damagePrime !== 0 ? `${diceCount}d${diceSize}` : "0",

    durationPrime,
    duration,
    durationSeconds,
    durationMinutes,
    durationHours,

    canalization: isCanalized,
  };
}

function getSpellCircleLevel(spell) {
  return getCircleLevel(spell);
}
function getMagicCircleCenterImages(spell, key = 0) {

    const circles = Array.isArray(spell.circle)
        ? spell.circle
        : [spell.circle];

    const images = [];

    const circleTypes = circles.map(circle =>
        String(circle || "").toLowerCase().trim()
    );

   


    // ==========================================
    // INVOCATION
    // ==========================================

    if (
        circleTypes.some(circle =>
            circle.includes("invocation")
        )
    ) {
        images.push({
            src: "Icons/invocation.png",
            size: 300,
            type: "invocation"
        });
    }


    // ==========================================
    // EFFECT
    // ==========================================

    if (
        circleTypes.some(circle =>
            circle.includes("effect")
        )
    ) {
        images.push({
            src: "Icons/effect.png",
            size: 200,
            type: "effect"
        });
    }


    // ==========================================
    // PROJECTILE
    // ==========================================

    const isProjectile = circleTypes.some(circle =>
        circle.includes("proyectill") ||
        circle.includes("projectile")
    );

    console.log("Is projectile:", isProjectile);


    if (isProjectile) {

        const projectileKey = Number(key) || 0;

        console.log(
            "Projectile key:",
            projectileKey
        );

        if (projectileKey >= 1 && projectileKey <= 3) {

            const imagePath =
                `Icons/key${projectileKey}.png`;

            console.log(
                "ADDING KEY IMAGE:",
                imagePath
            );

            images.push({
                src: imagePath,
                size: 40,
                type: "projectile"
            });
        }
    }


    console.log(
        "CENTER IMAGES RESULT:",
        images
    );

    return images;
}
function formatMagicCircle(spell, key = 0) {
  const elements = spell.elements || {};
   const circleColor = getAverageElementColor(spell.elements);

  const icons = {
    arcane: "Icons/arcane.png",
    lux: "Icons/lux.png",
    natura: "Icons/natura.png",
    gelum: "Icons/gelum.png",
    umbra: "Icons/umbra.png",
    ignis: "Icons/ignis.png",
  };

  // ==========================================
  // CREATE ELEMENT SYMBOLS
  // ==========================================

  const symbols = [];

  for (const [element, value] of Object.entries(elements)) {
    const amount = Number(value) || 0;

    for (let i = 0; i < amount; i++) {
      if (!icons[element]) continue;

      symbols.push({
        element,
        icon: icons[element],
      });
    }
  }

  const count = symbols.length;

  if (count === 0) {
    return "";
  }

  // ==========================================
  // CIRCLE SIZE
  // ==========================================

  const size = 300;
  const center = size / 2;

  // ==========================================
  // RADII
  // ==========================================

  // Where the element symbols are placed
  const elementRadius = 135;
const innerCircleRadius = 120;

  // ==========================================
  // CIRCLE TYPE
  // ==========================================

  let circleType = `${count}`;

  if (count === 3) {
    circleType = "triangle";
  } else if (count === 4) {
    circleType = "cross";
  } else if (count === 5) {
    circleType = "pentagram";
  } else if (count === 6) {
    circleType = "hexagram";
  }

  // ==========================================
  // CENTER IMAGE
  // ==========================================
const centerImages = getMagicCircleCenterImages(spell, Number(key) || 0);

  // ==========================================
  // START HTML
  // ==========================================

  let result = `

    <div
        class="magic-circle"
        style="
            width:${size}px;
            height:${size}px;
            --circle-color:${circleColor};
        "
    >

        <div class="magic-circle-outer"></div>

        <div
    class="magic-circle-inner ${count === 1 ? "magic-circle-single-inner" : ""}"
    style="
        left:${center}px;
        top:${center}px;
        width:${innerCircleRadius * 2}px;
        height:${innerCircleRadius * 2}px;
    "
></div>

        <svg
            class="magic-circle-polygon"
            viewBox="0 0 ${size} ${size}"
        >

            ${getMagicCircleLines(count, center, innerCircleRadius)}

        </svg>
`;

  // ==========================================
  // CENTER IMAGE
  // ==========================================

 // ==========================================
// CENTER IMAGES
// ==========================================

centerImages.forEach((image, index) => {

    result += `

    <div
        class="magic-circle-center magic-circle-center-${index}"
        style="
            width:${image.size}px;
            height:${image.size}px;
            left:${center}px;
            top:${center}px;
            position:absolute;
            transform:translate(-50%, -50%);
            z-index:${10 + index};

            background-color:var(--circle-color);

            -webkit-mask-image:url('${image.src}');
            mask-image:url('${image.src}');

            -webkit-mask-repeat:no-repeat;
            mask-repeat:no-repeat;

            -webkit-mask-position:center;
            mask-position:center;

            -webkit-mask-size:contain;
            mask-size:contain;
        "
    ></div>

`;
});

  // ==========================================
  // ELEMENT SYMBOLS
  // ==========================================

  const angleStep = 360 / count;

 symbols.forEach((symbol, index) => {
    let x;
    let y;
    let rotation = 0;

    // ======================================
    // ONE ELEMENT
    // ======================================

    if (count === 1) {
        x = center;
        y = center;

        // Keep the single symbol upright
        rotation = 0;
    }

    // ======================================
    // MULTIPLE ELEMENTS
    // ======================================
    else {
        const angle = angleStep * index - 90;

        const radians = (angle * Math.PI) / 180;

        x = center + Math.cos(radians) * elementRadius;
        y = center + Math.sin(radians) * elementRadius;

        // Rotate the symbol so its bottom points
        // toward the center of the magic circle.
        rotation = angle + 90;
    }

    result += `

        <img
            src="${symbol.icon}"
            title="${symbol.element}"
            class="
                magic-circle-symbol
                ${count === 1 ? "magic-circle-single-symbol" : ""}
            "
            style="
                left:${x}px;
                top:${y}px;
                transform:translate(-50%, -50%) rotate(${rotation}deg);
            "
        >

    `;
});

  // ==========================================
  // CLOSE
  // ==========================================

  result += `

        </div>

    `;

  return result;
}

function getMagicCircleLines(count, center, radius) {
  if (count < 2) {
    return "";
  }

  const points = [];

  const angleStep = 360 / count;

  // ==========================================
  // CREATE POINTS
  // ==========================================

  for (let i = 0; i < count; i++) {
    const angle = angleStep * i - 90;

    const radians = (angle * Math.PI) / 180;

    points.push({
      x: center + Math.cos(radians) * radius,

      y: center + Math.sin(radians) * radius,
    });
  }

  const lines = [];

  // ==========================================
  // 2 ELEMENTS
  // ==========================================

  if (count === 2) {
    const a = points[0];
    const b = points[1];

    lines.push(`
            <line
                x1="${a.x}"
                y1="${a.y}"
                x2="${b.x}"
                y2="${b.y}"
            />
        `);
  }

  // ==========================================
  // 3 ELEMENTS
  // TRIANGLE
  // ==========================================
  else if (count === 3) {
    for (let i = 0; i < 3; i++) {
      const a = points[i];

      const b = points[(i + 1) % 3];

      lines.push(`
                <line
                    x1="${a.x}"
                    y1="${a.y}"
                    x2="${b.x}"
                    y2="${b.y}"
                />
            `);
    }
  }

  // ------------------------------------------
  // 4 = TWO TRIANGLES TOUCHING AT TIPS
  // ------------------------------------------
  // ------------------------------------------
  // 4 = TWO TRIANGLES TOUCHING AT THEIR TIPS
  // ------------------------------------------
  else if (count === 4) {
    // Four element positions:
    //
    //       0          1
    //
    //
    //       3          2
    //
    // The two triangles meet at the CENTER.

    const topLeft = points[0];
    const topRight = points[1];
    const bottomRight = points[2];
    const bottomLeft = points[3];

    // --------------------------------------
    // LEFT TRIANGLE
    // --------------------------------------
    // Base: topLeft -> bottomLeft
    // Sides: topLeft -> center
    //        bottomLeft -> center

    lines.push(`
        <line
            x1="${topLeft.x}"
            y1="${topLeft.y}"
            x2="${bottomLeft.x}"
            y2="${bottomLeft.y}"
        />
    `);

    lines.push(`
        <line
            x1="${topLeft.x}"
            y1="${topLeft.y}"
            x2="${center}"
            y2="${center}"
        />
    `);

    lines.push(`
        <line
            x1="${bottomLeft.x}"
            y1="${bottomLeft.y}"
            x2="${center}"
            y2="${center}"
        />
    `);

    // --------------------------------------
    // RIGHT TRIANGLE
    // --------------------------------------
    // Base: topRight -> bottomRight
    // Sides: topRight -> center
    //        bottomRight -> center

    lines.push(`
        <line
            x1="${topRight.x}"
            y1="${topRight.y}"
            x2="${bottomRight.x}"
            y2="${bottomRight.y}"
        />
    `);

    lines.push(`
        <line
            x1="${topRight.x}"
            y1="${topRight.y}"
            x2="${center}"
            y2="${center}"
        />
    `);

    lines.push(`
        <line
            x1="${bottomRight.x}"
            y1="${bottomRight.y}"
            x2="${center}"
            y2="${center}"
        />
    `);
  }
  // ==========================================
  // 5 ELEMENTS
  // PENTAGRAM
  // ==========================================
  else if (count === 5) {
    for (let i = 0; i < 5; i++) {
      const a = points[i];

      const b = points[(i + 2) % 5];

      lines.push(`
                <line
                    x1="${a.x}"
                    y1="${a.y}"
                    x2="${b.x}"
                    y2="${b.y}"
                />
            `);
    }
  }

  // ==========================================
  // 6 ELEMENTS
  // HEXAGRAM
  // ==========================================
  else if (count === 6) {
    // First triangle
    for (let i = 0; i < 3; i++) {
      const a = points[i * 2];

      const b = points[((i + 1) % 3) * 2];

      lines.push(`
                <line
                    x1="${a.x}"
                    y1="${a.y}"
                    x2="${b.x}"
                    y2="${b.y}"
                />
            `);
    }

    // Second triangle
    for (let i = 0; i < 3; i++) {
      const a = points[i * 2 + 1];

      const b = points[((i + 1) % 3) * 2 + 1];

      lines.push(`
                <line
                    x1="${a.x}"
                    y1="${a.y}"
                    x2="${b.x}"
                    y2="${b.y}"
                />
            `);
    }
  }

  // ==========================================
  // 7+ ELEMENTS
  // ==========================================
  else {
    const step = Math.floor(count / 2);

    for (let i = 0; i < count; i++) {
      const a = points[i];

      const b = points[(i + step) % count];

      lines.push(`
                <line
                    x1="${a.x}"
                    y1="${a.y}"
                    x2="${b.x}"
                    y2="${b.y}"
                />
            `);
    }
  }

  return lines.join("");
}
function updateMagicCircle(spell) {
    const container = document.getElementById("calculatorElements");

    if (!container) return;

    const keyInput = document.getElementById("spellCalcKey");

    const key = Number(keyInput?.value) || 0;

  
    container.innerHTML = formatMagicCircle(spell, key);
}