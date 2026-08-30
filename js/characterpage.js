let character = JSON.parse(localStorage.getItem("currentCharacter"));

if (!character) {
  window.location.href = "index.html";
}
function saveCharacter() {
  localStorage.setItem("currentCharacter", JSON.stringify(character));
}

if (!character.skills) {
  character.skills = {};
}
if (!character.inventory) {
  character.inventory = [];
}
if (!character.equipped) {
  character.equipped = {
    weapon: null,
    armor: null,
    shield: null,
  };
}
if (!character.arcane) {
  character.arcane = {
    enabled: false,
  };
}
if (!character.spiritWhisper) {
  character.spiritWhisper = {
    enabled: false,
  };
}
if (!character.liveblood) {
  character.liveblood = {
    enabled: false,
  };
}
if (!character.demonBlood) {
  character.demonBlood = {
    enabled: false,
  };
}
if (!character.monsterHunter) {
  character.monsterHunter = {
    enabled: false,
  };
}
if (!character.pocketDimension) {
  character.pocketDimension = {
    enabled: false,
  };
}

function eightrest() {
  const stats = Rules.getFinalStats(character);

  character.health +=
    Rules.getModifier(stats.constitution) + 2 * character.level;
  character.mana = character.maxMana;
  character.stamina = character.maxStamina;
  // Don't heal above max HP
  if (character.health > character.maxHealth) {
    character.health = character.maxHealth;
  }

  if (character.mana > character.maxMana) {
    character.mana = character.maxMana;
  }

  saveCharacter();
  updateHeader();
}

