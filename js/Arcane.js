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
/* function updateSpiritWhisperSpellList() {

  const table =
    document.getElementById("spiritWhisperSpellList");

  if (!table) return;

  table.innerHTML = "";

  const spiritElement =
    document.getElementById("spiritWhisperElement").value;

  const spiritLevel =
    Number(document.getElementById("spiritWhisperLevel").value);

  const otherElementLimit = spiritLevel / 2;


  spells
   .filter((spell) => {

  if (!spell.elements) return false;

  const spiritElement =
    document.getElementById("spiritWhisperElement").value;

  const spiritLevel =
    Number(document.getElementById("spiritWhisperLevel").value);


  // Get all elements actually used by the spell
  const activeElements = Object.entries(spell.elements)
    .filter(([element, level]) => Number(level) > 0);


  if (activeElements.length === 0) return false;


  // -----------------------------------------
  // Find the spell's PRIMARY element
  // -----------------------------------------

  let primaryElement = null;
  let primaryLevel = -1;

  for (const [element, value] of activeElements) {

    const level = Number(value);

    if (level > primaryLevel) {
      primaryLevel = level;
      primaryElement = element;
    }
  }


  // The Spirit Whisperer's element MUST
  // be the spell's primary element.
  if (primaryElement !== spiritElement) {
    return false;
  }


  // -----------------------------------------
  // Spirit element can be up to its full level
  // -----------------------------------------

  if (primaryLevel > spiritLevel) {
    return false;
  }


  // -----------------------------------------
  // Every OTHER element can only be HALF
  // of the spell's PRIMARY element level
  // -----------------------------------------

  const otherElementLimit = primaryLevel / 2;


  for (const [element, value] of activeElements) {

    if (element === spiritElement) continue;

    const level = Number(value);

    if (level > otherElementLimit) {
      return false;
    }
  }


  return true;
})

    .sort((a, b) => {

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
    })


    .forEach((spell) => {

      const info = getSpellElements(spell);

      const primaryColor =
        elementColors[info.primary];

      const secondaryColor =
        info.secondary
          ? elementColors[info.secondary]
          : "transparent";


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
} */
/* function updateSpiritWhisperSpellList() {

  const table =
    document.getElementById("spiritWhisperSpellList");

  if (!table) return;

  table.innerHTML = "";

  const spiritElement =
    document.getElementById("spiritWhisperElement").value;

  const spiritLevel =
    Number(document.getElementById("spiritWhisperLevel").value);


  const availableSpells = spells
    .filter((spell) => {

      if (!spell.elements) return false;

      const activeElements = Object.entries(spell.elements)
        .filter(([element, level]) => Number(level) > 0);

      if (activeElements.length === 0) return false;


      // Find primary element
      let primaryElement = null;
      let primaryLevel = -1;

      for (const [element, value] of activeElements) {

        const level = Number(value);

        if (level > primaryLevel) {
          primaryLevel = level;
          primaryElement = element;
        }
      }


      // Spirit element must be the primary element
      if (primaryElement !== spiritElement) {
        return false;
      }


      // Primary element cannot exceed Spirit level
      if (primaryLevel > spiritLevel) {
        return false;
      }


      // Other elements can only be half
      // of the spell's primary element
      const otherElementLimit = primaryLevel / 2;


      for (const [element, value] of activeElements) {

        if (element === spiritElement) continue;

        if (Number(value) > otherElementLimit) {
          return false;
        }
      }


      return true;
    })


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


      const order = {
        lux: 0,
        natura: 1,
        gelum: 2,
        ignis: 3,
        umbra: 4,
        arcane: 5
      };


      if (order[pa.element] !== order[pb.element]) {
        return order[pa.element] - order[pb.element];
      }


      if (pa.level !== pb.level) {
        return pa.level - pb.level;
      }


      const totalA =
        Object.values(a.elements)
          .reduce((x, y) => x + y, 0);

      const totalB =
        Object.values(b.elements)
          .reduce((x, y) => x + y, 0);


      if (totalA !== totalB) {
        return totalA - totalB;
      }


      return a.name.localeCompare(b.name);
    })


    .forEach((spell) => {

      const info = getSpellElements(spell);

      const primaryColor =
        elementColors[info.primary];

      const secondaryColor =
        info.secondary
          ? elementColors[info.secondary]
          : "transparent";


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
} */
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