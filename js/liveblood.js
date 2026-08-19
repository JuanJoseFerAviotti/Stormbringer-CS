let livebloodData = [];
let livebloodOvercharges = {};

if (!character.liveblood) {
  character.liveblood = {
    abilities: {},
  };
}

if (!character.liveblood.abilities) {
  character.liveblood.abilities = {};
}

fetch("js/liveblood.json")
  .then((response) => response.json())
  .then((data) => {
    livebloodData = data;

    console.log("LiveBlood loaded:", livebloodData.length);

    updateLiveBloodTable();
  })
  .catch((error) => {
    console.error("Error loading LiveBlood:", error);
  });

document.getElementById("livebloodLevel").textContent =
  getLiveBloodRemainingPoints();
function updateLiveBloodTable() {
  const table = document.getElementById("livebloodTableBody");

  if (!table) return;

  table.innerHTML = "";

  const totalPoints = getLiveBloodPoints();
  const spentPoints = getLiveBloodSpentPoints();
  const remainingPoints = totalPoints - spentPoints;

  document.getElementById("livebloodLevel").textContent =
    remainingPoints;

  livebloodData.forEach((power) => {
    const talentRank = character.talents?.[power.talent] || 0;

    if (talentRank <= 0) return;

    const abilityLevel =
  Number(character.liveblood?.abilities?.[power.id]) || 0;

const canOvercharge = power.overcharge !== false;

const overchargeMultiplier =
  livebloodOvercharges[power.id] || 1;

const maxLevel =
  abilityLevel + remainingPoints;

const row = document.createElement("tr");

const cost = calculateLiveBloodFormula(
  power.costFormula,
  power,
  abilityLevel,
  overchargeMultiplier,
);

const effect = calculateLiveBloodFormula(
  power.effectFormula,
  power,
  abilityLevel,
  overchargeMultiplier,
);

    row.innerHTML = `
      <td>
        ${power.name}
      </td>

      <td>
        <select
          onchange="setLiveBloodAbilityLevel(
            '${power.id}',
            this.value,
            ${maxLevel}
          )"
        >
          ${Array.from(
            { length: maxLevel + 1 },
            (_, level) => `
              <option
                value="${level}"
                ${level === abilityLevel ? "selected" : ""}
              >
                ${level}
              </option>
            `,
          ).join("")}
        </select>
      </td>

     <td>
  ${
    canOvercharge
      ? `
        <input
          type="number"
          min="1"
          value="${overchargeMultiplier}"
          onchange="updateLiveBloodOvercharge(
            '${power.id}',
            this.value
          )"
        >
      `
      : "-"
  }
</td>

      <td>
        ${cost}
      </td>

      <td>
        ${effect}
        ${power.effectDescription ?? ""}
      </td>
    `;

    table.appendChild(row);
  });
}

function getLiveBloodPoints() {
  if (!character.liveblood?.enabled) return 0;

  const talentLevel = character.talents?.["liveblood_level"] || 0;

  const points = Math.max(Math.floor(character.level / 2), 1) + talentLevel;

  console.log(
    "LiveBlood points:",
    points,
    "Talent level:",
    talentLevel,
    "Character level:",
    character.level,
  );

  return points;
}
function getLiveBloodSpentPoints() {
  let spent = 0;

  const abilities = character.liveblood?.abilities || {};

  for (const id in abilities) {
    spent += Number(abilities[id]) || 0;
  }

  return spent;
}
function getLiveBloodRemainingPoints() {
  return getLiveBloodPoints() - getLiveBloodSpentPoints();
}
function upgradeLiveBloodPower(id) {
  const power = livebloodData.find((p) => p.id === id);

  if (!power) return;

  // Must own the corresponding talent
  const talentRank = character.talents?.[power.talent] || 0;

  if (talentRank <= 0) return;

  const currentLevel = character.liveblood.abilities?.[id] || 0;

  // Don't allow spending more points than available
  if (getLiveBloodRemainingPoints() <= 0) {
    return;
  }

  character.liveblood.abilities[id] = currentLevel + 1;

  saveCharacter();

  updateLiveBloodTable();
}
function calculateLiveBloodFormula(
  formula,
  power,
  abilityLevel,
  overchargeMultiplier = 1,
) {
  if (!formula) return power.effect ?? 0;

  let values = [];

  formula.values.forEach((value) => {
    switch (value) {
      case "level":
        values.push(abilityLevel);
        break;

      case "baseCost":
        values.push(Number(power.baseCost) || 0);
        break;

     case "overcharge":
  values.push(overchargeMultiplier);
  break;

      case "constitutionModifier": {
        const stats = Rules.getFinalStats(character);

        values.push(
          Rules.getModifier(stats.constitution)
        );

        break;
      }

      default:
        values.push(Number(value) || 0);
        break;
    }
  });

  if (formula.operation === "multiply") {
    return values.reduce(
      (total, value) => total * value,
      1
    );
  }

  return 0;
}
function setLiveBloodAbilityLevel(id, newLevel, maxLevel) {
  newLevel = Number(newLevel);

  const currentLevel = Number(character.liveblood?.abilities?.[id]) || 0;

  const totalPoints = getLiveBloodPoints();

  const spentWithoutThis = getLiveBloodSpentPoints() - currentLevel;

  const newSpent = spentWithoutThis + newLevel;

  if (newSpent > totalPoints) {
    updateLiveBloodTable();
    return;
  }

  if (!character.liveblood) {
    character.liveblood = {
      enabled: false,
      abilities: {},
    };
  }

  if (!character.liveblood.abilities) {
    character.liveblood.abilities = {};
  }

  // SAVE THE NEW LEVEL
  character.liveblood.abilities[id] = newLevel;

  console.log(
    "Changing ability:",
    id,
    "from:",
    currentLevel,
    "to:",
    character.liveblood.abilities[id],
  );

  saveCharacter();

  // Force the table to rebuild AFTER the new level exists
  updateLiveBloodTable();
}function updateLiveBloodOvercharge(id, value) {
  const multiplier = Number(value);

  if (!Number.isFinite(multiplier) || multiplier < 1) {
    livebloodOvercharges[id] = 1;
  } else {
    livebloodOvercharges[id] = multiplier;
  }

  updateLiveBloodTable();
}
/* function setLiveBloodAbilityLevel(id, newLevel, maxLevel) {

  newLevel = Number(newLevel);

  if (newLevel < 0) newLevel = 0;
  if (newLevel > maxLevel) newLevel = maxLevel;

  const currentLevel =
    character.liveblood?.abilities?.[id] || 0;

  const totalPoints = getLiveBloodPoints();

  const spentWithoutThis =
    getLiveBloodSpentPoints() - currentLevel;

  const newSpent =
    spentWithoutThis + newLevel;

  // Not enough points
  if (newSpent > totalPoints) {
    updateLiveBloodTable();
    return;
  }

  // Make sure LiveBlood exists
  if (!character.liveblood) {
    character.liveblood = {
      enabled: false,
      abilities: {},
    };
  }

  if (!character.liveblood.abilities) {
    character.liveblood.abilities = {};
  }

  // Save the new level
  if (newLevel === 0) {
    delete character.liveblood.abilities[id];
  } else {
    character.liveblood.abilities[id] = newLevel;
  }

  // Save character AFTER changing the ability
  saveCharacter();

  // Rebuild table AFTER saving the new level
  updateLiveBloodTable();
} */