function twentyfourrest() {
  eightrest();
  eightrest();
  updateHeader();
}
function reload() {
  loadCharacterToUI();
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
document.getElementById("characterName").value = character.name;
document.getElementById("level").textContent = character.level;

document.getElementById("health").value = character.health;
document.getElementById("maxHealth").textContent = character.maxHealth;

document.getElementById("mana").value = character.mana;
document.getElementById("maxMana").textContent = character.maxMana;

document.getElementById("manaRegen").textContent = character.manaRegen;

document.getElementById("stamina").value = character.stamina;
document.getElementById("maxStamina").textContent = character.maxStamina;

document.getElementById("armor").textContent = character.armor;
document
  .getElementById("characterLevel")
  .addEventListener("change", function () {
    let level = parseInt(this.value);

    if (isNaN(level) || level < 1) level = 1;

    character.level = level;

    recalculateDerivedStats();

    updateSkills();

    saveCharacter();
  });

const buttons = document.querySelectorAll(".tabButton");
document
  .getElementById("magicArcane")
  .addEventListener("change", updateMagicSystems);

document
  .getElementById("magicSpiritWhisper")
  .addEventListener("change", updateMagicSystems);

document
  .getElementById("magicliveblood")
  .addEventListener("change", updateMagicSystems);

document
  .getElementById("magicDemonBlood")
  .addEventListener("change", updateMagicSystems);

document
  .getElementById("magicMonsterHunter")
  .addEventListener("change", updateMagicSystems);

document
  .getElementById("magicPocketDimension")
  .addEventListener("change", updateMagicSystems);
document.querySelectorAll(".plus").forEach((button) => {
  button.addEventListener("click", () => {
    increaseStat(button.dataset.stat);
  });
});

document.querySelectorAll(".minus").forEach((button) => {
  button.addEventListener("click", () => {
    decreaseStat(button.dataset.stat);
  });
});

function getCost(currentStat) {
  if (currentStat < 15) return 2;

  return currentStat - 12;
}
function increaseStat(stat) {
  let invested = character.investedStats[stat];

  let current = 8 + invested;

  if (current >= 20) return;

  const cost = getCost(current);

  if (character.points < cost) return;

  if (getAvailablePoints() < cost) return;

  character.investedStats[stat]++;

  updateStats();
}
function decreaseStat(stat) {
  let invested = character.investedStats[stat];

  if (invested <= -8) return;

  let current = 8 + invested;

  const refund = getCost(current - 1);

  character.investedStats[stat]--;

  updateStats();
}

function formatModifier(mod) {
  return mod >= 0 ? "+" + mod : mod;
}

function updateStats() {
  document.getElementById("availablePoints").textContent = getAvailablePoints();

  const stats = Rules.getFinalStats(character);

  for (const stat in stats) {
    const score = stats[stat];

    const invested = character.investedStats[stat];

    document.getElementById(stat + "Value").textContent = score;

    document.getElementById(stat + "Invested").textContent = invested;

    document.getElementById(stat + "Mod").textContent = formatModifier(
      Rules.getModifier(score),
    );
  }

  recalculateDerivedStats();
  updateTalentTreeSelector();
  updateSkills();
}

function formatModifier(mod) {
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
function recalculateDerivedStats() {
  const stats = Rules.getFinalStats(character);
  character.maxHealth = Rules.getMaxHealth(stats, character.level);
  character.maxMana = Rules.getMaxMana(stats, character.level);
  character.maxStamina = Rules.getMaxStamina(stats, character.level);
  character.maxPoints = Rules.getMaxPoints(character.level);
  character.armor = Rules.getArmor(stats, character);
  updateHeader();
  saveCharacter();
}
//math
const BASE_STAT = 8;
function getStatScore(stat) {
  return 8 + character.investedStats[stat];
}
function getModifier(stat) {
  return Math.floor((stat - 10) / 2);
}

function getSpentPoints() {
  let spent = 0;

  for (const stat in character.investedStats) {
    spent += Rules.getStatCost(getStatScore(stat));
  }

  return spent;
}

function getAvailablePoints() {
  return Rules.getMaxPoints(character.level) - getSpentPoints();
}
function updateHeader() {
  document.getElementById("health").value = character.health;
  document.getElementById("maxHealth").textContent = character.maxHealth;

  document.getElementById("mana").value = character.mana;
  document.getElementById("maxMana").textContent = character.maxMana;

  document.getElementById("stamina").value = character.stamina;
  document.getElementById("armor").textContent = character.armor;
  document.getElementById("maxStamina").textContent = character.maxStamina;
  document.getElementById("availablePoints").textContent = getAvailablePoints();

  document.getElementById("maxPointsHeader").textContent = Rules.getMaxPoints(
    character.level,
  );
}
const finalStats = Rules.getFinalStats(character);

buttons.forEach((button) => {
  button.addEventListener("click", () => {
    document
      .querySelectorAll(".tabButton")
      .forEach((b) => b.classList.remove("active"));

    document
      .querySelectorAll(".tab")
      .forEach((t) => t.classList.remove("active"));

    button.classList.add("active");
console.log("TAB BUTTON:", button);
console.log("DATA TAB:", button.dataset.tab);
console.log(
  "TAB ELEMENT:",
  document.getElementById(button.dataset.tab)
);
    document.getElementById(button.dataset.tab).classList.add("active");

    if (button.dataset.tab === "talents") {
      loadTalentTree(currentTalentTree);
    }

    if (button.dataset.tab === "magic") {
      MagicSystems();
    }if (button.dataset.tab === "Actions") {
      updateActionsTable();
    }
  });
});
function loadCharacterToUI() {
  document.getElementById("characterLevel").value = character.level;

  updateStats();
  updateSkills();
  updateRaceInfo();
  updateHeader();
  
}
function getSpentTalentPoints() {
  let spent = 0;

  for (const id in character.talents) {
    spent += character.talents[id];
  }

  return spent;
}
const magicSystemSelect = document.getElementById("magicSystemSelect");

magicSystemSelect.addEventListener("change", function () {
  showMagicSystem(this.value);
});

function showMagicSystem(system) {
  document.querySelectorAll(".magicSystemContent").forEach((div) => {
    div.style.display = "none";
  });

  const panelIds = {
    arcane: "arcaneMagic",
    spiritWhisper: "spiritWhisperMagic",
    liveblood: "livebloodMagic",
    demonBlood: "demonBloodMagic",
    monsterHunter: "monsterHunterMagic",
    pocketDimension: "pocketDimensionMagic",
    ArtifactsMagic: "ArtifactsMagic",
  };

  const selected = document.getElementById(panelIds[system]);

  if (selected) {
    selected.style.display = "block";
  }
}
function updateMagicSystems() {
  character.arcane.enabled = document.getElementById("magicArcane").checked;

  character.spiritWhisper.enabled =
    document.getElementById("magicSpiritWhisper").checked;

  character.liveblood.enabled =
    document.getElementById("magicliveblood").checked;

  character.demonBlood.enabled =
    document.getElementById("magicDemonBlood").checked;

  character.monsterHunter.enabled =
    document.getElementById("magicMonsterHunter").checked;

  character.pocketDimension.enabled = document.getElementById(
    "magicPocketDimension",
  ).checked;

  saveCharacter();
updatelivebloodTable();
  updateMagicSystemSelector();
}

function updateMagicSystemSelector() {
  const select = document.getElementById("magicSystemSelect");

  if (!select) return;

  select.innerHTML = "";

  const systems = [
    {
      id: "arcane",
      name: "Arcane",
    },
    {
      id: "spiritWhisper",
      name: "Spirit Whisper",
    },
    {
      id: "liveblood",
      name: "Live Blood",
    },
    {
      id: "demonBlood",
      name: "Demon Blood",
    },
    {
      id: "monsterHunter",
      name: "Monster Hunter",
    },
    {
      id: "pocketDimension",
      name: "Pocket Dimension",
    },
  ];

  // =================================
  // Add available magic systems
  // =================================

  systems.forEach((system) => {
    if (!character[system.id]?.enabled) {
      return;
    }

    const option = document.createElement("option");

    option.value = system.id;
    option.textContent = system.name;

    select.appendChild(option);
  });

  // =================================
  // Magic Artifact
  // ALWAYS available
  // =================================

  const artifact = document.createElement("option");

  artifact.value = "ArtifactsMagic";
  artifact.textContent = "Magic Artifact";

  select.appendChild(artifact);

  // =================================
  // Select something
  // =================================

  if (select.options.length > 0) {
    // If there is magic, select the first
    // actual magic system.
    //
    // Otherwise select Magic Artifact.

    if (select.options.length > 1) {
      select.selectedIndex = 0;
    } else {
      select.value = "ArtifactsMagic";
    }

    showMagicSystem(select.value);
  }
}
function MagicSystems() {
  console.log("CHARACTER RACE:", character.race);
console.log("AVAILABLE RACES:", Object.keys(races));
console.log("FOUND RACE:", races[character.race]);
  const race = races[character.race];

  if (!race) {
    console.log("Magic systems: race not found", character.race);
    return;
  }

  const required = {
    spiritWhisper: 1,
    liveblood: 1,
    demonBlood: 1,

    arcane: 3,
    pocketDimension: 3,
    monsterHunter: 3,
  };

  const potential = {
    spiritWhisper: 0,
    liveblood: 0,
    demonBlood: 0,

    arcane: 0,
    pocketDimension: 0,
    monsterHunter: 0,
  };

  // ================================
  // Race magic
  // ================================

  const raceMagic = race.magic || {};

  for (const system in potential) {
    if (raceMagic[system]) {
      potential[system] += Number(raceMagic[system]);
    }
  }
  const gender = race.genders?.[character.gender];

  const genderMagic = gender?.magic || {};

  for (const system in potential) {
    if (genderMagic[system]) {
      potential[system] += Number(genderMagic[system]);
    }
  }

  // ================================
  // Talents
  // ================================

  potential.arcane += getTalentRank("magic_spark_arcane");

  // ================================
  // Update character systems
  // ================================

  character.spiritWhisper = character.spiritWhisper || {};

  character.liveblood = character.liveblood || {};

  character.demonBlood = character.demonBlood || {};

  character.arcane = character.arcane || {};

  character.pocketDimension = character.pocketDimension || {};

  character.monsterHunter = character.monsterHunter || {};

  for (const system in required) {
    character[system].enabled = potential[system] >= required[system];
  }

  console.log("Magic potential:", potential);

  console.log("Magic systems:", {
    spiritWhisper: character.spiritWhisper.enabled,
    liveblood: character.liveblood.enabled,
    demonBlood: character.demonBlood.enabled,
    arcane: character.arcane.enabled,
    pocketDimension: character.pocketDimension.enabled,
    monsterHunter: character.monsterHunter.enabled,
  });

  saveCharacter();

  updateMagicSystemSelector();
  console.log("MAGIC 12 - selector updated");
}
